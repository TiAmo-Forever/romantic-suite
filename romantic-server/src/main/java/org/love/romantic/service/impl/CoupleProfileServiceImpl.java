package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.auth.AuthTokenService;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.common.NotificationTypeConstants;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.model.LoginRequest;
import org.love.romantic.model.LoginResponse;
import org.love.romantic.model.PasswordUpdateRequest;
import org.love.romantic.model.ProfileResponse;
import org.love.romantic.model.ProfileUpdateRequest;
import org.love.romantic.service.CoupleProfileService;
import org.love.romantic.service.LocalFileStorageService;
import org.love.romantic.service.UserNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 账号资料服务实现。
 * 账号资料按登录账号各自独立维护，不做互相同步。
 */
@Slf4j
@Service
public class CoupleProfileServiceImpl implements CoupleProfileService {

    private static final String DEFAULT_CITY = "上海";
    private static final String DEFAULT_BIO = "把喜欢写进每一天。";
    private static final String DEFAULT_ANNIVERSARY_DATE = "2025-02-14";
    private static final Integer DEFAULT_MEETING_AREA_ID = 310100;
    private static final String DEFAULT_MEETING_PLACE = "上海";
    private static final String DEFAULT_AVATAR_TYPE = "preset";
    private static final String DEFAULT_AVATAR_PRESET = "heart";
    private static final String DEFAULT_AVATAR_TEXT = "💕";
    private static final String DEFAULT_THEME_PRESET_KEY = "pink";

    private final CoupleProfileMapper coupleProfileMapper;
    private final AuthTokenService authTokenService;
    private final LocalFileStorageService localFileStorageService;
    private final UserNotificationService userNotificationService;

    public CoupleProfileServiceImpl(CoupleProfileMapper coupleProfileMapper,
                                    AuthTokenService authTokenService,
                                    LocalFileStorageService localFileStorageService,
                                    UserNotificationService userNotificationService) {
        this.coupleProfileMapper = coupleProfileMapper;
        this.authTokenService = authTokenService;
        this.localFileStorageService = localFileStorageService;
        this.userNotificationService = userNotificationService;
    }

