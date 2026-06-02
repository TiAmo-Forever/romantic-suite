package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.AdminAnniversaryDetailResponse;
import org.love.romantic.model.AdminCountdownDetailResponse;
import org.love.romantic.model.AdminOverviewResponse;
import org.love.romantic.service.AdminOverviewService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 管理员基础信息接口。
 */
@Api(tags = "管理员基础信息")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminOverviewService adminOverviewService;

    public AdminController(AdminOverviewService adminOverviewService) {
        this.adminOverviewService = adminOverviewService;
    }

    @ApiOperation("查询管理员基础信息总览")
    @GetMapping("/overview")
    public ApiResponse<AdminOverviewResponse> getOverview() {
        return ApiResponse.ok("管理员基础信息加载成功", adminOverviewService.getOverview());
    }

    @ApiOperation("查询见面倒计时详情")
    @GetMapping("/countdown")
    public ApiResponse<AdminCountdownDetailResponse> getCountdown() {
        return ApiResponse.ok("见面倒计时加载成功", adminOverviewService.getCountdownDetail());
    }

    @ApiOperation("查询纪念日列表")
    @GetMapping("/anniversaries")
    public ApiResponse<List<AdminAnniversaryDetailResponse>> listAnniversaries(
            @ApiParam(value = "状态筛选：all、past、future", example = "all")
            @RequestParam(required = false, defaultValue = "all") String status) {
        return ApiResponse.ok("纪念日加载成功", adminOverviewService.listAnniversaries(status));
    }

    @ApiOperation("查询纪念日详情")
    @GetMapping("/anniversaries/{id}")
    public ApiResponse<AdminAnniversaryDetailResponse> getAnniversary(
            @ApiParam("纪念日 ID") @PathVariable Long id) {
        return ApiResponse.ok("纪念日详情加载成功", adminOverviewService.getAnniversaryDetail(id));
    }
}
