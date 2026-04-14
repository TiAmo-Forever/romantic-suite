<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="消息中心" eyebrow="站内提醒" />
    </view>

    <view class="app-account-content">
      <view class="app-account-stack">
        <AccountIntroCard
          eyebrow="提醒流"
          title="把今天的共享动态慢慢收在这里"
          description="登录、纪念日、相册、倒计时和改进簿的更新都会汇成一条柔和的消息流，方便你们随时回看今天发生了什么。"
          :tags="introTags"
        >
          <template #meta>
            <view v-if="latestNotificationTime" class="app-account-intro-chip intro-time-chip">最近更新 {{ latestNotificationTime }}</view>
          </template>
        </AccountIntroCard>

        <AccountPanel title="提醒列表" description="点开一条提醒会自动标记为已读，并尽量跳到对应的业务页面。">
          <view class="toolbar">
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
            <view class="toolbar-action" :class="{ disabled: unreadCount <= 0 }" @click="handleMarkAllRead">全部已读</view>
          </view>

          <view v-if="notificationList.length" class="notification-list">
            <view
              v-for="item in notificationList"
              :key="item.id"
              class="notification-card app-card-soft"
              :class="{ unread: !item.isRead }"
              hover-class="notification-card-active"
              hover-stay-time="70"
              @click="handleOpenNotification(item)"
            >
              <view class="notification-head">
                <view class="notification-type-pill" :class="{ unread: !item.isRead }">{{ resolveBizLabel(item.bizType) }}</view>
                <view class="notification-time">{{ item.createdAt }}</view>
              </view>
              <view class="notification-title-row">
                <view class="notification-title">{{ item.title }}</view>
                <view v-if="!item.isRead" class="notification-dot"></view>
              </view>
              <view class="notification-content">{{ item.content }}</view>
              <view class="notification-meta">
                <view class="notification-actor">{{ item.actorNickname || item.actorUsername || '共享动态' }}</view>
                <view class="notification-tail">
                  <view class="notification-tag" :class="{ unread: !item.isRead }">{{ item.isRead ? '已读' : '未读' }}</view>
                  <view class="notification-arrow" aria-hidden="true"></view>
                </view>
              </view>
            </view>
          </view>

          <view v-if="notificationList.length" class="pagination-state">
            <view v-if="loadingMore" class="pagination-copy">正在加载更多提醒...</view>
            <view v-else-if="hasMore" class="pagination-copy">上滑继续查看更早的提醒</view>
            <view v-else class="pagination-copy pagination-copy-finished">已经看到最后一条提醒了</view>
          </view>

          <view v-else class="empty-state">
            <view class="empty-badge">{{ activeFilterLabel }}</view>
            <view class="empty-title">{{ emptyState.title }}</view>
            <view class="empty-desc">{{ emptyState.desc }}</view>
          </view>
        </AccountPanel>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onHide, onReachBottom, onShow, onUnload } from '@dcloudio/uni-app'
import {
  fetchLatestNotification,
  fetchNotificationList,
  fetchNotificationStats,
  markAllNotificationsRead,
  markNotificationRead
} from '@/services/notifications.js'
import { requireAuth } from '@/utils/auth.js'
import { goPage } from '@/utils/nav.js'
import { syncNotificationUnreadCount } from '@/utils/notification-indicator.js'
import { subscribeNotificationSocket } from '@/utils/notification-socket.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountIntroCard from '@/pages/account/components/AccountIntroCard.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const PAGE_SIZE = 10
const FILTER_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'read', label: '已读' }
]

const { themeStyle } = useThemePage()
const notificationList = ref([])
const unreadCount = ref(0)
const readCount = ref(0)
const totalCount = ref(0)
const activeFilter = ref('all')
const pageNo = ref(1)
const hasMore = ref(false)
const loadingInitial = ref(false)
const loadingMore = ref(false)
const latestNotification = ref(null)
let unsubscribeNotificationSocket = null

const latestNotificationTime = computed(() => String(latestNotification.value?.createdAt || '').trim())
const activeFilterLabel = computed(() => FILTER_OPTIONS.find((item) => item.key === activeFilter.value)?.label || '全部')
const introTags = computed(() => [
  unreadCount.value > 0 ? `${unreadCount.value} 条未读` : '已全部看过',
  `${totalCount.value} 条提醒`
])
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
      loadNotifications({ reset: true, silent: true })
    })
  }
  await loadNotifications({ reset: true })
})

onReachBottom(() => {
  loadNotifications()
})

async function loadNotifications(options = {}) {
  const reset = Boolean(options.reset)
  const silent = Boolean(options.silent)

  if (loadingInitial.value || loadingMore.value) return
  if (!reset && !hasMore.value) return

  if (reset) {
    loadingInitial.value = true
  } else {
    loadingMore.value = true
  }

  const targetPage = reset ? 1 : pageNo.value + 1

  try {
    const [pageData, stats, latest] = await Promise.all([
      fetchNotificationList({
        filter: activeFilter.value,
        page: targetPage,
        pageSize: PAGE_SIZE
      }),
      fetchNotificationStats(),
      reset ? fetchLatestNotification() : Promise.resolve(latestNotification.value)
    ])

    notificationList.value = reset
      ? pageData.list
      : notificationList.value.concat(pageData.list)
    pageNo.value = pageData.page
    hasMore.value = pageData.hasMore
    latestNotification.value = latest
    unreadCount.value = stats.unreadCount
    readCount.value = stats.readCount
    totalCount.value = stats.totalCount
    syncNotificationUnreadCount(unreadCount.value)
  } catch (error) {
    if (!silent) {
      uni.showToast({ title: error?.message || '消息加载失败', icon: 'none' })
    }
  } finally {
    loadingInitial.value = false
    loadingMore.value = false
  }
}

