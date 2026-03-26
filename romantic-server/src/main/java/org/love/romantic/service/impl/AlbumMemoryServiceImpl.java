package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.common.NotificationTypeConstants;
import org.love.romantic.entity.AlbumMedia;
import org.love.romantic.entity.AlbumMemory;
import org.love.romantic.entity.BizCommentRecord;
import org.love.romantic.entity.BizLikeRecord;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.AlbumMediaMapper;
import org.love.romantic.mapper.AlbumMemoryMapper;
import org.love.romantic.mapper.BizCommentRecordMapper;
import org.love.romantic.mapper.BizLikeRecordMapper;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.model.AlbumMediaRequest;
import org.love.romantic.model.AlbumMediaResponse;
import org.love.romantic.model.AlbumMemoryRequest;
import org.love.romantic.model.AlbumMemoryResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.InteractionLikeUserResponse;
import org.love.romantic.service.AlbumMemoryService;
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
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AlbumMemoryServiceImpl implements AlbumMemoryService {

    private static final int MAX_IMAGE_COUNT = 12;
    private static final int MAX_VIDEO_COUNT = 2;
    private static final int MAX_TAG_COUNT = 6;

    private final AlbumMemoryMapper albumMemoryMapper;
    private final AlbumMediaMapper albumMediaMapper;
    private final BizLikeRecordMapper bizLikeRecordMapper;
    private final BizCommentRecordMapper bizCommentRecordMapper;
    private final CoupleProfileMapper coupleProfileMapper;
    private final LocalFileStorageService localFileStorageService;
    private final ObjectMapper objectMapper;
    private final UserNotificationService userNotificationService;

    public AlbumMemoryServiceImpl(AlbumMemoryMapper albumMemoryMapper,
                                  AlbumMediaMapper albumMediaMapper,
                                  BizLikeRecordMapper bizLikeRecordMapper,
                                  BizCommentRecordMapper bizCommentRecordMapper,
                                  CoupleProfileMapper coupleProfileMapper,
                                  LocalFileStorageService localFileStorageService,
                                  ObjectMapper objectMapper,
                                  UserNotificationService userNotificationService) {
        this.albumMemoryMapper = albumMemoryMapper;
        this.albumMediaMapper = albumMediaMapper;
        this.bizLikeRecordMapper = bizLikeRecordMapper;
        this.bizCommentRecordMapper = bizCommentRecordMapper;
        this.coupleProfileMapper = coupleProfileMapper;
        this.localFileStorageService = localFileStorageService;
        this.objectMapper = objectMapper;
        this.userNotificationService = userNotificationService;
    }

    @Override
    public List<AlbumMemoryResponse> listMemories() {
        String currentUsername = AuthContext.getRequiredUsername();
        List<AlbumMemory> memories = albumMemoryMapper.selectList(new LambdaQueryWrapper<AlbumMemory>()
                .orderByDesc(AlbumMemory::getMemoryDate)
                .orderByDesc(AlbumMemory::getCreatedAt)
                .orderByDesc(AlbumMemory::getId));

        Map<String, String> nicknameMap = buildNicknameMap();
        Map<Long, Long> likeCountMap = buildLikeCountMap(
                NotificationBizTypeConstants.ALBUM,
                memories.stream().map(AlbumMemory::getId).collect(Collectors.toList())
        );
        Set<Long> likedMemoryIds = buildLikedBizIdSet(
                NotificationBizTypeConstants.ALBUM,
                memories.stream().map(AlbumMemory::getId).collect(Collectors.toList()),
                currentUsername
        );

        return memories.stream()
                .map(memory -> {
                    memory.setLikeCount(likeCountMap.getOrDefault(memory.getId(), 0L));
                    return toResponse(
                            memory,
                            listMediaResponses(memory.getId()),
                            nicknameMap,
                            new ArrayList<>(),
                            new ArrayList<>(),
                            likedMemoryIds.contains(memory.getId())
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public AlbumMemoryResponse getMemory(Long id) {
        String currentUsername = AuthContext.getRequiredUsername();
        Map<String, String> nicknameMap = buildNicknameMap();
        AlbumMemory memory = requireMemory(id);
        List<InteractionLikeUserResponse> likeUsers = buildLikeUserResponses(NotificationBizTypeConstants.ALBUM, id, nicknameMap);
        List<InteractionCommentResponse> commentList = listCommentResponses(NotificationBizTypeConstants.ALBUM, id, nicknameMap);
        boolean likedByCurrentUser = likeUsers.stream()
                .anyMatch(item -> currentUsername.equalsIgnoreCase(item.getUsername()));

        return toResponse(
                memory,
                listMediaResponses(id),
                nicknameMap,
                likeUsers,
                commentList,
                likedByCurrentUser
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AlbumMemoryResponse createMemory(AlbumMemoryRequest request) {
        String operator = AuthContext.getRequiredUsername();
        LocalDateTime now = LocalDateTime.now();

        AlbumMemory memory = AlbumMemory.builder()
                .username(operator)
                .likeCount(0L)
                .createdAt(now)
                .updatedAt(now)
                .build();
        applyRequest(memory, request);
        albumMemoryMapper.insert(memory);
        replaceMedia(memory.getId(), new ArrayList<>(), safeMediaList(request.getMediaList()));

        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ALBUM_CREATED,
                "相册里多了一段新回忆",
                "《" + memory.getTitle() + "》已经被轻轻收进甜蜜相册。",
                NotificationBizTypeConstants.ALBUM,
                memory.getId(),
                Map.of("title", memory.getTitle())
        );
        log.info("甜蜜相册回忆创建成功，operator={}, memoryId={}", operator, memory.getId());
        return getMemory(memory.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AlbumMemoryResponse updateMemory(Long id, AlbumMemoryRequest request) {
        String operator = AuthContext.getRequiredUsername();
        AlbumMemory memory = requireMemory(id);
        List<AlbumMedia> existingMedia = listMediaEntities(id);
        String creatorUsername = memory.getUsername();
        LocalDateTime createdAt = memory.getCreatedAt();

        applyRequest(memory, request);
        memory.setUsername(creatorUsername);
        memory.setCreatedAt(createdAt);
        memory.setUpdatedAt(LocalDateTime.now());
        albumMemoryMapper.updateById(memory);
        replaceMedia(id, existingMedia, safeMediaList(request.getMediaList()));

        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ALBUM_UPDATED,
                "回忆内容更新了",
                "《" + memory.getTitle() + "》刚刚补上了新的画面和心情。",
                NotificationBizTypeConstants.ALBUM,
                memory.getId(),
                Map.of("title", memory.getTitle())
        );
        log.info("甜蜜相册回忆更新成功，operator={}, memoryId={}", operator, id);
        return getMemory(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMemory(Long id) {
        String operator = AuthContext.getRequiredUsername();
        requireMemory(id);
        List<AlbumMedia> existingMedia = listMediaEntities(id);

        albumMediaMapper.delete(new LambdaQueryWrapper<AlbumMedia>().eq(AlbumMedia::getMemoryId, id));
        bizLikeRecordMapper.delete(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ALBUM)
                .eq(BizLikeRecord::getBizId, id));
        bizCommentRecordMapper.delete(new LambdaQueryWrapper<BizCommentRecord>()
                .eq(BizCommentRecord::getBizType, NotificationBizTypeConstants.ALBUM)
                .eq(BizCommentRecord::getBizId, id));
        albumMemoryMapper.deleteById(id);

        existingMedia.forEach(media -> {
            localFileStorageService.deleteAlbumMediaQuietly(media.getFileUrl());
            localFileStorageService.deleteAlbumMediaQuietly(media.getThumbnailUrl());
        });
        log.info("甜蜜相册回忆删除成功，operator={}, memoryId={}", operator, id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionLikeToggleResponse toggleLike(Long id) {
        String operator = AuthContext.getRequiredUsername();
        AlbumMemory memory = requireMemory(id);

        List<BizLikeRecord> existingLikes = bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ALBUM)
                .eq(BizLikeRecord::getBizId, id)
                .eq(BizLikeRecord::getUsername, operator));

        boolean liked;
        if (existingLikes.isEmpty()) {
            bizLikeRecordMapper.insert(BizLikeRecord.builder()
                    .bizType(NotificationBizTypeConstants.ALBUM)
                    .bizId(id)
                    .username(operator)
                    .createdAt(LocalDateTime.now())
                    .build());
            liked = true;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.ALBUM_LIKED,
                    "这段回忆收到了一颗爱心",
                    "《" + memory.getTitle() + "》被轻轻点亮了一次喜欢。",
                    NotificationBizTypeConstants.ALBUM,
                    memory.getId(),
                    Map.of("title", memory.getTitle(), "liked", true)
            );
        } else {
            bizLikeRecordMapper.delete(new LambdaQueryWrapper<BizLikeRecord>()
                    .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ALBUM)
                    .eq(BizLikeRecord::getBizId, id)
                    .eq(BizLikeRecord::getUsername, operator));
            liked = false;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.ALBUM_UNLIKED,
                    "这段回忆少了一颗爱心",
                    "《" + memory.getTitle() + "》刚刚取消了一次点赞。",
                    NotificationBizTypeConstants.ALBUM,
                    memory.getId(),
                    Map.of("title", memory.getTitle(), "liked", false)
            );
        }

        long latestLikeCount = recountAlbumLikeCount(id);
        log.info("甜蜜相册点赞状态切换成功，operator={}, memoryId={}, liked={}, likeCount={}", operator, id, liked, latestLikeCount);
        return InteractionLikeToggleResponse.builder()
                .liked(liked)
                .likeCount(latestLikeCount)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionCommentResponse addComment(Long id, InteractionCommentRequest request) {
        String operator = AuthContext.getRequiredUsername();
        requireMemory(id);

        String content = defaultIfBlank(request.getContent(), "");
        if (!StringUtils.hasText(content)) {
            throw new BusinessException("评论内容不能为空");
        }

        LocalDateTime now = LocalDateTime.now();
        BizCommentRecord comment = BizCommentRecord.builder()
                .bizType(NotificationBizTypeConstants.ALBUM)
                .bizId(id)
                .username(operator)
                .content(content)
                .createdAt(now)
                .updatedAt(now)
                .build();
        bizCommentRecordMapper.insert(comment);
        log.info("甜蜜相册评论创建成功，operator={}, memoryId={}, commentId={}", operator, id, comment.getId());
        return toCommentResponse(comment, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteComment(Long id, Long commentId) {
        String operator = AuthContext.getRequiredUsername();
        AlbumMemory memory = requireMemory(id);
        BizCommentRecord comment = requireComment(NotificationBizTypeConstants.ALBUM, id, commentId);
        boolean canDelete = operator.equalsIgnoreCase(defaultIfBlank(comment.getUsername(), ""))
                || operator.equalsIgnoreCase(defaultIfBlank(memory.getUsername(), ""));
        if (!canDelete) {
            throw new BusinessException("当前没有权限删除这条评论");
        }
        bizCommentRecordMapper.deleteById(commentId);
        log.info("甜蜜相册评论删除成功，operator={}, memoryId={}, commentId={}", operator, id, commentId);
    }

    private void applyRequest(AlbumMemory memory, AlbumMemoryRequest request) {
        List<AlbumMediaRequest> mediaList = safeMediaList(request.getMediaList());
        List<String> tags = normalizeTags(request.getTags());
        validateMediaList(mediaList);

        memory.setTitle(request.getTitle().trim());
        memory.setMemoryDate(parseDate(request.getMemoryDate()));
        memory.setLocation(defaultIfBlank(request.getLocation(), ""));
        memory.setSummary(defaultIfBlank(request.getSummary(), ""));
        memory.setTagsJson(writeTags(tags));
        memory.setCoverUrl(resolveCoverUrl(mediaList));
    }

    private List<String> normalizeTags(List<String> tags) {
        return (tags == null ? new ArrayList<String>() : tags).stream()
                .map(item -> String.valueOf(item == null ? "" : item).trim())
                .filter(StringUtils::hasText)
                .distinct()
                .limit(MAX_TAG_COUNT)
                .collect(Collectors.toList());
    }

    private List<AlbumMediaRequest> safeMediaList(List<AlbumMediaRequest> mediaList) {
        return mediaList == null ? new ArrayList<>() : mediaList;
    }

    private void validateMediaList(List<AlbumMediaRequest> mediaList) {
        long imageCount = mediaList.stream().filter(item -> "image".equalsIgnoreCase(item.getMediaType())).count();
        long videoCount = mediaList.stream().filter(item -> "video".equalsIgnoreCase(item.getMediaType())).count();
        if (imageCount > MAX_IMAGE_COUNT) {
            throw new BusinessException("甜蜜相册图片最多 12 张");
        }
        if (videoCount > MAX_VIDEO_COUNT) {
            throw new BusinessException("甜蜜相册视频最多 2 个");
        }

        for (AlbumMediaRequest media : mediaList) {
            if (!"image".equalsIgnoreCase(media.getMediaType()) && !"video".equalsIgnoreCase(media.getMediaType())) {
                throw new BusinessException("甜蜜相册媒体类型不正确");
            }

            String normalizedFileUrl = localFileStorageService.normalizeManagedAlbumPath(media.getFileUrl());
            if (normalizedFileUrl == null) {
                throw new BusinessException("甜蜜相册媒体地址不合法，请重新上传");
            }

            if (StringUtils.hasText(media.getThumbnailUrl())
                    && localFileStorageService.normalizeManagedAlbumPath(media.getThumbnailUrl()) == null) {
                throw new BusinessException("甜蜜相册缩略图地址不合法，请重新上传");
            }
        }
    }

    private void replaceMedia(Long memoryId, List<AlbumMedia> existingMedia, List<AlbumMediaRequest> newMediaRequests) {
        albumMediaMapper.delete(new LambdaQueryWrapper<AlbumMedia>().eq(AlbumMedia::getMemoryId, memoryId));

        List<String> newFileUrls = newMediaRequests.stream()
                .map(AlbumMediaRequest::getFileUrl)
                .collect(Collectors.toList());
        List<String> newThumbnailUrls = newMediaRequests.stream()
                .map(AlbumMediaRequest::getThumbnailUrl)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());

        for (AlbumMediaRequest request : newMediaRequests) {
            albumMediaMapper.insert(AlbumMedia.builder()
                    .memoryId(memoryId)
                    .mediaType(request.getMediaType().toLowerCase(Locale.ROOT))
                    .fileUrl(localFileStorageService.normalizeManagedAlbumPath(request.getFileUrl()))
                    .thumbnailUrl(localFileStorageService.normalizeManagedAlbumPath(request.getThumbnailUrl()))
                    .sortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder())
                    .build());
        }

        existingMedia.forEach(item -> {
            if (!newFileUrls.contains(item.getFileUrl())) {
                localFileStorageService.deleteAlbumMediaQuietly(item.getFileUrl());
            }
            if (StringUtils.hasText(item.getThumbnailUrl()) && !newThumbnailUrls.contains(item.getThumbnailUrl())) {
                localFileStorageService.deleteAlbumMediaQuietly(item.getThumbnailUrl());
            }
        });
    }

    private AlbumMemory requireMemory(Long id) {
        if (id == null) {
            throw new BusinessException("回忆编号不能为空");
        }
        AlbumMemory memory = albumMemoryMapper.selectById(id);
        if (memory == null) {
            throw new BusinessException("回忆不存在");
        }
        return memory;
    }

    private List<AlbumMedia> listMediaEntities(Long memoryId) {
        return albumMediaMapper.selectList(new LambdaQueryWrapper<AlbumMedia>()
                .eq(AlbumMedia::getMemoryId, memoryId)
                .orderByAsc(AlbumMedia::getSortOrder)
                .orderByAsc(AlbumMedia::getId));
    }

    private List<AlbumMediaResponse> listMediaResponses(Long memoryId) {
        return listMediaEntities(memoryId).stream()
                .map(this::toMediaResponse)
                .collect(Collectors.toList());
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

    private long recountAlbumLikeCount(Long memoryId) {
        List<BizLikeRecord> likeRecords = bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ALBUM)
                .eq(BizLikeRecord::getBizId, memoryId));

        long uniqueCount = likeRecords.stream()
                .map(record -> defaultIfBlank(record.getUsername(), ""))
                .filter(StringUtils::hasText)
                .distinct()
                .count();

        AlbumMemory update = new AlbumMemory();
        update.setId(memoryId);
        update.setLikeCount(uniqueCount);
        albumMemoryMapper.updateById(update);
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

    private AlbumMemoryResponse toResponse(AlbumMemory memory,
                                           List<AlbumMediaResponse> mediaList,
                                           Map<String, String> nicknameMap,
                                           List<InteractionLikeUserResponse> likeUsers,
                                           List<InteractionCommentResponse> commentList,
                                           boolean likedByCurrentUser) {
        int imageCount = (int) mediaList.stream().filter(item -> "image".equalsIgnoreCase(item.getMediaType())).count();
        int videoCount = (int) mediaList.stream().filter(item -> "video".equalsIgnoreCase(item.getMediaType())).count();
        long likeCount = likeUsers.isEmpty()
                ? (memory.getLikeCount() == null ? 0L : memory.getLikeCount())
                : likeUsers.size();

        return AlbumMemoryResponse.builder()
                .id(memory.getId())
                .title(memory.getTitle())
                .memoryDate(memory.getMemoryDate() == null ? "" : memory.getMemoryDate().toString())
                .location(defaultIfBlank(memory.getLocation(), ""))
                .summary(defaultIfBlank(memory.getSummary(), ""))
                .tags(readTags(memory.getTagsJson()))
                .coverUrl(defaultIfBlank(memory.getCoverUrl(), ""))
                .likeCount(likeCount)
                .likedByCurrentUser(likedByCurrentUser)
                .imageCount(imageCount)
                .videoCount(videoCount)
                .creatorUsername(memory.getUsername())
                .creatorNickname(resolveCreatorNickname(memory.getUsername(), nicknameMap))
                .createdAt(formatDateTime(memory.getCreatedAt()))
                .updatedAt(formatDateTime(memory.getUpdatedAt()))
                .mediaList(mediaList)
                .likeUsers(likeUsers)
                .commentList(commentList)
                .build();
    }

    private AlbumMediaResponse toMediaResponse(AlbumMedia media) {
        return AlbumMediaResponse.builder()
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

    private Map<String, String> buildNicknameMap() {
        Map<String, String> result = new HashMap<>();
        for (CoupleProfile profile : coupleProfileMapper.selectList(null)) {
            result.put(profile.getUsername(), profile.getNickname());
        }
        return result;
    }

    private String resolveCreatorNickname(String username, Map<String, String> nicknameMap) {
        if (!StringUtils.hasText(username)) {
            return "";
        }
        return nicknameMap.getOrDefault(username, username);
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception exception) {
            throw new BusinessException("回忆日期格式不正确");
        }
    }

    private String resolveCoverUrl(List<AlbumMediaRequest> mediaList) {
        if (mediaList.isEmpty()) {
            return "";
        }

        return mediaList.stream()
                .sorted(Comparator.comparing(item -> item.getSortOrder() == null ? 0 : item.getSortOrder()))
                .map(item -> "video".equalsIgnoreCase(item.getMediaType()) && StringUtils.hasText(item.getThumbnailUrl())
                        ? item.getThumbnailUrl()
                        : item.getFileUrl())
                .filter(StringUtils::hasText)
                .map(localFileStorageService::normalizeManagedAlbumPath)
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse("");
    }

    private String writeTags(List<String> tags) {
        try {
            return objectMapper.writeValueAsString(tags == null ? new ArrayList<>() : tags);
        } catch (Exception exception) {
            throw new BusinessException("标签保存失败");
        }
    }

    private List<String> readTags(String value) {
        if (!StringUtils.hasText(value)) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(value, new TypeReference<List<String>>() { });
        } catch (Exception exception) {
            return new ArrayList<>();
        }
    }

    private String formatDateTime(LocalDateTime value) {
        if (value == null) {
            return "";
        }
        return value.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }
}
