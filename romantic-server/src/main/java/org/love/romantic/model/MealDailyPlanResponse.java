package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@ApiModel("情侣点菜每日菜单响应")
public class MealDailyPlanResponse {

    @ApiModelProperty("每日菜单 ID")
    private Long id;

    @ApiModelProperty("菜单日期")
    private String planDate;

    @ApiModelProperty("星期")
    private String weekLabel;

    @ApiModelProperty("菜单备注")
    private String remark;

    @ApiModelProperty("菜品数量")
    private Integer dishCount;

    @ApiModelProperty("菜单条目列表")
    private List<MealDailyPlanItemResponse> itemList;
}
