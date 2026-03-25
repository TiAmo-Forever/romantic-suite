"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_albums = require("../../../services/albums.js");
const utils_auth = require("../../../utils/auth.js");
const utils_mediaUpload = require("../../../utils/media-upload.js");
const utils_mediaViewer = require("../../../utils/media-viewer.js");
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
    const TEXT = {
      albumTitle: "甜蜜相册",
      detailTitle: "回忆详情",
      imageWord: "图片",
      videoWord: "视频",
      imageUnit: "张图片",
      videoUnit: "个视频",
      mediaTitle: "照片与视频",
      emptyMedia: "暂无媒体",
      editButton: "编辑回忆",
      deleteButton: "删除回忆",
      deleteTitle: "删除回忆",
      deleteContent: "删除后会移除这段回忆和关联媒体，是否继续？",
      deleted: "已删除",
      deleteFailed: "删除失败",
      loadFailed: "回忆详情加载失败"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const detail = common_vendor.ref(null);
    const memoryId = common_vendor.ref("");
    common_vendor.onLoad(async (options) => {
      if (!utils_auth.requireAuth())
        return;
      memoryId.value = String((options == null ? void 0 : options.id) || "");
      await loadDetail();
    });
    common_vendor.onShow(async () => {
      if (!memoryId.value || !utils_auth.requireAuth())
        return;
      await loadDetail();
    });
    async function loadDetail() {
      if (!memoryId.value)
        return;
      try {
        detail.value = await services_albums.fetchAlbumMemoryDetail(memoryId.value);
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || TEXT.loadFailed, icon: "none" });
      }
    }
    function resolveMedia(path) {
      return utils_mediaUpload.resolveMediaUrl(path);
    }
    function openViewer(mediaList, index) {
      const safeList = Array.isArray(mediaList) ? mediaList : [];
      const payload = [];
      let nextIndex = 0;
      safeList.forEach((item, itemIndex) => {
        if (!(item == null ? void 0 : item.fileUrl))
          return;
        if (itemIndex === index) {
          nextIndex = payload.length;
        }
        payload.push({
          mediaType: item.mediaType,
          fileUrl: item.fileUrl,
          thumbnailUrl: item.thumbnailUrl
        });
      });
      if (!payload.length)
        return;
      utils_mediaViewer.openMediaViewer(payload, nextIndex);
    }
    function goEdit() {
      var _a;
      if (!((_a = detail.value) == null ? void 0 : _a.id))
        return;
      utils_nav.goPage(`/pages/modules/album/edit?id=${detail.value.id}`);
    }
    function handleDelete() {
      var _a;
      if (!((_a = detail.value) == null ? void 0 : _a.id))
        return;
      common_vendor.index.showModal({
        title: TEXT.deleteTitle,
        content: TEXT.deleteContent,
        success: async (result) => {
          if (!result.confirm)
            return;
          try {
            await services_albums.deleteAlbumMemory(detail.value.id);
            common_vendor.index.showToast({ title: TEXT.deleted, icon: "success" });
            setTimeout(() => utils_nav.backPage(), 250);
          } catch (error) {
            common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || TEXT.deleteFailed, icon: "none" });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: TEXT.detailTitle,
          eyebrow: TEXT.albumTitle
        }),
        b: detail.value
      }, detail.value ? common_vendor.e({
        c: common_vendor.f(detail.value.mediaList, (item, index, i0) => {
          return common_vendor.e({
            a: item.mediaType === "image" && resolveMedia(item.fileUrl)
          }, item.mediaType === "image" && resolveMedia(item.fileUrl) ? {
            b: resolveMedia(item.fileUrl)
          } : resolveMedia(item.thumbnailUrl) ? {
            d: resolveMedia(item.thumbnailUrl)
          } : {}, {
            c: resolveMedia(item.thumbnailUrl),
            e: common_vendor.t(item.mediaType === "video" ? TEXT.videoWord : TEXT.imageWord),
            f: common_vendor.o(($event) => openViewer(detail.value.mediaList, index), item.id || index),
            g: item.id || index
          });
        }),
        d: detail.value.memoryDate
      }, detail.value.memoryDate ? {
        e: common_vendor.t(detail.value.memoryDate)
      } : {}, {
        f: detail.value.location
      }, detail.value.location ? {
        g: common_vendor.t(detail.value.location)
      } : {}, {
        h: common_vendor.t(detail.value.imageCount),
        i: common_vendor.t(TEXT.imageUnit),
        j: detail.value.videoCount
      }, detail.value.videoCount ? {
        k: common_vendor.t(detail.value.videoCount),
        l: common_vendor.t(TEXT.videoUnit)
      } : {}, {
        m: detail.value.summary
      }, detail.value.summary ? {
        n: common_vendor.t(detail.value.summary)
      } : {}, {
        o: detail.value.tags.length
      }, detail.value.tags.length ? {
        p: common_vendor.f(detail.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        q: common_vendor.p({
          title: detail.value.title,
          description: detail.value.summary || ""
        }),
        r: detail.value.mediaList.length
      }, detail.value.mediaList.length ? {
        s: common_vendor.f(detail.value.mediaList, (item, index, i0) => {
          return common_vendor.e({
            a: item.mediaType === "image" && resolveMedia(item.fileUrl)
          }, item.mediaType === "image" && resolveMedia(item.fileUrl) ? {
            b: resolveMedia(item.fileUrl)
          } : resolveMedia(item.thumbnailUrl) ? {
            d: resolveMedia(item.thumbnailUrl)
          } : {}, {
            c: resolveMedia(item.thumbnailUrl),
            e: common_vendor.t(item.mediaType === "video" ? TEXT.videoWord : TEXT.imageWord),
            f: item.id || index,
            g: common_vendor.o(($event) => openViewer(detail.value.mediaList, index), item.id || index)
          });
        })
      } : {
        t: common_vendor.t(TEXT.emptyMedia)
      }, {
        v: common_vendor.p({
          title: TEXT.mediaTitle
        }),
        w: common_vendor.t(TEXT.editButton),
        x: common_vendor.o(goEdit, "67"),
        y: common_vendor.t(TEXT.deleteButton),
        z: common_vendor.o(handleDelete, "7c")
      }) : {}, {
        A: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-01f731b7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/album/detail.js.map
