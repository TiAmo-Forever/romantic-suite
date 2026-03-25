<template>
  <view
    v-if="shouldRender"
    class="global-notification-banner"
    :class="{ 'global-notification-banner-dragging': isDragging }"
    :style="bannerStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
    @click="handleOpenNotifications"
  >
    <view class="global-notification-banner-accent"></view>
    <view class="global-notification-banner-copy">
      <view class="global-notification-banner-kicker">{{ TEXT.kicker }}</view>
      <view class="global-notification-banner-title">{{ bannerTitle }}</view>
      <view class="global-notification-banner-content">{{ bannerContent }}</view>
    </view>
    <view class="global-notification-banner-meta">
      <view class="global-notification-banner-time">{{ bannerTime }}</view>
      <view class="global-notification-banner-hint">{{ TEXT.hint }}</view>
    </view>
  </view>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { dismissNotificationBanner, isNotificationBannerVisible, notificationBannerExpiresAt, notificationBannerNotification } from '@/utils/notification-indicator.js'
import { goPage } from '@/utils/nav.js'

const TEXT = {
  kicker: '\u65b0\u63d0\u9192',
  defaultTitle: '\u6709\u65b0\u7684\u5fc3\u52a8\u63d0\u9192',
  defaultContent: '\u70b9\u5f00\u770b\u770b\u4f60\u4eec\u521a\u521a\u66f4\u65b0\u4e86\u4ec0\u4e48',
  hint: '\u5de6\u6ed1\u5173\u95ed',
  justNow: '\u521a\u521a'
}

const shouldRender = ref(!!notificationBannerNotification.value)
const visible = ref(Boolean(isNotificationBannerVisible.value))
const dragOffsetX = ref(0)
const isDragging = ref(false)

let hideTimer = null
let removeTimer = null
let touchStartX = 0
let touchStartY = 0
let touchMoved = false

const bannerTitle = computed(() => String(notificationBannerNotification.value?.title || '').trim() || TEXT.defaultTitle)
const bannerContent = computed(() => String(notificationBannerNotification.value?.content || '').trim() || TEXT.defaultContent)
const bannerTime = computed(() => formatBannerTime(notificationBannerNotification.value?.createdAt))
const bannerStyle = computed(() => ({
  transform: `translate3d(${dragOffsetX.value}px, ${visible.value ? '0' : '-140%'}, 0)`,
  opacity: visible.value ? 1 : 0
}))

function formatBannerTime(value) {
  const raw = String(value || '').trim()
  if (!raw) {
    return TEXT.justNow
  }
  const date = new Date(raw.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) {
    return raw
  }
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

function clearTimers() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  if (removeTimer) {
    clearTimeout(removeTimer)
    removeTimer = null
  }
}

function syncBannerVisibility() {
  clearTimers()
  const hasNotification = !!notificationBannerNotification.value
  const active = Boolean(isNotificationBannerVisible.value && hasNotification)

  if (hasNotification) {
    shouldRender.value = true
  }

  visible.value = active

  if (!active) {
    dragOffsetX.value = 0
    isDragging.value = false
    if (shouldRender.value) {
      removeTimer = setTimeout(() => {
        if (!isNotificationBannerVisible.value) {
          shouldRender.value = false
        }
      }, 260)
    }
    return
  }

  const remaining = Number(notificationBannerExpiresAt.value || 0) - Date.now()
  if (remaining > 0) {
    hideTimer = setTimeout(() => {
      dismissNotificationBanner()
    }, remaining + 20)
  }
}

function handleTouchStart(event) {
  const touch = event?.touches?.[0]
  if (!touch) {
    return
  }
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchMoved = false
}

function handleTouchMove(event) {
  const touch = event?.touches?.[0]
  if (!touch || !visible.value) {
    return
  }
  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY
  if (Math.abs(deltaX) < Math.abs(deltaY) || deltaX >= 0) {
    return
  }
  touchMoved = true
  isDragging.value = true
  dragOffsetX.value = Math.max(deltaX, -260)
}

function handleTouchEnd() {
  if (!visible.value) {
    return
  }
  const shouldDismiss = dragOffsetX.value <= -120
  isDragging.value = false
  dragOffsetX.value = 0
  if (shouldDismiss) {
    dismissNotificationBanner()
  }
}

function handleOpenNotifications() {
  if (touchMoved || isDragging.value) {
    touchMoved = false
    return
  }
  goPage('/pages/modules/notifications/index')
}

watch(
  () => [notificationBannerExpiresAt.value, notificationBannerNotification.value],
  () => {
    syncBannerVisibility()
  },
  { immediate: true }
)

onUnmounted(() => {
  clearTimers()
})
</script>

<style scoped>
  .global-notification-banner {
    position: fixed;
    top: calc(env(safe-area-inset-top) + 26rpx);
    left: 24rpx;
    right: 24rpx;
    min-height: 150rpx;
    padding: 22rpx 24rpx;
    border-radius: 32rpx;
    display: flex;
    align-items: flex-start;
    gap: 18rpx;
    background:
      radial-gradient(circle at 88% 12%, rgba(255, 232, 213, 0.55), transparent 24%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 242, 0.96));
    box-shadow:
      0 22rpx 44rpx rgba(197, 163, 115, 0.18),
      inset 0 0 0 2rpx rgba(255, 255, 255, 0.8);
    transition: transform 0.24s ease, opacity 0.24s ease;
    z-index: 10020;
  }

  .global-notification-banner-dragging {
    transition: none;
  }

  .global-notification-banner-accent {
    width: 10rpx;
    min-height: 106rpx;
    border-radius: 999rpx;
    flex-shrink: 0;
    background: linear-gradient(180deg, #f1d18f, #deab5a);
    box-shadow: 0 10rpx 22rpx rgba(222, 171, 90, 0.22);
  }

  .global-notification-banner-copy {
    flex: 1;
    min-width: 0;
  }

  .global-notification-banner-kicker {
    font-size: 20rpx;
    line-height: 1.3;
    letter-spacing: 4rpx;
    color: #c89f63;
    text-transform: uppercase;
  }

  .global-notification-banner-title {
    margin-top: 8rpx;
    font-size: 30rpx;
    line-height: 1.4;
    font-weight: 700;
    color: #8f6f53;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .global-notification-banner-content {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: #a18875;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .global-notification-banner-meta {
    flex-shrink: 0;
    min-width: 108rpx;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12rpx;
  }

  .global-notification-banner-time {
    font-size: 20rpx;
    line-height: 1.4;
    color: #c0a28d;
    white-space: nowrap;
  }

  .global-notification-banner-hint {
    padding: 10rpx 16rpx;
    border-radius: 999rpx;
    font-size: 20rpx;
    line-height: 1;
    color: #bc9160;
    background: rgba(255, 255, 255, 0.76);
    box-shadow: inset 0 0 0 2rpx rgba(247, 234, 217, 0.88);
  }
</style>
