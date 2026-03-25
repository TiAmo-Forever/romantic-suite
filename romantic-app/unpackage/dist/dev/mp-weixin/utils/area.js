"use strict";
const common_vendor = require("../common/vendor.js");
const AREA_DRAFT_KEY = "romantic_area_draft_map";
function readAreaDraftMap() {
  const stored = common_vendor.index.getStorageSync(AREA_DRAFT_KEY);
  return stored && typeof stored === "object" ? stored : {};
}
function writeAreaDraftMap(map) {
  common_vendor.index.setStorageSync(AREA_DRAFT_KEY, map);
}
function buildAreaPickerUrl(scene, options = {}) {
  const query = [`scene=${encodeURIComponent(scene || "default")}`];
  Object.entries(options).forEach(([key, value]) => {
    if (value === void 0 || value === null || value === "")
      return;
    query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  });
  return `/pages/account/area-picker?${query.join("&")}`;
}
function saveAreaDraft(scene, area) {
  const key = String(scene || "default");
  const map = readAreaDraftMap();
  map[key] = area || null;
  writeAreaDraftMap(map);
}
function getAreaDraft(scene) {
  const key = String(scene || "default");
  const map = readAreaDraftMap();
  return map[key] || null;
}
function clearAreaDraft(scene) {
  if (!scene) {
    common_vendor.index.removeStorageSync(AREA_DRAFT_KEY);
    return;
  }
  const key = String(scene);
  const map = readAreaDraftMap();
  delete map[key];
  writeAreaDraftMap(map);
}
exports.buildAreaPickerUrl = buildAreaPickerUrl;
exports.clearAreaDraft = clearAreaDraft;
exports.getAreaDraft = getAreaDraft;
exports.saveAreaDraft = saveAreaDraft;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/area.js.map
