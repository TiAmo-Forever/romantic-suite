package org.love.romantic.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;

@Slf4j
@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final NotificationWebSocketSessionRegistry sessionRegistry;

    public NotificationWebSocketHandler(NotificationWebSocketSessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String username = getUsername(session);
        if (!StringUtils.hasText(username)) {
            closeQuietly(session, CloseStatus.NOT_ACCEPTABLE.withReason("Missing username"));
            return;
        }
        sessionRegistry.addSession(username, session);
        log.info("通知 WebSocket 连接建立成功，username={}, sessionId={}", username, session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            session.sendMessage(new TextMessage("{\"eventType\":\"heartbeat_ack\"}"));
        } catch (IOException exception) {
            log.warn("通知 WebSocket 心跳响应失败，sessionId={}, message={}", session.getId(), exception.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String username = getUsername(session);
        sessionRegistry.removeSession(username, session.getId());
        log.info("通知 WebSocket 连接关闭，username={}, sessionId={}, code={}", username, session.getId(), status.getCode());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        String username = getUsername(session);
        sessionRegistry.removeSession(username, session.getId());
        log.warn("通知 WebSocket 传输异常，username={}, sessionId={}, message={}",
                username, session.getId(), exception == null ? "" : exception.getMessage());
        closeQuietly(session, CloseStatus.SERVER_ERROR);
    }

    private String getUsername(WebSocketSession session) {
        Object username = session.getAttributes().get(NotificationHandshakeInterceptor.ATTRIBUTE_USERNAME);
        return username == null ? "" : String.valueOf(username).trim();
    }

    private void closeQuietly(WebSocketSession session, CloseStatus status) {
        if (session == null || !session.isOpen()) {
            return;
        }
        try {
            session.close(status);
        } catch (IOException ignored) {
            // Ignore connection close failures.
        }
    }
}
