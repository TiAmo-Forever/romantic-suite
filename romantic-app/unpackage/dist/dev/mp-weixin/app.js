"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_anniversaryReminder = require("./utils/anniversary-reminder.js");
const utils_notificationSocket = require("./utils/notification-socket.js");
const utils_theme = require("./utils/theme.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/home/home.js";
  "./pages/planet/planet.js";
  "./pages/mine/mine.js";
  "./pages/modules/countdown/index.js";
  "./pages/modules/anniversary/index.js";
  "./pages/modules/anniversary/detail.js";
  "./pages/modules/anniversary/edit.js";
  "./pages/modules/album/index.js";
  "./pages/modules/album/detail.js";
  "./pages/modules/album/edit.js";
  "./pages/modules/improvement/index.js";
  "./pages/modules/improvement/detail.js";
  "./pages/modules/improvement/edit.js";
  "./pages/modules/media-viewer/index.js";
  "./pages/modules/notifications/index.js";
  "./pages/modules/coming-soon/index.js";
  "./pages/account/settings.js";
  "./pages/account/profile.js";
  "./pages/account/avatar.js";
  "./pages/account/avatar-crop.js";
  "./pages/account/relationship.js";
  "./pages/account/security.js";
  "./pages/account/data.js";
  "./pages/account/area-picker.js";
  "./pages/theme/index.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      utils_theme.applyTheme();
      utils_notificationSocket.ensureNotificationSocket();
    });
    common_vendor.onShow(() => {
      utils_theme.applyTheme();
      utils_anniversaryReminder.checkAnniversaryReminderPopup();
      utils_notificationSocket.ensureNotificationSocket();
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
};
const GlobalNotificationBanner = () => "./components/GlobalNotificationBanner.js";
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.component("GlobalNotificationBanner", GlobalNotificationBanner);
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
