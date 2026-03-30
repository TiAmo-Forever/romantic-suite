package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel("今日小计媒体请求")
public class DailySummaryEntryMediaRequest {

    @ApiModelProperty("媒体类型")
    private String mediaType;

    @ApiModelProperty("文件路径")
    private String fileUrl;

    @ApiModelProperty("缩略图路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序值")
    private Integer sortOrder;
}
