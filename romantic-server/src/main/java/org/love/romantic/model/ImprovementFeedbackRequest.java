package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Data
@ApiModel("恋爱改进簿反馈请求")
public class ImprovementFeedbackRequest {

    @ApiModelProperty("当前状态：resolved、improving、pending")
    @NotBlank(message = "请选择当前状态")
    private String status;

    @ApiModelProperty("反馈内容")
    @NotBlank(message = "请填写反馈内容")
    private String content;

    @ApiModelProperty("反馈媒体列表")
    private List<ImprovementMediaRequest> mediaList = new ArrayList<>();
}
