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

/**
 * 恋爱改进簿反馈记录实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("improvement_feedback")
@ApiModel("恋爱改进簿反馈记录实体")
public class ImprovementFeedback {

    @ApiModelProperty("主键 ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @ApiModelProperty("所属主记录 ID")
    private Long noteId;

    @ApiModelProperty("当前状态")
    private String status;

    @ApiModelProperty("状态表情")
    private String statusEmoji;

    @ApiModelProperty("反馈内容")
    private String content;

    @ApiModelProperty("反馈人账号")
    private String creatorUsername;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;
}
