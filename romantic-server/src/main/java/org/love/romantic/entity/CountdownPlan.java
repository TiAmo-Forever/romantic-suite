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
 * 共享见面倒计时计划实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("countdown_plan")
@ApiModel("共享见面倒计时实体")
public class CountdownPlan {

    @ApiModelProperty("主键 ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @ApiModelProperty("对方称呼")
    private String loverName;

    @ApiModelProperty("见面地点")
    private String place;

    @ApiModelProperty("备注说明")
    private String note;

    @ApiModelProperty("下次见面时间")
    private LocalDateTime nextMeetingAt;

    @ApiModelProperty("上次见面时间")
    private LocalDateTime lastMeetingAt;

    @ApiModelProperty("是否全天")
    private Boolean isAllDay;

    @ApiModelProperty("创建人账号")
    private String createdBy;

    @ApiModelProperty("最近更新人账号")
    private String updatedBy;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
