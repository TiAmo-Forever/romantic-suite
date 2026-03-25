package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.common.NotificationTypeConstants;
import org.love.romantic.entity.CountdownPlan;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.CountdownPlanMapper;
import org.love.romantic.model.CountdownPlanRequest;
import org.love.romantic.model.CountdownPlanResponse;
import org.love.romantic.service.CountdownPlanService;
import org.love.romantic.service.UserNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * 共享见面倒计时服务实现。
 * 倒计时计划属于共享内容，两端账号看到的是同一份数据。
 */
@Slf4j
@Service
public class CountdownPlanServiceImpl implements CountdownPlanService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String DEFAULT_LOVER_NAME = "宝贝";
    private static final String DEFAULT_PLACE = "上海";
    private static final String DEFAULT_NOTE = "一起吃那家想念很久的晚餐，然后牵手散散步。";
    private static final LocalDateTime DEFAULT_NEXT_MEETING_AT = LocalDateTime.of(2026, 4, 1, 18, 30);
    private static final LocalDateTime DEFAULT_LAST_MEETING_AT = LocalDate.of(2026, 2, 14).atStartOfDay();

    private final CountdownPlanMapper countdownPlanMapper;
    private final UserNotificationService userNotificationService;

    public CountdownPlanServiceImpl(CountdownPlanMapper countdownPlanMapper,
                                    UserNotificationService userNotificationService) {
        this.countdownPlanMapper = countdownPlanMapper;
        this.userNotificationService = userNotificationService;
    }

    @Override
    public CountdownPlanResponse getPlan() {
        return toResponse(getOrCreatePlan(AuthContext.getRequiredUsername()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CountdownPlanResponse updatePlan(CountdownPlanRequest request) {
        String operator = AuthContext.getRequiredUsername();
        CountdownPlan plan = getOrCreatePlan(operator);
        String creatorUsername = plan.getCreatedBy();
        LocalDateTime createdAt = plan.getCreatedAt();

        applyRequest(plan, request);
        plan.setCreatedBy(StringUtils.hasText(creatorUsername) ? creatorUsername : operator);
        plan.setUpdatedBy(operator);
        plan.setCreatedAt(createdAt);
        plan.setUpdatedAt(LocalDateTime.now());
        countdownPlanMapper.updateById(plan);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.COUNTDOWN_UPDATED,
                "见面计划更新了",
                "对方把下一次见面的安排又认真调整了一下。",
                NotificationBizTypeConstants.COUNTDOWN,
                plan.getId(),
                Map.of("loverName", plan.getLoverName(), "place", plan.getPlace())
        );
        log.info("更新共享见面倒计时成功，operator={}, planId={}", operator, plan.getId());
        return toResponse(plan);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CountdownPlanResponse resetPlan() {
        String operator = AuthContext.getRequiredUsername();
        CountdownPlan plan = getOrCreatePlan(operator);
        String creatorUsername = plan.getCreatedBy();
        LocalDateTime createdAt = plan.getCreatedAt();

        applyDefaultPlan(plan);
        plan.setCreatedBy(StringUtils.hasText(creatorUsername) ? creatorUsername : operator);
        plan.setUpdatedBy(operator);
        plan.setCreatedAt(createdAt);
        plan.setUpdatedAt(LocalDateTime.now());
        countdownPlanMapper.updateById(plan);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.COUNTDOWN_UPDATED,
                "见面计划重新整理好了",
                "对方刚刚重新整理了共享倒计时，新的期待已经放回日常里。",
                NotificationBizTypeConstants.COUNTDOWN,
                plan.getId(),
                Map.of("loverName", plan.getLoverName(), "place", plan.getPlace())
        );
        log.info("恢复共享见面倒计时默认值成功，operator={}, planId={}", operator, plan.getId());
        return toResponse(plan);
    }

    private CountdownPlan getOrCreatePlan(String operator) {
        CountdownPlan plan = countdownPlanMapper.selectOne(new LambdaQueryWrapper<CountdownPlan>()
                .orderByAsc(CountdownPlan::getId)
                .last("LIMIT 1"));
        if (plan != null) {
            return plan;
        }

        LocalDateTime now = LocalDateTime.now();
        CountdownPlan createdPlan = CountdownPlan.builder()
                .createdBy(operator)
                .updatedBy(operator)
                .createdAt(now)
                .updatedAt(now)
                .build();
        applyDefaultPlan(createdPlan);
        countdownPlanMapper.insert(createdPlan);
        log.info("创建共享见面倒计时默认记录成功，creator={}, planId={}", operator, createdPlan.getId());
        return createdPlan;
    }

    private void applyRequest(CountdownPlan plan, CountdownPlanRequest request) {
        plan.setLoverName(defaultIfBlank(request.getLoverName(), DEFAULT_LOVER_NAME));
        plan.setPlace(defaultIfBlank(request.getPlace(), DEFAULT_PLACE));
        plan.setNote(defaultIfBlank(request.getNote(), DEFAULT_NOTE));
        plan.setNextMeetingAt(parseNextMeetingDateTime(request.getNextMeetingAt(), Boolean.TRUE.equals(request.getIsAllDay())));
        plan.setLastMeetingAt(parseLastMeetingDateTime(request.getLastMeetingAt()));
        plan.setIsAllDay(Boolean.TRUE.equals(request.getIsAllDay()));

        if (!plan.getNextMeetingAt().isAfter(plan.getLastMeetingAt())) {
            throw new BusinessException("下次见面时间必须晚于上次见面日期");
        }
    }

    private void applyDefaultPlan(CountdownPlan plan) {
        plan.setLoverName(DEFAULT_LOVER_NAME);
        plan.setPlace(DEFAULT_PLACE);
        plan.setNote(DEFAULT_NOTE);
        plan.setNextMeetingAt(DEFAULT_NEXT_MEETING_AT);
        plan.setLastMeetingAt(DEFAULT_LAST_MEETING_AT);
        plan.setIsAllDay(false);
    }

    private LocalDateTime parseNextMeetingDateTime(String value, boolean isAllDay) {
        try {
            String normalized = defaultIfBlank(value, "");
            if (normalized.length() == 10) {
                return LocalDate.parse(normalized, DATE_FORMATTER).atStartOfDay();
            }
            LocalDateTime parsed = LocalDateTime.parse(normalized, DATE_TIME_FORMATTER);
            return isAllDay ? parsed.toLocalDate().atStartOfDay() : parsed;
        } catch (Exception exception) {
            throw new BusinessException("下次见面时间格式不正确");
        }
    }

    private LocalDateTime parseLastMeetingDateTime(String value) {
        try {
            String normalized = defaultIfBlank(value, "");
            if (normalized.length() < 10) {
                throw new IllegalArgumentException("last meeting date is blank");
            }
            return LocalDate.parse(normalized.substring(0, 10), DATE_FORMATTER).atStartOfDay();
        } catch (Exception exception) {
            throw new BusinessException("上次见面日期格式不正确");
        }
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }

    private CountdownPlanResponse toResponse(CountdownPlan plan) {
        return CountdownPlanResponse.builder()
                .id(plan.getId())
                .loverName(plan.getLoverName())
                .place(plan.getPlace())
                .note(plan.getNote())
                .nextMeetingAt(formatDateTime(plan.getNextMeetingAt()))
                .lastMeetingAt(formatDate(plan.getLastMeetingAt()))
                .isAllDay(Boolean.TRUE.equals(plan.getIsAllDay()))
                .creatorUsername(defaultIfBlank(plan.getCreatedBy(), ""))
                .updaterUsername(defaultIfBlank(plan.getUpdatedBy(), ""))
                .build();
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "" : value.format(DATE_TIME_FORMATTER);
    }

    private String formatDate(LocalDateTime value) {
        return value == null ? "" : value.toLocalDate().format(DATE_FORMATTER);
    }
}
