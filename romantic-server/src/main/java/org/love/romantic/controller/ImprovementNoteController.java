package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.ImprovementFeedbackRequest;
import org.love.romantic.model.ImprovementNoteRequest;
import org.love.romantic.model.ImprovementNoteResponse;
import org.love.romantic.service.ImprovementNoteService;
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
 * 恋爱改进簿接口。
 */
@Api(tags = "恋爱改进簿")
@RestController
@RequestMapping("/api/improvement-notes")
public class ImprovementNoteController {

    private final ImprovementNoteService improvementNoteService;

    public ImprovementNoteController(ImprovementNoteService improvementNoteService) {
        this.improvementNoteService = improvementNoteService;
    }

    @ApiOperation("查询恋爱改进簿列表")
    @GetMapping
    public ApiResponse<List<ImprovementNoteResponse>> listNotes(
            @ApiParam(value = "状态筛选：all、resolved、improving、pending", example = "all")
            @RequestParam(required = false, defaultValue = "all") String status) {
        return ApiResponse.ok("查询成功", improvementNoteService.listNotes(status));
    }

    @ApiOperation("查询恋爱改进簿详情")
    @GetMapping("/{id}")
    public ApiResponse<ImprovementNoteResponse> getNote(@ApiParam("记录 ID") @PathVariable Long id) {
        return ApiResponse.ok("查询成功", improvementNoteService.getNote(id));
    }

    @ApiOperation("新增恋爱改进簿")
    @PostMapping
    public ApiResponse<ImprovementNoteResponse> createNote(@Validated @RequestBody ImprovementNoteRequest request) {
        return ApiResponse.ok("创建成功", improvementNoteService.createNote(request));
    }

    @ApiOperation("更新恋爱改进簿")
    @PutMapping("/{id}")
    public ApiResponse<ImprovementNoteResponse> updateNote(@ApiParam("记录 ID") @PathVariable Long id,
                                                           @Validated @RequestBody ImprovementNoteRequest request) {
        return ApiResponse.ok("保存成功", improvementNoteService.updateNote(id, request));
    }

    @ApiOperation("删除恋爱改进簿")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNote(@ApiParam("记录 ID") @PathVariable Long id) {
        improvementNoteService.deleteNote(id);
        return ApiResponse.ok("删除成功", null);
    }

    @ApiOperation("追加改进反馈")
    @PostMapping("/{id}/feedback")
    public ApiResponse<ImprovementNoteResponse> addFeedback(@ApiParam("记录 ID") @PathVariable Long id,
                                                            @Validated @RequestBody ImprovementFeedbackRequest request) {
        return ApiResponse.ok("记录成功", improvementNoteService.addFeedback(id, request));
    }

    @ApiOperation("编辑改进反馈")
    @PutMapping("/{id}/feedback/{feedbackId}")
    public ApiResponse<ImprovementNoteResponse> updateFeedback(@ApiParam("记录 ID") @PathVariable Long id,
                                                               @ApiParam("反馈 ID") @PathVariable Long feedbackId,
                                                               @Validated @RequestBody ImprovementFeedbackRequest request) {
        return ApiResponse.ok("保存成功", improvementNoteService.updateFeedback(id, feedbackId, request));
    }
}
