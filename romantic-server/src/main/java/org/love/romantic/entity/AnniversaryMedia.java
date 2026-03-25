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
 * 纪念日媒体实体。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("anniversary_media")
@ApiModel("纪念日媒体实体")
public class AnniversaryMedia {

    @ApiModelProperty("主键 ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @ApiModelProperty("所属纪念日 ID")
    private Long eventId;

    @ApiModelProperty("媒体类型：image 或 video")
    private String mediaType;

    @ApiModelProperty("媒体相对路径")
    private String fileUrl;

    @ApiModelProperty("视频封面相对路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序序号")
    private Integer sortOrder;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;
}
