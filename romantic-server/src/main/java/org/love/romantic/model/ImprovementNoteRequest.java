package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Data
@ApiModel("恋爱改进簿保存请求")
public class ImprovementNoteRequest {

    @ApiModelProperty("事情标题")
    @NotBlank(message = "请先填写事情标题")
    private String title;

    @ApiModelProperty("详细说明")
    private String description;

    @ApiModelProperty("针对对象：me、lover、both")
    private String targetType;

    @ApiModelProperty("当前状态：resolved、improving、pending")
    private String status;

    @ApiModelProperty("开始日期，格式 yyyy-MM-dd")
    @NotBlank(message = "请选择开始日期")
    private String startDate;

    @ApiModelProperty("最近反馈摘要")
    private String latestFeedback;

    @ApiModelProperty("主记录媒体列表")
    private List<ImprovementMediaRequest> mediaList = new ArrayList<>();
}
