# WORKSPACE NOTES

## 工作区概览

- 工作区：`D:\JavaProject\romantic-suite`
- 前端项目：`romantic-app`
- 后端项目：`romantic-server`
- 当前数据库：`MySQL 8.0`
- 默认账号：
  - `chenjia / admin`
  - `liubaohua / admin`

## 项目定位

### 前端

- `romantic-app` 为前端 App 项目，主要承载首页、星球页、我的页、账号设置、纪念日、倒数日、恋爱改进簿等页面。
- 前端所有用户可见文案统一使用中文。
- 前端环境地址需要区分开发环境和生产环境，请求地址由配置文件统一管理，避免页面内写死。

### 后端

- `romantic-server` 为后端接口项目，负责登录鉴权、个人资料、主题、纪念日、倒数日、恋爱改进簿、文件上传等接口。
- 后端所有注释统一使用中文，新增和修改代码时要补充必要中文注释，方便后续维护。
- 后端数据库统一使用 `MySQL 8.0`，不再使用 `H2`。

## 共享与私有边界

- 私有数据：
  - 账号
  - 密码
  - 头像
  - 主题
  - 个人资料中明确属于当前账号自身的信息
- 共享数据：
  - 纪念日
  - 恋爱改进簿
  - 见面倒计时
  - 其他情侣共同内容
- 共享数据允许两个账号相互查看和编辑。
- 私有数据绝不能因为另一个账号修改而被同步覆盖。

## 开发约定

### 编码与乱码处理

- 仓库内源码、配置、脚本、SQL、Markdown 统一使用 `UTF-8`。
- Windows 终端查看中文时可能出现显示乱码，这不一定代表文件内容已经损坏，需要区分“终端显示问题”和“文件真实编码问题”。
- 如果前端页面出现历史乱码或旧内容残留，优先清理：
  - `romantic-app/unpackage/dist`
  - `romantic-app/unpackage/cache`

### 数据库约定

- 所有表必须有表注释。
- 所有字段必须有字段注释。
- 新增表和字段时，`schema.sql` 与迁移逻辑都要同步维护。
- 需要关注更新时间字段，业务更新时应显式维护 `updated_at`，不能出现修改后更新时间不变化的问题。

### 接口与文档约定

- 后端新增或修改对外接口时，必须同步补齐 Swagger / Knife4j 注解。
- 注解风格必须严格参照 [Knife4jConfig.java](D:/JavaProject/romantic-suite/romantic-server/src/main/java/org/love/romantic/config/Knife4jConfig.java) 当前约定执行，保持控制器、接口方法、请求对象、响应对象的文档风格统一。
- 后端项目中凡是还没有加上 Swagger 相关注解的地方，后续都需要补齐，不能遗漏。

### 联调约定

- 新增业务模块时，不能只完成页面或接口其中一侧，必须检查前后端联调是否真正打通。
- 排查问题时要区分：
  - 编译错误
  - 运行时错误
  - 接口链路错误
- 不能把所有问题都误判为乱码问题。

## 历史阶段整理

### 早期基础整理

- 明确了工作区结构：`romantic-app` 为前端，`romantic-server` 为后端。
- 建立了 `WORKSPACE_NOTES.md` 作为项目历史记录文件。
- 前端已完成首页、星球页、我的页、账号设置等主要基础页面。

### 后端基础完善阶段

- 登录从“默认固定账号”改为数据库账号校验。
- 本地数据库初始化默认账号：
  - `chenjia / admin`
  - `liubaohua / admin`
- 接入请求日志与关键业务日志。
- 排查并修正“查询资料却触发 update”的问题。
- 接入 MySQL 8.0，移除 H2 依赖。
- 表和字段注释迁移统一交给迁移逻辑处理。

### 主题与资料阶段

- 主题改为按账号隔离保存，不能互相覆盖。
- 主题后续已接入后端同步，不再只是本地缓存。
- `nickname` 语义重新定义为“自己的真实姓名”。
- `loverNickname` 语义重新定义为“对方对自己的称呼”。

### 地点与头像阶段

- 地点选择统一改为三级联动思路，并支持手动输入与已有地点选择。
- 头像由本地保存改为上传后仅保存相对路径。
- 上传图片支持点击查看原图。

## 2026-03-19 更新记录

### 目标

- 补齐图片原图预览。
- 新增“恋爱改进簿”模块。
- 尝试首页重设计并保留可回滚版本。

### 处理顺序

1. 为上传图片展示接入原图预览能力。
2. 设计并落地“恋爱改进簿”后端与前端第一版。
3. 尝试首页 `home.vue` 重设计。
4. 根据效果回滚首页，同时保留设计稿备份。

### 关键结果

- 主要图片展示入口都已支持查看原图。
- “恋爱改进簿”已完成列表、详情、编辑第一版。
- 首页重设计已回滚，设计稿单独保留备份，后续可继续迭代。

## 2026-03-20 更新记录

### 目标

- 继续修正前端显示细节和主题同步问题。
- 收口共享与私有边界。
- 整理地点选择与纪念日、倒数日等共享能力。
- 统一补充当前阶段的工程规范。

### 处理顺序

1. 修正小程序端和前端页面中的符号转义问题。
2. 将主题正式接入后端同步。
3. 明确共享数据与私有数据边界。
4. 修正纪念日创建人、更新时间、倒数日共享逻辑。
5. 统一地点选择为三级联动思路。
6. 整理并重写 `WORKSPACE_NOTES.md`。

### 关键问题

- 曾出现把接口链路问题误判为乱码问题的情况，后续排查必须区分问题类型。
- Windows 终端存在中文显示乱码问题，但这不等于文件内容一定损坏。
- 前端旧编译缓存会放大旧问题，排查时要同步考虑缓存因素。

### 关键结果

- 主题已按账号隔离，并接入后端同步。
- 纪念日创建人不会因为别人编辑而被覆盖。
- 共享内容与私有内容边界已经重新明确。
- 地点选择已统一到更顺畅的三级联动交互方向。
- 数据库表与字段注释规范已明确。
- Swagger / Knife4j 注解补齐要求已正式纳入开发约定。
- 已对纪念日、见面倒计时、恋爱改进簿相关请求模型、响应模型、实体类以及部分控制器参数补齐 Swagger / Knife4j 注解，并通过后端 `mvn test` 验证。

## 后续记录规范

- 每次开发完成后，按日期追加更新记录。
- 每次记录至少包含：
  - 目标
  - 处理顺序
  - 关键问题
  - 关键结果
- 如果调整了共享规则、数据库结构、接口规范、部署配置等长期约束，必须同步写入“开发约定”或“共享与私有边界”部分。
## 2026-03-22 更新记录

### 目标

- 将“恋爱改进簿”升级到第二版，支持主记录上传图片和视频。
- 让“追加反馈”也支持上传图片和视频，但时间线默认保持折叠展示，不直接把媒体全部铺开。
- 修正编辑页里只有点到文字区域才能弹出选择器的问题，改成整行任意位置都可以点击触发。
- 同步调整列表页、编辑页、详情页的版式，让第二版更适合持续记录。

### 处理顺序

1. 先重新梳理 `romantic-app` 与 `romantic-server` 中恋爱改进簿当前的数据流、页面结构和已有上传能力。
2. 在后端补充恋爱改进簿专属媒体上传入口、媒体数据表、媒体请求模型和媒体响应模型。
3. 改造恋爱改进簿服务层，让主记录媒体与反馈媒体都可以随保存逻辑一起入库、回显和删除。
4. 重写前端恋爱改进簿列表页、编辑页、详情页，补上媒体上传、折叠展示和整行可点击交互。
5. 做后端编译验证，确认新的实体、模型、Mapper 和服务逻辑可以正常通过编译。

### 关键问题

- 恋爱改进簿原本只有文字链路，没有可复用的数据结构来区分“主记录媒体”和“反馈媒体”。
- 项目里虽然已有纪念日媒体上传能力，但恋爱改进簿没有自己的上传入口和自己的持久化表。
- 编辑页里的选择器原本是把 `picker` 嵌在局部内容里，导致用户感知上只有点到文字才会弹出。
- 反馈时间线如果把所有图片和视频直接平铺，会明显破坏信息密度和阅读节奏，所以需要“文字主导、媒体折叠”的展示策略。

### 关键结果

- 后端新增了恋爱改进簿媒体能力：
  - 新增 `/api/files/improvement-media` 上传接口。
  - 新增 `improvement_media` 表，用于承接主记录媒体和反馈媒体。
  - 新增 `ImprovementMedia` 实体、`ImprovementMediaMapper`、`ImprovementMediaRequest`、`ImprovementMediaResponse`。
  - 恋爱改进簿主记录接口和反馈接口现在都支持携带 `mediaList`。
- 后端恋爱改进簿服务逻辑已升级：
  - 创建和编辑主记录时会同步保存主记录媒体。
  - 追加反馈时会同步保存反馈媒体。
  - 删除恋爱改进簿记录时，会一并清理反馈、媒体记录和对应本地托管文件。
  - 列表页返回主记录媒体摘要，详情页返回主记录媒体与反馈媒体完整列表。