    @Override
    public List<ProfileResponse> listProfiles() {
        LambdaQueryWrapper<CoupleProfile> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByAsc(CoupleProfile::getId);
        return coupleProfileMapper.selectList(queryWrapper).stream()
                .map(this::toProfileResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProfileResponse getCurrentProfile() {
        return toProfileResponse(requireCurrentProfile());
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        CoupleProfile profile = getProfileByUsername(request.getUsername());
        if (profile == null || !profile.getPassword().equals(request.getPassword())) {
            log.warn("登录失败，账号或密码错误，username={}", request.getUsername());
            throw new BusinessException("账号或密码不正确");
        }

        String token = authTokenService.createToken(profile);
        log.info("登录成功，username={}, profileId={}", profile.getUsername(), profile.getId());
        userNotificationService.notifyPartners(
                profile.getUsername(),
                NotificationTypeConstants.LOGIN,
                "TA 回来了",
                "对方刚刚登录了爱意成笺，今天的甜蜜日常也开始继续书写了。",
                NotificationBizTypeConstants.AUTH,
                profile.getId(),
                Map.of("username", profile.getUsername())
        );

        return LoginResponse.builder()
                .token(token)
                .username(profile.getUsername())
                .nickname(profile.getNickname())
                .profile(toProfileResponse(profile))
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProfileResponse updateCurrentProfile(ProfileUpdateRequest request) {
        CoupleProfile profile = requireCurrentProfile();
        String previousAvatarImage = profile.getAvatarImage();

        if (request.getNickname() != null) {
            profile.setNickname(defaultIfBlank(request.getNickname(), defaultNickname(profile.getUsername())));
        }
        if (request.getCity() != null) {
            profile.setCity(defaultIfBlank(request.getCity(), DEFAULT_CITY));
        }
        if (request.getLoverNickname() != null) {
            profile.setLoverNickname(defaultIfBlank(request.getLoverNickname(), defaultLoverNickname(profile.getUsername())));
        }
        if (request.getBio() != null) {
            profile.setBio(defaultIfBlank(request.getBio(), DEFAULT_BIO));
        }
        if (request.getAnniversaryDate() != null) {
            profile.setAnniversaryDate(defaultIfBlank(request.getAnniversaryDate(), DEFAULT_ANNIVERSARY_DATE));
        }
        if (request.getDefaultMeetingAreaId() != null) {
            profile.setDefaultMeetingAreaId(request.getDefaultMeetingAreaId());
        }
        if (request.getDefaultMeetingPlace() != null) {
            profile.setDefaultMeetingPlace(defaultIfBlank(request.getDefaultMeetingPlace(), profile.getCity()));
        }
        if (request.getEmail() != null) {
            profile.setEmail(request.getEmail().trim());
        }
        if (request.getAvatarType() != null) {
            profile.setAvatarType(defaultIfBlank(request.getAvatarType(), DEFAULT_AVATAR_TYPE));
        }
        if (request.getAvatarPreset() != null) {
            profile.setAvatarPreset(defaultIfBlank(request.getAvatarPreset(), DEFAULT_AVATAR_PRESET));
        }
        if (request.getAvatarText() != null) {
            profile.setAvatarText(defaultIfBlank(request.getAvatarText(), DEFAULT_AVATAR_TEXT));
        }
        if (request.getAvatarImage() != null) {
            profile.setAvatarImage(normalizeAvatarImage(request.getAvatarImage()));
        }
        if (request.getThemePresetKey() != null) {
            profile.setThemePresetKey(defaultIfBlank(request.getThemePresetKey(), DEFAULT_THEME_PRESET_KEY));
        }

        if (!"upload".equals(profile.getAvatarType())) {
            profile.setAvatarImage("");
        }

        validateProfile(profile);
        profile.setUpdatedAt(LocalDateTime.now());
        coupleProfileMapper.updateById(profile);
        cleanupReplacedAvatar(previousAvatarImage, profile.getAvatarImage());
        log.info("更新资料成功，username={}, profileId={}", profile.getUsername(), profile.getId());
        return toProfileResponse(profile);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProfileResponse updatePassword(PasswordUpdateRequest request) {
        CoupleProfile profile = requireCurrentProfile();
        profile.setPassword(request.getPassword().trim());
        profile.setUpdatedAt(LocalDateTime.now());
        coupleProfileMapper.updateById(profile);
        authTokenService.invalidateUserTokens(profile.getUsername());
        log.info("更新密码成功，username={}, profileId={}", profile.getUsername(), profile.getId());
        return toProfileResponse(profile);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProfileResponse resetCurrentProfile() {
        CoupleProfile profile = requireCurrentProfile();
        String previousAvatarImage = profile.getAvatarImage();
        applyDefaultProfile(profile);
        profile.setUpdatedAt(LocalDateTime.now());
        coupleProfileMapper.updateById(profile);
        cleanupReplacedAvatar(previousAvatarImage, profile.getAvatarImage());
        log.info("恢复默认资料成功，username={}, profileId={}", profile.getUsername(), profile.getId());
        return toProfileResponse(profile);
    }

    @Override
    public long countProfiles() {
        return coupleProfileMapper.selectCount(null);
    }

    private CoupleProfile requireCurrentProfile() {
        String username = AuthContext.getRequiredUsername();
        CoupleProfile profile = getProfileByUsername(username);
        if (profile == null) {
            throw new BusinessException("当前账号不存在，请重新登录");
        }
        return profile;
    }

    private CoupleProfile getProfileByUsername(String username) {
        if (!StringUtils.hasText(username)) {
            return null;
        }
        LambdaQueryWrapper<CoupleProfile> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CoupleProfile::getUsername, username.trim()).last("LIMIT 1");
        return coupleProfileMapper.selectOne(queryWrapper);
    }

    private void validateProfile(CoupleProfile profile) {
        if (!StringUtils.hasText(profile.getNickname())) {
            throw new BusinessException("昵称不能为空");
        }

        if (!StringUtils.hasText(profile.getDefaultMeetingPlace())) {
            profile.setDefaultMeetingPlace(profile.getCity());
        }

        if (!StringUtils.hasText(profile.getThemePresetKey())) {
            profile.setThemePresetKey(DEFAULT_THEME_PRESET_KEY);
        }
    }

    private String normalizeAvatarImage(String avatarImage) {
        if (!StringUtils.hasText(avatarImage)) {
            return "";
        }

        String normalizedPath = localFileStorageService.normalizeManagedAvatarPath(avatarImage);
        if (normalizedPath == null) {
            throw new BusinessException("头像地址不合法，请重新上传头像");
        }
        return normalizedPath;
    }

    private void cleanupReplacedAvatar(String previousAvatarImage, String currentAvatarImage) {
        String previousPath = localFileStorageService.normalizeManagedAvatarPath(previousAvatarImage);
        String currentPath = localFileStorageService.normalizeManagedAvatarPath(currentAvatarImage);
        if (previousPath == null || previousPath.equals(currentPath)) {
            return;
        }
        localFileStorageService.deleteAvatarQuietly(previousPath);
    }

    private void applyDefaultProfile(CoupleProfile profile) {
        profile.setPassword("admin");
        profile.setNickname(defaultNickname(profile.getUsername()));
        profile.setCity(DEFAULT_CITY);
        profile.setLoverNickname(defaultLoverNickname(profile.getUsername()));
        profile.setBio(DEFAULT_BIO);
        profile.setAnniversaryDate(DEFAULT_ANNIVERSARY_DATE);
        profile.setDefaultMeetingAreaId(DEFAULT_MEETING_AREA_ID);
        profile.setDefaultMeetingPlace(DEFAULT_MEETING_PLACE);
        profile.setEmail("");
        profile.setAvatarType(DEFAULT_AVATAR_TYPE);
        profile.setAvatarPreset(DEFAULT_AVATAR_PRESET);
        profile.setAvatarText(DEFAULT_AVATAR_TEXT);
        profile.setAvatarImage("");
        profile.setThemePresetKey(DEFAULT_THEME_PRESET_KEY);
    }

    private String defaultNickname(String username) {
        return "liubaohua".equalsIgnoreCase(username) ? "宝花" : "陈佳";
    }

    private String defaultLoverNickname(String username) {
        return defaultNickname(username);
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }

    private ProfileResponse toProfileResponse(CoupleProfile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .username(profile.getUsername())
                .nickname(profile.getNickname())
                .city(profile.getCity())
                .loverNickname(profile.getLoverNickname())
                .bio(profile.getBio())
                .anniversaryDate(profile.getAnniversaryDate())
                .defaultMeetingAreaId(profile.getDefaultMeetingAreaId())
                .defaultMeetingPlace(profile.getDefaultMeetingPlace())
                .email(profile.getEmail())
                .avatarType(profile.getAvatarType())
                .avatarPreset(profile.getAvatarPreset())
                .avatarText(profile.getAvatarText())
                .avatarImage(profile.getAvatarImage())
                .themePresetKey(defaultIfBlank(profile.getThemePresetKey(), DEFAULT_THEME_PRESET_KEY))
                .passwordConfigured(StringUtils.hasText(profile.getPassword()))
                .passwordLength(profile.getPassword() == null ? 0 : profile.getPassword().length())
                .build();
    }
}
