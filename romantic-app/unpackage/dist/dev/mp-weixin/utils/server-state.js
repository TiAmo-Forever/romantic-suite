"use strict";
const common_vendor = require("../common/vendor.js");
const OFFLINE_FLAG_KEY = "romantic_server_offline";
const OFFLINE_MESSAGE = "当前采用离线数据，操作后不会更新";
let offlineModalShown = false;
function isServerOffline() {
  return !!common_vendor.index.getStorageSync(OFFLINE_FLAG_KEY);
}
function markServerOnline() {
  common_vendor.index.removeStorageSync(OFFLINE_FLAG_KEY);
  offlineModalShown = false;
}
function markServerOffline(message = OFFLINE_MESSAGE) {
  common_vendor.index.setStorageSync(OFFLINE_FLAG_KEY, true);
  if (offlineModalShown) {
    return;
  }
  offlineModalShown = true;
  common_vendor.index.showModal({
    title: "网络异常",
    content: message,
    showCancel: false,
    confirmText: "我知道了"
  });
}
function ensureServerWritable() {
  if (!isServerOffline()) {
    return true;
  }
  common_vendor.index.showToast({
    title: "离线模式下不支持修改",
    icon: "none"
  });
  return false;
}
exports.ensureServerWritable = ensureServerWritable;
exports.isServerOffline = isServerOffline;
exports.markServerOffline = markServerOffline;
exports.markServerOnline = markServerOnline;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/server-state.js.map
