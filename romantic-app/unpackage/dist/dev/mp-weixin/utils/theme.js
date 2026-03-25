"use strict";
const common_vendor = require("../common/vendor.js");
const utils_profile = require("./profile.js");
const THEME_KEY = "romantic_theme_settings";
const USER_KEY = "romantic_user";
const themePresets = [
  {
    key: "pink",
    name: "心动粉",
    description: "延续现在这套粉白渐变，温柔又稳定。",
    swatches: ["#ff7ea6", "#ffb3c7", "#fff3f7"],
    variables: {
      "--app-color-primary": "#ff5e8a",
      "--app-color-primary-strong": "#ff4f7d",
      "--app-color-primary-soft": "#ff9fbc",
      "--app-color-accent": "#d89cad",
      "--app-color-text": "#8f6b77",
      "--app-color-text-strong": "#5c4550",
      "--app-color-surface": "rgba(255, 255, 255, 0.92)",
      "--app-color-surface-soft": "#fff6f9",
      "--app-gradient-primary": "linear-gradient(135deg, #ff7ea6, #ff9fbc)",
      "--app-gradient-hero": "linear-gradient(135deg, #ff8dac, #ffb3c7)",
      "--app-page-gradient-main": "linear-gradient(180deg, #fff2f6 0%, #ffe8f0 100%)",
      "--app-page-gradient-soft": "linear-gradient(180deg, #fff6fa 0%, #ffeef4 100%)",
      "--app-page-glow-strong": "rgba(255, 192, 203, 0.3)",
      "--app-page-glow-mid": "rgba(255, 182, 193, 0.24)",
      "--app-page-glow-soft": "rgba(255, 228, 236, 0.45)",
      "--app-page-orb-a": "rgba(255, 215, 228, 0.42)",
      "--app-page-orb-b": "rgba(255, 232, 238, 0.5)",
      "--app-card-gradient-soft": "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 247, 249, 0.98) 100%)",
      "--app-shadow-card": "0 18rpx 42rpx rgba(255, 128, 160, 0.12)",
      "--app-shadow-soft": "0 12rpx 24rpx rgba(255, 156, 181, 0.1)",
      "--app-page-background": "#ffd7e2"
    }
  },
  {
    key: "apricot",
    name: "奶油杏",
    description: "更柔和、更治愈，适合想把氛围做得轻一点。",
    swatches: ["#ff9f7a", "#ffd4b8", "#fff8f2"],
    variables: {
      "--app-color-primary": "#ff8b63",
      "--app-color-primary-strong": "#f26f43",
      "--app-color-primary-soft": "#ffc1a0",
      "--app-color-accent": "#d7a78e",
      "--app-color-text": "#8e6c61",
      "--app-color-text-strong": "#5f4a43",
      "--app-color-surface": "rgba(255, 255, 255, 0.94)",
      "--app-color-surface-soft": "#fff8f2",
      "--app-gradient-primary": "linear-gradient(135deg, #ff9a6e, #ffc8a7)",
      "--app-gradient-hero": "linear-gradient(135deg, #ffb28d, #ffd8bf)",
      "--app-page-gradient-main": "linear-gradient(180deg, #fff6f1 0%, #ffecdf 100%)",
      "--app-page-gradient-soft": "linear-gradient(180deg, #fff9f4 0%, #fff1e7 100%)",
      "--app-page-glow-strong": "rgba(255, 214, 189, 0.34)",
      "--app-page-glow-mid": "rgba(255, 199, 167, 0.24)",
      "--app-page-glow-soft": "rgba(255, 239, 225, 0.5)",
      "--app-page-orb-a": "rgba(255, 217, 195, 0.42)",
      "--app-page-orb-b": "rgba(255, 241, 230, 0.54)",
      "--app-card-gradient-soft": "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 248, 242, 0.98) 100%)",
      "--app-shadow-card": "0 18rpx 42rpx rgba(255, 169, 128, 0.14)",
      "--app-shadow-soft": "0 12rpx 24rpx rgba(255, 193, 148, 0.12)",
      "--app-page-background": "#ffe6d7"
    }
  },
  {
    key: "night",
    name: "星夜蓝",
    description: "更安静，也更像陪伴型产品的夜晚气质。",
    swatches: ["#6d7cff", "#9db2ff", "#eef1ff"],
    variables: {
      "--app-color-primary": "#6d7cff",
      "--app-color-primary-strong": "#5667f2",
      "--app-color-primary-soft": "#9fb0ff",
      "--app-color-accent": "#9ea8d7",
      "--app-color-text": "#6d7391",
      "--app-color-text-strong": "#48506a",
      "--app-color-surface": "rgba(255, 255, 255, 0.93)",
      "--app-color-surface-soft": "#f3f5ff",
      "--app-gradient-primary": "linear-gradient(135deg, #6d7cff, #9db2ff)",
      "--app-gradient-hero": "linear-gradient(135deg, #8390ff, #b8c4ff)",
      "--app-page-gradient-main": "linear-gradient(180deg, #f3f5ff 0%, #e8edff 100%)",
      "--app-page-gradient-soft": "linear-gradient(180deg, #f8f9ff 0%, #eff2ff 100%)",
      "--app-page-glow-strong": "rgba(175, 187, 255, 0.3)",
      "--app-page-glow-mid": "rgba(157, 178, 255, 0.24)",
      "--app-page-glow-soft": "rgba(232, 237, 255, 0.56)",
      "--app-page-orb-a": "rgba(197, 207, 255, 0.42)",
      "--app-page-orb-b": "rgba(236, 240, 255, 0.54)",
      "--app-card-gradient-soft": "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(243, 246, 255, 0.98) 100%)",
      "--app-shadow-card": "0 18rpx 42rpx rgba(120, 137, 255, 0.14)",
      "--app-shadow-soft": "0 12rpx 24rpx rgba(157, 178, 255, 0.12)",
      "--app-page-background": "#dfe5ff"
    }
  },
  {
    key: "mint",
    name: "薄荷绿",
    description: "清爽、轻盈，适合想把页面做得更干净。",
    swatches: ["#52c7b8", "#9be7dc", "#effcf9"],
    variables: {
      "--app-color-primary": "#47b9aa",
      "--app-color-primary-strong": "#309a8d",
      "--app-color-primary-soft": "#8fe0d4",
      "--app-color-accent": "#8bbeb6",
      "--app-color-text": "#64847f",
      "--app-color-text-strong": "#44615d",
      "--app-color-surface": "rgba(255, 255, 255, 0.94)",
      "--app-color-surface-soft": "#f1fffb",
      "--app-gradient-primary": "linear-gradient(135deg, #52c7b8, #93e3d7)",
      "--app-gradient-hero": "linear-gradient(135deg, #6fd5c7, #b4f0e8)",
      "--app-page-gradient-main": "linear-gradient(180deg, #f2fffb 0%, #e3f8f2 100%)",
      "--app-page-gradient-soft": "linear-gradient(180deg, #f7fffd 0%, #edfdf8 100%)",
      "--app-page-glow-strong": "rgba(155, 231, 220, 0.3)",
      "--app-page-glow-mid": "rgba(143, 224, 212, 0.24)",
      "--app-page-glow-soft": "rgba(223, 248, 243, 0.58)",
      "--app-page-orb-a": "rgba(180, 241, 232, 0.42)",
      "--app-page-orb-b": "rgba(236, 255, 250, 0.54)",
      "--app-card-gradient-soft": "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 255, 251, 0.98) 100%)",
      "--app-shadow-card": "0 18rpx 42rpx rgba(82, 199, 184, 0.14)",
      "--app-shadow-soft": "0 12rpx 24rpx rgba(147, 227, 215, 0.12)",
      "--app-page-background": "#d9f4ee"
    }
  }
];
const defaultThemeSettings = {
  presetKey: "pink"
};
function getThemePresetMap() {
  return themePresets.reduce((accumulator, item) => {
    accumulator[item.key] = item;
    return accumulator;
  }, {});
}
function normalizeThemeSettings(settings) {
  const presetMap = getThemePresetMap();
  const payload = {
    ...defaultThemeSettings,
    ...settings
  };
  if (!presetMap[payload.presetKey]) {
    payload.presetKey = defaultThemeSettings.presetKey;
  }
  return payload;
}
function getCurrentUsername() {
  var _a;
  return String(((_a = common_vendor.index.getStorageSync(USER_KEY)) == null ? void 0 : _a.username) || "").trim();
}
function getUserThemeKey() {
  const username = getCurrentUsername();
  return username ? `${THEME_KEY}_${username}` : THEME_KEY;
}
function getProfileThemeSettings() {
  const profile = utils_profile.getProfile();
  if (!profile || typeof profile !== "object") {
    return null;
  }
  const presetKey = String(profile.themePresetKey || "").trim();
  if (!presetKey) {
    return null;
  }
  return normalizeThemeSettings({ presetKey });
}
function readRawThemeSettings() {
  return common_vendor.index.getStorageSync(getUserThemeKey());
}
function migrateLegacyThemeSettings() {
  const userThemeKey = getUserThemeKey();
  if (userThemeKey === THEME_KEY) {
    return;
  }
  const currentStored = common_vendor.index.getStorageSync(userThemeKey);
  if (currentStored && typeof currentStored === "object") {
    return;
  }
  const legacyStored = common_vendor.index.getStorageSync(THEME_KEY);
  if (!legacyStored || typeof legacyStored !== "object") {
    return;
  }
  common_vendor.index.setStorageSync(userThemeKey, normalizeThemeSettings(legacyStored));
}
function syncProfileThemePreset(presetKey) {
  const profile = utils_profile.getProfile();
  if (!profile || profile.themePresetKey === presetKey) {
    return;
  }
  utils_profile.saveProfile({
    ...profile,
    themePresetKey: presetKey
  });
}
function getThemePresets() {
  return themePresets.map((item) => ({
    ...item,
    swatches: [...item.swatches],
    variables: { ...item.variables }
  }));
}
function getThemeSettings() {
  const profileTheme = getProfileThemeSettings();
  if (profileTheme) {
    return profileTheme;
  }
  migrateLegacyThemeSettings();
  const stored = readRawThemeSettings();
  if (!stored || typeof stored !== "object") {
    return { ...defaultThemeSettings };
  }
  return normalizeThemeSettings(stored);
}
function saveThemeSettings(settings) {
  const payload = normalizeThemeSettings(settings);
  common_vendor.index.setStorageSync(getUserThemeKey(), payload);
  syncProfileThemePreset(payload.presetKey);
  return payload;
}
function getCurrentThemePreset(settings = getThemeSettings()) {
  const presetMap = getThemePresetMap();
  const preset = presetMap[settings.presetKey] || presetMap[defaultThemeSettings.presetKey];
  return {
    ...preset,
    swatches: [...preset.swatches],
    variables: { ...preset.variables }
  };
}
function applyTheme(settings = getThemeSettings()) {
  const normalizedSettings = normalizeThemeSettings(settings);
  const preset = getCurrentThemePreset(normalizedSettings);
  const root = typeof document !== "undefined" ? document.documentElement : null;
  if (root) {
    Object.entries(preset.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
  common_vendor.index.$emit("theme:changed", { ...preset });
  return preset;
}
function saveAndApplyTheme(settings) {
  const payload = saveThemeSettings(settings);
  return applyTheme(payload);
}
exports.applyTheme = applyTheme;
exports.getCurrentThemePreset = getCurrentThemePreset;
exports.getThemePresets = getThemePresets;
exports.getThemeSettings = getThemeSettings;
exports.saveAndApplyTheme = saveAndApplyTheme;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/theme.js.map
