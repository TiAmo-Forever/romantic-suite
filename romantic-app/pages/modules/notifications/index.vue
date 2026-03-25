<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="消息中心" eyebrow="站内提醒" />
    </view>

    <view class="app-account-content">
      <AccountPanel title="最新动态" description="登录、共享内容更新和重要提醒都会慢慢收在这里，方便你们随时回看。">
        <view class="toolbar">
          <view class="toolbar-count">未读 {{ unreadCount }} 条</view>
          <view class="toolbar-action" @click="handleMarkAllRead">全部已读</view>
        </view>

        <view class="filter-row">
          <view
            v-for="item in FILTER_OPTIONS"
            :key="item.key"
            class="filter-chip"
            :class="{ active: activeFilter === item.key }"
            @click="handleFilterChange(item.key)"
          >
            {{ item.label }}
            <text class="filter-chip-count">{{ resolveFilterCount(item.key) }}</text>
          </view>
        </view>

        <view v-if="filteredNotificationList.length" class="notification-list">
          <view
            v-for="item in filteredNotificationList"
            :key="item.id"
            class="notification-card app-card-soft"
            hover-class="notification-card-active"
            hover-stay-time="70"
            @click="handleOpenNotification(item)"
          >
            <view class="notification-head">
              <view class="notification-title-row">
                <view class="notification-title">{{ item.title }}</view>
                <view v-if="!item.isRead" class="notification-dot"></view>
              </view>
              <view class="notification-time">{{ item.createdAt }}</view>
            </view>
            <view class="notification-content">{{ item.content }}</view>
            <view class="notification-meta">
              <view class="notification-actor">{{ item.actorNickname || item.actorUsername || '共享动态' }}</view>
              <view class="notification-tag" :class="{ unread: !item.isRead }">{{ item.isRead ? '已读' : '未读' }}</view>
            </view>
          </view>
        </view>

        <view v-else class="empty-state">
          <view class="empty-title">{{ emptyState.title }}</view>
          <view class="empty-desc">{{ emptyState.desc }}</view>
        </view>
      </AccountPanel>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { fetchNotificationList, fetchUnreadNotificationCount, markAllNotificationsRead, markNotificationRead } from '@/services/notifications.js'
import { requireAuth } from '@/utils/auth.js'
import { goPage } from '@/utils/nav.js'
import { syncNotificationUnreadCount } from '@/utils/notification-indicator.js'
import { subscribeNotificationSocket } from '@/utils/notification-socket.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const FILTER_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'read', label: '已读' }
]

const { themeStyle } = useThemePage()
const notificationList = ref([])
const unreadCount = ref(0)
const activeFilter = ref('all')
let unsubscribeNotificationSocket = null

const readCount = computed(() => Math.max(0, notificationList.value.length - unreadCount.value))
const filteredNotificationList = computed(() => {
  if (activeFilter.value === 'unread') {
    return notificationList.value.filter((item) => !item.isRead)
  }
  if (activeFilter.value === 'read') {
    return notificationList.value.filter((item) => item.isRead)
  }
  return notificationList.value
})
const emptyState = computed(() => {
  if (activeFilter.value === 'unread') {
    return {
      title: '当前没有未读提醒',
      desc: '新的共享动态会先出现在这里，点开后就会自动归到已读列表。'
    }
  }
  if (activeFilter.value === 'read') {
    return {
      title: '还没有已读记录',
      desc: '你看过的提醒会沉淀在这里，方便后面随时回看。'
    }
  }
  return {
    title: '还没有新的提醒',
    desc: '登录、纪念日、相册、倒计时和改进簿的共享动态，都会在这里慢慢收集起来。'
  }
})

onShow(async () => {
  if (!requireAuth()) return
  if (!unsubscribeNotificationSocket) {
    unsubscribeNotificationSocket = subscribeNotificationSocket(() => {
      loadNotifications()
    })
  }
  await loadNotifications()
})

async function loadNotifications() {
  try {
    const [list, unread] = await Promise.all([
      fetchNotificationList(),
      fetchUnreadNotificationCount()
    ])
    notificationList.value = Array.isArray(list) ? list : []
    unreadCount.value = Number(unread || 0)
    syncNotificationUnreadCount(unreadCount.value)
  } catch (error) {
    uni.showToast({ title: error?.message || '消息加载失败', icon: 'none' })
  }
}

function handleFilterChange(filterKey) {
  activeFilter.value = filterKey
}

