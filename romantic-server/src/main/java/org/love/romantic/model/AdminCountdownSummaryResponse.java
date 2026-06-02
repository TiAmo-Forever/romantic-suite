package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 管理员可见的倒计时摘要。
 */
@Data
@Builder
@ApiModel("管理员倒计时摘要响应")
public class AdminCountdownSummaryResponse {

    @ApiModelProperty("对方称呼")
    private String loverName;

    @ApiModelProperty("见面地点")
    private String place;

    @ApiModelProperty("下次见面时间")
    private String nextMeetingAt;

    @ApiModelProperty("上次见面日期")
    private String lastMeetingAt;

    @ApiModelProperty("是否按全天见面计算")
    private boolean allDay;

    @ApiModelProperty("距离下次见面的天数")
    private long daysUntilNextMeeting;
}
