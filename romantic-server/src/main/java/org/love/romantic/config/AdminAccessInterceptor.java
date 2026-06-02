package org.love.romantic.config;

import org.love.romantic.auth.AuthContext;
import org.love.romantic.auth.LoginUser;
import org.love.romantic.common.AccountTypeConstants;
import org.love.romantic.exception.BusinessException;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 管理员账号访问限制拦截器。
 */
@Component
public class AdminAccessInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        LoginUser loginUser = AuthContext.getCurrentUser();
        if (loginUser != null && AccountTypeConstants.isAdmin(loginUser.getAccountType())) {
            throw new BusinessException("管理员账号仅可查看基础信息模块");
        }
        return true;
    }
}
