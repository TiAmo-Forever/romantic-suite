package org.love.romantic.common;

import org.springframework.util.StringUtils;

/**
 * 账号类型常量。
 */
public final class AccountTypeConstants {

    public static final String NORMAL = "NORMAL";
    public static final String ADMIN = "ADMIN";

    private AccountTypeConstants() {
    }

    public static String normalize(String accountType) {
        if (!StringUtils.hasText(accountType)) {
            return NORMAL;
        }
        return ADMIN.equalsIgnoreCase(accountType.trim()) ? ADMIN : NORMAL;
    }

    public static boolean isAdmin(String accountType) {
        return ADMIN.equalsIgnoreCase(normalize(accountType));
    }

    public static boolean isNormal(String accountType) {
        return NORMAL.equalsIgnoreCase(normalize(accountType));
    }
}
