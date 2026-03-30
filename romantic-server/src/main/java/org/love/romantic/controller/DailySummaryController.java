package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.DailySummaryEntryRequest;
import org.love.romantic.model.DailySummaryHistoryItemResponse;
import org.love.romantic.model.DailySummaryResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.service.DailySummaryService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 今日小计接口。
 */
@Api(tags = "今日小计")
@RestController
@RequestMapping("/api/daily-summaries")
public class DailySummaryController {

    private final DailySummaryService dailySummaryService;

    public DailySummaryController(DailySummaryService dailySummaryService) {
        this.dailySummaryService = dailySummaryService;
    }

    @ApiOperation("查询今天的今日小计")
    @GetMapping("/today")
    public ApiResponse<DailySummaryResponse> getTodaySummary() {
        return ApiResponse.ok("查询成功", dailySummaryService.getTodaySummary());
    }

    @ApiOperation("按日期查询今日小计")
    @GetMapping("/date/{summaryDate}")
    public ApiResponse<DailySummaryResponse> getSummaryByDate(@PathVariable String summaryDate) {
        return ApiResponse.ok("查询成功", dailySummaryService.getSummaryByDate(summaryDate));
    }

    @ApiOperation("查询今日小计历史列表")
    @GetMapping("/history")
    public ApiResponse<List<DailySummaryHistoryItemResponse>> listHistory() {
        return ApiResponse.ok("查询成功", dailySummaryService.listHistory());
    }

    @ApiOperation("新增某一天的一条今日小计")
    @PostMapping("/date/{summaryDate}/entries")
    public ApiResponse<DailySummaryResponse> createEntry(@PathVariable String summaryDate,
                                                         @Validated @RequestBody DailySummaryEntryRequest request) {
        return ApiResponse.ok("保存成功", dailySummaryService.createEntry(summaryDate, request));
    }

    @ApiOperation("更新一条今日小计")
    @PutMapping("/{summaryId}/entries/{entryId}")
    public ApiResponse<DailySummaryResponse> updateEntry(@PathVariable Long summaryId,
                                                         @PathVariable Long entryId,
                                                         @Validated @RequestBody DailySummaryEntryRequest request) {
        return ApiResponse.ok("保存成功", dailySummaryService.updateEntry(summaryId, entryId, request));
    }

    @ApiOperation("切换单条今日小计点赞")
    @PostMapping("/{summaryId}/entries/{entryId}/likes")
    public ApiResponse<InteractionLikeToggleResponse> toggleEntryLike(@PathVariable Long summaryId,
                                                                      @PathVariable Long entryId) {
        return ApiResponse.ok("操作成功", dailySummaryService.toggleEntryLike(summaryId, entryId));
    }

    @ApiOperation("新增单条今日小计评论")
    @PostMapping("/{summaryId}/entries/{entryId}/comments")
    public ApiResponse<InteractionCommentResponse> addEntryComment(@PathVariable Long summaryId,
                                                                   @PathVariable Long entryId,
                                                                   @Validated @RequestBody InteractionCommentRequest request) {
        return ApiResponse.ok("评论成功", dailySummaryService.addEntryComment(summaryId, entryId, request));
    }

    @ApiOperation("删除单条今日小计评论")
    @DeleteMapping("/{summaryId}/entries/{entryId}/comments/{commentId}")
    public ApiResponse<Void> deleteEntryComment(@PathVariable Long summaryId,
                                                @PathVariable Long entryId,
                                                @PathVariable Long commentId) {
        dailySummaryService.deleteEntryComment(summaryId, entryId, commentId);
        return ApiResponse.ok("删除成功", null);
    }
}