- 前端恋爱改进簿第二版页面已调整：
  - 列表页支持显示媒体摘要卡片，但默认折叠，不直接铺满图片和视频。
  - 编辑页支持上传图片和视频，并改为整行 `picker` 触发，点击整行都能弹出选择器。
  - 详情页支持主记录媒体折叠展开、反馈媒体折叠展开，以及反馈表单上传图片和视频。
- 媒体数量约束当前统一为：
  - 每条主记录最多 9 张图片、1 个视频。
  - 每条反馈最多 9 张图片、1 个视频。
- 已完成的验证：
  - 后端使用 `mvn -gs D:\Service_File\work_maven\setting.xml -s D:\Service_File\work_maven\setting.xml -DskipTests compile` 编译通过。
  - 前端源码层已完成页面和服务改造，但本轮未额外执行 uni-app 真机或小程序端编译验证。

## 2026-03-23 更新记录

### 目标

- 补充长期执行规范，避免后续开发时遗漏数据库和文档约束。

### 关键结果

- 新增明确约束：后续任何开发、排查、联调、改表、补接口之前，必须先完整阅读 `WORKSPACE_NOTES.md`，确认当前长期约束和最近更新记录后再开始动手。
- 新增明确约束：所有新建表都必须同时具备表注释和字段注释，不能只给部分表补注释，也不能遗漏中间表、关联表、媒体表。
- 新增明确约束：如果本次工作触及长期规则、数据库结构、接口规范、共享边界、部署方式或前后端联调约束，完成后必须同步更新 `WORKSPACE_NOTES.md`。
## 2026-03-23 补充约定

### 目标

- 补充文档维护规则，确保开发记录不会遗漏。

### 关键结果

- 新增明确约束：每次做代码、配置、数据库、接口、页面、样式或联调改动后，必须同步更新 `WORKSPACE_NOTES.md`，不能等到后面集中补写。
- 新增明确约束：如果当天已经没有新的开发需求或改动计划，需要主动询问一次是否要整理并保存当日更新记录。

## 2026-03-23 甜蜜相册更新记录

### 目标

- 将“甜蜜相册”从首页占位能力升级为可实际使用的完整模块。
- 补齐甜蜜相册的前端页面、后端接口、媒体上传、数据持久化和入口跳转。
- 调整甜蜜相册的页面文案和交互细节，去掉“预留感”和占位式表达。

### 处理顺序

1. 先确定甜蜜相册的产品定位，按“回忆卡片流”而不是普通图库来设计首页、详情页和编辑页。
2. 在前端完成甜蜜相册首页初版，并接入首页、星球页入口。
3. 继续补齐甜蜜相册详情页、新建页、编辑页，以及本地数据流转能力。
4. 在后端新增甜蜜相册主表、媒体表、上传接口、CRUD 接口和文件存储逻辑。
5. 将前端甜蜜相册从本地存储切换为真实后端接口调用。
6. 根据使用反馈持续调整标签区、上传按钮、返回按钮、卡片背景和文案显示方式。
7. 修正首页和星球页中甜蜜相册仍显示“预留”的状态标记。

### 关键问题

- 甜蜜相册最开始只有页面方向，没有后端支撑，不能真正做到多端可用。
- 相册类页面在当前环境下容易受到中文模板内容和历史缓存影响，排查时需要区分源码问题和编译缓存问题。
- 编辑页最初把标签和上传入口直接平铺，结构感不足，且标签不支持自定义。
- 编辑页和详情页一开始缺少稳定可见的返回入口，用户需要滑动页面才能返回。
- 相册卡片初版底层过空，缺少回忆内容的氛围承接，需要用首张媒体图做更自然的背景承托。
- 已完成模块如果仍在首页或星球页显示“预留”，会和真实功能状态不一致。

### 关键结果

- 前端已新增甜蜜相册完整页面：
  - `romantic-app/pages/modules/album/index.vue`
  - `romantic-app/pages/modules/album/detail.vue`
  - `romantic-app/pages/modules/album/edit.vue`
- 前端已新增甜蜜相册服务层：
  - `romantic-app/services/albums.js`
  - `romantic-app/utils/media-upload.js` 中已补充相册媒体上传能力
- 甜蜜相册当前支持的前端能力包括：
  - 回忆列表展示
  - `全部 / 本月 / 今年` 筛选
  - 回忆详情查看
  - 新建回忆
  - 编辑回忆
  - 删除回忆
  - 图片上传
  - 视频上传
  - 自定义标签
  - 左上角固定返回按钮
- 甜蜜相册编辑页已从“固定标签平铺”调整为更有结构的形式，拆分为常用标签模块和自定义标签模块，并支持新增与删除自定义标签。
- 甜蜜相册编辑页和详情页都已补充左上角返回按钮，不再需要先滑到顶部才能返回。
- 甜蜜相册列表卡片已改为优先使用首张媒体做柔化背景，减轻底层空洞感。
- 甜蜜相册内部已去掉明显占位式文案，不再把“未设置地点”“未设置日期”“未命名回忆”这类文案作为默认展示内容。
- 首页和星球页里的甜蜜相册入口状态已从“预留”改为“已开放”。

- 后端已新增甜蜜相册数据库结构：
  - `album_memory`
  - `album_media`
- 后端已新增甜蜜相册相关代码：
  - `romantic-server/src/main/java/org/love/romantic/entity/AlbumMemory.java`
  - `romantic-server/src/main/java/org/love/romantic/entity/AlbumMedia.java`
  - `romantic-server/src/main/java/org/love/romantic/mapper/AlbumMemoryMapper.java`
  - `romantic-server/src/main/java/org/love/romantic/mapper/AlbumMediaMapper.java`
  - `romantic-server/src/main/java/org/love/romantic/model/AlbumMemoryRequest.java`
  - `romantic-server/src/main/java/org/love/romantic/model/AlbumMemoryResponse.java`
  - `romantic-server/src/main/java/org/love/romantic/model/AlbumMediaRequest.java`
  - `romantic-server/src/main/java/org/love/romantic/model/AlbumMediaResponse.java`
  - `romantic-server/src/main/java/org/love/romantic/controller/AlbumMemoryController.java`
  - `romantic-server/src/main/java/org/love/romantic/service/AlbumMemoryService.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/AlbumMemoryServiceImpl.java`
- 后端已新增甜蜜相册媒体上传接口：
  - `/api/files/album-media`
- 文件存储能力已补充甜蜜相册目录和清理逻辑：
  - `StorageProperties.java`
  - `LocalFileStorageService.java`
- `schema.sql` 和 `SchemaMigrationRunner.java` 已同步维护甜蜜相册相关表结构。

### 验证情况

- 后端已执行：
  - `mvn -gs D:\Service_File\work_maven\setting.xml -s D:\Service_File\work_maven\setting.xml -DskipTests compile`
- 后端编译已通过。
- 前端源码与接口调用链路已补齐，但本轮未额外执行 uni-app 真机或小程序编译验证。
## 2026-03-24 更新记录

### 目标

- 修复甜蜜相册创建记录时触发登录失效的问题。
- 调整见面倒计时，让“上次见面”只按年月日处理，进度按天计算。
- 补充接口鉴权接入规则，避免后续新增模块重复遗漏拦截器配置。

### 处理顺序

1. 先重新阅读 `WORKSPACE_NOTES.md`，确认当前长期规则和最近一次模块变更内容。
2. 排查甜蜜相册创建链路的前端请求、媒体上传和后端接口权限配置。
3. 修复后端鉴权拦截器的路由范围，补齐甜蜜相册接口保护。
4. 调整倒计时后端时间解析逻辑，让上次见面统一按日期入参和返回。
5. 调整倒计时前端页面表单、缓存默认值和进度计算逻辑。
6. 将本次问题和新的长期要求同步写回 `WORKSPACE_NOTES.md`。

### 关键问题

- 甜蜜相册接口虽然已经完成了前后端 CRUD，但后端 `WebConfig` 中遗漏了 `/api/albums/**` 的鉴权拦截配置。
- 甜蜜相册列表查询不依赖登录上下文，因此早期没有暴露问题；但创建记录时服务层会调用 `AuthContext.getRequiredUsername()`，于是直接被后端判定为未登录，并触发前端跳回登录页。
- 这类问题本质上不是某个模块单点 bug，而是“新增受保护业务模块时没有同步接入鉴权拦截器”的工程规则缺失。
- 见面倒计时原来把“上次见面”也当成精确到时分的时间来保存和显示，导致页面和进度条都偏离了“按天记录见面节奏”的需求。

### 关键结果

- 后端已修复甜蜜相册接口鉴权遗漏问题：
  - `romantic-server/src/main/java/org/love/romantic/config/WebConfig.java`
  - 已将 `/api/albums/**` 加入鉴权拦截器保护范围。
