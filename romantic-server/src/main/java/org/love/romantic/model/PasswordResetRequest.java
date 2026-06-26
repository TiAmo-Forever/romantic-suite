package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@ApiModel("密码重置请求")
public class PasswordResetRequest {

    @NotBlank(message = "账号不能为空")
    @ApiModelProperty(value = "登录账号", example = "admin")
    private String username;

    @NotBlank(message = "新密码不能为空")
    @Size(min = 4, message = "新密码至少 4 位")
    @ApiModelProperty(value = "新密码", example = "admin")
    private String password;
}
