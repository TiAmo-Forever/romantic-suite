package org.love.romantic.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 统一管理本地文件存储目录和对外访问前缀。
 */
@Data
@Component
@ConfigurationProperties(prefix = "romantic.storage")
public class StorageProperties {

    private String rootPath = "./storage";

    private String publicPathPrefix = "/uploads";

    private String avatarDirectory = "avatars";

    private String anniversaryDirectory = "anniversaries";

    private String improvementDirectory = "improvements";

    private String albumDirectory = "albums";

    public Path getRootDirectory() {
        return Paths.get(rootPath).toAbsolutePath().normalize();
    }

    public Path getAvatarStorageDirectory() {
        return getRootDirectory().resolve(normalizeSegment(avatarDirectory)).normalize();
    }

    public Path getAnniversaryStorageDirectory() {
        return getRootDirectory().resolve(normalizeSegment(anniversaryDirectory)).normalize();
    }

    public Path getImprovementStorageDirectory() {
        return getRootDirectory().resolve(normalizeSegment(improvementDirectory)).normalize();
    }

    public Path getAlbumStorageDirectory() {
        return getRootDirectory().resolve(normalizeSegment(albumDirectory)).normalize();
    }

    public String getPublicPathPrefixNormalized() {
        String prefix = StringUtils.hasText(publicPathPrefix) ? publicPathPrefix.trim() : "/uploads";
        return prefix.startsWith("/") ? prefix : "/" + prefix;
    }

    public String buildAvatarRelativePath(String fileName) {
        return getPublicPathPrefixNormalized() + "/" + normalizeSegment(avatarDirectory) + "/" + fileName;
    }

    public String buildAnniversaryRelativePath(String fileName) {
        return getPublicPathPrefixNormalized() + "/" + normalizeSegment(anniversaryDirectory) + "/" + fileName;
    }

    public String buildImprovementRelativePath(String fileName) {
        return getPublicPathPrefixNormalized() + "/" + normalizeSegment(improvementDirectory) + "/" + fileName;
    }

    public String buildAlbumRelativePath(String fileName) {
        return getPublicPathPrefixNormalized() + "/" + normalizeSegment(albumDirectory) + "/" + fileName;
    }

    private String normalizeSegment(String value) {
        return StringUtils.trimTrailingCharacter(
                StringUtils.trimLeadingCharacter(String.valueOf(value).trim(), '/'),
                '/'
        );
    }
}