- 后端已调整倒计时服务逻辑：
  - `romantic-server/src/main/java/org/love/romantic/service/impl/CountdownPlanServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/model/CountdownPlanRequest.java`
  - 上次见面现在按 `yyyy-MM-dd` 日期解析和返回。
  - 下次见面仍兼容 `yyyy-MM-dd` 与 `yyyy-MM-dd HH:mm` 两种格式。
  - 共享倒计时默认的上次见面时间已收敛到日期起点，不再保留历史时分。
- 前端已调整倒计时页面：
  - `romantic-app/pages/modules/countdown/index.vue`
  - `romantic-app/utils/countdown.js`
  - 上次见面已取消时间选择器，只保留日期选择。
  - 上次见面文案改为只显示年月日。
  - “已经想念了多少天”和“进度值”改为按自然日计算，不再按小时分钟滚动。
- 新增长期约束：
  - 以后新增任何需要登录态的业务模块、控制器或接口分组时，必须同步检查并补齐鉴权拦截器路由配置。
  - 新模块联调时，不能只验证“能打开页面”或“能查列表”，必须至少验证一次新增、修改或删除这类会进入业务服务层的受保护操作。
- 首页视觉结构已按新版 UI 方向重做：
  - `romantic-app/pages/home/home.vue`
  - 首页已从“功能入口卡片堆叠”调整为“品牌标题 + 主倒计时卡 + 两张摘要卡 + 今日小记 + 四宫格入口”的结构。
  - 主倒计时卡强化了大数字和单一辅助文案，减少重复说明。
  - 恋爱纪念日与恋爱改进簿两张摘要卡改成不同的信息重心，不再机械同模板。
  - 今日小记改为真实内容卡样式，不再像输入框占位。
  - 底部功能入口改为更轻的四宫格入口卡，并弱化“更多功能”的视觉权重。
  - 首页新版样式已回收到现有主题变量体系，不再把主色、文字色、卡片色固定写死为单一金棕方案。
  - 首页顶部品牌标题区已继续精修，补上更完整的副标题、装饰线和细节装饰，让品牌区不再显得空。
  - 首页四宫格入口图标已从 emoji 改成统一的一套正式图形语言，包括相册、纪念日、改进簿和更多功能。
  - 首页卡片留白密度已继续统一，摘要卡、今日小记和四宫格入口的内边距与高度已进一步收敛。
  - 首页状态标签已统一改成更精致的一套胶囊样式，不再出现不同区域标签风格割裂的问题。
  - 首页恋爱纪念日摘要已补充具体日期显示，当前会同时展示天数和纪念日日期，不再只显示数字。
  - 首页已尝试接入见面倒计时、纪念日、改进簿三块摘要数据；本轮未额外执行 uni-app 真机或小程序编译验证。
- 星球页已同步升级到与首页一致的新版视觉语言：
  - `romantic-app/pages/planet/planet.vue`
  - 星球页已改为“品牌区 + 说明卡 + 模块卡片网格”的新版结构，不再延续旧版模块中心卡片风格。
  - 星球页模块卡片已统一使用与首页相同的正式图标体系，保证首页与星球页之间的视觉一致性。
  - 星球页卡片的留白密度和状态标签样式已与首页统一。
- 首页与星球页的点击反馈动效已统一：
  - 首页与星球页的可点击卡片现在统一使用同一套按压反馈节奏，包含轻微下沉、缩放和阴影变化。
- 星球页板块排版已固定为一行两个模块：
  - 星球页不再在手机窄屏下自动降为单列，避免模块区显得过于空荡。
- 我的页已重做为与首页、星球页一致的新版视觉语言：
  - `romantic-app/pages/mine/mine.vue`
  - 我的页已改为“品牌区 + 资料卡 + 两张摘要卡 + 双列功能卡”的结构，不再延续旧版个人中心样式。
  - 我的页中的账号设置、主题设置、消息中心、退出登录等内容已统一纳入同一套卡片、留白、状态标签和点击反馈体系。
- 底部导航已同步升级为与首页、星球页、我的页一致的新版视觉语言：
  - `romantic-app/pages/components/BottomTab.vue`
  - 底部导航已去掉旧版 emoji/旧图标表达，改为统一的正式图形图标体系，分别对应首页、星球、我的三个主入口。
  - 底部导航激活态已统一接入现有主题色渐变变量，确保切换主题时不会与页面主视觉割裂。
  - 底部导航点击反馈已与首页、星球页的卡片反馈节奏统一，使用一致的轻微下沉、缩放和阴影变化。
- 我的页摘要卡已补充层级优化：
  - `romantic-app/pages/mine/mine.vue`
  - “账号设置”摘要卡不再把昵称、城市、纪念日日期硬拼为一整行主文案，改为“主名称 + 次级信息标签”的分层展示。
  - 次级信息现按城市、纪念日日期分别显示为轻量标签，避免蓝色大字在卡片中心堆叠得过于突兀。
  - “主题设置”摘要卡同步调整为与“账号设置”一致的层级表达，当前主题名称改为主信息，色板与说明信息改为辅助层，不再让整张卡显得松散。
- 小程序底部导航交互已补充稳定性修正：
  - `romantic-app/utils/nav.js`
  - `romantic-app/pages/components/BottomTab.vue`
  - 底部导航页间切换不再使用 `reLaunch`，避免小程序端整页重建带来的闪烁和页面跳动感。
  - 底部导航点击时不再先行切换本地激活态，避免跳转前出现短暂错位高亮。
  - 底部导航按压反馈去掉位移缩放，改为更轻的透明度反馈，避免固定底栏在小程序里出现“向上跳一下”的体感。
  - 首页、星球页、我的页这类底部主导航页不再复用整页 `app-fade-up` 进场动画，避免小程序端切页时出现整体向上浮入、闪动或跳动感。
  - 后续确认仅靠页面内自定义底栏仍无法彻底消除小程序端的页面重建闪烁，因此已进一步调整为真正的 tabBar 架构：
    - `romantic-app/pages.json`
    - `romantic-app/custom-tab-bar/index.vue`
    - `romantic-app/utils/nav.js`
    - `romantic-app/pages/home/home.vue`
    - `romantic-app/pages/planet/planet.vue`
    - `romantic-app/pages/mine/mine.vue`
  - 首页、星球页、我的页已正式注册为 tab 页面，页间切换改为 `uni.switchTab`。
  - 原先写在页面内部的 `BottomTab` 已从三个主页面移除，改由 `custom-tab-bar` 统一承载，以避免点击底栏时整页销毁重建。
  - 后续实机验证发现 `custom-tab-bar` 在当前 uni-app 小程序链路下未稳定渲染，页面底部只保留空白安全区而未显示按钮，因此当前先回退为原生 `tabBar` 显示方案，优先保证稳定可见与可点击：
    - `romantic-app/pages.json`
  - 当前主页面仍保持真正的 tab 页切换方式，但底部栏先由原生 tabBar 承载；后续如需继续做高度定制外观，需要在单独验证通过后再重新启用自定义底栏。
- 用户已要求撤回本轮“按钮异常处理”相关临时方案，因此当前已恢复到异常排查前的页面内 `BottomTab` 结构：
  - `romantic-app/pages/home/home.vue`
  - `romantic-app/pages/planet/planet.vue`
  - `romantic-app/pages/mine/mine.vue`
  - `romantic-app/pages/components/BottomTab.vue`
  - `romantic-app/utils/nav.js`
  - `romantic-app/styles/common.scss`
  - `romantic-app/pages.json`
  - 已移除临时新增的 `romantic-app/custom-tab-bar/index.vue`
- 我的页结构已补充去重约束：
  - `romantic-app/pages/mine/mine.vue`
  - “账号设置”“主题设置”不再同时出现在顶部摘要卡和下方功能卡两层区域，避免同一入口重复展示。
  - 当前保留一套功能入口卡，资料卡负责展示个人信息，不再额外堆叠重复摘要模块。

### 今日收尾

- 2026-03-24 当前前端主页面状态已整理为：
  - 首页、星球页、我的页沿用同一套新版视觉语言。
  - 我的页已去掉重复的“账号设置 / 主题设置”双层展示，只保留一套正式入口卡。
  - 底部导航相关异常处理临时方案已全部撤回，当前恢复为页面内 `BottomTab` 结构，后续若要继续处理小程序底栏闪动，需要单独重新设计方案，不在现有版本上继续叠补丁。
- 2026-03-24 当前后端主状态已整理为：
  - 甜蜜相册鉴权拦截遗漏已修复。
  - 见面倒计时“上次见面”已统一按日期处理，按天计算进度。

## 2026-03-24 登录页视觉改版记录

### 目标

- 参考新的正式版 UI 图，重做前端登录页面视觉与交互。
- 去掉登录页中直接展示默认账号和密码的信息，避免测试口径外露到正式页面。
- 为“忘记密码”保留可感知交互，但暂不开放实际找回流程。

### 处理顺序

1. 先核对 `romantic-app/pages/login/login.vue` 当前实现，确认默认账号预填、默认密码预填和测试账号文案的来源。
2. 按照新的暖金奶油风格重写登录页结构、背景氛围、品牌区、输入区和主按钮样式。
3. 补上“记住账号”“显示/隐藏密码”“忘记密码暂未开放提示”这些轻量交互。
4. 同步移除默认账号密码展示和旧版偏测试态的登录文案。
5. 将本次页面与交互规则变更补记到 `WORKSPACE_NOTES.md`。

