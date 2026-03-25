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
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.AlbumMediaMapper;
import org.love.romantic.mapper.AlbumMemoryMapper;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.model.AlbumMediaRequest;
import org.love.romantic.model.AlbumMediaResponse;
import org.love.romantic.model.AlbumMemoryRequest;
import org.love.romantic.model.AlbumMemoryResponse;
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
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AlbumMemoryServiceImpl implements AlbumMemoryService {

    private static final int MAX_IMAGE_COUNT = 12;
    private static final int MAX_VIDEO_COUNT = 2;
    private static final int MAX_TAG_COUNT = 6;

    private final AlbumMemoryMapper albumMemoryMapper;
    private final AlbumMediaMapper albumMediaMapper;
    private final CoupleProfileMapper coupleProfileMapper;
    private final LocalFileStorageService localFileStorageService;
    private final ObjectMapper objectMapper;
    private final UserNotificationService userNotificationService;

    public AlbumMemoryServiceImpl(AlbumMemoryMapper albumMemoryMapper,
                                  AlbumMediaMapper albumMediaMapper,
                                  CoupleProfileMapper coupleProfileMapper,
                                  LocalFileStorageService localFileStorageService,
                                  ObjectMapper objectMapper,
                                  UserNotificationService userNotificationService) {
        this.albumMemoryMapper = albumMemoryMapper;
        this.albumMediaMapper = albumMediaMapper;
        this.coupleProfileMapper = coupleProfileMapper;
        this.localFileStorageService = localFileStorageService;
        this.objectMapper = objectMapper;
        this.userNotificationService = userNotificationService;
    }

    @Override
    public List<AlbumMemoryResponse> listMemories() {
        List<AlbumMemory> memories = albumMemoryMapper.selectList(new LambdaQueryWrapper<AlbumMemory>()
                .orderByDesc(AlbumMemory::getMemoryDate)
                .orderByDesc(AlbumMemory::getCreatedAt)
                .orderByDesc(AlbumMemory::getId));

        Map<String, String> nicknameMap = buildNicknameMap();
        return memories.stream()
                .map(memory -> toResponse(memory, listMediaResponses(memory.getId()), nicknameMap))
                .collect(Collectors.toList());
    }

    @Override
    public AlbumMemoryResponse getMemory(Long id) {
        return toResponse(requireMemory(id), listMediaResponses(id), buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AlbumMemoryResponse createMemory(AlbumMemoryRequest request) {
        String operator = AuthContext.getRequiredUsername();
        LocalDateTime now = LocalDateTime.now();

        AlbumMemory memory = AlbumMemory.builder()
                .username(operator)
                .createdAt(now)
                .updatedAt(now)
                .build();
        applyRequest(memory, request);
        albumMemoryMapper.insert(memory);
        replaceMedia(memory.getId(), new ArrayList<>(), safeMediaList(request.getMediaList()));
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ALBUM_CREATED,
                "\u76f8\u518c\u91cc\u591a\u4e86\u4e00\u6bb5\u56de\u5fc6",
                "\u300c" + memory.getTitle() + "\u300d\u5df2\u7ecf\u88ab\u8f7b\u8f7b\u6536\u8fdb\u751c\u871c\u76f8\u518c\u3002",
                NotificationBizTypeConstants.ALBUM,
                memory.getId(),
                Map.of("title", memory.getTitle())
        );
        log.info("闂佸憡甯楃粙鎴犵磽閹剧粯鍋ㄦ繝濠傛缁♀偓闂佺儵鏅濋…鍫ュ船娴犲鐐婇柣鎰皺缁犳捇鏌熺€涙ê濮囧┑顔界洴閺佸秶鈧鍞礶ator={}, memoryId={}", operator, memory.getId());
        return toResponse(memory, listMediaResponses(memory.getId()), buildNicknameMap());
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
                "\u56de\u5fc6\u5185\u5bb9\u66f4\u65b0\u4e86",
                "\u300c" + memory.getTitle() + "\u300d\u521a\u521a\u8865\u4e0a\u4e86\u65b0\u7684\u753b\u9762\u548c\u5fc3\u60c5\u3002",
                NotificationBizTypeConstants.ALBUM,
                memory.getId(),
                Map.of("title", memory.getTitle())
        );
        log.info("闂佸搫娲ら悺銊╁蓟婵犲洦鍋ㄦ繝濠傛缁♀偓闂佺儵鏅濋…鍫ュ船娴犲鐐婇柣鎰皺缁犳捇鏌熺€涙ê濮囧┑顔界洴閺佸秶鈧湱婀慹rator={}, memoryId={}", operator, id);
        return toResponse(memory, listMediaResponses(id), buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMemory(Long id) {
        String operator = AuthContext.getRequiredUsername();
        requireMemory(id);
        List<AlbumMedia> existingMedia = listMediaEntities(id);
        albumMediaMapper.delete(new LambdaQueryWrapper<AlbumMedia>().eq(AlbumMedia::getMemoryId, id));
        albumMemoryMapper.deleteById(id);
        existingMedia.forEach(media -> {
            localFileStorageService.deleteAlbumMediaQuietly(media.getFileUrl());
            localFileStorageService.deleteAlbumMediaQuietly(media.getThumbnailUrl());
        });
        log.info("闂佸憡甯炴繛鈧繛鍛叄閹棄顭ㄩ崱妯肩槇闂佺儵鏅濋…鍫ュ船娴犲鐐婇柣鎰皺缁犳捇鏌熺€涙ê濮囧┑顔界洴閺佸秶鈧湱婀慹rator={}, memoryId={}", operator, id);
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
            throw new BusinessException("\u751c\u871c\u76f8\u518c\u56fe\u7247\u6700\u591a 12 \u5f20");
        }
        if (videoCount > MAX_VIDEO_COUNT) {
            throw new BusinessException("\u751c\u871c\u76f8\u518c\u89c6\u9891\u6700\u591a 2 \u4e2a");
        }

        for (AlbumMediaRequest media : mediaList) {
            if (!"image".equalsIgnoreCase(media.getMediaType()) && !"video".equalsIgnoreCase(media.getMediaType())) {
                throw new BusinessException("\u751c\u871c\u76f8\u518c\u5a92\u4f53\u7c7b\u578b\u4e0d\u6b63\u786e");
            }

            String normalizedFileUrl = localFileStorageService.normalizeManagedAlbumPath(media.getFileUrl());
            if (normalizedFileUrl == null) {
                throw new BusinessException("\u751c\u871c\u76f8\u518c\u5a92\u4f53\u5730\u5740\u4e0d\u5408\u6cd5\uff0c\u8bf7\u91cd\u65b0\u4e0a\u4f20");
            }

            if (StringUtils.hasText(media.getThumbnailUrl())
                    && localFileStorageService.normalizeManagedAlbumPath(media.getThumbnailUrl()) == null) {
                throw new BusinessException("\u751c\u871c\u76f8\u518c\u7f29\u7565\u56fe\u5730\u5740\u4e0d\u5408\u6cd5\uff0c\u8bf7\u91cd\u65b0\u4e0a\u4f20");
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
            throw new BusinessException("\u56de\u5fc6\u7f16\u53f7\u4e0d\u80fd\u4e3a\u7a7a");
        }
        AlbumMemory memory = albumMemoryMapper.selectById(id);
        if (memory == null) {
            throw new BusinessException("\u56de\u5fc6\u4e0d\u5b58\u5728");
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

    private AlbumMemoryResponse toResponse(AlbumMemory memory,
                                           List<AlbumMediaResponse> mediaList,
                                           Map<String, String> nicknameMap) {
        int imageCount = (int) mediaList.stream().filter(item -> "image".equalsIgnoreCase(item.getMediaType())).count();
        int videoCount = (int) mediaList.stream().filter(item -> "video".equalsIgnoreCase(item.getMediaType())).count();

        return AlbumMemoryResponse.builder()
                .id(memory.getId())
                .title(memory.getTitle())
                .memoryDate(memory.getMemoryDate() == null ? "" : memory.getMemoryDate().toString())
                .location(defaultIfBlank(memory.getLocation(), ""))
                .summary(defaultIfBlank(memory.getSummary(), ""))
                .tags(readTags(memory.getTagsJson()))
                .coverUrl(defaultIfBlank(memory.getCoverUrl(), ""))
                .imageCount(imageCount)
                .videoCount(videoCount)
                .creatorUsername(memory.getUsername())
                .creatorNickname(resolveCreatorNickname(memory.getUsername(), nicknameMap))
                .createdAt(formatDateTime(memory.getCreatedAt()))
                .updatedAt(formatDateTime(memory.getUpdatedAt()))
                .mediaList(mediaList)
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
            throw new BusinessException("\u56de\u5fc6\u65e5\u671f\u683c\u5f0f\u4e0d\u6b63\u786e");
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
            throw new BusinessException("\u6807\u7b7e\u4fdd\u5b58\u5931\u8d25");
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

