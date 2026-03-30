package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 今日小计响应。
 */
@Data
@Builder
@ApiModel("今日小计响应")
public class DailySummaryResponse {

    @ApiModelProperty("记录 ID")
    private Long id;

    @ApiModelProperty("对应日期")
    private String summaryDate;

    @ApiModelProperty("预览氛围")
    private String mood;

    @ApiModelProperty("预览内容")
    private String content;

    @ApiModelProperty("是否已有记录")
    private Boolean hasRecord;

    @ApiModelProperty("条目数量")
    private Integer entryCount;

    @ApiModelProperty("创建人账号")
    private String creatorUsername;

    @ApiModelProperty("最近更新账号")
    private String updaterUsername;

    @ApiModelProperty("最近更新时间")
    private String updatedAt;

    @ApiModelProperty("点赞总数")
    private Long likeCount;

    @ApiModelProperty("当前账号是否已点赞")
    private Boolean likedByCurrentUser;

    @ApiModelProperty("点赞用户")
    private List<InteractionLikeUserResponse> likeUsers;

    @ApiModelProperty("评论列表")
    private List<InteractionCommentResponse> commentList;

    @ApiModelProperty("条目列表")
    private List<DailySummaryEntryResponse> entryList;

    @ApiModelProperty("历史列表")
    private List<DailySummaryHistoryItemResponse> historyList;
}
