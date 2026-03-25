package org.love.romantic.service;

import org.love.romantic.model.CountdownPlanRequest;
import org.love.romantic.model.CountdownPlanResponse;

/**
 * 共享见面倒计时服务。
 */
public interface CountdownPlanService {

    CountdownPlanResponse getPlan();

    CountdownPlanResponse updatePlan(CountdownPlanRequest request);

    CountdownPlanResponse resetPlan();
}
