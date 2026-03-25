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
@TableName("improvement_media")
@ApiModel("恋爱改进簿媒体实体")
public class ImprovementMedia {

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("所属改进记录 ID")
    private Long noteId;

    @ApiModelProperty("所属反馈 ID，0 表示主记录媒体")
    private Long feedbackId;

    @ApiModelProperty("媒体类型：image 或 video")
    private String mediaType;

    @ApiModelProperty("媒体相对路径")
    private String fileUrl;

    @ApiModelProperty("视频缩略图相对路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序值")
    private Integer sortOrder;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;
}
