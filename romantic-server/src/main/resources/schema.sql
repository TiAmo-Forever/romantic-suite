CREATE TABLE IF NOT EXISTS couple_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    username VARCHAR(64) NOT NULL UNIQUE COMMENT '登录账号',
    password VARCHAR(64) NOT NULL COMMENT '登录密码',
    nickname VARCHAR(64) NOT NULL COMMENT '自己的真实姓名',
    city VARCHAR(64) NOT NULL COMMENT '所在城市',
    lover_nickname VARCHAR(64) NOT NULL COMMENT '对方对你的称呼',
    bio VARCHAR(255) NOT NULL COMMENT '个性签名',
    anniversary_date VARCHAR(20) NOT NULL COMMENT '纪念日',
    default_meeting_area_id INT NOT NULL DEFAULT 0 COMMENT '默认见面城市行政区编码',
    default_meeting_place VARCHAR(64) NOT NULL COMMENT '默认见面地点',
    email VARCHAR(128) NOT NULL DEFAULT '' COMMENT '邮箱',
    avatar_type VARCHAR(32) NOT NULL DEFAULT 'preset' COMMENT '头像类型',
    avatar_preset VARCHAR(32) NOT NULL DEFAULT 'heart' COMMENT '预设头像标识',
    avatar_text VARCHAR(16) NOT NULL DEFAULT '💕' COMMENT '字符头像内容',
    avatar_image LONGTEXT NOT NULL COMMENT '上传头像相对路径',
    theme_preset_key VARCHAR(32) NOT NULL DEFAULT 'pink' COMMENT '主题预设标识',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='情侣账号资料表';

CREATE TABLE IF NOT EXISTS basic_area (
    id INT NOT NULL COMMENT '行政区代码',
    level INT NOT NULL COMMENT '层级',
    parent_id INT NOT NULL DEFAULT 0 COMMENT '父级行政区代码',
    zip_code BIGINT NOT NULL DEFAULT 0 COMMENT '邮政编码',
    city_code CHAR(6) NOT NULL DEFAULT '' COMMENT '区号',
    name VARCHAR(50) NOT NULL DEFAULT '' COMMENT '名称',
    short_name VARCHAR(50) NOT NULL DEFAULT '' COMMENT '简称',
    merger_name VARCHAR(100) NOT NULL DEFAULT '' COMMENT '完整组合名称',
    pinyin VARCHAR(30) NOT NULL DEFAULT '' COMMENT '拼音',
    loc_lng DECIMAL(10, 6) NOT NULL DEFAULT 0.000000 COMMENT '经度',
    loc_lat DECIMAL(10, 6) NOT NULL DEFAULT 0.000000 COMMENT '纬度',
    PRIMARY KEY (id),
    KEY idx_basic_area_parent_id (parent_id)
) COMMENT='基础行政区划表';

CREATE TABLE IF NOT EXISTS anniversary_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    username VARCHAR(64) NOT NULL COMMENT '创建账号',
    title VARCHAR(100) NOT NULL COMMENT '纪念日标题',
    type VARCHAR(32) NOT NULL DEFAULT 'custom' COMMENT '纪念日类型',
    event_date DATE NOT NULL COMMENT '纪念日日期',
    description TEXT NOT NULL COMMENT '纪念日说明',
    location VARCHAR(100) NOT NULL DEFAULT '' COMMENT '地点描述',
    cover_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面资源相对路径',
    like_count BIGINT NOT NULL DEFAULT 0 COMMENT '点赞次数',
    reminder_type VARCHAR(32) NOT NULL DEFAULT 'none' COMMENT '提醒类型',
    last_reminded_on DATE NULL COMMENT '最近一次提醒日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_anniversary_event_username (username),
    KEY idx_anniversary_event_date (event_date)
) COMMENT='恋爱纪念日主表';

CREATE TABLE IF NOT EXISTS anniversary_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    event_id BIGINT NOT NULL COMMENT '所属纪念日 ID',
    media_type VARCHAR(16) NOT NULL COMMENT '媒体类型',
    file_url VARCHAR(255) NOT NULL COMMENT '媒体文件相对路径',
    thumbnail_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '视频缩略图相对路径',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_anniversary_media_event_id (event_id)
) COMMENT='纪念日媒体资源表';

