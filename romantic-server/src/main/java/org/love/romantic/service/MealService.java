package org.love.romantic.service;

import org.love.romantic.model.MealDailyPlanRequest;
import org.love.romantic.model.MealDailyPlanResponse;
import org.love.romantic.model.MealDishPageResponse;
import org.love.romantic.model.MealDishRequest;
import org.love.romantic.model.MealDishResponse;
import org.love.romantic.model.MealWeeklyRequest;
import org.love.romantic.model.MealWeeklyResponse;

public interface MealService {

    /**
     * 分页查询菜谱列表
     *
     * @param category 菜品分类筛选值
     * @param preference 偏好筛选值
     * @param keyword 菜名关键字
     * @param date 业务日期，用于计算是否已加入当天菜单
     * @param pageNo 页码
     * @param pageSize 每页条数
     * @return 菜谱分页结果
     */
    MealDishPageResponse listDishes(String category, String preference, String keyword, String date, long pageNo, long pageSize);

    /**
     * 查询菜品详情
     *
     * @param id 菜品 ID
     * @param date 业务日期，用于计算菜品当天状态
     * @return 菜品详情
     */
    MealDishResponse getDish(Long id, String date);

    /**
     * 新增菜品
     *
     * @param request 菜品保存请求
     * @return 新增后的菜品详情
     */
    MealDishResponse createDish(MealDishRequest request);

    /**
     * 更新菜品
     *
     * @param id 菜品 ID
     * @param request 菜品保存请求
     * @return 更新后的菜品详情
     */
    MealDishResponse updateDish(Long id, MealDishRequest request);

    /**
     * 删除菜品
     *
     * @param id 菜品 ID
     */
    void deleteDish(Long id);

    /**
     * 查询指定日期菜单
     *
     * @param date 菜单日期
     * @return 指定日期菜单详情
     */
    MealDailyPlanResponse getDailyPlan(String date);

    /**
     * 保存指定日期菜单
     *
     * @param date 菜单日期
     * @param request 菜单保存请求
     * @return 保存后的菜单详情
     */
    MealDailyPlanResponse saveDailyPlan(String date, MealDailyPlanRequest request);

    /**
     * 把菜品加入指定日期菜单
     *
     * @param date 菜单日期
     * @param dishId 菜品 ID
     * @return 加菜后的菜单详情
     */
    MealDailyPlanResponse addDishToDailyPlan(String date, Long dishId);

    /**
     * 从指定日期菜单移除条目
     *
     * @param date 菜单日期
     * @param itemId 菜单条目 ID
     * @return 移除后的菜单详情
     */
    MealDailyPlanResponse removeDailyPlanItem(String date, Long itemId);

    /**
     * 替换指定日期菜单条目
     *
     * @param date 菜单日期
     * @param itemId 菜单条目 ID
     * @return 替换后的菜单详情
     */
    MealDailyPlanResponse replaceDailyPlanItem(String date, Long itemId);

    /**
     * 复制前一天菜单到指定日期
     *
     * @param date 目标菜单日期
     * @return 复制后的菜单详情
     */
    MealDailyPlanResponse copyPreviousDailyPlan(String date);

    /**
     * 查询指定日期所在周的精选菜品
     *
     * @param date 周内任意日期
     * @return 本周精选详情
     */
    MealWeeklyResponse getWeeklySelection(String date);

    /**
     * 保存指定日期所在周的精选菜品
     *
     * @param date 周内任意日期
     * @param request 本周精选保存请求
     * @return 保存后的本周精选详情
     */
    MealWeeklyResponse saveWeeklySelection(String date, MealWeeklyRequest request);

    /**
     * 把菜品加入指定日期所在周的精选
     *
     * @param date 周内任意日期
     * @param dishId 菜品 ID
     * @return 加入后的本周精选详情
     */
    MealWeeklyResponse addDishToWeeklySelection(String date, Long dishId);

    /**
     * 从指定日期所在周的精选移除菜品
     *
     * @param date 周内任意日期
     * @param dishId 菜品 ID
     * @return 移除后的本周精选详情
     */
    MealWeeklyResponse removeDishFromWeeklySelection(String date, Long dishId);
}
