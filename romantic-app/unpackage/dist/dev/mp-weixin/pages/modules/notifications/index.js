"use strict";
const common_vendor = require("../../../common/vendor.js");
const services_notifications = require("../../../services/notifications.js");
const utils_auth = require("../../../utils/auth.js");
const utils_nav = require("../../../utils/nav.js");
const utils_notificationIndicator = require("../../../utils/notification-indicator.js");
const utils_notificationSocket = require("../../../utils/notification-socket.js");
const utils_useThemePage = require("../../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  (AccountHeader + AccountPanel)();
}
const AccountHeader = () => "../../account/components/AccountHeader.js";
const AccountPanel = () => "../../account/components/AccountPanel.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const FILTER_OPTIONS = [
      { key: "all", label: "全部" },
      { key: "unread", label: "未读" },
      { key: "read", label: "已读" }
    ];
    const { themeStyle } = utils_useThemePage.useThemePage();
    const notificationList = common_vendor.ref([]);
    const unreadCount = common_vendor.ref(0);
    const activeFilter = common_vendor.ref("all");
    let unsubscribeNotificationSocket = null;
    const readCount = common_vendor.computed(() => Math.max(0, notificationList.value.length - unreadCount.value));
    const filteredNotificationList = common_vendor.computed(() => {
      if (activeFilter.value === "unread") {
        return notificationList.value.filter((item) => !item.isRead);
      }
      if (activeFilter.value === "read") {
        return notificationList.value.filter((item) => item.isRead);
      }
      return notificationList.value;
    });
    const emptyState = common_vendor.computed(() => {
      if (activeFilter.value === "unread") {
        return {
          title: "当前没有未读提醒",
          desc: "新的共享动态会先出现在这里，点开后就会自动归到已读列表。"
        };
      }
      if (activeFilter.value === "read") {
        return {
          title: "还没有已读记录",
          desc: "你看过的提醒会沉淀在这里，方便后面随时回看。"
        };
      }
      return {
        title: "还没有新的提醒",
        desc: "登录、纪念日、相册、倒计时和改进簿的共享动态，都会在这里慢慢收集起来。"
      };
    });
    common_vendor.onShow(async () => {
      if (!utils_auth.requireAuth())
        return;
      if (!unsubscribeNotificationSocket) {
        unsubscribeNotificationSocket = utils_notificationSocket.subscribeNotificationSocket(() => {
          loadNotifications();
        });
      }
      await loadNotifications();
    });
    async function loadNotifications() {
      try {
        const [list, unread] = await Promise.all([
          services_notifications.fetchNotificationList(),
          services_notifications.fetchUnreadNotificationCount()
        ]);
        notificationList.value = Array.isArray(list) ? list : [];
        unreadCount.value = Number(unread || 0);
        utils_notificationIndicator.syncNotificationUnreadCount(unreadCount.value);
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "消息加载失败", icon: "none" });
      }
    }
    function handleFilterChange(filterKey) {
      activeFilter.value = filterKey;
    }
    function resolveFilterCount(filterKey) {
      if (filterKey === "unread")
        return unreadCount.value;
      if (filterKey === "read")
        return readCount.value;
      return notificationList.value.length;
    }
    function parsePayload(item) {
      try {
        return JSON.parse((item == null ? void 0 : item.payloadJson) || "{}");
      } catch (error) {
        return {};
      }
    }
    function resolveNotificationRoute(item) {
      const bizId = Number((item == null ? void 0 : item.bizId) || 0);
      const payload = parsePayload(item);
      switch (item == null ? void 0 : item.bizType) {
        case "anniversary":
          return bizId ? `/pages/modules/anniversary/detail?id=${bizId}` : "";
        case "album":
          return bizId ? `/pages/modules/album/detail?id=${bizId}` : "";
        case "improvement_note":
          return bizId ? `/pages/modules/improvement/detail?id=${bizId}` : "";
        case "improvement_feedback":
          return payload.noteId ? `/pages/modules/improvement/detail?id=${payload.noteId}` : "";
        case "countdown":
          return "/pages/modules/countdown/index";
        default:
          return "";
      }
    }
    async function handleOpenNotification(item) {
      try {
        if (!item.isRead) {
          await services_notifications.markNotificationRead(item.id);
          item.isRead = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
          utils_notificationIndicator.syncNotificationUnreadCount(unreadCount.value);
        }
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "消息状态更新失败", icon: "none" });
        return;
      }
      const route = resolveNotificationRoute(item);
      if (!route) {
        common_vendor.index.showToast({ title: "这条提醒暂时没有可跳转的页面", icon: "none" });
        return;
      }
      utils_nav.goPage(route);
    }
    async function handleMarkAllRead() {
      if (!notificationList.value.length || unreadCount.value <= 0) {
        common_vendor.index.showToast({ title: "当前没有未读消息", icon: "none" });
        return;
      }
      try {
        await services_notifications.markAllNotificationsRead();
        notificationList.value = notificationList.value.map((item) => ({ ...item, isRead: true }));
        unreadCount.value = 0;
        utils_notificationIndicator.syncNotificationUnreadCount(0);
        common_vendor.index.showToast({ title: "已全部标记为已读", icon: "success" });
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "全部已读失败", icon: "none" });
      }
    }
    common_vendor.onHide(() => {
      if (unsubscribeNotificationSocket) {
        unsubscribeNotificationSocket();
        unsubscribeNotificationSocket = null;
      }
    });
    common_vendor.onUnload(() => {
      if (unsubscribeNotificationSocket) {
        unsubscribeNotificationSocket();
        unsubscribeNotificationSocket = null;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "消息中心",
          eyebrow: "站内提醒"
        }),
        b: common_vendor.t(unreadCount.value),
        c: common_vendor.o(handleMarkAllRead, "84"),
        d: common_vendor.f(FILTER_OPTIONS, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(resolveFilterCount(item.key)),
            c: item.key,
            d: activeFilter.value === item.key ? 1 : "",
            e: common_vendor.o(($event) => handleFilterChange(item.key), item.key)
          };
        }),
        e: filteredNotificationList.value.length
      }, filteredNotificationList.value.length ? {
        f: common_vendor.f(filteredNotificationList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title),
            b: !item.isRead
          }, !item.isRead ? {} : {}, {
            c: common_vendor.t(item.createdAt),
            d: common_vendor.t(item.content),
            e: common_vendor.t(item.actorNickname || item.actorUsername || "共享动态"),
            f: common_vendor.t(item.isRead ? "已读" : "未读"),
            g: !item.isRead ? 1 : "",
            h: item.id,
            i: common_vendor.o(($event) => handleOpenNotification(item), item.id)
          });
        })
      } : {
        g: common_vendor.t(emptyState.value.title),
        h: common_vendor.t(emptyState.value.desc)
      }, {
        i: common_vendor.p({
          title: "最新动态",
          description: "登录、共享内容更新和重要提醒都会慢慢收在这里，方便你们随时回看。"
        }),
        j: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b908c629"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/modules/notifications/index.js.map
