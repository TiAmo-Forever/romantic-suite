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
@ApiModel("站内通知分页响应")
public class UserNotificationPageResponse {

    @ApiModelProperty("当前页码")
    private Long pageNo;

    @ApiModelProperty("每页条数")
    private Long pageSize;

    @ApiModelProperty("总条数")
    private Long total;

    @ApiModelProperty("是否还有更多")
    private Boolean hasMore;

    @ApiModelProperty("当前页通知列表")
    private List<UserNotificationResponse> list;
}
