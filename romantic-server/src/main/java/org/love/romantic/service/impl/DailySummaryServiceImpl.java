package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.common.NotificationTypeConstants;
import org.love.romantic.entity.BizCommentRecord;
import org.love.romantic.entity.BizLikeRecord;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.entity.DailySummary;
import org.love.romantic.entity.DailySummaryEntry;
import org.love.romantic.entity.DailySummaryMedia;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.BizCommentRecordMapper;
import org.love.romantic.mapper.BizLikeRecordMapper;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.mapper.DailySummaryEntryMapper;
import org.love.romantic.mapper.DailySummaryMapper;
import org.love.romantic.mapper.DailySummaryMediaMapper;
import org.love.romantic.model.DailySummaryEntryMediaRequest;
import org.love.romantic.model.DailySummaryEntryMediaResponse;
import org.love.romantic.model.DailySummaryEntryRequest;
import org.love.romantic.model.DailySummaryEntryResponse;
import org.love.romantic.model.DailySummaryHistoryItemResponse;
import org.love.romantic.model.DailySummaryResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.InteractionLikeUserResponse;
import org.love.romantic.service.DailySummaryService;
import org.love.romantic.service.LocalFileStorageService;
import org.love.romantic.service.UserNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 今日小计服务实现。
 * 第二版按“按天成页、页内多条记录”设计，并支持点赞、评论、图片/视频上传和历史查看。
 */
