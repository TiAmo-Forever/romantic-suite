package org.love.romantic.service;

import org.love.romantic.model.CountdownPlanRequest;
import org.love.romantic.model.CountdownPlanResponse;

/**
 * 共享见面倒计时服务
 */
public interface CountdownPlanService {

    /**
     * 查询共享见面倒计时计划
     *
     * @return 见面倒计时计划详情
     */
    CountdownPlanResponse getPlan();

    /**
     * 更新共享见面倒计时计划
     *
     * @param request 见面倒计时保存请求
     * @return 更新后的见面倒计时计划详情
     */
    CountdownPlanResponse updatePlan(CountdownPlanRequest request);

    /**
     * 重置共享见面倒计时计划
     *
     * @return 重置后的见面倒计时计划详情
     */
    CountdownPlanResponse resetPlan();
}
