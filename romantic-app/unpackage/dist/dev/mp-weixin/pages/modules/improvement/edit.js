"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_improvementNotes = require("../../../services/improvement-notes.js");
const utils_auth = require("../../../utils/auth.js");
const utils_imagePreview = require("../../../utils/image-preview.js");
const utils_mediaUpload = require("../../../utils/media-upload.js");
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
    const targetOptions = [
      { key: "me", label: "我自己" },
      { key: "lover", label: "对方感受" },
      { key: "both", label: "共同努力" }
    ];
    const statusOptions = [
      { key: "resolved", label: "已改善 · 已经明显好转" },
      { key: "improving", label: "跟进中 · 还在持续努力" },
      { key: "pending", label: "待开始 · 准备马上行动" }
    ];
    const statusPreviewMap = {
      resolved: {
        title: "已改善",
        desc: "状态会更新为已经明显好转。"
      },
      improving: {
        title: "跟进中",
        desc: "状态会更新为还在持续努力。"
      },
      pending: {
        title: "待开始",
        desc: "状态会更新为准备开始行动。"
      }
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const noteId = common_vendor.ref("");
    const targetIndex = common_vendor.ref(2);
    const statusIndex = common_vendor.ref(1);
    const mediaList = common_vendor.ref([]);
    const form = common_vendor.reactive({
      title: "",
      description: "",
      targetType: "both",
      status: "improving",
      startDate: "",
      latestFeedback: ""
    });
    const pageTitle = common_vendor.computed(() => noteId.value ? "编辑记录" : "新增记录");
    const imageCount = common_vendor.computed(() => mediaList.value.filter((item) => item.mediaType === "image").length);
    const videoCount = common_vendor.computed(() => mediaList.value.filter((item) => item.mediaType === "video").length);
    common_vendor.onLoad(async (options) => {
      if (!utils_auth.requireAuth())
        return;
      noteId.value = (options == null ? void 0 : options.id) || "";
      if (noteId.value) {
        await loadDetail();
        return;
      }
      form.startDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    });
    async function loadDetail() {
      try {
        const detail = await services_improvementNotes.fetchImprovementNoteDetail(noteId.value);
        form.title = detail.title || "";
        form.description = detail.description || "";
        form.targetType = detail.targetType || "both";
        form.status = detail.status || "improving";
        form.startDate = detail.startDate || "";
        form.latestFeedback = detail.latestFeedback || "";
        targetIndex.value = Math.max(targetOptions.findIndex((item) => item.key === form.targetType), 0);
        statusIndex.value = Math.max(statusOptions.findIndex((item) => item.key === form.status), 0);
        mediaList.value = (detail.mediaList || []).map((item) => ({
          localId: `remote_${item.id}`,
          id: item.id,
          mediaType: item.mediaType,
          fileUrl: item.fileUrl,
          thumbnailUrl: item.thumbnailUrl,
          previewUrl: utils_mediaUpload.resolveMediaUrl(item.thumbnailUrl || item.fileUrl),
          localPath: "",
          thumbnailLocalPath: ""
        }));
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "记录详情加载失败", icon: "none" });
      }
    }
    function handleTargetChange(event) {
      var _a;
      targetIndex.value = Number(event.detail.value || 0);
      form.targetType = ((_a = targetOptions[targetIndex.value]) == null ? void 0 : _a.key) || "both";
    }
    function handleStatusChange(event) {
      var _a;
      statusIndex.value = Number(event.detail.value || 0);
      form.status = ((_a = statusOptions[statusIndex.value]) == null ? void 0 : _a.key) || "improving";
    }
    function handleDateChange(event) {
      form.startDate = event.detail.value;
    }
    async function chooseImages() {
      const remain = 9 - imageCount.value;
      if (remain <= 0) {
        common_vendor.index.showToast({ title: "图片最多上传 9 张", icon: "none" });
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
      if (videoCount.value >= 1) {
        common_vendor.index.showToast({ title: "视频最多上传 1 个", icon: "none" });
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
          previewUrl: result.thumbTempFilePath || result.tempFilePath,
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
    function previewEditImage(currentItem) {
      if ((currentItem == null ? void 0 : currentItem.mediaType) !== "image")
        return;
      const imageUrls = mediaList.value.filter((item) => item.mediaType === "image").map((item) => item.previewUrl).filter(Boolean);
      if (!imageUrls.length || !currentItem.previewUrl)
        return;
      utils_imagePreview.previewImages(imageUrls, currentItem.previewUrl);
    }
    async function handleSave() {
      if (!form.title.trim()) {
        common_vendor.index.showToast({ title: "请先填写问题标题", icon: "none" });
        return;
      }
      if (!form.startDate) {
        common_vendor.index.showToast({ title: "请选择开始日期", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "正在保存", mask: true });
        const uploadedMedia = [];
        for (let index = 0; index < mediaList.value.length; index += 1) {
          const item = mediaList.value[index];
          let fileUrl = item.fileUrl;
          let thumbnailUrl = item.thumbnailUrl;
          if (item.localPath) {
            fileUrl = await utils_mediaUpload.uploadImprovementMedia(item.localPath);
          }
          if (item.thumbnailLocalPath) {
            thumbnailUrl = await utils_mediaUpload.uploadImprovementMedia(item.thumbnailLocalPath);
          }
          uploadedMedia.push({
            mediaType: item.mediaType,
            fileUrl,
            thumbnailUrl: thumbnailUrl || "",
            sortOrder: index
          });
        }
        const payload = {
          title: form.title.trim(),
          description: form.description.trim(),
          targetType: form.targetType,
          status: form.status,
          startDate: form.startDate,
          latestFeedback: form.latestFeedback.trim(),
          mediaList: uploadedMedia
        };
        if (noteId.value) {
          await services_improvementNotes.updateImprovementNote(noteId.value, payload);
        } else {
          await services_improvementNotes.createImprovementNote(payload);
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "已保存", icon: "success" });
        setTimeout(() => utils_nav.backPage(), 250);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "保存失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d;
      return common_vendor.e({
        a: common_vendor.p({
          title: pageTitle.value,
          eyebrow: "记录编辑"
        }),
        b: form.title,
        c: common_vendor.o(($event) => form.title = $event.detail.value, "f8"),
        d: common_vendor.p({
          label: "问题标题"
        }),
        e: form.description,
        f: common_vendor.o(($event) => form.description = $event.detail.value, "21"),
        g: common_vendor.p({
          label: "详细说明"
        }),
        h: common_vendor.t(((_a = targetOptions[targetIndex.value]) == null ? void 0 : _a.label) || "请选择改进方向"),
        i: targetOptions,
        j: targetIndex.value,
        k: common_vendor.o(handleTargetChange, "6a"),
        l: common_vendor.t(form.startDate || "请选择开始日期"),
        m: form.startDate,
        n: common_vendor.o(handleDateChange, "fa"),
        o: common_vendor.t(((_b = statusOptions[statusIndex.value]) == null ? void 0 : _b.label) || "请选择当前状态"),
        p: statusOptions,
        q: statusIndex.value,
        r: common_vendor.o(handleStatusChange, "ba"),
        s: common_vendor.t((_c = statusPreviewMap[form.status]) == null ? void 0 : _c.title),
        t: common_vendor.t((_d = statusPreviewMap[form.status]) == null ? void 0 : _d.desc),
        v: common_vendor.n(`status-preview-${form.status}`),
        w: form.latestFeedback,
        x: common_vendor.o(($event) => form.latestFeedback = $event.detail.value, "71"),
        y: common_vendor.p({
          label: "最近反馈摘要"
        }),
        z: common_vendor.p({
          title: "记录信息"
        }),
        A: common_vendor.o(chooseImages, "8a"),
        B: common_vendor.o(chooseVideo, "4b"),
        C: common_vendor.t(imageCount.value),
        D: common_vendor.t(videoCount.value),
        E: mediaList.value.length
      }, mediaList.value.length ? {
        F: common_vendor.f(mediaList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.mediaType === "image"
          }, item.mediaType === "image" ? {
            b: item.previewUrl,
            c: common_vendor.o(($event) => previewEditImage(item), item.localId)
          } : {
            d: item.previewUrl
          }, {
            e: common_vendor.t(item.mediaType === "image" ? "图片" : "视频"),
            f: common_vendor.o(($event) => removeMedia(index), item.localId),
            g: item.localId
          });
        })
      } : {}, {
        G: common_vendor.p({
          title: "图片与视频"
        }),
        H: common_vendor.o(handleSave, "3a"),
        I: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-056f4f93"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/improvement/edit.js.map
