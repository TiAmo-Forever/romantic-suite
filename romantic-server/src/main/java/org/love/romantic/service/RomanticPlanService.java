package org.love.romantic.service;

import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.RomanticPlanFeedbackRequest;
import org.love.romantic.model.RomanticPlanRequest;
import org.love.romantic.model.RomanticPlanResponse;

import java.util.List;

public interface RomanticPlanService {

    /**
     * 查询浪漫计划列表
     *
     * @param status 计划状态筛选值
     * @return 浪漫计划列表
     */
    List<RomanticPlanResponse> listPlans(String status);

    /**
     * 查询浪漫计划详情
     *
     * @param id 计划 ID
     * @return 浪漫计划详情
     */
    RomanticPlanResponse getPlan(Long id);

    /**
     * 新增浪漫计划
     *
     * @param request 计划保存请求
     * @return 新增后的浪漫计划详情
     */
    RomanticPlanResponse createPlan(RomanticPlanRequest request);

    /**
     * 更新浪漫计划
     *
     * @param id 计划 ID
     * @param request 计划保存请求
     * @return 更新后的浪漫计划详情
     */
    RomanticPlanResponse updatePlan(Long id, RomanticPlanRequest request);

    /**
     * 删除浪漫计划
     *
     * @param id 计划 ID
     */
    void deletePlan(Long id);

    /**
     * 新增浪漫计划反馈
     *
     * @param id 计划 ID
     * @param request 反馈保存请求
     * @return 新增反馈后的浪漫计划详情
     */
    RomanticPlanResponse addFeedback(Long id, RomanticPlanFeedbackRequest request);

    /**
     * 切换计划条目完成状态
     *
     * @param id 计划 ID
     * @param itemId 计划条目 ID
     * @param completed 是否完成
     * @return 更新后的浪漫计划详情
     */
    RomanticPlanResponse toggleItemCompletion(Long id, Long itemId, boolean completed);

    /**
     * 切换浪漫计划点赞状态
     *
     * @param id 计划 ID
     * @return 点赞切换结果
     */
    InteractionLikeToggleResponse togglePlanLike(Long id);

    /**
     * 新增浪漫计划评论
     *
     * @param id 计划 ID
     * @param request 评论保存请求
     * @return 新增后的评论详情
     */
    InteractionCommentResponse addPlanComment(Long id, InteractionCommentRequest request);

    /**
     * 删除浪漫计划评论
     *
     * @param id 计划 ID
     * @param commentId 评论 ID
     */
    void deletePlanComment(Long id, Long commentId);
}
