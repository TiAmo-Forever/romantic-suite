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
@ApiModel("通用点赞切换响应")
public class InteractionLikeToggleResponse {

    @ApiModelProperty("当前点赞总数")
    private long likeCount;

    @ApiModelProperty("当前账号是否已点赞")
    private boolean liked;
}
