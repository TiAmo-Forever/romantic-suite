package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 头像上传响应。
 */
@Data
@AllArgsConstructor
@ApiModel("头像上传响应")
public class AvatarUploadResponse {

    @ApiModelProperty("数据库保存的相对路径")
    private String path;
}
