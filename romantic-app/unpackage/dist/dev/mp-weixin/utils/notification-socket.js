"use strict";
const common_vendor = require("../common/vendor.js");
const utils_appConfig = require("./app-config.js");
const services_notifications = require("../services/notifications.js");
const utils_notificationIndicator = require("./notification-indicator.js");
const TOKEN_KEY = "romantic_token";
const USER_KEY = "romantic_user";
const listeners = /* @__PURE__ */ new Set();
let socketTask = null;
let reconnectTimer = null;
let manualClosed = false;
let connecting = false;
function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}
function normalizeWsBaseUrl() {
  const apiBaseUrl = String(utils_appConfig.getApiBaseUrl() || "").trim();
  if (!apiBaseUrl) {
    return "";
  }
  if (apiBaseUrl.startsWith("https://")) {
    return apiBaseUrl.replace(/^https:\/\//, "wss://");
  }
  if (apiBaseUrl.startsWith("http://")) {
    return apiBaseUrl.replace(/^http:\/\//, "ws://");
  }
  return apiBaseUrl;
}
function buildSocketUrl() {
  const token = common_vendor.index.getStorageSync(TOKEN_KEY);
  const baseUrl = normalizeWsBaseUrl();
  if (!baseUrl || !token) {
    return "";
  }
  return `${baseUrl}/ws/notifications?token=${encodeURIComponent(token)}`;
}
function emitSocketEvent(event) {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
    }
  });
}
async function refreshNotificationSnapshot() {
  try {
    const [unreadCount, latestNotification] = await Promise.all([
      services_notifications.fetchUnreadNotificationCount(),
      services_notifications.fetchLatestNotification()
    ]);
    const safeUnreadCount = Number(unreadCount || 0);
    utils_notificationIndicator.syncNotificationUnreadCount(safeUnreadCount);
    return {
      unreadCount: safeUnreadCount,
      latestNotification
    };
  } catch (error) {
    return {
      unreadCount: 0,
      latestNotification: null
    };
  }
}
async function handleRealtimeEvent(rawEvent) {
  const safeEvent = rawEvent && typeof rawEvent === "object" ? rawEvent : {};
  const snapshot = await refreshNotificationSnapshot();
  const mergedEvent = {
    ...safeEvent,
    unreadCount: snapshot.unreadCount,
    latestNotification: snapshot.latestNotification,
    username: (common_vendor.index.getStorageSync(USER_KEY) || {}).username || ""
  };
  if (snapshot.unreadCount > 0 && safeEvent.eventType === "notification_created") {
    utils_notificationIndicator.showNotificationBanner(snapshot.latestNotification, 1e4);
  }
  emitSocketEvent(mergedEvent);
}
function scheduleReconnect() {
  if (manualClosed || !common_vendor.index.getStorageSync(TOKEN_KEY)) {
    return;
  }
  clearReconnectTimer();
  reconnectTimer = setTimeout(() => {
    ensureNotificationSocket();
  }, 1800);
}
function ensureNotificationSocket() {
  if (!common_vendor.index.getStorageSync(TOKEN_KEY) || connecting || socketTask) {
    return;
  }
  const url = buildSocketUrl();
  if (!url) {
    return;
  }
  manualClosed = false;
  connecting = true;
  socketTask = common_vendor.index.connectSocket({ url, complete: () => {
  } });
  socketTask.onOpen(() => {
    connecting = false;
    clearReconnectTimer();
  });
  socketTask.onMessage(async (message) => {
    try {
      const data = typeof (message == null ? void 0 : message.data) === "string" ? JSON.parse(message.data) : message == null ? void 0 : message.data;
      await handleRealtimeEvent(data);
    } catch (error) {
    }
  });
  socketTask.onClose(() => {
    connecting = false;
    socketTask = null;
    scheduleReconnect();
  });
  socketTask.onError(() => {
    connecting = false;
    socketTask = null;
    scheduleReconnect();
  });
}
function closeNotificationSocket() {
  manualClosed = true;
  connecting = false;
  clearReconnectTimer();
  if (socketTask) {
    try {
      socketTask.close({});
    } catch (error) {
    }
  }
  socketTask = null;
}
function subscribeNotificationSocket(listener) {
  if (typeof listener !== "function") {
    return () => {
    };
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
exports.closeNotificationSocket = closeNotificationSocket;
exports.ensureNotificationSocket = ensureNotificationSocket;
exports.subscribeNotificationSocket = subscribeNotificationSocket;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/notification-socket.js.map
