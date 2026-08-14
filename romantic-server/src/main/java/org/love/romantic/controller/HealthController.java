package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.service.SystemHealthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 健康检查接口
 */
@Api(tags = "健康检查")
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final SystemHealthService systemHealthService;

    public HealthController(SystemHealthService systemHealthService) {
        this.systemHealthService = systemHealthService;
    }

    @ApiOperation("服务健康检查")
    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.ok("服务运行正常", systemHealthService.serviceHealth());
    }

    @ApiOperation("数据库健康检查")
    @GetMapping("/db")
    public ApiResponse<Map<String, Object>> databaseHealth() {
        return ApiResponse.ok("数据库连接正常", systemHealthService.databaseHealth());
    }
}
