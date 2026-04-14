import { request } from '@/utils/request.js'
import { getAnniversaryListCache, saveAnniversaryListCache } from '@/utils/anniversary.js'
import { isServerOffline } from '@/utils/server-state.js'

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

function normalizeMediaItem(item = {}, index = 0) {
  return {
    id: item.id || `media_${index}`,
    mediaType: item.mediaType === 'video' ? 'video' : 'image',
    fileUrl: String(item.fileUrl || '').trim(),
    thumbnailUrl: String(item.thumbnailUrl || '').trim(),
    sortOrder: Number(item.sortOrder || index)
  }
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

function normalizeAnniversary(item = {}) {
  return {
    id: item.id || '',
    title: String(item.title || '').trim(),
    type: String(item.type || '').trim(),
    eventDate: String(item.eventDate || '').trim(),
    description: String(item.description || '').trim(),
    location: String(item.location || '').trim(),
    coverUrl: String(item.coverUrl || '').trim(),
    isPinned: Boolean(item.pinned ?? item.isPinned),
    likeCount: Number(item.likeCount || 0),
    likedByCurrentUser: Boolean(item.likedByCurrentUser),
    reminderType: String(item.reminderType || '').trim(),
    timeStatus: String(item.timeStatus || '').trim(),
    dayOffset: Number(item.dayOffset || 0),
    creatorUsername: String(item.creatorUsername || '').trim(),
    creatorNickname: String(item.creatorNickname || '').trim(),
    mediaList: (Array.isArray(item.mediaList) ? item.mediaList : []).map(normalizeMediaItem),
    likeUsers: (Array.isArray(item.likeUsers) ? item.likeUsers : []).map(normalizeLikeUser),
    commentList: (Array.isArray(item.commentList) ? item.commentList : []).map(normalizeComment)
  }
}

function normalizeLikeToggle(item = {}) {
  return {
    likeCount: Number(item.likeCount || 0),
    liked: Boolean(item.liked)
  }
}

export async function fetchAnniversaryList(status = 'all', options = {}) {
  const { allowOfflineFallback = true } = options

  try {
    const response = await request({
      url: `/api/anniversaries?status=${encodeURIComponent(status)}`
    })
    const list = (ensureSuccess(response, '获取纪念日列表失败') || []).map(normalizeAnniversary)
    saveAnniversaryListCache(list)
    return list
  } catch (error) {
    if (allowOfflineFallback && isServerOffline()) {
      return getAnniversaryListCache()
    }
    throw error
  }
}

export async function fetchAnniversaryDetail(id) {
  const response = await request({
    url: `/api/anniversaries/${encodeURIComponent(id)}`
  })
  return normalizeAnniversary(ensureSuccess(response, '获取纪念日详情失败'))
}

export async function createAnniversary(payload) {
  const response = await request({
    url: '/api/anniversaries',
    method: 'POST',
    data: payload
  })
  return normalizeAnniversary(ensureSuccess(response, '创建纪念日失败'))
}

export async function updateAnniversary(id, payload) {
  const response = await request({
    url: `/api/anniversaries/${encodeURIComponent(id)}`,
    method: 'PUT',
    data: payload
  })
  return normalizeAnniversary(ensureSuccess(response, '保存纪念日失败'))
}

export async function deleteAnniversary(id) {
  const response = await request({
    url: `/api/anniversaries/${encodeURIComponent(id)}`,
    method: 'DELETE'
  })
  return ensureSuccess(response, '删除纪念日失败')
}

export async function setAnniversaryPinned(id, pinned = true) {
  const response = await request({
    url: `/api/anniversaries/${encodeURIComponent(id)}/pin?pinned=${pinned ? 'true' : 'false'}`,
    method: 'PUT'
  })
  return normalizeAnniversary(ensureSuccess(response, '设置置顶失败'))
}

export async function toggleAnniversaryLike(id) {
  const response = await request({
    url: `/api/anniversaries/${encodeURIComponent(id)}/likes`,
    method: 'POST'
  })
  return normalizeLikeToggle(ensureSuccess(response, '操作失败'))
}

export async function createAnniversaryComment(id, payload) {
  const response = await request({
    url: `/api/anniversaries/${encodeURIComponent(id)}/comments`,
    method: 'POST',
    data: payload
  })
  return normalizeComment(ensureSuccess(response, '评论失败'))
}

export async function deleteAnniversaryComment(id, commentId) {
  const response = await request({
    url: `/api/anniversaries/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}`,
    method: 'DELETE'
  })
  return ensureSuccess(response, '删除评论失败')
}

export async function checkAnniversaryReminders() {
  const response = await request({
    url: '/api/anniversaries/reminders/check',
    method: 'POST',
    offlineTip: false
  })
  return ensureSuccess(response, '检查纪念日提醒失败') || []
}
