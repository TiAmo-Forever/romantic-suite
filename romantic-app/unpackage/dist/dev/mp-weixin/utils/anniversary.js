"use strict";
const common_vendor = require("../common/vendor.js");
const ANNIVERSARY_CACHE_KEY = "romantic_anniversary_list";
function saveAnniversaryListCache(list) {
  common_vendor.index.setStorageSync(ANNIVERSARY_CACHE_KEY, Array.isArray(list) ? list : []);
}
function getAnniversaryListCache() {
  const cached = common_vendor.index.getStorageSync(ANNIVERSARY_CACHE_KEY);
  return Array.isArray(cached) ? cached : [];
}
exports.getAnniversaryListCache = getAnniversaryListCache;
exports.saveAnniversaryListCache = saveAnniversaryListCache;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/anniversary.js.map
