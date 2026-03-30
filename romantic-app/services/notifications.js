import { request } from '@/utils/request.js'

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

function normalizeNotificationList(list) {
  return Array.isArray(list) ? list : []
}

export async function fetchNotificationList(params = {}) {
  const response = await request({
    url: '/api/notifications/page',
    data: {
      filter: params.filter || 'all',
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10)
    }
  })
  const data = ensureSuccess(response, '获取消息列表失败') || {}
  return {
    page: Number(data.pageNo || 1),
    pageSize: Number(data.pageSize || params.pageSize || 10),
    total: Number(data.total || 0),
    hasMore: Boolean(data.hasMore),
    list: normalizeNotificationList(data.list)
  }
}

export async function fetchLatestNotification() {
  const pageData = await fetchNotificationList({ page: 1, pageSize: 1, filter: 'all' })
  return pageData.list.length ? pageData.list[0] : null
}

export async function fetchNotificationStats() {
  const response = await request({
    url: '/api/notifications/unread-count'
  })
  const data = ensureSuccess(response, '获取消息统计失败') || {}
  return {
    unreadCount: Number(data.unreadCount || 0),
    readCount: Number(data.readCount || 0),
    totalCount: Number(data.totalCount || 0)
  }
}

export async function fetchUnreadNotificationCount() {
  const stats = await fetchNotificationStats()
  return stats.unreadCount
}

export async function markNotificationRead(id) {
  const response = await request({
    url: `/api/notifications/${encodeURIComponent(id)}/read`,
    method: 'PUT'
  })
  return ensureSuccess(response, '标记已读失败')
}

export async function markAllNotificationsRead() {
  const response = await request({
    url: '/api/notifications/read-all',
    method: 'PUT'
  })
  return ensureSuccess(response, '全部已读失败')
}
