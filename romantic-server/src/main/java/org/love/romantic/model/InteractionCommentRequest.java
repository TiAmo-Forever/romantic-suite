package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@ApiModel("通用评论请求")
public class InteractionCommentRequest {

    @NotBlank(message = "评论内容不能为空")
    @Size(max = 200, message = "评论内容最多 200 个字")
    @ApiModelProperty(value = "评论内容", required = true)
    private String content;
}
