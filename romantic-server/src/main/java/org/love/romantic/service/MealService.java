package org.love.romantic.service;

import org.love.romantic.model.MealDailyPlanRequest;
import org.love.romantic.model.MealDailyPlanResponse;
import org.love.romantic.model.MealDishRequest;
import org.love.romantic.model.MealDishResponse;
import org.love.romantic.model.MealWeeklyRequest;
import org.love.romantic.model.MealWeeklyResponse;

import java.util.List;

public interface MealService {

    List<MealDishResponse> listDishes(String category, String preference, String keyword);

    MealDishResponse getDish(Long id);

    MealDishResponse createDish(MealDishRequest request);

    MealDishResponse updateDish(Long id, MealDishRequest request);

    void deleteDish(Long id);

    MealDailyPlanResponse getDailyPlan(String date);

    MealDailyPlanResponse saveDailyPlan(String date, MealDailyPlanRequest request);

    MealDailyPlanResponse addDishToDailyPlan(String date, Long dishId);

    MealDailyPlanResponse removeDailyPlanItem(String date, Long itemId);

    MealWeeklyResponse getWeeklySelection(String date);

    MealWeeklyResponse saveWeeklySelection(String date, MealWeeklyRequest request);

    MealWeeklyResponse addDishToWeeklySelection(String date, Long dishId);

    MealWeeklyResponse removeDishFromWeeklySelection(String date, Long dishId);
}
