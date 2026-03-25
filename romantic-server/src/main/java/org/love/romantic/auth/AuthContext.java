package org.love.romantic.auth;

import org.love.romantic.exception.BusinessException;

/**
 * 当前请求登录态上下文。
 */
public final class AuthContext {

    private static final ThreadLocal<LoginUser> CURRENT_USER = new ThreadLocal<>();

    private AuthContext() {
    }

    public static void setCurrentUser(LoginUser loginUser) {
        CURRENT_USER.set(loginUser);
    }

    public static LoginUser getCurrentUser() {
        return CURRENT_USER.get();
    }

    public static String getRequiredUsername() {
        LoginUser loginUser = getCurrentUser();
        if (loginUser == null) {
            throw new BusinessException("未登录或登录已失效");
        }
        return loginUser.getUsername();
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
