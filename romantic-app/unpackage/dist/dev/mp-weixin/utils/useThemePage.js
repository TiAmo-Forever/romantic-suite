"use strict";
const common_vendor = require("../common/vendor.js");
const utils_theme = require("./theme.js");
function useThemePage() {
  const themeStyle = common_vendor.ref({ ...utils_theme.getCurrentThemePreset(utils_theme.getThemeSettings()).variables });
  function syncTheme() {
    themeStyle.value = { ...utils_theme.getCurrentThemePreset(utils_theme.getThemeSettings()).variables };
  }
  const handleThemeChange = () => {
    syncTheme();
  };
  common_vendor.onShow(() => {
    syncTheme();
  });
  common_vendor.index.$on("theme:changed", handleThemeChange);
  common_vendor.onUnmounted(() => {
    common_vendor.index.$off("theme:changed", handleThemeChange);
  });
  return {
    themeStyle,
    syncTheme
  };
}
exports.useThemePage = useThemePage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/useThemePage.js.map
