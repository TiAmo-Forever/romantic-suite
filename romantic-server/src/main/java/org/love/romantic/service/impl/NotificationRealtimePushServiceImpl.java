package org.love.romantic.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.love.romantic.model.NotificationRealtimeEvent;
import org.love.romantic.service.NotificationRealtimePushService;
import org.love.romantic.websocket.NotificationWebSocketSessionRegistry;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;

@Slf4j
@Service
public class NotificationRealtimePushServiceImpl implements NotificationRealtimePushService {

    private final NotificationWebSocketSessionRegistry sessionRegistry;
    private final ObjectMapper objectMapper;

    public NotificationRealtimePushServiceImpl(NotificationWebSocketSessionRegistry sessionRegistry,
                                               ObjectMapper objectMapper) {
        this.sessionRegistry = sessionRegistry;
        this.objectMapper = objectMapper;
    }

    @Override
    public void pushToUsername(String username, NotificationRealtimeEvent event) {
        if (!StringUtils.hasText(username) || event == null) {
            return;
        }

        List<WebSocketSession> sessions = sessionRegistry.listSessions(username);
        if (sessions.isEmpty()) {
            return;
        }

        try {
            TextMessage message = new TextMessage(objectMapper.writeValueAsString(event));
            for (WebSocketSession session : sessions) {
                if (!session.isOpen()) {
                    continue;
                }
                synchronized (session) {
                    session.sendMessage(message);
                }
            }
            log.info("推送通知实时事件成功，username={}, eventType={}, sessionCount={}",
                    username, event.getEventType(), sessions.size());
        } catch (Exception exception) {
            log.warn("推送通知实时事件失败，username={}, message={}", username, exception.getMessage());
        }
    }
}
