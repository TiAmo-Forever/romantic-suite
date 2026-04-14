package org.love.romantic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 纪念日事件实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("anniversary_event")
@ApiModel("纪念日实体")
public class AnniversaryEvent {

    @ApiModelProperty("主键 ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @ApiModelProperty("创建人账号")
    private String username;

    @ApiModelProperty("纪念日标题")
    private String title;

    @ApiModelProperty("纪念日类型")
    private String type;

    @ApiModelProperty("纪念日日期")
    private LocalDate eventDate;

    @ApiModelProperty("纪念日说明")
    private String description;

    @ApiModelProperty("纪念日地点")
    private String location;

    @ApiModelProperty("封面相对路径")
    private String coverUrl;

    @TableField("is_pinned")
    @ApiModelProperty("是否置顶到首页")
    private Boolean pinned;

    @ApiModelProperty("点赞次数")
    private Long likeCount;

    @ApiModelProperty("提醒方式")
    private String reminderType;

    @ApiModelProperty("最近提醒日期")
    private LocalDate lastRemindedOn;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