@Slf4j
@Service
public class DailySummaryServiceImpl implements DailySummaryService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final String DEFAULT_MOOD = "gentle";
    private static final int MAX_IMAGE_COUNT = 9;
    private static final int MAX_VIDEO_COUNT = 1;

    private final DailySummaryMapper dailySummaryMapper;
    private final DailySummaryEntryMapper dailySummaryEntryMapper;
    private final DailySummaryMediaMapper dailySummaryMediaMapper;
    private final BizLikeRecordMapper bizLikeRecordMapper;
    private final BizCommentRecordMapper bizCommentRecordMapper;
    private final CoupleProfileMapper coupleProfileMapper;
    private final LocalFileStorageService localFileStorageService;
    private final UserNotificationService userNotificationService;

    public DailySummaryServiceImpl(DailySummaryMapper dailySummaryMapper,
                                   DailySummaryEntryMapper dailySummaryEntryMapper,
                                   DailySummaryMediaMapper dailySummaryMediaMapper,
                                   BizLikeRecordMapper bizLikeRecordMapper,
                                   BizCommentRecordMapper bizCommentRecordMapper,
                                   CoupleProfileMapper coupleProfileMapper,
                                   LocalFileStorageService localFileStorageService,
                                   UserNotificationService userNotificationService) {
        this.dailySummaryMapper = dailySummaryMapper;
        this.dailySummaryEntryMapper = dailySummaryEntryMapper;
        this.dailySummaryMediaMapper = dailySummaryMediaMapper;
        this.bizLikeRecordMapper = bizLikeRecordMapper;
        this.bizCommentRecordMapper = bizCommentRecordMapper;
        this.coupleProfileMapper = coupleProfileMapper;
        this.localFileStorageService = localFileStorageService;
        this.userNotificationService = userNotificationService;
    }

    @Override
    public DailySummaryResponse getTodaySummary() {
        return buildSummaryResponse(LocalDate.now());
    }

    @Override
    public DailySummaryResponse getSummaryByDate(String summaryDate) {
        return buildSummaryResponse(parseDate(summaryDate));
    }

    @Override
    public List<DailySummaryHistoryItemResponse> listHistory() {
        return buildHistoryResponses();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DailySummaryResponse createEntry(String summaryDate, DailySummaryEntryRequest request) {
        String operator = AuthContext.getRequiredUsername();
        LocalDate date = parseDate(summaryDate);
        LocalDateTime now = LocalDateTime.now();
        DailySummary summary = getOrCreateSummary(date, operator, now);

        DailySummaryEntry entry = DailySummaryEntry.builder()
                .summaryId(summary.getId())
                .creatorUsername(operator)
                .createdAt(now)
                .updatedAt(now)
                .build();
        applyEntryRequest(entry, request, now);
        dailySummaryEntryMapper.insert(entry);
        replaceEntryMedia(entry.getId(), new ArrayList<>(), safeMediaList(request.getMediaList()));
        refreshSummaryPreview(summary.getId());
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.DAILY_SUMMARY_ENTRY_CREATED,
                "今日小计多写下了一条心情",
                formatSummaryDay(date) + "刚刚新增了一条今日小计。",
                NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY,
                entry.getId(),
                buildEntryNotificationPayload(summary.getId(), entry.getId(), date)
        );
        log.info("今日小计条目创建成功，operator={}, summaryId={}, entryId={}", operator, summary.getId(), entry.getId());
        return buildSummaryResponse(date);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DailySummaryResponse updateEntry(Long summaryId, Long entryId, DailySummaryEntryRequest request) {
        String operator = AuthContext.getRequiredUsername();
        DailySummary summary = requireSummary(summaryId);
        DailySummaryEntry entry = requireEntry(summaryId, entryId);
        List<DailySummaryMedia> existingMedia = listMediaEntities(entryId);

        applyEntryRequest(entry, request, LocalDateTime.now());
        dailySummaryEntryMapper.updateById(entry);
        replaceEntryMedia(entryId, existingMedia, safeMediaList(request.getMediaList()));
        refreshSummaryPreview(summaryId);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.DAILY_SUMMARY_ENTRY_UPDATED,
                "今日小计有了新的补充",
                formatSummaryDay(summary.getSummaryDate()) + "的今日小计刚刚更新过。",
                NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY,
                entryId,
                buildEntryNotificationPayload(summaryId, entryId, summary.getSummaryDate())
        );
        log.info("今日小计条目更新成功，operator={}, summaryId={}, entryId={}", operator, summaryId, entryId);
        return buildSummaryResponse(summary.getSummaryDate());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionLikeToggleResponse toggleEntryLike(Long summaryId, Long entryId) {
        String operator = AuthContext.getRequiredUsername();
        DailySummary summary = requireSummary(summaryId);
        requireEntry(summaryId, entryId);

        List<BizLikeRecord> existingLikes = bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY)
                .eq(BizLikeRecord::getBizId, entryId)
                .eq(BizLikeRecord::getUsername, operator));

        boolean liked;
        if (existingLikes.isEmpty()) {
            bizLikeRecordMapper.insert(BizLikeRecord.builder()
                    .bizType(NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY)
                    .bizId(entryId)
                    .username(operator)
                    .createdAt(LocalDateTime.now())
                    .build());
            liked = true;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.DAILY_SUMMARY_ENTRY_LIKED,
                    "今日小计收到了一颗爱心",
                    formatSummaryDay(summary.getSummaryDate()) + "的这条小计刚刚被点亮了一次喜欢。",
                    NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY,
                    entryId,
                    buildEntryNotificationPayload(summaryId, entryId, summary.getSummaryDate(), Map.of("liked", true))
            );
        } else {
            bizLikeRecordMapper.delete(new LambdaQueryWrapper<BizLikeRecord>()
                    .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY)
                    .eq(BizLikeRecord::getBizId, entryId)
                    .eq(BizLikeRecord::getUsername, operator));
            liked = false;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.DAILY_SUMMARY_ENTRY_UNLIKED,
                    "今日小计少了一颗爱心",
                    formatSummaryDay(summary.getSummaryDate()) + "的这条小计刚刚取消了一次点赞。",
                    NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY,
                    entryId,
                    buildEntryNotificationPayload(summaryId, entryId, summary.getSummaryDate(), Map.of("liked", false))
            );
        }

        return InteractionLikeToggleResponse.builder()
                .liked(liked)
                .likeCount(recountLikeCount(NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY, entryId))
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionCommentResponse addEntryComment(Long summaryId, Long entryId, InteractionCommentRequest request) {
        String operator = AuthContext.getRequiredUsername();
        DailySummary summary = requireSummary(summaryId);
        requireEntry(summaryId, entryId);

        String content = defaultIfBlank(request.getContent(), "");
        if (!StringUtils.hasText(content)) {
            throw new BusinessException("评论内容不能为空");
        }

        LocalDateTime now = LocalDateTime.now();
        BizCommentRecord comment = BizCommentRecord.builder()
                .bizType(NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY)
                .bizId(entryId)
                .username(operator)
                .content(content)
                .createdAt(now)
                .updatedAt(now)
                .build();
        bizCommentRecordMapper.insert(comment);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.DAILY_SUMMARY_ENTRY_COMMENTED,
                "今日小计下面多了一句回应",
                formatSummaryDay(summary.getSummaryDate()) + "的这条小计刚刚收到一条新评论。",
                NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY,
                entryId,
                buildEntryNotificationPayload(summaryId, entryId, summary.getSummaryDate(), Map.of("commentId", comment.getId()))
        );
        return toCommentResponse(comment, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteEntryComment(Long summaryId, Long entryId, Long commentId) {
        String operator = AuthContext.getRequiredUsername();
        DailySummary summary = requireSummary(summaryId);
        DailySummaryEntry entry = requireEntry(summaryId, entryId);
        BizCommentRecord comment = requireComment(NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY, entryId, commentId);
        boolean canDelete = operator.equalsIgnoreCase(defaultIfBlank(comment.getUsername(), ""))
                || operator.equalsIgnoreCase(defaultIfBlank(entry.getCreatorUsername(), ""));
        if (!canDelete) {
            throw new BusinessException("当前没有权限删除这条评论");
        }
        bizCommentRecordMapper.deleteById(commentId);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.DAILY_SUMMARY_ENTRY_COMMENT_DELETED,
                "今日小计里撤回了一句回应",
                formatSummaryDay(summary.getSummaryDate()) + "的这条小计有一条评论刚刚被删除了。",
                NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY,
                entryId,
                buildEntryNotificationPayload(summaryId, entryId, summary.getSummaryDate(), Map.of("commentId", commentId, "deleted", true))
        );
    }

    private DailySummaryResponse buildSummaryResponse(LocalDate date) {
        DailySummary summary = findByDate(date);
        List<DailySummaryHistoryItemResponse> historyList = buildHistoryResponses();
        if (summary == null) {
            return DailySummaryResponse.builder()
                    .id(null)
                    .summaryDate(formatDate(date))
                    .mood(DEFAULT_MOOD)
                    .content("")
                    .hasRecord(false)
                    .entryCount(0)
                    .creatorUsername("")
                    .updaterUsername("")
                    .updatedAt("")
                    .likeCount(0L)
                    .likedByCurrentUser(false)
                    .likeUsers(new ArrayList<>())
                    .commentList(new ArrayList<>())
                    .entryList(new ArrayList<>())
                    .historyList(historyList)
                    .build();
        }

        Map<String, String> nicknameMap = buildNicknameMap();
        List<DailySummaryEntryResponse> entryList = listEntryResponses(summary.getId(), nicknameMap);

        return DailySummaryResponse.builder()
                .id(summary.getId())
                .summaryDate(formatDate(summary.getSummaryDate()))
                .mood(normalizeMood(summary.getMood()))
                .content(defaultIfBlank(summary.getContent(), ""))
                .hasRecord(!entryList.isEmpty())
                .entryCount(entryList.size())
                .creatorUsername(defaultIfBlank(summary.getCreatorUsername(), ""))
                .updaterUsername(defaultIfBlank(summary.getUpdatedBy(), ""))
                .updatedAt(formatDateTime(summary.getUpdatedAt()))
                .likeCount(0L)
                .likedByCurrentUser(false)
                .likeUsers(new ArrayList<>())
                .commentList(new ArrayList<>())
                .entryList(entryList)
                .historyList(historyList)
                .build();
    }

    private DailySummary getOrCreateSummary(LocalDate date, String operator, LocalDateTime now) {
        DailySummary summary = findByDate(date);
        if (summary != null) {
            return summary;
        }
        summary = DailySummary.builder()
                .summaryDate(date)
                .mood(DEFAULT_MOOD)
                .content("")
                .creatorUsername(operator)
                .updatedBy(operator)
                .createdAt(now)
                .updatedAt(now)
                .build();
        dailySummaryMapper.insert(summary);
        return summary;
    }

    private DailySummary findByDate(LocalDate summaryDate) {
        return dailySummaryMapper.selectOne(new LambdaQueryWrapper<DailySummary>()
                .eq(DailySummary::getSummaryDate, summaryDate)
                .last("LIMIT 1"));
    }

    private DailySummary requireSummary(Long summaryId) {
        if (summaryId == null) {
            throw new BusinessException("今日小计编号不能为空");
        }
        DailySummary summary = dailySummaryMapper.selectById(summaryId);
        if (summary == null) {
            throw new BusinessException("今日小计不存在");
        }
        return summary;
    }

    private DailySummaryEntry requireEntry(Long summaryId, Long entryId) {
        if (entryId == null) {
            throw new BusinessException("小计条目编号不能为空");
        }
        DailySummaryEntry entry = dailySummaryEntryMapper.selectById(entryId);
        if (entry == null || !summaryId.equals(entry.getSummaryId())) {
            throw new BusinessException("小计条目不存在");
        }
        return entry;
    }

    private void applyEntryRequest(DailySummaryEntry entry, DailySummaryEntryRequest request, LocalDateTime now) {
        List<DailySummaryEntryMediaRequest> mediaList = safeMediaList(request.getMediaList());
        validateMediaList(mediaList);
        entry.setMood(normalizeMood(request.getMood()));
        entry.setContent(defaultIfBlank(request.getContent(), ""));
        entry.setUpdatedAt(now);
        if (entry.getCreatedAt() == null) {
            entry.setCreatedAt(now);
        }
    }

    private List<DailySummaryEntryMediaRequest> safeMediaList(List<DailySummaryEntryMediaRequest> mediaList) {
        return mediaList == null ? new ArrayList<>() : mediaList;
    }

    private void validateMediaList(List<DailySummaryEntryMediaRequest> mediaList) {
        long imageCount = mediaList.stream().filter(item -> "image".equalsIgnoreCase(item.getMediaType())).count();
        long videoCount = mediaList.stream().filter(item -> "video".equalsIgnoreCase(item.getMediaType())).count();
        if (imageCount > MAX_IMAGE_COUNT) {
            throw new BusinessException("今日小计图片最多 9 张");
        }
        if (videoCount > MAX_VIDEO_COUNT) {
            throw new BusinessException("今日小计视频最多 1 个");
        }
        for (DailySummaryEntryMediaRequest media : mediaList) {
            if (!"image".equalsIgnoreCase(media.getMediaType()) && !"video".equalsIgnoreCase(media.getMediaType())) {
                throw new BusinessException("今日小计媒体类型不正确");
            }
            String normalizedFileUrl = localFileStorageService.normalizeManagedDailySummaryPath(media.getFileUrl());
            if (normalizedFileUrl == null) {
                throw new BusinessException("今日小计媒体地址不合法，请重新上传");
            }
            if (StringUtils.hasText(media.getThumbnailUrl())
                    && localFileStorageService.normalizeManagedDailySummaryPath(media.getThumbnailUrl()) == null) {
                throw new BusinessException("今日小计缩略图地址不合法，请重新上传");
            }
        }
    }

    private void replaceEntryMedia(Long entryId,
                                   List<DailySummaryMedia> existingMedia,
                                   List<DailySummaryEntryMediaRequest> newMediaRequests) {
        dailySummaryMediaMapper.delete(new LambdaQueryWrapper<DailySummaryMedia>().eq(DailySummaryMedia::getEntryId, entryId));

        List<String> newFileUrls = newMediaRequests.stream().map(DailySummaryEntryMediaRequest::getFileUrl).collect(Collectors.toList());
        List<String> newThumbnailUrls = newMediaRequests.stream()
                .map(DailySummaryEntryMediaRequest::getThumbnailUrl)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());

        for (DailySummaryEntryMediaRequest request : newMediaRequests) {
            dailySummaryMediaMapper.insert(DailySummaryMedia.builder()
                    .entryId(entryId)
                    .mediaType(request.getMediaType().toLowerCase(Locale.ROOT))
                    .fileUrl(localFileStorageService.normalizeManagedDailySummaryPath(request.getFileUrl()))
                    .thumbnailUrl(localFileStorageService.normalizeManagedDailySummaryPath(request.getThumbnailUrl()))
                    .sortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder())
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        existingMedia.forEach(item -> {
            if (!newFileUrls.contains(item.getFileUrl())) {
                localFileStorageService.deleteDailySummaryMediaQuietly(item.getFileUrl());
            }
            if (StringUtils.hasText(item.getThumbnailUrl()) && !newThumbnailUrls.contains(item.getThumbnailUrl())) {
                localFileStorageService.deleteDailySummaryMediaQuietly(item.getThumbnailUrl());
            }
        });
    }

    private void refreshSummaryPreview(Long summaryId) {
        DailySummary summary = requireSummary(summaryId);
        List<DailySummaryEntry> entries = listEntryEntities(summaryId);
        if (entries.isEmpty()) {
            summary.setMood(DEFAULT_MOOD);
            summary.setContent("");
            summary.setUpdatedAt(LocalDateTime.now());
            dailySummaryMapper.updateById(summary);
            return;
        }
        DailySummaryEntry latestEntry = entries.get(0);
        summary.setMood(normalizeMood(latestEntry.getMood()));
        summary.setContent(defaultIfBlank(latestEntry.getContent(), ""));
        summary.setUpdatedBy(defaultIfBlank(latestEntry.getCreatorUsername(), summary.getUpdatedBy()));
        summary.setUpdatedAt(latestEntry.getUpdatedAt());
        dailySummaryMapper.updateById(summary);
    }

    private List<DailySummaryEntry> listEntryEntities(Long summaryId) {
        return dailySummaryEntryMapper.selectList(new LambdaQueryWrapper<DailySummaryEntry>()
                .eq(DailySummaryEntry::getSummaryId, summaryId)
                .orderByDesc(DailySummaryEntry::getUpdatedAt)
                .orderByDesc(DailySummaryEntry::getId));
    }

    private List<DailySummaryMedia> listMediaEntities(Long entryId) {
        return dailySummaryMediaMapper.selectList(new LambdaQueryWrapper<DailySummaryMedia>()
                .eq(DailySummaryMedia::getEntryId, entryId)
                .orderByAsc(DailySummaryMedia::getSortOrder)
                .orderByAsc(DailySummaryMedia::getId));
    }

    private List<DailySummaryEntryResponse> listEntryResponses(Long summaryId, Map<String, String> nicknameMap) {
        String currentUsername = AuthContext.getRequiredUsername();
        return listEntryEntities(summaryId).stream()
                .map(entry -> {
                    List<InteractionLikeUserResponse> likeUsers = buildLikeUserResponses(
                            NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY,
                            entry.getId(),
                            nicknameMap
                    );
                    List<InteractionCommentResponse> commentList = listCommentResponses(
                            NotificationBizTypeConstants.DAILY_SUMMARY_ENTRY,
                            entry.getId(),
                            nicknameMap
                    );
                    boolean likedByCurrentUser = likeUsers.stream()
                            .anyMatch(item -> currentUsername.equalsIgnoreCase(item.getUsername()));

                    return DailySummaryEntryResponse.builder()
                            .id(entry.getId())
                            .mood(normalizeMood(entry.getMood()))
                            .content(defaultIfBlank(entry.getContent(), ""))
                            .creatorUsername(defaultIfBlank(entry.getCreatorUsername(), ""))
                            .creatorNickname(resolveNickname(entry.getCreatorUsername(), nicknameMap))
                            .createdAt(formatDateTime(entry.getCreatedAt()))
                            .updatedAt(formatDateTime(entry.getUpdatedAt()))
                            .likeCount((long) likeUsers.size())
                            .likedByCurrentUser(likedByCurrentUser)
                            .likeUsers(likeUsers)
                            .commentList(commentList)
                            .mediaList(listMediaResponses(entry.getId()))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<DailySummaryEntryMediaResponse> listMediaResponses(Long entryId) {
        return listMediaEntities(entryId).stream()
                .map(media -> DailySummaryEntryMediaResponse.builder()
                        .id(media.getId())
                        .mediaType(media.getMediaType())
                        .fileUrl(defaultIfBlank(media.getFileUrl(), ""))
                        .thumbnailUrl(defaultIfBlank(media.getThumbnailUrl(), ""))
                        .sortOrder(media.getSortOrder())
                        .build())
                .collect(Collectors.toList());
    }

    private List<DailySummaryHistoryItemResponse> buildHistoryResponses() {
        Map<Long, Integer> entryCountMap = buildEntryCountMap();
        Map<Long, DailySummaryEntry> latestEntryMap = buildLatestEntryMap();
        Map<String, String> nicknameMap = buildNicknameMap();
        return dailySummaryMapper.selectList(new LambdaQueryWrapper<DailySummary>()
                        .orderByDesc(DailySummary::getSummaryDate)
                        .orderByDesc(DailySummary::getUpdatedAt)
                        .orderByDesc(DailySummary::getId))
                .stream()
                .map(item -> DailySummaryHistoryItemResponse.builder()
                        .id(item.getId())
                        .summaryDate(formatDate(item.getSummaryDate()))
                        .mood(normalizeMood(item.getMood()))
                        .content(defaultIfBlank(item.getContent(), ""))
                        .entryCount(entryCountMap.getOrDefault(item.getId(), 0))
                        .creatorUsername(defaultIfBlank(item.getCreatorUsername(), ""))
                        .creatorNickname(resolveNickname(item.getCreatorUsername(), nicknameMap))
                        .updaterUsername(defaultIfBlank(item.getUpdatedBy(), ""))
                        .updaterNickname(resolveNickname(item.getUpdatedBy(), nicknameMap))
                        .authorUsername(resolveHistoryAuthorUsername(item, latestEntryMap.get(item.getId())))
                        .authorNickname(resolveHistoryAuthorNickname(item, latestEntryMap.get(item.getId()), nicknameMap))
                        .updatedAt(formatDateTime(item.getUpdatedAt()))
                        .build())
                .collect(Collectors.toList());
    }

    private Map<Long, Integer> buildEntryCountMap() {
        Map<Long, Integer> result = new HashMap<>();
        for (DailySummaryEntry entry : dailySummaryEntryMapper.selectList(null)) {
            if (entry.getSummaryId() == null) {
                continue;
            }
            result.merge(entry.getSummaryId(), 1, Integer::sum);
        }
        return result;
    }

    private Map<Long, DailySummaryEntry> buildLatestEntryMap() {
        Map<Long, DailySummaryEntry> result = new LinkedHashMap<>();
        for (DailySummaryEntry entry : dailySummaryEntryMapper.selectList(new LambdaQueryWrapper<DailySummaryEntry>()
                .orderByDesc(DailySummaryEntry::getUpdatedAt)
                .orderByDesc(DailySummaryEntry::getId))) {
            if (entry.getSummaryId() == null || result.containsKey(entry.getSummaryId())) {
                continue;
            }
            result.put(entry.getSummaryId(), entry);
        }
        return result;
    }

    private List<BizLikeRecord> listLikeEntities(String bizType, Long bizId) {
        return bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, bizType)
                .eq(BizLikeRecord::getBizId, bizId)
                .orderByAsc(BizLikeRecord::getCreatedAt)
                .orderByAsc(BizLikeRecord::getId));
    }

    private List<InteractionLikeUserResponse> buildLikeUserResponses(String bizType, Long bizId, Map<String, String> nicknameMap) {
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
        long uniqueCount = listLikeEntities(bizType, bizId).stream()
                .map(record -> defaultIfBlank(record.getUsername(), ""))
                .filter(StringUtils::hasText)
                .distinct()
                .count();
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
        if (comment == null || !bizType.equals(defaultIfBlank(comment.getBizType(), "")) || !bizId.equals(comment.getBizId())) {
            throw new BusinessException("评论记录不存在");
        }
        return comment;
    }

    private List<InteractionCommentResponse> listCommentResponses(String bizType, Long bizId, Map<String, String> nicknameMap) {
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

    private Map<String, String> buildNicknameMap() {
        Map<String, String> nicknameMap = new HashMap<>();
        for (CoupleProfile profile : coupleProfileMapper.selectList(null)) {
            nicknameMap.put(profile.getUsername(), profile.getNickname());
        }
        return nicknameMap;
    }

    private String resolveHistoryAuthorUsername(DailySummary summary, DailySummaryEntry latestEntry) {
        if (summary != null && StringUtils.hasText(summary.getUpdatedBy())) {
            return defaultIfBlank(summary.getUpdatedBy(), "");
        }
        if (summary != null && StringUtils.hasText(summary.getCreatorUsername())) {
            return defaultIfBlank(summary.getCreatorUsername(), "");
        }
        if (latestEntry != null && StringUtils.hasText(latestEntry.getCreatorUsername())) {
            return defaultIfBlank(latestEntry.getCreatorUsername(), "");
        }
        return "";
    }

    private String resolveHistoryAuthorNickname(DailySummary summary, DailySummaryEntry latestEntry, Map<String, String> nicknameMap) {
        String username = resolveHistoryAuthorUsername(summary, latestEntry);
        if (StringUtils.hasText(username)) {
            return resolveNickname(username, nicknameMap);
        }
        if (summary != null && StringUtils.hasText(summary.getUpdatedBy())) {
            return resolveNickname(summary.getUpdatedBy(), nicknameMap);
        }
        if (summary != null && StringUtils.hasText(summary.getCreatorUsername())) {
            return resolveNickname(summary.getCreatorUsername(), nicknameMap);
        }
        if (latestEntry != null && StringUtils.hasText(latestEntry.getCreatorUsername())) {
            return resolveNickname(latestEntry.getCreatorUsername(), nicknameMap);
        }
        return "";
    }

    private String resolveNickname(String username, Map<String, String> nicknameMap) {
        if (!StringUtils.hasText(username)) {
            return "";
        }
        return nicknameMap.getOrDefault(username, username);
    }

    private Map<String, Object> buildEntryNotificationPayload(Long summaryId, Long entryId, LocalDate summaryDate) {
        return buildEntryNotificationPayload(summaryId, entryId, summaryDate, Map.of());
    }

    private Map<String, Object> buildEntryNotificationPayload(Long summaryId,
                                                              Long entryId,
                                                              LocalDate summaryDate,
                                                              Map<String, Object> extraPayload) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("summaryId", summaryId == null ? 0L : summaryId);
        payload.put("entryId", entryId == null ? 0L : entryId);
        payload.put("summaryDate", formatDate(summaryDate));
        if (extraPayload != null && !extraPayload.isEmpty()) {
            payload.putAll(extraPayload);
        }
        return payload;
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(defaultIfBlank(value, ""), DATE_FORMATTER);
        } catch (Exception exception) {
            throw new BusinessException("日期格式不正确");
        }
    }

    private String normalizeMood(String value) {
        String normalized = defaultIfBlank(value, DEFAULT_MOOD).toLowerCase(Locale.ROOT);
        return StringUtils.hasText(normalized) ? normalized : DEFAULT_MOOD;
    }

    private String formatSummaryDay(LocalDate summaryDate) {
        return formatDate(summaryDate) + " 的今日小计";
    }

    private String formatDate(LocalDate value) {
        return value == null ? "" : value.format(DATE_FORMATTER);
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "" : value.format(DATE_TIME_FORMATTER);
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }
}
