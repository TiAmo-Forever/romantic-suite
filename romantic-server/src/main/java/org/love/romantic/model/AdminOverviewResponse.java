package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 管理员基础信息总览响应。
 */
@Data
@Builder
@ApiModel("管理员基础信息总览响应")
public class AdminOverviewResponse {

    @ApiModelProperty("当前账号类型")
    private String accountType;

    @ApiModelProperty("当前登录账号")
    private String currentUsername;

    @ApiModelProperty("管理员可见范围说明")
    private String accessNotice;

    @ApiModelProperty("恋爱纪念日日期")
    private String anniversaryDate;

    @ApiModelProperty("相恋天数")
    private long togetherDays;

    @ApiModelProperty("情侣资料摘要")
    private List<AdminProfileSummaryResponse> profileList;

    @ApiModelProperty("见面倒计时摘要")
    private AdminCountdownSummaryResponse countdown;

    @ApiModelProperty("纪念日摘要")
    private AdminAnniversarySummaryResponse anniversary;
}
