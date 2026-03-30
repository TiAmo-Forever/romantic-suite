package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ApiModel("今日小计媒体响应")
public class DailySummaryEntryMediaResponse {

    @ApiModelProperty("媒体 ID")
    private Long id;

    @ApiModelProperty("媒体类型")
    private String mediaType;

    @ApiModelProperty("文件路径")
    private String fileUrl;

    @ApiModelProperty("缩略图路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序值")
    private Integer sortOrder;
}
