"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_avatar = require("../../utils/avatar.js");
const utils_imagePreview = require("../../utils/image-preview.js");
const utils_profile = require("../../utils/profile.js");
const services_notifications = require("../../services/notifications.js");
const services_profile = require("../../services/profile.js");
const utils_nav = require("../../utils/nav.js");
const utils_notificationIndicator = require("../../utils/notification-indicator.js");
const utils_notificationSocket = require("../../utils/notification-socket.js");
const utils_theme = require("../../utils/theme.js");
const utils_useThemePage = require("../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  BottomTab();
}
const BottomTab = () => "../components/BottomTab.js";
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    const TEXT = {
      brandKicker: "我的空间",
      brand: "我的",
      brandSub: "把账号、主题和日常设置收在这里",
      brandIcon: "♥",
      defaultName: "浪漫用户",
      defaultIntro: "把喜欢写进每一天。",
      cityFallback: "城市未设置",
      loverFallback: "未设置称呼",
      accountTitle: "账号设置",
      accountMenuDesc: "资料、头像、关系与安全",
      themeTitle: "主题设置",
      themeMenuDesc: "颜色、背景和整体氛围",
      messageTitle: "消息中心",
      messageEmptyDesc: "最近还没有新的提醒，你们的动态会慢慢收在这里。",
      logoutTitle: "退出登录",
      logoutDesc: "安全退出当前账号",
      synced: "已同步",
      readAll: "已查看",
      safeExit: "安全"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const user = common_vendor.ref(null);
    const profile = common_vendor.ref(utils_profile.getProfile());
    const avatarPresetMap = utils_profile.getAvatarPresetMap();
    const currentTheme = common_vendor.ref(utils_theme.getCurrentThemePreset(utils_theme.getThemeSettings()));
    const unreadNotificationCount = common_vendor.ref(0);
    const latestNotification = common_vendor.ref(null);
    let unsubscribeNotificationSocket = null;
    const isImageAvatar = common_vendor.computed(() => profile.value.avatarType === "upload" && !!profile.value.avatarImage);
    const avatarImageUrl = common_vendor.computed(() => utils_avatar.resolveAvatarUrl(profile.value.avatarImage));
    const avatarDisplay = common_vendor.computed(() => {
      if (profile.value.avatarType === "preset") {
        return avatarPresetMap[profile.value.avatarPreset] || "♥";
      }
      return String(profile.value.avatarText || "").trim() || "♥";
    });
    const notificationSummaryText = common_vendor.computed(() => {
      var _a, _b;
      const title = String(((_a = latestNotification.value) == null ? void 0 : _a.title) || "").trim();
      const content = String(((_b = latestNotification.value) == null ? void 0 : _b.content) || "").trim();
      if (title && content) {
        return `${title} · ${content}`;
      }
      return title || content || TEXT.messageEmptyDesc;
    });
    function goAccountSettings() {
      utils_nav.goPage("/pages/account/settings");
    }
    function goThemeSettings() {
      utils_nav.goPage("/pages/theme/index");
    }
    function goNotifications() {
      utils_nav.goPage("/pages/modules/notifications/index");
    }
    function previewAvatar() {
      if (!avatarImageUrl.value)
        return;
      utils_imagePreview.previewImages([avatarImageUrl.value], avatarImageUrl.value);
    }
    async function handleLogout() {
      await utils_auth.logout();
      common_vendor.index.reLaunch({ url: "/pages/login/login" });
    }
    async function syncProfileFromServer() {
      try {
        profile.value = await services_profile.fetchRemoteProfile();
      } catch (error) {
        profile.value = utils_profile.getProfile();
      }
    }
    async function loadUnreadNotificationCount() {
      try {
        unreadNotificationCount.value = Number(await services_notifications.fetchUnreadNotificationCount());
        utils_notificationIndicator.syncNotificationUnreadCount(unreadNotificationCount.value);
      } catch (error) {
        unreadNotificationCount.value = 0;
        utils_notificationIndicator.syncNotificationUnreadCount(0);
      }
    }
    async function loadLatestNotification() {
      try {
        latestNotification.value = await services_notifications.fetchLatestNotification();
      } catch (error) {
        latestNotification.value = null;
      }
    }
    function applyRealtimeNotificationEvent(event) {
      unreadNotificationCount.value = Number((event == null ? void 0 : event.unreadCount) || 0);
      utils_notificationIndicator.syncNotificationUnreadCount(unreadNotificationCount.value);
      latestNotification.value = (event == null ? void 0 : event.latestNotification) || null;
    }
    common_vendor.onShow(async () => {
      if (!utils_auth.requireAuth())
        return;
      if (!unsubscribeNotificationSocket) {
        unsubscribeNotificationSocket = utils_notificationSocket.subscribeNotificationSocket(applyRealtimeNotificationEvent);
      }
      user.value = utils_auth.getUser();
      await Promise.all([
        syncProfileFromServer(),
        loadUnreadNotificationCount(),
        loadLatestNotification()
      ]);
      currentTheme.value = utils_theme.getCurrentThemePreset(utils_theme.getThemeSettings());
    });
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
      var _a;
      return common_vendor.e({
        a: common_vendor.t(TEXT.brandKicker),
        b: common_vendor.t(TEXT.brand),
        c: common_vendor.t(TEXT.brandSub),
        d: common_vendor.t(TEXT.brandIcon),
        e: isImageAvatar.value
      }, isImageAvatar.value ? {
        f: avatarImageUrl.value
      } : {
        g: common_vendor.t(avatarDisplay.value)
      }, {
        h: common_vendor.o(previewAvatar, "0b"),
        i: common_vendor.t(profile.value.nickname || ((_a = user.value) == null ? void 0 : _a.username) || TEXT.defaultName),
        j: common_vendor.t(profile.value.bio || TEXT.defaultIntro),
        k: common_vendor.t(profile.value.city || TEXT.cityFallback),
        l: common_vendor.t(profile.value.loverNickname || profile.value.nickname || TEXT.loverFallback),
        m: common_vendor.t(TEXT.accountTitle),
        n: common_vendor.t(TEXT.accountMenuDesc),
        o: common_vendor.t(TEXT.synced),
        p: common_vendor.o(goAccountSettings, "0b"),
        q: common_vendor.t(TEXT.themeTitle),
        r: common_vendor.t(TEXT.themeMenuDesc),
        s: common_vendor.t(currentTheme.value.name),
        t: common_vendor.o(goThemeSettings, "a3"),
        v: unreadNotificationCount.value > 0
      }, unreadNotificationCount.value > 0 ? {} : {}, {
        w: common_vendor.t(TEXT.messageTitle),
        x: common_vendor.t(notificationSummaryText.value),
        y: common_vendor.t(unreadNotificationCount.value > 0 ? `${unreadNotificationCount.value} 条新提醒` : TEXT.readAll),
        z: common_vendor.n(unreadNotificationCount.value > 0 ? "status-badge-open" : "status-badge-quiet"),
        A: common_vendor.o(goNotifications, "04"),
        B: common_vendor.t(TEXT.logoutTitle),
        C: common_vendor.t(TEXT.logoutDesc),
        D: common_vendor.t(TEXT.safeExit),
        E: common_vendor.o(handleLogout, "aa"),
        F: common_vendor.p({
          activeKey: "mine"
        }),
        G: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
