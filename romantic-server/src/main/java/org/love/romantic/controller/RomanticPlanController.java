package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.RomanticPlanFeedbackRequest;
import org.love.romantic.model.RomanticPlanRequest;
import org.love.romantic.model.RomanticPlanResponse;
import org.love.romantic.service.RomanticPlanService;
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

@Api(tags = "浪漫计划")
@RestController
@RequestMapping("/api/romantic-plans")
public class RomanticPlanController {

    private final RomanticPlanService romanticPlanService;

    public RomanticPlanController(RomanticPlanService romanticPlanService) {
        this.romanticPlanService = romanticPlanService;
    }

    @ApiOperation("查询浪漫计划列表")
    @GetMapping
    public ApiResponse<List<RomanticPlanResponse>> listPlans(
            @ApiParam(value = "状态筛选：all、draft、active、completed、archived", example = "all")
            @RequestParam(required = false, defaultValue = "all") String status) {
        return ApiResponse.ok("查询成功", romanticPlanService.listPlans(status));
    }

    @ApiOperation("查询浪漫计划详情")
    @GetMapping("/{id}")
    public ApiResponse<RomanticPlanResponse> getPlan(@ApiParam("计划 ID") @PathVariable Long id) {
        return ApiResponse.ok("查询成功", romanticPlanService.getPlan(id));
    }

    @ApiOperation("新建浪漫计划")
    @PostMapping
    public ApiResponse<RomanticPlanResponse> createPlan(@Validated @RequestBody RomanticPlanRequest request) {
        return ApiResponse.ok("创建成功", romanticPlanService.createPlan(request));
    }

    @ApiOperation("更新浪漫计划")
    @PutMapping("/{id}")
    public ApiResponse<RomanticPlanResponse> updatePlan(@ApiParam("计划 ID") @PathVariable Long id,
                                                        @Validated @RequestBody RomanticPlanRequest request) {
        return ApiResponse.ok("保存成功", romanticPlanService.updatePlan(id, request));
    }

    @ApiOperation("删除浪漫计划")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePlan(@ApiParam("计划 ID") @PathVariable Long id) {
        romanticPlanService.deletePlan(id);
        return ApiResponse.ok("删除成功", null);
    }

    @ApiOperation("新增计划反馈")
    @PostMapping("/{id}/feedback")
    public ApiResponse<RomanticPlanResponse> addFeedback(@ApiParam("计划 ID") @PathVariable Long id,
                                                         @Validated @RequestBody RomanticPlanFeedbackRequest request) {
        return ApiResponse.ok("记录成功", romanticPlanService.addFeedback(id, request));
    }

    @ApiOperation("切换计划条目完成状态")
    @PutMapping("/{id}/items/{itemId}/completion")
    public ApiResponse<RomanticPlanResponse> toggleItemCompletion(@ApiParam("计划 ID") @PathVariable Long id,
                                                                  @ApiParam("条目 ID") @PathVariable Long itemId,
                                                                  @ApiParam(value = "是否完成", example = "true")
                                                                  @RequestParam(defaultValue = "true") boolean completed) {
        return ApiResponse.ok("更新成功", romanticPlanService.toggleItemCompletion(id, itemId, completed));
    }

    @ApiOperation("浪漫计划点赞")
    @PostMapping("/{id}/likes")
    public ApiResponse<InteractionLikeToggleResponse> togglePlanLike(@ApiParam("计划 ID") @PathVariable Long id) {
        return ApiResponse.ok("操作成功", romanticPlanService.togglePlanLike(id));
    }

    @ApiOperation("浪漫计划评论")
    @PostMapping("/{id}/comments")
    public ApiResponse<InteractionCommentResponse> addPlanComment(@ApiParam("计划 ID") @PathVariable Long id,
                                                                  @Validated @RequestBody InteractionCommentRequest request) {
        return ApiResponse.ok("评论成功", romanticPlanService.addPlanComment(id, request));
    }

    @ApiOperation("删除浪漫计划评论")
    @DeleteMapping("/{id}/comments/{commentId}")
    public ApiResponse<Void> deletePlanComment(@ApiParam("计划 ID") @PathVariable Long id,
                                               @ApiParam("评论 ID") @PathVariable Long commentId) {
        romanticPlanService.deletePlanComment(id, commentId);
        return ApiResponse.ok("删除成功", null);
    }
}
