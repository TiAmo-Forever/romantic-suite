package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.UserNotificationPageResponse;
import org.love.romantic.model.UserNotificationResponse;
import org.love.romantic.model.UserNotificationUnreadResponse;
import org.love.romantic.service.UserNotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Api(tags = "消息中心")
@RestController
@RequestMapping("/api/notifications")
public class UserNotificationController {

    private final UserNotificationService userNotificationService;

    public UserNotificationController(UserNotificationService userNotificationService) {
        this.userNotificationService = userNotificationService;
    }

    @ApiOperation("查询当前账号的站内通知列表")
    @GetMapping
    public ApiResponse<List<UserNotificationResponse>> listMine() {
        return ApiResponse.ok("查询成功", userNotificationService.listCurrentUserNotifications());
    }

    @ApiOperation("分页查询当前账号的站内通知")
    @GetMapping("/page")
    public ApiResponse<UserNotificationPageResponse> pageMine(
            @ApiParam("筛选类型：all / unread / read")
            @RequestParam(value = "filter", defaultValue = "all") String filter,
            @ApiParam("页码，从 1 开始")
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @ApiParam("每页条数")
            @RequestParam(value = "pageSize", defaultValue = "10") Long pageSize) {
        return ApiResponse.ok("查询成功", userNotificationService.pageCurrentUserNotifications(filter, page, pageSize));
    }

    @ApiOperation("查询当前账号的通知数量统计")
    @GetMapping("/unread-count")
    public ApiResponse<UserNotificationUnreadResponse> unreadCount() {
        long unreadCount = userNotificationService.countCurrentUserUnreadNotifications();
        long totalCount = userNotificationService.countCurrentUserTotalNotifications();
        long readCount = Math.max(0L, totalCount - unreadCount);
        return ApiResponse.ok("查询成功", UserNotificationUnreadResponse.builder()
                .unreadCount(unreadCount)
                .readCount(readCount)
                .totalCount(totalCount)
                .build());
    }

    @ApiOperation("标记单条通知已读")
    @PutMapping("/{id}/read")
    public ApiResponse<Void> markRead(@ApiParam("通知 ID") @PathVariable Long id) {
        userNotificationService.markCurrentUserNotificationRead(id);
        return ApiResponse.ok("已读成功", null);
    }

    @ApiOperation("标记全部通知已读")
    @PutMapping("/read-all")
    public ApiResponse<Void> markAllRead() {
        userNotificationService.markAllCurrentUserNotificationsRead();
        return ApiResponse.ok("已全部标记已读", null);
    }
}
