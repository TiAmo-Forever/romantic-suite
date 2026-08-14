package org.love.romantic.service;

import org.love.romantic.model.UserNotificationPageResponse;
import org.love.romantic.model.UserNotificationResponse;
import org.love.romantic.model.UserNotificationUnreadResponse;

import java.util.List;
import java.util.Map;

public interface UserNotificationService {

    /**
     * 查询当前用户全部通知
     *
     * @return 当前用户通知列表
     */
    List<UserNotificationResponse> listCurrentUserNotifications();

    /**
     * 分页查询当前用户通知
     *
     * @param filter 已读状态筛选值
     * @param bizType 业务类型筛选值
     * @param pageNo 页码
     * @param pageSize 每页条数
     * @return 当前用户通知分页结果
     */
    UserNotificationPageResponse pageCurrentUserNotifications(String filter, String bizType, long pageNo, long pageSize);

    /**
     * 查询当前用户通知统计
     *
     * @return 当前用户未读和分类统计
     */
    UserNotificationUnreadResponse getCurrentUserNotificationStats();

    /**
     * 标记当前用户指定通知为已读
     *
     * @param id 通知 ID
     */
    void markCurrentUserNotificationRead(Long id);

    /**
     * 标记当前用户全部通知为已读
     */
    void markAllCurrentUserNotificationsRead();

    /**
     * 通知当前账号对应的对方账号
     *
     * @param actorUsername 操作人账号
     * @param type 通知类型
     * @param title 通知标题
     * @param content 通知内容
     * @param bizType 业务类型
     * @param bizId 业务 ID
     * @param payload 通知扩展载荷
     */
    void notifyPartners(String actorUsername,
                        String type,
                        String title,
                        String content,
                        String bizType,
                        Long bizId,
                        Map<String, Object> payload);
}
