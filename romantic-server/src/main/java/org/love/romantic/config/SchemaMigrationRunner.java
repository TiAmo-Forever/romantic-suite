package org.love.romantic.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Locale;

/**
 * 数据库结构迁移器。
 * 用于兼容旧库字段缺失问题，并统一补齐 MySQL 表注释和字段注释。
 */
@Slf4j
@Component
public class SchemaMigrationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    public SchemaMigrationRunner(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void migrate() {
        ensureCountdownPlanTable();
        ensureImprovementTables();
        ensureNotificationTable();
        ensureAlbumTables();
        ensureColumns();
        ensureAvatarImageColumnType();
        refreshMysqlComments();
    }

    private void ensureCountdownPlanTable() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS countdown_plan ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "lover_name VARCHAR(64) NOT NULL,"
                + "place VARCHAR(100) NOT NULL DEFAULT '',"
                + "note VARCHAR(255) NOT NULL DEFAULT '',"
                + "next_meeting_at DATETIME NOT NULL,"
                + "last_meeting_at DATETIME NOT NULL,"
                + "is_all_day TINYINT(1) NOT NULL DEFAULT 0,"
                + "created_by VARCHAR(64) NOT NULL DEFAULT '',"
                + "updated_by VARCHAR(64) NOT NULL DEFAULT '',"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                + ")");
    }

    private void ensureImprovementTables() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS improvement_note ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "title VARCHAR(120) NOT NULL,"
                + "description TEXT NOT NULL,"
                + "target_type VARCHAR(16) NOT NULL DEFAULT 'both',"
                + "status VARCHAR(16) NOT NULL DEFAULT 'improving',"
                + "status_emoji VARCHAR(16) NOT NULL DEFAULT '🌱',"
                + "start_date DATE NOT NULL,"
                + "latest_feedback VARCHAR(255) NOT NULL DEFAULT '',"
                + "creator_username VARCHAR(64) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "KEY idx_improvement_note_start_date (start_date),"
                + "KEY idx_improvement_note_status (status)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS improvement_feedback ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "note_id BIGINT NOT NULL,"
                + "status VARCHAR(16) NOT NULL DEFAULT 'improving',"
                + "status_emoji VARCHAR(16) NOT NULL DEFAULT '🌱',"
                + "content VARCHAR(255) NOT NULL,"
                + "creator_username VARCHAR(64) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "KEY idx_improvement_feedback_note_id (note_id)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS improvement_media ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "note_id BIGINT NOT NULL,"
                + "feedback_id BIGINT NOT NULL DEFAULT 0,"
                + "media_type VARCHAR(16) NOT NULL,"
                + "file_url VARCHAR(255) NOT NULL,"
                + "thumbnail_url VARCHAR(255) NOT NULL DEFAULT '',"
                + "sort_order INT NOT NULL DEFAULT 0,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "KEY idx_improvement_media_note_id (note_id),"
                + "KEY idx_improvement_media_feedback_id (feedback_id)"
                + ")");
    }

    private void ensureAlbumTables() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS album_memory ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "username VARCHAR(64) NOT NULL,"
                + "title VARCHAR(120) NOT NULL,"
                + "memory_date DATE NOT NULL,"
                + "location VARCHAR(100) NOT NULL DEFAULT '',"
                + "summary VARCHAR(255) NOT NULL DEFAULT '',"
                + "tags_json TEXT NOT NULL,"
                + "cover_url VARCHAR(255) NOT NULL DEFAULT '',"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "KEY idx_album_memory_date (memory_date),"
                + "KEY idx_album_memory_username (username)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS album_media ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "memory_id BIGINT NOT NULL,"
                + "media_type VARCHAR(16) NOT NULL,"
                + "file_url VARCHAR(255) NOT NULL,"
                + "thumbnail_url VARCHAR(255) NOT NULL DEFAULT '',"
                + "sort_order INT NOT NULL DEFAULT 0,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "KEY idx_album_media_memory_id (memory_id)"
                + ")");
    }

    private void ensureNotificationTable() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS user_notification ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "recipient_username VARCHAR(64) NOT NULL,"
                + "actor_username VARCHAR(64) NOT NULL DEFAULT '',"
                + "type VARCHAR(64) NOT NULL,"
                + "title VARCHAR(120) NOT NULL,"
                + "content VARCHAR(255) NOT NULL,"
                + "biz_type VARCHAR(64) NOT NULL DEFAULT '',"
                + "biz_id BIGINT NOT NULL DEFAULT 0,"
                + "payload_json TEXT NOT NULL,"
                + "is_read TINYINT(1) NOT NULL DEFAULT 0,"
                + "read_at DATETIME NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "KEY idx_user_notification_recipient_read (recipient_username, is_read),"
                + "KEY idx_user_notification_recipient_created_at (recipient_username, created_at),"
                + "KEY idx_user_notification_biz (biz_type, biz_id)"
                + ")");
    }

    private void ensureColumns() {
        ensureColumn(
                "couple_profile",
                "username",
                "ALTER TABLE couple_profile ADD COLUMN username VARCHAR(64) NOT NULL DEFAULT 'chenjia'"
        );
        ensureColumn(
                "couple_profile",
                "password",
                "ALTER TABLE couple_profile ADD COLUMN password VARCHAR(64) NOT NULL DEFAULT 'admin'"
        );
        ensureColumn(
                "couple_profile",
                "default_meeting_place",
                "ALTER TABLE couple_profile ADD COLUMN default_meeting_place VARCHAR(64) NOT NULL DEFAULT '上海'"
        );
        ensureColumn(
                "couple_profile",
                "default_meeting_area_id",
                "ALTER TABLE couple_profile ADD COLUMN default_meeting_area_id INT NOT NULL DEFAULT 0"
        );
        ensureColumn(
                "couple_profile",
                "email",
                "ALTER TABLE couple_profile ADD COLUMN email VARCHAR(128) NOT NULL DEFAULT ''"
        );
        ensureColumn(
                "couple_profile",
                "avatar_type",
                "ALTER TABLE couple_profile ADD COLUMN avatar_type VARCHAR(32) NOT NULL DEFAULT 'preset'"
        );
        ensureColumn(
                "couple_profile",
                "avatar_preset",
                "ALTER TABLE couple_profile ADD COLUMN avatar_preset VARCHAR(32) NOT NULL DEFAULT 'heart'"
        );
        ensureColumn(
                "couple_profile",
                "avatar_text",
                "ALTER TABLE couple_profile ADD COLUMN avatar_text VARCHAR(16) NOT NULL DEFAULT '💕'"
        );
        ensureColumn(
                "couple_profile",
                "avatar_image",
                "ALTER TABLE couple_profile ADD COLUMN avatar_image LONGTEXT NOT NULL"
        );
        ensureColumn(
                "couple_profile",
                "theme_preset_key",
                "ALTER TABLE couple_profile ADD COLUMN theme_preset_key VARCHAR(32) NOT NULL DEFAULT 'pink'"
        );
        ensureColumn(
                "anniversary_event",
                "like_count",
                "ALTER TABLE anniversary_event ADD COLUMN like_count BIGINT NOT NULL DEFAULT 0"
        );
    }

    private void ensureColumn(String tableName, String columnName, String alterSql) {
        if (!tableColumnExists(tableName, columnName)) {
            log.info("检测到字段缺失，开始补齐字段：{}.{}", tableName, columnName);
            jdbcTemplate.execute(alterSql);
        }
    }

    private boolean tableColumnExists(String tableName, String columnName) {
        Connection connection = DataSourceUtils.getConnection(dataSource);
        try {
            DatabaseMetaData metaData = connection.getMetaData();
            return hasColumn(metaData, tableName.toUpperCase(Locale.ROOT), columnName)
                    || hasColumn(metaData, tableName.toLowerCase(Locale.ROOT), columnName);
        } catch (SQLException exception) {
            throw new IllegalStateException("检查字段是否存在失败：" + tableName + "." + columnName, exception);
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    private boolean hasColumn(DatabaseMetaData metaData, String tableName, String columnName) throws SQLException {
        try (ResultSet resultSet = metaData.getColumns(null, null, tableName, columnName)) {
            return resultSet.next();
        }
    }

    /**
     * 历史版本头像字段长度较短，统一扩容为 LONGTEXT。
     */
    private void ensureAvatarImageColumnType() {
        try {
            jdbcTemplate.execute("ALTER TABLE couple_profile MODIFY COLUMN avatar_image LONGTEXT NOT NULL");
        } catch (Exception exception) {
            log.warn("头像字段扩容跳过，message={}", exception.getMessage());
        }
    }

    /**
     * 仅在 MySQL 环境下补齐表注释和字段注释，避免影响其他数据库。
     */
    private void refreshMysqlComments() {
        if (!isMySqlDatabase()) {
            log.info("当前数据库不是 MySQL，跳过表注释和字段注释迁移");
            return;
        }

        executeCommentSql("ALTER TABLE couple_profile COMMENT = '情侣账号资料表'");
        executeCommentSql("ALTER TABLE basic_area COMMENT = '基础行政区划表'");
        executeCommentSql("ALTER TABLE anniversary_event COMMENT = '恋爱纪念日主表'");
        executeCommentSql("ALTER TABLE anniversary_media COMMENT = '纪念日媒体资源表'");
        executeCommentSql("ALTER TABLE countdown_plan COMMENT = '共享见面倒计时计划表'");
        executeCommentSql("ALTER TABLE improvement_note COMMENT = '恋爱改进簿主记录表'");
        executeCommentSql("ALTER TABLE improvement_feedback COMMENT = '恋爱改进簿反馈记录表'");
        executeCommentSql("ALTER TABLE improvement_media COMMENT = '恋爱改进簿媒体资源表'");
        executeCommentSql("ALTER TABLE user_notification COMMENT = '用户站内通知表'");
        executeCommentSql("ALTER TABLE album_memory COMMENT = '甜蜜相册回忆主表'");
        executeCommentSql("ALTER TABLE album_media COMMENT = '甜蜜相册媒体资源表'");

        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN username VARCHAR(64) NOT NULL COMMENT '登录账号'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN password VARCHAR(64) NOT NULL COMMENT '登录密码'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN nickname VARCHAR(64) NOT NULL COMMENT '自己的真实姓名'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN city VARCHAR(64) NOT NULL COMMENT '所在城市'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN lover_nickname VARCHAR(64) NOT NULL COMMENT '对方平时对你的称呼'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN bio VARCHAR(255) NOT NULL COMMENT '个性签名'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN anniversary_date VARCHAR(20) NOT NULL COMMENT '纪念日'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN default_meeting_area_id INT NOT NULL DEFAULT 0 COMMENT '默认见面城市行政区编码'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN default_meeting_place VARCHAR(64) NOT NULL COMMENT '默认见面地点'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN email VARCHAR(128) NOT NULL DEFAULT '' COMMENT '邮箱'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN avatar_type VARCHAR(32) NOT NULL DEFAULT 'preset' COMMENT '头像类型'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN avatar_preset VARCHAR(32) NOT NULL DEFAULT 'heart' COMMENT '预设头像标识'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN avatar_text VARCHAR(16) NOT NULL DEFAULT '💕' COMMENT '字符头像内容'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN avatar_image LONGTEXT NOT NULL COMMENT '上传头像相对路径'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE couple_profile MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN id INT NOT NULL COMMENT '行政区代码'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN level INT NOT NULL COMMENT '层级：0省，1市，2区县'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN parent_id INT NOT NULL DEFAULT 0 COMMENT '父级行政区代码'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN zip_code BIGINT NOT NULL DEFAULT 0 COMMENT '邮政编码'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN city_code CHAR(6) NOT NULL DEFAULT '' COMMENT '区号'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN name VARCHAR(50) NOT NULL DEFAULT '' COMMENT '名称'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN short_name VARCHAR(50) NOT NULL DEFAULT '' COMMENT '简称'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN merger_name VARCHAR(100) NOT NULL DEFAULT '' COMMENT '完整组合名称'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN pinyin VARCHAR(30) NOT NULL DEFAULT '' COMMENT '拼音'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN loc_lng DECIMAL(10, 6) NOT NULL DEFAULT 0.000000 COMMENT '经度'");
        executeCommentSql("ALTER TABLE basic_area MODIFY COLUMN loc_lat DECIMAL(10, 6) NOT NULL DEFAULT 0.000000 COMMENT '纬度'");

        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN username VARCHAR(64) NOT NULL COMMENT '创建人账号'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN title VARCHAR(100) NOT NULL COMMENT '纪念日标题'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN type VARCHAR(32) NOT NULL DEFAULT 'custom' COMMENT '纪念日类型'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN event_date DATE NOT NULL COMMENT '纪念日日期'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN description TEXT NOT NULL COMMENT '纪念日说明'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN location VARCHAR(100) NOT NULL DEFAULT '' COMMENT '地点描述'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN cover_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面资源相对路径'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN like_count BIGINT NOT NULL DEFAULT 0 COMMENT '点赞次数'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN reminder_type VARCHAR(32) NOT NULL DEFAULT 'none' COMMENT '提醒类型'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN last_reminded_on DATE NULL COMMENT '最近一次提醒日期'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE anniversary_media MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE anniversary_media MODIFY COLUMN event_id BIGINT NOT NULL COMMENT '所属纪念日ID'");
        executeCommentSql("ALTER TABLE anniversary_media MODIFY COLUMN media_type VARCHAR(16) NOT NULL COMMENT '媒体类型'");
        executeCommentSql("ALTER TABLE anniversary_media MODIFY COLUMN file_url VARCHAR(255) NOT NULL COMMENT '媒体文件相对路径'");
        executeCommentSql("ALTER TABLE anniversary_media MODIFY COLUMN thumbnail_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '视频缩略图相对路径'");
        executeCommentSql("ALTER TABLE anniversary_media MODIFY COLUMN sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值'");
        executeCommentSql("ALTER TABLE anniversary_media MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");

        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN lover_name VARCHAR(64) NOT NULL COMMENT '对方称呼'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN place VARCHAR(100) NOT NULL DEFAULT '' COMMENT '见面地点'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN note VARCHAR(255) NOT NULL DEFAULT '' COMMENT '计划说明'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN next_meeting_at DATETIME NOT NULL COMMENT '下次见面时间'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN last_meeting_at DATETIME NOT NULL COMMENT '上次见面时间'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN is_all_day TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否按全天见面计算'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN created_by VARCHAR(64) NOT NULL DEFAULT '' COMMENT '首次创建人账号'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN updated_by VARCHAR(64) NOT NULL DEFAULT '' COMMENT '最近修改人账号'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE countdown_plan MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN title VARCHAR(120) NOT NULL COMMENT '事情标题'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN description TEXT NOT NULL COMMENT '事情说明'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN target_type VARCHAR(16) NOT NULL DEFAULT 'both' COMMENT '改进对象类型'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN status VARCHAR(16) NOT NULL DEFAULT 'improving' COMMENT '当前改进状态'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN status_emoji VARCHAR(16) NOT NULL DEFAULT '🌱' COMMENT '状态表情'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN start_date DATE NOT NULL COMMENT '开始记录日期'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN latest_feedback VARCHAR(255) NOT NULL DEFAULT '' COMMENT '最近一次反馈内容'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN creator_username VARCHAR(64) NOT NULL COMMENT '创建人账号'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE improvement_note MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE improvement_feedback MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE improvement_feedback MODIFY COLUMN note_id BIGINT NOT NULL COMMENT '所属改进记录ID'");
        executeCommentSql("ALTER TABLE improvement_feedback MODIFY COLUMN status VARCHAR(16) NOT NULL DEFAULT 'improving' COMMENT '反馈时的状态'");
        executeCommentSql("ALTER TABLE improvement_feedback MODIFY COLUMN status_emoji VARCHAR(16) NOT NULL DEFAULT '🌱' COMMENT '反馈状态表情'");
        executeCommentSql("ALTER TABLE improvement_feedback MODIFY COLUMN content VARCHAR(255) NOT NULL COMMENT '反馈内容'");
        executeCommentSql("ALTER TABLE improvement_feedback MODIFY COLUMN creator_username VARCHAR(64) NOT NULL COMMENT '反馈人账号'");
        executeCommentSql("ALTER TABLE improvement_feedback MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '反馈时间'");

        executeCommentSql("ALTER TABLE improvement_media MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE improvement_media MODIFY COLUMN note_id BIGINT NOT NULL COMMENT '所属改进记录ID'");
        executeCommentSql("ALTER TABLE improvement_media MODIFY COLUMN feedback_id BIGINT NOT NULL DEFAULT 0 COMMENT '所属反馈记录ID，0表示主记录媒体'");
        executeCommentSql("ALTER TABLE improvement_media MODIFY COLUMN media_type VARCHAR(16) NOT NULL COMMENT '媒体类型'");
        executeCommentSql("ALTER TABLE improvement_media MODIFY COLUMN file_url VARCHAR(255) NOT NULL COMMENT '媒体文件路径'");
        executeCommentSql("ALTER TABLE improvement_media MODIFY COLUMN thumbnail_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '缩略图路径'");
        executeCommentSql("ALTER TABLE improvement_media MODIFY COLUMN sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值'");
        executeCommentSql("ALTER TABLE improvement_media MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");

        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN recipient_username VARCHAR(64) NOT NULL COMMENT '接收人账号'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN actor_username VARCHAR(64) NOT NULL DEFAULT '' COMMENT '触发人账号'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN type VARCHAR(64) NOT NULL COMMENT '通知类型'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN title VARCHAR(120) NOT NULL COMMENT '通知标题'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN content VARCHAR(255) NOT NULL COMMENT '通知内容'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN biz_type VARCHAR(64) NOT NULL DEFAULT '' COMMENT '关联业务类型'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN biz_id BIGINT NOT NULL DEFAULT 0 COMMENT '关联业务ID'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN payload_json TEXT NOT NULL COMMENT '扩展负载JSON'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN read_at DATETIME NULL COMMENT '已读时间'");
        executeCommentSql("ALTER TABLE user_notification MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");

        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN username VARCHAR(64) NOT NULL COMMENT '创建人账号'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN title VARCHAR(120) NOT NULL COMMENT '回忆标题'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN memory_date DATE NOT NULL COMMENT '回忆日期'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN location VARCHAR(100) NOT NULL DEFAULT '' COMMENT '地点'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN summary VARCHAR(255) NOT NULL DEFAULT '' COMMENT '回忆内容'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN tags_json TEXT NOT NULL COMMENT '标签JSON'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN cover_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面路径'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE album_media MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID'");
        executeCommentSql("ALTER TABLE album_media MODIFY COLUMN memory_id BIGINT NOT NULL COMMENT '所属回忆ID'");
        executeCommentSql("ALTER TABLE album_media MODIFY COLUMN media_type VARCHAR(16) NOT NULL COMMENT '媒体类型'");
        executeCommentSql("ALTER TABLE album_media MODIFY COLUMN file_url VARCHAR(255) NOT NULL COMMENT '媒体文件路径'");
        executeCommentSql("ALTER TABLE album_media MODIFY COLUMN thumbnail_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '缩略图路径'");
        executeCommentSql("ALTER TABLE album_media MODIFY COLUMN sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值'");
        executeCommentSql("ALTER TABLE album_media MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
    }

    private void executeCommentSql(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception exception) {
            log.warn("执行注释迁移失败，sql={}, message={}", sql, exception.getMessage());
        }
    }

    private boolean isMySqlDatabase() {
        Connection connection = DataSourceUtils.getConnection(dataSource);
        try {
            String productName = connection.getMetaData().getDatabaseProductName();
            return productName != null && productName.toLowerCase(Locale.ROOT).contains("mysql");
        } catch (SQLException exception) {
            throw new IllegalStateException("读取数据库类型失败", exception);
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }
}
