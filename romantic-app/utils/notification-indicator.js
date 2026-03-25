import { computed, ref } from 'vue'

const UNREAD_COUNT_KEY = 'romantic_notification_unread_count'
const NOTIFICATION_BANNER_STATE_KEY = 'romantic_notification_banner_state'

function readBannerState() {
  const state = uni.getStorageSync(NOTIFICATION_BANNER_STATE_KEY)
  if (!state || typeof state !== 'object') {
    return {
      expiresAt: 0,
      notification: null
    }
  }
  return {
    expiresAt: Number(state.expiresAt || 0),
    notification: normalizeBannerNotification(state.notification)
  }
}

function normalizeBannerNotification(notification) {
  if (!notification || typeof notification !== 'object') {
    return null
  }
  const title = String(notification.title || '').trim()
  const content = String(notification.content || '').trim()
  const createdAt = String(notification.createdAt || '').trim()
  if (!title && !content) {
    return null
  }
  return {
    title,
    content,
    createdAt
  }
}

function persistBannerState() {
  uni.setStorageSync(NOTIFICATION_BANNER_STATE_KEY, {
    expiresAt: notificationBannerExpiresAt.value,
    notification: notificationBannerNotification.value
  })
}

const initialBannerState = readBannerState()

export const notificationUnreadCount = ref(Number(uni.getStorageSync(UNREAD_COUNT_KEY) || 0))
export const notificationBannerExpiresAt = ref(initialBannerState.expiresAt)
export const notificationBannerNotification = ref(initialBannerState.notification)
export const isNotificationBannerVisible = computed(() => (
  Number(notificationBannerExpiresAt.value || 0) > Date.now() && !!notificationBannerNotification.value
))

export function syncNotificationUnreadCount(count) {
  const safeCount = Math.max(0, Number(count || 0))
  notificationUnreadCount.value = safeCount
  uni.setStorageSync(UNREAD_COUNT_KEY, safeCount)
}

export function showNotificationBanner(notification, durationMs = 10000) {
  const safeNotification = normalizeBannerNotification(notification)
  if (!safeNotification) {
    return
  }
  notificationBannerNotification.value = safeNotification
  notificationBannerExpiresAt.value = Date.now() + Math.max(0, Number(durationMs || 0))
  persistBannerState()
}

export function dismissNotificationBanner() {
  notificationBannerExpiresAt.value = 0
  notificationBannerNotification.value = null
  persistBannerState()
}

export function isNotificationBannerActive() {
  return Number(notificationBannerExpiresAt.value || 0) > Date.now()
}

export function clearNotificationIndicatorState() {
  syncNotificationUnreadCount(0)
  dismissNotificationBanner()
}
