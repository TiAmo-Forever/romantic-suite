package org.love.romantic.service;

import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;
import org.love.romantic.model.RomanticPlanFeedbackRequest;
import org.love.romantic.model.RomanticPlanRequest;
import org.love.romantic.model.RomanticPlanResponse;

import java.util.List;

public interface RomanticPlanService {

    List<RomanticPlanResponse> listPlans(String status);

    RomanticPlanResponse getPlan(Long id);

    RomanticPlanResponse createPlan(RomanticPlanRequest request);

    RomanticPlanResponse updatePlan(Long id, RomanticPlanRequest request);

    void deletePlan(Long id);

    RomanticPlanResponse addFeedback(Long id, RomanticPlanFeedbackRequest request);

    RomanticPlanResponse toggleItemCompletion(Long id, Long itemId, boolean completed);

    InteractionLikeToggleResponse togglePlanLike(Long id);

    InteractionCommentResponse addPlanComment(Long id, InteractionCommentRequest request);

    void deletePlanComment(Long id, Long commentId);
}
