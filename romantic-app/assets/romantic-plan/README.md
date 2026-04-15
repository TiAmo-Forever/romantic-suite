# 浪漫计划页面素材方案

## 说明

这个目录专门承接“浪漫计划”模块的正式切图与装饰素材。

当前页面已经完成第一版结构开发，接下来补图时不再临时找位置，而是统一按这里的命名、尺寸和用途落盘。

本方案重点服务以下页面：

- `pages/modules/romantic-plan/index.vue`
- `pages/modules/romantic-plan/detail.vue`
- `pages/modules/romantic-plan/edit.vue`

## 目录约定

- `backgrounds/`
  - 页面主背景、云层氛围图、顶部光感背景
- `titles/`
  - “浪漫计划”“计划中心”“计划详情”“计划编辑”这类标题字图
- `ribbons/`
  - 粉色、绿色、米白系丝带标题切图
- `covers/`
  - 列表卡封面、详情主卡封面、计划类型默认封面
- `empty-state/`
  - 空状态插画，例如记事本、咖啡杯、纸飞机等组合图
- `buttons/`
  - 新建计划按钮、步骤按钮、特殊装饰按钮底图
- `decor/`
  - 小爱心、闪光、云角、角标、边框装饰等透明 PNG
- `textures/`
  - 纸张肌理、柔光颗粒、淡金粉尘等可复用纹理
- `prompts/`
  - 素材出图提示词、第一批核心素材说明、后续分批出图文档
- `previews/`
  - 不替换页面的独立预览稿，用来先看标题、丝带、按钮和整页氛围方向

## 素材落地原则

1. 不把整页做成一张大海报图。
2. 文字、按钮、列表、筛选、表单保持真实组件承载。
3. 切图只承担氛围、装饰、标题和插画，不承担核心文案排版。
4. 同一类素材尽量复用，避免每个页面单独画一整套。
5. 优先透明 PNG，便于叠在真实页面结构上。
6. 单张素材尽量控制体积，避免对小程序首屏造成明显压力。

## 当前建议素材清单

### 1. 列表页主视觉

- `backgrounds/plan-center-sky-main.png`
  - 用途：列表页顶部到中段的主氛围背景
  - 建议尺寸：`1440 x 2200`
  - 特点：暖粉、浅金、淡云层，保留中部可读区域

- `titles/plan-center-title-main.png`
  - 用途：列表页“浪漫计划”主标题字
  - 建议尺寸：`1200 x 420`
  - 特点：手写感标题字，透明底

- `ribbons/ribbon-shared-pink.png`
  - 用途：列表页“共同安排”丝带
  - 建议尺寸：`420 x 140`

- `ribbons/ribbon-list-green.png`
  - 用途：列表页“计划列表”丝带
  - 建议尺寸：`420 x 140`

- `buttons/button-create-plan-main.png`
  - 用途：列表页“新建计划”主按钮底图
  - 建议尺寸：`720 x 220`

- `empty-state/empty-plan-notebook.png`
  - 用途：空状态左侧记事本插画
  - 建议尺寸：`520 x 520`

- `empty-state/empty-plan-cups.png`
  - 用途：空状态右侧双杯插画
  - 建议尺寸：`520 x 520`

- `decor/paper-plane-soft.png`
  - 用途：列表页底部纸飞机装饰
  - 建议尺寸：`320 x 220`

### 2. 详情页主视觉

- `backgrounds/plan-detail-sky-main.png`
  - 用途：详情页主背景
  - 建议尺寸：`1440 x 2400`

- `titles/plan-detail-title.png`
  - 用途：详情页标题装饰字图，可复用列表页风格
  - 建议尺寸：`1200 x 360`

- `covers/cover-plan-default-daily.png`
  - 用途：日程计划默认封面
  - 建议尺寸：`960 x 640`

- `covers/cover-plan-default-interval.png`
  - 用途：周期计划默认封面
  - 建议尺寸：`960 x 640`

- `covers/cover-plan-default-stage.png`
  - 用途：阶段计划默认封面
  - 建议尺寸：`960 x 640`

- `decor/frame-soft-corner.png`
  - 用途：详情主卡边角装饰
  - 建议尺寸：`240 x 240`

### 3. 编辑页主视觉

- `backgrounds/plan-edit-sky-main.png`
  - 用途：编辑页主背景
  - 建议尺寸：`1440 x 2400`

- `titles/plan-edit-title.png`
  - 用途：编辑页标题字图
  - 建议尺寸：`1200 x 360`

- `covers/cover-plan-editor-placeholder.png`
  - 用途：编辑页封面区正式占位图
  - 建议尺寸：`960 x 640`

- `ribbons/ribbon-steps-green.png`
  - 用途：编辑页“编辑步骤”丝带
  - 建议尺寸：`420 x 140`

### 4. 全页面复用装饰

- `decor/cloud-cluster-left.png`
  - 用途：页面左上或左中云层
  - 建议尺寸：`700 x 420`

- `decor/cloud-cluster-right.png`
  - 用途：页面右上或右中云层
  - 建议尺寸：`700 x 420`

- `decor/sparkle-pack-soft.png`
  - 用途：星光、闪片、小亮点组合
  - 建议尺寸：`600 x 600`

- `decor/heart-pack-soft.png`
  - 用途：小爱心点缀
  - 建议尺寸：`320 x 320`

- `textures/paper-grain-soft.png`
  - 用途：卡片底纹
  - 建议尺寸：`1024 x 1024`

## 视觉口径

- 氛围：温柔、轻梦幻、手账感、云朵和纸面结合
- 颜色：暖粉、奶油白、浅桃色、淡鼠尾草绿、柔金
- 光感：逆光云层、柔焦亮点、轻微闪粉
- 材质：纸张、布带、烫金边、柔软云雾

## 不建议的做法

- 不直接把参考图压成整页背景后硬盖文字
- 不把所有边框和装饰都用 CSS 临时画出来
- 不让切图承担正文段落和动态数字
- 不给每个页面做完全不同的一套素材，优先建立复用关系

## 后续接图顺序建议

1. 先补列表页：
   - 主背景
   - 主标题字
   - 两个丝带
   - 新建按钮
   - 空状态插画
2. 再补详情页：
   - 主背景
   - 三类默认封面
   - 边角装饰
3. 最后补编辑页：
   - 主背景
   - 标题字
   - 编辑页封面占位图

## 备注

当前目录只是正式素材方案和落盘位置约定。

等确认开始出图时，后续生成或设计出来的素材需要严格按这里的文件名和目录放置，避免页面代码再次跟着改路径。

当前第一批核心素材的逐张提示词已经整理在：

- `prompts/phase-1-core-assets.md`

当前也补了一组不接入页面的独立预览稿，主要用于先确认视觉方向：

- `previews/plan-center-title-main-preview.svg`
- `previews/ribbon-shared-pink-preview.svg`
- `previews/button-create-plan-main-preview.svg`
- `previews/plan-center-page-preview.svg`
