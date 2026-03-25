package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.AnniversaryEventRequest;
import org.love.romantic.model.AnniversaryEventResponse;
import org.love.romantic.model.AnniversaryReminderResponse;
import org.love.romantic.service.AnniversaryService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 恋爱纪念日接口。
 */
@Api(tags = "纪念日")
@RestController
@RequestMapping("/api/anniversaries")
public class AnniversaryController {

    private final AnniversaryService anniversaryService;

    public AnniversaryController(AnniversaryService anniversaryService) {
        this.anniversaryService = anniversaryService;
    }

    @ApiOperation("查询纪念日列表")
    @GetMapping
    public ApiResponse<List<AnniversaryEventResponse>> listEvents(
            @ApiParam(value = "状态筛选：all、past、future", example = "all")
            @RequestParam(required = false, defaultValue = "all") String status) {
        return ApiResponse.ok("查询成功", anniversaryService.listEvents(status));
    }

    @ApiOperation("查询纪念日详情")
    @GetMapping("/{id}")
    public ApiResponse<AnniversaryEventResponse> getEvent(@ApiParam("纪念日 ID") @PathVariable Long id) {
        return ApiResponse.ok("查询成功", anniversaryService.getEvent(id));
    }

    @ApiOperation("新增纪念日")
    @PostMapping
    public ApiResponse<AnniversaryEventResponse> createEvent(@Validated @RequestBody AnniversaryEventRequest request) {
        return ApiResponse.ok("创建成功", anniversaryService.createEvent(request));
    }

    @ApiOperation("更新纪念日")
    @PutMapping("/{id}")
    public ApiResponse<AnniversaryEventResponse> updateEvent(@ApiParam("纪念日 ID") @PathVariable Long id,
                                                             @Validated @RequestBody AnniversaryEventRequest request) {
        return ApiResponse.ok("保存成功", anniversaryService.updateEvent(id, request));
    }

    @ApiOperation("删除纪念日")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteEvent(@ApiParam("纪念日 ID") @PathVariable Long id) {
        anniversaryService.deleteEvent(id);
        return ApiResponse.ok("删除成功", null);
    }

    @ApiOperation("纪念日点赞")
    @PostMapping("/{id}/likes")
    public ApiResponse<Long> increaseLikeCount(@ApiParam("纪念日 ID") @PathVariable Long id) {
        return ApiResponse.ok("点赞成功", anniversaryService.increaseLikeCount(id));
    }

    @ApiOperation("检查今日提醒")
    @PostMapping("/reminders/check")
    public ApiResponse<List<AnniversaryReminderResponse>> consumeDueReminders() {
        return ApiResponse.ok("检查成功", anniversaryService.consumeDueReminders());
    }
}
