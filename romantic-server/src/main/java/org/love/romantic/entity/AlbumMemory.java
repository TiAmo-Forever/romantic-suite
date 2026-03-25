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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("album_memory")
@ApiModel("甜蜜相册回忆实体")
public class AlbumMemory {

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("创建人账号")
    private String username;

    @ApiModelProperty("回忆标题")
    private String title;

    @ApiModelProperty("回忆日期")
    private LocalDate memoryDate;

    @ApiModelProperty("地点")
    private String location;

    @ApiModelProperty("回忆内容")
    private String summary;

    @ApiModelProperty("标签 JSON")
    private String tagsJson;

    @ApiModelProperty("封面路径")
    private String coverUrl;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
