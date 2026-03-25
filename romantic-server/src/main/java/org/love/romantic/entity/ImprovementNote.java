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
 * 恋爱改进簿主记录实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("improvement_note")
@ApiModel("恋爱改进簿主记录实体")
public class ImprovementNote {

    @ApiModelProperty("主键 ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @ApiModelProperty("事情标题")
    private String title;

    @ApiModelProperty("详细说明")
    private String description;

    @ApiModelProperty("针对对象")
    private String targetType;

    @ApiModelProperty("当前状态")
    private String status;

    @ApiModelProperty("状态表情")
    private String statusEmoji;

    @ApiModelProperty("开始日期")
    private LocalDate startDate;

    @ApiModelProperty("最近反馈摘要")
    private String latestFeedback;

    @ApiModelProperty("创建人账号")
    private String creatorUsername;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
