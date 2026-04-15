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
        ensureDailySummaryTable();
        ensureImprovementTables();
        ensureNotificationTable();
        ensureAlbumTables();
        ensureRomanticPlanTables();
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

    private void ensureDailySummaryTable() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS daily_summary ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "summary_date DATE NOT NULL,"
                + "mood VARCHAR(32) NOT NULL,"
                + "content VARCHAR(300) NOT NULL,"
                + "creator_username VARCHAR(64) NOT NULL,"
                + "updated_by VARCHAR(64) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "UNIQUE KEY uk_daily_summary_date (summary_date),"
                + "KEY idx_daily_summary_updated_at (updated_at)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS daily_summary_entry ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "summary_id BIGINT NOT NULL,"
                + "mood VARCHAR(32) NOT NULL,"
                + "content VARCHAR(300) NOT NULL,"
                + "creator_username VARCHAR(64) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "KEY idx_daily_summary_entry_summary_id (summary_id),"
                + "KEY idx_daily_summary_entry_updated_at (updated_at)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS daily_summary_media ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "entry_id BIGINT NOT NULL,"
                + "media_type VARCHAR(16) NOT NULL,"
                + "file_url VARCHAR(255) NOT NULL,"
                + "thumbnail_url VARCHAR(255) NOT NULL DEFAULT '',"
                + "sort_order INT NOT NULL DEFAULT 0,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "KEY idx_daily_summary_media_entry_id (entry_id)"
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
                + "like_count BIGINT NOT NULL DEFAULT 0,"
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

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS album_memory_like ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "memory_id BIGINT NOT NULL,"
                + "username VARCHAR(64) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "KEY idx_album_memory_like_memory_id (memory_id),"
                + "KEY idx_album_memory_like_username (username)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS album_memory_comment ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "memory_id BIGINT NOT NULL,"
                + "username VARCHAR(64) NOT NULL,"
                + "content VARCHAR(200) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "KEY idx_album_memory_comment_memory_id (memory_id),"
                + "KEY idx_album_memory_comment_created_at (created_at)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS biz_like_record ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "biz_type VARCHAR(64) NOT NULL,"
                + "biz_id BIGINT NOT NULL,"
                + "username VARCHAR(64) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "KEY idx_biz_like_record_biz (biz_type, biz_id),"
                + "KEY idx_biz_like_record_username (username)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS biz_comment_record ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "biz_type VARCHAR(64) NOT NULL,"
                + "biz_id BIGINT NOT NULL,"
                + "username VARCHAR(64) NOT NULL,"
                + "content VARCHAR(200) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "KEY idx_biz_comment_record_biz (biz_type, biz_id),"
                + "KEY idx_biz_comment_record_created_at (created_at)"
                + ")");

        migrateAlbumInteractionTables();
    }

    private void ensureRomanticPlanTables() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS romantic_plan ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "title VARCHAR(120) NOT NULL,"
                + "description TEXT NOT NULL,"
                + "plan_type VARCHAR(16) NOT NULL DEFAULT 'daily',"
                + "status VARCHAR(16) NOT NULL DEFAULT 'active',"
                + "start_at DATETIME NOT NULL,"
                + "end_at DATETIME NULL,"
                + "interval_days INT NOT NULL DEFAULT 0,"
                + "location VARCHAR(120) NOT NULL DEFAULT '',"
                + "cover_url VARCHAR(255) NOT NULL DEFAULT '',"
                + "creator_username VARCHAR(64) NOT NULL,"
                + "updated_by VARCHAR(64) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "KEY idx_romantic_plan_status (status),"
                + "KEY idx_romantic_plan_updated_at (updated_at)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS romantic_plan_item ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "plan_id BIGINT NOT NULL,"
                + "title VARCHAR(120) NOT NULL,"
                + "content VARCHAR(300) NOT NULL DEFAULT '',"
                + "scheduled_at DATETIME NULL,"
                + "end_at DATETIME NULL,"
                + "location VARCHAR(120) NOT NULL DEFAULT '',"
                + "sort_order INT NOT NULL DEFAULT 0,"
                + "completed TINYINT(1) NOT NULL DEFAULT 0,"
                + "completed_at DATETIME NULL,"
                + "creator_username VARCHAR(64) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "KEY idx_romantic_plan_item_plan_id (plan_id),"
                + "KEY idx_romantic_plan_item_scheduled_at (scheduled_at)"
                + ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS romantic_plan_feedback ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "plan_id BIGINT NOT NULL,"
                + "plan_item_id BIGINT NOT NULL DEFAULT 0,"
                + "feedback_date DATE NOT NULL,"
                + "status VARCHAR(16) NOT NULL DEFAULT 'done',"
                + "content VARCHAR(300) NOT NULL,"
                + "creator_username VARCHAR(64) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                + "KEY idx_romantic_plan_feedback_plan_id (plan_id),"
                + "KEY idx_romantic_plan_feedback_date (feedback_date)"
                + ")");
    }

    private void migrateAlbumInteractionTables() {
        if (tableExists("album_memory_like")) {
            jdbcTemplate.execute("INSERT INTO biz_like_record (biz_type, biz_id, username, created_at) "
                    + "SELECT 'album', old_like.memory_id, old_like.username, old_like.created_at "
                    + "FROM album_memory_like old_like "
                    + "WHERE NOT EXISTS ("
                    + "SELECT 1 FROM biz_like_record new_like "
                    + "WHERE new_like.biz_type = 'album' "
                    + "AND new_like.biz_id = old_like.memory_id "
                    + "AND new_like.username = old_like.username "
                    + "AND new_like.created_at = old_like.created_at)");
        }

        if (tableExists("album_memory_comment")) {
            jdbcTemplate.execute("INSERT INTO biz_comment_record (biz_type, biz_id, username, content, created_at, updated_at) "
                    + "SELECT 'album', old_comment.memory_id, old_comment.username, old_comment.content, old_comment.created_at, old_comment.updated_at "
                    + "FROM album_memory_comment old_comment "
                    + "WHERE NOT EXISTS ("
                    + "SELECT 1 FROM biz_comment_record new_comment "
                    + "WHERE new_comment.biz_type = 'album' "
                    + "AND new_comment.biz_id = old_comment.memory_id "
                    + "AND new_comment.username = old_comment.username "
                    + "AND new_comment.content = old_comment.content "
                    + "AND new_comment.created_at = old_comment.created_at)");
        }
    }

    private void ensureColumns() {
        ensureColumn("couple_profile", "username",
                "ALTER TABLE couple_profile ADD COLUMN username VARCHAR(64) NOT NULL DEFAULT 'chenjia'");
        ensureColumn("couple_profile", "password",
                "ALTER TABLE couple_profile ADD COLUMN password VARCHAR(64) NOT NULL DEFAULT 'admin'");
        ensureColumn("couple_profile", "default_meeting_place",
                "ALTER TABLE couple_profile ADD COLUMN default_meeting_place VARCHAR(64) NOT NULL DEFAULT '上海'");
        ensureColumn("couple_profile", "default_meeting_area_id",
                "ALTER TABLE couple_profile ADD COLUMN default_meeting_area_id INT NOT NULL DEFAULT 0");
        ensureColumn("couple_profile", "email",
                "ALTER TABLE couple_profile ADD COLUMN email VARCHAR(128) NOT NULL DEFAULT ''");
        ensureColumn("couple_profile", "avatar_type",
                "ALTER TABLE couple_profile ADD COLUMN avatar_type VARCHAR(32) NOT NULL DEFAULT 'preset'");
        ensureColumn("couple_profile", "avatar_preset",
                "ALTER TABLE couple_profile ADD COLUMN avatar_preset VARCHAR(32) NOT NULL DEFAULT 'heart'");
        ensureColumn("couple_profile", "avatar_text",
                "ALTER TABLE couple_profile ADD COLUMN avatar_text VARCHAR(16) NOT NULL DEFAULT '💕'");
        ensureColumn("couple_profile", "avatar_image",
                "ALTER TABLE couple_profile ADD COLUMN avatar_image LONGTEXT NOT NULL");
        ensureColumn("couple_profile", "theme_preset_key",
                "ALTER TABLE couple_profile ADD COLUMN theme_preset_key VARCHAR(32) NOT NULL DEFAULT 'pink'");
        ensureColumn("anniversary_event", "is_pinned",
                "ALTER TABLE anniversary_event ADD COLUMN is_pinned TINYINT(1) NOT NULL DEFAULT 0");
        ensureColumn("anniversary_event", "like_count",
                "ALTER TABLE anniversary_event ADD COLUMN like_count BIGINT NOT NULL DEFAULT 0");
        ensureIndex("anniversary_event", "idx_anniversary_event_pinned",
                "CREATE INDEX idx_anniversary_event_pinned ON anniversary_event (is_pinned, event_date)");
        ensureColumn("album_memory", "like_count",
                "ALTER TABLE album_memory ADD COLUMN like_count BIGINT NOT NULL DEFAULT 0");
    }

    private void ensureColumn(String tableName, String columnName, String alterSql) {
        if (!tableColumnExists(tableName, columnName)) {
            log.info("检测到字段缺失，开始补齐字段：{}.{}", tableName, columnName);
            jdbcTemplate.execute(alterSql);
        }
    }

    private void ensureIndex(String tableName, String indexName, String createSql) {
        if (!tableIndexExists(tableName, indexName)) {
            log.info("检测到索引缺失，开始补齐索引：{}.{}", tableName, indexName);
            jdbcTemplate.execute(createSql);
        }
    }

    private boolean tableExists(String tableName) {
        Connection connection = DataSourceUtils.getConnection(dataSource);
        try {
            DatabaseMetaData metaData = connection.getMetaData();
            return hasTable(metaData, tableName.toUpperCase(Locale.ROOT))
                    || hasTable(metaData, tableName.toLowerCase(Locale.ROOT));
        } catch (SQLException exception) {
            throw new IllegalStateException("检查数据表是否存在失败：" + tableName, exception);
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
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

    private boolean tableIndexExists(String tableName, String indexName) {
        Connection connection = DataSourceUtils.getConnection(dataSource);
        try {
            DatabaseMetaData metaData = connection.getMetaData();
            return hasIndex(metaData, tableName.toUpperCase(Locale.ROOT), indexName)
                    || hasIndex(metaData, tableName.toLowerCase(Locale.ROOT), indexName);
        } catch (SQLException exception) {
            throw new IllegalStateException("检查索引是否存在失败：" + tableName + "." + indexName, exception);
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    private boolean hasColumn(DatabaseMetaData metaData, String tableName, String columnName) throws SQLException {
        try (ResultSet resultSet = metaData.getColumns(null, null, tableName, columnName)) {
            return resultSet.next();
        }
    }

    private boolean hasIndex(DatabaseMetaData metaData, String tableName, String indexName) throws SQLException {
        try (ResultSet resultSet = metaData.getIndexInfo(null, null, tableName, false, false)) {
            while (resultSet.next()) {
                String currentIndexName = resultSet.getString("INDEX_NAME");
                if (currentIndexName != null && currentIndexName.equalsIgnoreCase(indexName)) {
                    return true;
                }
            }
            return false;
        }
    }

    private boolean hasTable(DatabaseMetaData metaData, String tableName) throws SQLException {
        try (ResultSet resultSet = metaData.getTables(null, null, tableName, null)) {
            return resultSet.next();
        }
    }

    private void ensureAvatarImageColumnType() {
        try {
            jdbcTemplate.execute("ALTER TABLE couple_profile MODIFY COLUMN avatar_image LONGTEXT NOT NULL");
        } catch (Exception exception) {
            log.warn("头像字段扩容跳过，message={}", exception.getMessage());
        }
    }

    private void refreshMysqlComments() {
        if (!isMySqlDatabase()) {
            log.info("当前数据库不是 MySQL，跳过表注释和字段注释迁移");
            return;
        }

        executeCommentSql("ALTER TABLE anniversary_event COMMENT = '恋爱纪念日主表'");
        executeCommentSql("ALTER TABLE album_memory COMMENT = '甜蜜相册回忆主表'");
        executeCommentSql("ALTER TABLE album_media COMMENT = '甜蜜相册媒体资源表'");
        executeCommentSql("ALTER TABLE album_memory_like COMMENT = '甜蜜相册点赞记录表（兼容迁移保留）'");
        executeCommentSql("ALTER TABLE album_memory_comment COMMENT = '甜蜜相册评论记录表（兼容迁移保留）'");
        executeCommentSql("ALTER TABLE biz_like_record COMMENT = '通用业务点赞记录表'");
        executeCommentSql("ALTER TABLE biz_comment_record COMMENT = '通用业务评论记录表'");
        executeCommentSql("ALTER TABLE daily_summary COMMENT = '今日小计共享记录表'");
        executeCommentSql("ALTER TABLE daily_summary_entry COMMENT = '今日小计条目表'");
        executeCommentSql("ALTER TABLE daily_summary_media COMMENT = '今日小计媒体资源表'");
        executeCommentSql("ALTER TABLE user_notification COMMENT = '用户站内通知表'");
        executeCommentSql("ALTER TABLE romantic_plan COMMENT = '浪漫计划主表'");
        executeCommentSql("ALTER TABLE romantic_plan_item COMMENT = '浪漫计划条目表'");
        executeCommentSql("ALTER TABLE romantic_plan_feedback COMMENT = '浪漫计划反馈表'");

        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN username VARCHAR(64) NOT NULL COMMENT '创建账号'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN title VARCHAR(120) NOT NULL COMMENT '回忆标题'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN memory_date DATE NOT NULL COMMENT '回忆日期'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN location VARCHAR(100) NOT NULL DEFAULT '' COMMENT '地点'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN summary VARCHAR(255) NOT NULL DEFAULT '' COMMENT '回忆内容'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN tags_json TEXT NOT NULL COMMENT '标签 JSON'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN cover_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面路径'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN like_count BIGINT NOT NULL DEFAULT 0 COMMENT '点赞次数'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE album_memory MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN is_pinned TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶到首页'");
        executeCommentSql("ALTER TABLE anniversary_event MODIFY COLUMN like_count BIGINT NOT NULL DEFAULT 0 COMMENT '点赞次数'");

        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN title VARCHAR(120) NOT NULL COMMENT '计划标题'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN description TEXT NOT NULL COMMENT '计划说明'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN plan_type VARCHAR(16) NOT NULL DEFAULT 'daily' COMMENT '计划类型'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN status VARCHAR(16) NOT NULL DEFAULT 'active' COMMENT '计划状态'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN start_at DATETIME NOT NULL COMMENT '开始时间'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN end_at DATETIME NULL COMMENT '结束时间'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN interval_days INT NOT NULL DEFAULT 0 COMMENT '间隔天数'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN location VARCHAR(120) NOT NULL DEFAULT '' COMMENT '地点说明'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN cover_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面资源路径'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN creator_username VARCHAR(64) NOT NULL COMMENT '创建账号'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN updated_by VARCHAR(64) NOT NULL COMMENT '最近更新账号'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE romantic_plan MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN plan_id BIGINT NOT NULL COMMENT '所属计划 ID'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN title VARCHAR(120) NOT NULL COMMENT '条目标题'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN content VARCHAR(300) NOT NULL DEFAULT '' COMMENT '条目内容'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN scheduled_at DATETIME NULL COMMENT '安排时间'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN end_at DATETIME NULL COMMENT '结束时间'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN location VARCHAR(120) NOT NULL DEFAULT '' COMMENT '地点说明'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN completed TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否完成'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN completed_at DATETIME NULL COMMENT '完成时间'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN creator_username VARCHAR(64) NOT NULL COMMENT '创建账号'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE romantic_plan_item MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE romantic_plan_feedback MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE romantic_plan_feedback MODIFY COLUMN plan_id BIGINT NOT NULL COMMENT '所属计划 ID'");
        executeCommentSql("ALTER TABLE romantic_plan_feedback MODIFY COLUMN plan_item_id BIGINT NOT NULL DEFAULT 0 COMMENT '关联条目 ID'");
        executeCommentSql("ALTER TABLE romantic_plan_feedback MODIFY COLUMN feedback_date DATE NOT NULL COMMENT '反馈日期'");
        executeCommentSql("ALTER TABLE romantic_plan_feedback MODIFY COLUMN status VARCHAR(16) NOT NULL DEFAULT 'done' COMMENT '反馈状态'");
        executeCommentSql("ALTER TABLE romantic_plan_feedback MODIFY COLUMN content VARCHAR(300) NOT NULL COMMENT '反馈内容'");
        executeCommentSql("ALTER TABLE romantic_plan_feedback MODIFY COLUMN creator_username VARCHAR(64) NOT NULL COMMENT '创建账号'");
        executeCommentSql("ALTER TABLE romantic_plan_feedback MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE romantic_plan_feedback MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE album_memory_like MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE album_memory_like MODIFY COLUMN memory_id BIGINT NOT NULL COMMENT '所属回忆 ID'");
        executeCommentSql("ALTER TABLE album_memory_like MODIFY COLUMN username VARCHAR(64) NOT NULL COMMENT '点赞账号'");
        executeCommentSql("ALTER TABLE album_memory_like MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间'");

        executeCommentSql("ALTER TABLE album_memory_comment MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE album_memory_comment MODIFY COLUMN memory_id BIGINT NOT NULL COMMENT '所属回忆 ID'");
        executeCommentSql("ALTER TABLE album_memory_comment MODIFY COLUMN username VARCHAR(64) NOT NULL COMMENT '评论账号'");
        executeCommentSql("ALTER TABLE album_memory_comment MODIFY COLUMN content VARCHAR(200) NOT NULL COMMENT '评论内容'");
        executeCommentSql("ALTER TABLE album_memory_comment MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间'");
        executeCommentSql("ALTER TABLE album_memory_comment MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE biz_like_record MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE biz_like_record MODIFY COLUMN biz_type VARCHAR(64) NOT NULL COMMENT '业务类型'");
        executeCommentSql("ALTER TABLE biz_like_record MODIFY COLUMN biz_id BIGINT NOT NULL COMMENT '业务 ID'");
        executeCommentSql("ALTER TABLE biz_like_record MODIFY COLUMN username VARCHAR(64) NOT NULL COMMENT '点赞账号'");
        executeCommentSql("ALTER TABLE biz_like_record MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间'");

        executeCommentSql("ALTER TABLE biz_comment_record MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE biz_comment_record MODIFY COLUMN biz_type VARCHAR(64) NOT NULL COMMENT '业务类型'");
        executeCommentSql("ALTER TABLE biz_comment_record MODIFY COLUMN biz_id BIGINT NOT NULL COMMENT '业务 ID'");
        executeCommentSql("ALTER TABLE biz_comment_record MODIFY COLUMN username VARCHAR(64) NOT NULL COMMENT '评论账号'");
        executeCommentSql("ALTER TABLE biz_comment_record MODIFY COLUMN content VARCHAR(200) NOT NULL COMMENT '评论内容'");
        executeCommentSql("ALTER TABLE biz_comment_record MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间'");
        executeCommentSql("ALTER TABLE biz_comment_record MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE daily_summary MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE daily_summary MODIFY COLUMN summary_date DATE NOT NULL COMMENT '对应日期'");
        executeCommentSql("ALTER TABLE daily_summary MODIFY COLUMN mood VARCHAR(32) NOT NULL COMMENT '最新一条氛围标识'");
        executeCommentSql("ALTER TABLE daily_summary MODIFY COLUMN content VARCHAR(300) NOT NULL COMMENT '最新一条预览内容'");
        executeCommentSql("ALTER TABLE daily_summary MODIFY COLUMN creator_username VARCHAR(64) NOT NULL COMMENT '首次创建账号'");
        executeCommentSql("ALTER TABLE daily_summary MODIFY COLUMN updated_by VARCHAR(64) NOT NULL COMMENT '最近更新账号'");
        executeCommentSql("ALTER TABLE daily_summary MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE daily_summary MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE daily_summary_entry MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE daily_summary_entry MODIFY COLUMN summary_id BIGINT NOT NULL COMMENT '所属日期记录 ID'");
        executeCommentSql("ALTER TABLE daily_summary_entry MODIFY COLUMN mood VARCHAR(32) NOT NULL COMMENT '条目氛围标识'");
        executeCommentSql("ALTER TABLE daily_summary_entry MODIFY COLUMN content VARCHAR(300) NOT NULL COMMENT '条目内容'");
        executeCommentSql("ALTER TABLE daily_summary_entry MODIFY COLUMN creator_username VARCHAR(64) NOT NULL COMMENT '创建账号'");
        executeCommentSql("ALTER TABLE daily_summary_entry MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
        executeCommentSql("ALTER TABLE daily_summary_entry MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'");

        executeCommentSql("ALTER TABLE daily_summary_media MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID'");
        executeCommentSql("ALTER TABLE daily_summary_media MODIFY COLUMN entry_id BIGINT NOT NULL COMMENT '所属条目 ID'");
        executeCommentSql("ALTER TABLE daily_summary_media MODIFY COLUMN media_type VARCHAR(16) NOT NULL COMMENT '媒体类型'");
        executeCommentSql("ALTER TABLE daily_summary_media MODIFY COLUMN file_url VARCHAR(255) NOT NULL COMMENT '媒体文件路径'");
        executeCommentSql("ALTER TABLE daily_summary_media MODIFY COLUMN thumbnail_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '缩略图路径'");
        executeCommentSql("ALTER TABLE daily_summary_media MODIFY COLUMN sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值'");
        executeCommentSql("ALTER TABLE daily_summary_media MODIFY COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'");
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
