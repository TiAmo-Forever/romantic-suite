package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.common.NotificationBizTypeConstants;
import org.love.romantic.common.NotificationTypeConstants;
import org.love.romantic.entity.BizCommentRecord;
import org.love.romantic.entity.BizLikeRecord;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.entity.RomanticPlan;
import org.love.romantic.entity.RomanticPlanFeedback;
import org.love.romantic.entity.RomanticPlanItem;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.BizCommentRecordMapper;
import org.love.romantic.mapper.BizLikeRecordMapper;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.mapper.RomanticPlanFeedbackMapper;
import org.love.romantic.mapper.RomanticPlanItemMapper;
import org.love.romantic.mapper.RomanticPlanMapper;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.InteractionLikeUserResponse;
import org.love.romantic.model.RomanticPlanFeedbackRequest;
import org.love.romantic.model.RomanticPlanFeedbackResponse;
import org.love.romantic.model.RomanticPlanItemRequest;
import org.love.romantic.model.RomanticPlanItemResponse;
import org.love.romantic.model.RomanticPlanRequest;
import org.love.romantic.model.RomanticPlanResponse;
import org.love.romantic.service.RomanticPlanService;
import org.love.romantic.service.UserNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RomanticPlanServiceImpl implements RomanticPlanService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final RomanticPlanMapper romanticPlanMapper;
    private final RomanticPlanItemMapper romanticPlanItemMapper;
    private final RomanticPlanFeedbackMapper romanticPlanFeedbackMapper;
    private final BizLikeRecordMapper bizLikeRecordMapper;
    private final BizCommentRecordMapper bizCommentRecordMapper;
    private final CoupleProfileMapper coupleProfileMapper;
    private final UserNotificationService userNotificationService;

    public RomanticPlanServiceImpl(RomanticPlanMapper romanticPlanMapper,
                                   RomanticPlanItemMapper romanticPlanItemMapper,
                                   RomanticPlanFeedbackMapper romanticPlanFeedbackMapper,
                                   BizLikeRecordMapper bizLikeRecordMapper,
                                   BizCommentRecordMapper bizCommentRecordMapper,
                                   CoupleProfileMapper coupleProfileMapper,
                                   UserNotificationService userNotificationService) {
        this.romanticPlanMapper = romanticPlanMapper;
        this.romanticPlanItemMapper = romanticPlanItemMapper;
        this.romanticPlanFeedbackMapper = romanticPlanFeedbackMapper;
        this.bizLikeRecordMapper = bizLikeRecordMapper;
        this.bizCommentRecordMapper = bizCommentRecordMapper;
        this.coupleProfileMapper = coupleProfileMapper;
        this.userNotificationService = userNotificationService;
    }

    @Override
    public List<RomanticPlanResponse> listPlans(String status) {
        String currentUsername = AuthContext.getRequiredUsername();
        String safeStatus = defaultIfBlank(status, "all").trim().toLowerCase(Locale.ROOT);
        LambdaQueryWrapper<RomanticPlan> queryWrapper = new LambdaQueryWrapper<>();
        if (!"all".equals(safeStatus)) {
            queryWrapper.eq(RomanticPlan::getStatus, normalizeStatus(safeStatus));
        }
        queryWrapper.orderByDesc(RomanticPlan::getUpdatedAt).orderByDesc(RomanticPlan::getId);
        Map<String, String> nicknameMap = buildNicknameMap();
        return romanticPlanMapper.selectList(queryWrapper).stream()
                .map(plan -> toResponse(plan, currentUsername, nicknameMap))
                .collect(Collectors.toList());
    }

    @Override
    public RomanticPlanResponse getPlan(Long id) {
        return toResponse(requirePlan(id), AuthContext.getRequiredUsername(), buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RomanticPlanResponse createPlan(RomanticPlanRequest request) {
        String operator = AuthContext.getRequiredUsername();
        LocalDateTime now = LocalDateTime.now();
        RomanticPlan plan = RomanticPlan.builder()
                .creatorUsername(operator)
                .updatedBy(operator)
                .createdAt(now)
                .updatedAt(now)
                .build();
        applyRequest(plan, request);
        romanticPlanMapper.insert(plan);
        replaceItems(plan.getId(), request.getItemList(), operator);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ROMANTIC_PLAN_CREATED,
                "新建了一个浪漫计划",
                "“" + plan.getTitle() + "”已经被加入你们的共同安排里。",
                NotificationBizTypeConstants.ROMANTIC_PLAN,
                plan.getId(),
                Map.of("title", plan.getTitle(), "planId", plan.getId())
        );
        return getPlan(plan.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RomanticPlanResponse updatePlan(Long id, RomanticPlanRequest request) {
        String operator = AuthContext.getRequiredUsername();
        RomanticPlan plan = requirePlan(id);
        String creatorUsername = plan.getCreatorUsername();
        LocalDateTime createdAt = plan.getCreatedAt();
        applyRequest(plan, request);
        plan.setCreatorUsername(creatorUsername);
        plan.setCreatedAt(createdAt);
        plan.setUpdatedBy(operator);
        plan.setUpdatedAt(LocalDateTime.now());
        romanticPlanMapper.updateById(plan);
        replaceItems(id, request.getItemList(), operator);
        refreshPlanStatusFromItems(plan);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ROMANTIC_PLAN_UPDATED,
                "一起更新了一个计划",
                "“" + plan.getTitle() + "”刚刚补充了新的安排。",
                NotificationBizTypeConstants.ROMANTIC_PLAN,
                id,
                Map.of("title", plan.getTitle(), "planId", id)
        );
        return getPlan(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePlan(Long id) {
        String operator = AuthContext.getRequiredUsername();
        RomanticPlan plan = requirePlan(id);
        romanticPlanItemMapper.delete(new LambdaQueryWrapper<RomanticPlanItem>().eq(RomanticPlanItem::getPlanId, id));
        romanticPlanFeedbackMapper.delete(new LambdaQueryWrapper<RomanticPlanFeedback>().eq(RomanticPlanFeedback::getPlanId, id));
        bizLikeRecordMapper.delete(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ROMANTIC_PLAN)
                .eq(BizLikeRecord::getBizId, id));
        bizCommentRecordMapper.delete(new LambdaQueryWrapper<BizCommentRecord>()
                .eq(BizCommentRecord::getBizType, NotificationBizTypeConstants.ROMANTIC_PLAN)
                .eq(BizCommentRecord::getBizId, id));
        romanticPlanMapper.deleteById(id);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ROMANTIC_PLAN_DELETED,
                "一个浪漫计划被收起来了",
                "“" + plan.getTitle() + "”刚刚从计划列表里移除了。",
                NotificationBizTypeConstants.ROMANTIC_PLAN,
                0L,
                Map.of("title", plan.getTitle(), "planId", id, "deleted", true)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RomanticPlanResponse addFeedback(Long id, RomanticPlanFeedbackRequest request) {
        String operator = AuthContext.getRequiredUsername();
        RomanticPlan plan = requirePlan(id);
        RomanticPlanFeedback feedback = RomanticPlanFeedback.builder()
                .planId(id)
                .planItemId(request.getPlanItemId() == null ? 0L : request.getPlanItemId())
                .feedbackDate(parseDate(request.getFeedbackDate()))
                .status(normalizeFeedbackStatus(request.getStatus()))
                .content(defaultIfBlank(request.getContent(), "").trim())
                .creatorUsername(operator)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        if (!StringUtils.hasText(feedback.getContent())) {
            throw new BusinessException("反馈内容不能为空");
        }
        if (feedback.getPlanItemId() != null && feedback.getPlanItemId() > 0) {
            requireItem(id, feedback.getPlanItemId());
        }
        romanticPlanFeedbackMapper.insert(feedback);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ROMANTIC_PLAN_FEEDBACK_CREATED,
                "计划里多了一条新反馈",
                "“" + plan.getTitle() + "”刚刚记录了新的执行反馈。",
                NotificationBizTypeConstants.ROMANTIC_PLAN,
                id,
                Map.of("title", plan.getTitle(), "planId", id, "feedbackDate", DATE_FORMATTER.format(feedback.getFeedbackDate()))
        );
        return getPlan(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RomanticPlanResponse toggleItemCompletion(Long id, Long itemId, boolean completed) {
        String operator = AuthContext.getRequiredUsername();
        RomanticPlan plan = requirePlan(id);
        RomanticPlanItem item = requireItem(id, itemId);
        item.setCompleted(completed);
        item.setCompletedAt(completed ? LocalDateTime.now() : null);
        item.setUpdatedAt(LocalDateTime.now());
        romanticPlanItemMapper.updateById(item);
        refreshPlanStatusFromItems(plan);
        if (completed) {
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.ROMANTIC_PLAN_ITEM_COMPLETED,
                    "计划里完成了一项安排",
                    "“" + plan.getTitle() + "”里的“" + item.getTitle() + "”已经打上完成标记。",
                    NotificationBizTypeConstants.ROMANTIC_PLAN,
                    id,
                    Map.of("title", plan.getTitle(), "planId", id, "itemId", itemId, "itemTitle", item.getTitle())
            );
        }
        return getPlan(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionLikeToggleResponse togglePlanLike(Long id) {
        String operator = AuthContext.getRequiredUsername();
        RomanticPlan plan = requirePlan(id);
        boolean liked;
        LambdaQueryWrapper<BizLikeRecord> queryWrapper = new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ROMANTIC_PLAN)
                .eq(BizLikeRecord::getBizId, id)
                .eq(BizLikeRecord::getUsername, operator);
        if (bizLikeRecordMapper.selectCount(queryWrapper) > 0) {
            bizLikeRecordMapper.delete(queryWrapper);
            liked = false;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.ROMANTIC_PLAN_UNLIKED,
                    "一个计划少了一颗喜欢",
                    "“" + plan.getTitle() + "”刚刚取消了一次点赞。",
                    NotificationBizTypeConstants.ROMANTIC_PLAN,
                    id,
                    Map.of("title", plan.getTitle(), "planId", id, "liked", false)
            );
        } else {
            bizLikeRecordMapper.insert(BizLikeRecord.builder()
                    .bizType(NotificationBizTypeConstants.ROMANTIC_PLAN)
                    .bizId(id)
                    .username(operator)
                    .createdAt(LocalDateTime.now())
                    .build());
            liked = true;
            userNotificationService.notifyPartners(
                    operator,
                    NotificationTypeConstants.ROMANTIC_PLAN_LIKED,
                    "一个计划收到了新的喜欢",
                    "“" + plan.getTitle() + "”刚刚被点亮了一次喜欢。",
                    NotificationBizTypeConstants.ROMANTIC_PLAN,
                    id,
                    Map.of("title", plan.getTitle(), "planId", id, "liked", true)
            );
        }
        return InteractionLikeToggleResponse.builder()
                .liked(liked)
                .likeCount(countPlanLikes(id))
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InteractionCommentResponse addPlanComment(Long id, InteractionCommentRequest request) {
        String operator = AuthContext.getRequiredUsername();
        RomanticPlan plan = requirePlan(id);
        String content = defaultIfBlank(request.getContent(), "").trim();
        if (!StringUtils.hasText(content)) {
            throw new BusinessException("评论内容不能为空");
        }
        LocalDateTime now = LocalDateTime.now();
        BizCommentRecord comment = BizCommentRecord.builder()
                .bizType(NotificationBizTypeConstants.ROMANTIC_PLAN)
                .bizId(id)
                .username(operator)
                .content(content)
                .createdAt(now)
                .updatedAt(now)
                .build();
        bizCommentRecordMapper.insert(comment);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ROMANTIC_PLAN_COMMENTED,
                "计划里多了一句留言",
                "“" + plan.getTitle() + "”刚刚收到了一条新评论。",
                NotificationBizTypeConstants.ROMANTIC_PLAN,
                id,
                Map.of("title", plan.getTitle(), "planId", id, "commentId", comment.getId())
        );
        return toCommentResponse(comment, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePlanComment(Long id, Long commentId) {
        String operator = AuthContext.getRequiredUsername();
        RomanticPlan plan = requirePlan(id);
        BizCommentRecord comment = requireComment(id, commentId);
        boolean canDelete = operator.equalsIgnoreCase(defaultIfBlank(comment.getUsername(), ""))
                || operator.equalsIgnoreCase(defaultIfBlank(plan.getCreatorUsername(), ""));
        if (!canDelete) {
            throw new BusinessException("当前没有权限删除这条评论");
        }
        bizCommentRecordMapper.deleteById(commentId);
        userNotificationService.notifyPartners(
                operator,
                NotificationTypeConstants.ROMANTIC_PLAN_COMMENT_DELETED,
                "计划里撤回了一句留言",
                "“" + plan.getTitle() + "”里有一条评论刚刚被删除了。",
                NotificationBizTypeConstants.ROMANTIC_PLAN,
                id,
                Map.of("title", plan.getTitle(), "planId", id, "commentId", commentId, "deleted", true)
        );
    }

    private RomanticPlan requirePlan(Long id) {
        RomanticPlan plan = romanticPlanMapper.selectById(id);
        if (plan == null) {
            throw new BusinessException("没有找到对应的浪漫计划");
        }
        return plan;
    }

    private RomanticPlanItem requireItem(Long planId, Long itemId) {
        RomanticPlanItem item = romanticPlanItemMapper.selectById(itemId);
        if (item == null || !planId.equals(item.getPlanId())) {
            throw new BusinessException("没有找到对应的计划条目");
        }
        return item;
    }

    private BizCommentRecord requireComment(Long planId, Long commentId) {
        BizCommentRecord comment = bizCommentRecordMapper.selectById(commentId);
        if (comment == null
                || !NotificationBizTypeConstants.ROMANTIC_PLAN.equals(comment.getBizType())
                || !planId.equals(comment.getBizId())) {
            throw new BusinessException("没有找到对应的评论");
        }
        return comment;
    }

    private void applyRequest(RomanticPlan plan, RomanticPlanRequest request) {
        String title = defaultIfBlank(request.getTitle(), "").trim();
        if (!StringUtils.hasText(title)) {
            throw new BusinessException("计划标题不能为空");
        }
        plan.setTitle(title);
        plan.setDescription(defaultIfBlank(request.getDescription(), "").trim());
        plan.setPlanType(normalizePlanType(request.getPlanType()));
        plan.setStatus(normalizeStatus(request.getStatus()));
        plan.setStartAt(parseDateTime(request.getStartAt(), "开始时间"));
        plan.setEndAt(parseDateTimeOrNull(request.getEndAt(), "结束时间"));
        if (plan.getEndAt() != null && plan.getEndAt().isBefore(plan.getStartAt())) {
            throw new BusinessException("结束时间不能早于开始时间");
        }
        plan.setIntervalDays(normalizeIntervalDays(request.getIntervalDays(), plan.getPlanType()));
        plan.setLocation(defaultIfBlank(request.getLocation(), "").trim());
        plan.setCoverUrl(defaultIfBlank(request.getCoverUrl(), "").trim());
    }

    private Integer normalizeIntervalDays(Integer intervalDays, String planType) {
        if (!"interval".equals(planType)) {
            return 0;
        }
        int safeValue = intervalDays == null ? 1 : intervalDays;
        if (safeValue <= 0) {
            throw new BusinessException("周期计划的间隔天数必须大于 0");
        }
        return safeValue;
    }

    private void replaceItems(Long planId, List<RomanticPlanItemRequest> itemList, String operator) {
        romanticPlanItemMapper.delete(new LambdaQueryWrapper<RomanticPlanItem>().eq(RomanticPlanItem::getPlanId, planId));
        List<RomanticPlanItemRequest> safeItems = itemList == null ? new ArrayList<>() : itemList;
        LocalDateTime now = LocalDateTime.now();
        int index = 0;
        for (RomanticPlanItemRequest itemRequest : safeItems) {
            if (itemRequest == null) {
                continue;
            }
            String title = defaultIfBlank(itemRequest.getTitle(), "").trim();
            if (!StringUtils.hasText(title)) {
                continue;
            }
            romanticPlanItemMapper.insert(RomanticPlanItem.builder()
                    .planId(planId)
                    .title(title)
                    .content(defaultIfBlank(itemRequest.getContent(), "").trim())
                    .scheduledAt(parseDateTimeOrNull(itemRequest.getScheduledAt(), "条目安排时间"))
                    .endAt(parseDateTimeOrNull(itemRequest.getEndAt(), "条目结束时间"))
                    .location(defaultIfBlank(itemRequest.getLocation(), "").trim())
                    .sortOrder(itemRequest.getSortOrder() == null ? index : itemRequest.getSortOrder())
                    .completed(Boolean.TRUE.equals(itemRequest.getCompleted()))
                    .completedAt(Boolean.TRUE.equals(itemRequest.getCompleted()) ? now : null)
                    .creatorUsername(operator)
                    .createdAt(now)
                    .updatedAt(now)
                    .build());
            index += 1;
        }
    }

    private void refreshPlanStatusFromItems(RomanticPlan plan) {
        List<RomanticPlanItem> items = listItems(plan.getId());
        if (items.isEmpty()) {
            return;
        }
        boolean allCompleted = items.stream().allMatch(item -> Boolean.TRUE.equals(item.getCompleted()));
        if (allCompleted && !"archived".equals(plan.getStatus())) {
            plan.setStatus("completed");
        } else if (!allCompleted && "completed".equals(plan.getStatus())) {
            plan.setStatus("active");
        }
        plan.setUpdatedAt(LocalDateTime.now());
        romanticPlanMapper.updateById(plan);
    }

    private RomanticPlanResponse toResponse(RomanticPlan plan, String currentUsername, Map<String, String> nicknameMap) {
        List<RomanticPlanItem> items = listItems(plan.getId());
        List<RomanticPlanFeedback> feedbacks = listFeedbacks(plan.getId());
        List<InteractionLikeUserResponse> likeUsers = listLikeUsers(plan.getId(), nicknameMap);
        List<InteractionCommentResponse> commentList = listComments(plan.getId(), nicknameMap);
        long likeCount = likeUsers.stream().mapToLong(InteractionLikeUserResponse::getLikeTimes).sum();
        int completedCount = (int) items.stream().filter(item -> Boolean.TRUE.equals(item.getCompleted())).count();
        LocalDateTime nextExecuteAt = resolveNextExecuteAt(plan, items, feedbacks);
        return RomanticPlanResponse.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .description(plan.getDescription())
                .planType(plan.getPlanType())
                .status(plan.getStatus())
                .scheduleSummary(resolveScheduleSummary(plan))
                .startAt(formatDateTime(plan.getStartAt()))
                .endAt(formatDateTime(plan.getEndAt()))
                .intervalDays(plan.getIntervalDays())
                .location(plan.getLocation())
                .coverUrl(plan.getCoverUrl())
                .creatorUsername(plan.getCreatorUsername())
                .creatorNickname(resolveNickname(plan.getCreatorUsername(), nicknameMap))
                .updaterUsername(plan.getUpdatedBy())
                .updaterNickname(resolveNickname(plan.getUpdatedBy(), nicknameMap))
                .nextExecuteAt(formatDateTime(nextExecuteAt))
                .nextExecuteLabel(resolveNextExecuteLabel(plan, nextExecuteAt))
                .totalItemCount(items.size())
                .completedItemCount(completedCount)
                .feedbackCount(feedbacks.size())
                .likeCount(likeCount)
                .likedByCurrentUser(isCurrentUserLiked(plan.getId(), currentUsername))
                .itemList(items.stream().map(item -> toItemResponse(item, nicknameMap)).collect(Collectors.toList()))
                .feedbackList(feedbacks.stream().map(feedback -> toFeedbackResponse(feedback, nicknameMap)).collect(Collectors.toList()))
                .likeUsers(likeUsers)
                .commentList(commentList)
                .build();
    }

    private RomanticPlanItemResponse toItemResponse(RomanticPlanItem item, Map<String, String> nicknameMap) {
        return RomanticPlanItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .content(item.getContent())
                .scheduledAt(formatDateTime(item.getScheduledAt()))
                .endAt(formatDateTime(item.getEndAt()))
                .location(item.getLocation())
                .sortOrder(item.getSortOrder())
                .completed(Boolean.TRUE.equals(item.getCompleted()))
                .completedAt(formatDateTime(item.getCompletedAt()))
                .creatorUsername(item.getCreatorUsername())
                .creatorNickname(resolveNickname(item.getCreatorUsername(), nicknameMap))
                .build();
    }

    private RomanticPlanFeedbackResponse toFeedbackResponse(RomanticPlanFeedback feedback, Map<String, String> nicknameMap) {
        return RomanticPlanFeedbackResponse.builder()
                .id(feedback.getId())
                .planItemId(feedback.getPlanItemId())
                .feedbackDate(feedback.getFeedbackDate() == null ? "" : DATE_FORMATTER.format(feedback.getFeedbackDate()))
                .status(feedback.getStatus())
                .content(feedback.getContent())
                .creatorUsername(feedback.getCreatorUsername())
                .creatorNickname(resolveNickname(feedback.getCreatorUsername(), nicknameMap))
                .createdAt(formatDateTime(feedback.getCreatedAt()))
                .build();
    }

    private List<RomanticPlanItem> listItems(Long planId) {
        return romanticPlanItemMapper.selectList(new LambdaQueryWrapper<RomanticPlanItem>()
                .eq(RomanticPlanItem::getPlanId, planId)
                .orderByAsc(RomanticPlanItem::getSortOrder)
                .orderByAsc(RomanticPlanItem::getScheduledAt)
                .orderByAsc(RomanticPlanItem::getId));
    }

    private List<RomanticPlanFeedback> listFeedbacks(Long planId) {
        return romanticPlanFeedbackMapper.selectList(new LambdaQueryWrapper<RomanticPlanFeedback>()
                .eq(RomanticPlanFeedback::getPlanId, planId)
                .orderByDesc(RomanticPlanFeedback::getFeedbackDate)
                .orderByDesc(RomanticPlanFeedback::getCreatedAt)
                .orderByDesc(RomanticPlanFeedback::getId));
    }

    private List<InteractionLikeUserResponse> listLikeUsers(Long planId, Map<String, String> nicknameMap) {
        Map<String, List<BizLikeRecord>> groupedMap = bizLikeRecordMapper.selectList(new LambdaQueryWrapper<BizLikeRecord>()
                        .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ROMANTIC_PLAN)
                        .eq(BizLikeRecord::getBizId, planId)
                        .orderByDesc(BizLikeRecord::getCreatedAt)
                        .orderByDesc(BizLikeRecord::getId))
                .stream()
                .collect(Collectors.groupingBy(record -> defaultIfBlank(record.getUsername(), "")));
        List<InteractionLikeUserResponse> responseList = new ArrayList<>();
        for (Map.Entry<String, List<BizLikeRecord>> entry : groupedMap.entrySet()) {
            List<BizLikeRecord> recordList = entry.getValue();
            if (recordList.isEmpty()) {
                continue;
            }
            responseList.add(InteractionLikeUserResponse.builder()
                    .username(entry.getKey())
                    .nickname(resolveNickname(entry.getKey(), nicknameMap))
                    .likeTimes(recordList.size())
                    .lastLikedAt(formatDateTime(recordList.get(0).getCreatedAt()))
                    .build());
        }
        return responseList;
    }

    private List<InteractionCommentResponse> listComments(Long planId, Map<String, String> nicknameMap) {
        return bizCommentRecordMapper.selectList(new LambdaQueryWrapper<BizCommentRecord>()
                        .eq(BizCommentRecord::getBizType, NotificationBizTypeConstants.ROMANTIC_PLAN)
                        .eq(BizCommentRecord::getBizId, planId)
                        .orderByDesc(BizCommentRecord::getCreatedAt)
                        .orderByDesc(BizCommentRecord::getId))
                .stream()
                .map(comment -> toCommentResponse(comment, nicknameMap))
                .collect(Collectors.toList());
    }

    private InteractionCommentResponse toCommentResponse(BizCommentRecord comment, Map<String, String> nicknameMap) {
        return InteractionCommentResponse.builder()
                .id(comment.getId())
                .commenterUsername(comment.getUsername())
                .commenterNickname(resolveNickname(comment.getUsername(), nicknameMap))
                .content(comment.getContent())
                .createdAt(formatDateTime(comment.getCreatedAt()))
                .updatedAt(formatDateTime(comment.getUpdatedAt()))
                .build();
    }

    private Map<String, String> buildNicknameMap() {
        Map<String, String> nicknameMap = new HashMap<>();
        for (CoupleProfile profile : coupleProfileMapper.selectList(null)) {
            nicknameMap.put(defaultIfBlank(profile.getUsername(), ""), defaultIfBlank(profile.getNickname(), profile.getUsername()));
        }
        return nicknameMap;
    }

    private String resolveNickname(String username, Map<String, String> nicknameMap) {
        String safeUsername = defaultIfBlank(username, "").trim();
        if (!StringUtils.hasText(safeUsername)) {
            return "";
        }
        return defaultIfBlank(nicknameMap.get(safeUsername), safeUsername);
    }

    private boolean isCurrentUserLiked(Long planId, String currentUsername) {
        if (!StringUtils.hasText(currentUsername)) {
            return false;
        }
        return bizLikeRecordMapper.selectCount(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ROMANTIC_PLAN)
                .eq(BizLikeRecord::getBizId, planId)
                .eq(BizLikeRecord::getUsername, currentUsername)) > 0;
    }

    private long countPlanLikes(Long planId) {
        return bizLikeRecordMapper.selectCount(new LambdaQueryWrapper<BizLikeRecord>()
                .eq(BizLikeRecord::getBizType, NotificationBizTypeConstants.ROMANTIC_PLAN)
                .eq(BizLikeRecord::getBizId, planId));
    }

    private String resolveScheduleSummary(RomanticPlan plan) {
        if ("interval".equals(plan.getPlanType())) {
            return "每 " + Math.max(1, plan.getIntervalDays() == null ? 1 : plan.getIntervalDays()) + " 天一次";
        }
        if ("stage".equals(plan.getPlanType())) {
            return "按阶段推进安排";
        }
        return "按日程逐项执行";
    }

    private LocalDateTime resolveNextExecuteAt(RomanticPlan plan,
                                               List<RomanticPlanItem> items,
                                               List<RomanticPlanFeedback> feedbacks) {
        LocalDateTime now = LocalDateTime.now();
        if ("interval".equals(plan.getPlanType())) {
            int intervalDays = Math.max(1, plan.getIntervalDays() == null ? 1 : plan.getIntervalDays());
            LocalDateTime anchor = plan.getStartAt();
            if (!feedbacks.isEmpty() && feedbacks.get(0).getFeedbackDate() != null) {
                anchor = feedbacks.get(0).getFeedbackDate().atStartOfDay();
            }
            LocalDateTime next = anchor;
            while (next != null && !next.isAfter(now)) {
                next = next.plusDays(intervalDays);
            }
            return next;
        }
        return items.stream()
                .map(RomanticPlanItem::getScheduledAt)
                .filter(value -> value != null && value.isAfter(now))
                .sorted()
                .findFirst()
                .orElse(plan.getEndAt());
    }

    private String resolveNextExecuteLabel(RomanticPlan plan, LocalDateTime nextExecuteAt) {
        if ("completed".equals(plan.getStatus())) {
            return "这份计划已经全部完成";
        }
        if (nextExecuteAt == null) {
            return "先把下一段安排补进计划里吧";
        }
        Duration duration = Duration.between(LocalDateTime.now(), nextExecuteAt);
        long totalMinutes = Math.max(0, duration.toMinutes());
        long days = totalMinutes / (24 * 60);
        long hours = (totalMinutes % (24 * 60)) / 60;
        long minutes = totalMinutes % 60;
        if ("interval".equals(plan.getPlanType())) {
            return "距离下次还有 " + days + " 天 " + hours + " 小时";
        }
        if (days > 0) {
            return "距离下一项还有 " + days + " 天 " + hours + " 小时";
        }
        return "距离下一项还有 " + hours + " 小时 " + minutes + " 分";
    }

    private String normalizePlanType(String planType) {
        String safeValue = defaultIfBlank(planType, "daily").trim().toLowerCase(Locale.ROOT);
        if (!"daily".equals(safeValue) && !"interval".equals(safeValue) && !"stage".equals(safeValue)) {
            throw new BusinessException("计划类型只支持 daily、interval、stage");
        }
        return safeValue;
    }

    private String normalizeStatus(String status) {
        String safeValue = defaultIfBlank(status, "active").trim().toLowerCase(Locale.ROOT);
        if (!"draft".equals(safeValue)
                && !"active".equals(safeValue)
                && !"completed".equals(safeValue)
                && !"archived".equals(safeValue)) {
            throw new BusinessException("计划状态只支持 draft、active、completed、archived");
        }
        return safeValue;
    }

    private String normalizeFeedbackStatus(String status) {
        String safeValue = defaultIfBlank(status, "done").trim().toLowerCase(Locale.ROOT);
        if (!"done".equals(safeValue) && !"partial".equals(safeValue) && !"missed".equals(safeValue)) {
            throw new BusinessException("反馈状态只支持 done、partial、missed");
        }
        return safeValue;
    }

    private LocalDateTime parseDateTime(String value, String fieldName) {
        LocalDateTime result = parseDateTimeOrNull(value, fieldName);
        if (result == null) {
            throw new BusinessException(fieldName + "不能为空");
        }
        return result;
    }

    private LocalDateTime parseDateTimeOrNull(String value, String fieldName) {
        String safeValue = defaultIfBlank(value, "").trim();
        if (!StringUtils.hasText(safeValue)) {
            return null;
        }
        try {
            if (safeValue.length() == 10) {
                return LocalDate.parse(safeValue, DATE_FORMATTER).atStartOfDay();
            }
            String normalized = safeValue.replace('T', ' ');
            if (normalized.length() == 16) {
                normalized = normalized + ":00";
            }
            return LocalDateTime.parse(normalized, DATE_TIME_FORMATTER);
        } catch (DateTimeParseException exception) {
            throw new BusinessException(fieldName + "格式不正确，请使用 yyyy-MM-dd HH:mm:ss");
        }
    }

    private LocalDate parseDate(String value) {
        String safeValue = defaultIfBlank(value, "").trim();
        if (!StringUtils.hasText(safeValue)) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(safeValue, DATE_FORMATTER);
        } catch (DateTimeParseException exception) {
            throw new BusinessException("反馈日期格式不正确，请使用 yyyy-MM-dd");
        }
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "" : DATE_TIME_FORMATTER.format(value);
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }
}
