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
@TableName("biz_comment_record")
@ApiModel("通用评论记录")
public class BizCommentRecord {

    @TableId(type = IdType.AUTO)
    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("业务类型")
    private String bizType;

    @ApiModelProperty("业务 ID")
    private Long bizId;

    @ApiModelProperty("评论账号")
    private String username;

    @ApiModelProperty("评论内容")
    private String content;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
