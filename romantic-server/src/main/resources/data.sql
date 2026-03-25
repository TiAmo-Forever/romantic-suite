-- 默认账号初始化脚本
-- 启动时会自动执行 schema.sql 和 data.sql，因此不需要手动建库后再插入账号。
INSERT INTO couple_profile (
    username,
    password,
    nickname,
    city,
    lover_nickname,
    bio,
    anniversary_date,
    default_meeting_place,
    email,
    avatar_type,
    avatar_preset,
    avatar_text,
    avatar_image
)
SELECT
    'chenjia',
    'admin',
    '陈佳',
    '上海',
    '宝花',
    '把喜欢写进每一天。',
    '2025-02-14',
    '上海',
    '',
    'preset',
    'heart',
    '💕',
    ''
WHERE NOT EXISTS (
    SELECT 1
    FROM couple_profile
    WHERE username = 'chenjia'
);

INSERT INTO couple_profile (
    username,
    password,
    nickname,
    city,
    lover_nickname,
    bio,
    anniversary_date,
    default_meeting_place,
    email,
    avatar_type,
    avatar_preset,
    avatar_text,
    avatar_image
)
SELECT
    'liubaohua',
    'admin',
    '宝花',
    '上海',
    '陈佳',
    '把喜欢写进每一天。',
    '2025-02-14',
    '上海',
    '',
    'preset',
    'heart',
    '💕',
    ''
WHERE NOT EXISTS (
    SELECT 1
    FROM couple_profile
    WHERE username = 'liubaohua'
);