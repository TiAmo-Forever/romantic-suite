package org.love.romantic.service;

import org.love.romantic.config.StorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.function.Predicate;

/**
 * 校验和清理项目托管的本地上传文件。
 */
@Service
public class LocalFileStorageService {

    private final StorageProperties storageProperties;

    public LocalFileStorageService(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    public boolean isManagedAvatarPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getAvatarDirectory());
    }

    public boolean isManagedAnniversaryPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getAnniversaryDirectory());
    }

    public boolean isManagedImprovementPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getImprovementDirectory());
    }

    public boolean isManagedAlbumPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getAlbumDirectory());
    }

    public boolean isManagedDailySummaryPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getDailySummaryDirectory());
    }

    public String normalizeManagedAvatarPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedAvatarPath);
    }

    public String normalizeManagedAnniversaryPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedAnniversaryPath);
    }

    public String normalizeManagedImprovementPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedImprovementPath);
    }

    public String normalizeManagedAlbumPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedAlbumPath);
    }

    public String normalizeManagedDailySummaryPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedDailySummaryPath);
    }

    public void deleteAvatarQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedAvatarPath);
    }

    public void deleteAnniversaryMediaQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedAnniversaryPath);
    }

    public void deleteImprovementMediaQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedImprovementPath);
    }

    public void deleteAlbumMediaQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedAlbumPath);
    }

    public void deleteDailySummaryMediaQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedDailySummaryPath);
    }

    private boolean isManagedPath(String relativePath, String directory) {
        if (!StringUtils.hasText(relativePath)) {
            return false;
        }

        String normalizedPath = relativePath.trim().replace('\\', '/');
        String prefix = storageProperties.getPublicPathPrefixNormalized() + "/" + directory + "/";
        return normalizedPath.startsWith(prefix);
    }

    private String normalizeManagedPath(String relativePath, Predicate<String> checker) {
        if (!StringUtils.hasText(relativePath) || !checker.test(relativePath)) {
            return null;
        }
        return relativePath.trim().replace('\\', '/');
    }

    private void deleteManagedFileQuietly(String relativePath, Predicate<String> checker) {
        if (!checker.test(relativePath)) {
            return;
        }

        String normalizedPath = relativePath.trim().replace('\\', '/');
        String storagePath = normalizedPath.substring(storageProperties.getPublicPathPrefixNormalized().length()).replaceFirst("^/", "");
        Path targetPath = storageProperties.getRootDirectory().resolve(storagePath).normalize();

        if (!targetPath.startsWith(storageProperties.getRootDirectory())) {
            return;
        }

        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException ignored) {
            // 删除旧文件失败时不阻塞主流程。
        }
    }
}
