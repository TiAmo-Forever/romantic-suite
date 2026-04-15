package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Data
@ApiModel("浪漫计划保存请求")
public class RomanticPlanRequest {

    @ApiModelProperty("计划标题")
    @NotBlank(message = "请先填写计划标题")
    private String title;

    @ApiModelProperty("计划说明")
    private String description;

    @ApiModelProperty("计划类型：daily、interval、stage")
    private String planType;

    @ApiModelProperty("计划状态：draft、active、completed、archived")
    private String status;

    @ApiModelProperty("开始时间，格式 yyyy-MM-dd HH:mm:ss")
    @NotBlank(message = "请选择计划开始时间")
    private String startAt;

    @ApiModelProperty("结束时间，格式 yyyy-MM-dd HH:mm:ss")
    private String endAt;

    @ApiModelProperty("间隔天数")
    private Integer intervalDays;

    @ApiModelProperty("地点说明")
    private String location;

    @ApiModelProperty("封面资源")
    private String coverUrl;

    @Valid
    @ApiModelProperty("计划条目")
    private List<RomanticPlanItemRequest> itemList = new ArrayList<>();
}
