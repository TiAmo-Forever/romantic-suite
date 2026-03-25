"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_account = require("../../utils/account.js");
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
  __name: "security",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const form = common_vendor.reactive({ nextPassword: "", confirmPassword: "" });
    common_vendor.onLoad(() => {
      utils_auth.requireAuth();
    });
    async function handleSave() {
      if (form.nextPassword.length < 4)
        return void common_vendor.index.showToast({ title: "新密码至少 4 位", icon: "none" });
      if (form.nextPassword !== form.confirmPassword)
        return void common_vendor.index.showToast({ title: "两次密码输入不一致", icon: "none" });
      try {
        await utils_account.savePasswordAndBack(form.nextPassword, "密码已保存");
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "密码保存失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          title: "账号安全",
          eyebrow: "密码管理"
        }),
        b: form.nextPassword,
        c: common_vendor.o(($event) => form.nextPassword = $event.detail.value, "16"),
        d: common_vendor.p({
          label: "新密码"
        }),
        e: form.confirmPassword,
        f: common_vendor.o(($event) => form.confirmPassword = $event.detail.value, "26"),
        g: common_vendor.p({
          label: "确认密码"
        }),
        h: common_vendor.p({
          title: "登录密码",
          description: "密码会同步保存到服务端，修改后下次登录会立即生效。"
        }),
        i: common_vendor.o(handleSave, "46"),
        j: common_vendor.s(common_vendor.unref(themeStyle))
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/security.js.map
