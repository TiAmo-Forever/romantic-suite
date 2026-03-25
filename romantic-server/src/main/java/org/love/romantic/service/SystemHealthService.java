package org.love.romantic.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 系统健康检查服务。
 */
@Service
public class SystemHealthService {

    private final CoupleProfileService coupleProfileService;

    public SystemHealthService(CoupleProfileService coupleProfileService) {
        this.coupleProfileService = coupleProfileService;
    }

    /**
     * 生成数据库健康摘要，供健康检查接口直接返回。
     */
    public Map<String, Object> databaseHealth() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("database", "romantic_suite");
        payload.put("orm", "MyBatis-Plus");
        payload.put("profileCount", coupleProfileService.countProfiles());
        return payload;
    }
}
