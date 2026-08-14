package org.love.romantic.service;

import java.util.Map;

/**
 * 系统健康检查服务
 */
public interface SystemHealthService {

    /**
     * 生成服务运行健康摘要
     *
     * @return 服务运行健康摘要
     */
    Map<String, Object> serviceHealth();

    /**
     * 生成数据库健康摘要
     *
     * @return 数据库健康摘要
     */
    Map<String, Object> databaseHealth();
}
