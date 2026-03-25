"use strict";
const common_vendor = require("../common/vendor.js");
function previewImages(urls, current = "") {
  const validUrls = (Array.isArray(urls) ? urls : [urls]).map((item) => String(item || "").trim()).filter(Boolean);
  if (!validUrls.length) {
    return;
  }
  common_vendor.index.previewImage({
    urls: validUrls,
    current: current || validUrls[0],
    indicator: "number",
    loop: true
  });
}
exports.previewImages = previewImages;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/image-preview.js.map
