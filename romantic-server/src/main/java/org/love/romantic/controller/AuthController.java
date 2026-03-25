package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.love.romantic.auth.AuthTokenService;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.LoginRequest;
import org.love.romantic.model.LoginResponse;
import org.love.romantic.service.CoupleProfileService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证接口。
 */
@Api(tags = "认证接口")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String BEARER_PREFIX = "Bearer ";

    private final CoupleProfileService coupleProfileService;
    private final AuthTokenService authTokenService;

    public AuthController(CoupleProfileService coupleProfileService, AuthTokenService authTokenService) {
        this.coupleProfileService = coupleProfileService;
        this.authTokenService = authTokenService;
    }

    /**
     * 校验账号密码并返回登录态。
     */
    @ApiOperation("账号登录")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Validated @RequestBody LoginRequest request) {
        return ApiResponse.ok("登录成功", coupleProfileService.login(request));
    }

    /**
     * 主动退出当前登录态。
     */
    @ApiOperation("退出登录")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @ApiParam("Bearer token")
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization != null && authorization.startsWith(BEARER_PREFIX)) {
            authTokenService.invalidateToken(authorization.substring(BEARER_PREFIX.length()).trim());
        }
        return ApiResponse.ok("退出成功", null);
    }

    /**
     * 预留注册入口，当前版本暂未开放。
     */
    @ApiOperation("注册账号")
    @PostMapping("/register")
    public ApiResponse<Void> register() {
        return ApiResponse.fail("注册功能暂未开放");
    }
}
