"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_imagePreview = require("../../utils/image-preview.js");
const services_profile = require("../../services/profile.js");
const utils_nav = require("../../utils/nav.js");
const utils_profile = require("../../utils/profile.js");
const utils_useThemePage = require("../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  (AccountHeader + AccountPanel)();
}
const AccountHeader = () => "./components/AccountHeader.js";
const AccountPanel = () => "./components/AccountPanel.js";
const _sfc_main = {
  __name: "settings",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const profile = common_vendor.ref(utils_profile.getProfile());
    const avatarPresetMap = utils_profile.getAvatarPresetMap();
    const isImageAvatar = common_vendor.computed(() => profile.value.avatarType === "upload" && !!profile.value.avatarImage);
    const avatarImageUrl = common_vendor.computed(() => utils_avatar.resolveAvatarUrl(profile.value.avatarImage));
    const avatarDisplay = common_vendor.computed(() => {
      if (profile.value.avatarType === "preset") {
        return avatarPresetMap[profile.value.avatarPreset] || "♥";
      }
      return String(profile.value.avatarText || "").trim() || "♥";
    });
    const anniversaryDisplay = common_vendor.computed(() => profile.value.anniversaryDate || "未设置");
    const passwordDots = common_vendor.computed(() => "•".repeat(Math.max((profile.value.password || "").length, 4)));
    const profileSummaryTag = common_vendor.computed(() => profile.value.city || "未设置");
    const profileSummary = common_vendor.computed(() => {
      const pieces = [profile.value.nickname || "未设置真实姓名"];
      if (profile.value.email)
        pieces.push(profile.value.email);
      return pieces.join(" · ");
    });
    const avatarModeLabel = common_vendor.computed(() => {
      if (profile.value.avatarType === "upload" && profile.value.avatarImage)
        return "已上传";
      if (profile.value.avatarType === "text")
        return "字符头像";
      return "默认头像";
    });
    const avatarSummary = common_vendor.computed(() => {
      if (profile.value.avatarType === "upload" && profile.value.avatarImage)
        return "当前正在使用已同步到服务端的头像";
      if (profile.value.avatarType === "text")
        return `当前字符：${String(profile.value.avatarText || "").trim() || "♥"}`;
      return `当前预设：${avatarDisplay.value}`;
    });
    const relationshipSummaryTag = common_vendor.computed(() => profile.value.loverNickname || "未设置称呼");
    const relationshipSummary = common_vendor.computed(() => {
      const pieces = [];
      if (profile.value.anniversaryDate)
        pieces.push(profile.value.anniversaryDate);
      pieces.push(profile.value.defaultMeetingPlace || "未设置地点");
      return pieces.join(" · ");
    });
    const securitySummaryTag = common_vendor.computed(() => (profile.value.password || "").length >= 4 ? "已设置" : "待完善");
    const securitySummary = common_vendor.computed(() => {
      const length = (profile.value.password || "").length;
      return length ? `当前密码长度 ${length} 位` : "还没有设置可用密码";
    });
    common_vendor.onShow(async () => {
      if (!utils_auth.requireAuth())
        return;
      try {
        profile.value = await services_profile.fetchRemoteProfile();
      } catch (error) {
        profile.value = utils_profile.getProfile();
      }
    });
    function previewAvatar() {
      if (!avatarImageUrl.value)
        return;
      utils_imagePreview.previewImages([avatarImageUrl.value], avatarImageUrl.value);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "账号设置",
          eyebrow: "设置中心"
        }),
        b: isImageAvatar.value
      }, isImageAvatar.value ? {
        c: avatarImageUrl.value,
        d: common_vendor.o(previewAvatar, "57")
      } : {
        e: common_vendor.t(avatarDisplay.value)
      }, {
        f: common_vendor.t(profile.value.nickname || "浪漫用户"),
        g: common_vendor.t(profile.value.bio || "把常用资料、安全设置和同步入口都收在这里。"),
        h: profile.value.city
      }, profile.value.city ? {
        i: common_vendor.t(profile.value.city)
      } : {}, {
        j: profile.value.loverNickname
      }, profile.value.loverNickname ? {
        k: common_vendor.t(profile.value.loverNickname)
      } : {}, {
        l: common_vendor.t(profileSummaryTag.value),
        m: common_vendor.t(profileSummary.value),
        n: common_vendor.t(profile.value.city || "未设置"),
        o: common_vendor.t(profile.value.email || "邮箱未填写"),
        p: common_vendor.o(($event) => common_vendor.unref(utils_nav.goPage)("/pages/account/profile"), "f1"),
        q: common_vendor.t(avatarModeLabel.value),
        r: common_vendor.t(avatarSummary.value),
        s: isImageAvatar.value
      }, isImageAvatar.value ? {
        t: avatarImageUrl.value,
        v: common_vendor.o(previewAvatar, "18")
      } : {
        w: common_vendor.t(avatarDisplay.value)
      }, {
        x: common_vendor.o(($event) => common_vendor.unref(utils_nav.goPage)("/pages/account/avatar"), "bd"),
        y: common_vendor.p({
          title: "资料与外观"
        }),
        z: common_vendor.t(relationshipSummaryTag.value),
        A: common_vendor.t(relationshipSummary.value),
        B: common_vendor.t(anniversaryDisplay.value),
        C: common_vendor.t(profile.value.defaultMeetingPlace || "未设置地点"),
        D: common_vendor.o(($event) => common_vendor.unref(utils_nav.goPage)("/pages/account/relationship"), "80"),
        E: common_vendor.t(securitySummaryTag.value),
        F: common_vendor.t(securitySummary.value),
        G: common_vendor.t(securitySummaryTag.value),
        H: common_vendor.t(passwordDots.value),
        I: common_vendor.o(($event) => common_vendor.unref(utils_nav.goPage)("/pages/account/security"), "55"),
        J: common_vendor.p({
          title: "关系与安全"
        }),
        K: common_vendor.o(($event) => common_vendor.unref(utils_nav.goPage)("/pages/account/data"), "4e"),
        L: common_vendor.p({
          title: "数据管理"
        }),
        M: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-de3d62c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/settings.js.map
