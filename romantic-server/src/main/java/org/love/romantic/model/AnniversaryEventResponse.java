package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeUserResponse;

import java.util.List;

/**
 * 纪念日详情响应。
 */
@Data
@Builder
@ApiModel("纪念日详情响应")
public class AnniversaryEventResponse {

    @ApiModelProperty("纪念日 ID")
    private Long id;

    @ApiModelProperty("纪念日标题")
    private String title;

    @ApiModelProperty("纪念日类型")
    private String type;

    @ApiModelProperty("纪念日日期，格式：yyyy-MM-dd")
    private String eventDate;

    @ApiModelProperty("纪念日说明")
    private String description;

    @ApiModelProperty("纪念日地点")
    private String location;

    @ApiModelProperty("封面相对路径")
    private String coverUrl;

    @ApiModelProperty("点赞次数")
    private long likeCount;

    @ApiModelProperty("当前账号是否已点赞")
    private boolean likedByCurrentUser;

    @ApiModelProperty("提醒方式")
    private String reminderType;

    @ApiModelProperty("时间状态")
    private String timeStatus;

    @ApiModelProperty("与当前日期的天数偏移")
    private long dayOffset;

    /**
     * 创建人账号。
     */
    @ApiModelProperty("创建人账号")
    private String creatorUsername;

    /**
     * 创建人昵称。
     */
    @ApiModelProperty("创建人昵称")
    private String creatorNickname;

    @ApiModelProperty("媒体列表")
    private List<AnniversaryMediaResponse> mediaList;

    @ApiModelProperty("点赞人列表")
    private List<InteractionLikeUserResponse> likeUsers;

    @ApiModelProperty("评论列表")
    private List<InteractionCommentResponse> commentList;
}
