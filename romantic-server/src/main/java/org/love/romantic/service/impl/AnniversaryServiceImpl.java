package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.common.NotificationTypeConstants;
import org.love.romantic.entity.AnniversaryEvent;
import org.love.romantic.entity.AnniversaryMedia;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.AnniversaryEventMapper;
import org.love.romantic.mapper.AnniversaryMediaMapper;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.model.AnniversaryEventRequest;
import org.love.romantic.model.AnniversaryEventResponse;
import org.love.romantic.model.AnniversaryMediaRequest;
import org.love.romantic.model.AnniversaryMediaResponse;
import org.love.romantic.model.AnniversaryReminderResponse;
import org.love.romantic.service.AnniversaryService;
import org.love.romantic.service.LocalFileStorageService;
import org.love.romantic.service.UserNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 纪念日服务实现。
 * 纪念日对两个账号共享，创建人仅用于展示来源。
 */
@Slf4j
@Service
public class AnniversaryServiceImpl implements AnniversaryService {

    private static final int MAX_IMAGE_COUNT = 10;
    private static final int MAX_VIDEO_COUNT = 1;

    private final AnniversaryEventMapper anniversaryEventMapper;
    private final AnniversaryMediaMapper anniversaryMediaMapper;
    private final CoupleProfileMapper coupleProfileMapper;
    private final LocalFileStorageService localFileStorageService;
    private final UserNotificationService userNotificationService;

    public AnniversaryServiceImpl(AnniversaryEventMapper anniversaryEventMapper,
                                  AnniversaryMediaMapper anniversaryMediaMapper,
                                  CoupleProfileMapper coupleProfileMapper,
                                  LocalFileStorageService localFileStorageService,
                                  UserNotificationService userNotificationService) {
        this.anniversaryEventMapper = anniversaryEventMapper;
        this.anniversaryMediaMapper = anniversaryMediaMapper;
        this.coupleProfileMapper = coupleProfileMapper;
        this.localFileStorageService = localFileStorageService;
        this.userNotificationService = userNotificationService;
    }

    @Override
    public List<AnniversaryEventResponse> listEvents(String status) {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<AnniversaryEvent> queryWrapper = new LambdaQueryWrapper<>();

        String safeStatus = String.valueOf(status).trim().toLowerCase(Locale.ROOT);
        if ("past".equals(safeStatus)) {
            queryWrapper.lt(AnniversaryEvent::getEventDate, today);
        } else if ("future".equals(safeStatus)) {
            queryWrapper.ge(AnniversaryEvent::getEventDate, today);
        }

        queryWrapper.orderByDesc(AnniversaryEvent::getEventDate).orderByDesc(AnniversaryEvent::getId);
        List<AnniversaryEvent> events = anniversaryEventMapper.selectList(queryWrapper);
        Map<String, String> nicknameMap = buildNicknameMap();
        return events.stream()
                .map(event -> toSummaryResponse(event, nicknameMap))
                .collect(Collectors.toList());
    }

