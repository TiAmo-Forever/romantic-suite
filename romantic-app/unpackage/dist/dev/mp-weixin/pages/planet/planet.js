"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_nav = require("../../utils/nav.js");
const utils_useThemePage = require("../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  BottomTab();
}
const BottomTab = () => "../components/BottomTab.js";
const _sfc_main = {
  __name: "planet",
  setup(__props) {
    const TEXT = {
      brandKicker: "模块星球",
      brand: "浪漫星球",
      brandSub: "把想继续完善的功能都收进这里",
      brandIcon: "✦",
      heroTitle: "把常用模块放在更顺手的位置",
      heroDesc: "这里承接纪念、相册、改进和后续会继续扩展的能力。",
      chipAnniversary: "纪念日",
      chipAlbum: "相册",
      chipPlan: "计划卡",
      opened: "已开放",
      reserve: "预留",
      anniversaryTitle: "恋爱纪念日",
      anniversaryDesc: "纪念日记录",
      albumTitle: "甜蜜相册",
      albumDesc: "照片记录",
      improvementTitle: "恋爱改进簿",
      improvementDesc: "改进记录",
      planTitle: "浪漫计划",
      planDesc: "计划记录"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    function goComingSoon(title) {
      utils_nav.goPage(`/pages/modules/coming-soon/index?title=${encodeURIComponent(title)}`);
    }
    function goAnniversary() {
      utils_nav.goPage("/pages/modules/anniversary/index");
    }
    function goAlbum() {
      utils_nav.goPage("/pages/modules/album/index");
    }
    function goImprovement() {
      utils_nav.goPage("/pages/modules/improvement/index");
    }
    common_vendor.onMounted(() => {
      utils_auth.requireAuth();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(TEXT.brandKicker),
        b: common_vendor.t(TEXT.brand),
        c: common_vendor.t(TEXT.brandSub),
        d: common_vendor.t(TEXT.brandIcon),
        e: common_vendor.t(TEXT.heroTitle),
        f: common_vendor.t(TEXT.heroDesc),
        g: common_vendor.t(TEXT.chipAnniversary),
        h: common_vendor.t(TEXT.chipAlbum),
        i: common_vendor.t(TEXT.chipPlan),
        j: common_vendor.t(TEXT.opened),
        k: common_vendor.t(TEXT.anniversaryTitle),
        l: common_vendor.t(TEXT.anniversaryDesc),
        m: common_vendor.o(goAnniversary, "8a"),
        n: common_vendor.t(TEXT.opened),
        o: common_vendor.t(TEXT.albumTitle),
        p: common_vendor.t(TEXT.albumDesc),
        q: common_vendor.o(goAlbum, "90"),
        r: common_vendor.t(TEXT.opened),
        s: common_vendor.t(TEXT.improvementTitle),
        t: common_vendor.t(TEXT.improvementDesc),
        v: common_vendor.o(goImprovement, "d8"),
        w: common_vendor.t(TEXT.reserve),
        x: common_vendor.t(TEXT.planTitle),
        y: common_vendor.t(TEXT.planDesc),
        z: common_vendor.o(($event) => goComingSoon(TEXT.planTitle), "b4"),
        A: common_vendor.p({
          activeKey: "planet"
        }),
        B: common_vendor.s(common_vendor.unref(themeStyle))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d8c429a1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/planet/planet.js.map