function resolveFilterCount(filterKey) {
  if (filterKey === 'unread') return unreadCount.value
  if (filterKey === 'read') return readCount.value
  return notificationList.value.length
}

function parsePayload(item) {
  try {
    return JSON.parse(item?.payloadJson || '{}')
  } catch (error) {
    return {}
  }
}

function resolveNotificationRoute(item) {
  const bizId = Number(item?.bizId || 0)
  const payload = parsePayload(item)

  switch (item?.bizType) {
    case 'anniversary':
      return bizId ? `/pages/modules/anniversary/detail?id=${bizId}` : ''
    case 'album':
      return bizId ? `/pages/modules/album/detail?id=${bizId}` : ''
    case 'improvement_note':
      return bizId ? `/pages/modules/improvement/detail?id=${bizId}` : ''
    case 'improvement_feedback':
      return payload.noteId ? `/pages/modules/improvement/detail?id=${payload.noteId}` : ''
    case 'countdown':
      return '/pages/modules/countdown/index'
    default:
      return ''
  }
}

async function handleOpenNotification(item) {
  try {
    if (!item.isRead) {
      await markNotificationRead(item.id)
      item.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      syncNotificationUnreadCount(unreadCount.value)
    }
  } catch (error) {
    uni.showToast({ title: error?.message || '消息状态更新失败', icon: 'none' })
    return
  }

  const route = resolveNotificationRoute(item)
  if (!route) {
    uni.showToast({ title: '这条提醒暂时没有可跳转的页面', icon: 'none' })
    return
  }
  goPage(route)
}

async function handleMarkAllRead() {
  if (!notificationList.value.length || unreadCount.value <= 0) {
    uni.showToast({ title: '当前没有未读消息', icon: 'none' })
    return
  }
  try {
    await markAllNotificationsRead()
    notificationList.value = notificationList.value.map((item) => ({ ...item, isRead: true }))
    unreadCount.value = 0
    syncNotificationUnreadCount(0)
    uni.showToast({ title: '已全部标记为已读', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || '全部已读失败', icon: 'none' })
  }
}

onHide(() => {
  if (unsubscribeNotificationSocket) {
    unsubscribeNotificationSocket()
    unsubscribeNotificationSocket = null
  }
})

onUnload(() => {
  if (unsubscribeNotificationSocket) {
    unsubscribeNotificationSocket()
    unsubscribeNotificationSocket = null
  }
})
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.toolbar-count {
  font-size: 24rpx;
  color: #9d7582;
}

.toolbar-action {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: #fff4f7;
  color: var(--app-color-primary-strong);
  font-size: 24rpx;
  font-weight: 700;
}

.filter-row {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 245, 248, 0.96);
  color: #9d7582;
  font-size: 23rpx;
  font-weight: 600;
  box-shadow: inset 0 0 0 2rpx rgba(255, 229, 236, 0.72);
}

.filter-chip.active {
  background: rgba(255, 233, 240, 0.96);
  color: var(--app-color-primary-strong);
}

.filter-chip-count {
  min-width: 34rpx;
  height: 34rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  line-height: 1;
  background: rgba(255, 255, 255, 0.88);
}

.notification-list {
  margin-top: 18rpx;
  display: grid;
  gap: 16rpx;
}

.notification-card {
  padding: 22rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 250, 0.96));
  box-shadow: var(--app-shadow-soft), inset 0 0 0 2rpx rgba(255, 229, 236, 0.9);
}

.notification-card-active {
  transform: translateY(2rpx) scale(0.988);
}

.notification-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.notification-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.notification-title {
  font-size: 30rpx;
  line-height: 1.4;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.notification-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff8cab, #ff5f8f);
  box-shadow: 0 0 0 8rpx rgba(255, 160, 188, 0.14);
  flex-shrink: 0;
}

.notification-time {
  flex-shrink: 0;
  font-size: 21rpx;
  color: #b78d99;
}

.notification-content {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #8d6c77;
}

.notification-meta {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.notification-actor {
  font-size: 22rpx;
  color: #b18a96;
}

.notification-tag {
  min-width: 92rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 20rpx;
  font-weight: 700;
  background: #f7f4ee;
  color: #99818a;
}

.notification-tag.unread {
  background: rgba(255, 233, 240, 0.96);
  color: #c24d7d;
}

.empty-state {
  margin-top: 18rpx;
  padding: 36rpx 24rpx;
  border-radius: 28rpx;
  background: #fff7fa;
  text-align: center;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.empty-desc {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #9d7582;
}
</style>
