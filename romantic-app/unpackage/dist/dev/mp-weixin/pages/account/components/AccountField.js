"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "AccountField",
  props: {
    label: {
      type: String,
      default: ""
    },
    hint: {
      type: String,
      default: ""
    },
    bare: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    const props = __props;
    const wrapperClass = common_vendor.computed(() => ({
      "app-account-form-item-compact": props.compact
    }));
    const contentClass = common_vendor.computed(() => props.bare ? "" : "app-input-shell");
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.label
      }, __props.label ? {
        b: common_vendor.t(__props.label)
      } : {}, {
        c: common_vendor.n(contentClass.value),
        d: __props.hint
      }, __props.hint ? {
        e: common_vendor.t(__props.hint)
      } : {}, {
        f: common_vendor.n(wrapperClass.value)
      });
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/account/components/AccountField.js.map
