"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_improvementNotes = require("../../../services/improvement-notes.js");
const utils_auth = require("../../../utils/auth.js");
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
  (AccountHeader + AccountPanel + AccountField)();
}
const AccountField = () => "../../account/components/AccountField.js";
const AccountHeader = () => "../../account/components/AccountHeader.js";
const AccountPanel = () => "../../account/components/AccountPanel.js";
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const statusOptions = [
      { key: "resolved", label: "已改善 · 已经明显好转" },
      { key: "improving", label: "跟进中 · 还在持续努力" },
      { key: "pending", label: "待开始 · 准备马上行动" }
    ];
    const targetLabelMap = { me: "我自己", lover: "对方感受", both: "共同努力" };
    const statusLabelMap = { resolved: "已改善", improving: "跟进中", pending: "待开始" };
    const statusHintMap = {
      resolved: "已经明显好转，可以把这段努力好好收起来了。",
      improving: "还在持续努力里，每一次记录都会让改变更清楚。",
      pending: "准备开始行动，把第一步写下来就已经很重要。"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const detail = common_vendor.ref(null);
    const noteId = common_vendor.ref("");
    const statusIndex = common_vendor.ref(1);
    const noteMediaExpanded = common_vendor.ref(false);
    const expandedFeedbackIds = common_vendor.ref([]);
    const feedbackMediaList = common_vendor.ref([]);
    const editingFeedbackId = common_vendor.ref(0);
    const editingStatusIndex = common_vendor.ref(1);
    const editingMediaList = common_vendor.ref([]);
    const skipNextOnShowReload = common_vendor.ref(false);
    const feedbackForm = common_vendor.reactive({ status: "improving", content: "" });
    const editingForm = common_vendor.reactive({ status: "improving", content: "" });
    const feedbackImageCount = common_vendor.computed(() => feedbackMediaList.value.filter((item) => item.mediaType === "image").length);
    const feedbackVideoCount = common_vendor.computed(() => feedbackMediaList.value.filter((item) => item.mediaType === "video").length);
    const editingImageCount = common_vendor.computed(() => editingMediaList.value.filter((item) => item.mediaType === "image").length);
    const editingVideoCount = common_vendor.computed(() => editingMediaList.value.filter((item) => item.mediaType === "video").length);
    common_vendor.onLoad(async (options) => {
      if (!utils_auth.requireAuth())
        return;
      noteId.value = (options == null ? void 0 : options.id) || "";
      await loadDetail();
    });
    common_vendor.onShow(async () => {
      if (!noteId.value || !utils_auth.requireAuth())
        return;
      if (skipNextOnShowReload.value) {
        skipNextOnShowReload.value = false;
        return;
      }
      await loadDetail();
    });
    async function loadDetail() {
      var _a;
      if (!noteId.value)
        return;
      try {
        detail.value = await services_improvementNotes.fetchImprovementNoteDetail(noteId.value);
        cancelEditFeedback();
        syncFeedbackStatus((_a = detail.value) == null ? void 0 : _a.status);
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "记录详情加载失败", icon: "none" });
      }
    }
    function resolveMedia(path) {
      return utils_mediaUpload.resolveMediaUrl(path);
    }
    function mediaSummary(mediaList = []) {
      const imageCount = mediaList.filter((item) => item.mediaType === "image").length;
      const videoCount = mediaList.filter((item) => item.mediaType === "video").length;
      const parts = [];
      if (imageCount)
        parts.push(`${imageCount} 张图片`);
      if (videoCount)
        parts.push(`${videoCount} 个视频`);
      return parts.join(" · ") || "媒体";
    }
    function toggleNoteMedia() {
      noteMediaExpanded.value = !noteMediaExpanded.value;
    }
    function isFeedbackExpanded(feedbackId) {
      return expandedFeedbackIds.value.includes(feedbackId);
    }
    function toggleFeedbackMedia(feedbackId) {
      if (isFeedbackExpanded(feedbackId)) {
        expandedFeedbackIds.value = expandedFeedbackIds.value.filter((item) => item !== feedbackId);
        return;
      }
      expandedFeedbackIds.value = [...expandedFeedbackIds.value, feedbackId];
    }
    function syncFeedbackStatus(status) {
      var _a;
      const nextIndex = Math.max(statusOptions.findIndex((item) => item.key === status), 0);
      statusIndex.value = nextIndex;
      feedbackForm.status = ((_a = statusOptions[nextIndex]) == null ? void 0 : _a.key) || "improving";
    }
    function handleStatusChange(event) {
      var _a;
      statusIndex.value = Number(event.detail.value || 0);
      feedbackForm.status = ((_a = statusOptions[statusIndex.value]) == null ? void 0 : _a.key) || "improving";
    }
    function handleEditingStatusChange(event) {
      var _a;
      editingStatusIndex.value = Number(event.detail.value || 0);
      editingForm.status = ((_a = statusOptions[editingStatusIndex.value]) == null ? void 0 : _a.key) || "improving";
    }
    function goEdit() {
      utils_nav.goPage(`/pages/modules/improvement/edit?id=${detail.value.id}`);
    }
    function isEditingFeedback(feedbackId) {
      return editingFeedbackId.value === feedbackId;
    }
    function startEditFeedback(item) {
      editingFeedbackId.value = item.id;
      editingForm.status = item.status || "improving";
      editingForm.content = item.content || "";
      editingStatusIndex.value = Math.max(statusOptions.findIndex((option) => option.key === editingForm.status), 0);
      editingMediaList.value = (item.mediaList || []).map((media, index) => ({
        localId: `feedback_remote_${item.id}_${media.id || index}`,
        id: media.id,
        mediaType: media.mediaType,
        fileUrl: media.fileUrl,
        thumbnailUrl: media.thumbnailUrl,
        previewUrl: utils_mediaUpload.resolveMediaUrl(media.thumbnailUrl || media.fileUrl),
        localPath: "",
        thumbnailLocalPath: ""
      }));
    }
    function cancelEditFeedback() {
      editingFeedbackId.value = 0;
      editingForm.status = "improving";
      editingForm.content = "";
      editingStatusIndex.value = 1;
      editingMediaList.value = [];
    }
    function openViewer(mediaList = [], startIndex = 0) {
      const normalizedMediaList = mediaList.map((item) => ({
        mediaType: item.mediaType,
        fileUrl: item.fileUrl || item.localPath || "",
        thumbnailUrl: item.thumbnailUrl || item.previewUrl || ""
      }));
      utils_mediaViewer.openMediaViewer(normalizedMediaList, startIndex);
    }
    async function chooseFeedbackImages() {
      await chooseImagesForList(feedbackMediaList.value, 9 - feedbackImageCount.value);
    }
    async function chooseEditingImages() {
      await chooseImagesForList(editingMediaList.value, 9 - editingImageCount.value);
    }
    async function chooseImagesForList(targetList, remain) {
      if (remain <= 0) {
        common_vendor.index.showToast({ title: "图片最多上传 9 张", icon: "none" });
        return;
      }
      try {
        skipNextOnShowReload.value = true;
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
          targetList.push({
            localId: `local_${Date.now()}_${Math.random()}`,
            mediaType: "image",
            previewUrl: preparedPath,
            localPath: preparedPath,
            thumbnailLocalPath: "",
            fileUrl: "",
            thumbnailUrl: ""
          });
        }
      } catch (error) {
        if (error == null ? void 0 : error.message)
          common_vendor.index.showToast({ title: error.message, icon: "none" });
      }
    }
    async function chooseFeedbackVideo() {
      if (feedbackVideoCount.value >= 1) {
        common_vendor.index.showToast({ title: "视频最多上传 1 个", icon: "none" });
        return;
      }
      await chooseVideoForList(feedbackMediaList.value);
    }
    async function chooseEditingVideo() {
      if (editingVideoCount.value >= 1) {
        common_vendor.index.showToast({ title: "视频最多上传 1 个", icon: "none" });
        return;
      }
      await chooseVideoForList(editingMediaList.value);
    }
    async function chooseVideoForList(targetList) {
      try {
        skipNextOnShowReload.value = true;
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.chooseVideo({
            sourceType: ["album", "camera"],
            compressed: true,
            success: resolve,
            fail: reject
          });
        });
        targetList.push({
          localId: `local_${Date.now()}_${Math.random()}`,
          mediaType: "video",
          previewUrl: result.thumbTempFilePath || result.tempFilePath,
          localPath: result.tempFilePath,
          thumbnailLocalPath: result.thumbTempFilePath || "",
          fileUrl: "",
          thumbnailUrl: ""
        });
      } catch (error) {
        if (error == null ? void 0 : error.message)
          common_vendor.index.showToast({ title: error.message, icon: "none" });
      }
    }
    function previewDraftImage(currentItem) {
      if ((currentItem == null ? void 0 : currentItem.mediaType) !== "image")
        return;
      const imageUrls = feedbackMediaList.value.filter((item) => item.mediaType === "image").map((item) => item.previewUrl).filter(Boolean);
      if (!imageUrls.length || !currentItem.previewUrl)
        return;
      utils_imagePreview.previewImages(imageUrls, currentItem.previewUrl);
    }
    function previewEditingImage(currentItem) {
      if ((currentItem == null ? void 0 : currentItem.mediaType) !== "image")
        return;
      const imageUrls = editingMediaList.value.filter((item) => item.mediaType === "image").map((item) => item.previewUrl).filter(Boolean);
      if (!imageUrls.length || !currentItem.previewUrl)
        return;
      utils_imagePreview.previewImages(imageUrls, currentItem.previewUrl);
    }
    function removeFeedbackMedia(index) {
      feedbackMediaList.value.splice(index, 1);
    }
    function removeEditingMedia(index) {
      editingMediaList.value.splice(index, 1);
    }
    async function buildUploadedMedia(mediaList) {
      const uploadedMedia = [];
      for (let index = 0; index < mediaList.length; index += 1) {
        const item = mediaList[index];
        let fileUrl = item.fileUrl;
        let thumbnailUrl = item.thumbnailUrl;
        if (item.localPath)
          fileUrl = await utils_mediaUpload.uploadImprovementMedia(item.localPath);
        if (item.thumbnailLocalPath)
          thumbnailUrl = await utils_mediaUpload.uploadImprovementMedia(item.thumbnailLocalPath);
        uploadedMedia.push({ mediaType: item.mediaType, fileUrl, thumbnailUrl: thumbnailUrl || "", sortOrder: index });
      }
      return uploadedMedia;
    }
    async function handleAddFeedback() {
      if (!feedbackForm.content.trim()) {
        common_vendor.index.showToast({ title: "请先写一点反馈内容", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "正在提交", mask: true });
        const uploadedMedia = await buildUploadedMedia(feedbackMediaList.value);
        detail.value = await services_improvementNotes.addImprovementFeedback(detail.value.id, {
          status: feedbackForm.status,
          content: feedbackForm.content.trim(),
          mediaList: uploadedMedia
        });
        feedbackForm.content = "";
        feedbackMediaList.value = [];
        syncFeedbackStatus(detail.value.status);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "已记录", icon: "success" });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "记录失败", icon: "none" });
      }
    }
    async function handleUpdateFeedback(item) {
      if (!editingForm.content.trim()) {
        common_vendor.index.showToast({ title: "请先写一点反馈内容", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "正在保存", mask: true });
        const uploadedMedia = await buildUploadedMedia(editingMediaList.value);
        detail.value = await services_improvementNotes.updateImprovementFeedback(detail.value.id, item.id, {
          status: editingForm.status,
          content: editingForm.content.trim(),
          mediaList: uploadedMedia
        });
        cancelEditFeedback();
        syncFeedbackStatus(detail.value.status);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "反馈已更新", icon: "success" });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "反馈更新失败", icon: "none" });
      }
    }
    function handleDelete() {
      common_vendor.index.showModal({
        title: "删除记录",
        content: "删除后，这条改进记录、时间线和关联媒体都会一起移除，是否继续？",
        success: async (result) => {
          if (!result.confirm)
            return;
          try {
            await services_improvementNotes.deleteImprovementNote(detail.value.id);
            common_vendor.index.showToast({ title: "已删除", icon: "success" });
            setTimeout(() => utils_nav.backPage(), 250);
          } catch (error) {
            common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "删除失败", icon: "none" });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g;
      return common_vendor.e({
        a: common_vendor.p({
          title: "恋爱改进簿",
          eyebrow: "记录详情"
        }),
        b: detail.value
      }, detail.value ? common_vendor.e({
        c: common_vendor.t(targetLabelMap[detail.value.targetType]),
        d: common_vendor.t(detail.value.startDate),
        e: common_vendor.t(statusLabelMap[detail.value.status]),
        f: common_vendor.n(`detail-chip-${detail.value.status}`),
        g: common_vendor.t(detail.value.creatorNickname ? `创建人：${detail.value.creatorNickname}` : "未登记创建人"),
        h: common_vendor.t(detail.value.latestFeedback || "还没有反馈"),
        i: common_vendor.t(statusHintMap[detail.value.status]),
        j: common_vendor.n(`status-banner-${detail.value.status}`),
        k: (_a = detail.value.mediaList) == null ? void 0 : _a.length
      }, ((_b = detail.value.mediaList) == null ? void 0 : _b.length) ? {
        l: common_vendor.t(mediaSummary(detail.value.mediaList)),
        m: common_vendor.t(noteMediaExpanded.value ? "收起内容" : "点击查看"),
        n: common_vendor.o(toggleNoteMedia, "ec")
      } : {}, {
        o: noteMediaExpanded.value && ((_c = detail.value.mediaList) == null ? void 0 : _c.length)
      }, noteMediaExpanded.value && ((_d = detail.value.mediaList) == null ? void 0 : _d.length) ? {
        p: common_vendor.f(detail.value.mediaList, (item, index, i0) => {
          return common_vendor.e({
            a: item.mediaType === "image"
          }, item.mediaType === "image" ? {
            b: resolveMedia(item.fileUrl)
          } : item.thumbnailUrl ? {
            d: resolveMedia(item.thumbnailUrl)
          } : {}, {
            c: item.thumbnailUrl,
            e: common_vendor.t(item.mediaType === "video" ? "视频" : "图片"),
            f: `note_${item.id || index}`,
            g: common_vendor.o(($event) => openViewer(detail.value.mediaList, index), `note_${item.id || index}`)
          });
        })
      } : {}, {
        q: common_vendor.p({
          title: detail.value.title,
          description: detail.value.description || ""
        }),
        r: (_e = detail.value.feedbackList) == null ? void 0 : _e.length
      }, ((_f = detail.value.feedbackList) == null ? void 0 : _f.length) ? {
        s: common_vendor.f(detail.value.feedbackList, (item, k0, i0) => {
          var _a2, _b2, _c2, _d2, _e2;
          return common_vendor.e({
            a: common_vendor.t(statusLabelMap[item.status]),
            b: common_vendor.n(`timeline-status-${item.status}`),
            c: common_vendor.t(item.createdAt),
            d: common_vendor.t(item.content),
            e: common_vendor.t(item.creatorNickname ? `记录人：${item.creatorNickname}` : "未登记记录人"),
            f: common_vendor.t(isEditingFeedback(item.id) ? "正在编辑" : "编辑反馈"),
            g: common_vendor.o(($event) => startEditFeedback(item), item.id),
            h: (_a2 = item.mediaList) == null ? void 0 : _a2.length
          }, ((_b2 = item.mediaList) == null ? void 0 : _b2.length) ? {
            i: common_vendor.t(mediaSummary(item.mediaList)),
            j: common_vendor.t(isFeedbackExpanded(item.id) ? "收起内容" : "点击查看"),
            k: common_vendor.o(($event) => toggleFeedbackMedia(item.id), item.id)
          } : {}, {
            l: isFeedbackExpanded(item.id) && ((_c2 = item.mediaList) == null ? void 0 : _c2.length)
          }, isFeedbackExpanded(item.id) && ((_d2 = item.mediaList) == null ? void 0 : _d2.length) ? {
            m: common_vendor.f(item.mediaList, (media, mediaIndex, i1) => {
              return common_vendor.e({
                a: media.mediaType === "image"
              }, media.mediaType === "image" ? {
                b: resolveMedia(media.fileUrl)
              } : media.thumbnailUrl ? {
                d: resolveMedia(media.thumbnailUrl)
              } : {}, {
                c: media.thumbnailUrl,
                e: common_vendor.t(media.mediaType === "video" ? "视频" : "图片"),
                f: `feedback_${item.id}_${media.id || mediaIndex}`,
                g: common_vendor.o(($event) => openViewer(item.mediaList, mediaIndex), `feedback_${item.id}_${media.id || mediaIndex}`)
              });
            })
          } : {}, {
            n: isEditingFeedback(item.id)
          }, isEditingFeedback(item.id) ? common_vendor.e({
            o: common_vendor.t(((_e2 = statusOptions[editingStatusIndex.value]) == null ? void 0 : _e2.label) || "请选择状态"),
            p: statusOptions,
            q: editingStatusIndex.value,
            r: common_vendor.o(handleEditingStatusChange, item.id),
            s: editingForm.content,
            t: common_vendor.o(($event) => editingForm.content = $event.detail.value, item.id),
            v: "9291e0d7-4-" + i0 + ",9291e0d7-3",
            w: common_vendor.p({
              label: "反馈内容"
            }),
            x: common_vendor.t(statusHintMap[editingForm.status]),
            y: common_vendor.n(`status-banner-${editingForm.status}`),
            z: common_vendor.o(chooseEditingImages, item.id),
            A: common_vendor.o(chooseEditingVideo, item.id),
            B: common_vendor.t(editingImageCount.value),
            C: common_vendor.t(editingVideoCount.value),
            D: editingMediaList.value.length
          }, editingMediaList.value.length ? {
            E: common_vendor.f(editingMediaList.value, (mediaItem, mediaIndex, i1) => {
              return common_vendor.e({
                a: mediaItem.mediaType === "image"
              }, mediaItem.mediaType === "image" ? {
                b: mediaItem.previewUrl,
                c: common_vendor.o(($event) => previewEditingImage(mediaItem), mediaItem.localId)
              } : mediaItem.previewUrl ? {
                e: mediaItem.previewUrl,
                f: common_vendor.o(($event) => openViewer(editingMediaList.value, mediaIndex), mediaItem.localId)
              } : {
                g: common_vendor.o(($event) => openViewer(editingMediaList.value, mediaIndex), mediaItem.localId)
              }, {
                d: mediaItem.previewUrl,
                h: common_vendor.t(mediaItem.mediaType === "image" ? "图片" : "视频"),
                i: common_vendor.o(($event) => removeEditingMedia(mediaIndex), mediaItem.localId),
                j: mediaItem.localId
              });
            })
          } : {}, {
            F: common_vendor.o(cancelEditFeedback, item.id),
            G: common_vendor.o(($event) => handleUpdateFeedback(item), item.id)
          }) : {}, {
            H: item.id
          });
        })
      } : {}, {
        t: common_vendor.p({
          title: "反馈记录"
        }),
        v: common_vendor.t(((_g = statusOptions[statusIndex.value]) == null ? void 0 : _g.label) || "请选择状态"),
        w: statusOptions,
        x: statusIndex.value,
        y: common_vendor.o(handleStatusChange, "0f"),
        z: feedbackForm.content,
        A: common_vendor.o(($event) => feedbackForm.content = $event.detail.value, "03"),
        B: common_vendor.p({
          label: "反馈内容"
        }),
        C: common_vendor.t(statusHintMap[feedbackForm.status]),
        D: common_vendor.n(`status-banner-${feedbackForm.status}`),
        E: common_vendor.o(chooseFeedbackImages, "a4"),
        F: common_vendor.o(chooseFeedbackVideo, "82"),
        G: common_vendor.t(feedbackImageCount.value),
        H: common_vendor.t(feedbackVideoCount.value),
        I: feedbackMediaList.value.length
      }, feedbackMediaList.value.length ? {
        J: common_vendor.f(feedbackMediaList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.mediaType === "image"
          }, item.mediaType === "image" ? {
            b: item.previewUrl,
            c: common_vendor.o(($event) => previewDraftImage(item), item.localId)
          } : item.previewUrl ? {
            e: item.previewUrl,
            f: common_vendor.o(($event) => openViewer(feedbackMediaList.value, index), item.localId)
          } : {
            g: common_vendor.o(($event) => openViewer(feedbackMediaList.value, index), item.localId)
          }, {
            d: item.previewUrl,
            h: common_vendor.t(item.mediaType === "image" ? "图片" : "视频"),
            i: common_vendor.o(($event) => removeFeedbackMedia(index), item.localId),
            j: item.localId
          });
        })
      } : {}, {
        K: common_vendor.o(goEdit, "d4"),
        L: common_vendor.o(handleDelete, "14"),
        M: common_vendor.o(handleAddFeedback, "12"),
        N: common_vendor.p({
          title: "新增反馈"
        })
      }) : {}, {
        O: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9291e0d7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/improvement/detail.js.map
