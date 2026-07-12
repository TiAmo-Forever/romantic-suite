package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 今日小计页面视图响应
 */
@Data
@Builder
@ApiModel("今日小计页面视图响应")
public class DailySummaryPageViewResponse {

    @ApiModelProperty("当前账号显示名")
    private String selfDisplayName;

    @ApiModelProperty("对方显示名")
    private String partnerDisplayName;

    @ApiModelProperty("相恋天数")
    private Integer relationshipDays;

    @ApiModelProperty("头部关系文案")
    private String relationshipText;

    @ApiModelProperty("附图总数")
    private Integer mediaCount;

    @ApiModelProperty("页面回应状态")
    private String responseState;

    @ApiModelProperty("回应展示名")
    private String responseDisplayName;

    @ApiModelProperty("回应辅助文案")
    private String responseMetaText;

    @ApiModelProperty("回应正文")
    private String responseContent;

    @ApiModelProperty("回应所在条目 ID")
    private Long responseEntryId;

    @ApiModelProperty("回应关联爱心数")
    private Long responseLikeCount;
}
