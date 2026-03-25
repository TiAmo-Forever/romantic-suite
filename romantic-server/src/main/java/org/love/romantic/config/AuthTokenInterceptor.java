package org.love.romantic.config;

import org.love.romantic.auth.AuthContext;
import org.love.romantic.auth.AuthTokenService;
import org.love.romantic.auth.LoginUser;
import org.love.romantic.exception.BusinessException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 登录鉴权拦截器。
 */
@Component
public class AuthTokenInterceptor implements HandlerInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    private final AuthTokenService authTokenService;

    public AuthTokenInterceptor(AuthTokenService authTokenService) {
        this.authTokenService = authTokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 浏览器预检请求不会携带业务 token，这里直接放行即可。
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authorization = request.getHeader("Authorization");
        if (!StringUtils.hasText(authorization) || !authorization.startsWith(BEARER_PREFIX)) {
            throw new BusinessException("未登录或登录已失效");
        }

        String token = authorization.substring(BEARER_PREFIX.length()).trim();
        LoginUser loginUser = authTokenService.getLoginUser(token);
        if (loginUser == null) {
            throw new BusinessException("登录已失效，请重新登录");
        }

        AuthContext.setCurrentUser(loginUser);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        AuthContext.clear();
    }
}
