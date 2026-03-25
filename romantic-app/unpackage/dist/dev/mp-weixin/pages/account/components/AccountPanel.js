"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "AccountPanel",
  props: {
    title: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.title || __props.description
      }, __props.title || __props.description ? common_vendor.e({
        b: __props.title
      }, __props.title ? {
        c: common_vendor.t(__props.title)
      } : {}, {
        d: __props.description
      }, __props.description ? {
        e: common_vendor.t(__props.description)
      } : {}) : {});
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/account/components/AccountPanel.js.map
