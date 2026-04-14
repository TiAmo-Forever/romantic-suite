package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.common.NotificationTypeConstants;
import org.love.romantic.entity.BizCommentRecord;
import org.love.romantic.entity.BizLikeRecord;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.entity.ImprovementFeedback;
import org.love.romantic.entity.ImprovementMedia;
import org.love.romantic.entity.ImprovementNote;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.BizCommentRecordMapper;
import org.love.romantic.mapper.BizLikeRecordMapper;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.mapper.ImprovementFeedbackMapper;
import org.love.romantic.mapper.ImprovementMediaMapper;
import org.love.romantic.mapper.ImprovementNoteMapper;
import org.love.romantic.model.ImprovementFeedbackRequest;
import org.love.romantic.model.ImprovementFeedbackResponse;
import org.love.romantic.model.ImprovementMediaRequest;
import org.love.romantic.model.ImprovementMediaResponse;
import org.love.romantic.model.ImprovementNoteRequest;
import org.love.romantic.model.ImprovementNoteResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.InteractionLikeUserResponse;
import org.love.romantic.service.ImprovementNoteService;
import org.love.romantic.service.LocalFileStorageService;
import org.love.romantic.service.UserNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ImprovementNoteServiceImpl implements ImprovementNoteService {

    private static final int MAX_IMAGE_COUNT = 9;
    private static final int MAX_VIDEO_COUNT = 1;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final ImprovementNoteMapper improvementNoteMapper;
    private final ImprovementFeedbackMapper improvementFeedbackMapper;
    private final ImprovementMediaMapper improvementMediaMapper;
    private final BizLikeRecordMapper bizLikeRecordMapper;
    private final BizCommentRecordMapper bizCommentRecordMapper;
    private final CoupleProfileMapper coupleProfileMapper;
    private final LocalFileStorageService localFileStorageService;
    private final UserNotificationService userNotificationService;

    public ImprovementNoteServiceImpl(ImprovementNoteMapper improvementNoteMapper,
                                      ImprovementFeedbackMapper improvementFeedbackMapper,
                                      ImprovementMediaMapper improvementMediaMapper,
                                      BizLikeRecordMapper bizLikeRecordMapper,
                                      BizCommentRecordMapper bizCommentRecordMapper,
                                      CoupleProfileMapper coupleProfileMapper,
                                      LocalFileStorageService localFileStorageService,
                                      UserNotificationService userNotificationService) {
        this.improvementNoteMapper = improvementNoteMapper;
        this.improvementFeedbackMapper = improvementFeedbackMapper;
        this.improvementMediaMapper = improvementMediaMapper;
        this.bizLikeRecordMapper = bizLikeRecordMapper;
        this.bizCommentRecordMapper = bizCommentRecordMapper;
        this.coupleProfileMapper = coupleProfileMapper;
        this.localFileStorageService = localFileStorageService;
        this.userNotificationService = userNotificationService;
    }

    @Override
    public List<ImprovementNoteResponse> listNotes(String status) {
        LambdaQueryWrapper<ImprovementNote> queryWrapper = new LambdaQueryWrapper<>();
        String safeStatus = String.valueOf(status).trim().toLowerCase(Locale.ROOT);
        if (!"all".equals(safeStatus) && StringUtils.hasText(safeStatus)) {
            queryWrapper.eq(ImprovementNote::getStatus, safeStatus);
        }
        queryWrapper.orderByDesc(ImprovementNote::getCreatedAt).orderByDesc(ImprovementNote::getId);

        Map<String, String> nicknameMap = buildNicknameMap();
        return improvementNoteMapper.selectList(queryWrapper).stream()
                .map(note -> {
                    int feedbackCount = countFeedback(note.getId());
                    int todayFeedbackCount = countTodayFeedback(note.getId());
                    return toResponse(note, listNoteMediaResponses(note.getId()), new ArrayList<>(), feedbackCount, todayFeedbackCount, nicknameMap);
                })
                .collect(Collectors.toList());
    }

    @Override
    public ImprovementNoteResponse getNote(Long id) {
        String currentUsername = AuthContext.getRequiredUsername();
        ImprovementNote note = requireNote(id);
        Map<String, String> nicknameMap = buildNicknameMap();
        List<ImprovementFeedback> feedbackEntities = listFeedbackEntities(id);
        Map<Long, List<ImprovementMediaResponse>> feedbackMediaMap = buildFeedbackMediaMap(feedbackEntities);
        List<ImprovementFeedbackResponse> feedbackList = feedbackEntities.stream()
                .map(feedback -> toFeedbackResponse(
                        feedback,
                        feedbackMediaMap.getOrDefault(feedback.getId(), new ArrayList<>()),
                        nicknameMap,
                        currentUsername
                ))
                .collect(Collectors.toList());
        return toResponse(note, listNoteMediaResponses(id), feedbackList, feedbackEntities.size(), countTodayFeedback(id), nicknameMap);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ImprovementNoteResponse createNote(ImprovementNoteRequest request) {
        String operator = AuthContext.getRequiredUsername();
        LocalDateTime now = LocalDateTime.now();
        ImprovementNote note = ImprovementNote.builder()
                .creatorUsername(operator)
                .createdAt(now)
                .updatedAt(now)
                .build();
        applyRequest(note, request);
        improvementNoteMapper.insert(note);
        replaceNoteMedia(note.getId(), new ArrayList<>(), request.getMediaList());
        insertInitialFeedbackIfNecessary(note, operator, request.getLatestFeedback());
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.IMPROVEMENT_CREATED,
                "写下了一条新的改进记录",
                "「" + note.getTitle() + "」已经被认真放进恋爱改进簿里。",
                NotificationBizTypeConstants.IMPROVEMENT_NOTE,
                note.getId(),
                Map.of("title", note.getTitle())
        );
        log.info("恋爱改进簿记录创建成功，creator={}, noteId={}", operator, note.getId());
        return getNote(note.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ImprovementNoteResponse updateNote(Long id, ImprovementNoteRequest request) {
        String operator = AuthContext.getRequiredUsername();
        ImprovementNote note = requireNote(id);
        List<ImprovementMedia> existingMedia = listMediaEntities(id, 0L);
        String creatorUsername = note.getCreatorUsername();
        LocalDateTime createdAt = note.getCreatedAt();
        applyRequest(note, request);
        note.setCreatorUsername(creatorUsername);
        note.setCreatedAt(createdAt);
        note.setUpdatedAt(LocalDateTime.now());
        improvementNoteMapper.updateById(note);
        replaceNoteMedia(id, existingMedia, request.getMediaList());
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.IMPROVEMENT_UPDATED,
                "改进记录有了新变化",
                "「" + note.getTitle() + "」刚刚被重新整理了一次。",
                NotificationBizTypeConstants.IMPROVEMENT_NOTE,
                note.getId(),
                Map.of("title", note.getTitle())
        );
        log.info("恋爱改进簿记录更新成功，operator={}, noteId={}", operator, id);
        return getNote(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteNote(Long id) {
        String operator = AuthContext.getRequiredUsername();
        ImprovementNote note = requireNote(id);
        String title = note.getTitle();
        List<ImprovementMedia> existingMedia = listAllMediaEntities(id);
        List<Long> feedbackIds = listFeedbackEntities(id).stream()
                .map(ImprovementFeedback::getId)
                .filter(item -> item != null && item > 0)
                .collect(Collectors.toList());
        improvementMediaMapper.delete(new LambdaQueryWrapper<ImprovementMedia>().eq(ImprovementMedia::getNoteId, id));
        if (!feedbackIds.isEmpty()) {
            bizLikeRecordMapper.delete(new LambdaQueryWrapper<BizLikeRecord>()
                    .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK)
                    .in(BizLikeRecord::getBizId, feedbackIds));
            bizCommentRecordMapper.delete(new LambdaQueryWrapper<BizCommentRecord>()
                    .eq(BizCommentRecord::getBizType, NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK)
                    .in(BizCommentRecord::getBizId, feedbackIds));
        }
        improvementFeedbackMapper.delete(new LambdaQueryWrapper<ImprovementFeedback>().eq(ImprovementFeedback::getNoteId, id));
        improvementNoteMapper.deleteById(id);
        deleteMediaFiles(existingMedia);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.IMPROVEMENT_DELETED,
                "一条改进记录被收起了",
                "「" + title + "」刚刚从恋爱改进簿里移除了。",
                NotificationBizTypeConstants.IMPROVEMENT_NOTE,
                0L,
                Map.of("title", title, "deleted", true)
        );
        log.info("恋爱改进簿记录删除成功，operator={}, noteId={}", operator, id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ImprovementNoteResponse addFeedback(Long id, ImprovementFeedbackRequest request) {
        String operator = AuthContext.getRequiredUsername();
        ImprovementNote note = requireNote(id);
        String normalizedStatus = normalizeStatus(request.getStatus());
        String feedbackContent = request.getContent().trim();
        ImprovementFeedback feedback = ImprovementFeedback.builder()
                .noteId(id)
                .status(normalizedStatus)
                .statusEmoji(resolveStatusEmoji(normalizedStatus))
                .content(feedbackContent)
                .creatorUsername(operator)
                .createdAt(LocalDateTime.now())
                .build();
        improvementFeedbackMapper.insert(feedback);
        replaceFeedbackMedia(id, feedback.getId(), new ArrayList<>(), request.getMediaList());

        updateNoteLatestFeedback(note, normalizedStatus, feedbackContent);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.IMPROVEMENT_FEEDBACK_CREATED,
                "收到了新的反馈",
                "「" + note.getTitle() + "」刚刚多了一条新的反馈记录。",
                NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                feedback.getId(),
                Map.of("noteId", id, "title", note.getTitle())
        );
        log.info("恋爱改进簿反馈创建成功，operator={}, noteId={}, feedbackId={}", operator, id, feedback.getId());
        return getNote(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ImprovementNoteResponse updateFeedback(Long id, Long feedbackId, ImprovementFeedbackRequest request) {
        String operator = AuthContext.getRequiredUsername();
        ImprovementNote note = requireNote(id);
        ImprovementFeedback feedback = requireFeedback(id, feedbackId);
        List<ImprovementMedia> existingMedia = listMediaEntities(id, feedbackId);
        String normalizedStatus = normalizeStatus(request.getStatus());
        String feedbackContent = request.getContent().trim();

        feedback.setStatus(normalizedStatus);
        feedback.setStatusEmoji(resolveStatusEmoji(normalizedStatus));
        feedback.setContent(feedbackContent);
        improvementFeedbackMapper.updateById(feedback);
        replaceFeedbackMedia(id, feedbackId, existingMedia, request.getMediaList());

        ImprovementFeedback latestFeedback = getLatestFeedbackEntity(id);
        if (latestFeedback == null) {
            updateNoteLatestFeedback(note, normalizedStatus, feedbackContent);
        } else {
            updateNoteLatestFeedback(note, latestFeedback.getStatus(), latestFeedback.getContent());
        }
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.IMPROVEMENT_FEEDBACK_UPDATED,
                "反馈内容更新了",
                "「" + note.getTitle() + "」的反馈内容刚刚被调整过。",
                NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                feedbackId,
                Map.of("noteId", id, "title", note.getTitle())
        );
        log.info("恋爱改进簿反馈更新成功，operator={}, noteId={}, feedbackId={}", operator, id, feedbackId);
        return getNote(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ImprovementNoteResponse deleteFeedback(Long id, Long feedbackId) {
        String operator = AuthContext.getRequiredUsername();
        ImprovementNote note = requireNote(id);
        requireFeedback(id, feedbackId);
        List<ImprovementMedia> existingMedia = listMediaEntities(id, feedbackId);

        improvementMediaMapper.delete(new LambdaQueryWrapper<ImprovementMedia>()
                .eq(ImprovementMedia::getNoteId, id)
                .eq(ImprovementMedia::getFeedbackId, feedbackId));
        bizLikeRecordMapper.delete(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK)
                .eq(BizLikeRecord::getBizId, feedbackId));
        bizCommentRecordMapper.delete(new LambdaQueryWrapper<BizCommentRecord>()
                .eq(BizCommentRecord::getBizType, NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK)
                .eq(BizCommentRecord::getBizId, feedbackId));
        improvementFeedbackMapper.deleteById(feedbackId);
        deleteMediaFiles(existingMedia);
        refreshNoteLatestFeedback(note);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.IMPROVEMENT_FEEDBACK_DELETED,
                "一条反馈被收起了",
                "「" + note.getTitle() + "」里有一条反馈刚刚被删除了。",
                NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                0L,
                Map.of("noteId", id, "title", note.getTitle(), "feedbackId", feedbackId, "deleted", true)
        );

        log.info("改进反馈删除成功，operator={}, noteId={}, feedbackId={}", operator, id, feedbackId);
        return getNote(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionLikeToggleResponse toggleFeedbackLike(Long id, Long feedbackId) {
        String operator = AuthContext.getRequiredUsername();
        ImprovementNote note = requireNote(id);
        requireFeedback(id, feedbackId);

        List<BizLikeRecord> existingLikes = bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK)
                .eq(BizLikeRecord::getBizId, feedbackId)
                .eq(BizLikeRecord::getUsername, operator));

        boolean liked;
        if (existingLikes.isEmpty()) {
            bizLikeRecordMapper.insert(BizLikeRecord.builder()
                    .bizType(NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK)
                    .bizId(feedbackId)
                    .username(operator)
                    .createdAt(LocalDateTime.now())
                    .build());
            liked = true;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.IMPROVEMENT_FEEDBACK_LIKED,
                    "一条反馈收到了一颗爱心",
                    "「" + note.getTitle() + "」里的一条反馈刚刚被点亮了一次喜欢。",
                    NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                    feedbackId,
                    Map.of("noteId", id, "title", note.getTitle(), "feedbackId", feedbackId, "liked", true)
            );
        } else {
            bizLikeRecordMapper.delete(new LambdaQueryWrapper<BizLikeRecord>()
                    .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK)
                    .eq(BizLikeRecord::getBizId, feedbackId)
                    .eq(BizLikeRecord::getUsername, operator));
            liked = false;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.IMPROVEMENT_FEEDBACK_UNLIKED,
                    "一条反馈少了一颗爱心",
                    "「" + note.getTitle() + "」里的一条反馈刚刚取消了一次点赞。",
                    NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                    feedbackId,
                    Map.of("noteId", id, "title", note.getTitle(), "feedbackId", feedbackId, "liked", false)
            );
        }

        return InteractionLikeToggleResponse.builder()
                .liked(liked)
                .likeCount(recountLikeCount(NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK, feedbackId))
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionCommentResponse addFeedbackComment(Long id, Long feedbackId, InteractionCommentRequest request) {
        String operator = AuthContext.getRequiredUsername();
        ImprovementNote note = requireNote(id);
        requireFeedback(id, feedbackId);

        String content = defaultIfBlank(request.getContent(), "");
        if (!StringUtils.hasText(content)) {
            throw new BusinessException("评论内容不能为空");
        }

        LocalDateTime now = LocalDateTime.now();
        BizCommentRecord comment = BizCommentRecord.builder()
                .bizType(NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK)
                .bizId(feedbackId)
                .username(operator)
                .content(content)
                .createdAt(now)
                .updatedAt(now)
                .build();
        bizCommentRecordMapper.insert(comment);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.IMPROVEMENT_FEEDBACK_COMMENTED,
                "一条反馈下面多了一句回应",
                "「" + note.getTitle() + "」里的一条反馈刚刚收到一条新评论。",
                NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                feedbackId,
                Map.of("noteId", id, "title", note.getTitle(), "feedbackId", feedbackId, "commentId", comment.getId())
        );
        return toCommentResponse(comment, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteFeedbackComment(Long id, Long feedbackId, Long commentId) {
        String operator = AuthContext.getRequiredUsername();
        ImprovementNote note = requireNote(id);
        ImprovementFeedback feedback = requireFeedback(id, feedbackId);
        BizCommentRecord comment = requireComment(NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK, feedbackId, commentId);
        boolean canDelete = operator.equalsIgnoreCase(defaultIfBlank(comment.getUsername(), ""))
                || operator.equalsIgnoreCase(defaultIfBlank(feedback.getCreatorUsername(), ""));
        if (!canDelete) {
            throw new BusinessException("当前没有权限删除这条评论");
        }
        bizCommentRecordMapper.deleteById(commentId);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.IMPROVEMENT_FEEDBACK_COMMENT_DELETED,
                "一条反馈里撤回了一句回应",
                "「" + note.getTitle() + "」里的一条反馈有评论刚刚被删除了。",
                NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                feedbackId,
                Map.of("noteId", id, "title", note.getTitle(), "feedbackId", feedbackId, "commentId", commentId, "deleted", true)
        );
    }

    private ImprovementNote requireNote(Long id) {
        if (id == null) {
            throw new BusinessException("改进记录编号不能为空");
        }
        ImprovementNote note = improvementNoteMapper.selectById(id);
        if (note == null) {
            throw new BusinessException("改进记录不存在");
        }
        return note;
    }

    private ImprovementFeedback requireFeedback(Long noteId, Long feedbackId) {
        if (feedbackId == null) {
            throw new BusinessException("反馈编号不能为空");
        }
        ImprovementFeedback feedback = improvementFeedbackMapper.selectById(feedbackId);
        if (feedback == null || !noteId.equals(feedback.getNoteId())) {
            throw new BusinessException("反馈记录不存在");
        }
        return feedback;
    }

    private void applyRequest(ImprovementNote note, ImprovementNoteRequest request) {
        String title = String.valueOf(request.getTitle()).trim();
        if (!StringUtils.hasText(title)) {
            throw new BusinessException("请先填写事情标题");
        }

        validateMediaList(request.getMediaList(), "主记录");
        note.setTitle(title);
        note.setDescription(defaultIfBlank(request.getDescription(), ""));
        note.setTargetType(normalizeTargetType(request.getTargetType()));
        note.setStatus(normalizeStatus(request.getStatus()));
        note.setStatusEmoji(resolveStatusEmoji(note.getStatus()));
        note.setStartDate(parseDate(request.getStartDate()));
        note.setLatestFeedback(defaultIfBlank(request.getLatestFeedback(), ""));
    }

    private void insertInitialFeedbackIfNecessary(ImprovementNote note, String operator, String latestFeedback) {
        if (!StringUtils.hasText(latestFeedback)) {
            return;
        }
        improvementFeedbackMapper.insert(ImprovementFeedback.builder()
                .noteId(note.getId())
                .status(note.getStatus())
                .statusEmoji(resolveStatusEmoji(note.getStatus()))
                .content(latestFeedback.trim())
                .creatorUsername(operator)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private void validateMediaList(List<ImprovementMediaRequest> mediaList, String label) {
        List<ImprovementMediaRequest> safeList = mediaList == null ? new ArrayList<>() : mediaList;
        long imageCount = safeList.stream().filter(item -> "image".equalsIgnoreCase(item.getMediaType())).count();
        long videoCount = safeList.stream().filter(item -> "video".equalsIgnoreCase(item.getMediaType())).count();
        if (imageCount > MAX_IMAGE_COUNT) {
            throw new BusinessException(label + "图片最多 " + MAX_IMAGE_COUNT + " 张");
        }
        if (videoCount > MAX_VIDEO_COUNT) {
            throw new BusinessException(label + "视频最多 " + MAX_VIDEO_COUNT + " 个");
        }

        for (ImprovementMediaRequest media : safeList) {
            if (!"image".equalsIgnoreCase(media.getMediaType()) && !"video".equalsIgnoreCase(media.getMediaType())) {
                throw new BusinessException(label + "媒体类型不正确");
            }

            String normalizedFileUrl = localFileStorageService.normalizeManagedImprovementPath(media.getFileUrl());
            if (!StringUtils.hasText(normalizedFileUrl)) {
                throw new BusinessException(label + "媒体地址不合法，请重新上传");
            }
            if (StringUtils.hasText(media.getThumbnailUrl())
                    && !StringUtils.hasText(localFileStorageService.normalizeManagedImprovementPath(media.getThumbnailUrl()))) {
                throw new BusinessException(label + "缩略图地址不合法，请重新上传");
            }
        }
    }

    private void replaceNoteMedia(Long noteId, List<ImprovementMedia> existingMedia, List<ImprovementMediaRequest> mediaRequests) {
        replaceMedia(noteId, 0L, existingMedia, mediaRequests);
    }

    private void replaceFeedbackMedia(Long noteId,
                                      Long feedbackId,
                                      List<ImprovementMedia> existingMedia,
                                      List<ImprovementMediaRequest> mediaRequests) {
        validateMediaList(mediaRequests, "反馈");
        replaceMedia(noteId, feedbackId, existingMedia, mediaRequests);
    }

    private void replaceMedia(Long noteId,
                              Long feedbackId,
                              List<ImprovementMedia> existingMedia,
                              List<ImprovementMediaRequest> mediaRequests) {
        LambdaQueryWrapper<ImprovementMedia> deleteWrapper = new LambdaQueryWrapper<ImprovementMedia>()
                .eq(ImprovementMedia::getNoteId, noteId)
                .eq(ImprovementMedia::getFeedbackId, feedbackId == null ? 0L : feedbackId);
        improvementMediaMapper.delete(deleteWrapper);

        List<String> retainedFileUrls = new ArrayList<>();
        List<ImprovementMediaRequest> safeList = mediaRequests == null ? new ArrayList<>() : mediaRequests;
        for (ImprovementMediaRequest request : safeList) {
            String normalizedFileUrl = localFileStorageService.normalizeManagedImprovementPath(request.getFileUrl());
            String normalizedThumbnailUrl = localFileStorageService.normalizeManagedImprovementPath(request.getThumbnailUrl());
            retainedFileUrls.add(normalizedFileUrl);
            if (StringUtils.hasText(normalizedThumbnailUrl)) {
                retainedFileUrls.add(normalizedThumbnailUrl);
            }

            improvementMediaMapper.insert(ImprovementMedia.builder()
                    .noteId(noteId)
                    .feedbackId(feedbackId == null ? 0L : feedbackId)
                    .mediaType(request.getMediaType().toLowerCase(Locale.ROOT))
                    .fileUrl(normalizedFileUrl)
                    .thumbnailUrl(defaultIfBlank(normalizedThumbnailUrl, ""))
                    .sortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder())
                    .build());
        }

        existingMedia.stream()
                .flatMap(item -> {
                    List<String> paths = new ArrayList<>();
                    paths.add(item.getFileUrl());
                    if (StringUtils.hasText(item.getThumbnailUrl())) {
                        paths.add(item.getThumbnailUrl());
                    }
                    return paths.stream();
                })
                .filter(StringUtils::hasText)
                .filter(path -> !retainedFileUrls.contains(path))
                .distinct()
                .forEach(localFileStorageService::deleteImprovementMediaQuietly);
    }

    private List<ImprovementMedia> listMediaEntities(Long noteId, Long feedbackId) {
        return improvementMediaMapper.selectList(new LambdaQueryWrapper<ImprovementMedia>()
                .eq(ImprovementMedia::getNoteId, noteId)
                .eq(ImprovementMedia::getFeedbackId, feedbackId == null ? 0L : feedbackId)
                .orderByAsc(ImprovementMedia::getSortOrder)
                .orderByAsc(ImprovementMedia::getId));
    }

    private List<ImprovementMedia> listAllMediaEntities(Long noteId) {
        return improvementMediaMapper.selectList(new LambdaQueryWrapper<ImprovementMedia>()
                .eq(ImprovementMedia::getNoteId, noteId)
                .orderByAsc(ImprovementMedia::getFeedbackId)
                .orderByAsc(ImprovementMedia::getSortOrder)
                .orderByAsc(ImprovementMedia::getId));
    }

    private List<ImprovementMediaResponse> listNoteMediaResponses(Long noteId) {
        return listMediaEntities(noteId, 0L).stream()
                .map(this::toMediaResponse)
                .collect(Collectors.toList());
    }

    private Map<Long, List<ImprovementMediaResponse>> buildFeedbackMediaMap(List<ImprovementFeedback> feedbackEntities) {
        Map<Long, List<ImprovementMediaResponse>> result = new HashMap<>();
        if (feedbackEntities == null || feedbackEntities.isEmpty()) {
            return result;
        }

        List<Long> feedbackIds = feedbackEntities.stream()
                .map(ImprovementFeedback::getId)
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toList());
        if (feedbackIds.isEmpty()) {
            return result;
        }

        List<ImprovementMedia> mediaList = improvementMediaMapper.selectList(new LambdaQueryWrapper<ImprovementMedia>()
                .in(ImprovementMedia::getFeedbackId, feedbackIds)
                .orderByAsc(ImprovementMedia::getFeedbackId)
                .orderByAsc(ImprovementMedia::getSortOrder)
                .orderByAsc(ImprovementMedia::getId));

        for (ImprovementMedia media : mediaList) {
            result.computeIfAbsent(media.getFeedbackId(), key -> new ArrayList<>()).add(toMediaResponse(media));
        }
        return result;
    }

    private List<ImprovementFeedback> listFeedbackEntities(Long noteId) {
        return improvementFeedbackMapper.selectList(new LambdaQueryWrapper<ImprovementFeedback>()
                .eq(ImprovementFeedback::getNoteId, noteId)
                .orderByDesc(ImprovementFeedback::getCreatedAt)
                .orderByDesc(ImprovementFeedback::getId));
    }

    private ImprovementFeedback getLatestFeedbackEntity(Long noteId) {
        return improvementFeedbackMapper.selectOne(new LambdaQueryWrapper<ImprovementFeedback>()
                .eq(ImprovementFeedback::getNoteId, noteId)
                .orderByDesc(ImprovementFeedback::getCreatedAt)
                .orderByDesc(ImprovementFeedback::getId)
                .last("LIMIT 1"));
    }

    private ImprovementNoteResponse toResponse(ImprovementNote note,
                                               List<ImprovementMediaResponse> mediaList,
                                               List<ImprovementFeedbackResponse> feedbackList,
                                               int feedbackCount,
                                               int todayFeedbackCount,
                                               Map<String, String> nicknameMap) {
        return ImprovementNoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .description(note.getDescription())
                .targetType(note.getTargetType())
                .status(note.getStatus())
                .statusEmoji(resolveStatusEmoji(note.getStatus()))
                .startDate(note.getStartDate() == null ? "" : note.getStartDate().toString())
                .latestFeedback(note.getLatestFeedback())
                .creatorUsername(note.getCreatorUsername())
                .creatorNickname(resolveNickname(note.getCreatorUsername(), nicknameMap))
                .createdAt(formatDateTime(note.getCreatedAt()))
                .updatedAt(formatDateTime(note.getUpdatedAt()))
                .feedbackCount(feedbackCount)
                .todayFeedbackCount(todayFeedbackCount)
                .mediaList(mediaList)
                .feedbackList(feedbackList)
                .build();
    }

    private int countFeedback(Long noteId) {
        return Math.toIntExact(improvementFeedbackMapper.selectCount(new LambdaQueryWrapper<ImprovementFeedback>()
                .eq(ImprovementFeedback::getNoteId, noteId)));
    }

    private int countTodayFeedback(Long noteId) {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime tomorrowStart = todayStart.plusDays(1);
        return Math.toIntExact(improvementFeedbackMapper.selectCount(new LambdaQueryWrapper<ImprovementFeedback>()
                .eq(ImprovementFeedback::getNoteId, noteId)
                .ge(ImprovementFeedback::getCreatedAt, todayStart)
                .lt(ImprovementFeedback::getCreatedAt, tomorrowStart)));
    }

    private ImprovementFeedbackResponse toFeedbackResponse(ImprovementFeedback feedback,
                                                           List<ImprovementMediaResponse> mediaList,
                                                           Map<String, String> nicknameMap,
                                                           String currentUsername) {
        List<InteractionLikeUserResponse> likeUsers = buildLikeUserResponses(
                NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                feedback.getId(),
                nicknameMap
        );
        List<InteractionCommentResponse> commentList = listCommentResponses(
                NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                feedback.getId(),
                nicknameMap
        );
        boolean likedByCurrentUser = likeUsers.stream()
                .anyMatch(item -> currentUsername.equalsIgnoreCase(item.getUsername()));
        return ImprovementFeedbackResponse.builder()
                .id(feedback.getId())
                .status(feedback.getStatus())
                .statusEmoji(resolveStatusEmoji(feedback.getStatus()))
                .content(feedback.getContent())
                .creatorUsername(feedback.getCreatorUsername())
                .creatorNickname(resolveNickname(feedback.getCreatorUsername(), nicknameMap))
                .createdAt(formatDateTime(feedback.getCreatedAt()))
                .likeCount(likeUsers.size())
                .likedByCurrentUser(likedByCurrentUser)
                .mediaList(mediaList)
                .likeUsers(likeUsers)
                .commentList(commentList)
                .build();
    }

    private ImprovementMediaResponse toMediaResponse(ImprovementMedia media) {
        return ImprovementMediaResponse.builder()
                .id(media.getId())
                .mediaType(media.getMediaType())
                .fileUrl(media.getFileUrl())
                .thumbnailUrl(media.getThumbnailUrl())
                .sortOrder(media.getSortOrder())
                .build();
    }

    private Map<String, String> buildNicknameMap() {
        Map<String, String> nicknameMap = new HashMap<>();
        for (CoupleProfile profile : coupleProfileMapper.selectList(null)) {
            nicknameMap.put(profile.getUsername(), profile.getNickname());
        }
        return nicknameMap;
    }

    private List<BizLikeRecord> listLikeEntities(String bizType, Long bizId) {
        return bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, bizType)
                .eq(BizLikeRecord::getBizId, bizId)
                .orderByAsc(BizLikeRecord::getCreatedAt)
                .orderByAsc(BizLikeRecord::getId));
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
                    .nickname(resolveNickname(username, nicknameMap))
                    .likeTimes(1L)
                    .lastLikedAt(formatDateTime(like.getCreatedAt()))
                    .build());
        }
        return new ArrayList<>(result.values());
    }

    private long recountLikeCount(String bizType, Long bizId) {
        return listLikeEntities(bizType, bizId).stream()
                .map(record -> defaultIfBlank(record.getUsername(), ""))
                .filter(StringUtils::hasText)
                .distinct()
                .count();
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
        if (comment == null || !bizType.equals(defaultIfBlank(comment.getBizType(), "")) || !bizId.equals(comment.getBizId())) {
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

    private InteractionCommentResponse toCommentResponse(BizCommentRecord comment, Map<String, String> nicknameMap) {
        return InteractionCommentResponse.builder()
                .id(comment.getId())
                .commenterUsername(comment.getUsername())
                .commenterNickname(resolveNickname(comment.getUsername(), nicknameMap))
                .content(defaultIfBlank(comment.getContent(), ""))
                .createdAt(formatDateTime(comment.getCreatedAt()))
                .updatedAt(formatDateTime(comment.getUpdatedAt()))
                .build();
    }

    private void deleteMediaFiles(List<ImprovementMedia> mediaList) {
        mediaList.stream()
                .flatMap(item -> {
                    List<String> paths = new ArrayList<>();
                    paths.add(item.getFileUrl());
                    if (StringUtils.hasText(item.getThumbnailUrl())) {
                        paths.add(item.getThumbnailUrl());
                    }
                    return paths.stream();
                })
                .filter(StringUtils::hasText)
                .distinct()
                .forEach(localFileStorageService::deleteImprovementMediaQuietly);
    }

    private void updateNoteLatestFeedback(ImprovementNote note, String status, String feedbackContent) {
        note.setStatus(status);
        note.setStatusEmoji(resolveStatusEmoji(status));
        note.setLatestFeedback(feedbackContent);
        note.setUpdatedAt(LocalDateTime.now());
        improvementNoteMapper.updateById(note);
    }

    private void refreshNoteLatestFeedback(ImprovementNote note) {
        ImprovementFeedback latestFeedback = getLatestFeedbackEntity(note.getId());
        if (latestFeedback == null) {
            note.setLatestFeedback("");
            note.setUpdatedAt(LocalDateTime.now());
            improvementNoteMapper.updateById(note);
            return;
        }
        updateNoteLatestFeedback(note, latestFeedback.getStatus(), latestFeedback.getContent());
    }

    private String resolveNickname(String username, Map<String, String> nicknameMap) {
        if (!StringUtils.hasText(username)) {
            return "";
        }
        return nicknameMap.getOrDefault(username, username);
    }

    private String normalizeTargetType(String targetType) {
        String value = defaultIfBlank(targetType, "both").toLowerCase(Locale.ROOT);
        switch (value) {
            case "me":
            case "lover":
            case "both":
                return value;
            default:
                throw new BusinessException("改进对象类型不正确");
        }
    }

    private String normalizeStatus(String status) {
        String value = defaultIfBlank(status, "improving").toLowerCase(Locale.ROOT);
        switch (value) {
            case "resolved":
            case "improving":
            case "pending":
                return value;
            default:
                throw new BusinessException("改进状态不正确");
        }
    }

    private String resolveStatusEmoji(String status) {
        switch (status) {
            case "resolved":
                return "😊";
            case "pending":
                return "😕";
            default:
                return "❤️";
        }
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception exception) {
            throw new BusinessException("开始日期格式不正确");
        }
    }

    private String formatDateTime(LocalDateTime time) {
        return time == null ? "" : time.format(DATE_TIME_FORMATTER);
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }
}

