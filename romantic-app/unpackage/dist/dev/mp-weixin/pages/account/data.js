"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_profile = require("../../utils/profile.js");
const services_profile = require("../../services/profile.js");
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
  __name: "data",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    common_vendor.onLoad(() => {
      utils_auth.requireAuth();
    });
    async function handleResetProfile() {
      try {
        await services_profile.resetRemoteProfile();
        common_vendor.index.showToast({ title: "已恢复默认资料", icon: "none" });
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "恢复默认资料失败", icon: "none" });
      }
    }
    async function handleSyncRemoteProfile() {
      try {
        utils_avatar.clearAvatarDraft();
        const remoteProfile = await services_profile.fetchRemoteProfile({ allowOfflineFallback: false });
        utils_profile.saveProfile(remoteProfile);
        common_vendor.index.showToast({ title: "已重新同步资料", icon: "none" });
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "重新同步资料失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          title: "数据管理",
          eyebrow: "资料与同步"
        }),
        b: common_vendor.o(handleResetProfile, "5b"),
        c: common_vendor.o(handleSyncRemoteProfile, "c4"),
        d: common_vendor.p({
          title: "资料操作"
        }),
        e: common_vendor.s(common_vendor.unref(themeStyle))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-72805356"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/data.js.map
