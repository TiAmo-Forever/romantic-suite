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
    public static final String ANNIVERSARY_PINNED = "anniversary_pinned";
    public static final String ANNIVERSARY_UNPINNED = "anniversary_unpinned";
    public static final String ANNIVERSARY_COMMENTED = "anniversary_commented";
    public static final String ANNIVERSARY_COMMENT_DELETED = "anniversary_comment_deleted";
    public static final String ANNIVERSARY_DELETED = "anniversary_deleted";
    public static final String ANNIVERSARY_LIKED = "anniversary_liked";
    public static final String ANNIVERSARY_UNLIKED = "anniversary_unliked";
    public static final String IMPROVEMENT_CREATED = "improvement_created";
    public static final String IMPROVEMENT_UPDATED = "improvement_updated";
    public static final String IMPROVEMENT_DELETED = "improvement_deleted";
    public static final String IMPROVEMENT_FEEDBACK_CREATED = "improvement_feedback_created";
    public static final String IMPROVEMENT_FEEDBACK_UPDATED = "improvement_feedback_updated";
    public static final String IMPROVEMENT_FEEDBACK_DELETED = "improvement_feedback_deleted";
    public static final String IMPROVEMENT_FEEDBACK_LIKED = "improvement_feedback_liked";
    public static final String IMPROVEMENT_FEEDBACK_UNLIKED = "improvement_feedback_unliked";
    public static final String IMPROVEMENT_FEEDBACK_COMMENTED = "improvement_feedback_commented";
    public static final String IMPROVEMENT_FEEDBACK_COMMENT_DELETED = "improvement_feedback_comment_deleted";
    public static final String ALBUM_CREATED = "album_created";
    public static final String ALBUM_UPDATED = "album_updated";
    public static final String ALBUM_COMMENTED = "album_commented";
    public static final String ALBUM_COMMENT_DELETED = "album_comment_deleted";
    public static final String ALBUM_DELETED = "album_deleted";
    public static final String ALBUM_LIKED = "album_liked";
    public static final String ALBUM_UNLIKED = "album_unliked";
    public static final String DAILY_SUMMARY_ENTRY_CREATED = "daily_summary_entry_created";
    public static final String DAILY_SUMMARY_ENTRY_UPDATED = "daily_summary_entry_updated";
    public static final String DAILY_SUMMARY_ENTRY_LIKED = "daily_summary_entry_liked";
    public static final String DAILY_SUMMARY_ENTRY_UNLIKED = "daily_summary_entry_unliked";
    public static final String DAILY_SUMMARY_ENTRY_COMMENTED = "daily_summary_entry_commented";
    public static final String DAILY_SUMMARY_ENTRY_COMMENT_DELETED = "daily_summary_entry_comment_deleted";

    private NotificationTypeConstants() {
    }
}
