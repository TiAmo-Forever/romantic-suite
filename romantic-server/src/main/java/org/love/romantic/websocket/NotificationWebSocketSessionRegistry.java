package org.love.romantic.websocket;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketSessionRegistry {

    private final Map<String, Map<String, WebSocketSession>> sessionsByUsername = new ConcurrentHashMap<>();

    public void addSession(String username, WebSocketSession session) {
        if (!StringUtils.hasText(username) || session == null || !session.isOpen()) {
            return;
        }
        sessionsByUsername
                .computeIfAbsent(username, key -> new ConcurrentHashMap<>())
                .put(session.getId(), session);
    }

    public void removeSession(String username, String sessionId) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(sessionId)) {
            return;
        }
        Map<String, WebSocketSession> sessionMap = sessionsByUsername.get(username);
        if (sessionMap == null) {
            return;
        }
        sessionMap.remove(sessionId);
        if (sessionMap.isEmpty()) {
            sessionsByUsername.remove(username);
        }
    }

    public List<WebSocketSession> listSessions(String username) {
        Map<String, WebSocketSession> sessionMap = sessionsByUsername.get(username);
        if (sessionMap == null || sessionMap.isEmpty()) {
            return new ArrayList<>();
        }

        List<WebSocketSession> result = new ArrayList<>();
        for (WebSocketSession session : sessionMap.values()) {
            if (session != null && session.isOpen()) {
                result.add(session);
                continue;
            }
            closeQuietly(session);
        }
        return result;
    }

    private void closeQuietly(WebSocketSession session) {
        if (session == null) {
            return;
        }
        try {
            session.close();
        } catch (IOException ignored) {
            // Ignore broken sessions during registry cleanup.
        }
    }
}
