package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 共享见面倒计时保存请求。
 */
@Data
@ApiModel("共享见面倒计时保存请求")
public class CountdownPlanRequest {

    @ApiModelProperty("对方称呼")
    @NotBlank(message = "称呼不能为空")
    private String loverName;

    @ApiModelProperty("见面地点")
    @NotBlank(message = "见面地点不能为空")
    private String place;

    @ApiModelProperty("备注说明")
    private String note;

    @ApiModelProperty("下次见面时间，格式：yyyy-MM-dd 或 yyyy-MM-dd HH:mm")
    @NotBlank(message = "下次见面时间不能为空")
    private String nextMeetingAt;

    @ApiModelProperty("上次见面日期，格式：yyyy-MM-dd")
    @NotBlank(message = "上次见面日期不能为空")
    private String lastMeetingAt;

    @ApiModelProperty("是否全天")
    private Boolean isAllDay;
}
