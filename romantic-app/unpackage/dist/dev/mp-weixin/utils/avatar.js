"use strict";
const common_vendor = require("../common/vendor.js");
const utils_appConfig = require("./app-config.js");
const utils_auth = require("./auth.js");
const utils_serverState = require("./server-state.js");
const AVATAR_DRAFT_KEY = "romantic_avatar_draft";
const AUTH_INVALID_MESSAGES = [
  "未登录或登录已失效",
  "登录已失效，请重新登录",
  "登录已失效"
];
function joinUrl(baseUrl, path) {
  const normalizedBase = String(baseUrl || "").replace(/\/+$/, "");
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
}
function parseUploadResponse(rawData) {
  if (typeof rawData === "object" && rawData !== null) {
    return rawData;
  }
  if (!rawData) {
    return null;
  }
  try {
    return JSON.parse(rawData);
  } catch (error) {
    return null;
  }
}
function isAuthInvalid(statusCode, payload) {
  const message = String((payload == null ? void 0 : payload.message) || "").trim();
  return statusCode === 401 || AUTH_INVALID_MESSAGES.includes(message);
}
function setAvatarDraft(path) {
  common_vendor.index.setStorageSync(AVATAR_DRAFT_KEY, path || "");
}
function getAvatarDraft() {
  return common_vendor.index.getStorageSync(AVATAR_DRAFT_KEY) || "";
}
function clearAvatarDraft() {
  common_vendor.index.removeStorageSync(AVATAR_DRAFT_KEY);
}
function persistAvatarDraft(filePath) {
  return new Promise((resolve) => {
    if (!filePath) {
      resolve("");
      return;
    }
    if (typeof common_vendor.index.saveFile !== "function") {
      resolve(filePath);
      return;
    }
    common_vendor.index.saveFile({
      tempFilePath: filePath,
      success(result) {
        resolve(result.savedFilePath || filePath);
      },
      fail() {
        resolve(filePath);
      }
    });
  });
}
function resolveAvatarUrl(path) {
  const value = String(path || "").trim();
  if (!value) {
    return "";
  }
  if (/^(https?:|data:|file:|wxfile:|blob:)/i.test(value)) {
    return value;
  }
  return joinUrl(utils_appConfig.getApiBaseUrl(), value);
}
function uploadAvatarFile(filePath) {
  const token = common_vendor.index.getStorageSync("romantic_token");
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: joinUrl(utils_appConfig.getApiBaseUrl(), "/api/files/avatar"),
      filePath,
      name: "file",
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success(response) {
        var _a;
        const payload = parseUploadResponse(response.data);
        const message = (payload == null ? void 0 : payload.message) || "头像上传失败";
        if (isAuthInvalid(response.statusCode, payload)) {
          utils_auth.redirectToLogin(message);
          reject(new Error(message));
          return;
        }
        if (response.statusCode >= 200 && response.statusCode < 300 && (payload == null ? void 0 : payload.success) && ((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.path)) {
          utils_serverState.markServerOnline();
          resolve(payload.data.path);
          return;
        }
        reject(new Error(message));
      },
      fail(error) {
        utils_serverState.markServerOffline();
        reject(error);
      }
    });
  });
}
exports.clearAvatarDraft = clearAvatarDraft;
exports.getAvatarDraft = getAvatarDraft;
exports.persistAvatarDraft = persistAvatarDraft;
exports.resolveAvatarUrl = resolveAvatarUrl;
exports.setAvatarDraft = setAvatarDraft;
exports.uploadAvatarFile = uploadAvatarFile;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/avatar.js.map