function handleFilterChange(filterKey) {
  if (activeFilter.value === filterKey) return
  activeFilter.value = filterKey
  loadNotifications({ reset: true })
}

function resolveFilterCount(filterKey) {
  if (filterKey === 'unread') return unreadCount.value
  if (filterKey === 'read') return readCount.value
  return totalCount.value
}

function resolveBizLabel(bizType) {
  switch (bizType) {
    case 'anniversary':
      return '纪念日'
    case 'album':
      return '甜蜜相册'
    case 'improvement_note':
      return '改进记录'
    case 'improvement_feedback':
      return '反馈更新'
    case 'countdown':
      return '倒计时'
    case 'auth':
    case 'login':
      return '登录提醒'
    case 'daily_summary':
    case 'daily_summary_entry':
      return '今日小计'
    default:
      return '共享动态'
  }
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
      return bizId ? `/pages/modules/anniversary/detail?id=${bizId}` : '/pages/modules/anniversary/index'
    case 'album':
      return bizId ? `/pages/modules/album/detail?id=${bizId}` : '/pages/modules/album/index'
    case 'auth':
      return '/pages/account/security'
    case 'improvement_note':
      return bizId ? `/pages/modules/improvement/detail?id=${bizId}` : '/pages/modules/improvement/index'
    case 'improvement_feedback':
      return payload.noteId ? `/pages/modules/improvement/detail?id=${payload.noteId}` : '/pages/modules/improvement/index'
    case 'countdown':
      return '/pages/modules/countdown/index'
    case 'daily_summary':
    case 'daily_summary_entry':
      return payload.summaryDate
        ? `/pages/modules/daily-summary/detail?date=${encodeURIComponent(payload.summaryDate)}`
        : '/pages/modules/daily-summary/detail'
    default:
      return ''
  }
}

async function handleOpenNotification(item) {
  try {
    if (!item.isRead) {
      await markNotificationRead(item.id)
      if (activeFilter.value === 'unread') {
        await loadNotifications({ reset: true, silent: true })
      } else {
        item.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
        readCount.value += 1
        syncNotificationUnreadCount(unreadCount.value)
      }
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
  if (unreadCount.value <= 0) {
    uni.showToast({ title: '当前没有未读消息', icon: 'none' })
    return
  }
  try {
    await markAllNotificationsRead()
    await loadNotifications({ reset: true, silent: true })
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
.intro-time-chip {
  background: rgba(255, 244, 247, 0.96);
  color: #b76e85;
}

.toolbar {
  margin-top: 18rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20rpx;
}

.toolbar-action {
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: #fff4f7;
  color: var(--app-color-primary-strong);
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1;
  box-shadow: inset 0 0 0 2rpx rgba(255, 229, 236, 0.72);
}

.toolbar-action.disabled {
  opacity: 0.55;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  flex: 1;
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
  padding: 24rpx 22rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 250, 0.96));
  box-shadow: var(--app-shadow-soft), inset 0 0 0 2rpx rgba(255, 229, 236, 0.9);
}

.notification-card.unread {
  background: linear-gradient(180deg, rgba(255, 251, 252, 0.98), rgba(255, 243, 247, 0.98));
}

.notification-card-active {
  transform: translateY(2rpx) scale(0.988);
}

.notification-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.notification-type-pill {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #fff4f7;
  color: #b9758b;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1.2;
}

.notification-type-pill.unread {
  background: rgba(255, 230, 239, 0.96);
  color: #c35480;
}

.notification-title-row {
  margin-top: 14rpx;
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}

.notification-title {
  flex: 1;
  min-width: 0;
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

.notification-tail {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
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

.notification-arrow {
  width: 16rpx;
  height: 16rpx;
  border-top: 4rpx solid #d195a8;
  border-right: 4rpx solid #d195a8;
  border-radius: 2rpx;
  transform: rotate(45deg);
  box-sizing: border-box;
}

.pagination-state {
  margin-top: 18rpx;
  display: flex;
  justify-content: center;
}

.pagination-copy {
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #b28a96;
  background: rgba(255, 245, 248, 0.92);
}

.pagination-copy-finished {
  color: #a18b95;
}

.empty-state {
  margin-top: 18rpx;
  padding: 36rpx 24rpx;
  border-radius: 28rpx;
  background: #fff7fa;
  text-align: center;
}

.empty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #fff0f4;
  color: #c26d88;
  font-size: 22rpx;
  font-weight: 700;
}

.empty-title {
  margin-top: 16rpx;
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

@media screen and (max-width: 560px) {
  .toolbar {
    align-items: stretch;
  }

  .toolbar-action {
    align-self: flex-start;
  }
}
</style>
