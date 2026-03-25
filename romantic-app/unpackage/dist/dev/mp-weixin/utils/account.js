"use strict";
const common_vendor = require("../common/vendor.js");
const utils_nav = require("./nav.js");
const services_profile = require("../services/profile.js");
const utils_auth = require("./auth.js");
function finishSettingsSave(title = "已保存", delay = 250) {
  common_vendor.index.showToast({
    title,
    icon: "success"
  });
  setTimeout(() => {
    utils_nav.backPage();
  }, delay);
}
async function saveProfilePatchAndBack(patch, title = "已保存", delay = 250) {
  await services_profile.updateRemoteProfile(patch);
  finishSettingsSave(title, delay);
}
async function savePasswordAndBack(password, title = "已保存", delay = 250) {
  await services_profile.updateRemotePassword(password);
  common_vendor.index.showToast({
    title,
    icon: "success"
  });
  setTimeout(() => {
    utils_auth.redirectToLogin("密码已修改，请重新登录");
  }, delay);
}
exports.savePasswordAndBack = savePasswordAndBack;
exports.saveProfilePatchAndBack = saveProfilePatchAndBack;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/account.js.map
