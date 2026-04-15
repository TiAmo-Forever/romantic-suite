package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
@ApiModel("浪漫计划条目保存请求")
public class RomanticPlanItemRequest {

    @ApiModelProperty("条目标题")
    @NotBlank(message = "请先填写计划条目标题")
    private String title;

    @ApiModelProperty("条目内容")
    private String content;

    @ApiModelProperty("安排时间，格式 yyyy-MM-dd HH:mm:ss")
    private String scheduledAt;

    @ApiModelProperty("结束时间，格式 yyyy-MM-dd HH:mm:ss")
    private String endAt;

    @ApiModelProperty("地点说明")
    private String location;

    @ApiModelProperty("排序值")
    private Integer sortOrder;

    @ApiModelProperty("是否完成")
    private Boolean completed;
}
