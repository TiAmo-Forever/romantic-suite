package org.love.romantic.common;

/**
 * 通知关联业务类型常量。
 * 使用字符串常量预留后续模块扩展能力，避免把通知类型写死在单个模块里。
 */
public final class NotificationBizTypeConstants {

    public static final String AUTH = "auth";
    public static final String COUNTDOWN = "countdown";
    public static final String ANNIVERSARY = "anniversary";
    public static final String IMPROVEMENT_NOTE = "improvement_note";
    public static final String IMPROVEMENT_FEEDBACK = "improvement_feedback";
    public static final String ALBUM = "album";

    private NotificationBizTypeConstants() {
    }
}
