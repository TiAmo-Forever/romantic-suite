package org.love.romantic.auth;

import org.love.romantic.entity.CoupleProfile;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 本地 token 服务。
 * 当前阶段先满足单机联调，同时补上过期控制和主动失效能力。
 */
@Service
public class AuthTokenService {

    /**
     * token 默认有效期，12 小时。
     */
    private static final long TOKEN_TTL_MILLIS = 12L * 60 * 60 * 1000;

    private final Map<String, TokenSession> tokenStore = new ConcurrentHashMap<>();

    public String createToken(CoupleProfile profile) {
        clearExpiredTokens();
        String token = UUID.randomUUID().toString().replace("-", "");
        long expiresAt = System.currentTimeMillis() + TOKEN_TTL_MILLIS;
        tokenStore.put(token, new TokenSession(
                LoginUser.builder()
                        .profileId(profile.getId())
                        .username(profile.getUsername())
                        .expiresAt(expiresAt)
                        .build(),
                expiresAt
        ));
        return token;
    }

    public LoginUser getLoginUser(String token) {
        TokenSession session = tokenStore.get(token);
        if (session == null) {
            return null;
        }
        if (session.isExpired()) {
            tokenStore.remove(token);
            return null;
        }
        return session.getLoginUser();
    }

    public void invalidateToken(String token) {
        if (token != null) {
            tokenStore.remove(token);
        }
    }

    public void invalidateUserTokens(String username) {
        if (username == null) {
            return;
        }

        Iterator<Map.Entry<String, TokenSession>> iterator = tokenStore.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, TokenSession> entry = iterator.next();
            LoginUser loginUser = entry.getValue().getLoginUser();
            if (username.equalsIgnoreCase(loginUser.getUsername())) {
                iterator.remove();
            }
        }
    }

    private void clearExpiredTokens() {
        Iterator<Map.Entry<String, TokenSession>> iterator = tokenStore.entrySet().iterator();
        while (iterator.hasNext()) {
            if (iterator.next().getValue().isExpired()) {
                iterator.remove();
            }
        }
    }

    private static class TokenSession {
        private final LoginUser loginUser;
        private final long expiresAt;

        private TokenSession(LoginUser loginUser, long expiresAt) {
            this.loginUser = loginUser;
            this.expiresAt = expiresAt;
        }

        private LoginUser getLoginUser() {
            return loginUser;
        }

        private boolean isExpired() {
            return System.currentTimeMillis() >= expiresAt;
        }
    }
}
