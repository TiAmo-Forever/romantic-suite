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
@ApiModel("恋爱改进簿媒体响应")
public class ImprovementMediaResponse {

    @ApiModelProperty("媒体 ID")
    private Long id;

    @ApiModelProperty("媒体类型：image 或 video")
    private String mediaType;

    @ApiModelProperty("媒体相对路径")
    private String fileUrl;

    @ApiModelProperty("视频缩略图相对路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序值")
    private Integer sortOrder;
}
