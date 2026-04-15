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
@TableName("romantic_plan")
@ApiModel("浪漫计划实体")
public class RomanticPlan {

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("计划标题")
    private String title;

    @ApiModelProperty("计划说明")
    private String description;

    @ApiModelProperty("计划类型")
    private String planType;

    @ApiModelProperty("计划状态")
    private String status;

    @ApiModelProperty("开始时间")
    private LocalDateTime startAt;

    @ApiModelProperty("结束时间")
    private LocalDateTime endAt;

    @ApiModelProperty("间隔天数")
    private Integer intervalDays;

    @ApiModelProperty("地点说明")
    private String location;

    @ApiModelProperty("封面资源")
    private String coverUrl;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("最近更新账号")
    private String updatedBy;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
