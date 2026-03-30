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
@TableName("daily_summary_entry")
@ApiModel("今日小计条目实体")
public class DailySummaryEntry {

    @ApiModelProperty("主键 ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @ApiModelProperty("所属日期记录 ID")
    private Long summaryId;

    @ApiModelProperty("条目氛围")
    private String mood;

    @ApiModelProperty("条目内容")
    private String content;

    @ApiModelProperty("创建账号")
    private String creatorUsername;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
