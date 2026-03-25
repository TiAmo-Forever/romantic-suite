"use strict";
const utils_request = require("../utils/request.js");
async function loginByServer(payload) {
  const response = await utils_request.request({
    url: "/api/auth/login",
    method: "POST",
    data: payload,
    offlineTip: false
  });
  if (!(response == null ? void 0 : response.success)) {
    throw new Error((response == null ? void 0 : response.message) || "登录失败");
  }
  return response.data;
}
async function logoutByServer() {
  try {
    await utils_request.request({
      url: "/api/auth/logout",
      method: "POST",
      offlineTip: false
    });
  } catch (error) {
  }
}
exports.loginByServer = loginByServer;
exports.logoutByServer = logoutByServer;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/auth.js.map
