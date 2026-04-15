package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ApiModel("浪漫计划条目响应")
public class RomanticPlanItemResponse {

    @ApiModelProperty("条目 ID")
    private Long id;

    @ApiModelProperty("条目标题")
    private String title;

    @ApiModelProperty("条目内容")
    private String content;

    @ApiModelProperty("安排时间")
    private String scheduledAt;

    @ApiModelProperty("结束时间")
    private String endAt;

    @ApiModelProperty("地点说明")
    private String location;

    @ApiModelProperty("排序值")
    private Integer sortOrder;

    @ApiModelProperty("是否完成")
    private Boolean completed;

    @ApiModelProperty("完成时间")
    private String completedAt;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("创建昵称")
    private String creatorNickname;
}
