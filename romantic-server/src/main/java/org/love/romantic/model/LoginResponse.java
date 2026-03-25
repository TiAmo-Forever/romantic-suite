package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 登录成功后的返回体。
 */
@Data
@Builder
@ApiModel("登录响应")
public class LoginResponse {

    @ApiModelProperty("登录 token")
    private String token;

    @ApiModelProperty("登录账号")
    private String username;

    @ApiModelProperty("展示昵称")
    private String nickname;

    @ApiModelProperty("当前账号资料")
    private ProfileResponse profile;
}
