package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Data
@ApiModel("甜蜜相册保存请求")
public class AlbumMemoryRequest {

    @NotBlank(message = "回忆标题不能为空")
    @ApiModelProperty("回忆标题")
    private String title;

    @NotBlank(message = "回忆日期不能为空")
    @ApiModelProperty("回忆日期，格式 yyyy-MM-dd")
    private String memoryDate;

    @ApiModelProperty("地点")
    private String location;

    @ApiModelProperty("回忆内容")
    private String summary;

    @ApiModelProperty("标签列表")
    private List<String> tags = new ArrayList<>();

    @ApiModelProperty("媒体列表")
    private List<AlbumMediaRequest> mediaList = new ArrayList<>();
}
