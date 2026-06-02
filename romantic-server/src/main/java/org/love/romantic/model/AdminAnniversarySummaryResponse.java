package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 管理员可见的纪念日摘要。
 */
@Data
@Builder
@ApiModel("管理员纪念日摘要响应")
public class AdminAnniversarySummaryResponse {

    @ApiModelProperty("纪念日 ID")
    private Long id;

    @ApiModelProperty("纪念日标题")
    private String title;

    @ApiModelProperty("纪念日日期")
    private String eventDate;

    @ApiModelProperty("是否置顶")
    private boolean pinned;

    @ApiModelProperty("与今天的天数偏移")
    private long dayOffset;
}
