package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel("通用评论响应")
public class InteractionCommentResponse {

    @ApiModelProperty("评论 ID")
    private Long id;

    @ApiModelProperty("评论账号")
    private String commenterUsername;

    @ApiModelProperty("评论昵称")
    private String commenterNickname;

    @ApiModelProperty("评论内容")
    private String content;

    @ApiModelProperty("评论时间")
    private String createdAt;

    @ApiModelProperty("更新时间")
    private String updatedAt;
}
