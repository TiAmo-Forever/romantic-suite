"use strict";
const common_vendor = require("../common/vendor.js");
const utils_appConfig = require("./app-config.js");
const utils_serverState = require("./server-state.js");
const utils_auth = require("./auth.js");
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const AUTH_INVALID_MESSAGES = [
  "AUTH_INVALID",
  "LOGIN_EXPIRED",
  "UNAUTHORIZED"
];
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
function resolveMediaUrl(path) {
  const value = String(path || "").trim();
  if (!value) {
    return "";
  }
  if (/^(https?:|data:|file:|wxfile:|blob:)/i.test(value)) {
    return value;
  }
  return utils_appConfig.buildServerAssetUrl(value);
}
function getFileSize(filePath) {
  return new Promise((resolve, reject) => {
    common_vendor.index.getFileInfo({
      filePath,
      success(result) {
        resolve(Number(result.size || 0));
      },
      fail: reject
    });
  });
}
async function compressImageToLimit(filePath) {
  let currentPath = filePath;
  let currentSize = await getFileSize(filePath);
  if (currentSize <= IMAGE_MAX_SIZE) {
    return currentPath;
  }
  for (const quality of [80, 60, 40]) {
    currentPath = await new Promise((resolve, reject) => {
      common_vendor.index.compressImage({
        src: currentPath,
        quality,
        success(result) {
          resolve(result.tempFilePath);
        },
        fail: reject
      });
    });
    currentSize = await getFileSize(currentPath);
    if (currentSize <= IMAGE_MAX_SIZE) {
      return currentPath;
    }
  }
  throw new Error("图片压缩后仍然超过 5MB");
}
async function prepareImageFile(filePath) {
  return compressImageToLimit(filePath);
}
function uploadMedia(filePath, endpoint) {
  const token = common_vendor.index.getStorageSync("romantic_token");
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: utils_appConfig.buildApiUrl(endpoint),
      filePath,
      name: "file",
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success(response) {
        var _a;
        const payload = parseUploadResponse(response.data);
        const message = (payload == null ? void 0 : payload.message) || "上传失败";
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
        reject(new Error((error == null ? void 0 : error.errMsg) || "上传失败"));
      }
    });
  });
}
function uploadAnniversaryMedia(filePath) {
  return uploadMedia(filePath, "/api/files/anniversary-media");
}
function uploadImprovementMedia(filePath) {
  return uploadMedia(filePath, "/api/files/improvement-media");
}
function uploadAlbumMedia(filePath) {
  return uploadMedia(filePath, "/api/files/album-media");
}
exports.prepareImageFile = prepareImageFile;
exports.resolveMediaUrl = resolveMediaUrl;
exports.uploadAlbumMedia = uploadAlbumMedia;
exports.uploadAnniversaryMedia = uploadAnniversaryMedia;
exports.uploadImprovementMedia = uploadImprovementMedia;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/media-upload.js.map
