package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.Size;

@Data
@ApiModel("情侣点菜菜品请求")
public class MealDishRequest {

    @ApiModelProperty("菜名")
    @Size(max = 80, message = "菜名不能超过 80 个字符")
    private String name;

    @ApiModelProperty("菜品分类：cold、hot、soup、staple")
    private String category;

    @ApiModelProperty("偏好标签：me、partner、both、none")
    private String preference;

    @ApiModelProperty("菜品图片")
    @Size(max = 255, message = "图片路径不能超过 255 个字符")
    private String coverUrl;

    @ApiModelProperty("一句话记忆")
    @Size(max = 255, message = "一句话记忆不能超过 255 个字符")
    private String memory;

    @ApiModelProperty("详情说明")
    @Size(max = 1000, message = "详情说明不能超过 1000 个字符")
    private String description;

    @ApiModelProperty("制作方法")
    @Size(max = 2000, message = "制作方法不能超过 2000 个字符")
    private String recipe;
}
