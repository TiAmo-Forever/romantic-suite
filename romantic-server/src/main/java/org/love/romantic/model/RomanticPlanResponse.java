package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@ApiModel("浪漫计划响应")
public class RomanticPlanResponse {

    @ApiModelProperty("计划 ID")
    private Long id;

    @ApiModelProperty("计划标题")
    private String title;

    @ApiModelProperty("计划说明")
    private String description;

    @ApiModelProperty("计划类型")
    private String planType;

    @ApiModelProperty("计划状态")
    private String status;

    @ApiModelProperty("周期摘要")
    private String scheduleSummary;

    @ApiModelProperty("开始时间")
    private String startAt;

    @ApiModelProperty("结束时间")
    private String endAt;

    @ApiModelProperty("间隔天数")
    private Integer intervalDays;

    @ApiModelProperty("地点说明")
    private String location;

    @ApiModelProperty("封面资源")
    private String coverUrl;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("创建昵称")
    private String creatorNickname;

    @ApiModelProperty("最近更新账号")
    private String updaterUsername;

    @ApiModelProperty("最近更新昵称")
    private String updaterNickname;

    @ApiModelProperty("下次执行时间")
    private String nextExecuteAt;

    @ApiModelProperty("下次执行文案")
    private String nextExecuteLabel;

    @ApiModelProperty("条目总数")
    private Integer totalItemCount;

    @ApiModelProperty("已完成条目数")
    private Integer completedItemCount;

    @ApiModelProperty("反馈数量")
    private Integer feedbackCount;

    @ApiModelProperty("点赞数量")
    private Long likeCount;

    @ApiModelProperty("当前账号是否已点赞")
    private Boolean likedByCurrentUser;

    @ApiModelProperty("条目列表")
    private List<RomanticPlanItemResponse> itemList;

    @ApiModelProperty("反馈列表")
    private List<RomanticPlanFeedbackResponse> feedbackList;

    @ApiModelProperty("点赞用户")
    private List<InteractionLikeUserResponse> likeUsers;

    @ApiModelProperty("评论列表")
    private List<InteractionCommentResponse> commentList;
}
