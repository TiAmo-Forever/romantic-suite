package org.love.romantic.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 基础行政区实体。
 */
@Data
@ApiModel("基础行政区")
@TableName("basic_area")
public class BasicArea {

    @TableId
    @ApiModelProperty("行政代码")
    private Integer id;

    @ApiModelProperty("层级：0省，1市，2区")
    private Integer level;

    @ApiModelProperty("父级行政代码")
    private Integer parentId;

    @ApiModelProperty("邮政编码")
    private Long zipCode;

    @ApiModelProperty("区号")
    private String cityCode;

    @ApiModelProperty("名称")
    private String name;

    @ApiModelProperty("简称")
    private String shortName;

    @ApiModelProperty("组合名")
    private String mergerName;

    @ApiModelProperty("拼音")
    private String pinyin;

    @ApiModelProperty("经度")
    private BigDecimal locLng;

    @ApiModelProperty("纬度")
    private BigDecimal locLat;
}