### 关键问题

- 原登录页直接预填 `chenjia / admin`，并在页面中展示可用测试账号，这不适合正式版视觉和对外展示口径。
- 原页面整体风格仍停留在早期粉色玻璃卡片方案，与当前首页、星球页、我的页已经升级后的正式版气质不一致。
- “忘记密码”当前没有真实业务流程，但如果完全去掉入口，页面完整度会下降，因此需要保留交互但明确暂未开放。

### 关键结果

- 前端登录页已按新的 UI 方向重做：
  - `romantic-app/pages/login/login.vue`
  - 页面已调整为暖金奶油系品牌风格，包含信封品牌图形、品牌标题、副标题、登录卡片和底部正式文案。
  - 登录输入区已改为更接近设计图的正式卡片式结构，不再沿用旧版测试态玻璃面板表达。
- 默认账号和密码相关展示已移除：
  - 不再预填默认账号。
  - 不再预填默认密码。
  - 不再在页面上展示测试账号与密码提示。
- 登录页已补充轻量交互：
  - 新增“记住账号”本地记忆能力，当前业务口径为同时记住账号与密码，并在下次进入登录页时回填。
  - 新增密码显示/隐藏切换。
  - “忘记密码”入口保留，但当前点击后只提示“忘记密码功能暂未开放”，未接入真实流程。
  - 账号输入框占位文案已调整为“输入账号，继续今天的心动”，保持正式版口吻同时增加情绪氛围。
  - 密码输入框占位文案已调整为“输入密码，赴约今天的甜蜜”，与账号输入框保持统一的情绪化正式版表达。

### 验证情况

- 本轮已完成源码级改造与约束同步。
- 本轮未额外执行 uni-app 真机或小程序编译验证，后续联调时仍需补一次页面实机检查。
- 首页头部品牌区已补充居中修正：
  - `romantic-app/pages/home/home.vue`
  - 已进一步将品牌区从头部双栏结构中彻底解耦，改为独立按整屏中线绝对居中显示。
  - 右上角设置按钮当前仅作为覆盖层悬浮在品牌区外侧，不再占用品牌区的横向排版空间。
  - 首页“首页主站 / 爱意成笺 / 把喜欢写进每天的小日子”当前按整屏视觉中心居中显示。

## 2026-03-24 恋爱改进簿反馈编辑记录

### 目标

- 为恋爱改进簿详情页中的反馈记录补齐编辑能力。
- 支持修改反馈内容、反馈状态以及反馈图片/视频。
- 不限制必须由反馈创建人本人操作，保持情侣共享协作口径。

### 处理顺序

1. 先核对恋爱改进簿当前详情页、前端服务层和后端反馈接口现状。
2. 在后端新增反馈编辑接口，并补齐 Swagger / Knife4j 注解。
3. 在后端服务层补齐反馈更新、媒体替换和主记录最新反馈同步逻辑。
4. 在前端详情页为每条反馈新增“编辑反馈”入口和可保存的编辑面板。
5. 执行后端 `mvn test` 验证本轮接口与服务改动。

### 关键问题

- 原有能力只支持“新增反馈”，不支持后续修改，因此反馈内容一旦提交就无法调整。
- 反馈媒体虽然已有上传和回显链路，但缺少可复用的“编辑后替换媒体”接口与页面交互。
- 本次需求明确不限制非创建人操作，因此实现时不能额外加上“仅创建人可编辑”的限制。

### 关键结果

- 后端已新增恋爱改进簿反馈编辑接口：
  - `romantic-server/src/main/java/org/love/romantic/controller/ImprovementNoteController.java`
  - 新增 `PUT /api/improvement-notes/{id}/feedback/{feedbackId}`，用于编辑单条反馈。
- 后端服务层已补齐反馈编辑逻辑：
  - `romantic-server/src/main/java/org/love/romantic/service/ImprovementNoteService.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/ImprovementNoteServiceImpl.java`
  - 支持更新反馈状态、反馈内容和反馈媒体列表。
  - 编辑反馈时会同步替换该反馈下的媒体记录，并清理被移除的本地托管文件。
  - 编辑完成后会重新同步主记录的最新反馈摘要与状态，避免主记录摘要和时间线内容脱节。
  - 当前未额外增加“仅创建人可编辑”的权限限制，保持共享数据双方都可操作。
- 前端详情页已补齐反馈编辑能力：
  - `romantic-app/pages/modules/improvement/detail.vue`
  - `romantic-app/services/improvement-notes.js`
  - 每条反馈现在都可展开“编辑反馈”面板。
  - 支持修改反馈状态、反馈内容、反馈图片、反馈视频。
  - 编辑保存后会刷新详情数据，并清空当前编辑态，避免旧表单残留。

### 验证情况

- 后端已执行：
  - `mvn test`
- 后端测试通过，构建成功。
- 前端本轮完成源码级改造，但未额外执行 uni-app 真机或小程序端编译验证。
- 已补充前端交互稳定性修正：
  - `romantic-app/pages/modules/improvement/detail.vue`
  - 在反馈编辑态下调起相册或视频选择器时，会暂时跳过下一次 `onShow` 自动重载，避免用户刚选完媒体就因为详情页重载而闪退编辑面板。

## 2026-03-24 站内通知中心记录

### 目标

- 为共享账号协作场景补齐第一版“站内通知 / 消息中心”能力，让一方登录或修改共享内容后，另一方可以看到提醒。
- 通知类型设计必须保留扩展性，不能把当前模块写死在数据库结构或前端分支判断里，便于后续继续接入新模块。
- 将“我的”页中的消息中心从占位入口升级为真实可查看、可标记已读、可跳转业务详情的页面。

### 处理顺序

1. 先补齐后端通知表、`schema.sql` 和迁移逻辑，并为新表和字段补全注释。
2. 新增通知实体、Mapper、Service、Controller 和受保护接口路由。
3. 在登录、倒计时、纪念日、恋爱改进簿、甜蜜相册等已有业务成功链路里接入通知落库。
4. 前端新增通知服务与消息中心页面，并把“我的”页入口接到真实消息列表。
5. 执行后端 `mvn test` 验证后端改动是否可通过构建。

### 关键问题

- 项目原先只有“消息中心”入口，没有真实的通知表、消息接口、未读数统计和已读状态流转能力。
- 这次需求明确要求通知类型后续还会继续扩展，因此类型设计不能绑定单一枚举展示逻辑，也不能只覆盖当前模块。
- 当前项目还没有正式的情侣绑定关系表，所以第一版接收人解析只能先沿用“除操作人以外的其他账号”这一共享双人模型，后续如升级为正式关系体系，需要同步调整通知接收策略。

### 关键结果

- 后端已新增站内通知能力：
  - `romantic-server/src/main/resources/schema.sql`
  - `romantic-server/src/main/java/org/love/romantic/config/SchemaMigrationRunner.java`
  - 新增 `user_notification` 表，并同步补齐迁移逻辑、表注释和字段注释。
- 后端已新增通知相关代码：
  - `romantic-server/src/main/java/org/love/romantic/entity/UserNotification.java`
  - `romantic-server/src/main/java/org/love/romantic/mapper/UserNotificationMapper.java`
  - `romantic-server/src/main/java/org/love/romantic/model/UserNotificationResponse.java`
  - `romantic-server/src/main/java/org/love/romantic/model/UserNotificationUnreadResponse.java`
  - `romantic-server/src/main/java/org/love/romantic/service/UserNotificationService.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/UserNotificationServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/controller/UserNotificationController.java`
  - 已补齐消息列表、未读数、单条已读、全部已读接口，并补充 Swagger / Knife4j 注解。
- 通知类型与业务类型已按“字符串常量 + 可持续扩展”方式收口：
  - `romantic-server/src/main/java/org/love/romantic/common/NotificationTypeConstants.java`
  - `romantic-server/src/main/java/org/love/romantic/common/NotificationBizTypeConstants.java`
  - 当前已接入 `login`、倒计时更新、纪念日新增/编辑、恋爱改进簿新增/编辑、反馈新增/编辑、相册新增/编辑等类型，后续新增模块时继续扩展常量并复用现有通知服务即可。
- 已将通知能力接入现有业务成功链路：
  - `romantic-server/src/main/java/org/love/romantic/service/impl/CoupleProfileServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/CountdownPlanServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/AnniversaryServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/ImprovementNoteServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/AlbumMemoryServiceImpl.java`
- 鉴权路由已同步补齐：
  - `romantic-server/src/main/java/org/love/romantic/config/WebConfig.java`
  - `/api/notifications/**` 已纳入登录态保护，避免消息接口遗漏鉴权拦截。
- 前端已新增真实消息中心：
  - `romantic-app/services/notifications.js`
  - `romantic-app/pages/modules/notifications/index.vue`
  - `romantic-app/pages.json`
  - 支持消息列表展示、未读数展示、单条已读、全部已读和按业务类型跳转详情页。
