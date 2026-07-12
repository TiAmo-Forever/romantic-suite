package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.love.romantic.auth.AuthContext;
import org.love.romantic.entity.CoupleProfile;
import org.love.romantic.entity.MealDailyPlan;
import org.love.romantic.entity.MealDailyPlanItem;
import org.love.romantic.entity.MealDish;
import org.love.romantic.entity.MealWeeklyDish;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.CoupleProfileMapper;
import org.love.romantic.mapper.MealDailyPlanItemMapper;
import org.love.romantic.mapper.MealDailyPlanMapper;
import org.love.romantic.mapper.MealDishMapper;
import org.love.romantic.mapper.MealWeeklyDishMapper;
import org.love.romantic.model.MealDailyPlanItemResponse;
import org.love.romantic.model.MealDailyPlanRequest;
import org.love.romantic.model.MealDailyPlanResponse;
import org.love.romantic.model.MealDishRequest;
import org.love.romantic.model.MealDishResponse;
import org.love.romantic.model.MealWeeklyRequest;
import org.love.romantic.model.MealWeeklyResponse;
import org.love.romantic.service.MealService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MealServiceImpl implements MealService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final MealDishMapper mealDishMapper;
    private final MealDailyPlanMapper mealDailyPlanMapper;
    private final MealDailyPlanItemMapper mealDailyPlanItemMapper;
    private final MealWeeklyDishMapper mealWeeklyDishMapper;
    private final CoupleProfileMapper coupleProfileMapper;

    public MealServiceImpl(MealDishMapper mealDishMapper,
                           MealDailyPlanMapper mealDailyPlanMapper,
                           MealDailyPlanItemMapper mealDailyPlanItemMapper,
                           MealWeeklyDishMapper mealWeeklyDishMapper,
                           CoupleProfileMapper coupleProfileMapper) {
        this.mealDishMapper = mealDishMapper;
        this.mealDailyPlanMapper = mealDailyPlanMapper;
        this.mealDailyPlanItemMapper = mealDailyPlanItemMapper;
        this.mealWeeklyDishMapper = mealWeeklyDishMapper;
        this.coupleProfileMapper = coupleProfileMapper;
    }

    @Override
    public List<MealDishResponse> listDishes(String category, String preference, String keyword) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = resolveWeekStart(today);
        Set<Long> todayDishIds = listDailyDishIds(today);
        Set<Long> weeklyDishIds = listWeeklyDishIds(weekStart);
        Map<String, String> nicknameMap = buildNicknameMap();
        LambdaQueryWrapper<MealDish> queryWrapper = new LambdaQueryWrapper<>();
        String safeCategory = defaultIfBlank(category, "all").trim().toLowerCase(Locale.ROOT);
        String safePreference = defaultIfBlank(preference, "all").trim().toLowerCase(Locale.ROOT);
        String safeKeyword = defaultIfBlank(keyword, "").trim();
        if (!"all".equals(safeCategory)) {
            queryWrapper.eq(MealDish::getCategory, normalizeCategory(safeCategory));
        }
        if (!"all".equals(safePreference)) {
            queryWrapper.eq(MealDish::getPreference, normalizePreference(safePreference));
        }
        if (StringUtils.hasText(safeKeyword)) {
            queryWrapper.and(wrapper -> wrapper
                    .like(MealDish::getName, safeKeyword)
                    .or()
                    .like(MealDish::getMemory, safeKeyword)
                    .or()
                    .like(MealDish::getDescription, safeKeyword));
        }
        queryWrapper.orderByDesc(MealDish::getUpdatedAt).orderByDesc(MealDish::getId);
        return mealDishMapper.selectList(queryWrapper).stream()
                .map(dish -> toDishResponse(dish, nicknameMap, todayDishIds, weeklyDishIds))
                .collect(Collectors.toList());
    }

    @Override
    public MealDishResponse getDish(Long id) {
        MealDish dish = requireDish(id);
        return toDishResponse(dish, buildNicknameMap(), listDailyDishIds(LocalDate.now()), listWeeklyDishIds(resolveWeekStart(LocalDate.now())));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MealDishResponse createDish(MealDishRequest request) {
        String operator = AuthContext.getRequiredUsername();
        LocalDateTime now = LocalDateTime.now();
        MealDish dish = MealDish.builder()
                .creatorUsername(operator)
                .updatedBy(operator)
                .createdAt(now)
                .updatedAt(now)
                .build();
        applyDishRequest(dish, request);
        mealDishMapper.insert(dish);
        return getDish(dish.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MealDishResponse updateDish(Long id, MealDishRequest request) {
        String operator = AuthContext.getRequiredUsername();
        MealDish dish = requireDish(id);
        String creator = dish.getCreatorUsername();
        LocalDateTime createdAt = dish.getCreatedAt();
        applyDishRequest(dish, request);
        dish.setCreatorUsername(creator);
        dish.setCreatedAt(createdAt);
        dish.setUpdatedBy(operator);
        dish.setUpdatedAt(LocalDateTime.now());
        mealDishMapper.updateById(dish);
        return getDish(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteDish(Long id) {
        requireDish(id);
        mealDailyPlanItemMapper.delete(new LambdaQueryWrapper<MealDailyPlanItem>().eq(MealDailyPlanItem::getDishId, id));
        mealWeeklyDishMapper.delete(new LambdaQueryWrapper<MealWeeklyDish>().eq(MealWeeklyDish::getDishId, id));
        mealDishMapper.deleteById(id);
    }

    @Override
    public MealDailyPlanResponse getDailyPlan(String date) {
        LocalDate planDate = parseDateOrToday(date);
        MealDailyPlan plan = findDailyPlan(planDate);
        return toDailyPlanResponse(planDate, plan, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MealDailyPlanResponse saveDailyPlan(String date, MealDailyPlanRequest request) {
        String operator = AuthContext.getRequiredUsername();
        LocalDate planDate = parseDateOrToday(date);
        MealDailyPlan plan = ensureDailyPlan(planDate, operator);
        plan.setRemark(defaultIfBlank(request == null ? "" : request.getRemark(), "").trim());
        plan.setUpdatedBy(operator);
        plan.setUpdatedAt(LocalDateTime.now());
        mealDailyPlanMapper.updateById(plan);

        mealDailyPlanItemMapper.delete(new LambdaQueryWrapper<MealDailyPlanItem>().eq(MealDailyPlanItem::getPlanId, plan.getId()));
        replaceDailyItems(plan.getId(), request == null ? new ArrayList<>() : request.getDishIds());
        return getDailyPlan(DATE_FORMATTER.format(planDate));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MealDailyPlanResponse addDishToDailyPlan(String date, Long dishId) {
        requireDish(dishId);
        String operator = AuthContext.getRequiredUsername();
        LocalDate planDate = parseDateOrToday(date);
        MealDailyPlan plan = ensureDailyPlan(planDate, operator);
        Long exists = mealDailyPlanItemMapper.selectCount(new LambdaQueryWrapper<MealDailyPlanItem>()
                .eq(MealDailyPlanItem::getPlanId, plan.getId())
                .eq(MealDailyPlanItem::getDishId, dishId));
        if (exists <= 0) {
            int nextOrder = listDailyItems(plan.getId()).size();
            mealDailyPlanItemMapper.insert(MealDailyPlanItem.builder()
                    .planId(plan.getId())
                    .dishId(dishId)
                    .sortOrder(nextOrder)
                    .createdAt(LocalDateTime.now())
                    .build());
            touchDailyPlan(plan, operator);
        }
        return getDailyPlan(DATE_FORMATTER.format(planDate));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MealDailyPlanResponse removeDailyPlanItem(String date, Long itemId) {
        LocalDate planDate = parseDateOrToday(date);
        MealDailyPlan plan = findDailyPlan(planDate);
        if (plan != null) {
            MealDailyPlanItem item = mealDailyPlanItemMapper.selectById(itemId);
            if (item != null && plan.getId().equals(item.getPlanId())) {
                mealDailyPlanItemMapper.deleteById(itemId);
                touchDailyPlan(plan, AuthContext.getRequiredUsername());
            }
        }
        return getDailyPlan(DATE_FORMATTER.format(planDate));
    }

    @Override
    public MealWeeklyResponse getWeeklySelection(String date) {
        LocalDate weekStart = resolveWeekStart(parseDateOrToday(date));
        return toWeeklyResponse(weekStart, buildNicknameMap());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MealWeeklyResponse saveWeeklySelection(String date, MealWeeklyRequest request) {
        LocalDate weekStart = resolveWeekStart(parseDateOrToday(date));
        mealWeeklyDishMapper.delete(new LambdaQueryWrapper<MealWeeklyDish>().eq(MealWeeklyDish::getWeekStartDate, weekStart));
        replaceWeeklyItems(weekStart, request == null ? new ArrayList<>() : request.getDishIds());
        return getWeeklySelection(DATE_FORMATTER.format(weekStart));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MealWeeklyResponse addDishToWeeklySelection(String date, Long dishId) {
        requireDish(dishId);
        LocalDate weekStart = resolveWeekStart(parseDateOrToday(date));
        Long exists = mealWeeklyDishMapper.selectCount(new LambdaQueryWrapper<MealWeeklyDish>()
                .eq(MealWeeklyDish::getWeekStartDate, weekStart)
                .eq(MealWeeklyDish::getDishId, dishId));
        if (exists <= 0) {
            int nextOrder = listWeeklyItems(weekStart).size();
            mealWeeklyDishMapper.insert(MealWeeklyDish.builder()
                    .weekStartDate(weekStart)
                    .dishId(dishId)
                    .sortOrder(nextOrder)
                    .creatorUsername(AuthContext.getRequiredUsername())
                    .createdAt(LocalDateTime.now())
                    .build());
        }
        return getWeeklySelection(DATE_FORMATTER.format(weekStart));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MealWeeklyResponse removeDishFromWeeklySelection(String date, Long dishId) {
        LocalDate weekStart = resolveWeekStart(parseDateOrToday(date));
        mealWeeklyDishMapper.delete(new LambdaQueryWrapper<MealWeeklyDish>()
                .eq(MealWeeklyDish::getWeekStartDate, weekStart)
                .eq(MealWeeklyDish::getDishId, dishId));
        return getWeeklySelection(DATE_FORMATTER.format(weekStart));
    }

    private void applyDishRequest(MealDish dish, MealDishRequest request) {
        String name = defaultIfBlank(request == null ? "" : request.getName(), "").trim();
        if (!StringUtils.hasText(name)) {
            throw new BusinessException("菜名不能为空");
        }
        dish.setName(name);
        dish.setCategory(normalizeCategory(request.getCategory()));
        dish.setPreference(normalizePreference(request.getPreference()));
        dish.setCoverUrl(defaultIfBlank(request.getCoverUrl(), "").trim());
        dish.setMemory(defaultIfBlank(request.getMemory(), "").trim());
        dish.setDescription(defaultIfBlank(request.getDescription(), "").trim());
        dish.setRecipe(defaultIfBlank(request.getRecipe(), "").trim());
    }

    private void replaceDailyItems(Long planId, List<Long> dishIds) {
        int index = 0;
        for (Long dishId : distinctIds(dishIds)) {
            requireDish(dishId);
            mealDailyPlanItemMapper.insert(MealDailyPlanItem.builder()
                    .planId(planId)
                    .dishId(dishId)
                    .sortOrder(index)
                    .createdAt(LocalDateTime.now())
                    .build());
            index += 1;
        }
    }

    private void replaceWeeklyItems(LocalDate weekStart, List<Long> dishIds) {
        int index = 0;
        for (Long dishId : distinctIds(dishIds)) {
            requireDish(dishId);
            mealWeeklyDishMapper.insert(MealWeeklyDish.builder()
                    .weekStartDate(weekStart)
                    .dishId(dishId)
                    .sortOrder(index)
                    .creatorUsername(AuthContext.getRequiredUsername())
                    .createdAt(LocalDateTime.now())
                    .build());
            index += 1;
        }
    }

    private List<Long> distinctIds(List<Long> ids) {
        return new ArrayList<>(new LinkedHashSet<>(ids == null ? new ArrayList<>() : ids)).stream()
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toList());
    }

    private MealDailyPlan ensureDailyPlan(LocalDate planDate, String operator) {
        MealDailyPlan plan = findDailyPlan(planDate);
        if (plan != null) {
            return plan;
        }
        LocalDateTime now = LocalDateTime.now();
        plan = MealDailyPlan.builder()
                .planDate(planDate)
                .remark("")
                .creatorUsername(operator)
                .updatedBy(operator)
                .createdAt(now)
                .updatedAt(now)
                .build();
        mealDailyPlanMapper.insert(plan);
        return plan;
    }

    private void touchDailyPlan(MealDailyPlan plan, String operator) {
        plan.setUpdatedBy(operator);
        plan.setUpdatedAt(LocalDateTime.now());
        mealDailyPlanMapper.updateById(plan);
    }

    private MealDailyPlan findDailyPlan(LocalDate planDate) {
        return mealDailyPlanMapper.selectOne(new LambdaQueryWrapper<MealDailyPlan>()
                .eq(MealDailyPlan::getPlanDate, planDate)
                .last("LIMIT 1"));
    }

    private MealDish requireDish(Long id) {
        MealDish dish = mealDishMapper.selectById(id);
        if (dish == null) {
            throw new BusinessException("没有找到这道菜");
        }
        return dish;
    }

    private MealDailyPlanResponse toDailyPlanResponse(LocalDate planDate, MealDailyPlan plan, Map<String, String> nicknameMap) {
        List<MealDailyPlanItemResponse> items = plan == null ? new ArrayList<>() : listDailyItems(plan.getId()).stream()
                .map(item -> {
                    MealDish dish = mealDishMapper.selectById(item.getDishId());
                    if (dish == null) {
                        return null;
                    }
                    return MealDailyPlanItemResponse.builder()
                            .itemId(item.getId())
                            .dish(toDishResponse(dish, nicknameMap, Set.of(item.getDishId()), listWeeklyDishIds(resolveWeekStart(planDate))))
                            .sortOrder(item.getSortOrder())
                            .build();
                })
                .filter(item -> item != null)
                .collect(Collectors.toList());
        return MealDailyPlanResponse.builder()
                .id(plan == null ? null : plan.getId())
                .planDate(DATE_FORMATTER.format(planDate))
                .weekLabel(resolveWeekLabel(planDate))
                .remark(plan == null ? "" : defaultIfBlank(plan.getRemark(), ""))
                .dishCount(items.size())
                .itemList(items)
                .build();
    }

    private MealWeeklyResponse toWeeklyResponse(LocalDate weekStart, Map<String, String> nicknameMap) {
        Set<Long> todayDishIds = listDailyDishIds(LocalDate.now());
        List<MealDishResponse> dishes = listWeeklyItems(weekStart).stream()
                .map(item -> mealDishMapper.selectById(item.getDishId()))
                .filter(dish -> dish != null)
                .map(dish -> toDishResponse(dish, nicknameMap, todayDishIds, Set.of(dish.getId())))
                .collect(Collectors.toList());
        return MealWeeklyResponse.builder()
                .weekStartDate(DATE_FORMATTER.format(weekStart))
                .dishCount(dishes.size())
                .dishList(dishes)
                .build();
    }

    private MealDishResponse toDishResponse(MealDish dish,
                                            Map<String, String> nicknameMap,
                                            Set<Long> todayDishIds,
                                            Set<Long> weeklyDishIds) {
        return MealDishResponse.builder()
                .id(dish.getId())
                .name(dish.getName())
                .category(dish.getCategory())
                .categoryLabel(resolveCategoryLabel(dish.getCategory()))
                .preference(dish.getPreference())
                .preferenceLabel(resolvePreferenceLabel(dish.getPreference()))
                .coverUrl(defaultIfBlank(dish.getCoverUrl(), ""))
                .memory(defaultIfBlank(dish.getMemory(), ""))
                .description(defaultIfBlank(dish.getDescription(), ""))
                .recipe(defaultIfBlank(dish.getRecipe(), ""))
                .creatorUsername(dish.getCreatorUsername())
                .creatorNickname(resolveNickname(dish.getCreatorUsername(), nicknameMap))
                .updaterUsername(dish.getUpdatedBy())
                .updaterNickname(resolveNickname(dish.getUpdatedBy(), nicknameMap))
                .addedToday(todayDishIds.contains(dish.getId()))
                .selectedThisWeek(weeklyDishIds.contains(dish.getId()))
                .updatedAt(dish.getUpdatedAt() == null ? "" : DATE_TIME_FORMATTER.format(dish.getUpdatedAt()))
                .build();
    }

    private List<MealDailyPlanItem> listDailyItems(Long planId) {
        return mealDailyPlanItemMapper.selectList(new LambdaQueryWrapper<MealDailyPlanItem>()
                .eq(MealDailyPlanItem::getPlanId, planId)
                .orderByAsc(MealDailyPlanItem::getSortOrder)
                .orderByAsc(MealDailyPlanItem::getId));
    }

    private List<MealWeeklyDish> listWeeklyItems(LocalDate weekStart) {
        return mealWeeklyDishMapper.selectList(new LambdaQueryWrapper<MealWeeklyDish>()
                .eq(MealWeeklyDish::getWeekStartDate, weekStart)
                .orderByAsc(MealWeeklyDish::getSortOrder)
                .orderByAsc(MealWeeklyDish::getId));
    }

    private Set<Long> listDailyDishIds(LocalDate planDate) {
        MealDailyPlan plan = findDailyPlan(planDate);
        if (plan == null) {
            return Set.of();
        }
        return listDailyItems(plan.getId()).stream().map(MealDailyPlanItem::getDishId).collect(Collectors.toSet());
    }

    private Set<Long> listWeeklyDishIds(LocalDate weekStart) {
        return listWeeklyItems(weekStart).stream().map(MealWeeklyDish::getDishId).collect(Collectors.toSet());
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

    private LocalDate parseDateOrToday(String value) {
        String safeValue = defaultIfBlank(value, "").trim();
        if (!StringUtils.hasText(safeValue)) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(safeValue, DATE_FORMATTER);
        } catch (DateTimeParseException exception) {
            throw new BusinessException("日期格式不正确，请使用 yyyy-MM-dd");
        }
    }

    private LocalDate resolveWeekStart(LocalDate date) {
        return date.minusDays(date.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue());
    }

    private String resolveWeekLabel(LocalDate date) {
        switch (date.getDayOfWeek()) {
            case MONDAY:
                return "星期一";
            case TUESDAY:
                return "星期二";
            case WEDNESDAY:
                return "星期三";
            case THURSDAY:
                return "星期四";
            case FRIDAY:
                return "星期五";
            case SATURDAY:
                return "星期六";
            default:
                return "星期日";
        }
    }

    private String normalizeCategory(String category) {
        String safeValue = defaultIfBlank(category, "hot").trim().toLowerCase(Locale.ROOT);
        if (!"cold".equals(safeValue) && !"hot".equals(safeValue) && !"soup".equals(safeValue) && !"staple".equals(safeValue)) {
            throw new BusinessException("菜品分类只支持 cold、hot、soup、staple");
        }
        return safeValue;
    }

    private String normalizePreference(String preference) {
        String safeValue = defaultIfBlank(preference, "none").trim().toLowerCase(Locale.ROOT);
        if (!"me".equals(safeValue) && !"partner".equals(safeValue) && !"both".equals(safeValue) && !"none".equals(safeValue)) {
            throw new BusinessException("偏好标签只支持 me、partner、both、none");
        }
        return safeValue;
    }

    private String resolveCategoryLabel(String category) {
        if ("cold".equals(category)) return "凉菜";
        if ("soup".equals(category)) return "汤";
        if ("staple".equals(category)) return "主食";
        return "热菜";
    }

    private String resolvePreferenceLabel(String preference) {
        if ("me".equals(preference)) return "我最爱";
        if ("partner".equals(preference)) return "TA最爱";
        if ("both".equals(preference)) return "我们都爱";
        return "";
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }
}
