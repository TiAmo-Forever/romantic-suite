"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const services_profile = require("../../services/profile.js");
const utils_theme = require("../../utils/theme.js");
const utils_useThemePage = require("../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  (AccountHeader + AccountPanel)();
}
const AccountHeader = () => "../account/components/AccountHeader.js";
const AccountPanel = () => "../account/components/AccountPanel.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const presets = utils_theme.getThemePresets();
    const themeSettings = common_vendor.ref(utils_theme.getThemeSettings());
    const draftPresetKey = common_vendor.ref(themeSettings.value.presetKey);
    const currentPreset = common_vendor.computed(() => utils_theme.getCurrentThemePreset({ presetKey: draftPresetKey.value }));
    const heroStyle = common_vendor.computed(() => ({ background: currentPreset.value.variables["--app-gradient-hero"] }));
    common_vendor.onLoad(() => {
      utils_auth.requireAuth();
    });
    common_vendor.onShow(async () => {
      if (!utils_auth.requireAuth())
        return;
      try {
        await services_profile.fetchRemoteProfile();
      } catch (error) {
      }
      themeSettings.value = utils_theme.getThemeSettings();
      draftPresetKey.value = themeSettings.value.presetKey;
    });
    function getPreviewStyle(item) {
      return {
        background: item.variables["--app-gradient-hero"]
      };
    }
    function selectPreset(key) {
      draftPresetKey.value = key;
      utils_theme.applyTheme({ presetKey: key });
    }
    async function handleReset() {
      const previousSettings = { ...themeSettings.value };
      const payload = { presetKey: "pink" };
      try {
        utils_theme.applyTheme(payload);
        await services_profile.updateRemoteProfile({ themePresetKey: payload.presetKey });
        themeSettings.value = payload;
        draftPresetKey.value = payload.presetKey;
        utils_theme.saveAndApplyTheme(payload);
        common_vendor.index.showToast({ title: "已恢复默认主题", icon: "none" });
      } catch (error) {
        themeSettings.value = previousSettings;
        draftPresetKey.value = previousSettings.presetKey;
        utils_theme.saveAndApplyTheme(previousSettings);
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "恢复默认主题失败", icon: "none" });
      }
    }
    async function handleSave() {
      try {
        themeSettings.value = { presetKey: draftPresetKey.value };
        await services_profile.updateRemoteProfile({ themePresetKey: themeSettings.value.presetKey });
        utils_theme.saveAndApplyTheme(themeSettings.value);
        common_vendor.index.showToast({ title: "主题已保存", icon: "success" });
      } catch (error) {
        themeSettings.value = utils_theme.getThemeSettings();
        draftPresetKey.value = themeSettings.value.presetKey;
        utils_theme.saveAndApplyTheme(themeSettings.value);
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "主题保存失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          title: "主题设置",
          eyebrow: "视觉风格"
        }),
        b: common_vendor.t(currentPreset.value.name),
        c: common_vendor.t(currentPreset.value.description),
        d: common_vendor.f(currentPreset.value.swatches, (color, k0, i0) => {
          return {
            a: color,
            b: color
          };
        }),
        e: common_vendor.s(heroStyle.value),
        f: common_vendor.p({
          title: "当前主题",
          description: "切换后会立即应用到首页、星球、我的和设置页。"
        }),
        g: common_vendor.f(common_vendor.unref(presets), (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.name),
            b: common_vendor.s(getPreviewStyle(item)),
            c: common_vendor.t(item.name),
            d: draftPresetKey.value === item.key
          }, draftPresetKey.value === item.key ? {} : {}, {
            e: common_vendor.t(item.description),
            f: common_vendor.f(item.swatches, (color, k1, i1) => {
              return {
                a: color,
                b: color
              };
            }),
            g: item.key,
            h: draftPresetKey.value === item.key ? 1 : "",
            i: common_vendor.o(($event) => selectPreset(item.key), item.key)
          });
        }),
        h: common_vendor.p({
          title: "预设主题",
          description: "第一期先提供 4 套预设主题，保证整体视觉统一。"
        }),
        i: common_vendor.o(handleReset, "1a"),
        j: common_vendor.o(handleSave, "bc"),
        k: common_vendor.s(common_vendor.unref(themeStyle))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-55b8e6b7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/theme/index.js.map
