import { request } from '@/utils/request.js'

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

function normalizeLikeUser(item = {}) {
  return {
    username: String(item.username || '').trim(),
    nickname: String(item.nickname || '').trim(),
    likeTimes: Number(item.likeTimes || 0),
    lastLikedAt: String(item.lastLikedAt || '').trim()
  }
}

function normalizeComment(item = {}) {
  return {
    id: item.id || '',
    commenterUsername: String(item.commenterUsername || '').trim(),
    commenterNickname: String(item.commenterNickname || '').trim(),
    content: String(item.content || '').trim(),
    createdAt: String(item.createdAt || '').trim(),
    updatedAt: String(item.updatedAt || '').trim()
  }
}

function normalizeItem(item = {}) {
  return {
    id: item.id || '',
    title: String(item.title || '').trim(),
    content: String(item.content || '').trim(),
    scheduledAt: String(item.scheduledAt || '').trim(),
    endAt: String(item.endAt || '').trim(),
    location: String(item.location || '').trim(),
    sortOrder: Number(item.sortOrder || 0),
    completed: Boolean(item.completed),
    completedAt: String(item.completedAt || '').trim(),
    creatorUsername: String(item.creatorUsername || '').trim(),
    creatorNickname: String(item.creatorNickname || '').trim()
  }
}

function normalizeFeedback(item = {}) {
  return {
    id: item.id || '',
    planItemId: item.planItemId || '',
    feedbackDate: String(item.feedbackDate || '').trim(),
    status: String(item.status || 'done').trim() || 'done',
    content: String(item.content || '').trim(),
    creatorUsername: String(item.creatorUsername || '').trim(),
    creatorNickname: String(item.creatorNickname || '').trim(),
    createdAt: String(item.createdAt || '').trim()
  }
}

function normalizePlan(item = {}) {
  return {
    id: item.id || '',
    title: String(item.title || '').trim(),
    description: String(item.description || '').trim(),
    planType: String(item.planType || 'daily').trim() || 'daily',
    status: String(item.status || 'active').trim() || 'active',
    scheduleSummary: String(item.scheduleSummary || '').trim(),
    startAt: String(item.startAt || '').trim(),
    endAt: String(item.endAt || '').trim(),
    intervalDays: Number(item.intervalDays || 0),
    location: String(item.location || '').trim(),
    coverUrl: String(item.coverUrl || '').trim(),
    creatorUsername: String(item.creatorUsername || '').trim(),
    creatorNickname: String(item.creatorNickname || '').trim(),
    updaterUsername: String(item.updaterUsername || '').trim(),
    updaterNickname: String(item.updaterNickname || '').trim(),
    nextExecuteAt: String(item.nextExecuteAt || '').trim(),
    nextExecuteLabel: String(item.nextExecuteLabel || '').trim(),
    totalItemCount: Number(item.totalItemCount || 0),
    completedItemCount: Number(item.completedItemCount || 0),
    feedbackCount: Number(item.feedbackCount || 0),
    likeCount: Number(item.likeCount || 0),
    likedByCurrentUser: Boolean(item.likedByCurrentUser),
    itemList: (Array.isArray(item.itemList) ? item.itemList : []).map(normalizeItem),
    feedbackList: (Array.isArray(item.feedbackList) ? item.feedbackList : []).map(normalizeFeedback),
    likeUsers: (Array.isArray(item.likeUsers) ? item.likeUsers : []).map(normalizeLikeUser),
    commentList: (Array.isArray(item.commentList) ? item.commentList : []).map(normalizeComment)
  }
}

export async function fetchRomanticPlanList(status = 'all') {
  const response = await request({
    url: `/api/romantic-plans?status=${encodeURIComponent(status)}`
  })
  return (ensureSuccess(response, '获取浪漫计划列表失败') || []).map(normalizePlan)
}

export async function fetchRomanticPlanDetail(id) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}`
  })
  return normalizePlan(ensureSuccess(response, '获取浪漫计划详情失败'))
}

export async function createRomanticPlan(payload) {
  const response = await request({
    url: '/api/romantic-plans',
    method: 'POST',
    data: payload
  })
  return normalizePlan(ensureSuccess(response, '创建浪漫计划失败'))
}

export async function updateRomanticPlan(id, payload) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}`,
    method: 'PUT',
    data: payload
  })
  return normalizePlan(ensureSuccess(response, '保存浪漫计划失败'))
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
  return normalizePlan(ensureSuccess(response, '记录计划反馈失败'))
}

export async function toggleRomanticPlanItemCompletion(id, itemId, completed) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/completion?completed=${completed ? 'true' : 'false'}`,
    method: 'PUT'
  })
  return normalizePlan(ensureSuccess(response, '更新条目完成状态失败'))
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
  return normalizeComment(ensureSuccess(response, '计划评论失败'))
}

export async function deleteRomanticPlanComment(id, commentId) {
  const response = await request({
    url: `/api/romantic-plans/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}`,
    method: 'DELETE'
  })
  return ensureSuccess(response, '删除计划评论失败')
}
