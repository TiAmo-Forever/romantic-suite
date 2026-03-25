package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel("甜蜜相册回忆响应")
public class AlbumMemoryResponse {

    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("回忆标题")
    private String title;

    @ApiModelProperty("回忆日期")
    private String memoryDate;

    @ApiModelProperty("地点")
    private String location;

    @ApiModelProperty("回忆内容")
    private String summary;

    @ApiModelProperty("标签列表")
    private List<String> tags;

    @ApiModelProperty("封面路径")
    private String coverUrl;

    @ApiModelProperty("图片数量")
    private Integer imageCount;

    @ApiModelProperty("视频数量")
    private Integer videoCount;

    @ApiModelProperty("创建人账号")
    private String creatorUsername;

    @ApiModelProperty("创建人昵称")
    private String creatorNickname;

    @ApiModelProperty("创建时间")
    private String createdAt;

    @ApiModelProperty("更新时间")
    private String updatedAt;

    @ApiModelProperty("媒体列表")
    private List<AlbumMediaResponse> mediaList;
}
