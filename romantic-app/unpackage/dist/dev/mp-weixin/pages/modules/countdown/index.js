"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_auth = require("../../../utils/auth.js");
const utils_area = require("../../../utils/area.js");
const utils_nav = require("../../../utils/nav.js");
const services_countdown = require("../../../services/countdown.js");
const utils_useThemePage = require("../../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const countdown = common_vendor.reactive({ days: "00", hours: "00", minutes: "00", seconds: "00" });
    const meetingPlan = common_vendor.reactive({ loverName: "", place: "", note: "", nextMeetingAt: "", lastMeetingAt: "", isAllDay: false });
    const form = common_vendor.reactive({ loverName: "", place: "", note: "", nextDate: "", nextTime: "00:00", lastDate: "", isAllDay: false });
    const hearts = common_vendor.ref([]);
    const currentTime = common_vendor.ref(Date.now());
    let timer = null;
    let heartTimer = null;
    let heartId = 1;
    let screenWidth = 375;
    let screenHeight = 667;
    const heartTexts = ["❤", "💕", "💗", "💖", "💘", "💞"];
    const heartColors = ["#ff4d6d", "#ff5e7d", "#ff85a1", "#ff99ac", "#ffb3c1", "#ffc2d1"];
    const switchColor = common_vendor.computed(() => getComputedStyleSafe("--app-color-primary", "#ff7ea6"));
    const nextMeetingDate = common_vendor.computed(() => parseDateTime(meetingPlan.nextMeetingAt));
    const lastMeetingDate = common_vendor.computed(() => parseDateTime(meetingPlan.lastMeetingAt));
    const meetingStatus = common_vendor.computed(() => {
      const nextDate = nextMeetingDate.value;
      if (!nextDate)
        return "unknown";
      const diff = nextDate.getTime() - currentTime.value;
      if (diff > 0) {
        if (diff <= 24 * 60 * 60 * 1e3)
          return "today";
        if (diff <= 7 * 24 * 60 * 60 * 1e3)
          return "soon";
        return "waiting";
      }
      if (isSameDay(nextDate, new Date(currentTime.value)))
        return "today";
      return "passed";
    });
    const nextMeetingDateText = common_vendor.computed(() => formatDateText(nextMeetingDate.value));
    const nextMeetingClockText = common_vendor.computed(() => formatTimeText(nextMeetingDate.value, meetingPlan.isAllDay));
    const lastMeetingText = common_vendor.computed(() => formatDateText(lastMeetingDate.value));
    const heroBadge = common_vendor.computed(() => ({ waiting: "满心期待", soon: "很快就见面", today: "今天就相见", passed: "该约下一次啦", unknown: "等待设定" })[meetingStatus.value]);
    const heroTitle = common_vendor.computed(() => meetingStatus.value === "today" ? "今天见面" : meetingStatus.value === "passed" ? "请设置下一次见面" : `${meetingPlan.loverName || "TA"} 的见面计划`);
    const heroDesc = common_vendor.computed(() => meetingPlan.note || "请填写见面计划");
    const countdownItems = common_vendor.computed(() => [{ label: "天", value: countdown.days }, { label: "时", value: countdown.hours }, { label: "分", value: countdown.minutes }, { label: "秒", value: countdown.seconds }]);
    const daysSinceLast = common_vendor.computed(() => {
      const lastDate = startOfDay(lastMeetingDate.value);
      const today = startOfDay(new Date(currentTime.value));
      if (!lastDate || !today)
        return 0;
      return Math.max(0, Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1e3)));
    });
    const progressPercent = common_vendor.computed(() => {
      var _a, _b, _c;
      const start = (_a = startOfDay(lastMeetingDate.value)) == null ? void 0 : _a.getTime();
      const end = (_b = startOfDay(nextMeetingDate.value)) == null ? void 0 : _b.getTime();
      const today = (_c = startOfDay(new Date(currentTime.value))) == null ? void 0 : _c.getTime();
      if (!start || !end || !today || end <= start)
        return 0;
      const percent = (today - start) / (end - start) * 100;
      return Math.max(0, Math.min(100, Math.round(percent)));
    });
    const progressText = common_vendor.computed(() => meetingStatus.value === "passed" ? "本次计划已结束" : meetingStatus.value === "today" ? "今天见面" : `当前进度 ${progressPercent.value}%`);
    const stageMessage = common_vendor.computed(() => meetingStatus.value === "passed" ? "请设置下一次见面计划" : meetingStatus.value === "today" ? "今天见面" : meetingStatus.value === "soon" ? "即将见面" : "等待见面");
    function getComputedStyleSafe(name, fallback) {
      if (typeof window === "undefined" || typeof getComputedStyle === "undefined")
        return fallback;
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    }
    function pad(num) {
      return String(num).padStart(2, "0");
    }
    function splitDateTime(value) {
      const [date = "", time = "00:00"] = String(value || "").split(" ");
      return { date, time: time.slice(0, 5) || "00:00" };
    }
    function parseDateTime(value) {
      if (!value)
        return null;
      const date = new Date(String(value).replace(" ", "T"));
      return Number.isNaN(date.getTime()) ? null : date;
    }
    function formatDateText(date) {
      return date ? `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日` : "暂未设置";
    }
    function formatTimeText(date, isAllDay = false) {
      if (!date)
        return "等待设置时间";
      return isAllDay ? "全天见面" : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
    function buildDateTime(date, time, isAllDay = false) {
      return `${date} ${isAllDay ? "00:00" : time}`;
    }
    function isSameDay(dateA, dateB) {
      return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
    }
    function startOfDay(date) {
      if (!date)
        return null;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    function applyPlan(plan) {
      Object.assign(meetingPlan, { loverName: plan.loverName, place: plan.place, note: plan.note, nextMeetingAt: plan.nextMeetingAt, lastMeetingAt: plan.lastMeetingAt, isAllDay: !!plan.isAllDay });
      const nextParts = splitDateTime(plan.nextMeetingAt);
      const lastParts = splitDateTime(plan.lastMeetingAt);
      Object.assign(form, { loverName: plan.loverName, place: plan.place, note: plan.note, nextDate: nextParts.date, nextTime: nextParts.time, lastDate: lastParts.date, isAllDay: !!plan.isAllDay });
    }
    async function loadPlan() {
      try {
        applyPlan(await services_countdown.fetchSharedCountdownPlan());
        updateCountdown();
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "见面计划加载失败", icon: "none" });
      }
    }
    function updateCountdown() {
      currentTime.value = Date.now();
      const nextDate = nextMeetingDate.value;
      if (!nextDate)
        return Object.assign(countdown, { days: "00", hours: "00", minutes: "00", seconds: "00" });
      let diff = nextDate.getTime() - currentTime.value;
      if (diff < 0)
        diff = 0;
      countdown.days = pad(Math.floor(diff / (1e3 * 60 * 60 * 24)));
      countdown.hours = pad(Math.floor(diff / (1e3 * 60 * 60) % 24));
      countdown.minutes = pad(Math.floor(diff / (1e3 * 60) % 60));
      countdown.seconds = pad(Math.floor(diff / 1e3 % 60));
    }
    function random(min, max) {
      return Math.random() * (max - min) + min;
    }
    function initSystemInfo() {
      try {
        const info = common_vendor.index.getSystemInfoSync();
        screenWidth = info.windowWidth || 375;
        screenHeight = info.windowHeight || 667;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/modules/countdown/index.vue:205", "获取系统信息失败", error);
      }
    }
    function createHeart(x = null, y = null) {
      const left = x !== null ? x : random(30, screenWidth - 30);
      const bottom = y !== null ? y : random(20, 120);
      const item = { id: heartId++, left: Math.max(10, Math.min(left, screenWidth - 30)), bottom, size: random(18, 42), duration: random(3.2, 5.5), drift: random(-40, 40), rotate: random(-25, 25), text: heartTexts[Math.floor(Math.random() * heartTexts.length)], color: heartColors[Math.floor(Math.random() * heartColors.length)] };
      hearts.value.push(item);
      setTimeout(() => {
        hearts.value = hearts.value.filter((value) => value.id !== item.id);
      }, item.duration * 1e3);
    }
    function getHeartStyle(heart) {
      return { left: `${heart.left}px`, bottom: `${heart.bottom}px`, fontSize: `${heart.size}px`, color: heart.color, "--float-x": `${heart.drift}px`, "--float-y": `${screenHeight - heart.bottom + 50}px`, "--rotate-deg": `${heart.rotate}deg`, "--duration": `${heart.duration}s` };
    }
    function handlePageTap(event) {
      var _a, _b;
      const x = (_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.x;
      const y = (_b = event == null ? void 0 : event.detail) == null ? void 0 : _b.y;
      if (typeof x !== "number" || typeof y !== "number")
        return;
      const bottomY = screenHeight - y;
      for (let i = 0; i < 4; i += 1)
        setTimeout(() => createHeart(x + random(-18, 18), bottomY + random(-18, 18)), i * 60);
    }
    function handleNextDateChange(event) {
      form.nextDate = event.detail.value;
    }
    function handleNextTimeChange(event) {
      form.nextTime = event.detail.value;
    }
    function handleLastDateChange(event) {
      form.lastDate = event.detail.value;
    }
    function handleAllDayChange(event) {
      form.isAllDay = !!event.detail.value;
    }
    function openPlacePicker() {
      utils_nav.goPage(utils_area.buildAreaPickerUrl("countdown_place", { value: form.place || "" }));
    }
    async function handleSave() {
      if (!form.nextDate || !form.lastDate)
        return void common_vendor.index.showToast({ title: "请先把见面日期补完整", icon: "none" });
      const nextMeetingAt = buildDateTime(form.nextDate, form.nextTime, form.isAllDay);
      const lastMeetingAt = form.lastDate;
      const nextDate = parseDateTime(nextMeetingAt);
      const lastDate = parseDateTime(`${lastMeetingAt} 00:00`);
      if (!nextDate || !lastDate)
        return void common_vendor.index.showToast({ title: "日期格式不正确", icon: "none" });
      if (nextDate.getTime() <= lastDate.getTime())
        return void common_vendor.index.showToast({ title: "下次见面要晚于上次见面", icon: "none" });
      try {
        const payload = await services_countdown.updateSharedCountdownPlan({
          loverName: (form.loverName || "宝贝").trim() || "宝贝",
          place: (form.place || "未设置地点").trim() || "未设置地点",
          note: (form.note || "").trim(),
          nextMeetingAt,
          lastMeetingAt,
          isAllDay: form.isAllDay
        });
        applyPlan(payload);
        updateCountdown();
        common_vendor.index.showToast({ title: "见面计划已保存", icon: "success" });
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "见面计划保存失败", icon: "none" });
      }
    }
    async function handleReset() {
      try {
        const payload = await services_countdown.resetSharedCountdownPlan();
        applyPlan(payload);
        updateCountdown();
        common_vendor.index.showToast({ title: "已恢复默认计划", icon: "none" });
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "恢复默认计划失败", icon: "none" });
      }
    }
    function goBack() {
      utils_nav.backPage();
    }
    common_vendor.onShow(() => {
      const draft = utils_area.getAreaDraft("countdown_place");
      if (draft) {
        form.place = draft.displayText || draft.mergerName || draft.name || "";
        utils_area.clearAreaDraft("countdown_place");
        return;
      }
      if (utils_auth.requireAuth()) {
        loadPlan();
      }
    });
    common_vendor.onMounted(() => {
      if (!utils_auth.requireAuth())
        return;
      initSystemInfo();
      timer = setInterval(updateCountdown, 1e3);
      heartTimer = setInterval(createHeart, 1200);
    });
    common_vendor.onUnmounted(() => {
      if (timer)
        clearInterval(timer);
      if (heartTimer)
        clearInterval(heartTimer);
      hearts.value = [];
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(hearts.value, (heart, k0, i0) => {
          return {
            a: common_vendor.t(heart.text),
            b: heart.id,
            c: common_vendor.s(getHeartStyle(heart))
          };
        }),
        b: common_vendor.o(goBack, "42"),
        c: common_vendor.o(handleReset, "8d"),
        d: common_vendor.o(() => {
        }, "86"),
        e: common_vendor.t(heroBadge.value),
        f: common_vendor.t(nextMeetingDateText.value),
        g: common_vendor.t(nextMeetingClockText.value),
        h: common_vendor.t(meetingPlan.place || "还没有设置地点"),
        i: common_vendor.t(heroTitle.value),
        j: common_vendor.t(heroDesc.value),
        k: common_vendor.f(countdownItems.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.value),
            b: common_vendor.t(item.label),
            c: item.label
          };
        }),
        l: common_vendor.t(stageMessage.value),
        m: common_vendor.t(lastMeetingText.value),
        n: common_vendor.t(daysSinceLast.value),
        o: common_vendor.t(progressPercent.value),
        p: `${progressPercent.value}%`,
        q: common_vendor.t(progressText.value),
        r: form.loverName,
        s: common_vendor.o(($event) => form.loverName = $event.detail.value, "21"),
        t: common_vendor.t(form.place || "请选择或填写见面地点"),
        v: common_vendor.o(openPlacePicker, "cd"),
        w: common_vendor.t(form.nextDate),
        x: form.nextDate,
        y: common_vendor.o(handleNextDateChange, "84"),
        z: !form.isAllDay
      }, !form.isAllDay ? {
        A: common_vendor.t(form.nextTime),
        B: form.nextTime,
        C: common_vendor.o(handleNextTimeChange, "6c")
      } : {}, {
        D: form.isAllDay,
        E: switchColor.value,
        F: common_vendor.o(handleAllDayChange, "da"),
        G: common_vendor.t(form.lastDate),
        H: form.lastDate,
        I: common_vendor.o(handleLastDateChange, "e7"),
        J: form.note,
        K: common_vendor.o(($event) => form.note = $event.detail.value, "a3"),
        L: common_vendor.o(handleSave, "3a"),
        M: common_vendor.o(() => {
        }, "0c"),
        N: common_vendor.s(common_vendor.unref(themeStyle)),
        O: common_vendor.o(handlePageTap, "2e")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-93ae544c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/countdown/index.js.map
