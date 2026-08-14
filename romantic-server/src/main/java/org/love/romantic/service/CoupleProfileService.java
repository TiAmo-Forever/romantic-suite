package org.love.romantic.service;

import org.love.romantic.model.LoginRequest;
import org.love.romantic.model.LoginResponse;
import org.love.romantic.model.PasswordResetRequest;
import org.love.romantic.model.PasswordUpdateRequest;
import org.love.romantic.model.ProfileResponse;
import org.love.romantic.model.ProfileUpdateRequest;

import java.util.List;

/**
 * 账号资料服务
 */
public interface CoupleProfileService {

    /**
     * 查询全部账号资料
     *
     * @return 账号资料列表
     */
    List<ProfileResponse> listProfiles();

    /**
     * 查询当前登录账号资料
     *
     * @return 当前账号资料
     */
    ProfileResponse getCurrentProfile();

    /**
     * 查询当前登录账号对应的对方资料
     *
     * @return 对方账号资料
     */
    ProfileResponse getPartnerProfile();

    /**
     * 执行账号登录
     *
     * @param request 登录请求
     * @return 登录结果
     */
    LoginResponse login(LoginRequest request);

    /**
     * 更新当前登录账号资料
     *
     * @param request 账号资料更新请求
     * @return 更新后的账号资料
     */
    ProfileResponse updateCurrentProfile(ProfileUpdateRequest request);

    /**
     * 更新当前登录账号密码
     *
     * @param request 密码更新请求
     * @return 更新后的账号资料
     */
    ProfileResponse updatePassword(PasswordUpdateRequest request);

    /**
     * 按账号重置登录密码
     *
     * @param request 密码重置请求
     * @return 重置后的账号资料
     */
    ProfileResponse resetPassword(PasswordResetRequest request);

    /**
     * 将当前登录账号资料恢复为默认值
     *
     * @return 恢复后的账号资料
     */
    ProfileResponse resetCurrentProfile();

    /**
     * 返回账号总数
     *
     * @return 账号总数
     */
    long countProfiles();
}
