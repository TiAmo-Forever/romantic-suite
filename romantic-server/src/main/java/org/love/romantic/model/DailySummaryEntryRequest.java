package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

@Data
@ApiModel("今日小计条目保存请求")
public class DailySummaryEntryRequest {

    @ApiModelProperty("条目氛围")
    @NotBlank(message = "条目氛围不能为空")
    private String mood;

    @ApiModelProperty("条目内容")
    @NotBlank(message = "条目内容不能为空")
    @Size(max = 300, message = "条目内容不能超过 300 个字符")
    private String content;

    @ApiModelProperty("媒体列表")
    private List<DailySummaryEntryMediaRequest> mediaList;
}
