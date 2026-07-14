package org.love.romantic.service;

import org.love.romantic.model.MealDailyPlanRequest;
import org.love.romantic.model.MealDailyPlanResponse;
import org.love.romantic.model.MealDishPageResponse;
import org.love.romantic.model.MealDishRequest;
import org.love.romantic.model.MealDishResponse;
import org.love.romantic.model.MealWeeklyRequest;
import org.love.romantic.model.MealWeeklyResponse;

public interface MealService {

    MealDishPageResponse listDishes(String category, String preference, String keyword, String date, long pageNo, long pageSize);

    MealDishResponse getDish(Long id, String date);

    MealDishResponse createDish(MealDishRequest request);

    MealDishResponse updateDish(Long id, MealDishRequest request);

    void deleteDish(Long id);

    MealDailyPlanResponse getDailyPlan(String date);

    MealDailyPlanResponse saveDailyPlan(String date, MealDailyPlanRequest request);

    MealDailyPlanResponse addDishToDailyPlan(String date, Long dishId);

    MealDailyPlanResponse removeDailyPlanItem(String date, Long itemId);

    MealDailyPlanResponse replaceDailyPlanItem(String date, Long itemId);

    MealDailyPlanResponse copyPreviousDailyPlan(String date);

    MealWeeklyResponse getWeeklySelection(String date);

    MealWeeklyResponse saveWeeklySelection(String date, MealWeeklyRequest request);

    MealWeeklyResponse addDishToWeeklySelection(String date, Long dishId);

    MealWeeklyResponse removeDishFromWeeklySelection(String date, Long dishId);
}
