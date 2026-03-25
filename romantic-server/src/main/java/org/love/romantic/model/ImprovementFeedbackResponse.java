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
@ApiModel("恋爱改进簿反馈响应")
public class ImprovementFeedbackResponse {

    @ApiModelProperty("反馈 ID")
    private Long id;

    @ApiModelProperty("当前状态")
    private String status;

    @ApiModelProperty("状态表情")
    private String statusEmoji;

    @ApiModelProperty("反馈内容")
    private String content;

    @ApiModelProperty("反馈人账号")
    private String creatorUsername;

    @ApiModelProperty("反馈人昵称")
    private String creatorNickname;

    @ApiModelProperty("创建时间")
    private String createdAt;

    @ApiModelProperty("反馈媒体列表")
    private List<ImprovementMediaResponse> mediaList;
}
