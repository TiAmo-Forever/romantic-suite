package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@ApiModel("情侣点菜菜品分页响应")
public class MealDishPageResponse {

    @ApiModelProperty("当前页码")
    private Long pageNo;

    @ApiModelProperty("每页条数")
    private Long pageSize;

    @ApiModelProperty("总条数")
    private Long total;

    @ApiModelProperty("是否还有更多")
    private Boolean hasMore;

    @ApiModelProperty("当前页菜品列表")
    private List<MealDishResponse> list;
}
