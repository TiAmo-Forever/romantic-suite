import { getApiBaseUrl } from '@/utils/app-config.js'
import { fetchLatestNotification, fetchUnreadNotificationCount } from '@/services/notifications.js'
import { showNotificationBanner, syncNotificationUnreadCount } from '@/utils/notification-indicator.js'

const TOKEN_KEY = 'romantic_token'
const USER_KEY = 'romantic_user'
const listeners = new Set()

let socketTask = null
let reconnectTimer = null
let manualClosed = false
let connecting = false

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function normalizeWsBaseUrl() {
  const apiBaseUrl = String(getApiBaseUrl() || '').trim()
  if (!apiBaseUrl) {
    return ''
  }
  if (apiBaseUrl.startsWith('https://')) {
    return apiBaseUrl.replace(/^https:\/\//, 'wss://')
  }
  if (apiBaseUrl.startsWith('http://')) {
    return apiBaseUrl.replace(/^http:\/\//, 'ws://')
  }
  return apiBaseUrl
}

function buildSocketUrl() {
  const token = uni.getStorageSync(TOKEN_KEY)
  const baseUrl = normalizeWsBaseUrl()
  if (!baseUrl || !token) {
    return ''
  }
  return `${baseUrl}/ws/notifications?token=${encodeURIComponent(token)}`
}

function emitSocketEvent(event) {
  listeners.forEach((listener) => {
    try {
      listener(event)
    } catch (error) {
      // Keep other listeners working even if one handler fails.
    }
  })
}

async function refreshNotificationSnapshot() {
  try {
    const [unreadCount, latestNotification] = await Promise.all([
      fetchUnreadNotificationCount(),
      fetchLatestNotification()
    ])

    const safeUnreadCount = Number(unreadCount || 0)
    syncNotificationUnreadCount(safeUnreadCount)
    return {
      unreadCount: safeUnreadCount,
      latestNotification
    }
  } catch (error) {
    return {
      unreadCount: 0,
      latestNotification: null
    }
  }
}

async function handleRealtimeEvent(rawEvent) {
  const safeEvent = rawEvent && typeof rawEvent === 'object' ? rawEvent : {}
  const snapshot = await refreshNotificationSnapshot()
  const mergedEvent = {
    ...safeEvent,
    unreadCount: snapshot.unreadCount,
    latestNotification: snapshot.latestNotification,
    username: (uni.getStorageSync(USER_KEY) || {}).username || ''
  }

  if (snapshot.unreadCount > 0 && safeEvent.eventType === 'notification_created') {
    showNotificationBanner(snapshot.latestNotification, 10000)
  }

  emitSocketEvent(mergedEvent)
}

function scheduleReconnect() {
  if (manualClosed || !uni.getStorageSync(TOKEN_KEY)) {
    return
  }
  clearReconnectTimer()
  reconnectTimer = setTimeout(() => {
    ensureNotificationSocket()
  }, 1800)
}

export function ensureNotificationSocket() {
  if (!uni.getStorageSync(TOKEN_KEY) || connecting || socketTask) {
    return
  }

  const url = buildSocketUrl()
  if (!url) {
    return
  }

  manualClosed = false
  connecting = true
  socketTask = uni.connectSocket({ url, complete: () => {} })

  socketTask.onOpen(() => {
    connecting = false
    clearReconnectTimer()
  })

  socketTask.onMessage(async (message) => {
    try {
      const data = typeof message?.data === 'string' ? JSON.parse(message.data) : message?.data
      await handleRealtimeEvent(data)
    } catch (error) {
      // Ignore malformed socket payloads.
    }
  })

  socketTask.onClose(() => {
    connecting = false
    socketTask = null
    scheduleReconnect()
  })

  socketTask.onError(() => {
    connecting = false
    socketTask = null
    scheduleReconnect()
  })
}

export function closeNotificationSocket() {
  manualClosed = true
  connecting = false
  clearReconnectTimer()
  if (socketTask) {
    try {
      socketTask.close({})
    } catch (error) {
      // Ignore local socket close failures.
    }
  }
  socketTask = null
}

export function subscribeNotificationSocket(listener) {
  if (typeof listener !== 'function') {
    return () => {}
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
