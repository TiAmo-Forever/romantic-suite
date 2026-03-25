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

/**
 * 情侣账号资料实体。
 */
@ApiModel("情侣资料实体")
@TableName("couple_profile")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoupleProfile {

    @ApiModelProperty("主键 ID")
    @TableId(type = IdType.AUTO)
    private Long id;

    @ApiModelProperty("登录账号")
    private String username;

    @ApiModelProperty("登录密码")
    private String password;

    @ApiModelProperty("昵称")
    private String nickname;

    @ApiModelProperty("所在城市")
    private String city;

    @ApiModelProperty("对象对你的称呼")
    private String loverNickname;

    @ApiModelProperty("个性签名")
    private String bio;

    @ApiModelProperty("纪念日")
    private String anniversaryDate;

    @ApiModelProperty("默认见面城市行政区编码")
    private Integer defaultMeetingAreaId;

    @ApiModelProperty("默认见面地点")
    private String defaultMeetingPlace;

    @ApiModelProperty("邮箱")
    private String email;

    @ApiModelProperty("头像类型")
    private String avatarType;

    @ApiModelProperty("预设头像 key")
    private String avatarPreset;

    @ApiModelProperty("字符头像内容")
    private String avatarText;

    @ApiModelProperty("上传头像相对路径")
    private String avatarImage;

    @ApiModelProperty("主题预设标识")
    private String themePresetKey;

    @ApiModelProperty("创建时间")
    private LocalDateTime createdAt;

    @ApiModelProperty("更新时间")
    private LocalDateTime updatedAt;
}
