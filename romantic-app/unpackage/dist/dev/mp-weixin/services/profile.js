"use strict";
const utils_request = require("../utils/request.js");
const utils_profile = require("../utils/profile.js");
const utils_serverState = require("../utils/server-state.js");
const utils_theme = require("../utils/theme.js");
function normalizeRemoteProfile(profile) {
  const localProfile = utils_profile.getDefaultProfile();
  const payload = {
    ...localProfile,
    ...profile || {}
  };
  return {
    ...payload,
    defaultMeetingPlace: payload.defaultMeetingPlace || payload.city || localProfile.defaultMeetingPlace
  };
}
function ensureSuccess(response, fallbackMessage) {
  if (!(response == null ? void 0 : response.success)) {
    throw new Error((response == null ? void 0 : response.message) || fallbackMessage);
  }
  return response.data;
}
function syncLocalProfile(profile, extraPatch = {}) {
  const payload = normalizeRemoteProfile({
    ...profile,
    ...extraPatch
  });
  utils_profile.saveProfile(payload);
  utils_theme.saveAndApplyTheme({ presetKey: payload.themePresetKey || "pink" });
  return payload;
}
async function fetchRemoteProfile(options = {}) {
  const { allowOfflineFallback = true } = options;
  try {
    const response = await utils_request.request({
      url: "/api/profiles/mine"
    });
    return syncLocalProfile(ensureSuccess(response, "获取资料失败"));
  } catch (error) {
    if (allowOfflineFallback && utils_serverState.isServerOffline()) {
      return utils_profile.getProfile();
    }
    throw error;
  }
}
async function updateRemoteProfile(patch) {
  if (!utils_serverState.ensureServerWritable()) {
    throw new Error("离线模式下不支持修改");
  }
  const response = await utils_request.request({
    url: "/api/profiles/mine",
    method: "PUT",
    data: patch
  });
  return syncLocalProfile(ensureSuccess(response, "保存资料失败"));
}
async function updateRemotePassword(password) {
  if (!utils_serverState.ensureServerWritable()) {
    throw new Error("离线模式下不支持修改");
  }
  const response = await utils_request.request({
    url: "/api/profiles/mine/password",
    method: "PUT",
    data: { password }
  });
  return syncLocalProfile(ensureSuccess(response, "保存密码失败"), { password });
}
async function resetRemoteProfile() {
  if (!utils_serverState.ensureServerWritable()) {
    throw new Error("离线模式下不支持修改");
  }
  const response = await utils_request.request({
    url: "/api/profiles/mine/reset",
    method: "POST"
  });
  return syncLocalProfile(ensureSuccess(response, "恢复默认失败"));
}
exports.fetchRemoteProfile = fetchRemoteProfile;
exports.resetRemoteProfile = resetRemoteProfile;
exports.updateRemotePassword = updateRemotePassword;
exports.updateRemoteProfile = updateRemoteProfile;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/profile.js.map
