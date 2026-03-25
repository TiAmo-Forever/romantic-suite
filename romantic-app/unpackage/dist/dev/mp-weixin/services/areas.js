"use strict";
const utils_request = require("../utils/request.js");
function ensureSuccess(response, fallbackMessage) {
  if (!(response == null ? void 0 : response.success)) {
    throw new Error((response == null ? void 0 : response.message) || fallbackMessage);
  }
  return response.data || [];
}
async function fetchProvinces() {
  const response = await utils_request.request({
    url: "/api/areas/provinces"
  });
  return ensureSuccess(response, "获取省份列表失败");
}
async function fetchAreaChildren(parentId) {
  const response = await utils_request.request({
    url: `/api/areas/children?parentId=${encodeURIComponent(parentId)}`
  });
  return ensureSuccess(response, "获取下级地区失败");
}
async function fetchAreaDetail(id) {
  const response = await utils_request.request({
    url: `/api/areas/${encodeURIComponent(id)}`
  });
  const data = ensureSuccess(response, "获取地区详情失败");
  return data || null;
}
async function searchAreas(keyword, level = null, limit = 20) {
  const query = [`keyword=${encodeURIComponent(keyword)}`, `limit=${encodeURIComponent(limit)}`];
  if (level !== null && level !== void 0) {
    query.push(`level=${encodeURIComponent(level)}`);
  }
  const response = await utils_request.request({
    url: `/api/areas/search?${query.join("&")}`
  });
  return ensureSuccess(response, "搜索地区失败");
}
exports.fetchAreaChildren = fetchAreaChildren;
exports.fetchAreaDetail = fetchAreaDetail;
exports.fetchProvinces = fetchProvinces;
exports.searchAreas = searchAreas;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/areas.js.map
