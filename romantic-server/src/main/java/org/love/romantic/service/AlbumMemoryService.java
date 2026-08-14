package org.love.romantic.service;

import org.love.romantic.model.AlbumMemoryRequest;
import org.love.romantic.model.AlbumMemoryResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;

import java.util.List;

public interface AlbumMemoryService {

    /**
     * 查询甜蜜相册列表
     *
     * @return 相册回忆列表
     */
    List<AlbumMemoryResponse> listMemories();

    /**
     * 查询相册回忆详情
     *
     * @param id 回忆 ID
     * @return 相册回忆详情
     */
    AlbumMemoryResponse getMemory(Long id);

    /**
     * 新增相册回忆
     *
     * @param request 回忆保存请求
     * @return 新增后的相册回忆详情
     */
    AlbumMemoryResponse createMemory(AlbumMemoryRequest request);

    /**
     * 更新相册回忆
     *
     * @param id 回忆 ID
     * @param request 回忆保存请求
     * @return 更新后的相册回忆详情
     */
    AlbumMemoryResponse updateMemory(Long id, AlbumMemoryRequest request);

    /**
     * 删除相册回忆
     *
     * @param id 回忆 ID
     */
    void deleteMemory(Long id);

    /**
     * 切换相册回忆点赞状态
     *
     * @param id 回忆 ID
     * @return 点赞切换结果
     */
    InteractionLikeToggleResponse toggleLike(Long id);

    /**
     * 新增相册回忆评论
     *
     * @param id 回忆 ID
     * @param request 评论保存请求
     * @return 新增后的评论详情
     */
    InteractionCommentResponse addComment(Long id, InteractionCommentRequest request);

    /**
     * 删除相册回忆评论
     *
     * @param id 回忆 ID
     * @param commentId 评论 ID
     */
    void deleteComment(Long id, Long commentId);
}
