package org.love.romantic.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
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
        ensureAccount(buildProfile("chenjia", "admin", "陈佳", "陈佳"));
        ensureAccount(buildProfile("liubaohua", "admin", "宝花", "宝花"));
    }

    private void ensureAccount(CoupleProfile profile) {
        LambdaQueryWrapper<CoupleProfile> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CoupleProfile::getUsername, profile.getUsername()).last("LIMIT 1");
        CoupleProfile existed = coupleProfileMapper.selectOne(queryWrapper);
        if (existed != null) {
            return;
        }

        coupleProfileMapper.insert(profile);
        log.info("已创建默认账号：{}", profile.getUsername());
    }

    private CoupleProfile buildProfile(String username, String password, String nickname, String loverNickname) {
        LocalDateTime now = LocalDateTime.now();
        return CoupleProfile.builder()
                .username(username)
                .password(password)
                .nickname(nickname)
                .city("上海")
                .loverNickname(loverNickname)
                .bio("把喜欢写进每一天。")
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
