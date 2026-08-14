package org.love.romantic.service;

import org.love.romantic.model.NotificationRealtimeEvent;

public interface NotificationRealtimePushService {

    /**
     * 向指定账号推送实时通知事件
     *
     * @param username 目标账号
     * @param event 实时通知事件
     */
    void pushToUsername(String username, NotificationRealtimeEvent event);
}
