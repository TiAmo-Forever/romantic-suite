package org.love.romantic.auth;

import lombok.Builder;
import lombok.Getter;

/**
 * 登录态中的用户信息。
 */
@Getter
@Builder
public class LoginUser {

    /**
     * 资料主键。
     */
    private final Long profileId;

    /**
     * 登录账号。
     */
    private final String username;

    /**
     * 账号类型。
     */
    private final String accountType;

    /**
     * token 过期时间戳，单位为毫秒。
     */
    private final long expiresAt;
}
