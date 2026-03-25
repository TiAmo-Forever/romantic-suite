package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel("站内通知响应")
public class UserNotificationResponse {

    @ApiModelProperty("通知ID")
    private Long id;

    @ApiModelProperty("通知类型")
    private String type;

    @ApiModelProperty("通知标题")
    private String title;

    @ApiModelProperty("通知内容")
    private String content;

    @ApiModelProperty("关联业务类型")
    private String bizType;

    @ApiModelProperty("关联业务ID")
    private Long bizId;

    @ApiModelProperty("触发人账号")
    private String actorUsername;

    @ApiModelProperty("触发人昵称")
    private String actorNickname;

    @ApiModelProperty("扩展负载JSON")
    private String payloadJson;

    @ApiModelProperty("是否已读")
    private Boolean isRead;

    @ApiModelProperty("创建时间")
    private String createdAt;

    @ApiModelProperty("已读时间")
    private String readAt;
}
