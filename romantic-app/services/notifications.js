import { request } from '@/utils/request.js'

function ensureSuccess(response, fallbackMessage) {
  if (!response?.success) {
    throw new Error(response?.message || fallbackMessage)
  }
  return response.data
}

export async function fetchNotificationList() {
  const response = await request({
    url: '/api/notifications'
  })
  return ensureSuccess(response, '获取消息列表失败') || []
}

export async function fetchLatestNotification() {
  const list = await fetchNotificationList()
  return Array.isArray(list) && list.length ? list[0] : null
}

export async function fetchUnreadNotificationCount() {
  const response = await request({
    url: '/api/notifications/unread-count'
  })
  return ensureSuccess(response, '获取未读数量失败')?.unreadCount || 0
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
