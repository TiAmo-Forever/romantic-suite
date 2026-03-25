package org.love.romantic.service;

import org.love.romantic.model.AnniversaryEventRequest;
import org.love.romantic.model.AnniversaryEventResponse;
import org.love.romantic.model.AnniversaryReminderResponse;

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

    long increaseLikeCount(Long id);

    List<AnniversaryReminderResponse> consumeDueReminders();
}
