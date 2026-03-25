package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.common.NotificationTypeConstants;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.entity.ImprovementFeedback;
import org.love.romantic.entity.ImprovementMedia;
import org.love.romantic.entity.ImprovementNote;
import org.love.romantic.exception.BusinessException;
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
    private final CoupleProfileMapper coupleProfileMapper;
    private final LocalFileStorageService localFileStorageService;
    private final UserNotificationService userNotificationService;

    public ImprovementNoteServiceImpl(ImprovementNoteMapper improvementNoteMapper,
                                      ImprovementFeedbackMapper improvementFeedbackMapper,
                                      ImprovementMediaMapper improvementMediaMapper,
                                      CoupleProfileMapper coupleProfileMapper,
                                      LocalFileStorageService localFileStorageService,
                                      UserNotificationService userNotificationService) {
        this.improvementNoteMapper = improvementNoteMapper;
        this.improvementFeedbackMapper = improvementFeedbackMapper;
        this.improvementMediaMapper = improvementMediaMapper;
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
        ImprovementNote note = requireNote(id);
        Map<String, String> nicknameMap = buildNicknameMap();
        List<ImprovementFeedback> feedbackEntities = listFeedbackEntities(id);
        Map<Long, List<ImprovementMediaResponse>> feedbackMediaMap = buildFeedbackMediaMap(feedbackEntities);
        List<ImprovementFeedbackResponse> feedbackList = feedbackEntities.stream()
                .map(feedback -> toFeedbackResponse(feedback, feedbackMediaMap.getOrDefault(feedback.getId(), new ArrayList<>()), nicknameMap))
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
                "\u5199\u4e0b\u4e86\u4e00\u6761\u65b0\u7684\u6539\u8fdb\u8bb0\u5f55",
                "\u300c" + note.getTitle() + "\u300d\u5df2\u7ecf\u88ab\u8ba4\u771f\u653e\u8fdb\u604b\u7231\u6539\u8fdb\u7c3f\u91cc\u3002",
                NotificationBizTypeConstants.IMPROVEMENT_NOTE,
                note.getId(),
                Map.of("title", note.getTitle())
        );
        log.info("闂佸憡甯楃粙鎴犵磽閹捐绠掗悗锝庡墮閻撳啴鏌￠埀顒傛兜閸涱垳顔掔紓浣靛姀閸庡顢欓崶顏備汗闁哄洨鍠庨悘鍥煕閺冨倸娅愮紒杈ㄧ床reator={}, noteId={}", operator, note.getId());
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
                "\u6539\u8fdb\u8bb0\u5f55\u6709\u4e86\u65b0\u53d8\u5316",
                "\u300c" + note.getTitle() + "\u300d\u521a\u521a\u88ab\u91cd\u65b0\u6574\u7406\u4e86\u4e00\u6b21\u3002",
                NotificationBizTypeConstants.IMPROVEMENT_NOTE,
                note.getId(),
                Map.of("title", note.getTitle())
        );
        log.info("闂佸搫娲ら悺銊╁蓟婵犲洤绠掗悗锝庡墮閻撳啴鏌￠埀顒傛兜閸涱垳顔掔紓浣靛姀閸庡顢欓崶顏備汗闁哄洨鍠庨悘鍥煕閺冨倸娅愮紒杈ㄧ睄perator={}, noteId={}", operator, id);
        return getNote(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteNote(Long id) {
        String operator = AuthContext.getRequiredUsername();
        requireNote(id);
        List<ImprovementMedia> existingMedia = listAllMediaEntities(id);
        improvementMediaMapper.delete(new LambdaQueryWrapper<ImprovementMedia>().eq(ImprovementMedia::getNoteId, id));
        improvementFeedbackMapper.delete(new LambdaQueryWrapper<ImprovementFeedback>().eq(ImprovementFeedback::getNoteId, id));
        improvementNoteMapper.deleteById(id);
        deleteMediaFiles(existingMedia);
        log.info("闂佸憡甯炴繛鈧繛鍛叄楠炰胶鈧綆鍓欓悡鍐煛閳ь剛娑甸崨顖滎啋缂備降鍔忛崕濠氼敊閸ヮ亗浜归柡鍥╁枎閻忓洭鏌涢弮鍌氭珢缂佽鲸绫峱erator={}, noteId={}", operator, id);
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
                "\u6536\u5230\u4e86\u65b0\u7684\u53cd\u9988",
                "\u300c" + note.getTitle() + "\u300d\u521a\u521a\u591a\u4e86\u4e00\u6761\u65b0\u7684\u53cd\u9988\u8bb0\u5f55\u3002",
                NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                feedback.getId(),
                Map.of("noteId", id, "title", note.getTitle())
        );
        log.info("闁哄鏅炲Λ鍕叏閻愬搫绠掗悗锝庡墮閻撳啴鏌￠埀顒傛兜閸涱垳顔掔紓浣靛妼閻忔繂顕ｉ懞銉磾闁割偆鍠庨悘鍥煕閺冨倸娅愮紒杈ㄧ睄perator={}, noteId={}, feedbackId={}", operator, id, feedback.getId());
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
                "\u53cd\u9988\u5185\u5bb9\u66f4\u65b0\u4e86",
                "\u300c" + note.getTitle() + "\u300d\u7684\u53cd\u9988\u5185\u5bb9\u521a\u521a\u88ab\u8c03\u6574\u8fc7\u3002",
                NotificationBizTypeConstants.IMPROVEMENT_FEEDBACK,
                feedbackId,
                Map.of("noteId", id, "title", note.getTitle())
        );
        log.info("缂傚倸鍊归悧鐐垫椤愶箑绠掗悗锝庡墮閻撳啴鏌￠埀顒傛兜閸涱垳顔掔紓浣靛妼閻忔繂顕ｉ懞銉磾闁割偆鍠庨悘鍥煕閺冨倸娅愮紒杈ㄧ睄perator={}, noteId={}, feedbackId={}", operator, id, feedbackId);
        return getNote(id);
    }

    private ImprovementNote requireNote(Long id) {
        if (id == null) {
            throw new BusinessException("闂佽　鍋撶痪顓炴噽缁犲鎮规担瑙勭凡缂傚秴绉剁槐鎾诲冀瑜嶆繛鍥р槈閹惧磭啸闁稿繑蓱缁嬪鎼归崗澶嬫櫈");
        }
        ImprovementNote note = improvementNoteMapper.selectById(id);
        if (note == null) {
            throw new BusinessException("\u6539\u8fdb\u8bb0\u5f55\u4e0d\u5b58\u5728");
        }
        return note;
    }

    private ImprovementFeedback requireFeedback(Long noteId, Long feedbackId) {
        if (feedbackId == null) {
            throw new BusinessException("\u53cd\u9988\u7f16\u53f7\u4e0d\u80fd\u4e3a\u7a7a");
        }
        ImprovementFeedback feedback = improvementFeedbackMapper.selectById(feedbackId);
        if (feedback == null || !noteId.equals(feedback.getNoteId())) {
            throw new BusinessException("\u53cd\u9988\u8bb0\u5f55\u4e0d\u5b58\u5728");
        }
        return feedback;
    }

    private void applyRequest(ImprovementNote note, ImprovementNoteRequest request) {
        String title = String.valueOf(request.getTitle()).trim();
        if (!StringUtils.hasText(title)) {
            throw new BusinessException("\u8bf7\u5148\u586b\u5199\u4e8b\u60c5\u6807\u9898");
        }

        validateMediaList(request.getMediaList(), "\u4e3b\u8bb0\u5f55");
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
            throw new BusinessException(label + "\u56fe\u7247\u6700\u591a " + MAX_IMAGE_COUNT + " \u5f20");
        }
        if (videoCount > MAX_VIDEO_COUNT) {
            throw new BusinessException(label + "\u89c6\u9891\u6700\u591a " + MAX_VIDEO_COUNT + " \u4e2a");
        }

        for (ImprovementMediaRequest media : safeList) {
            if (!"image".equalsIgnoreCase(media.getMediaType()) && !"video".equalsIgnoreCase(media.getMediaType())) {
                throw new BusinessException(label + "\u5a92\u4f53\u7c7b\u578b\u4e0d\u6b63\u786e");
            }

            String normalizedFileUrl = localFileStorageService.normalizeManagedImprovementPath(media.getFileUrl());
            if (!StringUtils.hasText(normalizedFileUrl)) {
                throw new BusinessException(label + "\u5a92\u4f53\u5730\u5740\u4e0d\u5408\u6cd5\uff0c\u8bf7\u91cd\u65b0\u4e0a\u4f20");
            }
            if (StringUtils.hasText(media.getThumbnailUrl())
                    && !StringUtils.hasText(localFileStorageService.normalizeManagedImprovementPath(media.getThumbnailUrl()))) {
                throw new BusinessException(label + "\u7f29\u7565\u56fe\u5730\u5740\u4e0d\u5408\u6cd5\uff0c\u8bf7\u91cd\u65b0\u4e0a\u4f20");
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
        validateMediaList(mediaRequests, "\u53cd\u9988");
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
                                                           Map<String, String> nicknameMap) {
        return ImprovementFeedbackResponse.builder()
                .id(feedback.getId())
                .status(feedback.getStatus())
                .statusEmoji(resolveStatusEmoji(feedback.getStatus()))
                .content(feedback.getContent())
                .creatorUsername(feedback.getCreatorUsername())
                .creatorNickname(resolveNickname(feedback.getCreatorUsername(), nicknameMap))
                .createdAt(formatDateTime(feedback.getCreatedAt()))
                .mediaList(mediaList)
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
                throw new BusinessException("\u6539\u8fdb\u5bf9\u8c61\u7c7b\u578b\u4e0d\u6b63\u786e");
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
                throw new BusinessException("\u6539\u8fdb\u72b6\u6001\u4e0d\u6b63\u786e");
        }
    }

    private String resolveStatusEmoji(String status) {
        switch (status) {
            case "resolved":
                return "\uD83D\uDE0A";
            case "pending":
                return "\uD83D\uDE15";
            default:
                return "\u2764\uFE0F";
        }
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception exception) {
            throw new BusinessException("\u5f00\u59cb\u65e5\u671f\u683c\u5f0f\u4e0d\u6b63\u786e");
        }
    }

    private String formatDateTime(LocalDateTime time) {
        return time == null ? "" : time.format(DATE_TIME_FORMATTER);
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }
}

