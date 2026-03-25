"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_anniversaries = require("../../../services/anniversaries.js");
const utils_auth = require("../../../utils/auth.js");
const utils_area = require("../../../utils/area.js");
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
    const { themeStyle } = utils_useThemePage.useThemePage();
    const instance = common_vendor.getCurrentInstance();
    const eventId = common_vendor.ref("");
    const form = common_vendor.reactive({
      title: "",
      type: "custom",
      eventDate: "",
      location: "",
      description: "",
      reminderType: "none"
    });
    const typeOptions = [
      { key: "custom", label: "自定义" },
      { key: "meet", label: "第一次见面" },
      { key: "love", label: "确认关系" },
      { key: "travel", label: "第一次旅行" },
      { key: "birthday", label: "生日" }
    ];
    const reminderOptions = [
      { key: "none", label: "不提醒" },
      { key: "on_day", label: "当天提醒" },
      { key: "one_day_before", label: "提前 1 天" },
      { key: "three_days_before", label: "提前 3 天" }
    ];
    const typeIndex = common_vendor.ref(0);
    const reminderIndex = common_vendor.ref(0);
    const mediaList = common_vendor.ref([]);
    const dragState = common_vendor.reactive({
      dragging: false,
      activeIndex: -1,
      targetIndex: -1,
      reboundIndex: -1,
      containerTop: 0,
      itemHeight: 0
    });
    const pageTitle = common_vendor.computed(() => eventId.value ? "编辑纪念日" : "新增纪念日");
    const imageCount = common_vendor.computed(() => mediaList.value.filter((item) => item.mediaType === "image").length);
    const videoCount = common_vendor.computed(() => mediaList.value.filter((item) => item.mediaType === "video").length);
    common_vendor.onLoad(async (options) => {
      if (!utils_auth.requireAuth())
        return;
      eventId.value = (options == null ? void 0 : options.id) || "";
      if (eventId.value) {
        await loadDetail(eventId.value);
      }
    });
    common_vendor.onShow(() => {
      const draft = utils_area.getAreaDraft("anniversary_location");
      if (!draft)
        return;
      form.location = draft.displayText || draft.mergerName || draft.name || "";
      utils_area.clearAreaDraft("anniversary_location");
    });
    async function loadDetail(id) {
      try {
        const detail = await services_anniversaries.fetchAnniversaryDetail(id);
        form.title = detail.title || "";
        form.type = detail.type || "custom";
        form.eventDate = detail.eventDate || "";
        form.location = detail.location || "";
        form.description = detail.description || "";
        form.reminderType = detail.reminderType || "none";
        typeIndex.value = Math.max(typeOptions.findIndex((item) => item.key === form.type), 0);
        reminderIndex.value = Math.max(reminderOptions.findIndex((item) => item.key === form.reminderType), 0);
        mediaList.value = (detail.mediaList || []).map((item) => ({
          localId: `remote_${item.id}`,
          id: item.id,
          mediaType: item.mediaType,
          fileUrl: item.fileUrl,
          thumbnailUrl: item.thumbnailUrl,
          previewUrl: utils_mediaUpload.resolveMediaUrl(item.fileUrl),
          localPath: ""
        }));
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "纪念日详情加载失败", icon: "none" });
      }
    }
    function handleTypeChange(event) {
      var _a;
      typeIndex.value = Number(event.detail.value || 0);
      form.type = ((_a = typeOptions[typeIndex.value]) == null ? void 0 : _a.key) || "custom";
    }
    function handleReminderChange(event) {
      var _a;
      reminderIndex.value = Number(event.detail.value || 0);
      form.reminderType = ((_a = reminderOptions[reminderIndex.value]) == null ? void 0 : _a.key) || "none";
    }
    function handleDateChange(event) {
      form.eventDate = event.detail.value;
    }
    function openLocationPicker() {
      utils_nav.goPage(utils_area.buildAreaPickerUrl("anniversary_location", {
        value: form.location || ""
      }));
    }
    async function chooseImages() {
      const remain = 10 - imageCount.value;
      if (remain <= 0) {
        common_vendor.index.showToast({ title: "图片最多 10 张", icon: "none" });
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
            localPath: preparedPath
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
        common_vendor.index.showToast({ title: "视频最多 1 个", icon: "none" });
        return;
      }
      try {
        const result = await new Promise((resolve, reject) => {
          common_vendor.index.chooseVideo({
            sourceType: ["album", "camera"],
            success: resolve,
            fail: reject
          });
        });
        mediaList.value.push({
          localId: `local_${Date.now()}_${Math.random()}`,
          mediaType: "video",
          fileUrl: "",
          thumbnailUrl: "",
          previewUrl: result.tempFilePath,
          localPath: result.tempFilePath
        });
      } catch (error) {
        if (error == null ? void 0 : error.message) {
          common_vendor.index.showToast({ title: error.message, icon: "none" });
        }
      }
    }
    function removeMedia(index) {
      mediaList.value.splice(index, 1);
      finishDrag();
    }
    function previewEditImage(currentItem) {
      if ((currentItem == null ? void 0 : currentItem.mediaType) !== "image")
        return;
      const imageUrls = mediaList.value.filter((item) => item.mediaType === "image").map((item) => item.previewUrl).filter(Boolean);
      if (!imageUrls.length || !currentItem.previewUrl)
        return;
      utils_imagePreview.previewImages(imageUrls, currentItem.previewUrl);
    }
    function startDrag(index) {
      if (mediaList.value.length < 2)
        return;
      dragState.reboundIndex = -1;
      dragState.dragging = true;
      dragState.activeIndex = index;
      dragState.targetIndex = index;
      common_vendor.nextTick$1(() => {
        const query = common_vendor.index.createSelectorQuery().in(instance == null ? void 0 : instance.proxy);
        query.select(".sort-list").boundingClientRect();
        query.select(".sort-item").boundingClientRect();
        query.exec((result) => {
          const listRect = result == null ? void 0 : result[0];
          const itemRect = result == null ? void 0 : result[1];
          if (!listRect || !itemRect) {
            finishDrag();
            return;
          }
          dragState.containerTop = listRect.top;
          dragState.itemHeight = itemRect.height + 12;
          if (typeof common_vendor.index.vibrateShort === "function") {
            common_vendor.index.vibrateShort({ type: "light" });
          }
        });
      });
    }
    function handleDragMove(event) {
      var _a, _b;
      if (!dragState.dragging || dragState.itemHeight <= 0)
        return;
      const touch = ((_a = event.touches) == null ? void 0 : _a[0]) || ((_b = event.changedTouches) == null ? void 0 : _b[0]);
      if (!touch)
        return;
      const relativeY = touch.clientY - dragState.containerTop;
      const maxIndex = mediaList.value.length - 1;
      const nextIndex = Math.max(0, Math.min(maxIndex, Math.floor(relativeY / dragState.itemHeight)));
      if (nextIndex === dragState.activeIndex)
        return;
      moveMedia(dragState.activeIndex, nextIndex);
      dragState.activeIndex = nextIndex;
      dragState.targetIndex = nextIndex;
    }
    function finishDrag() {
      const finishedIndex = dragState.activeIndex;
      dragState.dragging = false;
      dragState.activeIndex = -1;
      dragState.targetIndex = -1;
      dragState.containerTop = 0;
      dragState.itemHeight = 0;
      if (finishedIndex >= 0) {
        dragState.reboundIndex = finishedIndex;
        setTimeout(() => {
          if (dragState.reboundIndex === finishedIndex) {
            dragState.reboundIndex = -1;
          }
        }, 220);
      }
    }
    function moveMedia(fromIndex, toIndex) {
      if (fromIndex === toIndex)
        return;
      const nextList = [...mediaList.value];
      const [movedItem] = nextList.splice(fromIndex, 1);
      nextList.splice(toIndex, 0, movedItem);
      mediaList.value = nextList;
    }
    async function handleSave() {
      if (!form.title.trim()) {
        common_vendor.index.showToast({ title: "请先填写纪念日标题", icon: "none" });
        return;
      }
      if (!form.eventDate) {
        common_vendor.index.showToast({ title: "请选择纪念日日期", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "正在保存", mask: true });
        const uploadedMedia = [];
        for (let index = 0; index < mediaList.value.length; index += 1) {
          const item = mediaList.value[index];
          let fileUrl = item.fileUrl;
          if (item.localPath) {
            fileUrl = await utils_mediaUpload.uploadAnniversaryMedia(item.localPath);
          }
          uploadedMedia.push({
            mediaType: item.mediaType,
            fileUrl,
            thumbnailUrl: item.thumbnailUrl || "",
            sortOrder: index
          });
        }
        const payload = {
          title: form.title.trim(),
          type: form.type,
          eventDate: form.eventDate,
          location: form.location.trim(),
          description: form.description.trim(),
          reminderType: form.reminderType,
          mediaList: uploadedMedia
        };
        if (eventId.value) {
          await services_anniversaries.updateAnniversary(eventId.value, payload);
        } else {
          await services_anniversaries.createAnniversary(payload);
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "纪念日已保存", icon: "success" });
        setTimeout(() => utils_nav.backPage(), 250);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "纪念日保存失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: common_vendor.p({
          title: pageTitle.value,
          eyebrow: "纪念日编辑"
        }),
        b: form.title,
        c: common_vendor.o(($event) => form.title = $event.detail.value, "69"),
        d: common_vendor.p({
          label: "纪念日标题"
        }),
        e: common_vendor.t(((_a = typeOptions[typeIndex.value]) == null ? void 0 : _a.label) || "请选择类型"),
        f: typeOptions,
        g: typeIndex.value,
        h: common_vendor.o(handleTypeChange, "63"),
        i: common_vendor.p({
          label: "纪念日类型"
        }),
        j: common_vendor.t(form.eventDate || "请选择日期"),
        k: form.eventDate,
        l: common_vendor.o(handleDateChange, "89"),
        m: common_vendor.p({
          label: "日期"
        }),
        n: common_vendor.t(form.location || "请选择或填写地点"),
        o: common_vendor.o(openLocationPicker, "8a"),
        p: common_vendor.p({
          label: "地点"
        }),
        q: form.description,
        r: common_vendor.o(($event) => form.description = $event.detail.value, "8c"),
        s: common_vendor.p({
          label: "文字说明"
        }),
        t: common_vendor.t(((_b = reminderOptions[reminderIndex.value]) == null ? void 0 : _b.label) || "请选择提醒方式"),
        v: reminderOptions,
        w: reminderIndex.value,
        x: common_vendor.o(handleReminderChange, "a0"),
        y: common_vendor.p({
          label: "提醒设置"
        }),
        z: common_vendor.p({
          title: "基础信息"
        }),
        A: common_vendor.o(chooseImages, "85"),
        B: common_vendor.o(chooseVideo, "80"),
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
            f: common_vendor.t(index + 1),
            g: index === 0
          }, index === 0 ? {} : {}, {
            h: common_vendor.t(item.mediaType === "image" ? "长按排序" : "视频排序"),
            i: common_vendor.o(($event) => removeMedia(index), item.localId),
            j: item.localId,
            k: dragState.dragging && dragState.activeIndex === index ? 1 : "",
            l: dragState.dragging && dragState.activeIndex !== index ? 1 : "",
            m: dragState.reboundIndex === index ? 1 : "",
            n: common_vendor.o(($event) => startDrag(index), item.localId)
          });
        }),
        G: common_vendor.o(handleDragMove, "1f"),
        H: common_vendor.o(finishDrag, "66"),
        I: common_vendor.o(finishDrag, "d7")
      } : {}, {
        J: common_vendor.p({
          title: "图片与视频"
        }),
        K: common_vendor.o(handleSave, "0e"),
        L: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6de94c79"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/anniversary/edit.js.map
