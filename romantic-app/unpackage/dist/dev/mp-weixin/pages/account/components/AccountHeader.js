"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_nav = require("../../../utils/nav.js");
const _sfc_main = {
  __name: "AccountHeader",
  props: {
    title: {
      type: String,
      required: true
    },
    eyebrow: {
      type: String,
      default: "Account"
    }
  },
  setup(__props) {
    function handleBack() {
      utils_nav.backPage();
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleBack, "30"),
        b: common_vendor.t(__props.eyebrow),
        c: common_vendor.t(__props.title)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cde7421c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/account/components/AccountHeader.js.map
