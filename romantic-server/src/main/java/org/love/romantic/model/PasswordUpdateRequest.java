package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 密码修改请求体。
 */
@Data
@ApiModel("密码修改请求")
public class PasswordUpdateRequest {

    @NotBlank(message = "新密码不能为空")
    @Size(min = 4, message = "新密码至少 4 位")
    @ApiModelProperty(value = "新密码", example = "123456")
    private String password;
}
