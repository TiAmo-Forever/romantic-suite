package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ApiModel("浪漫计划反馈响应")
public class RomanticPlanFeedbackResponse {

    @ApiModelProperty("反馈 ID")
    private Long id;

    @ApiModelProperty("关联条目 ID")
    private Long planItemId;

    @ApiModelProperty("反馈日期")
    private String feedbackDate;

    @ApiModelProperty("反馈状态")
    private String status;

    @ApiModelProperty("反馈内容")
    private String content;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("创建昵称")
    private String creatorNickname;

    @ApiModelProperty("创建时间")
    private String createdAt;
}
