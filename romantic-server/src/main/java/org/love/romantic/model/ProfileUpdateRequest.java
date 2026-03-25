package org.love.romantic.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 资料更新请求体。
 */
@Data
@ApiModel("资料更新请求")
public class ProfileUpdateRequest {

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
}
