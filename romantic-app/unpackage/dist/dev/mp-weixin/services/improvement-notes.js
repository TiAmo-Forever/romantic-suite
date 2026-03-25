"use strict";
const utils_request = require("../utils/request.js");
function ensureSuccess(response, fallbackMessage) {
  if (!(response == null ? void 0 : response.success)) {
    throw new Error((response == null ? void 0 : response.message) || fallbackMessage);
  }
  return response.data;
}
async function fetchImprovementNoteList(status = "all") {
  const response = await utils_request.request({
    url: `/api/improvement-notes?status=${encodeURIComponent(status)}`
  });
  return ensureSuccess(response, "获取恋爱改进簿列表失败") || [];
}
async function fetchImprovementNoteDetail(id) {
  const response = await utils_request.request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}`
  });
  return ensureSuccess(response, "获取恋爱改进簿详情失败");
}
async function createImprovementNote(payload) {
  const response = await utils_request.request({
    url: "/api/improvement-notes",
    method: "POST",
    data: payload
  });
  return ensureSuccess(response, "创建恋爱改进簿失败");
}
async function updateImprovementNote(id, payload) {
  const response = await utils_request.request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}`,
    method: "PUT",
    data: payload
  });
  return ensureSuccess(response, "保存恋爱改进簿失败");
}
async function deleteImprovementNote(id) {
  const response = await utils_request.request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}`,
    method: "DELETE"
  });
  return ensureSuccess(response, "删除恋爱改进簿失败");
}
async function addImprovementFeedback(id, payload) {
  const response = await utils_request.request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}/feedback`,
    method: "POST",
    data: payload
  });
  return ensureSuccess(response, "记录反馈失败");
}
async function updateImprovementFeedback(id, feedbackId, payload) {
  const response = await utils_request.request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}/feedback/${encodeURIComponent(feedbackId)}`,
    method: "PUT",
    data: payload
  });
  return ensureSuccess(response, "更新反馈失败");
}
exports.addImprovementFeedback = addImprovementFeedback;
exports.createImprovementNote = createImprovementNote;
exports.deleteImprovementNote = deleteImprovementNote;
exports.fetchImprovementNoteDetail = fetchImprovementNoteDetail;
exports.fetchImprovementNoteList = fetchImprovementNoteList;
exports.updateImprovementFeedback = updateImprovementFeedback;
exports.updateImprovementNote = updateImprovementNote;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/improvement-notes.js.map
