package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.Size;

/**
 * 兼容保留的今日小计请求模型。
 * 当前第二版已由 {@link DailySummaryEntryRequest} 承担实际保存请求。
 */
@Data
@ApiModel("今日小计兼容请求")
public class DailySummaryRequest {

    @ApiModelProperty("兼容字段：条目氛围")
    private String mood;

    @ApiModelProperty("兼容字段：条目内容")
    @Size(max = 1000, message = "条目内容不能超过 1000 个字符")
    private String content;
}
