package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.common.NotificationTypeConstants;
import org.love.romantic.entity.AnniversaryEvent;
import org.love.romantic.entity.AnniversaryMedia;
import org.love.romantic.entity.BizCommentRecord;
import org.love.romantic.entity.BizLikeRecord;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.AnniversaryEventMapper;
import org.love.romantic.mapper.AnniversaryMediaMapper;
import org.love.romantic.mapper.BizCommentRecordMapper;
import org.love.romantic.mapper.BizLikeRecordMapper;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.model.AnniversaryEventRequest;
import org.love.romantic.model.AnniversaryEventResponse;
import org.love.romantic.model.AnniversaryMediaRequest;
import org.love.romantic.model.AnniversaryMediaResponse;
import org.love.romantic.model.AnniversaryReminderResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.InteractionLikeUserResponse;
import org.love.romantic.service.AnniversaryService;
import org.love.romantic.service.LocalFileStorageService;
import org.love.romantic.service.UserNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
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
    private final BizLikeRecordMapper bizLikeRecordMapper;
    private final BizCommentRecordMapper bizCommentRecordMapper;
    private final CoupleProfileMapper coupleProfileMapper;
    private final LocalFileStorageService localFileStorageService;
    private final UserNotificationService userNotificationService;

    public AnniversaryServiceImpl(AnniversaryEventMapper anniversaryEventMapper,
                                  AnniversaryMediaMapper anniversaryMediaMapper,
                                  BizLikeRecordMapper bizLikeRecordMapper,
                                  BizCommentRecordMapper bizCommentRecordMapper,
                                  CoupleProfileMapper coupleProfileMapper,
                                  LocalFileStorageService localFileStorageService,
                                  UserNotificationService userNotificationService) {
        this.anniversaryEventMapper = anniversaryEventMapper;
        this.anniversaryMediaMapper = anniversaryMediaMapper;
        this.bizLikeRecordMapper = bizLikeRecordMapper;
        this.bizCommentRecordMapper = bizCommentRecordMapper;
        this.coupleProfileMapper = coupleProfileMapper;
        this.localFileStorageService = localFileStorageService;
        this.userNotificationService = userNotificationService;
    }

    @Override
    public List<AnniversaryEventResponse> listEvents(String status) {
        String currentUsername = AuthContext.getRequiredUsername();
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<AnniversaryEvent> queryWrapper = new LambdaQueryWrapper<>();

        String safeStatus = String.valueOf(status).trim().toLowerCase(Locale.ROOT);
        if ("past".equals(safeStatus)) {
            queryWrapper.lt(AnniversaryEvent::getEventDate, today);
        } else if ("future".equals(safeStatus)) {
            queryWrapper.ge(AnniversaryEvent::getEventDate, today);
        }

        queryWrapper.orderByDesc(AnniversaryEvent::getPinned)
                .orderByDesc(AnniversaryEvent::getEventDate)
                .orderByDesc(AnniversaryEvent::getId);
        List<AnniversaryEvent> events = anniversaryEventMapper.selectList(queryWrapper);
        Map<String, String> nicknameMap = buildNicknameMap();
        Map<Long, Long> likeCountMap = buildLikeCountMap(
                NotificationBizTypeConstants.ANNIVERSARY,
                events.stream().map(AnniversaryEvent::getId).collect(Collectors.toList())
        );
        Set<Long> likedEventIds = buildLikedBizIdSet(
                NotificationBizTypeConstants.ANNIVERSARY,
                events.stream().map(AnniversaryEvent::getId).collect(Collectors.toList()),
                currentUsername
        );

        return events.stream()
                .map(event -> {
                    event.setLikeCount(likeCountMap.getOrDefault(event.getId(), 0L));
                    return toSummaryResponse(event, nicknameMap, likedEventIds.contains(event.getId()));
                })
                .collect(Collectors.toList());
    }

    @Override
    public AnniversaryEventResponse getEvent(Long id) {
        String currentUsername = AuthContext.getRequiredUsername();
        AnniversaryEvent event = requireEvent(id);
        Map<String, String> nicknameMap = buildNicknameMap();
        List<InteractionLikeUserResponse> likeUsers = buildLikeUserResponses(NotificationBizTypeConstants.ANNIVERSARY, id, nicknameMap);
        List<InteractionCommentResponse> commentList = listCommentResponses(NotificationBizTypeConstants.ANNIVERSARY, id, nicknameMap);
        boolean likedByCurrentUser = likeUsers.stream()
                .anyMatch(item -> currentUsername.equalsIgnoreCase(item.getUsername()));
        return toDetailResponse(event, nicknameMap, likeUsers, commentList, likedByCurrentUser);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AnniversaryEventResponse createEvent(AnniversaryEventRequest request) {
        String operator = AuthContext.getRequiredUsername();
        LocalDateTime now = LocalDateTime.now();
        AnniversaryEvent event = AnniversaryEvent.builder()
                .username(operator)
                .pinned(false)
                .likeCount(0L)
                .createdAt(now)
                .updatedAt(now)
                .build();
        applyRequest(event, request, false);
        anniversaryEventMapper.insert(event);
        syncPinnedState(event.getId(), Boolean.TRUE.equals(event.getPinned()));
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
        return getEvent(event.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AnniversaryEventResponse updateEvent(Long id, AnniversaryEventRequest request) {
        String operator = AuthContext.getRequiredUsername();
        AnniversaryEvent event = requireEvent(id);
        List<AnniversaryMedia> existingMedia = listMediaEntities(id);
        String creatorUsername = event.getUsername();
        LocalDateTime createdAt = event.getCreatedAt();
        boolean existingPinned = Boolean.TRUE.equals(event.getPinned());
        applyRequest(event, request, existingPinned);
        event.setUsername(creatorUsername);
        event.setCreatedAt(createdAt);
        event.setUpdatedAt(LocalDateTime.now());
        anniversaryEventMapper.updateById(event);
        syncPinnedState(id, Boolean.TRUE.equals(event.getPinned()));
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
        return getEvent(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AnniversaryEventResponse setPinned(Long id, boolean pinned) {
        String operator = AuthContext.getRequiredUsername();
        AnniversaryEvent event = requireEvent(id);
        if (Boolean.TRUE.equals(event.getPinned()) == pinned) {
            return getEvent(id);
        }

        event.setPinned(pinned);
        event.setUpdatedAt(LocalDateTime.now());
        anniversaryEventMapper.updateById(event);
        syncPinnedState(id, pinned);
        userNotificationService.notifyPartners(
                operator,
                pinned ? NotificationTypeConstants.ANNIVERSARY_PINNED : NotificationTypeConstants.ANNIVERSARY_UNPINNED,
                pinned ? "首页纪念日换成了这一天" : "这条纪念日已从首页撤下",
                pinned
                        ? "「" + event.getTitle() + "」现在会展示在首页纪念日板块。"
                        : "「" + event.getTitle() + "」已经不再固定展示在首页纪念日板块。",
                NotificationBizTypeConstants.ANNIVERSARY,
                event.getId(),
                Map.of("title", event.getTitle(), "pinned", pinned)
        );
        log.info("更新纪念日置顶状态成功，operator={}, eventId={}, pinned={}", operator, id, pinned);
        return getEvent(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteEvent(Long id) {
        String operator = AuthContext.getRequiredUsername();
        AnniversaryEvent event = requireEvent(id);
        String title = event.getTitle();
        List<AnniversaryMedia> existingMedia = listMediaEntities(id);
        anniversaryMediaMapper.delete(new LambdaQueryWrapper<AnniversaryMedia>().eq(AnniversaryMedia::getEventId, id));
        bizLikeRecordMapper.delete(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ANNIVERSARY)
                .eq(BizLikeRecord::getBizId, id));
        bizCommentRecordMapper.delete(new LambdaQueryWrapper<BizCommentRecord>()
                .eq(BizCommentRecord::getBizType, NotificationBizTypeConstants.ANNIVERSARY)
                .eq(BizCommentRecord::getBizId, id));
        anniversaryEventMapper.deleteById(id);
        existingMedia.forEach(media -> {
            localFileStorageService.deleteAnniversaryMediaQuietly(media.getFileUrl());
            localFileStorageService.deleteAnniversaryMediaQuietly(media.getThumbnailUrl());
        });
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ANNIVERSARY_DELETED,
                "一条纪念日被收起了",
                "「" + title + "」刚刚从你们的纪念日清单里移除了。",
                NotificationBizTypeConstants.ANNIVERSARY,
                0L,
                Map.of("title", title, "deleted", true)
        );
        log.info("删除纪念日成功，operator={}, eventId={}", operator, event.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionLikeToggleResponse toggleLike(Long id) {
        String operator = AuthContext.getRequiredUsername();
        AnniversaryEvent event = requireEvent(id);

        List<BizLikeRecord> existingLikes = bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ANNIVERSARY)
                .eq(BizLikeRecord::getBizId, id)
                .eq(BizLikeRecord::getUsername, operator));

        boolean liked;
        if (existingLikes.isEmpty()) {
            bizLikeRecordMapper.insert(BizLikeRecord.builder()
                    .bizType(NotificationBizTypeConstants.ANNIVERSARY)
                    .bizId(id)
                    .username(operator)
                    .createdAt(LocalDateTime.now())
                    .build());
            liked = true;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.ANNIVERSARY_LIKED,
                    "纪念日收到了一颗爱心",
                    "「" + event.getTitle() + "」被轻轻点亮了一次喜欢。",
                    NotificationBizTypeConstants.ANNIVERSARY,
                    event.getId(),
                    Map.of("title", event.getTitle(), "liked", true)
            );
        } else {
            bizLikeRecordMapper.delete(new LambdaQueryWrapper<BizLikeRecord>()
                    .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ANNIVERSARY)
                    .eq(BizLikeRecord::getBizId, id)
                    .eq(BizLikeRecord::getUsername, operator));
            liked = false;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.ANNIVERSARY_UNLIKED,
                    "纪念日少了一颗爱心",
                    "「" + event.getTitle() + "」刚刚取消了一次点赞。",
                    NotificationBizTypeConstants.ANNIVERSARY,
                    event.getId(),
                    Map.of("title", event.getTitle(), "liked", false)
            );
        }

        long latestLikeCount = recountAnniversaryLikeCount(id);
        log.info("纪念日点赞状态切换成功，operator={}, eventId={}, liked={}, likeCount={}", operator, id, liked, latestLikeCount);
        return InteractionLikeToggleResponse.builder()
                .liked(liked)
                .likeCount(latestLikeCount)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionCommentResponse addComment(Long id, InteractionCommentRequest request) {
        String operator = AuthContext.getRequiredUsername();
        AnniversaryEvent event = requireEvent(id);

        String content = defaultIfBlank(request.getContent(), "");
        if (!StringUtils.hasText(content)) {
            throw new BusinessException("评论内容不能为空");
        }

        LocalDateTime now = LocalDateTime.now();
        BizCommentRecord comment = BizCommentRecord.builder()
                .bizType(NotificationBizTypeConstants.ANNIVERSARY)
                .bizId(id)
                .username(operator)
                .content(content)
                .createdAt(now)
                .updatedAt(now)
                .build();
        bizCommentRecordMapper.insert(comment);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ANNIVERSARY_COMMENTED,
                "纪念日下多了一句回应",
                "「" + event.getTitle() + "」下面刚刚多了一条新的评论。",
                NotificationBizTypeConstants.ANNIVERSARY,
                id,
                Map.of("title", event.getTitle(), "commentId", comment.getId())
        );
        log.info("纪念日评论创建成功，operator={}, eventId={}, commentId={}", operator, id, comment.getId());
        return toCommentResponse(comment, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteComment(Long id, Long commentId) {
        String operator = AuthContext.getRequiredUsername();
        AnniversaryEvent event = requireEvent(id);
        BizCommentRecord comment = requireComment(NotificationBizTypeConstants.ANNIVERSARY, id, commentId);
        boolean canDelete = operator.equalsIgnoreCase(defaultIfBlank(comment.getUsername(), ""))
                || operator.equalsIgnoreCase(defaultIfBlank(event.getUsername(), ""));
        if (!canDelete) {
            throw new BusinessException("当前没有权限删除这条评论");
        }
        bizCommentRecordMapper.deleteById(commentId);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ANNIVERSARY_COMMENT_DELETED,
                "纪念日里撤回了一句回应",
                "「" + event.getTitle() + "」下面有一条评论刚刚被删除了。",
                NotificationBizTypeConstants.ANNIVERSARY,
                id,
                Map.of("title", event.getTitle(), "commentId", commentId, "deleted", true)
        );
        log.info("纪念日评论删除成功，operator={}, eventId={}, commentId={}", operator, id, commentId);
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

    private void applyRequest(AnniversaryEvent event, AnniversaryEventRequest request, boolean fallbackPinned) {
        List<AnniversaryMediaRequest> mediaList = request.getMediaList() == null ? new ArrayList<>() : request.getMediaList();
        validateMediaList(mediaList);

        event.setTitle(request.getTitle().trim());
        event.setType(defaultIfBlank(request.getType(), "custom"));
        event.setEventDate(parseDate(request.getEventDate()));
        event.setDescription(defaultIfBlank(request.getDescription(), ""));
        event.setLocation(defaultIfBlank(request.getLocation(), ""));
        event.setReminderType(normalizeReminderType(request.getReminderType()));
        event.setPinned(request.getPinned() == null ? fallbackPinned : Boolean.TRUE.equals(request.getPinned()));
        event.setCoverUrl(resolveCoverUrl(mediaList));
    }

    private void syncPinnedState(Long currentEventId, boolean pinned) {
        if (!pinned) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        List<AnniversaryEvent> pinnedEvents = anniversaryEventMapper.selectList(new LambdaQueryWrapper<AnniversaryEvent>()
                .eq(AnniversaryEvent::getPinned, true)
                .ne(AnniversaryEvent::getId, currentEventId));
        for (AnniversaryEvent pinnedEvent : pinnedEvents) {
            AnniversaryEvent update = new AnniversaryEvent();
            update.setId(pinnedEvent.getId());
            update.setPinned(false);
            update.setUpdatedAt(now);
            anniversaryEventMapper.updateById(update);
        }
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
        List<String> newThumbnailUrls = newMediaRequests == null ? new ArrayList<>() : newMediaRequests.stream()
                .map(AnniversaryMediaRequest::getThumbnailUrl)
                .filter(StringUtils::hasText)
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

        existingMedia.forEach(item -> {
            if (!newFileUrls.contains(item.getFileUrl())) {
                localFileStorageService.deleteAnniversaryMediaQuietly(item.getFileUrl());
            }
            if (StringUtils.hasText(item.getThumbnailUrl()) && !newThumbnailUrls.contains(item.getThumbnailUrl())) {
                localFileStorageService.deleteAnniversaryMediaQuietly(item.getThumbnailUrl());
            }
        });
    }

    private List<AnniversaryMedia> listMediaEntities(Long eventId) {
        return anniversaryMediaMapper.selectList(new LambdaQueryWrapper<AnniversaryMedia>()
                .eq(AnniversaryMedia::getEventId, eventId)
                .orderByAsc(AnniversaryMedia::getSortOrder)
                .orderByAsc(AnniversaryMedia::getId));
    }

    private AnniversaryEventResponse toSummaryResponse(AnniversaryEvent event,
                                                       Map<String, String> nicknameMap,
                                                       boolean likedByCurrentUser) {
        return buildResponse(event, new ArrayList<>(), nicknameMap, new ArrayList<>(), new ArrayList<>(), likedByCurrentUser);
    }

    private AnniversaryEventResponse toDetailResponse(AnniversaryEvent event,
                                                      Map<String, String> nicknameMap,
                                                      List<InteractionLikeUserResponse> likeUsers,
                                                      List<InteractionCommentResponse> commentList,
                                                      boolean likedByCurrentUser) {
        List<AnniversaryMediaResponse> mediaList = listMediaEntities(event.getId()).stream()
                .map(this::toMediaResponse)
                .collect(Collectors.toList());
        return buildResponse(event, mediaList, nicknameMap, likeUsers, commentList, likedByCurrentUser);
    }

    private AnniversaryEventResponse buildResponse(AnniversaryEvent event,
                                                   List<AnniversaryMediaResponse> mediaList,
                                                   Map<String, String> nicknameMap,
                                                   List<InteractionLikeUserResponse> likeUsers,
                                                   List<InteractionCommentResponse> commentList,
                                                   boolean likedByCurrentUser) {
        long dayOffset = ChronoUnit.DAYS.between(LocalDate.now(), event.getEventDate());
        String timeStatus = dayOffset >= 0 ? "future" : "past";
        long likeCount = likeUsers.isEmpty()
                ? (event.getLikeCount() == null ? 0L : event.getLikeCount())
                : likeUsers.size();

        return AnniversaryEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .type(event.getType())
                .eventDate(event.getEventDate().toString())
                .description(defaultIfBlank(event.getDescription(), ""))
                .location(defaultIfBlank(event.getLocation(), ""))
                .coverUrl(defaultIfBlank(event.getCoverUrl(), ""))
                .pinned(Boolean.TRUE.equals(event.getPinned()))
                .likeCount(likeCount)
                .likedByCurrentUser(likedByCurrentUser)
                .reminderType(event.getReminderType())
                .timeStatus(timeStatus)
                .dayOffset(dayOffset)
                .creatorUsername(event.getUsername())
                .creatorNickname(resolveCreatorNickname(event.getUsername(), nicknameMap))
                .mediaList(mediaList)
                .likeUsers(likeUsers)
                .commentList(commentList)
                .build();
    }

    private List<BizLikeRecord> listLikeEntities(String bizType, Long bizId) {
        return bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, bizType)
                .eq(BizLikeRecord::getBizId, bizId)
                .orderByDesc(BizLikeRecord::getCreatedAt)
                .orderByDesc(BizLikeRecord::getId));
    }

    private Set<Long> buildLikedBizIdSet(String bizType, List<Long> bizIds, String username) {
        if (bizIds == null || bizIds.isEmpty() || !StringUtils.hasText(username)) {
            return new HashSet<>();
        }
        return bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                        .eq(BizLikeRecord::getBizType, bizType)
                        .in(BizLikeRecord::getBizId, bizIds)
                        .eq(BizLikeRecord::getUsername, username))
                .stream()
                .map(BizLikeRecord::getBizId)
                .collect(Collectors.toSet());
    }

    private Map<Long, Long> buildLikeCountMap(String bizType, List<Long> bizIds) {
        if (bizIds == null || bizIds.isEmpty()) {
            return new HashMap<>();
        }
        Map<Long, Set<String>> usernameMap = new HashMap<>();
        for (BizLikeRecord record : bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, bizType)
                .in(BizLikeRecord::getBizId, bizIds))) {
            String username = defaultIfBlank(record.getUsername(), "");
            if (!StringUtils.hasText(username)) {
                continue;
            }
            usernameMap.computeIfAbsent(record.getBizId(), key -> new HashSet<>()).add(username);
        }

        Map<Long, Long> likeCountMap = new HashMap<>();
        usernameMap.forEach((bizId, usernames) -> likeCountMap.put(bizId, (long) usernames.size()));
        return likeCountMap;
    }

    private List<InteractionLikeUserResponse> buildLikeUserResponses(String bizType,
                                                                     Long bizId,
                                                                     Map<String, String> nicknameMap) {
        Map<String, InteractionLikeUserResponse> result = new LinkedHashMap<>();
        for (BizLikeRecord like : listLikeEntities(bizType, bizId)) {
            String username = defaultIfBlank(like.getUsername(), "");
            if (!StringUtils.hasText(username) || result.containsKey(username)) {
                continue;
            }
            result.put(username, InteractionLikeUserResponse.builder()
                    .username(username)
                    .nickname(resolveCreatorNickname(username, nicknameMap))
                    .likeTimes(1L)
                    .lastLikedAt(formatDateTime(like.getCreatedAt()))
                    .build());
        }
        return new ArrayList<>(result.values());
    }

    private long recountAnniversaryLikeCount(Long eventId) {
        List<BizLikeRecord> likeRecords = bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ANNIVERSARY)
                .eq(BizLikeRecord::getBizId, eventId));

        long uniqueCount = likeRecords.stream()
                .map(record -> defaultIfBlank(record.getUsername(), ""))
                .filter(StringUtils::hasText)
                .distinct()
                .count();

        AnniversaryEvent update = new AnniversaryEvent();
        update.setId(eventId);
        update.setLikeCount(uniqueCount);
        anniversaryEventMapper.updateById(update);
        return uniqueCount;
    }

    private List<BizCommentRecord> listCommentEntities(String bizType, Long bizId) {
        return bizCommentRecordMapper.selectList(new LambdaQueryWrapper<BizCommentRecord>()
                .eq(BizCommentRecord::getBizType, bizType)
                .eq(BizCommentRecord::getBizId, bizId)
                .orderByAsc(BizCommentRecord::getCreatedAt)
                .orderByAsc(BizCommentRecord::getId));
    }

    private BizCommentRecord requireComment(String bizType, Long bizId, Long commentId) {
        if (commentId == null) {
            throw new BusinessException("评论编号不能为空");
        }
        BizCommentRecord comment = bizCommentRecordMapper.selectById(commentId);
        if (comment == null
                || !bizType.equals(defaultIfBlank(comment.getBizType(), ""))
                || !bizId.equals(comment.getBizId())) {
            throw new BusinessException("评论记录不存在");
        }
        return comment;
    }

    private List<InteractionCommentResponse> listCommentResponses(String bizType,
                                                                  Long bizId,
                                                                  Map<String, String> nicknameMap) {
        return listCommentEntities(bizType, bizId).stream()
                .map(comment -> toCommentResponse(comment, nicknameMap))
                .collect(Collectors.toList());
    }

    private Map<String, String> buildNicknameMap() {
        Map<String, String> nicknameMap = new HashMap<>();
        for (CoupleProfile profile : coupleProfileMapper.selectList(null)) {
            nicknameMap.put(profile.getUsername(), profile.getNickname());
        }
        return nicknameMap;
    }

    private String resolveCreatorNickname(String username, Map<String, String> nicknameMap) {
        if (!StringUtils.hasText(username)) {
            return "";
        }
        return nicknameMap.getOrDefault(username, username);
    }

    private AnniversaryMediaResponse toMediaResponse(AnniversaryMedia media) {
        return AnniversaryMediaResponse.builder()
                .id(media.getId())
                .mediaType(media.getMediaType())
                .fileUrl(media.getFileUrl())
                .thumbnailUrl(defaultIfBlank(media.getThumbnailUrl(), ""))
                .sortOrder(media.getSortOrder())
                .build();
    }

    private InteractionCommentResponse toCommentResponse(BizCommentRecord comment, Map<String, String> nicknameMap) {
        return InteractionCommentResponse.builder()
                .id(comment.getId())
                .commenterUsername(comment.getUsername())
                .commenterNickname(resolveCreatorNickname(comment.getUsername(), nicknameMap))
                .content(defaultIfBlank(comment.getContent(), ""))
                .createdAt(formatDateTime(comment.getCreatedAt()))
                .updatedAt(formatDateTime(comment.getUpdatedAt()))
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

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception exception) {
            throw new BusinessException("纪念日日期格式不正确");
        }
    }

    private String normalizeReminderType(String reminderType) {
        String safeValue = defaultIfBlank(reminderType, "none").toLowerCase(Locale.ROOT);
        switch (safeValue) {
            case "three_days_before":
            case "one_day_before":
            case "same_day":
            case "none":
                return safeValue;
            default:
                return "none";
        }
    }

    private LocalDate calculateRemindDate(LocalDate eventDate, String reminderType) {
        if (eventDate == null || !StringUtils.hasText(reminderType)) {
            return null;
        }
        switch (reminderType) {
            case "three_days_before":
                return eventDate.minusDays(3);
            case "one_day_before":
                return eventDate.minusDays(1);
            case "same_day":
                return eventDate;
            default:
                return null;
        }
    }

    private String formatDateTime(LocalDateTime value) {
        if (value == null) {
            return "";
        }
        return value.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