    @Override
    public AnniversaryEventResponse getEvent(Long id) {
        AnniversaryEvent event = requireEvent(id);
        return toDetailResponse(event, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AnniversaryEventResponse createEvent(AnniversaryEventRequest request) {
        String operator = AuthContext.getRequiredUsername();
        LocalDateTime now = LocalDateTime.now();
        AnniversaryEvent event = AnniversaryEvent.builder()
                .username(operator)
                .likeCount(0L)
                .createdAt(now)
                .updatedAt(now)
                .build();
        applyRequest(event, request);
        anniversaryEventMapper.insert(event);
        replaceMedia(event.getId(), new ArrayList<>(), request.getMediaList());
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ANNIVERSARY_CREATED,
                "纪念清单里多了一天",
                "「" + event.getTitle() + "」已经被认真写进你们的纪念日里。",
                NotificationBizTypeConstants.ANNIVERSARY,
                event.getId(),
                Map.of("title", event.getTitle())
        );
        log.info("创建纪念日成功，creator={}, eventId={}", operator, event.getId());
        return toDetailResponse(event, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AnniversaryEventResponse updateEvent(Long id, AnniversaryEventRequest request) {
        String operator = AuthContext.getRequiredUsername();
        AnniversaryEvent event = requireEvent(id);
        List<AnniversaryMedia> existingMedia = listMediaEntities(id);
        String creatorUsername = event.getUsername();
        LocalDateTime createdAt = event.getCreatedAt();
        applyRequest(event, request);
        event.setUsername(creatorUsername);
        event.setCreatedAt(createdAt);
        event.setUpdatedAt(LocalDateTime.now());
        anniversaryEventMapper.updateById(event);
        replaceMedia(id, existingMedia, request.getMediaList());
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ANNIVERSARY_UPDATED,
                "纪念日有了新变化",
                "「" + event.getTitle() + "」刚刚补上了新的内容。",
                NotificationBizTypeConstants.ANNIVERSARY,
                event.getId(),
                Map.of("title", event.getTitle())
        );
        log.info("更新纪念日成功，operator={}, eventId={}", operator, event.getId());
        return toDetailResponse(event, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteEvent(Long id) {
        String operator = AuthContext.getRequiredUsername();
        AnniversaryEvent event = requireEvent(id);
        List<AnniversaryMedia> existingMedia = listMediaEntities(id);
        anniversaryMediaMapper.delete(new LambdaQueryWrapper<AnniversaryMedia>().eq(AnniversaryMedia::getEventId, id));
        anniversaryEventMapper.deleteById(id);
        existingMedia.forEach(media -> localFileStorageService.deleteAnniversaryMediaQuietly(media.getFileUrl()));
        log.info("删除纪念日成功，operator={}, eventId={}", operator, event.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public long increaseLikeCount(Long id) {
        String operator = AuthContext.getRequiredUsername();
        requireEvent(id);
        LambdaUpdateWrapper<AnniversaryEvent> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(AnniversaryEvent::getId, id)
                .setSql("like_count = like_count + 1");
        anniversaryEventMapper.update(null, updateWrapper);

        AnniversaryEvent latestEvent = anniversaryEventMapper.selectById(id);
        long latestLikeCount = latestEvent == null || latestEvent.getLikeCount() == null ? 0L : latestEvent.getLikeCount();
        log.info("纪念日点赞成功，operator={}, eventId={}, likeCount={}", operator, id, latestLikeCount);
        return latestLikeCount;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<AnniversaryReminderResponse> consumeDueReminders() {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<AnniversaryEvent> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.ne(AnniversaryEvent::getReminderType, "none");
        List<AnniversaryEvent> events = anniversaryEventMapper.selectList(queryWrapper);

        List<AnniversaryReminderResponse> dueReminders = new ArrayList<>();
        for (AnniversaryEvent event : events) {
            LocalDate remindDate = calculateRemindDate(event.getEventDate(), event.getReminderType());
            if (remindDate == null || !today.equals(remindDate) || today.equals(event.getLastRemindedOn())) {
                continue;
            }
            event.setLastRemindedOn(today);
            event.setUpdatedAt(LocalDateTime.now());
            anniversaryEventMapper.updateById(event);
            dueReminders.add(AnniversaryReminderResponse.builder()
                    .id(event.getId())
                    .title(event.getTitle())
                    .eventDate(event.getEventDate().toString())
                    .reminderType(event.getReminderType())
                    .description(event.getDescription())
                    .build());
        }
        return dueReminders;
    }

    private AnniversaryEvent requireEvent(Long id) {
        if (id == null) {
            throw new BusinessException("纪念日编号不能为空");
        }
        AnniversaryEvent event = anniversaryEventMapper.selectById(id);
        if (event == null) {
            throw new BusinessException("纪念日不存在");
        }
        return event;
    }

    private void applyRequest(AnniversaryEvent event, AnniversaryEventRequest request) {
        List<AnniversaryMediaRequest> mediaList = request.getMediaList() == null ? new ArrayList<>() : request.getMediaList();
        validateMediaList(mediaList);

        event.setTitle(request.getTitle().trim());
        event.setType(defaultIfBlank(request.getType(), "custom"));
        event.setEventDate(parseDate(request.getEventDate()));
        event.setDescription(defaultIfBlank(request.getDescription(), ""));
        event.setLocation(defaultIfBlank(request.getLocation(), ""));
        event.setReminderType(normalizeReminderType(request.getReminderType()));
        event.setCoverUrl(resolveCoverUrl(mediaList));
    }

    private void validateMediaList(List<AnniversaryMediaRequest> mediaList) {
        long imageCount = mediaList.stream().filter(item -> "image".equalsIgnoreCase(item.getMediaType())).count();
        long videoCount = mediaList.stream().filter(item -> "video".equalsIgnoreCase(item.getMediaType())).count();
        if (imageCount > MAX_IMAGE_COUNT) {
            throw new BusinessException("纪念日图片最多 10 张");
        }
        if (videoCount > MAX_VIDEO_COUNT) {
            throw new BusinessException("纪念日视频最多 1 个");
        }

        for (AnniversaryMediaRequest media : mediaList) {
            if (!"image".equalsIgnoreCase(media.getMediaType()) && !"video".equalsIgnoreCase(media.getMediaType())) {
                throw new BusinessException("纪念日媒体类型不正确");
            }
            String normalizedFileUrl = localFileStorageService.normalizeManagedAnniversaryPath(media.getFileUrl());
            if (normalizedFileUrl == null) {
                throw new BusinessException("纪念日媒体地址不合法，请重新上传");
            }
            if (StringUtils.hasText(media.getThumbnailUrl())
                    && localFileStorageService.normalizeManagedAnniversaryPath(media.getThumbnailUrl()) == null) {
                throw new BusinessException("纪念日缩略图地址不合法，请重新上传");
            }
        }
    }

    private void replaceMedia(Long eventId,
                              List<AnniversaryMedia> existingMedia,
                              List<AnniversaryMediaRequest> newMediaRequests) {
        anniversaryMediaMapper.delete(new LambdaQueryWrapper<AnniversaryMedia>().eq(AnniversaryMedia::getEventId, eventId));
        List<String> newFileUrls = newMediaRequests == null ? new ArrayList<>() : newMediaRequests.stream()
                .map(AnniversaryMediaRequest::getFileUrl)
                .collect(Collectors.toList());

        if (newMediaRequests != null) {
            for (AnniversaryMediaRequest request : newMediaRequests) {
                anniversaryMediaMapper.insert(AnniversaryMedia.builder()
                        .eventId(eventId)
                        .mediaType(request.getMediaType().toLowerCase(Locale.ROOT))
                        .fileUrl(localFileStorageService.normalizeManagedAnniversaryPath(request.getFileUrl()))
                        .thumbnailUrl(localFileStorageService.normalizeManagedAnniversaryPath(request.getThumbnailUrl()))
                        .sortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder())
                        .build());
            }
        }

        existingMedia.stream()
                .filter(item -> !newFileUrls.contains(item.getFileUrl()))
                .forEach(item -> localFileStorageService.deleteAnniversaryMediaQuietly(item.getFileUrl()));
    }

    private List<AnniversaryMedia> listMediaEntities(Long eventId) {
        LambdaQueryWrapper<AnniversaryMedia> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AnniversaryMedia::getEventId, eventId)
                .orderByAsc(AnniversaryMedia::getSortOrder)
                .orderByAsc(AnniversaryMedia::getId);
        return anniversaryMediaMapper.selectList(queryWrapper);
    }

    private AnniversaryEventResponse toSummaryResponse(AnniversaryEvent event, Map<String, String> nicknameMap) {
        return buildResponse(event, new ArrayList<>(), nicknameMap);
    }

    private AnniversaryEventResponse toDetailResponse(AnniversaryEvent event, Map<String, String> nicknameMap) {
        List<AnniversaryMediaResponse> mediaList = listMediaEntities(event.getId()).stream()
                .map(this::toMediaResponse)
                .collect(Collectors.toList());
        return buildResponse(event, mediaList, nicknameMap);
    }

    private AnniversaryEventResponse buildResponse(AnniversaryEvent event,
                                                   List<AnniversaryMediaResponse> mediaList,
                                                   Map<String, String> nicknameMap) {
        long dayOffset = ChronoUnit.DAYS.between(LocalDate.now(), event.getEventDate());
        String timeStatus = dayOffset >= 0 ? "future" : "past";
        return AnniversaryEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .type(event.getType())
                .eventDate(event.getEventDate().toString())
                .description(event.getDescription())
                .location(event.getLocation())
                .coverUrl(event.getCoverUrl())
                .likeCount(event.getLikeCount() == null ? 0L : event.getLikeCount())
                .reminderType(event.getReminderType())
                .timeStatus(timeStatus)
                .dayOffset(dayOffset)
                .creatorUsername(event.getUsername())
                .creatorNickname(resolveCreatorNickname(event.getUsername(), nicknameMap))
                .mediaList(mediaList)
                .build();
    }

    private String resolveCreatorNickname(String username, Map<String, String> nicknameMap) {
        if (!StringUtils.hasText(username)) {
            return "";
        }
        return nicknameMap.getOrDefault(username, username);
    }

    private Map<String, String> buildNicknameMap() {
        Map<String, String> nicknameMap = new HashMap<>();
        for (CoupleProfile profile : coupleProfileMapper.selectList(null)) {
            nicknameMap.put(profile.getUsername(), profile.getNickname());
        }
        return nicknameMap;
    }

    private AnniversaryMediaResponse toMediaResponse(AnniversaryMedia media) {
        return AnniversaryMediaResponse.builder()
                .id(media.getId())
                .mediaType(media.getMediaType())
                .fileUrl(media.getFileUrl())
                .thumbnailUrl(media.getThumbnailUrl())
                .sortOrder(media.getSortOrder())
                .build();
    }

    private String resolveCoverUrl(List<AnniversaryMediaRequest> mediaList) {
        if (mediaList == null || mediaList.isEmpty()) {
            return "";
        }

        return mediaList.stream()
                .sorted(Comparator.comparing(item -> item.getSortOrder() == null ? 0 : item.getSortOrder()))
                .map(item -> "video".equalsIgnoreCase(item.getMediaType()) && StringUtils.hasText(item.getThumbnailUrl())
                        ? item.getThumbnailUrl()
                        : item.getFileUrl())
                .filter(StringUtils::hasText)
                .map(localFileStorageService::normalizeManagedAnniversaryPath)
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse("");
    }

    private LocalDate calculateRemindDate(LocalDate eventDate, String reminderType) {
        if ("on_day".equals(reminderType)) {
            return eventDate;
        }
        if ("one_day_before".equals(reminderType)) {
            return eventDate.minusDays(1);
        }
        if ("three_days_before".equals(reminderType)) {
            return eventDate.minusDays(3);
        }
        return null;
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception exception) {
            throw new BusinessException("纪念日日期格式不正确");
        }
    }

    private String normalizeReminderType(String reminderType) {
        String value = defaultIfBlank(reminderType, "none").toLowerCase(Locale.ROOT);
        switch (value) {
            case "none":
            case "on_day":
            case "one_day_before":
            case "three_days_before":
                return value;
            default:
                throw new BusinessException("提醒类型不正确");
        }
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }
}
