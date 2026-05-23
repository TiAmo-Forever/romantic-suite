package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.entity.UserNotification;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.mapper.UserNotificationMapper;
import org.love.romantic.model.NotificationRealtimeEvent;
import org.love.romantic.model.UserNotificationPageResponse;
import org.love.romantic.model.UserNotificationResponse;
import org.love.romantic.model.UserNotificationUnreadResponse;
import org.love.romantic.service.NotificationRealtimePushService;
import org.love.romantic.service.UserNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserNotificationServiceImpl implements UserNotificationService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final String BIZ_FILTER_ALL = "all";
    private static final String BIZ_FILTER_DAILY = "daily";
    private static final String BIZ_FILTER_IMPROVEMENT = "improvement";
    private static final String BIZ_FILTER_PLAN = "plan";
    private static final String LEGACY_LOGIN_BIZ_TYPE = "login";

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
    public UserNotificationPageResponse pageCurrentUserNotifications(String filter, String bizType, long pageNo, long pageSize) {
        String username = AuthContext.getRequiredUsername();
        long safePageNo = Math.max(1L, pageNo);
        long safePageSize = Math.min(Math.max(1L, pageSize), 50L);
        Page<UserNotification> page = new Page<>(safePageNo, safePageSize);
        String safeFilter = normalizeReadFilter(filter);
        String safeBizType = normalizeBizTypeFilter(bizType);
        LambdaQueryWrapper<UserNotification> wrapper = buildNotificationQuery(
                username,
                safeFilter,
                safeBizType,
                null,
                null);
        wrapper.orderByDesc(UserNotification::getCreatedAt)
                .orderByDesc(UserNotification::getId);
        Page<UserNotification> result = userNotificationMapper.selectPage(page, wrapper);
        Map<String, String> nicknameMap = buildNicknameMap();
        List<UserNotificationResponse> list = result.getRecords().stream()
                .map(item -> toResponse(item, nicknameMap))
                .collect(Collectors.toList());
        long total = result.getTotal();
        return UserNotificationPageResponse.builder()
                .pageNo(safePageNo)
                .pageSize(safePageSize)
                .total(total)
                .hasMore(safePageNo * safePageSize < total)
                .list(list)
                .build();
    }

    @Override
    public List<UserNotificationResponse> listCurrentUserNotifications() {
        String username = AuthContext.getRequiredUsername();
        return listNotificationsByUsername(username);
    }

    @Override
    public UserNotificationUnreadResponse getCurrentUserNotificationStats() {
        String username = AuthContext.getRequiredUsername();
        long unreadCount = countNotifications(username, "unread", BIZ_FILTER_ALL, null, null);
        long totalCount = countNotifications(username, "all", BIZ_FILTER_ALL, null, null);
        long readCount = Math.max(0L, totalCount - unreadCount);
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime tomorrowStart = today.plusDays(1).atStartOfDay();
        long todayCount = countNotifications(username, "all", BIZ_FILTER_ALL, todayStart, tomorrowStart);

        Map<String, Long> bizTypeCounts = buildBizTypeCounts(username, null, null);
        Map<String, Long> todayBizTypeCounts = buildBizTypeCounts(username, todayStart, tomorrowStart);
        return UserNotificationUnreadResponse.builder()
                .unreadCount(unreadCount)
                .readCount(readCount)
                .totalCount(totalCount)
                .todayCount(todayCount)
                .bizTypeCounts(bizTypeCounts)
                .todayBizTypeCounts(todayBizTypeCounts)
                .build();
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
        return countNotifications(username, "unread", BIZ_FILTER_ALL, null, null);
    }

    private long countTotalByUsername(String username) {
        return countNotifications(username, "all", BIZ_FILTER_ALL, null, null);
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

    private LambdaQueryWrapper<UserNotification> buildNotificationQuery(String username,
                                                                        String filter,
                                                                        String bizType,
                                                                        LocalDateTime createdAtStart,
                                                                        LocalDateTime createdAtEnd) {
        LambdaQueryWrapper<UserNotification> wrapper = new LambdaQueryWrapper<UserNotification>()
                .eq(UserNotification::getRecipientUsername, username);

        if ("unread".equals(filter)) {
            wrapper.eq(UserNotification::getIsRead, false);
        } else if ("read".equals(filter)) {
            wrapper.eq(UserNotification::getIsRead, true);
        }

        List<String> acceptedBizTypes = resolveBizTypesForFilter(bizType);
        if (!acceptedBizTypes.isEmpty()) {
            wrapper.in(UserNotification::getBizType, acceptedBizTypes);
        }

        if (createdAtStart != null) {
            wrapper.ge(UserNotification::getCreatedAt, createdAtStart);
        }
        if (createdAtEnd != null) {
            wrapper.lt(UserNotification::getCreatedAt, createdAtEnd);
        }
        return wrapper;
    }

    private long countNotifications(String username,
                                    String filter,
                                    String bizType,
                                    LocalDateTime createdAtStart,
                                    LocalDateTime createdAtEnd) {
        return userNotificationMapper.selectCount(buildNotificationQuery(
                username,
                normalizeReadFilter(filter),
                normalizeBizTypeFilter(bizType),
                createdAtStart,
                createdAtEnd));
    }

    private Map<String, Long> buildBizTypeCounts(String username,
                                                 LocalDateTime createdAtStart,
                                                 LocalDateTime createdAtEnd) {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put(BIZ_FILTER_ALL, countNotifications(username, "all", BIZ_FILTER_ALL, createdAtStart, createdAtEnd));
        counts.put(NotificationBizTypeConstants.ANNIVERSARY,
                countNotifications(username, "all", NotificationBizTypeConstants.ANNIVERSARY, createdAtStart, createdAtEnd));
        counts.put(NotificationBizTypeConstants.ALBUM,
                countNotifications(username, "all", NotificationBizTypeConstants.ALBUM, createdAtStart, createdAtEnd));
        counts.put(BIZ_FILTER_DAILY,
                countNotifications(username, "all", BIZ_FILTER_DAILY, createdAtStart, createdAtEnd));
        counts.put(BIZ_FILTER_IMPROVEMENT,
                countNotifications(username, "all", BIZ_FILTER_IMPROVEMENT, createdAtStart, createdAtEnd));
        counts.put(NotificationBizTypeConstants.COUNTDOWN,
                countNotifications(username, "all", NotificationBizTypeConstants.COUNTDOWN, createdAtStart, createdAtEnd));
        counts.put(NotificationBizTypeConstants.AUTH,
                countNotifications(username, "all", NotificationBizTypeConstants.AUTH, createdAtStart, createdAtEnd));
        counts.put(BIZ_FILTER_PLAN,
                countNotifications(username, "all", BIZ_FILTER_PLAN, createdAtStart, createdAtEnd));
        return counts;
    }

    private String normalizeReadFilter(String filter) {
        String safeFilter = StringUtils.hasText(filter) ? filter.trim().toLowerCase(Locale.ROOT) : "all";
        if ("unread".equals(safeFilter) || "read".equals(safeFilter)) {
            return safeFilter;
        }
        return "all";
    }

    private String normalizeBizTypeFilter(String bizType) {
        return StringUtils.hasText(bizType) ? bizType.trim().toLowerCase(Locale.ROOT) : BIZ_FILTER_ALL;
    }

    private List<String> resolveBizTypesForFilter(String bizType) {
        String safeBizType = normalizeBizTypeFilter(bizType);
        switch (safeBizType) {
            case "":
            case BIZ_FILTER_ALL:
                return Collections.emptyList();
            case NotificationBizTypeConstants.ANNIVERSARY:
                return Collections.singletonList(NotificationBizTypeConstants.ANNIVERSARY);
            case NotificationBizTypeConstants.ALBUM:
                return Collections.singletonList(NotificationBizTypeConstants.ALBUM);
            case NotificationBizTypeConstants.COUNTDOWN:
                return Collections.singletonList(NotificationBizTypeConstants.COUNTDOWN);
            case NotificationBizTypeConstants.AUTH:
            case LEGACY_LOGIN_BIZ_TYPE:
                return Arrays.asList(NotificationBizTypeConstants.AUTH, LEGACY_LOGIN_BIZ_TYPE);
            case BIZ_FILTER_DAILY:
            case NotificationBizTypeConstants.DAILY_SUMMARY:
            case NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY:
                return Arrays.asList(
                        NotificationBizTypeConstants.DAILY_SUMMARY,
                        NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY);
            case BIZ_FILTER_IMPROVEMENT:
            case NotificationBizTypeConstants.IMPROVEMENT_NOTE:
            case NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK:
                return Arrays.asList(
                        NotificationBizTypeConstants.IMPROVEMENT_NOTE,
                        NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK);
            case BIZ_FILTER_PLAN:
            case NotificationBizTypeConstants.ROMANTIC_PLAN:
                return Collections.singletonList(NotificationBizTypeConstants.ROMANTIC_PLAN);
            default:
                return Collections.singletonList(safeBizType);
        }
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
