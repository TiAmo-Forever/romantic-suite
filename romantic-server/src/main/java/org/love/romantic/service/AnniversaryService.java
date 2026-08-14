package org.love.romantic.service;

import org.love.romantic.model.AnniversaryEventRequest;
import org.love.romantic.model.AnniversaryEventResponse;
import org.love.romantic.model.AnniversaryReminderResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;

import java.util.List;

/**
 * 纪念日服务
 */
public interface AnniversaryService {

    /**
     * 查询纪念日列表
     *
     * @param status 纪念日状态筛选值
     * @return 纪念日列表
     */
    List<AnniversaryEventResponse> listEvents(String status);

    /**
     * 查询纪念日详情
     *
     * @param id 纪念日 ID
     * @return 纪念日详情
     */
    AnniversaryEventResponse getEvent(Long id);

    /**
     * 新增纪念日
     *
     * @param request 纪念日保存请求
     * @return 新增后的纪念日详情
     */
    AnniversaryEventResponse createEvent(AnniversaryEventRequest request);

    /**
     * 更新纪念日
     *
     * @param id 纪念日 ID
     * @param request 纪念日保存请求
     * @return 更新后的纪念日详情
     */
    AnniversaryEventResponse updateEvent(Long id, AnniversaryEventRequest request);

    /**
     * 设置纪念日首页置顶状态
     *
     * @param id 纪念日 ID
     * @param pinned 是否置顶
     * @return 更新后的纪念日详情
     */
    AnniversaryEventResponse setPinned(Long id, boolean pinned);

    /**
     * 删除纪念日
     *
     * @param id 纪念日 ID
     */
    void deleteEvent(Long id);

    /**
     * 切换纪念日点赞状态
     *
     * @param id 纪念日 ID
     * @return 点赞切换结果
     */
    InteractionLikeToggleResponse toggleLike(Long id);

    /**
     * 新增纪念日评论
     *
     * @param id 纪念日 ID
     * @param request 评论保存请求
     * @return 新增后的评论详情
     */
    InteractionCommentResponse addComment(Long id, InteractionCommentRequest request);

    /**
     * 删除纪念日评论
     *
     * @param id 纪念日 ID
     * @param commentId 评论 ID
     */
    void deleteComment(Long id, Long commentId);

    /**
     * 消费当前到期的纪念日提醒
     *
     * @return 已触发提醒的纪念日列表
     */
    List<AnniversaryReminderResponse> consumeDueReminders();
}
