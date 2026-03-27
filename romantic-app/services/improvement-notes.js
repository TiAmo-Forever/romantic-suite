import { request } from '@/utils/request.js'

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

export async function fetchImprovementNoteList(status = 'all') {
  const response = await request({
    url: `/api/improvement-notes?status=${encodeURIComponent(status)}`
  })
  return ensureSuccess(response, '获取恋爱改进簿列表失败') || []
}

export async function fetchImprovementNoteDetail(id) {
  const response = await request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}`
  })
  return ensureSuccess(response, '获取恋爱改进簿详情失败')
}

export async function createImprovementNote(payload) {
  const response = await request({
    url: '/api/improvement-notes',
    method: 'POST',
    data: payload
  })
  return ensureSuccess(response, '创建恋爱改进簿失败')
}

export async function updateImprovementNote(id, payload) {
  const response = await request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}`,
    method: 'PUT',
    data: payload
  })
  return ensureSuccess(response, '保存恋爱改进簿失败')
}

export async function deleteImprovementNote(id) {
  const response = await request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}`,
    method: 'DELETE'
  })
  return ensureSuccess(response, '删除恋爱改进簿失败')
}

export async function addImprovementFeedback(id, payload) {
  const response = await request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}/feedback`,
    method: 'POST',
    data: payload
  })
  return ensureSuccess(response, '记录反馈失败')
}

export async function updateImprovementFeedback(id, feedbackId, payload) {
  const response = await request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}/feedback/${encodeURIComponent(feedbackId)}`,
    method: 'PUT',
    data: payload
  })
  return ensureSuccess(response, '更新反馈失败')
}

export async function deleteImprovementFeedback(id, feedbackId) {
  const response = await request({
    url: `/api/improvement-notes/${encodeURIComponent(id)}/feedback/${encodeURIComponent(feedbackId)}`,
    method: 'DELETE'
  })
  return ensureSuccess(response, '删除反馈失败')
}
