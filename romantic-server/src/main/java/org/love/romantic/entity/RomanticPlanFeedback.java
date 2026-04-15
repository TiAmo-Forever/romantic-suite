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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("romantic_plan_feedback")
@ApiModel("浪漫计划反馈实体")
public class RomanticPlanFeedback {

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("所属计划 ID")
    private Long planId;

    @ApiModelProperty("所属条目 ID")
    private Long planItemId;

    @ApiModelProperty("反馈日期")
    private LocalDate feedbackDate;

    @ApiModelProperty("反馈状态")
    private String status;

    @ApiModelProperty("反馈内容")
    private String content;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
