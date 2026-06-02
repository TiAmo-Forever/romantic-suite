package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 管理员可见的纪念日详情。
 */
@Data
@Builder
@ApiModel("管理员纪念日详情响应")
public class AdminAnniversaryDetailResponse {

    @ApiModelProperty("纪念日 ID")
    private Long id;

    @ApiModelProperty("纪念日标题")
    private String title;

    @ApiModelProperty("纪念日类型")
    private String type;

    @ApiModelProperty("纪念日日期")
    private String eventDate;

    @ApiModelProperty("纪念日说明")
    private String description;

    @ApiModelProperty("纪念日地点")
    private String location;

    @ApiModelProperty("是否置顶")
    private boolean pinned;

    @ApiModelProperty("时间状态")
    private String timeStatus;

    @ApiModelProperty("与今天的天数偏移")
    private long dayOffset;

    @ApiModelProperty("创建人账号")
    private String creatorUsername;

    @ApiModelProperty("创建人昵称")
    private String creatorNickname;
}
