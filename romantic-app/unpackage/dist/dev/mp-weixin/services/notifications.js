"use strict";
const utils_request = require("../utils/request.js");
function ensureSuccess(response, fallbackMessage) {
  if (!(response == null ? void 0 : response.success)) {
    throw new Error((response == null ? void 0 : response.message) || fallbackMessage);
  }
  return response.data;
}
async function fetchNotificationList() {
  const response = await utils_request.request({
    url: "/api/notifications"
  });
  return ensureSuccess(response, "获取消息列表失败") || [];
}
async function fetchLatestNotification() {
  const list = await fetchNotificationList();
  return Array.isArray(list) && list.length ? list[0] : null;
}
async function fetchUnreadNotificationCount() {
  var _a;
  const response = await utils_request.request({
    url: "/api/notifications/unread-count"
  });
  return ((_a = ensureSuccess(response, "获取未读数量失败")) == null ? void 0 : _a.unreadCount) || 0;
}
async function markNotificationRead(id) {
  const response = await utils_request.request({
    url: `/api/notifications/${encodeURIComponent(id)}/read`,
    method: "PUT"
  });
  return ensureSuccess(response, "标记已读失败");
}
async function markAllNotificationsRead() {
  const response = await utils_request.request({
    url: "/api/notifications/read-all",
    method: "PUT"
  });
  return ensureSuccess(response, "全部已读失败");
}
exports.fetchLatestNotification = fetchLatestNotification;
exports.fetchNotificationList = fetchNotificationList;
exports.fetchUnreadNotificationCount = fetchUnreadNotificationCount;
exports.markAllNotificationsRead = markAllNotificationsRead;
exports.markNotificationRead = markNotificationRead;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/notifications.js.map
