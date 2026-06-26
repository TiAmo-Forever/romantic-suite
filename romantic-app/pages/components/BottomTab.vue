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
        <view class="tab-icon" :class="`tab-icon-${tab.key}`"></view>
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
    padding: 10rpx 18rpx;
    border-radius: 32rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 248, 242, 0.92) 100%);
    backdrop-filter: blur(18px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow:
      0 18rpx 38rpx rgba(0, 0, 0, 0.08),
      inset 0 0 0 2rpx rgba(255, 255, 255, 0.58);
    z-index: 9999;
  }

  .tab-item {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 88rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    border-radius: 24rpx;
    transition: transform 0.22s ease;
    touch-action: manipulation;
  }

  .tab-item-surface {
    display: none;
  }

  .tab-item-press {
    transform: translateY(2rpx) scale(0.985);
  }

  .tab-icon-wrap,
  .label {
    position: relative;
    z-index: 1;
  }

  .tab-icon-wrap {
    width: 48rpx;
    height: 48rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    transition: all 0.22s ease;
  }

  .tab-item.active .tab-icon-wrap {
    background: linear-gradient(180deg, rgba(255, 242, 239, 0.96) 0%, rgba(255, 236, 232, 0.92) 100%);
    box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.7);
  }

  .tab-dot {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: linear-gradient(180deg, #ffb0aa, #ff8e97);
    box-shadow: 0 0 0 3rpx rgba(255, 255, 255, 0.92);
    z-index: 2;
  }

  .tab-icon {
    width: 25rpx;
    height: 25rpx;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .tab-icon-home {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4.8 10.5 12 5l7.2 5.5v7.1a1 1 0 0 1-1 1h-4.1v-5.2H9.9v5.2H5.8a1 1 0 0 1-1-1z' fill='none' stroke='%23d5b8a4' stroke-width='1.8' stroke-linejoin='round'/%3E%3C/svg%3E");
  }

  .tab-icon-planet {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cellipse cx='12' cy='12' rx='7.8' ry='4.3' fill='none' stroke='%23d5b8a4' stroke-width='1.7' transform='rotate(-16 12 12)'/%3E%3Ccircle cx='11.2' cy='11.3' r='3.5' fill='none' stroke='%23d5b8a4' stroke-width='1.7'/%3E%3C/svg%3E");
  }

  .tab-icon-mine {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8.4' r='3.1' fill='none' stroke='%23d5b8a4' stroke-width='1.7'/%3E%3Cpath d='M6.9 18.8c.7-3 3-4.7 5.1-4.7s4.4 1.7 5.1 4.7' fill='none' stroke='%23d5b8a4' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E");
  }

  .tab-item.active .tab-icon-home {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4.8 10.5 12 5l7.2 5.5v7.1a1 1 0 0 1-1 1h-4.1v-5.2H9.9v5.2H5.8a1 1 0 0 1-1-1z' fill='none' stroke='%23ef9a92' stroke-width='1.9' stroke-linejoin='round'/%3E%3C/svg%3E");
  }

  .tab-item.active .tab-icon-planet {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cellipse cx='12' cy='12' rx='7.8' ry='4.3' fill='none' stroke='%23ef8b84' stroke-width='1.8' transform='rotate(-16 12 12)'/%3E%3Ccircle cx='11.2' cy='11.3' r='3.5' fill='none' stroke='%23ef8b84' stroke-width='1.8'/%3E%3Ccircle cx='16.6' cy='8.5' r='1.2' fill='%23f4b2ab'/%3E%3C/svg%3E");
  }

  .tab-item.active .tab-icon-mine {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='8.4' r='3.1' fill='none' stroke='%23ef8b84' stroke-width='1.8'/%3E%3Cpath d='M6.9 18.8c.7-3 3-4.7 5.1-4.7s4.4 1.7 5.1 4.7' fill='none' stroke='%23ef8b84' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E");
  }

  .label {
    font-size: 18rpx;
    line-height: 1;
    font-weight: 500;
    color: #cfb8a7;
  }

  .tab-item.active .label {
    color: #ea8a84;
    font-weight: 600;
  }
</style>
