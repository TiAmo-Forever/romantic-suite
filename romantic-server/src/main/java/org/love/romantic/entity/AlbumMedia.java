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
@TableName("album_media")
@ApiModel("甜蜜相册媒体实体")
public class AlbumMedia {

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("所属回忆 ID")
    private Long memoryId;

    @ApiModelProperty("媒体类型")
    private String mediaType;

    @ApiModelProperty("媒体文件路径")
    private String fileUrl;

    @ApiModelProperty("缩略图路径")
    private String thumbnailUrl;

    @ApiModelProperty("排序值")
    private Integer sortOrder;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;
}
