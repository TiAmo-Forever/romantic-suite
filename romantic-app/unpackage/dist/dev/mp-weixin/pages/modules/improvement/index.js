"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_improvementNotes = require("../../../services/improvement-notes.js");
const utils_auth = require("../../../utils/auth.js");
const utils_mediaUpload = require("../../../utils/media-upload.js");
const utils_nav = require("../../../utils/nav.js");
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
    const filters = [
      { key: "all", label: "全部" },
      { key: "resolved", label: "已改善" },
      { key: "improving", label: "跟进中" },
      { key: "pending", label: "待开始" }
    ];
    const targetLabelMap = {
      me: "我自己",
      lover: "对方感受",
      both: "共同努力"
    };
    const statusLabelMap = {
      resolved: "已改善",
      improving: "跟进中",
      pending: "待开始"
    };
    const statusToneMap = {
      resolved: "已经明显好转",
      improving: "还在慢慢靠近",
      pending: "准备开始行动"
    };
    const statusEmojiMap = {
      resolved: "✓",
      improving: "↗",
      pending: "…"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const activeFilter = common_vendor.ref("all");
    const noteList = common_vendor.ref([]);
    common_vendor.onShow(async () => {
      if (!utils_auth.requireAuth())
        return;
      await loadList();
    });
    async function loadList() {
      try {
        noteList.value = await services_improvementNotes.fetchImprovementNoteList(activeFilter.value);
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "获取改进记录失败", icon: "none" });
      }
    }
    async function switchFilter(filterKey) {
      if (activeFilter.value === filterKey)
        return;
      activeFilter.value = filterKey;
      await loadList();
    }
    function resolveStatusEmoji(status) {
      return statusEmojiMap[status] || statusEmojiMap.improving;
    }
    function resolveMedia(path) {
      return utils_mediaUpload.resolveMediaUrl(path);
    }
    function resolveElapsedLabel(item) {
      const baseDate = String((item == null ? void 0 : item.startDate) || (item == null ? void 0 : item.createdAt) || "").trim().slice(0, 10);
      if (!baseDate)
        return "刚刚开始";
      const target = /* @__PURE__ */ new Date(`${baseDate}T00:00:00`);
      if (Number.isNaN(target.getTime()))
        return "刚刚开始";
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.max(0, Math.floor((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1e3)));
      if (diff <= 0)
        return "今天开始";
      if (diff === 1)
        return "已过 1 天";
      return `已过 ${diff} 天`;
    }
    function resolveTodayFeedbackValue(item) {
      return `${Math.max(0, Number((item == null ? void 0 : item.todayFeedbackCount) || 0))} 次`;
    }
    function resolveTotalFeedbackValue(item) {
      return `${Math.max(0, Number((item == null ? void 0 : item.feedbackCount) || 0))} 次`;
    }
    function resolveTodayTrackingClass(item) {
      const today = Math.max(0, Number((item == null ? void 0 : item.todayFeedbackCount) || 0));
      return today > 0 ? "tracking-chip-active" : "tracking-chip-idle";
    }
    function mediaText(mediaList = []) {
      const imageCount = mediaList.filter((item) => item.mediaType === "image").length;
      const videoCount = mediaList.filter((item) => item.mediaType === "video").length;
      const parts = [];
      if (imageCount)
        parts.push(`${imageCount} 张图片`);
      if (videoCount)
        parts.push(`${videoCount} 个视频`);
      return parts.join(" · ") || "媒体";
    }
    function goCreate() {
      utils_nav.goPage("/pages/modules/improvement/edit");
    }
    function openDetail(id) {
      utils_nav.goPage(`/pages/modules/improvement/detail?id=${id}`);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "恋爱改进簿",
          eyebrow: "记录列表"
        }),
        b: common_vendor.o(goCreate, "fd"),
        c: common_vendor.f(filters, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.key,
            c: activeFilter.value === item.key ? 1 : "",
            d: common_vendor.o(($event) => switchFilter(item.key), item.key)
          };
        }),
        d: noteList.value.length
      }, noteList.value.length ? {
        e: common_vendor.f(noteList.value, (item, k0, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: common_vendor.t(resolveStatusEmoji(item.status)),
            b: common_vendor.t(statusLabelMap[item.status]),
            c: common_vendor.n(`note-status-ribbon-${item.status}`),
            d: common_vendor.t(item.title),
            e: common_vendor.t(targetLabelMap[item.targetType]),
            f: common_vendor.t(item.startDate || "未设置开始日期"),
            g: common_vendor.t(resolveElapsedLabel(item)),
            h: common_vendor.t(resolveTodayFeedbackValue(item)),
            i: common_vendor.n(resolveTodayTrackingClass(item)),
            j: common_vendor.t(resolveTotalFeedbackValue(item)),
            k: common_vendor.t(item.latestFeedback || "还没有反馈"),
            l: (_a = item.mediaList) == null ? void 0 : _a.length
          }, ((_b = item.mediaList) == null ? void 0 : _b.length) ? common_vendor.e({
            m: item.mediaList[0].mediaType === "image"
          }, item.mediaList[0].mediaType === "image" ? {
            n: resolveMedia(item.mediaList[0].fileUrl)
          } : item.mediaList[0].thumbnailUrl ? {
            p: resolveMedia(item.mediaList[0].thumbnailUrl)
          } : {}, {
            o: item.mediaList[0].thumbnailUrl,
            q: common_vendor.t(mediaText(item.mediaList))
          }) : {}, {
            r: common_vendor.t(statusToneMap[item.status]),
            s: common_vendor.t(item.creatorNickname ? `记录人：${item.creatorNickname}` : "未登记记录人"),
            t: item.id,
            v: common_vendor.n(`note-card-${item.status}`),
            w: common_vendor.o(($event) => openDetail(item.id), item.id)
          });
        })
      } : {}, {
        f: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f3d87f1a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/improvement/index.js.map