CREATE TABLE IF NOT EXISTS countdown_plan (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    lover_name VARCHAR(64) NOT NULL COMMENT '对方称呼',
    place VARCHAR(100) NOT NULL DEFAULT '' COMMENT '见面地点',
    note VARCHAR(255) NOT NULL DEFAULT '' COMMENT '计划说明',
    next_meeting_at DATETIME NOT NULL COMMENT '下次见面时间',
    last_meeting_at DATETIME NOT NULL COMMENT '上次见面时间',
    is_all_day TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否按全天见面计算',
    created_by VARCHAR(64) NOT NULL DEFAULT '' COMMENT '首次创建账号',
    updated_by VARCHAR(64) NOT NULL DEFAULT '' COMMENT '最近修改账号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='共享见面倒计时计划表';

CREATE TABLE IF NOT EXISTS improvement_note (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    title VARCHAR(120) NOT NULL COMMENT '事情标题',
    description TEXT NOT NULL COMMENT '事情说明',
    target_type VARCHAR(16) NOT NULL DEFAULT 'both' COMMENT '改进对象类型',
    status VARCHAR(16) NOT NULL DEFAULT 'improving' COMMENT '当前改进状态',
    status_emoji VARCHAR(16) NOT NULL DEFAULT '🌱' COMMENT '状态表情',
    start_date DATE NOT NULL COMMENT '开始记录日期',
    latest_feedback VARCHAR(255) NOT NULL DEFAULT '' COMMENT '最近一次反馈内容',
    creator_username VARCHAR(64) NOT NULL COMMENT '创建账号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_improvement_note_start_date (start_date),
    KEY idx_improvement_note_status (status)
) COMMENT='恋爱改进簿主记录表';

CREATE TABLE IF NOT EXISTS improvement_feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    note_id BIGINT NOT NULL COMMENT '所属改进记录 ID',
    status VARCHAR(16) NOT NULL DEFAULT 'improving' COMMENT '反馈时的状态',
    status_emoji VARCHAR(16) NOT NULL DEFAULT '🌱' COMMENT '反馈状态表情',
    content VARCHAR(255) NOT NULL COMMENT '反馈内容',
    creator_username VARCHAR(64) NOT NULL COMMENT '反馈账号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '反馈时间',
    KEY idx_improvement_feedback_note_id (note_id)
) COMMENT='恋爱改进簿反馈记录表';

CREATE TABLE IF NOT EXISTS improvement_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    note_id BIGINT NOT NULL COMMENT '所属改进记录 ID',
    feedback_id BIGINT NOT NULL DEFAULT 0 COMMENT '所属反馈记录 ID，0 表示主记录媒体',
    media_type VARCHAR(16) NOT NULL COMMENT '媒体类型',
    file_url VARCHAR(255) NOT NULL COMMENT '媒体文件路径',
    thumbnail_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '缩略图路径',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_improvement_media_note_id (note_id),
    KEY idx_improvement_media_feedback_id (feedback_id)
) COMMENT='恋爱改进簿媒体资源表';

CREATE TABLE IF NOT EXISTS user_notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    recipient_username VARCHAR(64) NOT NULL COMMENT '接收账号',
    actor_username VARCHAR(64) NOT NULL DEFAULT '' COMMENT '触发账号',
    type VARCHAR(64) NOT NULL COMMENT '通知类型',
    title VARCHAR(120) NOT NULL COMMENT '通知标题',
    content VARCHAR(255) NOT NULL COMMENT '通知内容',
    biz_type VARCHAR(64) NOT NULL DEFAULT '' COMMENT '关联业务类型',
    biz_id BIGINT NOT NULL DEFAULT 0 COMMENT '关联业务 ID',
    payload_json TEXT NOT NULL COMMENT '扩展负载 JSON',
    is_read TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读',
    read_at DATETIME NULL COMMENT '已读时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_user_notification_recipient_read (recipient_username, is_read),
    KEY idx_user_notification_recipient_created_at (recipient_username, created_at),
    KEY idx_user_notification_biz (biz_type, biz_id)
) COMMENT='用户站内通知表';

CREATE TABLE IF NOT EXISTS album_memory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    username VARCHAR(64) NOT NULL COMMENT '创建账号',
    title VARCHAR(120) NOT NULL COMMENT '回忆标题',
    memory_date DATE NOT NULL COMMENT '回忆日期',
    location VARCHAR(100) NOT NULL DEFAULT '' COMMENT '地点',
    summary VARCHAR(255) NOT NULL DEFAULT '' COMMENT '回忆内容',
    tags_json TEXT NOT NULL COMMENT '标签 JSON',
    cover_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面路径',
    like_count BIGINT NOT NULL DEFAULT 0 COMMENT '点赞次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_album_memory_date (memory_date),
    KEY idx_album_memory_username (username)
) COMMENT='甜蜜相册回忆主表';

