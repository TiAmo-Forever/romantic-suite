package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@ApiModel("今日小计条目响应")
public class DailySummaryEntryResponse {

    @ApiModelProperty("条目 ID")
    private Long id;

    @ApiModelProperty("条目氛围")
    private String mood;

    @ApiModelProperty("条目内容")
    private String content;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("创建显示名")
    private String creatorNickname;

    @ApiModelProperty("创建时间")
    private String createdAt;

    @ApiModelProperty("更新时间")
    private String updatedAt;

    @ApiModelProperty("点赞总数")
    private Long likeCount;

    @ApiModelProperty("当前账号是否已点赞")
    private Boolean likedByCurrentUser;

    @ApiModelProperty("点赞用户")
    private List<InteractionLikeUserResponse> likeUsers;

    @ApiModelProperty("评论列表")
    private List<InteractionCommentResponse> commentList;

    @ApiModelProperty("媒体列表")
    private List<DailySummaryEntryMediaResponse> mediaList;
}
