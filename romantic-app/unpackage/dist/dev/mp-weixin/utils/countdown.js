"use strict";
const common_vendor = require("../common/vendor.js");
const utils_profile = require("./profile.js");
const COUNTDOWN_PLAN_KEY = "romantic_countdown_plan";
function createDefaultPlan() {
  const profile = utils_profile.getProfile();
  return {
    loverName: profile.loverNickname || profile.nickname || "未设置称呼",
    place: profile.defaultMeetingPlace || profile.city || "上海",
    note: "一起吃那家想念很久的晚餐，然后牵手散散步。",
    nextMeetingAt: "2026-04-01 18:30",
    lastMeetingAt: "2026-02-14",
    isAllDay: false,
    creatorUsername: "",
    updaterUsername: ""
  };
}
function getDefaultCountdownPlan() {
  return createDefaultPlan();
}
function normalizeCountdownPlan(plan) {
  const payload = {
    ...createDefaultPlan(),
    ...plan || {}
  };
  payload.loverName = String(payload.loverName || "").trim() || createDefaultPlan().loverName;
  payload.place = String(payload.place || "").trim() || createDefaultPlan().place;
  payload.note = String(payload.note || "").trim();
  payload.nextMeetingAt = String(payload.nextMeetingAt || "").trim() || createDefaultPlan().nextMeetingAt;
  payload.lastMeetingAt = String(payload.lastMeetingAt || "").trim() || createDefaultPlan().lastMeetingAt;
  payload.isAllDay = !!payload.isAllDay;
  payload.creatorUsername = String(payload.creatorUsername || "").trim();
  payload.updaterUsername = String(payload.updaterUsername || "").trim();
  return payload;
}
function getCountdownPlanCache() {
  const stored = common_vendor.index.getStorageSync(COUNTDOWN_PLAN_KEY);
  if (!stored || typeof stored !== "object") {
    return getDefaultCountdownPlan();
  }
  return normalizeCountdownPlan(stored);
}
function saveCountdownPlanCache(plan) {
  const payload = normalizeCountdownPlan(plan);
  common_vendor.index.setStorageSync(COUNTDOWN_PLAN_KEY, payload);
  return payload;
}
exports.getCountdownPlanCache = getCountdownPlanCache;
exports.saveCountdownPlanCache = saveCountdownPlanCache;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/countdown.js.map
