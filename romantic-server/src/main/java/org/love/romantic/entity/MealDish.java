package org.love.romantic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("meal_dish")
@ApiModel("情侣点菜菜谱实体")
public class MealDish {

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("菜名")
    private String name;

    @ApiModelProperty("菜品分类：cold、hot、soup、staple")
    private String category;

    @ApiModelProperty("偏好标签：me、partner、both、none")
    private String preference;

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

    @ApiModelProperty("最近更新账号")
    private String updatedBy;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
