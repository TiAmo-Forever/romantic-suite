package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 前端可安全使用的资料返回体。
 */
@Data
@Builder
@ApiModel("资料响应")
public class ProfileResponse {

    @ApiModelProperty("主键 ID")
    private Long id;

    @ApiModelProperty("登录账号")
    private String username;

    @ApiModelProperty("自己的真实姓名")
    private String nickname;

    @ApiModelProperty("所在城市")
    private String city;

    @ApiModelProperty("对象平时对你的称呼")
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

    @ApiModelProperty("预设头像标识")
    private String avatarPreset;

    @ApiModelProperty("字符头像内容")
    private String avatarText;

    @ApiModelProperty("上传头像相对路径")
    private String avatarImage;

    @ApiModelProperty("主题预设标识")
    private String themePresetKey;

    @ApiModelProperty("是否已配置密码")
    private boolean passwordConfigured;

    @ApiModelProperty("密码长度")
    private int passwordLength;
}
