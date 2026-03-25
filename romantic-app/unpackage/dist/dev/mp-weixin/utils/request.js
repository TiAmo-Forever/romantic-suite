"use strict";
const common_vendor = require("../common/vendor.js");
const utils_appConfig = require("./app-config.js");
const utils_auth = require("./auth.js");
const utils_serverState = require("./server-state.js");
const AUTH_INVALID_MESSAGES = [
  "AUTH_INVALID",
  "LOGIN_EXPIRED",
  "UNAUTHORIZED"
];
const OFFLINE_STATUS_CODES = [502, 503, 504];
function isAuthInvalid(statusCode, payload) {
  const message = String((payload == null ? void 0 : payload.message) || "").trim();
  return statusCode === 401 || AUTH_INVALID_MESSAGES.includes(message);
}
function isOfflineFailure(statusCode, payload) {
  const message = String((payload == null ? void 0 : payload.message) || "").trim();
  return OFFLINE_STATUS_CODES.includes(statusCode) || message.includes("Failed to obtain JDBC Connection");
}
function normalizeRequestFailMessage(error, requestUrl) {
  const rawMessage = String((error == null ? void 0 : error.errMsg) || "").trim();
  const apiUrl = utils_appConfig.buildApiUrl(requestUrl || "");
  if (!rawMessage) {
    return `无法连接到服务器，请确认后端服务已启动：${apiUrl}`;
  }
  if (rawMessage.includes("Failed to connect") || rawMessage.includes("statusCode:-1")) {
    return `无法连接到服务器，请确认后端服务已启动：${apiUrl}`;
  }
  if (rawMessage.toLowerCase().includes("timeout")) {
    return `连接服务器超时，请检查服务是否可用：${apiUrl}`;
  }
  if (rawMessage.toLowerCase().includes("abort")) {
    return `服务器连接已中断，请确认服务状态：${apiUrl}`;
  }
  return `请求服务器失败：${rawMessage}`;
}
function request(options) {
  const { url, method = "GET", data, header = {}, offlineTip = true } = options || {};
  const token = common_vendor.index.getStorageSync("romantic_token");
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: utils_appConfig.buildApiUrl(url),
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...token ? { Authorization: `Bearer ${token}` } : {},
        ...header
      },
      success(response) {
        const { statusCode, data: payload } = response;
        if (isAuthInvalid(statusCode, payload)) {
          const message = (payload == null ? void 0 : payload.message) || "Login expired, please sign in again";
          utils_auth.redirectToLogin(message);
          reject(new Error(message));
          return;
        }
        if (isOfflineFailure(statusCode, payload)) {
          if (offlineTip) {
            utils_serverState.markServerOffline();
          }
          reject(new Error((payload == null ? void 0 : payload.message) || "Server is temporarily unavailable"));
          return;
        }
        if (statusCode >= 200 && statusCode < 300) {
          utils_serverState.markServerOnline();
          resolve(payload);
          return;
        }
        reject(new Error((payload == null ? void 0 : payload.message) || `Request failed (${statusCode})`));
      },
      fail(error) {
        if (offlineTip) {
          utils_serverState.markServerOffline();
        }
        reject(new Error(normalizeRequestFailMessage(error, url)));
      }
    });
  });
}
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
