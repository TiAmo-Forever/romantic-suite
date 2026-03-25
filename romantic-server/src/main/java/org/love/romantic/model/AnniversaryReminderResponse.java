package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 纪念日提醒响应。
 */
@Data
@Builder
@ApiModel("纪念日提醒响应")
public class AnniversaryReminderResponse {

    @ApiModelProperty("纪念日 ID")
    private Long id;

    @ApiModelProperty("纪念日标题")
    private String title;

    @ApiModelProperty("纪念日日期，格式：yyyy-MM-dd")
    private String eventDate;

    @ApiModelProperty("提醒方式")
    private String reminderType;

    @ApiModelProperty("提醒描述")
    private String description;
}