- “我的”页消息中心入口已接入真实通知能力：
  - `romantic-app/pages/mine/mine.vue`
  - 不再停留在占位页，当前会显示未读数量或“已查看”状态。

### 长期约束补充

- 后续新增任何模块通知时，通知类型与业务类型都必须继续走统一常量管理，保持“可扩展字符串类型 + 统一通知服务分发”的实现方式，不能把某个模块的判断硬编码散落到多个控制器或页面里。
- 后续如果正式引入情侣关系表或多对情侣体系，需要同步重构通知接收人解析逻辑，不能继续长期依赖“除自己外的其他账号”这一临时第一版规则。

### 验证情况

- 后端已执行：
  - `mvn test`
- 后端测试通过，构建成功。
- 前端本轮完成源码级改造，但未额外执行 uni-app 真机或小程序端编译验证，后续联调时仍需补一次消息中心页面与跳转链路的实际端侧检查。

## 2026-03-24 通知感知增强与文案润色记录

### 目标

- 在首页和“我的”页补上更有感知的通知入口，不只停留在消息中心独立页面里。
- 将站内通知文案从偏系统提示的表达，调整为更贴近正式版情侣产品气质的表达。
- 保持通知类型与业务类型仍然沿用可扩展设计，不因为文案调整破坏原有通知链路。

### 处理顺序

1. 先梳理首页与“我的”页现有结构，确认适合挂载未读提醒和最新摘要的位置。
2. 在前端补上首页最新提醒卡片，以及“我的”页消息中心入口的未读红点和最近一条摘要。
3. 同步清理通知页和通知服务层中的文案口径。
4. 调整后端登录、倒计时、纪念日、改进簿、反馈、相册等通知标题与内容表达。
5. 执行后端 `mvn test`，确认文案整理没有引入编译问题。

### 关键问题

- 原先通知能力虽然已经具备消息列表和未读统计，但首页和“我的”页对提醒的存在感还不够强，用户需要主动进入消息中心才能感知动态。
- 后端通知文案第一版偏“系统事件播报”，不够贴近情侣产品正式版的氛围。
- 本轮处理中曾出现一次真实源码风险：批量修正文案时误把后端两个服务文件中的字符串替换坏，导致 `ImprovementNoteServiceImpl.java` 和 `AlbumMemoryServiceImpl.java` 编译失败；随后已按源码结构逐项修回并再次通过测试。

### 关键结果

- 首页已补上最新提醒卡片：
  - `romantic-app/pages/home/home.vue`
  - 当前会展示未读数量、最近一条提醒摘要和时间，并支持点击直接进入消息中心。
- “我的”页消息中心入口已增强感知：
  - `romantic-app/pages/mine/mine.vue`
  - 当前会展示未读红点、最近一条提醒摘要，以及“X 条新提醒 / 已查看”状态。
- 通知服务层已补充最新一条提醒读取能力：
  - `romantic-app/services/notifications.js`
- 消息中心页面文案已统一润色并重写为正式版口径：
  - `romantic-app/pages/modules/notifications/index.vue`
- 后端通知文案已统一调整：
  - `romantic-server/src/main/java/org/love/romantic/service/impl/CoupleProfileServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/CountdownPlanServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/AnniversaryServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/ImprovementNoteServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/AlbumMemoryServiceImpl.java`
  - 登录、倒计时、纪念日、改进簿、反馈、相册等通知标题和内容已改为更温柔、更正式的表达。

### 验证情况

- 后端已重新执行：
  - `mvn test`
- 后端测试通过，构建成功。
- 前端本轮仍为源码级改造，尚未额外执行 uni-app 真机或小程序端编译验证；后续建议补一次首页、我的页、消息中心三处联动的实机检查。

## 2026-03-24 打包产物目录约束补充

### 关键结果

- 新增明确约束：后续开发、排查、联调时，默认不把以下目录作为功能修改目标或源码问题判断依据：
  - 前端 `romantic-app/unpackage`
  - 后端 `romantic-server/target`
- 上述目录统一视为打包或编译产物，仅在清理缓存、确认构建结果或排查产物残留时参考，正常功能改动应优先基于真实源码目录进行。

## 2026-03-24 首页提醒层级调整记录

### 目标

- 调整首页“最新提醒”的呈现方式，避免独立提醒卡片在首页中过于抢眼，影响倒计时与纪念日等主内容层级。

### 关键结果

- 首页提醒已从独立卡片模块调整为品牌区下方的一行轻提醒胶囊：
  - `romantic-app/pages/home/home.vue`
- 当前提醒表现改为更轻的状态条结构，只保留未读点、最近一条摘要、辅助时间和轻量入口文案，不再以完整功能卡片的形式参与首页主内容竞争。
- 本次调整仅涉及前端首页结构与样式层级，未改动后端通知接口与通知分发逻辑。

## 2026-03-24 首页提醒停留与红点接力记录

### 目标

- 进一步弱化首页提醒的打扰感，让提醒只在登录后短暂出现，再把未读感知交给底部“我的”按钮。

### 关键结果

- 首页轻提醒胶囊已继续收细，背景更淡、高度更短：
  - `romantic-app/pages/home/home.vue`
- 当前规则改为：
  - 每次登录成功后，首页轻提醒胶囊最多显示 5 秒。
  - 5 秒按全局时间窗口计算，切换到其他页面也会继续计时，不会因为离开首页而重新开始。
  - 超过 5 秒后，首页胶囊自动消失。
- 胶囊消失后，未读感知会转移到底部“我的”按钮红点：
  - `romantic-app/pages/components/BottomTab.vue`
  - 当前当且仅当存在未读消息，且首页 5 秒提示窗口已经结束时，底部“我的”按钮才显示红点。
- 为保证首页、我的页、消息中心和底部导航的未读状态同步，前端新增了统一状态工具：
  - `romantic-app/utils/notification-indicator.js`
  - 登录成功时会启动首页提醒窗口：
    - `romantic-app/pages/login/login.vue`
  - 消息中心标记已读后会同步刷新全局未读状态：
    - `romantic-app/pages/modules/notifications/index.vue`
  - “我的”页读取未读数时也会同步更新这套全局状态：
    - `romantic-app/pages/mine/mine.vue`

## 2026-03-24 WebSocket 通知实时刷新记录

### 目标

- 为现有站内通知中心补上实时刷新能力，让“我的”页、消息中心和首页轻提醒在通知产生后尽量实时更新。
- 保持当前通知体系“先落库、再展示”的主结构不变，WebSocket 只负责实时告知前端刷新。
- 首页轻提醒继续沿用现有 5 秒短暂停留逻辑，并在 5 秒内收到新通知时自动续期 5 秒。

### 处理顺序

1. 后端补 WebSocket 依赖、端点、握手鉴权和会话管理。
2. 在现有通知服务中补上“落库后推实时事件”和“已读状态变化时推实时事件”。
3. 前端新增全局 `notification-socket` 管理，统一负责连接、重连、事件分发和首页提示续期。
4. 先接“我的”页和消息中心的实时刷新。
5. 最后接首页轻提醒的实时续期与底部红点接力。

### 关键结果

- 后端已新增 WebSocket 能力：
  - `romantic-server/pom.xml`
  - `romantic-server/src/main/java/org/love/romantic/config/NotificationWebSocketConfig.java`
  - `romantic-server/src/main/java/org/love/romantic/websocket/NotificationHandshakeInterceptor.java`
  - `romantic-server/src/main/java/org/love/romantic/websocket/NotificationWebSocketHandler.java`
  - `romantic-server/src/main/java/org/love/romantic/websocket/NotificationWebSocketSessionRegistry.java`
  - 当前 WebSocket 端点为 `/ws/notifications`，连接时通过 `token` 参数复用现有登录态校验，并按 `username -> session集合` 管理连接。
- 后端已补齐统一实时推送服务：
  - `romantic-server/src/main/java/org/love/romantic/service/NotificationRealtimePushService.java`
  - `romantic-server/src/main/java/org/love/romantic/service/impl/NotificationRealtimePushServiceImpl.java`
  - `romantic-server/src/main/java/org/love/romantic/model/NotificationRealtimeEvent.java`
- 现有通知服务已升级为“落库 + 实时事件”一体化：
  - `romantic-server/src/main/java/org/love/romantic/service/impl/UserNotificationServiceImpl.java`
  - 当前在新增通知时会推送 `notification_created` 事件。
  - 当前在单条已读和全部已读时会推送 `notification_read_state_changed` 事件。
  - 实时事件会携带未读数量、最近一条通知摘要和业务定位信息，前端仍以现有 HTTP 接口刷新结果为准。
- 前端已新增全局实时连接管理：
  - `romantic-app/utils/notification-socket.js`
  - 当前负责登录后连接、应用回前台重连、异常断线重连、登出断连、事件分发和首页提示窗口续期。
  - WebSocket 地址继续从现有服务配置派生，未额外写死地址，保留线上环境可切换能力。
