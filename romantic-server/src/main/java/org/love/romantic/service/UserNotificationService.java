package org.love.romantic.service;

import org.love.romantic.model.UserNotificationResponse;
import org.love.romantic.model.UserNotificationPageResponse;

import java.util.List;
import java.util.Map;

public interface UserNotificationService {

    List<UserNotificationResponse> listCurrentUserNotifications();

    UserNotificationPageResponse pageCurrentUserNotifications(String filter, long pageNo, long pageSize);

    long countCurrentUserUnreadNotifications();

    long countCurrentUserTotalNotifications();

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
