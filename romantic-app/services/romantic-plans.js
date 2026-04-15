import { request } from '@/utils/request.js'

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

export async function fetchRomanticPlanList(status = 'all') {
  const response = await request({
    url: `/api/romantic-plans?status=${encodeURIComponent(status)}`
  })
  return ensureSuccess(response, '获取浪漫计划列表失败') || []
}

export async function fetchRomanticPlanDetail(id) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}`
  })
  return ensureSuccess(response, '获取浪漫计划详情失败')
}

export async function createRomanticPlan(payload) {
  const response = await request({
    url: '/api/romantic-plans',
    method: 'POST',
    data: payload
  })
  return ensureSuccess(response, '创建浪漫计划失败')
}

export async function updateRomanticPlan(id, payload) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}`,
    method: 'PUT',
    data: payload
  })
  return ensureSuccess(response, '保存浪漫计划失败')
}

export async function deleteRomanticPlan(id) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}`,
    method: 'DELETE'
  })
  return ensureSuccess(response, '删除浪漫计划失败')
}

export async function createRomanticPlanFeedback(id, payload) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}/feedback`,
    method: 'POST',
    data: payload
  })
  return ensureSuccess(response, '记录计划反馈失败')
}

export async function toggleRomanticPlanItemCompletion(id, itemId, completed) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/completion?completed=${completed ? 'true' : 'false'}`,
    method: 'PUT'
  })
  return ensureSuccess(response, '更新条目完成状态失败')
}

export async function toggleRomanticPlanLike(id) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}/likes`,
    method: 'POST'
  })
  return ensureSuccess(response, '计划点赞失败')
}

export async function createRomanticPlanComment(id, payload) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}/comments`,
    method: 'POST',
    data: payload
  })
  return ensureSuccess(response, '计划评论失败')
}

export async function deleteRomanticPlanComment(id, commentId) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}`,
    method: 'DELETE'
  })
  return ensureSuccess(response, '删除计划评论失败')
}
