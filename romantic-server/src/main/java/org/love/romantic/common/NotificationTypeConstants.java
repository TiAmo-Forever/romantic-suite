package org.love.romantic.common;

/**
 * 通知类型常量。
 * 第一版先落地当前业务事件，后续新增模块时继续追加常量即可。
 */
public final class NotificationTypeConstants {

    public static final String LOGIN = "login";
    public static final String COUNTDOWN_UPDATED = "countdown_updated";
    public static final String ANNIVERSARY_CREATED = "anniversary_created";
    public static final String ANNIVERSARY_UPDATED = "anniversary_updated";
    public static final String IMPROVEMENT_CREATED = "improvement_created";
    public static final String IMPROVEMENT_UPDATED = "improvement_updated";
    public static final String IMPROVEMENT_FEEDBACK_CREATED = "improvement_feedback_created";
    public static final String IMPROVEMENT_FEEDBACK_UPDATED = "improvement_feedback_updated";
    public static final String ALBUM_CREATED = "album_created";
    public static final String ALBUM_UPDATED = "album_updated";

    private NotificationTypeConstants() {
    }
}
