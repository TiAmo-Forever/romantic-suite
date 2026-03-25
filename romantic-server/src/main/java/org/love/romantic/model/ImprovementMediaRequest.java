package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel("恋爱改进簿媒体请求")
public class ImprovementMediaRequest {

    @ApiModelProperty("媒体类型：image 或 video")
    private String mediaType;

    @ApiModelProperty("媒体相对路径")
    private String fileUrl;

    @ApiModelProperty("视频缩略图相对路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序值")
    private Integer sortOrder;
}
