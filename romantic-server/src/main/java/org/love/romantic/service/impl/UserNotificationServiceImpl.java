package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.entity.UserNotification;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.mapper.UserNotificationMapper;
import org.love.romantic.model.NotificationRealtimeEvent;
import org.love.romantic.model.UserNotificationResponse;
import org.love.romantic.service.NotificationRealtimePushService;
import org.love.romantic.service.UserNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserNotificationServiceImpl implements UserNotificationService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final UserNotificationMapper userNotificationMapper;
    private final CoupleProfileMapper coupleProfileMapper;
    private final ObjectMapper objectMapper;
    private final NotificationRealtimePushService notificationRealtimePushService;

    public UserNotificationServiceImpl(UserNotificationMapper userNotificationMapper,
                                       CoupleProfileMapper coupleProfileMapper,
                                       ObjectMapper objectMapper,
                                       NotificationRealtimePushService notificationRealtimePushService) {
        this.userNotificationMapper = userNotificationMapper;
        this.coupleProfileMapper = coupleProfileMapper;
        this.objectMapper = objectMapper;
        this.notificationRealtimePushService = notificationRealtimePushService;
    }

    @Override
    public List<UserNotificationResponse> listCurrentUserNotifications() {
        String username = AuthContext.getRequiredUsername();
        return listNotificationsByUsername(username);
    }

    @Override
    public long countCurrentUserUnreadNotifications() {
        String username = AuthContext.getRequiredUsername();
        return countUnreadByUsername(username);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markCurrentUserNotificationRead(Long id) {
        String username = AuthContext.getRequiredUsername();
        if (id == null) {
            throw new BusinessException("通知编号不能为空");
        }

        UserNotification notification = userNotificationMapper.selectById(id);
        if (notification == null || !username.equals(notification.getRecipientUsername())) {
            throw new BusinessException("通知不存在");
        }
        if (Boolean.TRUE.equals(notification.getIsRead())) {
            return;
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        userNotificationMapper.updateById(notification);
        pushRealtimeEvent(username, notification.getId(), "notification_read_state_changed");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAllCurrentUserNotificationsRead() {
        String username = AuthContext.getRequiredUsername();
        userNotificationMapper.update(null, new LambdaUpdateWrapper<UserNotification>()
                .eq(UserNotification::getRecipientUsername, username)
                .eq(UserNotification::getIsRead, false)
                .set(UserNotification::getIsRead, true)
                .set(UserNotification::getReadAt, LocalDateTime.now()));
        pushRealtimeEvent(username, 0L, "notification_read_state_changed");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void notifyPartners(String actorUsername,
                               String type,
                               String title,
                               String content,
                               String bizType,
                               Long bizId,
                               Map<String, Object> payload) {
        if (!StringUtils.hasText(actorUsername) || !StringUtils.hasText(type)
                || !StringUtils.hasText(title) || !StringUtils.hasText(content)) {
            return;
        }

        List<String> recipients = resolvePartnerUsernames(actorUsername);
        if (recipients.isEmpty()) {
            return;
        }

        String payloadJson = writePayloadJson(payload);
        LocalDateTime now = LocalDateTime.now();
        for (String recipient : recipients) {
            UserNotification notification = UserNotification.builder()
                    .recipientUsername(recipient)
                    .actorUsername(actorUsername)
                    .type(type.trim())
                    .title(title.trim())
                    .content(content.trim())
                    .bizType(StringUtils.hasText(bizType) ? bizType.trim() : "")
                    .bizId(bizId == null ? 0L : bizId)
                    .payloadJson(payloadJson)
                    .isRead(false)
                    .createdAt(now)
                    .build();
            userNotificationMapper.insert(notification);
            pushRealtimeEvent(recipient, notification.getId(), "notification_created");
        }

        log.info("创建站内通知成功，actor={}, type={}, recipientCount={}, bizType={}, bizId={}",
                actorUsername, type, recipients.size(), bizType, bizId);
    }

    private List<UserNotificationResponse> listNotificationsByUsername(String username) {
        Map<String, String> nicknameMap = buildNicknameMap();
        return userNotificationMapper.selectList(new LambdaQueryWrapper<UserNotification>()
                        .eq(UserNotification::getRecipientUsername, username)
                        .orderByDesc(UserNotification::getCreatedAt)
                        .orderByDesc(UserNotification::getId))
                .stream()
                .map(item -> toResponse(item, nicknameMap))
                .collect(Collectors.toList());
    }

    private long countUnreadByUsername(String username) {
        return userNotificationMapper.selectCount(new LambdaQueryWrapper<UserNotification>()
                .eq(UserNotification::getRecipientUsername, username)
                .eq(UserNotification::getIsRead, false));
    }

    private UserNotification findLatestNotification(String username) {
        return userNotificationMapper.selectOne(new LambdaQueryWrapper<UserNotification>()
                .eq(UserNotification::getRecipientUsername, username)
                .orderByDesc(UserNotification::getCreatedAt)
                .orderByDesc(UserNotification::getId)
                .last("LIMIT 1"));
    }

    private void pushRealtimeEvent(String username, Long notificationId, String eventType) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(eventType)) {
            return;
        }

        long unreadCount = countUnreadByUsername(username);
        UserNotification latestNotification = findLatestNotification(username);
        notificationRealtimePushService.pushToUsername(username, NotificationRealtimeEvent.builder()
                .eventType(eventType)
                .notificationId(notificationId == null ? 0L : notificationId)
                .unreadCount(unreadCount)
                .latestTitle(latestNotification == null ? "" : latestNotification.getTitle())
                .latestContent(latestNotification == null ? "" : latestNotification.getContent())
                .latestCreatedAt(formatDateTime(latestNotification == null ? null : latestNotification.getCreatedAt()))
                .bizType(latestNotification == null ? "" : latestNotification.getBizType())
                .bizId(latestNotification == null || latestNotification.getBizId() == null ? 0L : latestNotification.getBizId())
                .build());
    }

    private List<String> resolvePartnerUsernames(String actorUsername) {
        return coupleProfileMapper.selectList(new LambdaQueryWrapper<CoupleProfile>()
                        .orderByAsc(CoupleProfile::getId))
                .stream()
                .map(CoupleProfile::getUsername)
                .filter(StringUtils::hasText)
                .filter(username -> !username.equals(actorUsername))
                .distinct()
                .collect(Collectors.toList());
    }

    private Map<String, String> buildNicknameMap() {
        Map<String, String> result = new HashMap<>();
        for (CoupleProfile profile : coupleProfileMapper.selectList(null)) {
            result.put(profile.getUsername(), profile.getNickname());
        }
        return result;
    }

    private UserNotificationResponse toResponse(UserNotification item, Map<String, String> nicknameMap) {
        return UserNotificationResponse.builder()
                .id(item.getId())
                .type(item.getType())
                .title(item.getTitle())
                .content(item.getContent())
                .bizType(item.getBizType())
                .bizId(item.getBizId())
                .actorUsername(item.getActorUsername())
                .actorNickname(resolveNickname(item.getActorUsername(), nicknameMap))
                .payloadJson(item.getPayloadJson())
                .isRead(Boolean.TRUE.equals(item.getIsRead()))
                .createdAt(formatDateTime(item.getCreatedAt()))
                .readAt(formatDateTime(item.getReadAt()))
                .build();
    }

    private String resolveNickname(String username, Map<String, String> nicknameMap) {
        if (!StringUtils.hasText(username)) {
            return "";
        }
        return nicknameMap.getOrDefault(username, username);
    }

    private String writePayloadJson(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload == null ? new HashMap<>() : payload);
        } catch (Exception exception) {
            log.warn("通知扩展负载序列化失败，message={}", exception.getMessage());
            return "{}";
        }
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "" : value.format(DATE_TIME_FORMATTER);
    }
}
