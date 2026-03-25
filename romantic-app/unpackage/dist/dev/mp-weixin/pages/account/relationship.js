"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_account = require("../../utils/account.js");
const utils_area = require("../../utils/area.js");
const services_areas = require("../../services/areas.js");
const utils_location = require("../../utils/location.js");
const utils_profile = require("../../utils/profile.js");
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
  __name: "relationship",
  setup(__props) {
    const { themeStyle } = utils_useThemePage.useThemePage();
    const form = common_vendor.reactive(utils_profile.getProfile());
    common_vendor.onLoad(() => {
      utils_auth.requireAuth();
    });
    common_vendor.onShow(() => {
      const draft = utils_area.getAreaDraft("relationship_meeting");
      if (!draft)
        return;
      form.defaultMeetingAreaId = draft.id || 0;
      form.defaultMeetingPlace = draft.displayText || draft.mergerName || draft.name || "";
      utils_area.clearAreaDraft("relationship_meeting");
    });
    function handleAnniversaryChange(event) {
      form.anniversaryDate = event.detail.value;
    }
    function openAreaPicker() {
      utils_nav.goPage(utils_area.buildAreaPickerUrl("relationship_meeting", {
        value: form.defaultMeetingPlace || "",
        areaId: Number(form.defaultMeetingAreaId || 0)
      }));
    }
    async function useCurrentLocation() {
      try {
        const location = await utils_location.getCurrentLocationInfo();
        const keywords = [location.district, location.city, location.province].filter(Boolean);
        let matchedArea = null;
        for (const keyword of keywords) {
          const result = await services_areas.searchAreas(keyword, null, 10);
          matchedArea = result.find((item) => item.name === keyword || item.shortName === keyword) || result[0];
          if (matchedArea)
            break;
        }
        form.defaultMeetingAreaId = (matchedArea == null ? void 0 : matchedArea.id) || 0;
        form.defaultMeetingPlace = (matchedArea == null ? void 0 : matchedArea.mergerName) || location.label;
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "定位失败，请检查定位权限", icon: "none" });
      }
    }
    async function handleSave() {
      try {
        await utils_account.saveProfilePatchAndBack({
          loverNickname: (form.loverNickname || "").trim() || (form.nickname || "").trim() || "恋人",
          defaultMeetingAreaId: Number(form.defaultMeetingAreaId || 0),
          defaultMeetingPlace: (form.defaultMeetingPlace || "").trim() || "以后再定",
          anniversaryDate: form.anniversaryDate
        }, "关系信息已保存");
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "关系信息保存失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          title: "关系信息",
          eyebrow: "关系编辑"
        }),
        b: form.loverNickname,
        c: common_vendor.o(($event) => form.loverNickname = $event.detail.value, "13"),
        d: common_vendor.p({
          label: "对方对你的称呼"
        }),
        e: common_vendor.t(form.defaultMeetingPlace || "请选择你们常去的地方"),
        f: common_vendor.o(openAreaPicker, "93"),
        g: common_vendor.p({
          label: "默认见面地点"
        }),
        h: common_vendor.o(openAreaPicker, "ee"),
        i: common_vendor.o(useCurrentLocation, "4c"),
        j: common_vendor.t(form.anniversaryDate || "请选择纪念日"),
        k: form.anniversaryDate,
        l: common_vendor.o(handleAnniversaryChange, "88"),
        m: common_vendor.p({
          label: "恋爱纪念日"
        }),
        n: common_vendor.p({
          title: "关系设定"
        }),
        o: common_vendor.o(handleSave, "c5"),
        p: common_vendor.s(common_vendor.unref(themeStyle))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fad2fa27"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/relationship.js.map
