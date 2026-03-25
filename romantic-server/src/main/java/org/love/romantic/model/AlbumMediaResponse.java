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
@ApiModel("甜蜜相册媒体响应")
public class AlbumMediaResponse {

    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("媒体类型")
    private String mediaType;

    @ApiModelProperty("媒体文件路径")
    private String fileUrl;

    @ApiModelProperty("缩略图路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序值")
    private Integer sortOrder;
}
