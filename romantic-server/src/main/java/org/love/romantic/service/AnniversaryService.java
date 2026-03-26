package org.love.romantic.service;

import org.love.romantic.model.AnniversaryEventRequest;
import org.love.romantic.model.AnniversaryEventResponse;
import org.love.romantic.model.AnniversaryReminderResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;

import java.util.List;

/**
 * 纪念日服务。
 */
public interface AnniversaryService {

    List<AnniversaryEventResponse> listEvents(String status);

    AnniversaryEventResponse getEvent(Long id);

    AnniversaryEventResponse createEvent(AnniversaryEventRequest request);

    AnniversaryEventResponse updateEvent(Long id, AnniversaryEventRequest request);

    void deleteEvent(Long id);

    InteractionLikeToggleResponse toggleLike(Long id);

    InteractionCommentResponse addComment(Long id, InteractionCommentRequest request);

    void deleteComment(Long id, Long commentId);

    List<AnniversaryReminderResponse> consumeDueReminders();
}
