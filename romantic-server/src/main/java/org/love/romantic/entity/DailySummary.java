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

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 今日小计共享记录实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("daily_summary")
@ApiModel("今日小计实体")
public class DailySummary {

    @ApiModelProperty("主键 ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @ApiModelProperty("对应日期")
    private LocalDate summaryDate;

    @ApiModelProperty("今日氛围")
    private String mood;

    @ApiModelProperty("今日小计内容")
    private String content;

    @ApiModelProperty("首次创建账号")
    private String creatorUsername;

    @ApiModelProperty("最近更新账号")
    private String updatedBy;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