CREATE TABLE IF NOT EXISTS album_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    memory_id BIGINT NOT NULL COMMENT '所属回忆 ID',
    media_type VARCHAR(16) NOT NULL COMMENT '媒体类型',
    file_url VARCHAR(255) NOT NULL COMMENT '媒体文件路径',
    thumbnail_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '缩略图路径',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_album_media_memory_id (memory_id)
) COMMENT='甜蜜相册媒体资源表';

CREATE TABLE IF NOT EXISTS album_memory_like (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    memory_id BIGINT NOT NULL COMMENT '所属回忆 ID',
    username VARCHAR(64) NOT NULL COMMENT '点赞账号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    KEY idx_album_memory_like_memory_id (memory_id),
    KEY idx_album_memory_like_username (username)
) COMMENT='甜蜜相册点赞记录表（兼容迁移保留）';

CREATE TABLE IF NOT EXISTS album_memory_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    memory_id BIGINT NOT NULL COMMENT '所属回忆 ID',
    username VARCHAR(64) NOT NULL COMMENT '评论账号',
    content VARCHAR(200) NOT NULL COMMENT '评论内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_album_memory_comment_memory_id (memory_id),
    KEY idx_album_memory_comment_created_at (created_at)
) COMMENT='甜蜜相册评论记录表（兼容迁移保留）';

CREATE TABLE IF NOT EXISTS biz_like_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    biz_type VARCHAR(64) NOT NULL COMMENT '业务类型',
    biz_id BIGINT NOT NULL COMMENT '业务 ID',
    username VARCHAR(64) NOT NULL COMMENT '点赞账号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    KEY idx_biz_like_record_biz (biz_type, biz_id),
    KEY idx_biz_like_record_username (username)
) COMMENT='通用业务点赞记录表';

CREATE TABLE IF NOT EXISTS biz_comment_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    biz_type VARCHAR(64) NOT NULL COMMENT '业务类型',
    biz_id BIGINT NOT NULL COMMENT '业务 ID',
    username VARCHAR(64) NOT NULL COMMENT '评论账号',
    content VARCHAR(200) NOT NULL COMMENT '评论内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_biz_comment_record_biz (biz_type, biz_id),
    KEY idx_biz_comment_record_created_at (created_at)
) COMMENT='通用业务评论记录表';

CREATE TABLE IF NOT EXISTS daily_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    summary_date DATE NOT NULL COMMENT '对应日期',
    mood VARCHAR(32) NOT NULL COMMENT '最新一条氛围标识',
    content VARCHAR(300) NOT NULL COMMENT '最新一条预览内容',
    creator_username VARCHAR(64) NOT NULL COMMENT '首次创建账号',
    updated_by VARCHAR(64) NOT NULL COMMENT '最近更新账号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_daily_summary_date (summary_date),
    KEY idx_daily_summary_updated_at (updated_at)
) COMMENT='今日小计共享记录表';

CREATE TABLE IF NOT EXISTS daily_summary_entry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    summary_id BIGINT NOT NULL COMMENT '所属日期记录 ID',
    mood VARCHAR(32) NOT NULL COMMENT '条目氛围标识',
    content VARCHAR(300) NOT NULL COMMENT '条目内容',
    creator_username VARCHAR(64) NOT NULL COMMENT '创建账号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    KEY idx_daily_summary_entry_summary_id (summary_id),
    KEY idx_daily_summary_entry_updated_at (updated_at)
) COMMENT='今日小计条目表';

CREATE TABLE IF NOT EXISTS daily_summary_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    entry_id BIGINT NOT NULL COMMENT '所属条目 ID',
    media_type VARCHAR(16) NOT NULL COMMENT '媒体类型',
    file_url VARCHAR(255) NOT NULL COMMENT '媒体文件路径',
    thumbnail_url VARCHAR(255) NOT NULL DEFAULT '' COMMENT '缩略图路径',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    KEY idx_daily_summary_media_entry_id (entry_id)
) COMMENT='今日小计媒体资源表';
