"use strict";
const common_vendor = require("../common/vendor.js");
const services_auth = require("../services/auth.js");
const utils_notificationSocket = require("./notification-socket.js");
const utils_notificationIndicator = require("./notification-indicator.js");
const utils_profile = require("./profile.js");
const utils_theme = require("./theme.js");
const TOKEN_KEY = "romantic_token";
const USER_KEY = "romantic_user";
const LOGIN_PAGE = "/pages/login/login";
let redirectingToLogin = false;
async function login(username, password) {
  var _a;
  try {
    const payload = await services_auth.loginByServer({ username, password });
    const user = {
      username: payload.username,
      nickname: payload.nickname || ((_a = payload.profile) == null ? void 0 : _a.nickname) || "Romantic Space"
    };
    common_vendor.index.setStorageSync(TOKEN_KEY, payload.token);
    common_vendor.index.setStorageSync(USER_KEY, user);
    if (payload.profile) {
      utils_profile.saveProfile({
        ...payload.profile,
        password
      });
      utils_theme.saveAndApplyTheme({ presetKey: payload.profile.themePresetKey || "pink" });
    }
    utils_notificationSocket.ensureNotificationSocket();
    return { success: true, user };
  } catch (error) {
    return { success: false, message: (error == null ? void 0 : error.message) || "Login failed" };
  }
}
function clearLoginState() {
  utils_notificationSocket.closeNotificationSocket();
  utils_notificationIndicator.clearNotificationIndicatorState();
  common_vendor.index.removeStorageSync(TOKEN_KEY);
  common_vendor.index.removeStorageSync(USER_KEY);
}
async function logout(options = {}) {
  const { notifyServer = true } = options;
  if (notifyServer) {
    try {
      await services_auth.logoutByServer();
    } catch (error) {
    }
  }
  clearLoginState();
}
function redirectToLogin(message = "Login expired, please sign in again") {
  clearLoginState();
  if (redirectingToLogin) {
    return;
  }
  redirectingToLogin = true;
  common_vendor.index.showToast({
    title: message,
    icon: "none"
  });
  setTimeout(() => {
    common_vendor.index.reLaunch({ url: LOGIN_PAGE });
    redirectingToLogin = false;
  }, 120);
}
function isLogin() {
  return !!common_vendor.index.getStorageSync(TOKEN_KEY);
}
function getUser() {
  return common_vendor.index.getStorageSync(USER_KEY) || null;
}
function requireAuth() {
  if (isLogin()) {
    return true;
  }
  redirectToLogin("Please sign in first");
  return false;
}
exports.clearLoginState = clearLoginState;
exports.getUser = getUser;
exports.isLogin = isLogin;
exports.login = login;
exports.logout = logout;
exports.redirectToLogin = redirectToLogin;
exports.requireAuth = requireAuth;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map
