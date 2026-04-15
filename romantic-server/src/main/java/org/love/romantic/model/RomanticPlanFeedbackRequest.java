package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
@ApiModel("浪漫计划反馈请求")
public class RomanticPlanFeedbackRequest {

    @ApiModelProperty("关联条目 ID")
    private Long planItemId;

    @ApiModelProperty("反馈日期，格式 yyyy-MM-dd")
    private String feedbackDate;

    @ApiModelProperty("反馈状态：done、partial、missed")
    private String status;

    @ApiModelProperty("反馈内容")
    @NotBlank(message = "请先填写反馈内容")
    private String content;
}
