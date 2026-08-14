package org.love.romantic.service.impl;

import org.love.romantic.config.StorageProperties;
import org.love.romantic.service.LocalFileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.function.Predicate;

@Service
public class LocalFileStorageServiceImpl implements LocalFileStorageService {

    private final StorageProperties storageProperties;

    public LocalFileStorageServiceImpl(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @Override
    public boolean isManagedAvatarPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getAvatarDirectory());
    }

    @Override
    public boolean isManagedAnniversaryPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getAnniversaryDirectory());
    }

    @Override
    public boolean isManagedImprovementPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getImprovementDirectory());
    }

    @Override
    public boolean isManagedAlbumPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getAlbumDirectory());
    }

    @Override
    public boolean isManagedDailySummaryPath(String relativePath) {
        return isManagedPath(relativePath, storageProperties.getDailySummaryDirectory());
    }

    @Override
    public String normalizeManagedAvatarPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedAvatarPath);
    }

    @Override
    public String normalizeManagedAnniversaryPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedAnniversaryPath);
    }

    @Override
    public String normalizeManagedImprovementPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedImprovementPath);
    }

    @Override
    public String normalizeManagedAlbumPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedAlbumPath);
    }

    @Override
    public String normalizeManagedDailySummaryPath(String relativePath) {
        return normalizeManagedPath(relativePath, this::isManagedDailySummaryPath);
    }

    @Override
    public void deleteAvatarQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedAvatarPath);
    }

    @Override
    public void deleteAnniversaryMediaQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedAnniversaryPath);
    }

    @Override
    public void deleteImprovementMediaQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedImprovementPath);
    }

    @Override
    public void deleteAlbumMediaQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedAlbumPath);
    }

    @Override
    public void deleteDailySummaryMediaQuietly(String relativePath) {
        deleteManagedFileQuietly(relativePath, this::isManagedDailySummaryPath);
    }

    /**
     * 判断路径是否属于指定托管目录
     *
     * @param relativePath 文件相对路径
     * @param directory 托管目录名
     * @return 是否属于指定托管目录
     */
    private boolean isManagedPath(String relativePath, String directory) {
        // 参数校验
        if (!StringUtils.hasText(relativePath)) {
            return false;
        }

        // 路径规则匹配
        String normalizedPath = relativePath.trim().replace('\\', '/');
        String prefix = storageProperties.getPublicPathPrefixNormalized() + "/" + directory + "/";
        return normalizedPath.startsWith(prefix);
    }

    /**
     * 标准化符合托管规则的文件路径
     *
     * @param relativePath 文件相对路径
     * @param checker 托管路径校验器
     * @return 标准化后的托管路径，不符合托管规则时返回 null
     */
    private String normalizeManagedPath(String relativePath, Predicate<String> checker) {
        // 参数校验
        if (!StringUtils.hasText(relativePath) || !checker.test(relativePath)) {
            return null;
        }

        // 返回对象组装
        return relativePath.trim().replace('\\', '/');
    }

    /**
     * 静默删除符合托管规则的本地文件
     *
     * @param relativePath 文件相对路径
     * @param checker 托管路径校验器
     */
    private void deleteManagedFileQuietly(String relativePath, Predicate<String> checker) {
        // 参数校验
        if (!checker.test(relativePath)) {
            return;
        }

        // 路径解析
        String normalizedPath = relativePath.trim().replace('\\', '/');
        String storagePath = normalizedPath.substring(storageProperties.getPublicPathPrefixNormalized().length()).replaceFirst("^/", "");
        Path targetPath = storageProperties.getRootDirectory().resolve(storagePath).normalize();

        // 权限校验
        if (!targetPath.startsWith(storageProperties.getRootDirectory())) {
            return;
        }

        // 文件删除
        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException ignored) {
            // 删除旧文件失败时不阻塞主流程
        }
    }
}
