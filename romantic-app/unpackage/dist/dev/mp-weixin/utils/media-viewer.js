"use strict";
const utils_nav = require("./nav.js");
function openMediaViewer(mediaList = [], startIndex = 0) {
  const safeList = (Array.isArray(mediaList) ? mediaList : []).map((item) => ({
    mediaType: String((item == null ? void 0 : item.mediaType) || "").trim(),
    fileUrl: String((item == null ? void 0 : item.fileUrl) || "").trim(),
    thumbnailUrl: String((item == null ? void 0 : item.thumbnailUrl) || "").trim()
  })).filter((item) => item.mediaType && item.fileUrl);
  if (!safeList.length) {
    return;
  }
  const encodedItems = encodeURIComponent(JSON.stringify(safeList));
  const safeIndex = Math.max(0, Math.min(Number(startIndex || 0), safeList.length - 1));
  utils_nav.goPage(`/pages/modules/media-viewer/index?items=${encodedItems}&index=${safeIndex}`);
}
exports.openMediaViewer = openMediaViewer;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/media-viewer.js.map
