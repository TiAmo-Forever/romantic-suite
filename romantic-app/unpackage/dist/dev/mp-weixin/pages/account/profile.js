"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_account = require("../../utils/account.js");
const utils_area = require("../../utils/area.js");
const utils_profile = require("../../utils/profile.js");
const utils_nav = require("../../utils/nav.js");
const utils_useThemePage = require("../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  (AccountHeader + AccountField + AccountPanel)();
}
const AccountField = () => "./components/AccountField.js";
const AccountHeader = () => "./components/AccountHeader.js";
const AccountPanel = () => "./components/AccountPanel.js";
const _sfc_main = {
  __name: "profile",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const form = common_vendor.reactive(utils_profile.getProfile());
    common_vendor.onLoad(() => {
      utils_auth.requireAuth();
    });
    common_vendor.onShow(() => {
      const draft = utils_area.getAreaDraft("profile_city");
      if (!draft)
        return;
      form.city = draft.displayText || draft.mergerName || draft.name || "";
      utils_area.clearAreaDraft("profile_city");
    });
    function openCityPicker() {
      utils_nav.goPage(utils_area.buildAreaPickerUrl("profile_city", {
        value: form.city || ""
      }));
    }
    async function handleSave() {
      if (!form.nickname.trim()) {
        common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
        return;
      }
      try {
        await utils_account.saveProfilePatchAndBack({
          nickname: form.nickname.trim(),
          city: form.city.trim(),
          email: form.email.trim(),
          bio: (form.bio || "").trim()
        }, "资料已保存");
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "资料保存失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          title: "资料信息",
          eyebrow: "资料编辑"
        }),
        b: form.nickname,
        c: common_vendor.o(($event) => form.nickname = $event.detail.value, "19"),
        d: common_vendor.p({
          label: "昵称"
        }),
        e: common_vendor.t(form.city || "请选择所在城市"),
        f: common_vendor.o(openCityPicker, "8b"),
        g: common_vendor.p({
          label: "所在城市"
        }),
        h: form.email,
        i: common_vendor.o(($event) => form.email = $event.detail.value, "0e"),
        j: common_vendor.p({
          label: "邮箱"
        }),
        k: form.bio,
        l: common_vendor.o(($event) => form.bio = $event.detail.value, "82"),
        m: common_vendor.p({
          label: "个性签名"
        }),
        n: common_vendor.p({
          title: "基础资料"
        }),
        o: common_vendor.o(handleSave, "e7"),
        p: common_vendor.s(common_vendor.unref(themeStyle))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-062f0fcd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/profile.js.map
