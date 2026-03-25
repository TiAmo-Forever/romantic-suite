"use strict";
const utils_request = require("../utils/request.js");
const utils_countdown = require("../utils/countdown.js");
const utils_serverState = require("../utils/server-state.js");
function ensureSuccess(response, fallbackMessage) {
  if (!(response == null ? void 0 : response.success)) {
    throw new Error((response == null ? void 0 : response.message) || fallbackMessage);
  }
  return response.data;
}
async function fetchSharedCountdownPlan(options = {}) {
  const { allowOfflineFallback = true } = options;
  try {
    const response = await utils_request.request({
      url: "/api/countdown/plan"
    });
    return utils_countdown.saveCountdownPlanCache(ensureSuccess(response, "获取见面倒计时失败"));
  } catch (error) {
    if (allowOfflineFallback && utils_serverState.isServerOffline()) {
      return utils_countdown.getCountdownPlanCache();
    }
    throw error;
  }
}
async function updateSharedCountdownPlan(payload) {
  if (!utils_serverState.ensureServerWritable()) {
    throw new Error("离线模式下不支持修改");
  }
  const response = await utils_request.request({
    url: "/api/countdown/plan",
    method: "PUT",
    data: payload
  });
  return utils_countdown.saveCountdownPlanCache(ensureSuccess(response, "保存见面倒计时失败"));
}
async function resetSharedCountdownPlan() {
  if (!utils_serverState.ensureServerWritable()) {
    throw new Error("离线模式下不支持修改");
  }
  const response = await utils_request.request({
    url: "/api/countdown/plan/reset",
    method: "POST"
  });
  return utils_countdown.saveCountdownPlanCache(ensureSuccess(response, "恢复默认倒计时失败"));
}
exports.fetchSharedCountdownPlan = fetchSharedCountdownPlan;
exports.resetSharedCountdownPlan = resetSharedCountdownPlan;
exports.updateSharedCountdownPlan = updateSharedCountdownPlan;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/countdown.js.map
