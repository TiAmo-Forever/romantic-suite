package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ApiModel("今日小计历史项响应")
public class DailySummaryHistoryItemResponse {

    @ApiModelProperty("记录 ID")
    private Long id;

    @ApiModelProperty("日期")
    private String summaryDate;

    @ApiModelProperty("预览氛围")
    private String mood;

    @ApiModelProperty("预览内容")
    private String content;

    @ApiModelProperty("条目数量")
    private Integer entryCount;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("创建显示名")
    private String creatorNickname;

    @ApiModelProperty("最近更新账号")
    private String updaterUsername;

    @ApiModelProperty("最近更新显示名")
    private String updaterNickname;

    @ApiModelProperty("用于展示的作者账号")
    private String authorUsername;

    @ApiModelProperty("用于展示的作者显示名")
    private String authorNickname;

    @ApiModelProperty("更新时间")
    private String updatedAt;
}
