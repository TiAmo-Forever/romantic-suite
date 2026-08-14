package org.love.romantic.service;

import org.love.romantic.model.DailySummaryEntryRequest;
import org.love.romantic.model.DailySummaryHistoryItemResponse;
import org.love.romantic.model.DailySummaryResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;

import java.util.List;

/**
 * 今日小计服务
 */
public interface DailySummaryService {

    /**
     * 查询今天的今日小计
     *
     * @return 今天的今日小计详情
     */
    DailySummaryResponse getTodaySummary();

    /**
     * 按日期查询今日小计
     *
     * @param summaryDate 小计日期
     * @return 指定日期的今日小计详情
     */
    DailySummaryResponse getSummaryByDate(String summaryDate);

    /**
     * 查询今日小计历史记录
     *
     * @return 今日小计历史摘要列表
     */
    List<DailySummaryHistoryItemResponse> listHistory();

    /**
     * 新增指定日期的一条今日小计
     *
     * @param summaryDate 小计日期
     * @param request 今日小计条目保存请求
     * @return 保存后的今日小计详情
     */
    DailySummaryResponse createEntry(String summaryDate, DailySummaryEntryRequest request);

    /**
     * 更新指定今日小计条目
     *
     * @param summaryId 今日小计 ID
     * @param entryId 今日小计条目 ID
     * @param request 今日小计条目保存请求
     * @return 更新后的今日小计详情
     */
    DailySummaryResponse updateEntry(Long summaryId, Long entryId, DailySummaryEntryRequest request);

    /**
     * 切换指定今日小计条目的点赞状态
     *
     * @param summaryId 今日小计 ID
     * @param entryId 今日小计条目 ID
     * @return 点赞切换结果
     */
    InteractionLikeToggleResponse toggleEntryLike(Long summaryId, Long entryId);

    /**
     * 新增指定今日小计条目的评论
     *
     * @param summaryId 今日小计 ID
     * @param entryId 今日小计条目 ID
     * @param request 评论保存请求
     * @return 新增后的评论详情
     */
    InteractionCommentResponse addEntryComment(Long summaryId, Long entryId, InteractionCommentRequest request);

    /**
     * 删除指定今日小计条目的评论
     *
     * @param summaryId 今日小计 ID
     * @param entryId 今日小计条目 ID
     * @param commentId 评论 ID
     */
    void deleteEntryComment(Long summaryId, Long entryId, Long commentId);
}
