package org.love.romantic.service;

import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.ImprovementFeedbackRequest;
import org.love.romantic.model.ImprovementNoteRequest;
import org.love.romantic.model.ImprovementNoteResponse;

import java.util.List;

public interface ImprovementNoteService {

    /**
     * 查询恋爱改进簿列表
     *
     * @param status 记录状态筛选值
     * @return 改进记录列表
     */
    List<ImprovementNoteResponse> listNotes(String status);

    /**
     * 查询改进记录详情
     *
     * @param id 改进记录 ID
     * @return 改进记录详情
     */
    ImprovementNoteResponse getNote(Long id);

    /**
     * 新增改进记录
     *
     * @param request 改进记录保存请求
     * @return 新增后的改进记录详情
     */
    ImprovementNoteResponse createNote(ImprovementNoteRequest request);

    /**
     * 更新改进记录
     *
     * @param id 改进记录 ID
     * @param request 改进记录保存请求
     * @return 更新后的改进记录详情
     */
    ImprovementNoteResponse updateNote(Long id, ImprovementNoteRequest request);

    /**
     * 删除改进记录
     *
     * @param id 改进记录 ID
     */
    void deleteNote(Long id);

    /**
     * 新增改进反馈
     *
     * @param id 改进记录 ID
     * @param request 反馈保存请求
     * @return 新增反馈后的改进记录详情
     */
    ImprovementNoteResponse addFeedback(Long id, ImprovementFeedbackRequest request);

    /**
     * 更新改进反馈
     *
     * @param id 改进记录 ID
     * @param feedbackId 反馈 ID
     * @param request 反馈保存请求
     * @return 更新反馈后的改进记录详情
     */
    ImprovementNoteResponse updateFeedback(Long id, Long feedbackId, ImprovementFeedbackRequest request);

    /**
     * 删除改进反馈
     *
     * @param id 改进记录 ID
     * @param feedbackId 反馈 ID
     * @return 删除反馈后的改进记录详情
     */
    ImprovementNoteResponse deleteFeedback(Long id, Long feedbackId);

    /**
     * 切换改进反馈点赞状态
     *
     * @param id 改进记录 ID
     * @param feedbackId 反馈 ID
     * @return 点赞切换结果
     */
    InteractionLikeToggleResponse toggleFeedbackLike(Long id, Long feedbackId);

    /**
     * 新增改进反馈评论
     *
     * @param id 改进记录 ID
     * @param feedbackId 反馈 ID
     * @param request 评论保存请求
     * @return 新增后的评论详情
     */
    InteractionCommentResponse addFeedbackComment(Long id, Long feedbackId, InteractionCommentRequest request);

    /**
     * 删除改进反馈评论
     *
     * @param id 改进记录 ID
     * @param feedbackId 反馈 ID
     * @param commentId 评论 ID
     */
    void deleteFeedbackComment(Long id, Long feedbackId, Long commentId);
}
