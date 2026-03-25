package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.CountdownPlanRequest;
import org.love.romantic.model.CountdownPlanResponse;
import org.love.romantic.service.CountdownPlanService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 共享见面倒计时接口。
 */
@Api(tags = "见面倒计时")
@RestController
@RequestMapping("/api/countdown")
public class CountdownPlanController {

    private final CountdownPlanService countdownPlanService;

    public CountdownPlanController(CountdownPlanService countdownPlanService) {
        this.countdownPlanService = countdownPlanService;
    }

    @ApiOperation("查询共享见面倒计时")
    @GetMapping("/plan")
    public ApiResponse<CountdownPlanResponse> getPlan() {
        return ApiResponse.ok("查询成功", countdownPlanService.getPlan());
    }

    @ApiOperation("更新共享见面倒计时")
    @PutMapping("/plan")
    public ApiResponse<CountdownPlanResponse> updatePlan(@Validated @RequestBody CountdownPlanRequest request) {
        return ApiResponse.ok("保存成功", countdownPlanService.updatePlan(request));
    }

    @ApiOperation("恢复共享见面倒计时默认值")
    @PostMapping("/plan/reset")
    public ApiResponse<CountdownPlanResponse> resetPlan() {
        return ApiResponse.ok("恢复成功", countdownPlanService.resetPlan());
    }
}
