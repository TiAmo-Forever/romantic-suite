<template>
  <view class="bottom-tab">
    <view
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-item"
      :class="{ active: tab.key === currentActive }"
      hover-class="tab-item-press"
      hover-stay-time="60"
      @click="handleTabClick(tab)"
    >
      <view class="tab-item-surface"></view>
      <view class="tab-icon-wrap">
        <view v-if="tab.key === 'mine' && showMineNotificationDot" class="tab-dot"></view>
        <view v-if="tab.key === 'home'" class="tab-icon tab-icon-home">
          <view class="icon-home-roof"></view>
          <view class="icon-home-body"></view>
          <view class="icon-home-door"></view>
        </view>

        <view v-else-if="tab.key === 'planet'" class="tab-icon tab-icon-planet">
          <view class="icon-planet-core"></view>
          <view class="icon-planet-ring"></view>
        </view>

        <view v-else class="tab-icon tab-icon-heart">
          <view class="icon-heart-shape"></view>
        </view>
      </view>
      <view class="label">{{ tab.label }}</view>
    </view>
  </view>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { switchRootPage } from '@/utils/nav.js'
import { fetchUnreadNotificationCount } from '@/services/notifications.js'
import { isNotificationBannerActive, notificationBannerExpiresAt, notificationUnreadCount, syncNotificationUnreadCount } from '@/utils/notification-indicator.js'

const props = defineProps({
  activeKey: {
    type: String,
    default: 'home'
  }
})

const currentActive = ref(props.activeKey)
const now = ref(Date.now())
let stripWindowTimer = null

watch(
  () => props.activeKey,
  (newVal) => {
    currentActive.value = newVal
  }
)

const tabs = [
  { key: 'home', label: '首页', path: '/pages/home/home' },
  { key: 'planet', label: '星球', path: '/pages/planet/planet' },
  { key: 'mine', label: '我的', path: '/pages/mine/mine' }
]

const showMineNotificationDot = computed(() => {
  now.value
  return notificationUnreadCount.value > 0 && !isNotificationBannerActive()
})

function handleTabClick(tab) {
  if (tab.key === currentActive.value) return
  currentActive.value = tab.key
  switchRootPage(tab.path)
}

function scheduleStripWindowRefresh() {
  if (stripWindowTimer) {
    clearTimeout(stripWindowTimer)
    stripWindowTimer = null
  }
  const remaining = Number(notificationBannerExpiresAt.value || 0) - Date.now()
  if (remaining > 0) {
    stripWindowTimer = setTimeout(() => {
      now.value = Date.now()
    }, remaining + 20)
  }
}

async function syncUnreadCount() {
  try {
    const unread = await fetchUnreadNotificationCount()
    syncNotificationUnreadCount(unread)
  } catch (error) {
    // Keep the current badge state when the unread count cannot be refreshed.
  }
}

watch(
  () => notificationBannerExpiresAt.value,
  () => {
    now.value = Date.now()
    scheduleStripWindowRefresh()
  },
  { immediate: true }
)

onShow(() => {
  now.value = Date.now()
  scheduleStripWindowRefresh()
  syncUnreadCount()
})

onUnmounted(() => {
  if (stripWindowTimer) {
    clearTimeout(stripWindowTimer)
  }
})
</script>