- 登录态与应用生命周期已接入实时连接：
  - `romantic-app/utils/auth.js`
  - `romantic-app/App.vue`
- “我的”页与消息中心已接入实时刷新：
  - `romantic-app/pages/mine/mine.vue`
  - `romantic-app/pages/modules/notifications/index.vue`
- 首页轻提醒已接入实时续期规则：
  - `romantic-app/pages/home/home.vue`
  - 当前在 5 秒窗口内收到新的通知事件时，会继续顺延 5 秒。
  - 如果提醒窗口结束后仍有未读，则继续由底部“我的”按钮红点承接提示。

### 验证情况

- 后端已执行：
  - `mvn test`
- 后端测试通过，构建成功。
- 前端本轮为源码级改造，尚未额外执行 uni-app 真机或小程序端编译验证；后续建议重点补测 WebSocket 连接建立、断线重连、实时未读刷新、首页 5 秒续期和底部红点接力这几条链路。

## 2026-03-24 全局通知条交互重构记录

### 目标

- 将原先仅在首页展示的消息胶囊升级为小程序内任意页面都可见的全局顶部通知条。
- 调整通知条尺寸和层级，让提醒更明显但不过度压迫页面主内容。
- 交互改为收到新通知后从页面顶部滑入展示 10 秒，可手动左滑关闭；关闭或超时后继续由“我的”底部红点承接未读提示。

### 处理顺序

1. 重构前端通知状态工具，将首页专属提示窗口改为全局通知条状态。
2. 新增全局顶部通知条组件，并挂载到 `romantic-app/App.vue` 根节点。
3. 调整 WebSocket 实时通知前端逻辑：新通知到达时触发 10 秒顶部通知条，并支持通知期间再次收到新消息时续期。
4. 移除首页 `home.vue` 原有局部消息胶囊展示，避免与全局通知条重复。
5. 同步调整登录页、底部导航和登出清理逻辑，确保未读状态、弹出状态和“我的”红点一致。

### 关键结果

- 前端新增全局顶部通知条组件：
  - `romantic-app/components/GlobalNotificationBanner.vue`
  - 当前支持从顶部滑入、停留 10 秒、点击进入消息中心、左滑关闭。
- 前端通知状态工具已从“首页 5 秒胶囊”升级为“全局通知条状态”：
  - `romantic-app/utils/notification-indicator.js`
  - 当前统一维护未读数、通知条内容、通知条到期时间和手动关闭后的状态。
- 根组件已接入全局通知条：
  - `romantic-app/App.vue`
  - 小程序任意页面只要应用仍在前台，收到新通知都可展示顶部通知条。
- WebSocket 前端处理逻辑已改为通知条驱动：
  - `romantic-app/utils/notification-socket.js`
  - 当前收到 `notification_created` 事件后会展示或续期全局通知条 10 秒。
- 首页已去除原先局部消息胶囊，回归内容主视线：
  - `romantic-app/pages/home/home.vue`
- 登录成功后不再额外人为触发首页专属胶囊，改为仅由真实通知事件驱动展示：
  - `romantic-app/pages/login/login.vue`
- “我的”底部红点承接逻辑已同步改为感知全局通知条状态，而不是感知首页局部胶囊状态：
  - `romantic-app/pages/components/BottomTab.vue`
- 登出时会同步清理未读数与全局通知条状态，避免切账号后残留旧通知界面：
  - `romantic-app/utils/auth.js`

### 验证情况

- 本轮为前端源码级改造，未额外执行 uni-app 小程序编译或真机验证。
- 后续建议重点联调以下链路：
  - 任意页面收到通知后顶部通知条滑入与 10 秒自动消失。
  - 10 秒内再次收到新通知时是否正确续期。
  - 左滑关闭后通知条是否立即消失。
  - 通知条消失后“我的”底部红点是否正确承接未读提示。

## 2026-03-24 全局通知条补充修正记录

### 关键问题

- 原先将全局通知条直接挂在 `romantic-app/App.vue`，在 uni-app 小程序端并不能像普通单页应用那样承载所有页面的可视内容，导致源码已改但页面上看不到通知条。
- 本轮排查过程中还出现了一次真实源码损坏：批量插入全局通知条时使用了不安全的写文件方式，导致部分中文源码被错误写成乱码；这属于源码写坏，不是终端显示乱码。
- 后续若再次需要批量修改前端页面，不要使用会经过控制台编码链路的整文件读写方式处理中文源码，优先使用 `apply_patch` 或明确的 UTF-8 无损写入方式。

### 关键结果

- 已将 `GlobalNotificationBanner` 组件改为全局注册：
  - `romantic-app/main.js`
- 已从 `romantic-app/App.vue` 移除无效的直接渲染挂载，避免继续误判。
- 已将 `GlobalNotificationBanner` 实际插入所有真实页面模板根节点下，确保小程序内任意页面都具备顶部通知条显示能力：
  - `romantic-app/pages/**`
  - 当前不包含仅作为子组件使用的 `pages/**/components/*.vue`
- 已优先修复被写坏并直接导致编译报错的首页文件：
  - `romantic-app/pages/home/home.vue`
  - 当前首页文案与脚本字符串已恢复为正常 UTF-8 可编译状态。

### 验证情况

- 本轮仍为前端源码级修正，尚未额外执行小程序真机编译验证。
- 后续若页面仍未看到最新效果，应优先重新编译小程序源码，不要把 `unpackage` 产物当成源码修改目标。

## 2026-03-24 pages 源码损坏修复记录
### 关键问题

- 在为全局通知条批量插入 `GlobalNotificationBanner` 时，部分 `pages/**/*.vue` 页面被错误写入了真实乱码和未闭合字符串。
- 这次问题属于源码内容被写坏，不是终端显示乱码，也不是 `unpackage` 产物残留。
- 受影响页面集中在登录页、我的页、资料页、关系设置页、消息中心页，以及恋爱改进簿的列表页、编辑页、详情页。

### 关键结果

- 已重建并修复以下页面源码，恢复为正常 UTF-8 中文和可编译状态：
  - `romantic-app/pages/login/login.vue`
  - `romantic-app/pages/mine/mine.vue`
  - `romantic-app/pages/account/profile.vue`
  - `romantic-app/pages/account/relationship.vue`
  - `romantic-app/pages/modules/notifications/index.vue`
  - `romantic-app/pages/modules/improvement/index.vue`
  - `romantic-app/pages/modules/improvement/edit.vue`
  - `romantic-app/pages/modules/improvement/detail.vue`
- 恋爱改进簿详情页保留了当前版本需要的能力：
  - 查看记录详情
  - 查看主记录媒体
  - 新增反馈
  - 编辑任意反馈内容与媒体
  - 删除记录
- 已对 `romantic-app/pages/**/*.vue` 再次回扫：
  - 未再发现真实坏字符
  - 未再发现未闭合 `placeholder` 字符串

### 长期约束补充

- 后续若需要批量修改前端页面，不要使用会经过控制台编码链路的整文件读写方式处理中文源码。
- 优先使用 `apply_patch` 做增量修改；如果必须整页重建，也要直接以 UTF-8 内容重写源码文件。
- 已补充前端页面源码巡检脚本：
  - `romantic-app/tools/check-pages-source.ps1`
  - 建议在批量修改 `romantic-app/pages/**/*.vue` 之后立刻执行一次：
    - `powershell -ExecutionPolicy Bypass -File D:\JavaProject\romantic-suite\romantic-app\tools\check-pages-source.ps1`
  - 当前脚本会重点检查：
    - 真实乱码替换字符
    - 常见中文源码转码残片
    - 未闭合的 `placeholder` 字符串
    - 单行奇数个单引号的可疑字符串断裂

### 验证情况

- 本轮完成了源码级修复与页面级回扫。
- 尚未额外执行 uni-app 小程序编译或真机验证，后续应重点检查：
  - 登录页是否恢复可编译
  - 我的页、消息中心页是否正常展示
  - 恋爱改进簿列表、编辑、详情与反馈编辑链路是否正常
## 2026-03-24 pages 源码补充修复记录
### 关键问题

- `pages` 目录里仍有少量页面存在真实源码损坏，不属于终端显示乱码。
- 这轮重点问题包括模板属性断裂、中文文案乱码、`showToast` 字符串未闭合，以及页面标签被写坏后导致的编译报错。

### 关键结果

- 已补齐并修复以下页面源码：
  - `romantic-app/pages/account/data.vue`
  - `romantic-app/pages/modules/media-viewer/index.vue`
  - `romantic-app/pages/mine/mine.vue`
  - `romantic-app/pages/modules/notifications/index.vue`
- `media-viewer/index.vue` 已修复 `AccountHeader` 属性断裂问题，避免再次出现 `Attribute name cannot contain U+0022/U+0027/U+003C` 这类 Vite 编译错误。
- `data.vue` 已恢复正常的“恢复默认资料 / 重新同步资料”逻辑和提示文案。
- `mine.vue` 已恢复正式版中文文案，并保留当前“资料卡 + 单层功能入口卡 + BottomTab”的结构。
- `notifications/index.vue` 已恢复消息中心页面的中文文案、空状态、全部已读和跳转逻辑。

