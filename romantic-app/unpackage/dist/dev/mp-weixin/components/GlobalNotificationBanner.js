"use strict";
const common_vendor = require("../common/vendor.js");
const utils_notificationIndicator = require("../utils/notification-indicator.js");
const utils_nav = require("../utils/nav.js");
const _sfc_main = {
  __name: "GlobalNotificationBanner",
  setup(__props) {
    const TEXT = {
      kicker: "新提醒",
      defaultTitle: "有新的心动提醒",
      defaultContent: "点开看看你们刚刚更新了什么",
      hint: "左滑关闭",
      justNow: "刚刚"
    };
    const shouldRender = common_vendor.ref(!!utils_notificationIndicator.notificationBannerNotification.value);
    const visible = common_vendor.ref(Boolean(utils_notificationIndicator.isNotificationBannerVisible.value));
    const dragOffsetX = common_vendor.ref(0);
    const isDragging = common_vendor.ref(false);
    let hideTimer = null;
    let removeTimer = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;
    const bannerTitle = common_vendor.computed(() => {
      var _a;
      return String(((_a = utils_notificationIndicator.notificationBannerNotification.value) == null ? void 0 : _a.title) || "").trim() || TEXT.defaultTitle;
    });
    const bannerContent = common_vendor.computed(() => {
      var _a;
      return String(((_a = utils_notificationIndicator.notificationBannerNotification.value) == null ? void 0 : _a.content) || "").trim() || TEXT.defaultContent;
    });
    const bannerTime = common_vendor.computed(() => {
      var _a;
      return formatBannerTime((_a = utils_notificationIndicator.notificationBannerNotification.value) == null ? void 0 : _a.createdAt);
    });
    const bannerStyle = common_vendor.computed(() => ({
      transform: `translate3d(${dragOffsetX.value}px, ${visible.value ? "0" : "-140%"}, 0)`,
      opacity: visible.value ? 1 : 0
    }));
    function formatBannerTime(value) {
      const raw = String(value || "").trim();
      if (!raw) {
        return TEXT.justNow;
      }
      const date = new Date(raw.replace(" ", "T"));
      if (Number.isNaN(date.getTime())) {
        return raw;
      }
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    }
    function clearTimers() {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (removeTimer) {
        clearTimeout(removeTimer);
        removeTimer = null;
      }
    }
    function syncBannerVisibility() {
      clearTimers();
      const hasNotification = !!utils_notificationIndicator.notificationBannerNotification.value;
      const active = Boolean(utils_notificationIndicator.isNotificationBannerVisible.value && hasNotification);
      if (hasNotification) {
        shouldRender.value = true;
      }
      visible.value = active;
      if (!active) {
        dragOffsetX.value = 0;
        isDragging.value = false;
        if (shouldRender.value) {
          removeTimer = setTimeout(() => {
            if (!utils_notificationIndicator.isNotificationBannerVisible.value) {
              shouldRender.value = false;
            }
          }, 260);
        }
        return;
      }
      const remaining = Number(utils_notificationIndicator.notificationBannerExpiresAt.value || 0) - Date.now();
      if (remaining > 0) {
        hideTimer = setTimeout(() => {
          utils_notificationIndicator.dismissNotificationBanner();
        }, remaining + 20);
      }
    }
    function handleTouchStart(event) {
      var _a;
      const touch = (_a = event == null ? void 0 : event.touches) == null ? void 0 : _a[0];
      if (!touch) {
        return;
      }
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchMoved = false;
    }
    function handleTouchMove(event) {
      var _a;
      const touch = (_a = event == null ? void 0 : event.touches) == null ? void 0 : _a[0];
      if (!touch || !visible.value) {
        return;
      }
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) < Math.abs(deltaY) || deltaX >= 0) {
        return;
      }
      touchMoved = true;
      isDragging.value = true;
      dragOffsetX.value = Math.max(deltaX, -260);
    }
    function handleTouchEnd() {
      if (!visible.value) {
        return;
      }
      const shouldDismiss = dragOffsetX.value <= -120;
      isDragging.value = false;
      dragOffsetX.value = 0;
      if (shouldDismiss) {
        utils_notificationIndicator.dismissNotificationBanner();
      }
    }
    function handleOpenNotifications() {
      if (touchMoved || isDragging.value) {
        touchMoved = false;
        return;
      }
      utils_nav.goPage("/pages/modules/notifications/index");
    }
    common_vendor.watch(
      () => [utils_notificationIndicator.notificationBannerExpiresAt.value, utils_notificationIndicator.notificationBannerNotification.value],
      () => {
        syncBannerVisibility();
      },
      { immediate: true }
    );
    common_vendor.onUnmounted(() => {
      clearTimers();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: shouldRender.value
      }, shouldRender.value ? {
        b: common_vendor.t(TEXT.kicker),
        c: common_vendor.t(bannerTitle.value),
        d: common_vendor.t(bannerContent.value),
        e: common_vendor.t(bannerTime.value),
        f: common_vendor.t(TEXT.hint),
        g: isDragging.value ? 1 : "",
        h: common_vendor.s(bannerStyle.value),
        i: common_vendor.o(handleTouchStart, "69"),
        j: common_vendor.o(handleTouchMove, "7d"),
        k: common_vendor.o(handleTouchEnd, "34"),
        l: common_vendor.o(handleTouchEnd, "08"),
        m: common_vendor.o(handleOpenNotifications, "91")
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1e68551f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/GlobalNotificationBanner.js.map
