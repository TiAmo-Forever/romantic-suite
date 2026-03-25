package org.love.romantic.service;

import org.love.romantic.model.NotificationRealtimeEvent;

public interface NotificationRealtimePushService {

    void pushToUsername(String username, NotificationRealtimeEvent event);
}
