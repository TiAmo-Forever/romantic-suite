package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 共享见面倒计时返回结果。
 */
@Data
@Builder
@ApiModel("共享见面倒计时响应")
public class CountdownPlanResponse {

    @ApiModelProperty("倒计时计划 ID")
    private Long id;

    @ApiModelProperty("对方称呼")
    private String loverName;

    @ApiModelProperty("见面地点")
    private String place;

    @ApiModelProperty("备注说明")
    private String note;

    @ApiModelProperty("下次见面时间")
    private String nextMeetingAt;

    @ApiModelProperty("上次见面时间")
    private String lastMeetingAt;

    @ApiModelProperty("是否全天")
    private Boolean isAllDay;

    @ApiModelProperty("创建人账号")
    private String creatorUsername;

    @ApiModelProperty("最近更新人账号")
    private String updaterUsername;
}
