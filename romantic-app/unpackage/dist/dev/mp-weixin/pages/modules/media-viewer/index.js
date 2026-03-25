"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_mediaUpload = require("../../../utils/media-upload.js");
const utils_useThemePage = require("../../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  AccountHeader();
}
const AccountHeader = () => "../../account/components/AccountHeader.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const mediaList = common_vendor.ref([]);
    const currentIndex = common_vendor.ref(0);
    common_vendor.onLoad((options) => {
      try {
        const decodedItems = decodeURIComponent(String((options == null ? void 0 : options.items) || ""));
        const parsedItems = JSON.parse(decodedItems);
        mediaList.value = Array.isArray(parsedItems) ? parsedItems : [];
      } catch (error) {
        mediaList.value = [];
      }
      currentIndex.value = Math.max(0, Math.min(Number((options == null ? void 0 : options.index) || 0), Math.max(mediaList.value.length - 1, 0)));
    });
    function handleSwiperChange(event) {
      currentIndex.value = Number(event.detail.current || 0);
    }
    function resolveMedia(path) {
      return utils_mediaUpload.resolveMediaUrl(path);
    }
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: common_vendor.p({
          title: "媒体查看",
          eyebrow: "图片与视频"
        }),
        b: mediaList.value.length
      }, mediaList.value.length ? {
        c: common_vendor.f(mediaList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.mediaType === "image"
          }, item.mediaType === "image" ? {
            b: resolveMedia(item.fileUrl)
          } : {
            c: resolveMedia(item.fileUrl)
          }, {
            d: `${item.mediaType}_${index}`
          });
        }),
        d: currentIndex.value,
        e: common_vendor.o(handleSwiperChange, "1c"),
        f: common_vendor.t(currentIndex.value + 1),
        g: common_vendor.t(mediaList.value.length),
        h: common_vendor.t(((_a = mediaList.value[currentIndex.value]) == null ? void 0 : _a.mediaType) === "video" ? "视频" : "图片")
      } : {}, {
        i: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-925447f7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/media-viewer/index.js.map
