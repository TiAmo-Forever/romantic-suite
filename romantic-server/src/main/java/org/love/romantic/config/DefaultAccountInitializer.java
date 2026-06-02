package org.love.romantic.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.common.AccountTypeConstants;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;

/**
 * 默认账号初始化器。
 * 这里作为 SQL 初始化的兜底，避免旧库或跳过 data.sql 时缺少默认账号。
 */
@Slf4j
@Component
@DependsOn("schemaMigrationRunner")
public class DefaultAccountInitializer {

    private final CoupleProfileMapper coupleProfileMapper;

    public DefaultAccountInitializer(CoupleProfileMapper coupleProfileMapper) {
        this.coupleProfileMapper = coupleProfileMapper;
    }

    @PostConstruct
    public void initDefaultAccounts() {
        normalizeDefaultAdminAccount();
        ensureAccount(buildProfile("chenjia", "admin", AccountTypeConstants.NORMAL, "陈佳", "宝花"));
        ensureAccount(buildProfile("liubaohua", "admin", AccountTypeConstants.NORMAL, "宝花", "陈佳"));
        ensureAccount(buildProfile("admin", "admin", AccountTypeConstants.ADMIN, "管理员", "管理员"));
    }

    private void normalizeDefaultAdminAccount() {
        CoupleProfile adminAccount = findByUsername("admin");

        if (adminAccount != null) {
            boolean changed = false;
            if (!AccountTypeConstants.isAdmin(adminAccount.getAccountType())) {
                adminAccount.setAccountType(AccountTypeConstants.ADMIN);
                changed = true;
            }
            if (!"管理员".equals(adminAccount.getNickname())) {
                adminAccount.setNickname("管理员");
                changed = true;
            }
            if (!"管理员".equals(adminAccount.getLoverNickname())) {
                adminAccount.setLoverNickname("管理员");
                changed = true;
            }
            if (!"当前账号仅用于管理员查看基础信息。".equals(adminAccount.getBio())) {
                adminAccount.setBio("当前账号仅用于管理员查看基础信息。");
                changed = true;
            }
            if (changed) {
                adminAccount.setUpdatedAt(LocalDateTime.now());
                coupleProfileMapper.updateById(adminAccount);
                log.info("已修正默认管理员账号：admin");
            }
        }
    }

    private void ensureAccount(CoupleProfile profile) {
        CoupleProfile existed = findByUsername(profile.getUsername());
        if (existed != null) {
            boolean changed = false;
            if (!profile.getAccountType().equalsIgnoreCase(String.valueOf(existed.getAccountType()))) {
                existed.setAccountType(profile.getAccountType());
                changed = true;
            }
            if (AccountTypeConstants.isAdmin(profile.getAccountType())
                    && !profile.getBio().equals(existed.getBio())) {
                existed.setBio(profile.getBio());
                changed = true;
            }
            if (changed) {
                existed.setUpdatedAt(LocalDateTime.now());
                coupleProfileMapper.updateById(existed);
                log.info("已修正默认账号类型：{}", profile.getUsername());
            }
            return;
        }

        coupleProfileMapper.insert(profile);
        log.info("已创建默认账号：{}", profile.getUsername());
    }

    private CoupleProfile findByUsername(String username) {
        LambdaQueryWrapper<CoupleProfile> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CoupleProfile::getUsername, username).last("LIMIT 1");
        return coupleProfileMapper.selectOne(queryWrapper);
    }

    private CoupleProfile buildProfile(String username, String password, String accountType, String nickname, String loverNickname) {
        LocalDateTime now = LocalDateTime.now();
        return CoupleProfile.builder()
                .username(username)
                .password(password)
                .accountType(accountType)
                .nickname(nickname)
                .city("上海")
                .loverNickname(loverNickname)
                .bio(AccountTypeConstants.isAdmin(accountType) ? "当前账号仅用于管理员查看基础信息。" : "把喜欢写进每一天。")
                .anniversaryDate("2025-02-14")
                .defaultMeetingAreaId(310100)
                .defaultMeetingPlace("上海")
                .email("")
                .avatarType("preset")
                .avatarPreset("heart")
                .avatarText("💕")
                .avatarImage("")
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
}