### 验证情况

- 已执行页面源码巡检脚本：
  - `powershell -ExecutionPolicy Bypass -File D:\JavaProject\romantic-suite\romantic-app\tools\check-pages-source.ps1`
- 巡检结果：
  - `OK: no suspicious page-source findings under D:\JavaProject\romantic-suite\romantic-app\pages`
- 本轮未额外执行 uni-app / 小程序真机编译，后续应优先重新编译验证页面展示与跳转链路。
## 2026-03-24 area-picker 编译修复记录
### 关键问题

- `romantic-app/pages/account/area-picker.vue` 存在真实源码损坏，`restoreAreaSelection` 的 `catch` 注释段被写坏后吞掉了脚本闭合结构。
- Vite 编译报错位置落在 `</script>`，但根因是脚本内部上方已有语法断裂。

### 关键结果

- 已重建并修复 `romantic-app/pages/account/area-picker.vue`，保留原有地区搜索、三级联动、手动输入和回填草稿逻辑。
- 已恢复正常中文文案，并清掉导致脚本闭合异常的损坏注释片段。

### 验证情况

- 已再次执行页面源码巡检脚本：
  - `powershell -ExecutionPolicy Bypass -File D:\JavaProject\romantic-suite\romantic-app\tools\check-pages-source.ps1`
- 巡检结果：
  - `OK: no suspicious page-source findings under D:\JavaProject\romantic-suite\romantic-app\pages`
- 已额外对 `pages/**/*.vue` 做同类坏标签和可疑乱码片段补充搜索，当前未发现新的同型问题。
## 2026-03-25 消息中心筛选优化记录
### 关键结果

- `romantic-app/pages/modules/notifications/index.vue` 已新增消息筛选切换，当前支持：
  - `全部`
  - `未读`
  - `已读`
- 每个筛选项都会显示对应数量，并根据当前筛选结果展示不同空状态文案。
- 保留原有“点开消息自动标记已读”“全部已读”“按业务类型跳转详情页”的逻辑。
- 这轮同时整理了消息中心页面和 `romantic-app/services/notifications.js` 中的提示文案，避免继续受旧乱码文案影响。

### 验证情况

- 已执行页面源码巡检脚本：
  - `powershell -ExecutionPolicy Bypass -File D:\JavaProject\romantic-suite\romantic-app\tools\check-pages-source.ps1`
- 巡检结果：
  - `OK: no suspicious page-source findings under D:\JavaProject\romantic-suite\romantic-app\pages`
## 2026-03-25 账号设置页排版修复记录
### 关键结果

- `romantic-app/pages/account/settings.vue` 已调整账号设置页卡片布局，重点解决右侧预览摘要块与正文在窄屏下互相挤压的问题。
- 当前卡片改为更稳的自适应结构：
  - 宽屏下保持主内容在左、摘要预览在右
  - 窄屏下摘要预览自动下移，不再与标题、摘要和箭头重叠
- 同时整理了账号设置页当前正式文案，避免旧的损坏文案继续影响显示。

### 验证情况

- 已执行页面源码巡检脚本：
  - `powershell -ExecutionPolicy Bypass -File D:\JavaProject\romantic-suite\romantic-app\tools\check-pages-source.ps1`
- 巡检结果：
  - `OK: no suspicious page-source findings under D:\JavaProject\romantic-suite\romantic-app\pages`
## 2026-03-25 甜蜜相册返回按钮重影修复记录
### 关键结果

- `romantic-app/pages/modules/album/detail.vue`
- `romantic-app/pages/modules/album/edit.vue`
- 已移除甜蜜相册详情页和编辑页额外叠加的悬浮返回按钮，保留 `AccountHeader` 统一返回入口。
- 这次问题根因不是单纯阴影，而是页面顶部同时存在两套返回交互，导致小程序里出现重影观感。

### 验证情况

- 已执行页面源码巡检脚本：
  - `powershell -ExecutionPolicy Bypass -File D:\JavaProject\romantic-suite\romantic-app\tools\check-pages-source.ps1`
- 巡检结果：
  - `OK: no suspicious page-source findings under D:\JavaProject\romantic-suite\romantic-app\pages`
## 2026-03-25 当日整理与保存记录
### 今日完成

- 消息中心已支持 `全部 / 未读 / 已读` 三档筛选查看，并显示各自数量。
- 账号设置页已修复窄屏下右侧预览摘要块与正文互相挤压的问题，当前改为更稳的自适应布局。
- 甜蜜相册详情页与编辑页已移除重复叠加的悬浮返回按钮，只保留 `AccountHeader` 统一返回入口。
- 甜蜜相册返回按钮“重影”问题已确认根因是双返回入口叠加，不是单纯阴影样式问题。
- `area-picker.vue` 的编译错误已修复，根因是脚本内部损坏注释吞掉了闭合结构。
- 今日还对 `pages` 目录做了多轮源码巡检，当前没有再发现同类坏标签、断裂属性或可疑页面源码问题。

### 当前状态

- 主页面与模块内部页的视觉语言仍存在一定割裂，这一点已经确认，但今天未继续统一重构。
- 当前更适合先保持功能稳定，后续如果继续优化，建议按“账号设置 -> 消息中心 -> 甜蜜相册 -> 恋爱改进簿”的顺序统一内部页视觉基座。

### 保存说明

- 今日涉及的页面、文案、排版和编译修复内容已同步补充到 `WORKSPACE_NOTES.md`。
- 后续继续开发前，仍需先阅读本文档，再决定是在现有页面上增量调整，还是统一推进模块内部页风格重构。
## 2026-03-25 模块内部 UI 改造顺序与提交流程约束
### 关键结果

- 模块内部页 UI 改造后续统一按以下顺序推进：
  1. 账号设置
  2. 消息中心
  3. 甜蜜相册
  4. 恋爱改进簿
- 当前改造思路不是为每个模块单独重画一套风格，而是先统一内部页视觉基座，再按模块逐步收口细节，减少首页与模块内部页之间的视觉割裂。
- 新增长期协作约束：
  - 在没有用户明确要求提交 Git 的情况下，不允许主动执行提交。
  - 后续默认只进行源码改造、验证和文档同步，不擅自创建提交记录。
## 2026-03-25 账号设置模块 UI 基座收口记录
### 目标

- 先从账号设置模块开始统一内部页视觉基座，缩小首页/登录页与模块内部页之间的风格割裂。
- 不为每张内页单独重画风格，而是先抽出可复用的导视卡、内容间距和底部操作区，再让资料、关系、安全、数据、头像等页面接入。
- 顺手修正与当前资料语义不一致的旧文案，避免继续使用“昵称”这类历史口径。

### 处理顺序

1. 重新阅读账号设置首页和资料、关系、安全、数据、头像等内页结构，确认当前公共样式与组件复用点。
2. 在账号模块内新增可复用的页面导视卡组件，并补充统一的内容堆叠、说明卡、操作栏样式。
3. 将资料页、关系页、安全页、数据页、头像页接入新的内部页基座。
4. 微调账号设置首页分组描述，让设置首页和内页说明口径更一致。
5. 执行页面源码巡检，确认本轮没有再次引入真实乱码、断裂字符串或可疑模板损坏。

### 关键问题

- 账号设置首页已经有相对完整的卡片层级，但资料页、关系页、安全页、数据页等内部页仍偏向“纯功能表单页”，和首页、登录页的正式版气质不完全一致。
- 资料页中仍残留“昵称”这类旧口径，而 `nickname` 在当前项目语义里已经重新定义为“自己的真实姓名”。
- 如果直接逐页重写样式，很容易让后续消息中心、甜蜜相册、恋爱改进簿继续各自长成不同风格，因此需要先统一内部页基座。

### 关键结果

- 账号模块已新增可复用导视卡组件：
  - `romantic-app/pages/account/components/AccountIntroCard.vue`
- 公共样式已补充账号模块内部页基座能力：
  - `romantic-app/styles/common.scss`
  - 当前已新增统一的：
    - `app-account-stack`
    - `app-account-intro-card`
    - `app-account-intro-*`
    - `app-account-action-bar`
    - `app-account-action-note`
- 以下页面已接入新的内部页基座，并补充正式说明文案：
  - `romantic-app/pages/account/profile.vue`
  - `romantic-app/pages/account/relationship.vue`
  - `romantic-app/pages/account/security.vue`
  - `romantic-app/pages/account/data.vue`
  - `romantic-app/pages/account/avatar.vue`
- 资料页当前已将主要口径从“昵称”调整为“真实姓名”，与当前项目中的资料语义保持一致。
- 账号设置首页已补充分组描述：
  - `romantic-app/pages/account/settings.vue`
  - 当前“资料与外观 / 关系与安全 / 数据管理”三组的导语已更明确，方便后续继续作为内部页风格基座向消息中心、甜蜜相册和恋爱改进簿扩展。

### 验证情况

