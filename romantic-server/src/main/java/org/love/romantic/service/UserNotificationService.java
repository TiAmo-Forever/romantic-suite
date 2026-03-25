package org.love.romantic.service;

import org.love.romantic.model.UserNotificationResponse;

import java.util.List;
import java.util.Map;

public interface UserNotificationService {

    List<UserNotificationResponse> listCurrentUserNotifications();

    long countCurrentUserUnreadNotifications();

    void markCurrentUserNotificationRead(Long id);

    void markAllCurrentUserNotificationsRead();

    void notifyPartners(String actorUsername,
                        String type,
                        String title,
                        String content,
                        String bizType,
                        Long bizId,
                        Map<String, Object> payload);
}
