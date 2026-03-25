package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel("甜蜜相册媒体保存请求")
public class AlbumMediaRequest {

    @ApiModelProperty("媒体类型：image 或 video")
    private String mediaType;

    @ApiModelProperty("媒体文件路径")
    private String fileUrl;

    @ApiModelProperty("缩略图路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序值")
    private Integer sortOrder;
}