- 已执行页面源码巡检脚本：
  - `powershell -ExecutionPolicy Bypass -File D:\JavaProject\romantic-suite\romantic-app\tools\check-pages-source.ps1`
- 巡检结果：
  - `OK: no suspicious page-source findings under D:\JavaProject\romantic-suite\romantic-app\pages`
- 本轮尚未额外执行 uni-app / 小程序端编译或真机验证，后续应重点检查：
  - 账号设置首页到资料、关系、安全、数据、头像页的实际跳转与观感
  - 资料页“真实姓名”口径是否与当前接口和页面摘要展示完全一致
  - 新增导视卡与底部操作区在小屏设备上的留白和高度表现
## 2026-03-25 关系信息页地点按钮布局修正记录
### 关键问题

- `romantic-app/pages/account/relationship.vue` 中“重新选择地点 / 使用当前位置”两个地点操作按钮在当前样式下过宽，容易整行铺满，并在小屏浏览器或小程序预览时出现互相压住的观感。

### 关键结果

- 已将关系信息页地点操作区改为更轻的自适应横向布局：
  - `romantic-app/pages/account/relationship.vue`
- 当前按钮表现已调整为：
  - 默认按内容宽度显示，不再整行拉满
  - 保持中等长度与更自然的左右留白
  - 小屏下允许两按钮自适应分列，避免继续重叠

### 验证情况

- 已再次执行页面源码巡检脚本：
  - `powershell -ExecutionPolicy Bypass -File D:\JavaProject\romantic-suite\romantic-app\tools\check-pages-source.ps1`
- 巡检结果：
  - `OK: no suspicious page-source findings under D:\JavaProject\romantic-suite\romantic-app\pages`
## 2026-03-25 消息中心 UI 基座收口记录
### 目标

- 按模块内部页改造顺序，继续收口消息中心页面，让它从“系统列表页”更靠近“陪伴感动态流”。
- 保持现有通知链路、筛选、已读逻辑和跳转逻辑不变，重点调整页面层级、摘要区、筛选区、消息卡和空状态。

### 处理顺序

1. 重新梳理消息中心页面、通知服务和全局未读状态工具，确认当前数据结构和交互约束。
2. 将账号模块已形成的内部页基座思路迁移到消息中心，补上导视卡与概览摘要区。
3. 重做筛选条、全部已读入口和消息卡层级，让消息列表不再像后台系统通知表。
4. 保留现有 `全部 / 未读 / 已读` 三档筛选、点开自动标记已读、全部已读和按业务类型跳转详情页逻辑。
5. 执行页面源码巡检，确认本轮改造没有引入新的模板或编码问题。

### 关键问题

- 原消息中心页面虽然功能完整，但整体仍偏向“工具型通知列表”，和首页、登录页、账号设置模块新基座的气质不完全一致。
- “未读数量、筛选、全部已读、消息卡、空状态”原先都挤在一个层级上，缺少更柔和的视觉主次。
- 通知类型虽然已经有后端常量和业务类型划分，但页面中没有更自然的类型提示，所有提醒卡的观感比较接近。

### 关键结果

- 消息中心页面已接入内部页基座：
  - `romantic-app/pages/modules/notifications/index.vue`
- 当前页面已新增顶部导视区：
  - 使用 `AccountIntroCard` 承接“提醒流”概念、未读数标签和最近更新时间摘要。
- 当前页面已新增双摘要概览卡：
  - `未读提醒`
  - `提醒总数`
- 筛选条与“全部已读”入口已重新整理为更轻的工具区：
  - 保留 `全部 / 未读 / 已读` 三档筛选
  - 保留计数展示
  - “全部已读”在无未读时仅弱化显示，不改变原有点击逻辑兜底
- 消息卡样式已重做为更接近动态流的结构：
  - 增加业务类型轻标签
  - 标题、正文、时间、操作人、已读状态的层级更清晰
  - 未读提醒会在背景和标签上做更轻的强调
  - 保留点击进入详情页的箭头引导
- 空状态也已改为更统一的正式版结构，按当前筛选项展示对应空状态文案。
- 在继续缩减顶部信息密度后，已取消提醒列表上方的重复摘要条：
  - 当前消息中心不再单独展示 `未读 / 总数 / 最近动态` 的第二层摘要
  - 页面顶部只保留导视卡，下面直接进入筛选区与消息列表，避免重复占用纵向空间

### 验证情况

- 已执行页面源码巡检脚本：
  - `powershell -ExecutionPolicy Bypass -File D:\JavaProject\romantic-suite\romantic-app\tools\check-pages-source.ps1`
- 巡检结果：
  - `OK: no suspicious page-source findings under D:\JavaProject\romantic-suite\romantic-app\pages`
- 本轮未额外执行 uni-app / 小程序真机或编译验证，后续建议重点检查：
  - 消息中心筛选条在小屏下的换行和留白
  - 未读提醒卡与已读提醒卡在真实端上的区分度
  - “全部已读”与实时通知刷新同时发生时的页面观感
## 2026-03-25 Git 忽略规则与索引清理记录
### 目标

- 收口工作区 Git 忽略规则，避免前端构建产物、后端编译目录、IDE 本地配置和打包敏感文件继续进入版本库。
- 将已经被 Git 跟踪、但本应忽略的目录和文件从索引中移除，同时保留本地文件不删除。

### 关键问题

- 仓库根目录原先没有统一的 `.gitignore`，导致前后端子项目的忽略规则无法在工作区层面统一约束。
- 前端 `romantic-app` 缺少对 `unpackage`、`node_modules`、`.hbuilderx` 等本地产物目录的忽略配置。
- 后端 `romantic-server/.gitignore` 只忽略了部分 `.idea` 文件，没有直接忽略整个 `.idea/` 目录，导致 `vcs.xml`、`misc.xml` 等本地 IDE 配置被带入 Git。
- 当前仓库中已经存在被跟踪的非源码内容，包括：
  - `romantic-app/unpackage/**`
  - `romantic-server/.idea/**`
  - 打包产物中的 `.apk`
  - 本地签名文件 `.keystore`

### 关键结果

- 已新增工作区根级 `.gitignore`：
  - `D:/JavaProject/romantic-suite/.gitignore`
- 根级忽略规则当前已统一覆盖：
  - 前端 `romantic-app/unpackage/`
  - 前端 `romantic-app/node_modules/`
  - 前端 `romantic-app/.hbuilderx/`
  - 后端 `romantic-server/target/`
  - 后端 `romantic-server/.idea/`
  - 通用 IDE 配置 `.idea/`、`.vscode/`、`*.iml`
  - 打包敏感文件 `*.apk`、`*.keystore`
- 已补充后端子项目忽略规则：
  - `romantic-server/.gitignore`
  - 当前已显式忽略整个 `.idea/` 目录，避免后续继续漏进新的 IntelliJ 本地配置。
- 已明确后续 Git 管理约束：
  - 构建产物、编译缓存、IDE 本地配置、签名文件、安装包等内容不作为版本库源码提交对象。
  - 如果某类本地产物已被 Git 跟踪，仅补 `.gitignore` 不够，还必须同步执行一次 `git rm --cached` 取消索引跟踪。

### 验证情况

- 已确认工作区此前确实存在大量被跟踪的非源码内容，重点集中在 `romantic-app/unpackage/**` 与 `romantic-server/.idea/**`。
- 本轮完成忽略规则补齐后，还需同步执行 Git 索引清理并提交一次专门的收口提交，确保后续 `git status` 不再被这些产物污染。
## 2026-03-25 当日整理与保存记录（补充）
### 今日补充完成

- 账号设置模块已完成第一轮内部页基座收口：
  - 新增 `AccountIntroCard` 作为可复用导视卡组件
  - 统一了账号模块内部页的内容堆叠、说明卡、底部操作区和正式文案口径
  - 已覆盖资料页、关系页、安全页、数据页、头像页以及设置首页分组说明
- 关系信息页的“重新选择地点 / 使用当前位置”按钮已修正为更自然的中等宽度自适应布局，不再整行拉满，也避免小屏下互相压住。
- 消息中心已完成第一轮内部页风格收口：
  - 页面接入内部页基座与顶部导视卡
  - 筛选区、全部已读入口、消息卡层级和空状态已统一到更正式的产品表达
  - 已取消提醒列表上方重复的二次摘要条，避免和导视卡重复占用空间

### 当前状态

- 今日完成的是前端源码级改造与文档同步，尚未额外执行 uni-app / 小程序真机或编译验证。
- 模块内部 UI 改造当前已完成前两项：
  1. 账号设置
  2. 消息中心
- 后续如果继续推进，下一顺位为：
  3. 甜蜜相册
  4. 恋爱改进簿

### 保存说明

- 今日后半段涉及的账号设置模块、关系信息页局部修正、消息中心改造和 Git 约束补充，均已同步写入 `WORKSPACE_NOTES.md`。
- 这次用户已明确要求提交代码，因此本轮会在文档同步完成后执行一次中文提交；后续仍继续遵守“没有明确要求时不主动提交 Git”的协作约束。
