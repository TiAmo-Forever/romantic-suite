package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 登录请求体。
 */
@Data
@ApiModel("登录请求")
public class LoginRequest {

    @NotBlank(message = "账号不能为空")
    @ApiModelProperty(value = "登录账号", example = "chenjia")
    private String username;

    @NotBlank(message = "密码不能为空")
    @ApiModelProperty(value = "登录密码", example = "admin")
    private String password;
}
