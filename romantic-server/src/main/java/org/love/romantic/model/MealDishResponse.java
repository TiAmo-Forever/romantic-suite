package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ApiModel("情侣点菜菜品响应")
public class MealDishResponse {

    @ApiModelProperty("菜品 ID")
    private Long id;

    @ApiModelProperty("菜名")
    private String name;

    @ApiModelProperty("菜品分类")
    private String category;

    @ApiModelProperty("菜品分类文案")
    private String categoryLabel;

    @ApiModelProperty("偏好标签")
    private String preference;

    @ApiModelProperty("偏好文案")
    private String preferenceLabel;

    @ApiModelProperty("菜品图片")
    private String coverUrl;

    @ApiModelProperty("一句话记忆")
    private String memory;

    @ApiModelProperty("详情说明")
    private String description;

    @ApiModelProperty("制作方法")
    private String recipe;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("创建人昵称")
    private String creatorNickname;

    @ApiModelProperty("最近更新账号")
    private String updaterUsername;

    @ApiModelProperty("最近更新人昵称")
    private String updaterNickname;

    @ApiModelProperty("今日是否已加入菜单")
    private Boolean addedToday;

    @ApiModelProperty("本周是否已加入精选")
    private Boolean selectedThisWeek;

    @ApiModelProperty("加入每日菜单次数")
    private Long dailyUsedCount;

    @ApiModelProperty("加入本周精选次数")
    private Long weeklySelectedCount;

    @ApiModelProperty("最近加入菜单日期")
    private String lastAddedDate;

    @ApiModelProperty("更新时间")
    private String updatedAt;
}
