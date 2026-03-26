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
@ApiModel("通用点赞人信息")
public class InteractionLikeUserResponse {

    @ApiModelProperty("点赞账号")
    private String username;

    @ApiModelProperty("点赞昵称")
    private String nickname;

    @ApiModelProperty("累计点赞次数")
    private long likeTimes;

    @ApiModelProperty("最近一次点赞时间")
    private String lastLikedAt;
}
