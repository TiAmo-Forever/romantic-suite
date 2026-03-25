"use strict";
const common_vendor = require("../common/vendor.js");
const UNREAD_COUNT_KEY = "romantic_notification_unread_count";
const NOTIFICATION_BANNER_STATE_KEY = "romantic_notification_banner_state";
function readBannerState() {
  const state = common_vendor.index.getStorageSync(NOTIFICATION_BANNER_STATE_KEY);
  if (!state || typeof state !== "object") {
    return {
      expiresAt: 0,
      notification: null
    };
  }
  return {
    expiresAt: Number(state.expiresAt || 0),
    notification: normalizeBannerNotification(state.notification)
  };
}
function normalizeBannerNotification(notification) {
  if (!notification || typeof notification !== "object") {
    return null;
  }
  const title = String(notification.title || "").trim();
  const content = String(notification.content || "").trim();
  const createdAt = String(notification.createdAt || "").trim();
  if (!title && !content) {
    return null;
  }
  return {
    title,
    content,
    createdAt
  };
}
function persistBannerState() {
  common_vendor.index.setStorageSync(NOTIFICATION_BANNER_STATE_KEY, {
    expiresAt: notificationBannerExpiresAt.value,
    notification: notificationBannerNotification.value
  });
}
const initialBannerState = readBannerState();
const notificationUnreadCount = common_vendor.ref(Number(common_vendor.index.getStorageSync(UNREAD_COUNT_KEY) || 0));
const notificationBannerExpiresAt = common_vendor.ref(initialBannerState.expiresAt);
const notificationBannerNotification = common_vendor.ref(initialBannerState.notification);
const isNotificationBannerVisible = common_vendor.computed(() => Number(notificationBannerExpiresAt.value || 0) > Date.now() && !!notificationBannerNotification.value);
function syncNotificationUnreadCount(count) {
  const safeCount = Math.max(0, Number(count || 0));
  notificationUnreadCount.value = safeCount;
  common_vendor.index.setStorageSync(UNREAD_COUNT_KEY, safeCount);
}
function showNotificationBanner(notification, durationMs = 1e4) {
  const safeNotification = normalizeBannerNotification(notification);
  if (!safeNotification) {
    return;
  }
  notificationBannerNotification.value = safeNotification;
  notificationBannerExpiresAt.value = Date.now() + Math.max(0, Number(durationMs || 0));
  persistBannerState();
}
function dismissNotificationBanner() {
  notificationBannerExpiresAt.value = 0;
  notificationBannerNotification.value = null;
  persistBannerState();
}
function isNotificationBannerActive() {
  return Number(notificationBannerExpiresAt.value || 0) > Date.now();
}
function clearNotificationIndicatorState() {
  syncNotificationUnreadCount(0);
  dismissNotificationBanner();
}
exports.clearNotificationIndicatorState = clearNotificationIndicatorState;
exports.dismissNotificationBanner = dismissNotificationBanner;
exports.isNotificationBannerActive = isNotificationBannerActive;
exports.isNotificationBannerVisible = isNotificationBannerVisible;
exports.notificationBannerExpiresAt = notificationBannerExpiresAt;
exports.notificationBannerNotification = notificationBannerNotification;
exports.notificationUnreadCount = notificationUnreadCount;
exports.showNotificationBanner = showNotificationBanner;
exports.syncNotificationUnreadCount = syncNotificationUnreadCount;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/notification-indicator.js.map
