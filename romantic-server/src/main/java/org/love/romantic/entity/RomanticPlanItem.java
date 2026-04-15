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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("romantic_plan_item")
@ApiModel("浪漫计划条目实体")
public class RomanticPlanItem {

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("所属计划 ID")
    private Long planId;

    @ApiModelProperty("条目标题")
    private String title;

    @ApiModelProperty("条目内容")
    private String content;

    @ApiModelProperty("安排时间")
    private LocalDateTime scheduledAt;

    @ApiModelProperty("结束时间")
    private LocalDateTime endAt;

    @ApiModelProperty("地点说明")
    private String location;

    @ApiModelProperty("排序值")
    private Integer sortOrder;

    @ApiModelProperty("是否完成")
    private Boolean completed;

    @ApiModelProperty("完成时间")
    private LocalDateTime completedAt;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
