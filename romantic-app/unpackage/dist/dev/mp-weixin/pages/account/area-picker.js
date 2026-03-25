"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const services_areas = require("../../services/areas.js");
const utils_area = require("../../utils/area.js");
const utils_nav = require("../../utils/nav.js");
const utils_useThemePage = require("../../utils/useThemePage.js");
if (!Array) {
  const _component_GlobalNotificationBanner = common_vendor.resolveComponent("GlobalNotificationBanner");
  _component_GlobalNotificationBanner();
}
if (!Math) {
  (AccountHeader + AccountField + AccountPanel)();
}
const AccountField = () => "./components/AccountField.js";
const AccountHeader = () => "./components/AccountHeader.js";
const AccountPanel = () => "./components/AccountPanel.js";
const _sfc_main = {
  __name: "area-picker",
  setup(__props) {
    const TEXT = {
      eyebrow: "三级地点选择",
      panelTitle: "地点填写",
      panelDesc: "支持直接手动输入，也支持从左到右选择省、市、区。选好后会尽量少打断当前页面的编辑流程。",
      inputLabel: "地点名称",
      inputHint: "可以直接填写，也可以输入关键字后从下方匹配结果里选择已有地区。",
      inputPlaceholder: "例如：杭州市西湖区、上海迪士尼、广州南站",
      selectionTitle: "联动选择",
      selectionDesc: "从左到右依次选择，越往后越精确。",
      provinceLabel: "省份",
      cityLabel: "城市",
      districtLabel: "区县",
      cityEmpty: "先选择省份",
      districtEmpty: "区县可选填",
      useSelected: "使用当前选择",
      useManual: "使用手动输入",
      emptyLabel: "还没有选地点",
      pageTitleDefault: "地点选择",
      pageTitleProfile: "所在城市",
      pageTitleMeeting: "见面城市",
      pageTitleAnniversary: "纪念日地点",
      pageTitleCountdown: "见面地点",
      loadError: "地区数据加载失败",
      selectFirst: "请先选择省市区，或改用手动输入",
      inputFirst: "请先输入地点名称"
    };
    const { themeStyle } = utils_useThemePage.useThemePage();
    const pageTitle = common_vendor.ref(TEXT.pageTitleDefault);
    const scene = common_vendor.ref("default");
    const manualValue = common_vendor.ref("");
    const provinceOptions = common_vendor.ref([]);
    const cityOptions = common_vendor.ref([]);
    const districtOptions = common_vendor.ref([]);
    const provinceId = common_vendor.ref(0);
    const cityId = common_vendor.ref(0);
    const districtId = common_vendor.ref(0);
    const searchResults = common_vendor.ref([]);
    let searchTimer = null;
    const selectedProvince = common_vendor.computed(() => provinceOptions.value.find((item) => item.id === provinceId.value) || null);
    const selectedCity = common_vendor.computed(() => cityOptions.value.find((item) => item.id === cityId.value) || null);
    const selectedDistrict = common_vendor.computed(() => districtOptions.value.find((item) => item.id === districtId.value) || null);
    const selectedArea = common_vendor.computed(() => selectedDistrict.value || selectedCity.value || selectedProvince.value || null);
    const selectedLabel = common_vendor.computed(() => {
      var _a, _b;
      return ((_a = selectedArea.value) == null ? void 0 : _a.mergerName) || ((_b = selectedArea.value) == null ? void 0 : _b.name) || manualValue.value.trim() || TEXT.emptyLabel;
    });
    common_vendor.onLoad(async (options) => {
      if (!utils_auth.requireAuth())
        return;
      scene.value = String((options == null ? void 0 : options.scene) || "default");
      pageTitle.value = buildPageTitle(scene.value);
      manualValue.value = decodeRouteValue(options == null ? void 0 : options.value);
      utils_area.clearAreaDraft(scene.value);
      await initAreas();
      const areaId = Number((options == null ? void 0 : options.areaId) || 0);
      if (areaId > 0) {
        await restoreAreaSelection(areaId);
      }
    });
    function decodeRouteValue(value) {
      const text = String(value || "").trim();
      if (!text)
        return "";
      try {
        return decodeURIComponent(text);
      } catch (error) {
        return text;
      }
    }
    function buildPageTitle(currentScene) {
      if (currentScene === "profile_city")
        return TEXT.pageTitleProfile;
      if (currentScene === "relationship_meeting")
        return TEXT.pageTitleMeeting;
      if (currentScene === "anniversary_location")
        return TEXT.pageTitleAnniversary;
      if (currentScene === "countdown_place")
        return TEXT.pageTitleCountdown;
      return TEXT.pageTitleDefault;
    }
    async function initAreas() {
      try {
        provinceOptions.value = await services_areas.fetchProvinces();
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || TEXT.loadError, icon: "none" });
      }
    }
    async function restoreAreaSelection(areaId) {
      try {
        const area = await services_areas.fetchAreaDetail(areaId);
        if (!area)
          return;
        if (area.level === 0) {
          await handleProvinceClick(area);
          return;
        }
        const parent = await services_areas.fetchAreaDetail(area.parentId);
        if (!parent)
          return;
        if (parent.level === 0) {
          await handleProvinceClick(parent);
          await handleCityClick(area);
          return;
        }
        const province = await services_areas.fetchAreaDetail(parent.parentId);
        if (!province)
          return;
        await handleProvinceClick(province);
        await handleCityClick(parent);
        handleDistrictClick(area);
      } catch (error) {
      }
    }
    async function handleProvinceClick(area) {
      provinceId.value = area.id;
      cityId.value = 0;
      districtId.value = 0;
      cityOptions.value = await services_areas.fetchAreaChildren(area.id);
      districtOptions.value = [];
      updateManualValueFromSelection();
    }
    async function handleCityClick(area) {
      cityId.value = area.id;
      districtId.value = 0;
      districtOptions.value = await services_areas.fetchAreaChildren(area.id);
      updateManualValueFromSelection();
    }
    function handleDistrictClick(area) {
      districtId.value = area.id;
      updateManualValueFromSelection();
    }
    function updateManualValueFromSelection() {
      if (selectedArea.value) {
        manualValue.value = selectedArea.value.mergerName || selectedArea.value.name;
      }
    }
    function handleManualInput(event) {
      var _a;
      manualValue.value = ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.value) || manualValue.value;
      scheduleSearch();
    }
    function scheduleSearch() {
      if (searchTimer)
        clearTimeout(searchTimer);
      const keyword = manualValue.value.trim();
      if (keyword.length < 2) {
        searchResults.value = [];
        return;
      }
      searchTimer = setTimeout(async () => {
        try {
          searchResults.value = await services_areas.searchAreas(keyword, null, 8);
        } catch (error) {
          searchResults.value = [];
        }
      }, 180);
    }
    async function applySearchResult(area) {
      manualValue.value = area.mergerName || area.name;
      searchResults.value = [];
      await restoreAreaSelection(area.id);
    }
    function saveAndBack(payload) {
      utils_area.saveAreaDraft(scene.value, payload);
      utils_nav.backPage();
    }
    function handleUseSelected() {
      if (!selectedArea.value) {
        common_vendor.index.showToast({ title: TEXT.selectFirst, icon: "none" });
        return;
      }
      saveAndBack({
        id: selectedArea.value.id,
        name: selectedArea.value.name,
        mergerName: selectedArea.value.mergerName || selectedArea.value.name,
        displayText: selectedArea.value.mergerName || selectedArea.value.name,
        isManual: false
      });
    }
    function handleUseManual() {
      const value = manualValue.value.trim();
      if (!value) {
        common_vendor.index.showToast({ title: TEXT.inputFirst, icon: "none" });
        return;
      }
      saveAndBack({
        id: 0,
        name: value,
        mergerName: value,
        displayText: value,
        isManual: true
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: pageTitle.value,
          eyebrow: TEXT.eyebrow
        }),
        b: TEXT.inputPlaceholder,
        c: common_vendor.o([($event) => manualValue.value = $event.detail.value, handleManualInput], "ae"),
        d: manualValue.value,
        e: common_vendor.p({
          label: TEXT.inputLabel,
          hint: TEXT.inputHint
        }),
        f: searchResults.value.length
      }, searchResults.value.length ? {
        g: common_vendor.f(searchResults.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: common_vendor.t(item.mergerName || item.name),
            c: item.id,
            d: common_vendor.o(($event) => applySearchResult(item), item.id)
          };
        })
      } : {}, {
        h: common_vendor.t(TEXT.selectionTitle),
        i: common_vendor.t(TEXT.selectionDesc),
        j: common_vendor.t(selectedLabel.value),
        k: common_vendor.t(TEXT.provinceLabel),
        l: common_vendor.f(provinceOptions.value, (item, k0, i0) => {
          var _a;
          return {
            a: common_vendor.t(item.name),
            b: item.id,
            c: ((_a = selectedProvince.value) == null ? void 0 : _a.id) === item.id ? 1 : "",
            d: common_vendor.o(($event) => handleProvinceClick(item), item.id)
          };
        }),
        m: common_vendor.t(TEXT.cityLabel),
        n: common_vendor.f(cityOptions.value, (item, k0, i0) => {
          var _a;
          return {
            a: common_vendor.t(item.name),
            b: item.id,
            c: ((_a = selectedCity.value) == null ? void 0 : _a.id) === item.id ? 1 : "",
            d: common_vendor.o(($event) => handleCityClick(item), item.id)
          };
        }),
        o: !cityOptions.value.length
      }, !cityOptions.value.length ? {
        p: common_vendor.t(TEXT.cityEmpty)
      } : {}, {
        q: common_vendor.t(TEXT.districtLabel),
        r: common_vendor.f(districtOptions.value, (item, k0, i0) => {
          var _a;
          return {
            a: common_vendor.t(item.name),
            b: item.id,
            c: ((_a = selectedDistrict.value) == null ? void 0 : _a.id) === item.id ? 1 : "",
            d: common_vendor.o(($event) => handleDistrictClick(item), item.id)
          };
        }),
        s: !districtOptions.value.length
      }, !districtOptions.value.length ? {
        t: common_vendor.t(TEXT.districtEmpty)
      } : {}, {
        v: common_vendor.t(TEXT.useSelected),
        w: common_vendor.o(handleUseSelected, "5c"),
        x: common_vendor.t(TEXT.useManual),
        y: common_vendor.o(handleUseManual, "2b"),
        z: common_vendor.p({
          title: TEXT.panelTitle,
          description: TEXT.panelDesc
        }),
        A: common_vendor.s(common_vendor.unref(themeStyle))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-905c5663"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/area-picker.js.map
