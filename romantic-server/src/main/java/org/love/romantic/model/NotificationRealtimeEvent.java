package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ApiModel("站内通知实时事件")
public class NotificationRealtimeEvent {

    @ApiModelProperty("实时事件类型")
    private String eventType;

    @ApiModelProperty("通知编号")
    private Long notificationId;

    @ApiModelProperty("未读数量")
    private long unreadCount;

    @ApiModelProperty("通知标题")
    private String latestTitle;

    @ApiModelProperty("通知内容")
    private String latestContent;

    @ApiModelProperty("通知时间")
    private String latestCreatedAt;

    @ApiModelProperty("业务类型")
    private String bizType;

    @ApiModelProperty("业务编号")
    private Long bizId;
}
