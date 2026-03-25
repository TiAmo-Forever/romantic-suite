"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_nav = require("../../utils/nav.js");
const services_notifications = require("../../services/notifications.js");
const utils_notificationIndicator = require("../../utils/notification-indicator.js");
const _sfc_main = {
  __name: "BottomTab",
  props: {
    activeKey: {
      type: String,
      default: "home"
    }
  },
  setup(__props) {
    const props = __props;
    const currentActive = common_vendor.ref(props.activeKey);
    const now = common_vendor.ref(Date.now());
    let stripWindowTimer = null;
    common_vendor.watch(
      () => props.activeKey,
      (newVal) => {
        currentActive.value = newVal;
      }
    );
    const tabs = [
      { key: "home", label: "首页", path: "/pages/home/home" },
      { key: "planet", label: "星球", path: "/pages/planet/planet" },
      { key: "mine", label: "我的", path: "/pages/mine/mine" }
    ];
    const showMineNotificationDot = common_vendor.computed(() => {
      now.value;
      return utils_notificationIndicator.notificationUnreadCount.value > 0 && !utils_notificationIndicator.isNotificationBannerActive();
    });
    function handleTabClick(tab) {
      if (tab.key === currentActive.value)
        return;
      currentActive.value = tab.key;
      utils_nav.switchRootPage(tab.path);
    }
    function scheduleStripWindowRefresh() {
      if (stripWindowTimer) {
        clearTimeout(stripWindowTimer);
        stripWindowTimer = null;
      }
      const remaining = Number(utils_notificationIndicator.notificationBannerExpiresAt.value || 0) - Date.now();
      if (remaining > 0) {
        stripWindowTimer = setTimeout(() => {
          now.value = Date.now();
        }, remaining + 20);
      }
    }
    async function syncUnreadCount() {
      try {
        const unread = await services_notifications.fetchUnreadNotificationCount();
        utils_notificationIndicator.syncNotificationUnreadCount(unread);
      } catch (error) {
      }
    }
    common_vendor.watch(
      () => utils_notificationIndicator.notificationBannerExpiresAt.value,
      () => {
        now.value = Date.now();
        scheduleStripWindowRefresh();
      },
      { immediate: true }
    );
    common_vendor.onShow(() => {
      now.value = Date.now();
      scheduleStripWindowRefresh();
      syncUnreadCount();
    });
    common_vendor.onUnmounted(() => {
      if (stripWindowTimer) {
        clearTimeout(stripWindowTimer);
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(tabs, (tab, k0, i0) => {
          return common_vendor.e({
            a: tab.key === "mine" && showMineNotificationDot.value
          }, tab.key === "mine" && showMineNotificationDot.value ? {} : {}, {
            b: tab.key === "home"
          }, tab.key === "home" ? {} : tab.key === "planet" ? {} : {}, {
            c: tab.key === "planet",
            d: common_vendor.t(tab.label),
            e: tab.key,
            f: tab.key === currentActive.value ? 1 : "",
            g: common_vendor.o(($event) => handleTabClick(tab), tab.key)
          });
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-41549bae"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/components/BottomTab.js.map
