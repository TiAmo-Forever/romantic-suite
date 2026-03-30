package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.config.StorageProperties;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.model.AvatarUploadResponse;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

/**
 * 上传头像和业务媒体资源。
 */
@Slf4j
@Api(tags = "文件接口")
@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final long MAX_AVATAR_SIZE = 5L * 1024 * 1024;
    private static final long MAX_IMAGE_SIZE = 5L * 1024 * 1024;

    private final StorageProperties storageProperties;

    public FileController(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @ApiOperation("上传头像")
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AvatarUploadResponse> uploadAvatar(
            @ApiParam("头像图片文件")
            @RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择要上传的头像图片");
        }
        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new BusinessException("头像图片不能超过 5MB");
        }

        String contentType = String.valueOf(file.getContentType()).toLowerCase(Locale.ROOT);
        if (!contentType.startsWith("image/")) {
            throw new BusinessException("头像仅支持图片格式");
        }

        String username = AuthContext.getRequiredUsername();
        String fileName = buildFileName(file.getOriginalFilename());
        Path avatarDirectory = storageProperties.getAvatarStorageDirectory();
        Path targetPath = avatarDirectory.resolve(fileName).normalize();

        try {
            Files.createDirectories(avatarDirectory);
            file.transferTo(targetPath);
        } catch (IOException exception) {
            log.error("头像上传失败，username={}, fileName={}", username, fileName, exception);
            throw new BusinessException("头像上传失败，请稍后重试");
        }

        String relativePath = storageProperties.buildAvatarRelativePath(fileName);
        log.info("头像上传成功，username={}, path={}", username, relativePath);
        return ApiResponse.ok("头像上传成功", new AvatarUploadResponse(relativePath));
    }

    @ApiOperation("上传纪念日媒体")
    @PostMapping(value = "/anniversary-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AvatarUploadResponse> uploadAnniversaryMedia(
            @ApiParam("纪念日图片或视频文件")
            @RequestPart("file") MultipartFile file) {
        return ApiResponse.ok("上传成功", new AvatarUploadResponse(
                storeMediaFile(file, storageProperties.getAnniversaryStorageDirectory(), "anniversary")
        ));
    }

    @ApiOperation("上传恋爱改进簿媒体")
    @PostMapping(value = "/improvement-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AvatarUploadResponse> uploadImprovementMedia(
            @ApiParam("恋爱改进簿图片或视频文件")
            @RequestPart("file") MultipartFile file) {
        return ApiResponse.ok("上传成功", new AvatarUploadResponse(
                storeMediaFile(file, storageProperties.getImprovementStorageDirectory(), "improvement")
        ));
    }

    @ApiOperation("上传甜蜜相册媒体")
    @PostMapping(value = "/album-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AvatarUploadResponse> uploadAlbumMedia(
            @ApiParam("甜蜜相册图片或视频文件")
            @RequestPart("file") MultipartFile file) {
        return ApiResponse.ok("上传成功", new AvatarUploadResponse(
                storeMediaFile(file, storageProperties.getAlbumStorageDirectory(), "album")
        ));
    }

    @ApiOperation("上传今日小计媒体")
    @PostMapping(value = "/daily-summary-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AvatarUploadResponse> uploadDailySummaryMedia(
            @ApiParam("今日小计图片或视频文件")
            @RequestPart("file") MultipartFile file) {
        return ApiResponse.ok("上传成功", new AvatarUploadResponse(
                storeMediaFile(file, storageProperties.getDailySummaryStorageDirectory(), "daily-summary")
        ));
    }

    private String storeMediaFile(MultipartFile file, Path mediaDirectory, String category) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择要上传的图片或视频");
        }

        String contentType = String.valueOf(file.getContentType()).toLowerCase(Locale.ROOT);
        boolean image = contentType.startsWith("image/");
        boolean video = contentType.startsWith("video/");
        if (!image && !video) {
            throw new BusinessException("仅支持上传图片或视频");
        }
        if (image && file.getSize() > MAX_IMAGE_SIZE) {
            throw new BusinessException("图片大小不能超过 5MB");
        }

        String username = AuthContext.getRequiredUsername();
        String fileName = buildFileName(file.getOriginalFilename());
        Path targetPath = mediaDirectory.resolve(fileName).normalize();

        try {
            Files.createDirectories(mediaDirectory);
            file.transferTo(targetPath);
        } catch (IOException exception) {
            log.error("媒体上传失败，category={}, username={}, fileName={}", category, username, fileName, exception);
            throw new BusinessException("媒体上传失败，请稍后重试");
        }

        String relativePath;
        if ("improvement".equals(category)) {
            relativePath = storageProperties.buildImprovementRelativePath(fileName);
        } else if ("album".equals(category)) {
            relativePath = storageProperties.buildAlbumRelativePath(fileName);
        } else if ("daily-summary".equals(category)) {
            relativePath = storageProperties.buildDailySummaryRelativePath(fileName);
        } else {
            relativePath = storageProperties.buildAnniversaryRelativePath(fileName);
        }
        log.info("媒体上传成功，category={}, username={}, path={}", category, username, relativePath);
        return relativePath;
    }

    private String buildFileName(String originalFileName) {
        String extension = ".png";
        if (StringUtils.hasText(originalFileName) && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
            if (extension.length() > 10) {
                extension = ".png";
            }
        }

        String datePrefix = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String randomPart = UUID.randomUUID().toString().replace("-", "");
        return datePrefix + "_" + randomPart + extension;
    }
}
