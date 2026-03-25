package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.PasswordUpdateRequest;
import org.love.romantic.model.ProfileResponse;
import org.love.romantic.model.ProfileUpdateRequest;
import org.love.romantic.service.CoupleProfileService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 账号资料接口。
 */
@Api(tags = "账号资料")
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final CoupleProfileService coupleProfileService;

    public ProfileController(CoupleProfileService coupleProfileService) {
        this.coupleProfileService = coupleProfileService;
    }

    /**
     * 查询全部账号资料，仅用于开发期排查。
     */
    @ApiOperation("查询全部资料")
    @GetMapping
    public ApiResponse<List<ProfileResponse>> listProfiles() {
        return ApiResponse.ok("资料加载成功", coupleProfileService.listProfiles());
    }

    /**
     * 查询当前登录账号资料。
     */
    @ApiOperation("查询当前资料")
    @GetMapping("/mine")
    public ApiResponse<ProfileResponse> getCurrentProfile() {
        return ApiResponse.ok("当前资料加载成功", coupleProfileService.getCurrentProfile());
    }

    /**
     * 保存当前登录账号资料。
     */
    @ApiOperation("更新当前资料")
    @PutMapping("/mine")
    public ApiResponse<ProfileResponse> updateCurrentProfile(@RequestBody ProfileUpdateRequest request) {
        return ApiResponse.ok("资料保存成功", coupleProfileService.updateCurrentProfile(request));
    }

    /**
     * 修改当前登录账号密码。
     */
    @ApiOperation("更新密码")
    @PutMapping("/mine/password")
    public ApiResponse<ProfileResponse> updatePassword(@Validated @RequestBody PasswordUpdateRequest request) {
        return ApiResponse.ok("密码保存成功", coupleProfileService.updatePassword(request));
    }

    /**
     * 将当前登录账号资料恢复为默认值。
     */
    @ApiOperation("恢复默认资料")
    @PostMapping("/mine/reset")
    public ApiResponse<ProfileResponse> resetCurrentProfile() {
        return ApiResponse.ok("资料恢复成功", coupleProfileService.resetCurrentProfile());
    }
}
