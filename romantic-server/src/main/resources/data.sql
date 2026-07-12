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

INSERT INTO meal_dish (name, category, preference, cover_url, memory, description, recipe, creator_username, updated_by)
SELECT '番茄炒蛋', 'hot', 'both', '', '酸甜刚好，是我们常点的一道菜', '番茄和鸡蛋都很家常，但一起吃的时候总觉得像认真过日子。', '1. 鸡蛋打散后先炒到凝固盛出。\n2. 番茄切块，小火炒出汁。\n3. 鸡蛋回锅，加盐和少量糖调味。\n4. 出锅前撒一点葱花。', 'chenjia', 'chenjia'
WHERE NOT EXISTS (SELECT 1 FROM meal_dish WHERE name = '番茄炒蛋');

INSERT INTO meal_dish (name, category, preference, cover_url, memory, description, recipe, creator_username, updated_by)
SELECT '手撕包菜', 'hot', 'partner', '', '他每次来都要点这道，说简单才好吃', '火候够的时候，包菜边缘会有一点焦香，配米饭很合适。', '1. 包菜手撕成片，洗净沥干。\n2. 热锅下蒜和干辣椒炒香。\n3. 大火下包菜翻炒，加盐、生抽、少量醋。\n4. 断生后马上出锅。', 'chenjia', 'chenjia'
WHERE NOT EXISTS (SELECT 1 FROM meal_dish WHERE name = '手撕包菜');

INSERT INTO meal_dish (name, category, preference, cover_url, memory, description, recipe, creator_username, updated_by)
SELECT '皮蛋豆腐', 'cold', 'me', '', '夏天必点，清爽又下饭', '不用开火也能完成的一道凉菜，适合想轻松吃饭的晚上。', '1. 内酯豆腐倒扣装盘。\n2. 皮蛋切块铺在豆腐上。\n3. 生抽、香醋、香油、蒜末调汁。\n4. 淋上料汁，撒葱花。', 'liubaohua', 'liubaohua'
WHERE NOT EXISTS (SELECT 1 FROM meal_dish WHERE name = '皮蛋豆腐');

INSERT INTO meal_dish (name, category, preference, cover_url, memory, description, recipe, creator_username, updated_by)
SELECT '冬瓜排骨汤', 'soup', 'both', '', '天凉了就特别想喝，软糯清甜', '排骨汤不急，慢慢炖出来才有适合两个人的味道。', '1. 排骨冷水下锅焯水。\n2. 加姜片重新炖 40 分钟。\n3. 放冬瓜继续炖到透明。\n4. 加盐调味，出锅撒葱花。', 'chenjia', 'chenjia'
WHERE NOT EXISTS (SELECT 1 FROM meal_dish WHERE name = '冬瓜排骨汤');

INSERT INTO meal_dish (name, category, preference, cover_url, memory, description, recipe, creator_username, updated_by)
SELECT '葱油拌面', 'staple', 'partner', '', '晚一点吃也很舒服', '香葱慢慢熬出油香，拌面的时候会很有满足感。', '1. 小葱切段，小火熬到微焦。\n2. 生抽、老抽、糖调成酱汁。\n3. 酱汁倒入葱油中煮开。\n4. 面条煮熟后拌匀。', 'liubaohua', 'liubaohua'
WHERE NOT EXISTS (SELECT 1 FROM meal_dish WHERE name = '葱油拌面');