<style scoped>
  .bottom-tab {
    position: fixed;
    bottom: 24rpx;
    left: 20rpx;
    right: 20rpx;
    height: 112rpx;
    padding: 10rpx;
    border-radius: 999rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 246, 239, 0.88) 100%);
    backdrop-filter: blur(18px);
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow:
      0 18rpx 38rpx rgba(0, 0, 0, 0.08),
      inset 0 0 0 2rpx rgba(255, 255, 255, 0.58);
    z-index: 9999;
  }

  .tab-item {
    position: relative;
    overflow: hidden;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    text-align: center;
    height: 100%;
    padding: 10rpx 12rpx;
    border-radius: 999rpx;
    transition: all 0.25s ease;
    margin: 0 6rpx;
    touch-action: manipulation;
  }

  .tab-item-surface {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: transparent;
    transition: inherit;
  }

  .tab-item-press {
    transform: translateY(2rpx) scale(0.985);
  }

  .tab-item.active .tab-item-surface {
    background: var(--app-gradient-primary);
    box-shadow: 0 10rpx 24rpx rgba(255, 126, 166, 0.24);
  }

  .tab-icon-wrap,
  .label {
    position: relative;
    z-index: 1;
  }

  .tab-icon-wrap {
    width: 54rpx;
    height: 54rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.55);
    transition: inherit;
  }

  .tab-dot {
    position: absolute;
    top: -6rpx;
    right: -6rpx;
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: linear-gradient(180deg, #ff9e9a, #ff6e82);
    box-shadow:
      0 0 0 4rpx rgba(255, 255, 255, 0.9),
      0 8rpx 18rpx rgba(255, 110, 130, 0.18);
    z-index: 2;
  }

  .tab-item.active .tab-icon-wrap {
    background: rgba(255, 255, 255, 0.24);
  }

  .tab-icon {
    position: relative;
    width: 30rpx;
    height: 30rpx;
  }

  .tab-icon-home .icon-home-roof {
    position: absolute;
    left: 1rpx;
    top: 0;
    border-left: 14rpx solid transparent;
    border-right: 14rpx solid transparent;
    border-bottom: 14rpx solid #cf9f54;
  }

  .tab-icon-home .icon-home-body {
    position: absolute;
    left: 5rpx;
    bottom: 1rpx;
    width: 20rpx;
    height: 16rpx;
    border-radius: 4rpx;
    background: #cf9f54;
  }

  .tab-icon-home .icon-home-door {
    position: absolute;
    left: 12rpx;
    bottom: 1rpx;
    width: 6rpx;
    height: 9rpx;
    border-radius: 3rpx 3rpx 0 0;
    background: rgba(255, 255, 255, 0.82);
  }

  .tab-icon-planet .icon-planet-core {
    position: absolute;
    left: 6rpx;
    top: 6rpx;
    width: 18rpx;
    height: 18rpx;
    border-radius: 50%;
    background: #cf9f54;
  }

  .tab-icon-planet .icon-planet-ring {
    position: absolute;
    left: -1rpx;
    top: 10rpx;
    width: 32rpx;
    height: 12rpx;
    border-radius: 50%;
    border: 4rpx solid #cf9f54;
    transform: rotate(-18deg);
    box-sizing: border-box;
  }

  .tab-icon-heart .icon-heart-shape {
    position: absolute;
    left: 7rpx;
    top: 9rpx;
    width: 16rpx;
    height: 14rpx;
    transform: rotate(-45deg);
    background: #cf9f54;
  }

  .tab-icon-heart .icon-heart-shape::before,
  .tab-icon-heart .icon-heart-shape::after {
    content: '';
    position: absolute;
    width: 16rpx;
    height: 14rpx;
    border-radius: 50%;
    background: #cf9f54;
  }

  .tab-icon-heart .icon-heart-shape::before {
    top: -8rpx;
    left: 0;
  }

  .tab-icon-heart .icon-heart-shape::after {
    top: 0;
    left: 8rpx;
  }

  .label {
    font-size: 24rpx;
    font-weight: 600;
    color: #9f7a69;
  }

  .tab-item.active .label {
    color: #fff;
  }

  .tab-item.active .tab-icon-home .icon-home-roof,
  .tab-item.active .tab-icon-home .icon-home-body,
  .tab-item.active .tab-icon-planet .icon-planet-core,
  .tab-item.active .tab-icon-planet .icon-planet-ring,
  .tab-item.active .tab-icon-heart .icon-heart-shape,
  .tab-item.active .tab-icon-heart .icon-heart-shape::before,
  .tab-item.active .tab-icon-heart .icon-heart-shape::after {
    background: #fff;
    border-color: #fff;
  }
  .tab-item.active .tab-icon-home .icon-home-door {
    background: rgba(255, 255, 255, 0.72);
  }
</style>
