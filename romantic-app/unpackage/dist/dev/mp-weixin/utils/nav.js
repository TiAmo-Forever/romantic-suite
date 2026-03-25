"use strict";
const common_vendor = require("../common/vendor.js");
function goPage(url) {
  common_vendor.index.navigateTo({ url, animationType: "pop-in", animationDuration: 220 });
}
function switchRootPage(url) {
  common_vendor.index.reLaunch({ url });
}
function openHomePage() {
  switchRootPage("/pages/home/home");
}
function backPage() {
  common_vendor.index.navigateBack({ animationType: "pop-out", animationDuration: 200 });
}
exports.backPage = backPage;
exports.goPage = goPage;
exports.openHomePage = openHomePage;
exports.switchRootPage = switchRootPage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/nav.js.map
