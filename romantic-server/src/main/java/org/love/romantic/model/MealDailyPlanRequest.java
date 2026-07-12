package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.Size;
import java.util.List;

@Data
@ApiModel("情侣点菜每日菜单请求")
public class MealDailyPlanRequest {

    @ApiModelProperty("菜单备注")
    @Size(max = 500, message = "菜单备注不能超过 500 个字符")
    private String remark;

    @ApiModelProperty("菜品 ID 列表")
    private List<Long> dishIds;
}
