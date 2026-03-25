"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_nav = require("../../../utils/nav.js");
const utils_useThemePage = require("../../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const title = common_vendor.ref("敬请期待");
    function goBack() {
      utils_nav.backPage();
    }
    common_vendor.onLoad((options) => {
      title.value = decodeURIComponent(options.title || "敬请期待");
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack, "3c"),
        b: common_vendor.t(title.value),
        c: common_vendor.o(goBack, "02"),
        d: common_vendor.s(common_vendor.unref(themeStyle))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f3f0e89a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/coming-soon/index.js.map
