package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.MealDailyPlanRequest;
import org.love.romantic.model.MealDailyPlanResponse;
import org.love.romantic.model.MealDishPageResponse;
import org.love.romantic.model.MealDishRequest;
import org.love.romantic.model.MealDishResponse;
import org.love.romantic.model.MealWeeklyRequest;
import org.love.romantic.model.MealWeeklyResponse;
import org.love.romantic.service.MealService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Api(tags = "情侣点菜")
@RestController
@RequestMapping("/api/meals")
public class MealController {

    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    @ApiOperation("查询菜谱列表")
    @GetMapping("/dishes")
    public ApiResponse<MealDishPageResponse> listDishes(
            @ApiParam("分类：all、cold、hot、soup、staple") @RequestParam(defaultValue = "all") String category,
            @ApiParam("偏好：all、me、partner、both、none") @RequestParam(defaultValue = "all") String preference,
            @ApiParam("关键词") @RequestParam(required = false, defaultValue = "") String keyword,
            @ApiParam("日期，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date,
            @ApiParam("页码") @RequestParam(defaultValue = "1") long page,
            @ApiParam("每页条数") @RequestParam(defaultValue = "10") long pageSize) {
        return ApiResponse.ok("查询成功", mealService.listDishes(category, preference, keyword, date, page, pageSize));
    }

    @ApiOperation("查询菜品详情")
    @GetMapping("/dishes/{id}")
    public ApiResponse<MealDishResponse> getDish(@ApiParam("菜品 ID") @PathVariable Long id,
                                                 @ApiParam("日期，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date) {
        return ApiResponse.ok("查询成功", mealService.getDish(id, date));
    }

    @ApiOperation("新增菜品")
    @PostMapping("/dishes")
    public ApiResponse<MealDishResponse> createDish(@Validated @RequestBody MealDishRequest request) {
        return ApiResponse.ok("保存成功", mealService.createDish(request));
    }

    @ApiOperation("更新菜品")
    @PutMapping("/dishes/{id}")
    public ApiResponse<MealDishResponse> updateDish(@ApiParam("菜品 ID") @PathVariable Long id,
                                                    @Validated @RequestBody MealDishRequest request) {
        return ApiResponse.ok("保存成功", mealService.updateDish(id, request));
    }

    @ApiOperation("删除菜品")
    @DeleteMapping("/dishes/{id}")
    public ApiResponse<Void> deleteDish(@ApiParam("菜品 ID") @PathVariable Long id) {
        mealService.deleteDish(id);
        return ApiResponse.ok("删除成功", null);
    }

    @ApiOperation("查询指定日期菜单")
    @GetMapping("/daily")
    public ApiResponse<MealDailyPlanResponse> getDailyPlan(
            @ApiParam("日期，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date) {
        return ApiResponse.ok("查询成功", mealService.getDailyPlan(date));
    }

    @ApiOperation("保存指定日期菜单")
    @PutMapping("/daily")
    public ApiResponse<MealDailyPlanResponse> saveDailyPlan(
            @ApiParam("日期，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date,
            @Validated @RequestBody MealDailyPlanRequest request) {
        return ApiResponse.ok("保存成功", mealService.saveDailyPlan(date, request));
    }

    @ApiOperation("把菜加入指定日期菜单")
    @PostMapping("/daily/dishes/{dishId}")
    public ApiResponse<MealDailyPlanResponse> addDishToDailyPlan(
            @ApiParam("日期，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date,
            @ApiParam("菜品 ID") @PathVariable Long dishId) {
        return ApiResponse.ok("已加入今天", mealService.addDishToDailyPlan(date, dishId));
    }

    @ApiOperation("从指定日期菜单移除条目")
    @DeleteMapping("/daily/items/{itemId}")
    public ApiResponse<MealDailyPlanResponse> removeDailyPlanItem(
            @ApiParam("日期，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date,
            @ApiParam("菜单条目 ID") @PathVariable Long itemId) {
        return ApiResponse.ok("已移除", mealService.removeDailyPlanItem(date, itemId));
    }

    @ApiOperation("替换指定日期菜单条目")
    @PutMapping("/daily/items/{itemId}/replace")
    public ApiResponse<MealDailyPlanResponse> replaceDailyPlanItem(
            @ApiParam("日期，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date,
            @ApiParam("菜单条目 ID") @PathVariable Long itemId) {
        return ApiResponse.ok("已换一道", mealService.replaceDailyPlanItem(date, itemId));
    }

    @ApiOperation("复制前一天菜单")
    @PostMapping("/daily/copy-previous")
    public ApiResponse<MealDailyPlanResponse> copyPreviousDailyPlan(
            @ApiParam("日期，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date) {
        return ApiResponse.ok("已复制昨天菜单", mealService.copyPreviousDailyPlan(date));
    }

    @ApiOperation("查询本周精选")
    @GetMapping("/weekly")
    public ApiResponse<MealWeeklyResponse> getWeeklySelection(
            @ApiParam("任意一日，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date) {
        return ApiResponse.ok("查询成功", mealService.getWeeklySelection(date));
    }

    @ApiOperation("保存本周精选")
    @PutMapping("/weekly")
    public ApiResponse<MealWeeklyResponse> saveWeeklySelection(
            @ApiParam("任意一日，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date,
            @Validated @RequestBody MealWeeklyRequest request) {
        return ApiResponse.ok("保存成功", mealService.saveWeeklySelection(date, request));
    }

    @ApiOperation("加入本周精选")
    @PostMapping("/weekly/dishes/{dishId}")
    public ApiResponse<MealWeeklyResponse> addDishToWeeklySelection(
            @ApiParam("任意一日，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date,
            @ApiParam("菜品 ID") @PathVariable Long dishId) {
        return ApiResponse.ok("已加入本周精选", mealService.addDishToWeeklySelection(date, dishId));
    }

    @ApiOperation("移出本周精选")
    @DeleteMapping("/weekly/dishes/{dishId}")
    public ApiResponse<MealWeeklyResponse> removeDishFromWeeklySelection(
            @ApiParam("任意一日，格式 yyyy-MM-dd") @RequestParam(required = false, defaultValue = "") String date,
            @ApiParam("菜品 ID") @PathVariable Long dishId) {
        return ApiResponse.ok("已移出本周精选", mealService.removeDishFromWeeklySelection(date, dishId));
    }
}
