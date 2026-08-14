package org.love.romantic.service;

/**
 * 本地上传文件管理服务
 */
public interface LocalFileStorageService {

    /**
     * 判断路径是否为项目托管的头像文件
     *
     * @param relativePath 文件相对路径
     * @return 是否为托管头像文件
     */
    boolean isManagedAvatarPath(String relativePath);

    /**
     * 判断路径是否为项目托管的纪念日媒体文件
     *
     * @param relativePath 文件相对路径
     * @return 是否为托管纪念日媒体文件
     */
    boolean isManagedAnniversaryPath(String relativePath);

    /**
     * 判断路径是否为项目托管的改进簿媒体文件
     *
     * @param relativePath 文件相对路径
     * @return 是否为托管改进簿媒体文件
     */
    boolean isManagedImprovementPath(String relativePath);

    /**
     * 判断路径是否为项目托管的相册媒体文件
     *
     * @param relativePath 文件相对路径
     * @return 是否为托管相册媒体文件
     */
    boolean isManagedAlbumPath(String relativePath);

    /**
     * 判断路径是否为项目托管的今日小计媒体文件
     *
     * @param relativePath 文件相对路径
     * @return 是否为托管今日小计媒体文件
     */
    boolean isManagedDailySummaryPath(String relativePath);

    /**
     * 标准化头像文件托管路径
     *
     * @param relativePath 文件相对路径
     * @return 标准化后的托管路径，不符合托管规则时返回 null
     */
    String normalizeManagedAvatarPath(String relativePath);

    /**
     * 标准化纪念日媒体文件托管路径
     *
     * @param relativePath 文件相对路径
     * @return 标准化后的托管路径，不符合托管规则时返回 null
     */
    String normalizeManagedAnniversaryPath(String relativePath);

    /**
     * 标准化改进簿媒体文件托管路径
     *
     * @param relativePath 文件相对路径
     * @return 标准化后的托管路径，不符合托管规则时返回 null
     */
    String normalizeManagedImprovementPath(String relativePath);

    /**
     * 标准化相册媒体文件托管路径
     *
     * @param relativePath 文件相对路径
     * @return 标准化后的托管路径，不符合托管规则时返回 null
     */
    String normalizeManagedAlbumPath(String relativePath);

    /**
     * 标准化今日小计媒体文件托管路径
     *
     * @param relativePath 文件相对路径
     * @return 标准化后的托管路径，不符合托管规则时返回 null
     */
    String normalizeManagedDailySummaryPath(String relativePath);

    /**
     * 静默删除托管头像文件
     *
     * @param relativePath 文件相对路径
     */
    void deleteAvatarQuietly(String relativePath);

    /**
     * 静默删除托管纪念日媒体文件
     *
     * @param relativePath 文件相对路径
     */
    void deleteAnniversaryMediaQuietly(String relativePath);

    /**
     * 静默删除托管改进簿媒体文件
     *
     * @param relativePath 文件相对路径
     */
    void deleteImprovementMediaQuietly(String relativePath);

    /**
     * 静默删除托管相册媒体文件
     *
     * @param relativePath 文件相对路径
     */
    void deleteAlbumMediaQuietly(String relativePath);

    /**
     * 静默删除托管今日小计媒体文件
     *
     * @param relativePath 文件相对路径
     */
    void deleteDailySummaryMediaQuietly(String relativePath);
}
