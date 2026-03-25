package org.love.romantic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 站内通知实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("user_notification")
@ApiModel("站内通知实体")
public class UserNotification {

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("主键ID")
    private Long id;

    @ApiModelProperty("接收人账号")
    private String recipientUsername;

    @ApiModelProperty("触发人账号")
    private String actorUsername;

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

    @ApiModelProperty("扩展负载JSON")
    private String payloadJson;

    @ApiModelProperty("是否已读")
    private Boolean isRead;

    @ApiModelProperty("已读时间")
    private LocalDateTime readAt;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;
}
