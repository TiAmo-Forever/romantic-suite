"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_albums = require("../../../services/albums.js");
const utils_auth = require("../../../utils/auth.js");
const utils_area = require("../../../utils/area.js");
const utils_imagePreview = require("../../../utils/image-preview.js");
const utils_mediaUpload = require("../../../utils/media-upload.js");
const utils_mediaViewer = require("../../../utils/media-viewer.js");
const utils_nav = require("../../../utils/nav.js");
const utils_useThemePage = require("../../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  (AccountHeader + AccountField + AccountPanel)();
}
const AccountField = () => "../../account/components/AccountField.js";
const AccountHeader = () => "../../account/components/AccountHeader.js";
const AccountPanel = () => "../../account/components/AccountPanel.js";
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const TEXT = {
      albumTitle: "甜蜜相册",
      basicTitle: "基础信息",
      titleLabel: "回忆标题",
      titlePlaceholder: "请输入标题",
      dateLabel: "日期",
      datePlaceholder: "请选择日期",
      locationLabel: "地点",
      locationPlaceholder: "请选择地点",
      summaryLabel: "一句话回忆",
      summaryPlaceholder: "写一句关于这天的回忆",
      tagsTitle: "回忆标签",
      presetTitle: "常用标签",
      tapToChoose: "点击选择",
      customTitle: "自定义标签",
      customLimit: "最多 6 个",
      customPlaceholder: "输入自定义标签",
      add: "添加",
      mediaTitle: "图片与视频",
      addImage: "添加图片",
      addVideo: "添加视频",
      selectedPrefix: "已选",
      countJoin: " / ",
      imageUnit: "张图片",
      videoUnit: "个视频",
      imageWord: "图片",
      videoWord: "视频",
      cover: "封面",
      emptyMedia: "暂时还没有媒体",
      save: "保存回忆",
      createPage: "新建回忆",
      editPage: "编辑回忆",
      titleRequired: "请先填写回忆标题",
      dateRequired: "请选择回忆日期",
      loadFailed: "回忆详情加载失败",
      saveFailed: "保存失败",
      saved: "回忆已保存",
      saving: "正在保存",
      imageLimit: "图片最多 12 张",
      videoLimit: "视频最多 2 个",
      remove: "×"
    };
    const presetTagOptions = [
      "开心",
      "约会",
      "旅行",
      "纪念日",
      "生日",
      "海边",
      "散步",
      "见面"
    ];
    const { themeStyle } = utils_useThemePage.useThemePage();
    const memoryId = common_vendor.ref("");
    const mediaList = common_vendor.ref([]);
    const customTagInput = common_vendor.ref("");
    const form = common_vendor.reactive({
      title: "",
      memoryDate: "",
      location: "",
      summary: "",
      tags: [],
      customTags: []
    });
    const pageTitle = common_vendor.computed(() => memoryId.value ? TEXT.editPage : TEXT.createPage);
    const imageCount = common_vendor.computed(() => mediaList.value.filter((item) => item.mediaType === "image").length);
    const videoCount = common_vendor.computed(() => mediaList.value.filter((item) => item.mediaType === "video").length);
    const customTags = common_vendor.computed(() => Array.isArray(form.customTags) ? form.customTags : []);
    common_vendor.onLoad(async (options) => {
      if (!utils_auth.requireAuth())
        return;
      memoryId.value = String((options == null ? void 0 : options.id) || "");
      if (memoryId.value) {
        await loadDetail();
      } else {
        form.memoryDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      }
    });
    common_vendor.onShow(() => {
      const draft = utils_area.getAreaDraft("album_location");
      if (!draft)
        return;
      form.location = draft.displayText || draft.mergerName || draft.name || "";
      utils_area.clearAreaDraft("album_location");
    });
    async function loadDetail() {
      try {
        const detail = await services_albums.fetchAlbumMemoryDetail(memoryId.value);
        form.title = detail.title || "";
        form.memoryDate = detail.memoryDate || "";
        form.location = detail.location || "";
        form.summary = detail.summary || "";
        form.tags = [...detail.tags || []];
        form.customTags = [...(detail.tags || []).filter((tag) => !presetTagOptions.includes(tag))];
        mediaList.value = (detail.mediaList || []).map((item, index) => ({
          localId: `remote_${item.id || index}`,
          id: item.id || "",
          mediaType: item.mediaType,
          fileUrl: item.fileUrl || "",
          thumbnailUrl: item.thumbnailUrl || "",
          previewUrl: utils_mediaUpload.resolveMediaUrl(item.thumbnailUrl || item.fileUrl),
          localPath: "",
          thumbnailLocalPath: ""
        }));
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || TEXT.loadFailed, icon: "none" });
      }
    }
    function handleDateChange(event) {
      form.memoryDate = event.detail.value;
    }
    function openLocationPicker() {
      utils_nav.goPage(utils_area.buildAreaPickerUrl("album_location", {
        value: form.location || ""
      }));
    }
    function toggleTag(tag) {
      const currentTags = Array.isArray(form.tags) ? form.tags : [];
      form.tags = currentTags.includes(tag) ? currentTags.filter((item) => item !== tag) : [...currentTags, tag].slice(0, 6);
    }
    function handleAddCustomTag() {
      const value = String(customTagInput.value || "").trim();
      if (!value)
        return;
      if (form.tags.includes(value)) {
        customTagInput.value = "";
        return;
      }
      form.customTags = [...customTags.value, value].slice(0, 6);
      form.tags = [...form.tags, value].slice(0, 6);
      customTagInput.value = "";
    }
    function removeCustomTag(tag) {
      form.customTags = customTags.value.filter((item) => item !== tag);
      form.tags = form.tags.filter((item) => item !== tag);
    }
    async function chooseImages() {
      const remain = 12 - imageCount.value;
      if (remain <= 0) {
        common_vendor.index.showToast({ title: TEXT.imageLimit, icon: "none" });
        return;
      }
      try {
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.chooseImage({
            count: remain,
            sizeType: ["compressed", "original"],
            sourceType: ["album", "camera"],
            success: resolve,
            fail: reject
          });
        });
        for (const path of result.tempFilePaths || []) {
          const preparedPath = await utils_mediaUpload.prepareImageFile(path);
          mediaList.value.push({
            localId: `local_${Date.now()}_${Math.random()}`,
            mediaType: "image",
            fileUrl: "",
            thumbnailUrl: "",
            previewUrl: preparedPath,
            localPath: preparedPath,
            thumbnailLocalPath: ""
          });
        }
      } catch (error) {
        if (error == null ? void 0 : error.message) {
          common_vendor.index.showToast({ title: error.message, icon: "none" });
        }
      }
    }
    async function chooseVideo() {
      if (videoCount.value >= 2) {
        common_vendor.index.showToast({ title: TEXT.videoLimit, icon: "none" });
        return;
      }
      try {
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.chooseVideo({
            sourceType: ["album", "camera"],
            compressed: true,
            success: resolve,
            fail: reject
          });
        });
        mediaList.value.push({
          localId: `local_${Date.now()}_${Math.random()}`,
          mediaType: "video",
          fileUrl: "",
          thumbnailUrl: "",
          previewUrl: result.thumbTempFilePath || "",
          localPath: result.tempFilePath,
          thumbnailLocalPath: result.thumbTempFilePath || ""
        });
      } catch (error) {
        if (error == null ? void 0 : error.message) {
          common_vendor.index.showToast({ title: error.message, icon: "none" });
        }
      }
    }
    function removeMedia(index) {
      mediaList.value.splice(index, 1);
    }
    function previewDraftImage(item) {
      const imageUrls = mediaList.value.filter((media) => media.mediaType === "image").map((media) => media.previewUrl).filter(Boolean);
      if (!imageUrls.length || !item.previewUrl)
        return;
      utils_imagePreview.previewImages(imageUrls, item.previewUrl);
    }
    function openViewer(list, index) {
      const payload = [];
      let nextIndex = 0;
      (Array.isArray(list) ? list : []).forEach((item, itemIndex) => {
        const fileUrl = item.fileUrl || item.localPath || "";
        if (!fileUrl)
          return;
        if (itemIndex === index) {
          nextIndex = payload.length;
        }
        payload.push({
          mediaType: item.mediaType,
          fileUrl,
          thumbnailUrl: item.thumbnailUrl || item.thumbnailLocalPath || ""
        });
      });
      if (!payload.length)
        return;
      utils_mediaViewer.openMediaViewer(payload, nextIndex);
    }
    async function buildUploadedMedia() {
      const uploadedMedia = [];
      for (let index = 0; index < mediaList.value.length; index += 1) {
        const item = mediaList.value[index];
        let fileUrl = item.fileUrl;
        let thumbnailUrl = item.thumbnailUrl;
        if (item.localPath) {
          fileUrl = await utils_mediaUpload.uploadAlbumMedia(item.localPath);
        }
        if (item.thumbnailLocalPath) {
          thumbnailUrl = await utils_mediaUpload.uploadAlbumMedia(item.thumbnailLocalPath);
        }
        uploadedMedia.push({
          id: item.id || void 0,
          mediaType: item.mediaType,
          fileUrl: fileUrl || "",
          thumbnailUrl: thumbnailUrl || "",
          sortOrder: index
        });
      }
      return uploadedMedia;
    }
    async function handleSave() {
      if (!form.title.trim()) {
        common_vendor.index.showToast({ title: TEXT.titleRequired, icon: "none" });
        return;
      }
      if (!form.memoryDate) {
        common_vendor.index.showToast({ title: TEXT.dateRequired, icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: TEXT.saving, mask: true });
        const payload = {
          title: form.title.trim(),
          memoryDate: form.memoryDate,
          location: form.location.trim(),
          summary: form.summary.trim(),
          tags: form.tags,
          mediaList: await buildUploadedMedia()
        };
        if (memoryId.value) {
          await services_albums.updateAlbumMemory(memoryId.value, payload);
        } else {
          await services_albums.createAlbumMemory(payload);
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: TEXT.saved, icon: "success" });
        setTimeout(() => utils_nav.backPage(), 250);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || TEXT.saveFailed, icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: pageTitle.value,
          eyebrow: TEXT.albumTitle
        }),
        b: TEXT.titlePlaceholder,
        c: form.title,
        d: common_vendor.o(($event) => form.title = $event.detail.value, "1a"),
        e: common_vendor.p({
          label: TEXT.titleLabel
        }),
        f: common_vendor.t(form.memoryDate || TEXT.datePlaceholder),
        g: form.memoryDate,
        h: common_vendor.o(handleDateChange, "d5"),
        i: common_vendor.p({
          label: TEXT.dateLabel
        }),
        j: common_vendor.t(form.location || TEXT.locationPlaceholder),
        k: common_vendor.o(openLocationPicker, "b9"),
        l: common_vendor.p({
          label: TEXT.locationLabel
        }),
        m: TEXT.summaryPlaceholder,
        n: form.summary,
        o: common_vendor.o(($event) => form.summary = $event.detail.value, "37"),
        p: common_vendor.p({
          label: TEXT.summaryLabel
        }),
        q: common_vendor.p({
          title: TEXT.basicTitle
        }),
        r: common_vendor.t(TEXT.presetTitle),
        s: common_vendor.t(TEXT.tapToChoose),
        t: common_vendor.f(presetTagOptions, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag,
            c: form.tags.includes(tag) ? 1 : "",
            d: common_vendor.o(($event) => toggleTag(tag), tag)
          };
        }),
        v: common_vendor.t(TEXT.customTitle),
        w: common_vendor.t(TEXT.customLimit),
        x: TEXT.customPlaceholder,
        y: customTagInput.value,
        z: common_vendor.o(($event) => customTagInput.value = $event.detail.value, "e0"),
        A: common_vendor.t(TEXT.add),
        B: common_vendor.o(handleAddCustomTag, "df"),
        C: customTags.value.length
      }, customTags.value.length ? {
        D: common_vendor.f(customTags.value, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: common_vendor.o(($event) => removeCustomTag(tag), tag),
            c: tag,
            d: form.tags.includes(tag) ? 1 : "",
            e: common_vendor.o(($event) => toggleTag(tag), tag)
          };
        }),
        E: common_vendor.t(TEXT.remove)
      } : {}, {
        F: common_vendor.p({
          title: TEXT.tagsTitle
        }),
        G: common_vendor.t(TEXT.addImage),
        H: common_vendor.o(chooseImages, "99"),
        I: common_vendor.t(TEXT.addVideo),
        J: common_vendor.o(chooseVideo, "e0"),
        K: common_vendor.t(TEXT.selectedPrefix),
        L: common_vendor.t(imageCount.value),
        M: common_vendor.t(TEXT.imageUnit),
        N: common_vendor.t(TEXT.countJoin),
        O: common_vendor.t(videoCount.value),
        P: common_vendor.t(TEXT.videoUnit),
        Q: mediaList.value.length
      }, mediaList.value.length ? {
        R: common_vendor.f(mediaList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.mediaType === "image"
          }, item.mediaType === "image" ? {
            b: item.previewUrl,
            c: common_vendor.o(($event) => previewDraftImage(item), item.localId)
          } : item.previewUrl ? {
            e: item.previewUrl,
            f: common_vendor.o(($event) => openViewer(mediaList.value, index), item.localId)
          } : {
            g: common_vendor.o(($event) => openViewer(mediaList.value, index), item.localId)
          }, {
            d: item.previewUrl,
            h: common_vendor.t(item.mediaType === "image" ? TEXT.imageWord : TEXT.videoWord),
            i: index === 0
          }, index === 0 ? {
            j: common_vendor.t(TEXT.cover)
          } : {}, {
            k: common_vendor.o(($event) => removeMedia(index), item.localId),
            l: item.localId
          });
        }),
        S: common_vendor.t(TEXT.remove)
      } : {
        T: common_vendor.t(TEXT.emptyMedia)
      }, {
        U: common_vendor.p({
          title: TEXT.mediaTitle
        }),
        V: common_vendor.t(TEXT.save),
        W: common_vendor.o(handleSave, "ca"),
        X: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5c5027c5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/album/edit.js.map
