package org.love.romantic.service.impl;

import org.love.romantic.service.CoupleProfileService;
import org.love.romantic.service.SystemHealthService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class SystemHealthServiceImpl implements SystemHealthService {

    private final CoupleProfileService coupleProfileService;

    public SystemHealthServiceImpl(CoupleProfileService coupleProfileService) {
        this.coupleProfileService = coupleProfileService;
    }

    @Override
    public Map<String, Object> serviceHealth() {
        // 返回对象组装
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("service", "romantic-server");
        payload.put("status", "UP");
        payload.put("time", LocalDateTime.now().toString());
        return payload;
    }

    @Override
    public Map<String, Object> databaseHealth() {
        // 返回对象组装
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("database", "romantic_suite");
        payload.put("orm", "MyBatis-Plus");
        payload.put("profileCount", coupleProfileService.countProfiles());
        return payload;
    }
}
