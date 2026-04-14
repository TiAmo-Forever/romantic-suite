import { request } from '@/utils/request.js'

export const DAILY_SUMMARY_MOODS = [
  { key: 'gentle', label: '温柔', caption: '今天适合留下一句轻轻的话。' },
  { key: 'sweet', label: '很甜', caption: '普通的一天，也被喜欢认真照亮。' },
  { key: 'calm', label: '平静', caption: '把安稳和舒服悄悄留在今天。' },
  { key: 'missing', label: '想念', caption: '见不到的时候，也想把心意留下来。' },
  { key: 'busy', label: '忙碌', caption: '在忙碌里，也想给彼此留一页温柔。' },
  { key: 'closer', label: '更靠近一点', caption: '今天也在慢慢向彼此靠近。' }
]

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

export function getDailySummaryMoodMeta(mood) {
  return DAILY_SUMMARY_MOODS.find((item) => item.key === String(mood || '').trim()) || DAILY_SUMMARY_MOODS[0]
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

function normalizeEntry(item = {}) {
  const mood = String(item.mood || 'gentle').trim() || 'gentle'
  return {
    id: item.id || '',
    mood,
    moodMeta: getDailySummaryMoodMeta(mood),
    content: String(item.content || '').trim(),
    creatorUsername: String(item.creatorUsername || '').trim(),
    creatorNickname: String(item.creatorNickname || '').trim(),
    createdAt: String(item.createdAt || '').trim(),
    updatedAt: String(item.updatedAt || '').trim(),
    likeCount: Number(item.likeCount || 0),
    likedByCurrentUser: Boolean(item.likedByCurrentUser),
    likeUsers: (Array.isArray(item.likeUsers) ? item.likeUsers : []).map(normalizeLikeUser),
    commentList: (Array.isArray(item.commentList) ? item.commentList : []).map(normalizeComment),
    mediaList: (Array.isArray(item.mediaList) ? item.mediaList : []).map(normalizeMediaItem)
  }
}

function normalizeHistoryItem(item = {}) {
  const mood = String(item.mood || 'gentle').trim() || 'gentle'
  return {
    id: item.id || '',
    summaryDate: String(item.summaryDate || '').trim(),
    mood,
    moodMeta: getDailySummaryMoodMeta(mood),
    content: String(item.content || '').trim(),
    entryCount: Number(item.entryCount || 0),
    creatorUsername: String(item.creatorUsername || '').trim(),
    creatorNickname: String(item.creatorNickname || '').trim(),
    updaterUsername: String(item.updaterUsername || '').trim(),
    updaterNickname: String(item.updaterNickname || '').trim(),
    authorUsername: String(item.authorUsername || '').trim(),
    authorNickname: String(item.authorNickname || '').trim(),
    updatedAt: String(item.updatedAt || '').trim()
  }
}

function normalizeSummary(item = {}) {
  const mood = String(item.mood || 'gentle').trim() || 'gentle'
  return {
    id: item.id || '',
    summaryDate: String(item.summaryDate || '').trim(),
    mood,
    moodMeta: getDailySummaryMoodMeta(mood),
    content: String(item.content || '').trim(),
    hasRecord: Boolean(item.hasRecord),
    entryCount: Number(item.entryCount || 0),
    creatorUsername: String(item.creatorUsername || '').trim(),
    updaterUsername: String(item.updaterUsername || '').trim(),
    updatedAt: String(item.updatedAt || '').trim(),
    likeCount: Number(item.likeCount || 0),
    likedByCurrentUser: Boolean(item.likedByCurrentUser),
    likeUsers: (Array.isArray(item.likeUsers) ? item.likeUsers : []).map(normalizeLikeUser),
    commentList: (Array.isArray(item.commentList) ? item.commentList : []).map(normalizeComment),
    entryList: (Array.isArray(item.entryList) ? item.entryList : []).map(normalizeEntry),
    historyList: (Array.isArray(item.historyList) ? item.historyList : []).map(normalizeHistoryItem)
  }
}

function normalizeLikeToggle(item = {}) {
  return {
    likeCount: Number(item.likeCount || 0),
    liked: Boolean(item.liked)
  }
}

export async function fetchTodayDailySummary() {
  const response = await request({ url: '/api/daily-summaries/today' })
  return normalizeSummary(ensureSuccess(response, '获取今日小计失败'))
}

export async function fetchDailySummaryByDate(summaryDate) {
  const response = await request({ url: `/api/daily-summaries/date/${encodeURIComponent(summaryDate)}` })
  return normalizeSummary(ensureSuccess(response, '获取今日小计详情失败'))
}

export async function fetchDailySummaryHistory() {
  const response = await request({ url: '/api/daily-summaries/history' })
  return (ensureSuccess(response, '获取今日小计历史失败') || []).map(normalizeHistoryItem)
}

export async function createDailySummaryEntry(summaryDate, payload) {
  const response = await request({
    url: `/api/daily-summaries/date/${encodeURIComponent(summaryDate)}/entries`,
    method: 'POST',
    data: payload
  })
  return normalizeSummary(ensureSuccess(response, '保存今日小计失败'))
}

export async function updateDailySummaryEntry(summaryId, entryId, payload) {
  const response = await request({
    url: `/api/daily-summaries/${encodeURIComponent(summaryId)}/entries/${encodeURIComponent(entryId)}`,
    method: 'PUT',
    data: payload
  })
  return normalizeSummary(ensureSuccess(response, '更新今日小计失败'))
}

export async function toggleDailySummaryEntryLike(summaryId, entryId) {
  const response = await request({
    url: `/api/daily-summaries/${encodeURIComponent(summaryId)}/entries/${encodeURIComponent(entryId)}/likes`,
    method: 'POST'
  })
  return normalizeLikeToggle(ensureSuccess(response, '操作失败'))
}

export async function createDailySummaryEntryComment(summaryId, entryId, payload) {
  const response = await request({
    url: `/api/daily-summaries/${encodeURIComponent(summaryId)}/entries/${encodeURIComponent(entryId)}/comments`,
    method: 'POST',
    data: payload
  })
  return normalizeComment(ensureSuccess(response, '评论失败'))
}

export async function deleteDailySummaryEntryComment(summaryId, entryId, commentId) {
  const response = await request({
    url: `/api/daily-summaries/${encodeURIComponent(summaryId)}/entries/${encodeURIComponent(entryId)}/comments/${encodeURIComponent(commentId)}`,
    method: 'DELETE'
  })
  return ensureSuccess(response, '删除评论失败')
}
