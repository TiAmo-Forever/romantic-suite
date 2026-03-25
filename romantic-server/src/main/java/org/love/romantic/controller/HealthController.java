package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.service.SystemHealthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 健康检查接口。
 */
@Api(tags = "健康检查")
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final SystemHealthService systemHealthService;

    public HealthController(SystemHealthService systemHealthService) {
        this.systemHealthService = systemHealthService;
    }

    /**
     * 返回服务运行状态，便于前后端联调时快速确认服务是否可用。
     */
    @ApiOperation("服务健康检查")
    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("service", "romantic-server");
        payload.put("status", "UP");
        payload.put("time", LocalDateTime.now().toString());
        return ApiResponse.ok("服务运行正常", payload);
    }

    /**
     * 返回数据库连接状态和账户数量。
     */
    @ApiOperation("数据库健康检查")
    @GetMapping("/db")
    public ApiResponse<Map<String, Object>> databaseHealth() {
        return ApiResponse.ok("数据库连接正常", systemHealthService.databaseHealth());
    }
}
