package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@ApiModel("情侣点菜本周精选响应")
public class MealWeeklyResponse {

    @ApiModelProperty("周起始日期")
    private String weekStartDate;

    @ApiModelProperty("精选数量")
    private Integer dishCount;

    @ApiModelProperty("菜品列表")
    private List<MealDishResponse> dishList;
}
