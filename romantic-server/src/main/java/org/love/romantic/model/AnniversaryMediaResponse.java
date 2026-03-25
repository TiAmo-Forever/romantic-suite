package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 纪念日媒体响应。
 */
@Data
@Builder
@ApiModel("纪念日媒体响应")
public class AnniversaryMediaResponse {

    @ApiModelProperty("媒体 ID")
    private Long id;

    @ApiModelProperty("媒体类型：image 或 video")
    private String mediaType;

    @ApiModelProperty("媒体相对路径")
    private String fileUrl;

    @ApiModelProperty("视频封面相对路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序序号")
    private Integer sortOrder;
}
