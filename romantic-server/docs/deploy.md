# 后端部署说明

## 1. 前端请求地址

前端请求地址配置文件：
- `romantic-app/utils/app-config.js`

当前已经配置为双环境：
- 开发环境：`http://127.0.0.1:8081`
- 生产环境：`https://romantic.allmyreasons.love`

默认规则：
- 本地开发时自动使用 `development`
- 生产打包时自动使用 `production`

如需手动强制切换环境，可修改：
- `const MANUAL_ENV = ''`

可选值：
- `development`
- `production`

建议：
- 本地联调用默认自动判断即可
- 如果要临时强制用生产接口调试，再手动填写 `MANUAL_ENV`

## 2. 后端环境配置

后端配置文件已经拆分为：
- `application.yml`
- `application-dev.yml`
- `application-prod.yml`

说明：
- `application.yml` 放公共配置
- `application-dev.yml` 放本地开发配置
- `application-prod.yml` 放生产配置

当前环境差异：

开发环境：
- 数据库地址：`localhost:3306/romantic_suite`
- 用户名：`root`
- 密码：`123456`
- `knife4j`：开启
- SQL 日志：开启 DEBUG
- 上传目录：`./storage`

生产环境：
- 数据库地址支持环境变量：
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
  - `DB_USERNAME`
  - `DB_PASSWORD`
- `knife4j`：关闭
- SQL 日志：INFO
- 上传目录：`/opt/file/romantic`

## 3. Maven 打包

当前 Maven 已支持开发和生产环境打包：
- 开发打包：

```bash
mvn clean package -Pdev
```

- 生产打包：

```bash
mvn clean package -Pprod
```

打包后的 jar 名称已固定为：

```bash
target/romantic-server.jar
```

不会再带 `1.0.0-SNAPSHOT`。

## 4. 运行方式

开发环境运行：

```bash
java -jar romantic-server.jar --spring.profiles.active=dev
```

生产环境运行：

```bash
java -jar romantic-server.jar --spring.profiles.active=prod
```

如果使用 `-Pprod` 打包，`application.yml` 里默认也会写入 `prod`，但仍然建议在服务器启动命令里显式指定，方便排查。

生产环境推荐启动方式：

```bash
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_NAME=romantic_suite
export DB_USERNAME=root
export DB_PASSWORD=123456
java -jar romantic-server.jar --spring.profiles.active=prod
```

## 5. 上传目录

生产环境上传目录已配置为：

```bash
/opt/file/romantic
```

实际文件会落在：
- `/opt/file/romantic/avatars`
- `/opt/file/romantic/anniversaries`

是否会自动创建：
- 会自动创建

原因：
- 上传接口里调用了 `Files.createDirectories(...)`
- 如果目录不存在，会递归创建目录

注意：
- 前提是运行 jar 的 Linux 用户对 `/opt/file` 有写权限
- 如果没有权限，上传时会失败

建议首次部署时手动执行一次：

```bash
mkdir -p /opt/file/romantic
chown -R www:www /opt/file/romantic
```

其中 `www:www` 请替换为你实际运行 Java 服务的用户和用户组。

## 6. Nginx 配置示例

域名：
- `romantic.allmyreasons.love`

证书目录：
- `/opt/cert/`

下面示例假设证书文件为：
- `/opt/cert/fullchain.pem`
- `/opt/cert/privkey.pem`

如果你的实际文件名不同，请替换。

```nginx
server {
    listen 80;
    server_name romantic.allmyreasons.love;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name romantic.allmyreasons.love;

    ssl_certificate /opt/cert/fullchain.pem;
    ssl_certificate_key /opt/cert/privkey.pem;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 500m;

    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /opt/file/romantic/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

## 7. 部署建议顺序

推荐部署流程：

1. 准备数据库和账号密码
2. 准备 `/opt/file/romantic` 目录权限
3. 执行 `mvn clean package -Pprod`
4. 上传 `target/romantic-server.jar` 到服务器
5. 配置环境变量 `DB_HOST / DB_PORT / DB_NAME / DB_USERNAME / DB_PASSWORD`
6. 启动 jar：

```bash
java -jar romantic-server.jar --spring.profiles.active=prod
```

7. 配置并重载 Nginx
8. 前端生产环境接口地址指向：

```bash
https://romantic.allmyreasons.love
```
