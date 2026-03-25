CREATE TABLE IF NOT EXISTS couple_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    nickname VARCHAR(64) NOT NULL,
    city VARCHAR(64) NOT NULL,
    lover_nickname VARCHAR(64) NOT NULL,
    bio VARCHAR(255) NOT NULL,
    anniversary_date VARCHAR(20) NOT NULL,
    default_meeting_area_id INT NOT NULL DEFAULT 0,
    default_meeting_place VARCHAR(64) NOT NULL,
    email VARCHAR(128) NOT NULL DEFAULT '',
    avatar_type VARCHAR(32) NOT NULL DEFAULT 'preset',
    avatar_preset VARCHAR(32) NOT NULL DEFAULT 'heart',
    avatar_text VARCHAR(16) NOT NULL DEFAULT '💕',
    avatar_image LONGTEXT NOT NULL,
    theme_preset_key VARCHAR(32) NOT NULL DEFAULT 'pink',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS basic_area (
    id INT NOT NULL,
    level INT NOT NULL,
    parent_id INT NOT NULL DEFAULT 0,
    zip_code BIGINT NOT NULL DEFAULT 0,
    city_code CHAR(6) NOT NULL DEFAULT '',
    name VARCHAR(50) NOT NULL DEFAULT '',
    short_name VARCHAR(50) NOT NULL DEFAULT '',
    merger_name VARCHAR(100) NOT NULL DEFAULT '',
    pinyin VARCHAR(30) NOT NULL DEFAULT '',
    loc_lng DECIMAL(10, 6) NOT NULL DEFAULT 0.000000,
    loc_lat DECIMAL(10, 6) NOT NULL DEFAULT 0.000000,
    PRIMARY KEY (id),
    KEY idx_basic_area_parent_id (parent_id)
);

CREATE TABLE IF NOT EXISTS anniversary_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'custom',
    event_date DATE NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL DEFAULT '',
    cover_url VARCHAR(255) NOT NULL DEFAULT '',
    like_count BIGINT NOT NULL DEFAULT 0,
    reminder_type VARCHAR(32) NOT NULL DEFAULT 'none',
    last_reminded_on DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_anniversary_event_username (username),
    KEY idx_anniversary_event_date (event_date)
);

CREATE TABLE IF NOT EXISTS anniversary_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    media_type VARCHAR(16) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_anniversary_media_event_id (event_id)
);

CREATE TABLE IF NOT EXISTS countdown_plan (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lover_name VARCHAR(64) NOT NULL,
    place VARCHAR(100) NOT NULL DEFAULT '',
    note VARCHAR(255) NOT NULL DEFAULT '',
    next_meeting_at DATETIME NOT NULL,
    last_meeting_at DATETIME NOT NULL,
    is_all_day TINYINT(1) NOT NULL DEFAULT 0,
    created_by VARCHAR(64) NOT NULL DEFAULT '',
    updated_by VARCHAR(64) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS improvement_note (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    target_type VARCHAR(16) NOT NULL DEFAULT 'both',
    status VARCHAR(16) NOT NULL DEFAULT 'improving',
    status_emoji VARCHAR(16) NOT NULL DEFAULT '🌱',
    start_date DATE NOT NULL,
    latest_feedback VARCHAR(255) NOT NULL DEFAULT '',
    creator_username VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_improvement_note_start_date (start_date),
    KEY idx_improvement_note_status (status)
);

CREATE TABLE IF NOT EXISTS improvement_feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    note_id BIGINT NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'improving',
    status_emoji VARCHAR(16) NOT NULL DEFAULT '🌱',
    content VARCHAR(255) NOT NULL,
    creator_username VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_improvement_feedback_note_id (note_id)
);

CREATE TABLE IF NOT EXISTS improvement_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    note_id BIGINT NOT NULL COMMENT '所属改进记录ID',
    feedback_id BIGINT NOT NULL DEFAULT 0 COMMENT '所属反馈记录ID，0表示主记录媒体',
    media_type VARCHAR(16) NOT NULL COMMENT '媒体类型',
    file_url VARCHAR(255) NOT NULL COMMENT '媒体文件路径',
    thumbnail_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '缩略图路径',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_improvement_media_note_id (note_id),
    KEY idx_improvement_media_feedback_id (feedback_id)
) COMMENT='恋爱改进簿媒体资源表';

CREATE TABLE IF NOT EXISTS user_notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipient_username VARCHAR(64) NOT NULL,
    actor_username VARCHAR(64) NOT NULL DEFAULT '',
    type VARCHAR(64) NOT NULL,
    title VARCHAR(120) NOT NULL,
    content VARCHAR(255) NOT NULL,
    biz_type VARCHAR(64) NOT NULL DEFAULT '',
    biz_id BIGINT NOT NULL DEFAULT 0,
    payload_json TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    read_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_notification_recipient_read (recipient_username, is_read),
    KEY idx_user_notification_recipient_created_at (recipient_username, created_at),
    KEY idx_user_notification_biz (biz_type, biz_id)
);

CREATE TABLE IF NOT EXISTS album_memory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    title VARCHAR(120) NOT NULL,
    memory_date DATE NOT NULL,
    location VARCHAR(100) NOT NULL DEFAULT '',
    summary VARCHAR(255) NOT NULL DEFAULT '',
    tags_json TEXT NOT NULL,
    cover_url VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_album_memory_date (memory_date),
    KEY idx_album_memory_username (username)
);

CREATE TABLE IF NOT EXISTS album_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    memory_id BIGINT NOT NULL,
    media_type VARCHAR(16) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_album_media_memory_id (memory_id)
);
