package org.love.romantic.service;

import org.love.romantic.model.LoginRequest;
import org.love.romantic.model.LoginResponse;
import org.love.romantic.model.PasswordUpdateRequest;
import org.love.romantic.model.ProfileResponse;
import org.love.romantic.model.ProfileUpdateRequest;

import java.util.List;

/**
 * 账号资料服务。
 */
public interface CoupleProfileService {

    /**
     * 查询全部账号资料，仅用于后台调试。
     */
    List<ProfileResponse> listProfiles();

    /**
     * 查询当前登录账号资料。
     */
    ProfileResponse getCurrentProfile();

    /**
     * 执行账号登录。
     */
    LoginResponse login(LoginRequest request);

    /**
     * 更新当前登录账号资料。
     */
    ProfileResponse updateCurrentProfile(ProfileUpdateRequest request);

    /**
     * 更新当前登录账号密码。
     */
    ProfileResponse updatePassword(PasswordUpdateRequest request);

    /**
     * 将当前登录账号资料恢复为默认值。
     */
    ProfileResponse resetCurrentProfile();

    /**
     * 返回账号总数。
     */
    long countProfiles();
}
