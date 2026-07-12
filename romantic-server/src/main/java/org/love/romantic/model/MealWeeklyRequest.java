package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

@Data
@ApiModel("情侣点菜本周精选请求")
public class MealWeeklyRequest {

    @ApiModelProperty("菜品 ID 列表")
    private List<Long> dishIds;
}
