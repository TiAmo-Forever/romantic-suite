package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 行政区选项返回体。
 */
@Data
@Builder
@ApiModel("行政区选项")
public class AreaOptionResponse {

    @ApiModelProperty("行政代码")
    private Integer id;

    @ApiModelProperty("父级行政代码")
    private Integer parentId;

    @ApiModelProperty("层级：0省，1市，2区")
    private Integer level;

    @ApiModelProperty("名称")
    private String name;

    @ApiModelProperty("简称")
    private String shortName;

    @ApiModelProperty("组合名")
    private String mergerName;
}
