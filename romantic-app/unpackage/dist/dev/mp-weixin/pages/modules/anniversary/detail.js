"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_anniversaries = require("../../../services/anniversaries.js");
const utils_imagePreview = require("../../../utils/image-preview.js");
const utils_auth = require("../../../utils/auth.js");
const utils_mediaUpload = require("../../../utils/media-upload.js");
const utils_nav = require("../../../utils/nav.js");
const utils_useThemePage = require("../../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  (AccountHeader + AccountPanel)();
}
const AccountHeader = () => "../../account/components/AccountHeader.js";
const AccountPanel = () => "../../account/components/AccountPanel.js";
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const detail = common_vendor.ref(null);
    const eventId = common_vendor.ref("");
    common_vendor.onLoad(async (options) => {
      if (!utils_auth.requireAuth())
        return;
      eventId.value = (options == null ? void 0 : options.id) || "";
      await loadDetail();
    });
    common_vendor.onShow(async () => {
      if (!eventId.value || !utils_auth.requireAuth())
        return;
      await loadDetail();
    });
    async function loadDetail() {
      if (!eventId.value)
        return;
      try {
        detail.value = await services_anniversaries.fetchAnniversaryDetail(eventId.value);
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "纪念日详情加载失败", icon: "none" });
      }
    }
    function formatStatus(item) {
      if (item.timeStatus === "future") {
        if (Number(item.dayOffset) === 0)
          return "就是今天";
        return `还有 ${item.dayOffset} 天`;
      }
      return `已过去 ${Math.abs(Number(item.dayOffset || 0))} 天`;
    }
    function goEdit() {
      utils_nav.goPage(`/pages/modules/anniversary/edit?id=${detail.value.id}`);
    }
    function previewMedia(currentItem) {
      var _a;
      const imageUrls = (((_a = detail.value) == null ? void 0 : _a.mediaList) || []).filter((item) => item.mediaType === "image").map((item) => utils_mediaUpload.resolveMediaUrl(item.fileUrl)).filter(Boolean);
      const currentUrl = utils_mediaUpload.resolveMediaUrl(currentItem == null ? void 0 : currentItem.fileUrl);
      if (!imageUrls.length || !currentUrl)
        return;
      utils_imagePreview.previewImages(imageUrls, currentUrl);
    }
    function handleDelete() {
      common_vendor.index.showModal({
        title: "删除纪念日",
        content: "删除后会一并移除相关图片和视频，是否继续？",
        success: async (result) => {
          if (!result.confirm)
            return;
          try {
            await services_anniversaries.deleteAnniversary(detail.value.id);
            common_vendor.index.showToast({ title: "已删除", icon: "success" });
            setTimeout(() => utils_nav.backPage(), 250);
          } catch (error) {
            common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "删除失败", icon: "none" });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.p({
          title: "纪念日详情",
          eyebrow: "回忆卡片"
        }),
        b: detail.value
      }, detail.value ? common_vendor.e({
        c: common_vendor.t(detail.value.eventDate),
        d: common_vendor.t(formatStatus(detail.value)),
        e: detail.value.creatorNickname
      }, detail.value.creatorNickname ? {
        f: common_vendor.t(detail.value.creatorNickname)
      } : {}, {
        g: common_vendor.t(detail.value.description || "暂无内容"),
        h: common_vendor.p({
          title: detail.value.title,
          description: detail.value.location || ""
        }),
        i: (_a = detail.value.mediaList) == null ? void 0 : _a.length
      }, ((_b = detail.value.mediaList) == null ? void 0 : _b.length) ? {
        j: common_vendor.f(detail.value.mediaList, (item, k0, i0) => {
          return common_vendor.e({
            a: item.mediaType === "image"
          }, item.mediaType === "image" ? {
            b: common_vendor.unref(utils_mediaUpload.resolveMediaUrl)(item.fileUrl),
            c: common_vendor.o(($event) => previewMedia(item), item.id)
          } : {
            d: common_vendor.unref(utils_mediaUpload.resolveMediaUrl)(item.fileUrl)
          }, {
            e: item.id
          });
        })
      } : {}, {
        k: common_vendor.p({
          title: "图片与视频"
        }),
        l: common_vendor.o(goEdit, "6e"),
        m: common_vendor.o(handleDelete, "b7")
      }) : {}, {
        n: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cf83378e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/anniversary/detail.js.map
