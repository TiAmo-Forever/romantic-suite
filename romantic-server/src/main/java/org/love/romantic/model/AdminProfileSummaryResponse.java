package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 管理员可见的资料摘要。
 */
@Data
@Builder
@ApiModel("管理员资料摘要响应")
public class AdminProfileSummaryResponse {

    @ApiModelProperty("账号")
    private String username;

    @ApiModelProperty("展示昵称")
    private String nickname;

    @ApiModelProperty("所在城市")
    private String city;
}
