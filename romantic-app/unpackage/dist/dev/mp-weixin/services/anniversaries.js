"use strict";
const utils_request = require("../utils/request.js");
const utils_anniversary = require("../utils/anniversary.js");
const utils_serverState = require("../utils/server-state.js");
function ensureSuccess(response, fallbackMessage) {
  if (!(response == null ? void 0 : response.success)) {
    throw new Error((response == null ? void 0 : response.message) || fallbackMessage);
  }
  return response.data;
}
async function fetchAnniversaryList(status = "all", options = {}) {
  const { allowOfflineFallback = true } = options;
  try {
    const response = await utils_request.request({
      url: `/api/anniversaries?status=${encodeURIComponent(status)}`
    });
    const list = ensureSuccess(response, "获取纪念日列表失败") || [];
    utils_anniversary.saveAnniversaryListCache(list);
    return list;
  } catch (error) {
    if (allowOfflineFallback && utils_serverState.isServerOffline()) {
      return utils_anniversary.getAnniversaryListCache();
    }
    throw error;
  }
}
async function fetchAnniversaryDetail(id) {
  const response = await utils_request.request({
    url: `/api/anniversaries/${encodeURIComponent(id)}`
  });
  return ensureSuccess(response, "获取纪念日详情失败");
}
async function createAnniversary(payload) {
  const response = await utils_request.request({
    url: "/api/anniversaries",
    method: "POST",
    data: payload
  });
  return ensureSuccess(response, "创建纪念日失败");
}
async function updateAnniversary(id, payload) {
  const response = await utils_request.request({
    url: `/api/anniversaries/${encodeURIComponent(id)}`,
    method: "PUT",
    data: payload
  });
  return ensureSuccess(response, "保存纪念日失败");
}
async function deleteAnniversary(id) {
  const response = await utils_request.request({
    url: `/api/anniversaries/${encodeURIComponent(id)}`,
    method: "DELETE"
  });
  return ensureSuccess(response, "删除纪念日失败");
}
async function increaseAnniversaryLikeCount(id) {
  const response = await utils_request.request({
    url: `/api/anniversaries/${encodeURIComponent(id)}/likes`,
    method: "POST"
  });
  return ensureSuccess(response, "点赞失败");
}
async function checkAnniversaryReminders() {
  const response = await utils_request.request({
    url: "/api/anniversaries/reminders/check",
    method: "POST",
    offlineTip: false
  });
  return ensureSuccess(response, "检查纪念日提醒失败") || [];
}
exports.checkAnniversaryReminders = checkAnniversaryReminders;
exports.createAnniversary = createAnniversary;
exports.deleteAnniversary = deleteAnniversary;
exports.fetchAnniversaryDetail = fetchAnniversaryDetail;
exports.fetchAnniversaryList = fetchAnniversaryList;
exports.increaseAnniversaryLikeCount = increaseAnniversaryLikeCount;
exports.updateAnniversary = updateAnniversary;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/anniversaries.js.map
