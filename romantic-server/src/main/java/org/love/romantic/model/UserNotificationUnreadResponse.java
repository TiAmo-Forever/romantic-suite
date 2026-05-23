package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel("站内通知统计响应")
public class UserNotificationUnreadResponse {

    @ApiModelProperty("未读数量")
    private Long unreadCount;

    @ApiModelProperty("已读数量")
    private Long readCount;

    @ApiModelProperty("总条数")
    private Long totalCount;

    @ApiModelProperty("今日新增条数")
    private Long todayCount;

    @ApiModelProperty("按消息类型汇总的条数")
    private Map<String, Long> bizTypeCounts;

    @ApiModelProperty("今日按消息类型汇总的条数")
    private Map<String, Long> todayBizTypeCounts;
}
