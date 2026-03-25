package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel("恋爱改进簿详情响应")
public class ImprovementNoteResponse {

    @ApiModelProperty("记录 ID")
    private Long id;

    @ApiModelProperty("事情标题")
    private String title;

    @ApiModelProperty("详细说明")
    private String description;

    @ApiModelProperty("针对对象")
    private String targetType;

    @ApiModelProperty("当前状态")
    private String status;

    @ApiModelProperty("状态表情")
    private String statusEmoji;

    @ApiModelProperty("开始日期")
    private String startDate;

    @ApiModelProperty("最近反馈摘要")
    private String latestFeedback;

    @ApiModelProperty("创建人账号")
    private String creatorUsername;

    @ApiModelProperty("创建人昵称")
    private String creatorNickname;

    @ApiModelProperty("创建时间")
    private String createdAt;

    @ApiModelProperty("更新时间")
    private String updatedAt;

    @ApiModelProperty("反馈次数")
    private Integer feedbackCount;

    @ApiModelProperty("今日反馈次数")
    private Integer todayFeedbackCount;

    @ApiModelProperty("主记录媒体列表")
    private List<ImprovementMediaResponse> mediaList;

    @ApiModelProperty("反馈记录列表")
    private List<ImprovementFeedbackResponse> feedbackList;
}
