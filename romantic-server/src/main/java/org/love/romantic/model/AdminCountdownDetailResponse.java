package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 管理员可见的倒计时详情。
 */
@Data
@Builder
@ApiModel("管理员倒计时详情响应")
public class AdminCountdownDetailResponse {

    @ApiModelProperty("对方称呼")
    private String loverName;

    @ApiModelProperty("见面地点")
    private String place;

    @ApiModelProperty("计划说明")
    private String note;

    @ApiModelProperty("下次见面时间")
    private String nextMeetingAt;

    @ApiModelProperty("上次见面日期")
    private String lastMeetingAt;

    @ApiModelProperty("是否按全天见面计算")
    private boolean allDay;

    @ApiModelProperty("距离下次见面的天数")
    private long daysUntilNextMeeting;

    @ApiModelProperty("距离上次见面的天数")
    private long daysSinceLastMeeting;

    @ApiModelProperty("进度百分比")
    private long progressPercent;

    @ApiModelProperty("时间状态")
    private String timeStatus;
}
