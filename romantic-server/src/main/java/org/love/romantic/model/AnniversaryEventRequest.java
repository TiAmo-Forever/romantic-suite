package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/**
 * 纪念日新增或更新请求。
 */
@Data
@ApiModel("纪念日保存请求")
public class AnniversaryEventRequest {

    @ApiModelProperty("纪念日标题")
    @NotBlank(message = "纪念日标题不能为空")
    private String title;

    @ApiModelProperty("纪念日类型")
    private String type;

    @ApiModelProperty("纪念日日期，格式：yyyy-MM-dd")
    @NotBlank(message = "纪念日日期不能为空")
    private String eventDate;

    @ApiModelProperty("纪念日说明")
    private String description;

    @ApiModelProperty("纪念日地点")
    private String location;

    @ApiModelProperty("提醒方式")
    private String reminderType;

    @ApiModelProperty("媒体列表")
    private List<AnniversaryMediaRequest> mediaList = new ArrayList<>();
}
