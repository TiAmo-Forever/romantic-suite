package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ApiModel("情侣点菜每日菜单条目响应")
public class MealDailyPlanItemResponse {

    @ApiModelProperty("菜单条目 ID")
    private Long itemId;

    @ApiModelProperty("菜品信息")
    private MealDishResponse dish;

    @ApiModelProperty("排序值")
    private Integer sortOrder;
}
