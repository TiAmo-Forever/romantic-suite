"use strict";
const common_vendor = require("../common/vendor.js");
function cleanRegionParts(parts = []) {
  return parts.map((item) => String(item || "").trim()).filter(Boolean);
}
function formatRegionLabel(parts = []) {
  const cleaned = cleanRegionParts(parts);
  return cleaned.join(" ");
}
function extractLocationLabel(location = {}) {
  const parts = cleanRegionParts([
    location.province,
    location.city,
    location.district
  ]);
  if (parts.length) {
    return formatRegionLabel(parts);
  }
  return String(location.address || "").trim();
}
function getCurrentLocationInfo() {
  return new Promise((resolve, reject) => {
    common_vendor.index.getLocation({
      type: "gcj02",
      geocode: true,
      success(result) {
        var _a, _b, _c;
        const location = {
          province: String(((_a = result.addressInfo) == null ? void 0 : _a.province) || result.province || "").trim(),
          city: String(((_b = result.addressInfo) == null ? void 0 : _b.city) || result.city || "").trim(),
          district: String(((_c = result.addressInfo) == null ? void 0 : _c.district) || result.district || "").trim(),
          label: extractLocationLabel(result)
        };
        if (!location.label) {
          reject(new Error("暂时无法识别当前位置"));
          return;
        }
        resolve(location);
      },
      fail(error) {
        reject(error);
      }
    });
  });
}
exports.getCurrentLocationInfo = getCurrentLocationInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/location.js.map
