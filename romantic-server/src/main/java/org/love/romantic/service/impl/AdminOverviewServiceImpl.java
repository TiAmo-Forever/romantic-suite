package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.AccountTypeConstants;
import org.love.romantic.entity.AnniversaryEvent;
import org.love.romantic.entity.CountdownPlan;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.mapper.AnniversaryEventMapper;
import org.love.romantic.mapper.CountdownPlanMapper;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.model.AdminAnniversaryDetailResponse;
import org.love.romantic.model.AdminCountdownDetailResponse;
import org.love.romantic.model.AdminAnniversarySummaryResponse;
import org.love.romantic.model.AdminCountdownSummaryResponse;
import org.love.romantic.model.AdminOverviewResponse;
import org.love.romantic.model.AdminProfileSummaryResponse;
import org.love.romantic.service.AdminOverviewService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

/**
 * 管理员基础信息总览服务。
 */
@Service
public class AdminOverviewServiceImpl implements AdminOverviewService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final String ACCESS_NOTICE = "管理员账号当前仅开放基础信息摘要，图片、评论、消息提醒和编辑能力暂不开放。";

    private final CoupleProfileMapper coupleProfileMapper;
    private final CountdownPlanMapper countdownPlanMapper;
    private final AnniversaryEventMapper anniversaryEventMapper;

    public AdminOverviewServiceImpl(CoupleProfileMapper coupleProfileMapper,
                                    CountdownPlanMapper countdownPlanMapper,
                                    AnniversaryEventMapper anniversaryEventMapper) {
        this.coupleProfileMapper = coupleProfileMapper;
        this.countdownPlanMapper = countdownPlanMapper;
        this.anniversaryEventMapper = anniversaryEventMapper;
    }

    @Override
    public AdminOverviewResponse getOverview() {
        List<CoupleProfile> normalProfiles = coupleProfileMapper.selectList(new LambdaQueryWrapper<CoupleProfile>()
                        .eq(CoupleProfile::getAccountType, AccountTypeConstants.NORMAL)
                        .orderByAsc(CoupleProfile::getId))
                .stream()
                .limit(2)
                .collect(Collectors.toList());

        String anniversaryDate = resolveAnniversaryDate(normalProfiles);
        CountdownPlan countdownPlan = countdownPlanMapper.selectOne(new LambdaQueryWrapper<CountdownPlan>()
                .orderByAsc(CountdownPlan::getId)
                .last("LIMIT 1"));
        AnniversaryEvent anniversaryEvent = resolveAnniversaryEvent();

        return AdminOverviewResponse.builder()
                .accountType(AuthContext.getRequiredAccountType())
                .currentUsername(AuthContext.getRequiredUsername())
                .accessNotice(ACCESS_NOTICE)
                .anniversaryDate(anniversaryDate)
                .togetherDays(resolveTogetherDays(anniversaryDate))
                .profileList(normalProfiles.stream()
                        .map(this::toProfileSummary)
                        .collect(Collectors.toList()))
                .countdown(toCountdownSummary(countdownPlan))
                .anniversary(toAnniversarySummary(anniversaryEvent))
                .build();
    }

    @Override
    public AdminCountdownDetailResponse getCountdownDetail() {
        CountdownPlan countdownPlan = countdownPlanMapper.selectOne(new LambdaQueryWrapper<CountdownPlan>()
                .orderByAsc(CountdownPlan::getId)
                .last("LIMIT 1"));
        return toCountdownDetail(countdownPlan);
    }

    @Override
    public List<AdminAnniversaryDetailResponse> listAnniversaries(String status) {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<AnniversaryEvent> queryWrapper = new LambdaQueryWrapper<>();
        String safeStatus = String.valueOf(status).trim().toLowerCase(Locale.ROOT);
        if ("past".equals(safeStatus)) {
            queryWrapper.lt(AnniversaryEvent::getEventDate, today);
        } else if ("future".equals(safeStatus)) {
            queryWrapper.ge(AnniversaryEvent::getEventDate, today);
        }

        queryWrapper.orderByDesc(AnniversaryEvent::getPinned)
                .orderByDesc(AnniversaryEvent::getEventDate)
                .orderByDesc(AnniversaryEvent::getId);
        Map<String, String> nicknameMap = buildNicknameMap();
        return anniversaryEventMapper.selectList(queryWrapper).stream()
                .map(event -> toAnniversaryDetail(event, nicknameMap))
                .collect(Collectors.toList());
    }

    @Override
    public AdminAnniversaryDetailResponse getAnniversaryDetail(Long id) {
        AnniversaryEvent event = anniversaryEventMapper.selectById(id);
        if (event == null) {
            return null;
        }
        return toAnniversaryDetail(event, buildNicknameMap());
    }

    private AnniversaryEvent resolveAnniversaryEvent() {
        AnniversaryEvent pinnedEvent = anniversaryEventMapper.selectOne(new LambdaQueryWrapper<AnniversaryEvent>()
                .eq(AnniversaryEvent::getPinned, true)
                .orderByDesc(AnniversaryEvent::getUpdatedAt)
                .orderByDesc(AnniversaryEvent::getId)
                .last("LIMIT 1"));
        if (pinnedEvent != null) {
            return pinnedEvent;
        }
        return anniversaryEventMapper.selectOne(new LambdaQueryWrapper<AnniversaryEvent>()
                .orderByDesc(AnniversaryEvent::getUpdatedAt)
                .orderByDesc(AnniversaryEvent::getEventDate)
                .orderByDesc(AnniversaryEvent::getId)
                .last("LIMIT 1"));
    }

    private AdminProfileSummaryResponse toProfileSummary(CoupleProfile profile) {
        return AdminProfileSummaryResponse.builder()
                .username(defaultIfBlank(profile.getUsername(), ""))
                .nickname(defaultIfBlank(profile.getNickname(), "未设置昵称"))
                .city(defaultIfBlank(profile.getCity(), "未设置城市"))
                .build();
    }

    private AdminCountdownSummaryResponse toCountdownSummary(CountdownPlan plan) {
        if (plan == null) {
            return AdminCountdownSummaryResponse.builder()
                    .loverName("")
                    .place("")
                    .nextMeetingAt("")
                    .lastMeetingAt("")
                    .allDay(false)
                    .daysUntilNextMeeting(0L)
                    .build();
        }

        LocalDate nextMeetingDate = plan.getNextMeetingAt() == null ? null : plan.getNextMeetingAt().toLocalDate();
        long daysUntilNextMeeting = nextMeetingDate == null ? 0L : ChronoUnit.DAYS.between(LocalDate.now(), nextMeetingDate);
        return AdminCountdownSummaryResponse.builder()
                .loverName(defaultIfBlank(plan.getLoverName(), ""))
                .place(defaultIfBlank(plan.getPlace(), ""))
                .nextMeetingAt(formatDateTime(plan.getNextMeetingAt()))
                .lastMeetingAt(formatDate(plan.getLastMeetingAt()))
                .allDay(Boolean.TRUE.equals(plan.getIsAllDay()))
                .daysUntilNextMeeting(daysUntilNextMeeting)
                .build();
    }

    private AdminCountdownDetailResponse toCountdownDetail(CountdownPlan plan) {
        if (plan == null) {
            return AdminCountdownDetailResponse.builder()
                    .loverName("")
                    .place("")
                    .note("")
                    .nextMeetingAt("")
                    .lastMeetingAt("")
                    .allDay(false)
                    .daysUntilNextMeeting(0L)
                    .daysSinceLastMeeting(0L)
                    .progressPercent(0L)
                    .timeStatus("unknown")
                    .build();
        }

        LocalDate today = LocalDate.now();
        LocalDate nextMeetingDate = plan.getNextMeetingAt() == null ? null : plan.getNextMeetingAt().toLocalDate();
        LocalDate lastMeetingDate = plan.getLastMeetingAt() == null ? null : plan.getLastMeetingAt().toLocalDate();
        long daysUntilNextMeeting = nextMeetingDate == null ? 0L : ChronoUnit.DAYS.between(today, nextMeetingDate);
        long daysSinceLastMeeting = lastMeetingDate == null ? 0L : Math.max(0L, ChronoUnit.DAYS.between(lastMeetingDate, today));
        long progressPercent = resolveProgressPercent(lastMeetingDate, nextMeetingDate, today);

        return AdminCountdownDetailResponse.builder()
                .loverName(defaultIfBlank(plan.getLoverName(), ""))
                .place(defaultIfBlank(plan.getPlace(), ""))
                .note(defaultIfBlank(plan.getNote(), ""))
                .nextMeetingAt(formatDateTime(plan.getNextMeetingAt()))
                .lastMeetingAt(formatDate(plan.getLastMeetingAt()))
                .allDay(Boolean.TRUE.equals(plan.getIsAllDay()))
                .daysUntilNextMeeting(daysUntilNextMeeting)
                .daysSinceLastMeeting(daysSinceLastMeeting)
                .progressPercent(progressPercent)
                .timeStatus(resolveCountdownTimeStatus(daysUntilNextMeeting))
                .build();
    }

    private AdminAnniversarySummaryResponse toAnniversarySummary(AnniversaryEvent event) {
        if (event == null) {
            return AdminAnniversarySummaryResponse.builder()
                    .id(0L)
                    .title("")
                    .eventDate("")
                    .pinned(false)
                    .dayOffset(0L)
                    .build();
        }

        long dayOffset = event.getEventDate() == null ? 0L : ChronoUnit.DAYS.between(LocalDate.now(), event.getEventDate());
        return AdminAnniversarySummaryResponse.builder()
                .id(event.getId())
                .title(defaultIfBlank(event.getTitle(), ""))
                .eventDate(formatDate(event.getEventDate()))
                .pinned(Boolean.TRUE.equals(event.getPinned()))
                .dayOffset(dayOffset)
                .build();
    }

    private AdminAnniversaryDetailResponse toAnniversaryDetail(AnniversaryEvent event, Map<String, String> nicknameMap) {
        long dayOffset = event.getEventDate() == null ? 0L : ChronoUnit.DAYS.between(LocalDate.now(), event.getEventDate());
        return AdminAnniversaryDetailResponse.builder()
                .id(event.getId())
                .title(defaultIfBlank(event.getTitle(), ""))
                .type(defaultIfBlank(event.getType(), "custom"))
                .eventDate(formatDate(event.getEventDate()))
                .description(defaultIfBlank(event.getDescription(), ""))
                .location(defaultIfBlank(event.getLocation(), ""))
                .pinned(Boolean.TRUE.equals(event.getPinned()))
                .timeStatus(dayOffset >= 0 ? "future" : "past")
                .dayOffset(dayOffset)
                .creatorUsername(defaultIfBlank(event.getUsername(), ""))
                .creatorNickname(nicknameMap.getOrDefault(defaultIfBlank(event.getUsername(), ""), defaultIfBlank(event.getUsername(), "")))
                .build();
    }

    private String resolveAnniversaryDate(List<CoupleProfile> profiles) {
        return profiles.stream()
                .map(CoupleProfile::getAnniversaryDate)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .findFirst()
                .orElse("");
    }

    private long resolveTogetherDays(String anniversaryDate) {
        if (!StringUtils.hasText(anniversaryDate)) {
            return 0L;
        }
        try {
            return Math.max(0L, ChronoUnit.DAYS.between(LocalDate.parse(anniversaryDate.trim(), DATE_FORMATTER), LocalDate.now()));
        } catch (Exception exception) {
            return 0L;
        }
    }

    private long resolveProgressPercent(LocalDate lastMeetingDate, LocalDate nextMeetingDate, LocalDate today) {
        if (lastMeetingDate == null || nextMeetingDate == null || today == null) {
            return 0L;
        }
        long totalDays = ChronoUnit.DAYS.between(lastMeetingDate, nextMeetingDate);
        if (totalDays <= 0) {
            return 0L;
        }
        long passedDays = ChronoUnit.DAYS.between(lastMeetingDate, today);
        long percent = Math.round((passedDays * 100.0d) / totalDays);
        return Math.max(0L, Math.min(100L, percent));
    }

    private String resolveCountdownTimeStatus(long daysUntilNextMeeting) {
        if (daysUntilNextMeeting < 0) {
            return "past";
        }
        if (daysUntilNextMeeting == 0) {
            return "today";
        }
        if (daysUntilNextMeeting <= 7) {
            return "soon";
        }
        return "future";
    }

    private Map<String, String> buildNicknameMap() {
        Map<String, String> result = new HashMap<>();
        for (CoupleProfile profile : coupleProfileMapper.selectList(new LambdaQueryWrapper<CoupleProfile>()
                .eq(CoupleProfile::getAccountType, AccountTypeConstants.NORMAL))) {
            result.put(profile.getUsername(), profile.getNickname());
        }
        return result;
    }

    private String formatDate(LocalDateTime value) {
        return value == null ? "" : value.toLocalDate().format(DATE_FORMATTER);
    }

    private String formatDate(LocalDate value) {
        return value == null ? "" : value.format(DATE_FORMATTER);
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "" : value.format(DATE_TIME_FORMATTER);
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }
}
