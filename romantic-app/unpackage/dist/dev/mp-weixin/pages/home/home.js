"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_nav = require("../../utils/nav.js");
const utils_useThemePage = require("../../utils/useThemePage.js");
const services_countdown = require("../../services/countdown.js");
const services_anniversaries = require("../../services/anniversaries.js");
const services_improvementNotes = require("../../services/improvement-notes.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  BottomTab();
}
const BottomTab = () => "../components/BottomTab.js";
const DAY_MS = 24 * 60 * 60 * 1e3;
const _sfc_main = {
  __name: "home",
  setup(__props) {
    const TEXT = {
      brandKicker: "首页主站",
      brand: "爱意成笺",
      brandSub: "把喜欢写进每天的小日子",
      brandIcon: "✉",
      countdownKicker: "距离下次见面",
      dayUnit: "天",
      anniversaryTitle: "恋爱纪念日",
      anniversaryShort: "纪念日",
      improvementTitle: "恋爱改进簿",
      improvementShort: "改进簿",
      improvementPrefix: "本周待改进",
      improvementSuffix: "项",
      memoTitle: "今日小记",
      memoAdd: "添加",
      albumTitle: "甜蜜相册",
      moreTitle: "更多功能"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const countdownPlan = common_vendor.reactive({
      nextMeetingAt: "",
      note: "",
      place: "",
      loverName: ""
    });
    const anniversaryState = common_vendor.reactive({
      days: 0,
      label: "把纪念感好好留下来",
      meta: "日期待设置"
    });
    const improvementState = common_vendor.reactive({
      pendingCount: 0,
      activeCount: 0
    });
    const memoState = common_vendor.reactive({
      content: "记录今日的心情与点滴，让每一天都有被认真收藏。",
      meta: "今日可记录"
    });
    const countdownSummary = common_vendor.computed(() => {
      const nextDate = parseDateTime(countdownPlan.nextMeetingAt);
      if (!nextDate) {
        return {
          days: "00",
          caption: "把下一次见面的日子定下来吧"
        };
      }
      const today = startOfDay(/* @__PURE__ */ new Date());
      const target = startOfDay(nextDate);
      const days = Math.max(0, Math.ceil((target.getTime() - today.getTime()) / DAY_MS));
      return {
        days: String(days).padStart(2, "0"),
        caption: days === 0 ? "今天就能见到啦" : days <= 7 ? "很快就能见到啦" : countdownPlan.note || "一起把期待慢慢攒满"
      };
    });
    const anniversarySummary = common_vendor.computed(() => ({
      days: String(Math.max(anniversaryState.days, 0)),
      label: anniversaryState.label || "把纪念感好好留下来",
      meta: anniversaryState.meta || "日期待设置"
    }));
    const improvementSummary = common_vendor.computed(() => {
      if (improvementState.pendingCount > 0) {
        return {
          count: improvementState.pendingCount,
          tagText: "持续跟进中",
          tagClass: "status-badge-warn"
        };
      }
      if (improvementState.activeCount > 0) {
        return {
          count: improvementState.activeCount,
          tagText: "本周有进展",
          tagClass: "status-badge-soft"
        };
      }
      return {
        count: 0,
        tagText: "状态平稳",
        tagClass: "status-badge-quiet"
      };
    });
    const memoSummary = common_vendor.computed(() => ({
      content: memoState.content,
      meta: memoState.meta
    }));
    function parseDateTime(value) {
      if (!value)
        return null;
      const date = new Date(String(value).replace(" ", "T"));
      return Number.isNaN(date.getTime()) ? null : date;
    }
    function startOfDay(date) {
      if (!date)
        return null;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    function formatMonthDay(date) {
      if (!date)
        return "";
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}-${day}`;
    }
    function formatDate(date) {
      if (!date)
        return "日期待设置";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    async function loadHomeSummary() {
      try {
        const [countdown, anniversaries, notes] = await Promise.all([
          services_countdown.fetchSharedCountdownPlan(),
          services_anniversaries.fetchAnniversaryList("all"),
          services_improvementNotes.fetchImprovementNoteList("all")
        ]);
        Object.assign(countdownPlan, {
          nextMeetingAt: (countdown == null ? void 0 : countdown.nextMeetingAt) || "",
          note: (countdown == null ? void 0 : countdown.note) || "",
          place: (countdown == null ? void 0 : countdown.place) || "",
          loverName: (countdown == null ? void 0 : countdown.loverName) || ""
        });
        const anniversary = Array.isArray(anniversaries) ? anniversaries[0] : null;
        if (anniversary) {
          const eventDate = parseDateTime(anniversary.eventDate || "");
          anniversaryState.days = Math.abs(Number(anniversary.dayOffset || 0));
          anniversaryState.label = String(anniversary.title || anniversary.name || "把纪念感好好留下来").trim();
          anniversaryState.meta = formatDate(eventDate);
        } else {
          anniversaryState.days = 0;
          anniversaryState.label = "还没有设置纪念日";
          anniversaryState.meta = "日期待设置";
        }
        const list = Array.isArray(notes) ? notes : [];
        improvementState.pendingCount = list.filter((item) => ["pending", "improving"].includes(String(item.status || "").trim())).length;
        improvementState.activeCount = list.length;
        if (countdown == null ? void 0 : countdown.note) {
          memoState.content = countdown.note;
          memoState.meta = `${formatMonthDay(parseDateTime(countdown.nextMeetingAt)) || "今日"} · 关于见面的期待`;
        } else if (anniversary) {
          memoState.content = String(anniversary.description || anniversary.summary || anniversary.title || "").trim() || "今天也值得留下一个温柔的小记。";
          memoState.meta = `${formatMonthDay(parseDateTime(anniversary.eventDate || "")) || "今日"} · 纪念感进行中`;
        } else {
          memoState.content = "今天也值得留下一个温柔的小记。";
          memoState.meta = "今日 · 适合记录心情";
        }
      } catch (error) {
        memoState.content = "把今天的心情记下来，下一次回头看也会觉得很温柔。";
        memoState.meta = "离线展示";
      }
    }
    function goCountdown() {
      utils_nav.goPage("/pages/modules/countdown/index");
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
    function goMemo() {
      utils_nav.goPage("/pages/modules/coming-soon/index?title=" + encodeURIComponent("今日小记"));
    }
    function goPlanet() {
      utils_nav.goPage("/pages/planet/planet");
    }
    function goSettings() {
      utils_nav.goPage("/pages/account/settings");
    }
    common_vendor.onMounted(() => {
      utils_auth.requireAuth();
    });
    common_vendor.onShow(() => {
      if (utils_auth.requireAuth()) {
        loadHomeSummary();
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(TEXT.brandKicker),
        b: common_vendor.t(TEXT.brand),
        c: common_vendor.t(TEXT.brandSub),
        d: common_vendor.t(TEXT.brandIcon),
        e: common_vendor.o(goSettings, "69"),
        f: common_vendor.t(TEXT.countdownKicker),
        g: common_vendor.t(countdownSummary.value.days),
        h: common_vendor.t(TEXT.dayUnit),
        i: common_vendor.t(countdownSummary.value.caption),
        j: common_vendor.o(goCountdown, "7c"),
        k: common_vendor.t(TEXT.anniversaryTitle),
        l: common_vendor.t(anniversarySummary.value.days),
        m: common_vendor.t(TEXT.dayUnit),
        n: common_vendor.t(anniversarySummary.value.label),
        o: common_vendor.t(anniversarySummary.value.meta),
        p: common_vendor.o(goAnniversary, "41"),
        q: common_vendor.t(TEXT.improvementTitle),
        r: common_vendor.t(TEXT.improvementPrefix),
        s: common_vendor.t(improvementSummary.value.count),
        t: common_vendor.t(TEXT.improvementSuffix),
        v: common_vendor.t(improvementSummary.value.tagText),
        w: common_vendor.n(improvementSummary.value.tagClass),
        x: common_vendor.o(goImprovement, "7d"),
        y: common_vendor.t(TEXT.memoTitle),
        z: common_vendor.t(TEXT.memoAdd),
        A: common_vendor.o(goMemo, "a1"),
        B: common_vendor.t(memoSummary.value.content),
        C: common_vendor.t(memoSummary.value.meta),
        D: common_vendor.t(TEXT.albumTitle),
        E: common_vendor.o(goAlbum, "2a"),
        F: common_vendor.t(TEXT.anniversaryShort),
        G: common_vendor.o(goAnniversary, "c4"),
        H: common_vendor.t(TEXT.improvementShort),
        I: common_vendor.o(goImprovement, "76"),
        J: common_vendor.t(TEXT.moreTitle),
        K: common_vendor.o(goPlanet, "80"),
        L: common_vendor.p({
          activeKey: "home"
        }),
        M: common_vendor.s(common_vendor.unref(themeStyle))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
