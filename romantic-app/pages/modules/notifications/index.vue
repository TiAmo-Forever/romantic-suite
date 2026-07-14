<template>
  <view class="page app-account-page notification-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="notification-bg notification-bg-a"></view>
    <view class="notification-bg notification-bg-b"></view>
    <view class="notification-bg notification-bg-c"></view>

    <view class="app-account-topbar-shell notification-topbar-shell">
      <AccountHeader title="消息中心" eyebrow="共享收件箱" />
    </view>

    <view class="app-account-content notification-page-content">
      <view class="notification-hero app-fade-up">
        <view class="notification-hero-copy">
          <view class="notification-hero-kicker">daily stream</view>
          <view class="notification-hero-title">消息中心</view>
        </view>
        <view class="notification-stat-grid">
          <view class="notification-stat-card notification-stat-card-strong">
            <view class="notification-stat-value">{{ unreadCount }}</view>
            <view class="notification-stat-label">未读提醒</view>
          </view>
          <view class="notification-stat-card">
            <view class="notification-stat-value">{{ totalCount }}</view>
            <view class="notification-stat-label">全部提醒</view>
          </view>
          <view class="notification-stat-card notification-stat-card-wide">
            <view class="notification-stat-caption">{{ activeFilterLabel }}</view>
            <view class="notification-stat-note">{{ activeFilterSummary }}</view>
          </view>
        </view>
        <view v-if="latestNotificationTimeText" class="notification-hero-updated">
          最近更新 {{ latestNotificationTimeText }}
        </view>
      </view>

        <view class="notification-toolbar app-card-soft app-fade-up app-delay-1">
          <view class="notification-toolbar-head">
            <view>
              <view class="notification-toolbar-title">{{ toolbarTitle }}</view>
            </view>
            <view
              class="toolbar-action"
              :class="{ disabled: unreadCount <= 0 }"
              @click="handleMarkAllRead"
            >
              全部设为已读
            </view>
          </view>
          <view class="filter-row">
            <view
              v-for="item in FILTER_OPTIONS"
              :key="item.key"
              class="filter-chip"
              :class="{ active: activeFilter === item.key }"
              @click="handleFilterChange(item.key)"
            >
              <text class="filter-chip-label">{{ item.label }}</text>
              <text class="filter-chip-count">{{ resolveFilterCount(item.key) }}</text>
            </view>
          </view>
          <view class="filter-row filter-row-types">
            <picker
              class="type-picker"
              mode="selector"
              :range="TYPE_FILTER_OPTIONS"
              range-key="label"
              :value="activeBizTypeIndex"
              @change="handleBizTypePickerChange"
            >
              <view class="type-picker-trigger">
                <view class="type-picker-copy">
                  <text class="type-picker-kicker">消息类型</text>
                  <text class="type-picker-value">{{ activeBizTypeLabel }}</text>
                </view>
                <view class="type-picker-meta">
                  <text class="type-picker-count">{{ activeBizTypeCount }}</text>
                  <text class="type-picker-arrow" aria-hidden="true"></text>
                </view>
              </view>
            </picker>
          </view>
        </view>

      <view v-if="notificationList.length" class="notification-stream app-fade-up app-delay-2">
        <view
          v-for="item in notificationList"
          :key="item.id"
          class="notification-card-shell"
          :class="[
            `theme-${resolveBizThemeKey(item.bizType)}`,
            {
              unread: !item.isRead,
              clickable: canNavigateNotification(item),
              compact: isCompactNotification(item)
            }
          ]"
          :hover-class="resolveCardHoverClass(item)"
          hover-stay-time="70"
          @click="handleOpenNotification(item)"
        >
          <view class="notification-rail"></view>
          <view class="notification-badge">{{ resolveBizGlyph(item.bizType) }}</view>
          <view class="notification-card-main">
            <view class="notification-card-top">
              <view class="notification-type-pill">{{ resolveBizLabel(item.bizType) }}</view>
              <view class="notification-time">{{ formatNotificationTime(item.createdAt) }}</view>
            </view>
            <view class="notification-title-row">
              <view class="notification-title" @longpress.stop="copyText(item.title)">{{ item.title }}</view>
              <view v-if="!item.isRead" class="notification-dot"></view>
            </view>
            <view class="notification-card-content" :class="{ compact: isCompactNotification(item) }" @longpress.stop="copyText(item.content)">
              {{ item.content }}
            </view>
            <view class="notification-meta">
              <view class="notification-actor-line">
                <view class="notification-actor">{{ item.actorNickname || item.actorUsername || '共享动态' }}</view>
                <view v-if="isCompactNotification(item)" class="notification-soft-flag">轻提醒</view>
              </view>
              <view class="notification-tail">
                <view class="notification-tag" :class="{ unread: !item.isRead }">{{ item.isRead ? '已读' : '未读' }}</view>
                <view v-if="canNavigateNotification(item)" class="notification-arrow" aria-hidden="true"></view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="loadingInitial" class="notification-empty-shell app-fade-up app-delay-2">
        <view class="notification-empty-card">
          <view class="notification-empty-kicker">正在整理提醒</view>
          <view class="notification-empty-title">暂无提醒</view>
        </view>
      </view>

      <view v-else class="notification-empty-shell app-fade-up app-delay-2">
        <view class="notification-empty-card">
          <view class="notification-empty-kicker">{{ activeFilterLabel }}</view>
          <view class="notification-empty-title">{{ emptyState.title }}</view>
        </view>
      </view>

      <view v-if="notificationList.length" class="pagination-state">
        <view v-if="loadingMore" class="pagination-copy">加载中</view>
        <view v-else-if="hasMore" class="pagination-copy">继续加载</view>
        <view v-else class="pagination-copy pagination-copy-finished">没有更多了</view>
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

const PAGE_SIZE = 10
const FILTER_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'read', label: '已读' }
]
const TYPE_FILTER_OPTIONS = [
  { key: 'all', label: '全部类型' },
  { key: 'anniversary', label: '纪念日' },
  { key: 'album', label: '相册' },
  { key: 'daily', label: '今日小计' },
  { key: 'improvement', label: '改进' },
  { key: 'countdown', label: '倒计时' },
  { key: 'auth', label: '登录提醒' },
  { key: 'plan', label: '浪漫计划' },
  { key: 'meal', label: '朝夕同味' }
]

const { themeStyle } = useThemePage()
const notificationList = ref([])
const unreadCount = ref(0)
const readCount = ref(0)
const totalCount = ref(0)
const todayCount = ref(0)
const filteredTotal = ref(0)
const bizTypeCounts = ref({})
const todayBizTypeCounts = ref({})
const activeFilter = ref('all')
const activeBizType = ref('all')
const pageNo = ref(1)
const hasMore = ref(false)
const loadingInitial = ref(false)
const loadingMore = ref(false)
const latestNotification = ref(null)
let unsubscribeNotificationSocket = null

const latestNotificationTimeText = computed(() => formatNotificationTime(latestNotification.value?.createdAt))
const activeFilterLabel = computed(() => FILTER_OPTIONS.find((item) => item.key === activeFilter.value)?.label || '全部')
const activeBizTypeLabel = computed(() => TYPE_FILTER_OPTIONS.find((item) => item.key === activeBizType.value)?.label || '全部类型')
const activeBizTypeIndex = computed(() => {
  const index = TYPE_FILTER_OPTIONS.findIndex((item) => item.key === activeBizType.value)
  return index >= 0 ? index : 0
})
const activeBizTypeCount = computed(() => resolveBizTypeCount(activeBizType.value))

function copyText(value) {
  const content = String(value || '').trim()
  if (!content) return
  uni.setClipboardData({
    data: content,
    success: () => {
      uni.showToast({ title: '内容已复制', icon: 'success' })
    }
  })
}

const toolbarTitle = computed(() => {
  if (activeBizType.value === 'all') {
    return `${activeFilterLabel.value}提醒`
  }
  if (activeFilter.value === 'all') {
    return activeBizTypeLabel.value
  }
  return `${activeBizTypeLabel.value} · ${activeFilterLabel.value}`
})
const activeFilterSummary = computed(() => {
  if (activeFilter.value === 'unread') {
    return filteredTotal.value > 0
      ? `${filteredTotal.value} 条未读${buildFilterSubject()}`
      : `暂无未读${buildFilterSubject()}`
  }
  if (activeFilter.value === 'read') {
    return filteredTotal.value > 0
      ? `${filteredTotal.value} 条已读${buildFilterSubject()}`
      : `暂无已读${buildFilterSubject()}`
  }
  const scopedTodayCount = resolveTodayTypeCount(activeBizType.value)
  if (scopedTodayCount > 0) {
    return activeBizType.value === 'all'
      ? `今天一共收到了 ${scopedTodayCount} 条动态`
      : `今天收到了 ${scopedTodayCount} 条${activeBizTypeLabel.value}动态`
  }
  return activeBizType.value === 'all'
    ? '今日暂无新提醒'
    : `今日暂无新的${activeBizTypeLabel.value}提醒`
})
const toolbarContextLabel = computed(() => activeBizType.value === 'all' ? '消息流' : activeBizTypeLabel.value)
const toolbarSubtitle = computed(() => {
  if (activeFilter.value === 'unread') {
    return filteredTotal.value > 0
      ? `当前显示未读${toolbarContextLabel.value}`
      : `暂无未读${toolbarContextLabel.value}`
  }
  if (activeFilter.value === 'read') {
    return filteredTotal.value > 0
      ? `当前显示已读${toolbarContextLabel.value}`
      : `暂无已读${toolbarContextLabel.value}`
  }
  return activeBizType.value === 'all'
    ? (unreadCount.value > 0 ? '按时间倒序展示全部提醒' : '暂无提醒')
    : `当前仅显示${activeBizTypeLabel.value}提醒`
})
const emptyState = computed(() => {
  if (activeFilter.value === 'unread') {
    return {
      title: activeBizType.value === 'all' ? '当前没有未读提醒' : `当前没有未读的${activeBizTypeLabel.value}提醒`,
      desc: ''
    }
  }
  if (activeFilter.value === 'read') {
    return {
      title: activeBizType.value === 'all' ? '还没有已读记录' : `还没有已读的${activeBizTypeLabel.value}记录`,
      desc: ''
    }
  }
  return {
    title: activeBizType.value === 'all' ? '还没有新的提醒' : `还没有${activeBizTypeLabel.value}提醒`,
    desc: ''
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
        bizType: activeBizType.value,
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
    filteredTotal.value = pageData.total
    latestNotification.value = latest
    unreadCount.value = stats.unreadCount
    readCount.value = stats.readCount
    totalCount.value = stats.totalCount
    todayCount.value = stats.todayCount
    bizTypeCounts.value = stats.bizTypeCounts || {}
    todayBizTypeCounts.value = stats.todayBizTypeCounts || {}
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

function handleBizTypeChange(typeKey) {
  if (activeBizType.value === typeKey) return
  activeBizType.value = typeKey
  loadNotifications({ reset: true })
}

function handleBizTypePickerChange(event) {
  const index = Number(event?.detail?.value ?? -1)
  const option = TYPE_FILTER_OPTIONS[index]
  if (!option) return
  handleBizTypeChange(option.key)
}

function resolveFilterCount(filterKey) {
  if (filterKey === 'unread') return unreadCount.value
  if (filterKey === 'read') return readCount.value
  return totalCount.value
}

function resolveBizTypeCount(typeKey) {
  if (typeKey === 'all') return totalCount.value
  return Number(bizTypeCounts.value?.[typeKey] || 0)
}

function resolveTodayTypeCount(typeKey) {
  if (typeKey === 'all') return todayCount.value
  return Number(todayBizTypeCounts.value?.[typeKey] || 0)
}

function buildFilterSubject() {
  return activeBizType.value === 'all' ? '提醒' : `${activeBizTypeLabel.value}提醒`
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
    case 'romantic_plan':
      return '浪漫计划'
    case 'meal':
      return '朝夕同味'
    default:
      return '共享动态'
  }
}

function resolveBizThemeKey(bizType) {
  switch (bizType) {
    case 'anniversary':
      return 'anniversary'
    case 'album':
      return 'album'
    case 'improvement_note':
    case 'improvement_feedback':
      return 'improvement'
    case 'countdown':
      return 'countdown'
    case 'auth':
    case 'login':
      return 'auth'
    case 'daily_summary':
    case 'daily_summary_entry':
      return 'daily'
    case 'romantic_plan':
      return 'plan'
    case 'meal':
      return 'meal'
    default:
      return 'shared'
  }
}

function resolveBizGlyph(bizType) {
  switch (resolveBizThemeKey(bizType)) {
    case 'anniversary':
      return '纪'
    case 'album':
      return '册'
    case 'improvement':
      return '簿'
    case 'countdown':
      return '计'
    case 'auth':
      return '登'
    case 'daily':
      return '今'
    case 'plan':
      return '浪'
    case 'meal':
      return '味'
    default:
      return '新'
  }
}

function isCompactNotification(item) {
  const type = String(item?.type || '').trim()
  const bizType = String(item?.bizType || '').trim()
  return type === 'login' || bizType === 'auth' || bizType === 'login'
}

function parsePayload(item) {
  try {
    return JSON.parse(item?.payloadJson || '{}')
  } catch (error) {
    return {}
  }
}

function resolveNotificationRoute(item) {
  const type = String(item?.type || '').trim()
  const bizId = Number(item?.bizId || 0)
  const payload = parsePayload(item)

  switch (type) {
    case 'login':
      return ''
    case 'anniversary_deleted':
      return '/pages/modules/anniversary/index'
    case 'album_deleted':
      return '/pages/modules/album/index'
    case 'countdown_deleted':
      return '/pages/modules/countdown/index'
    case 'daily_summary_entry_deleted':
      return '/pages/modules/daily-summary/index'
    case 'improvement_deleted':
      return '/pages/modules/improvement/index'
    case 'improvement_feedback_deleted':
      return payload.noteId ? `/pages/modules/improvement/detail?id=${payload.noteId}` : '/pages/modules/improvement/index'
    case 'romantic_plan_deleted':
      return '/pages/modules/romantic-plan/index'
  }

  switch (item?.bizType) {
    case 'anniversary':
      return bizId ? `/pages/modules/anniversary/detail?id=${bizId}` : '/pages/modules/anniversary/index'
    case 'album':
      return bizId ? `/pages/modules/album/detail?id=${bizId}` : '/pages/modules/album/index'
    case 'auth':
      return ''
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
    case 'romantic_plan':
      return payload.planId
        ? `/pages/modules/romantic-plan/detail?id=${encodeURIComponent(payload.planId)}`
        : (bizId ? `/pages/modules/romantic-plan/detail?id=${encodeURIComponent(bizId)}` : '/pages/modules/romantic-plan/index')
    case 'meal':
      if (type === 'meal_weekly_updated') {
        return `/pages/modules/meal/weekly?date=${encodeURIComponent(payload.date || '')}`
      }
      return `/pages/modules/meal/index?date=${encodeURIComponent(payload.date || '')}`
    default:
      return ''
  }
}

function canNavigateNotification(item) {
  return Boolean(resolveNotificationRoute(item))
}

function resolveCardHoverClass(item) {
  return !item.isRead || canNavigateNotification(item) ? 'notification-card-active' : ''
}

function padNumber(value) {
  return String(value).padStart(2, '0')
}

function parseDateTime(value) {
  const text = String(value || '').trim()
  if (!text) return null
  const normalized = text.replace(/-/g, '/').replace('T', ' ')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatNotificationTime(value) {
  const raw = String(value || '').trim()
  const date = parseDateTime(raw)
  if (!date) return raw

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((todayStart - targetStart) / 86400000)
  const hourMinute = `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`

  if (diffDays === 0) {
    return `今天 ${hourMinute}`
  }
  if (diffDays === 1) {
    return `昨天 ${hourMinute}`
  }
  if (date.getFullYear() === now.getFullYear()) {
    return `${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${hourMinute}`
  }
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
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
.notification-page {
  --notice-ink: #234d45;
  --notice-sub: #6c726d;
  --notice-soft: #8b8f86;
  --notice-paper: rgba(255, 252, 247, 0.94);
  --notice-paper-strong: rgba(255, 248, 240, 0.98);
  --notice-line: rgba(35, 77, 69, 0.08);
  --notice-shadow: 0 24rpx 70rpx rgba(114, 115, 91, 0.12);
  position: relative;
  overflow-x: hidden;
  background:
    radial-gradient(circle at top left, rgba(244, 219, 199, 0.72), transparent 30%),
    radial-gradient(circle at top right, rgba(214, 232, 223, 0.7), transparent 24%),
    linear-gradient(180deg, #fffdf8 0%, #f8f6ef 54%, #f5f4ee 100%);
}

.notification-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(18rpx);
  opacity: 0.72;
  pointer-events: none;
}

.notification-bg-a {
  width: 280rpx;
  height: 280rpx;
  top: 180rpx;
  right: -80rpx;
  background: rgba(255, 209, 176, 0.66);
}

.notification-bg-b {
  width: 220rpx;
  height: 220rpx;
  left: -70rpx;
  top: 500rpx;
  background: rgba(186, 220, 205, 0.7);
}

.notification-bg-c {
  width: 260rpx;
  height: 260rpx;
  right: 12rpx;
  bottom: 180rpx;
  background: rgba(242, 227, 178, 0.5);
}

.notification-topbar-shell {
  position: relative;
  z-index: 2;
  padding-bottom: 10rpx;
  background: linear-gradient(180deg, rgba(255, 252, 247, 0.76), rgba(255, 252, 247, 0.28));
  backdrop-filter: blur(16px);
}

.notification-page-content {
  position: relative;
  z-index: 2;
  padding: 12rpx 24rpx calc(48rpx + env(safe-area-inset-bottom));
}

.notification-hero {
  position: relative;
  overflow: hidden;
  padding: 32rpx 26rpx 28rpx;
  border-radius: 36rpx;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.84), rgba(255, 249, 241, 0.96)),
    var(--notice-paper);
  box-shadow:
    var(--notice-shadow),
    inset 0 0 0 2rpx rgba(255, 255, 255, 0.74);
}

.notification-hero::before {
  content: '';
  position: absolute;
  inset: auto -40rpx -90rpx auto;
  width: 260rpx;
  height: 260rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(193, 220, 208, 0.56), rgba(193, 220, 208, 0));
}

.notification-hero-copy,
.notification-stat-grid,
.notification-hero-updated {
  position: relative;
  z-index: 1;
}

.notification-hero-kicker {
  font-size: 20rpx;
  letter-spacing: 3rpx;
  text-transform: uppercase;
  color: #be8f64;
  font-weight: 700;
}

.notification-hero-title {
  margin-top: 12rpx;
  font-size: 40rpx;
  line-height: 1.3;
  font-weight: 800;
  color: var(--notice-ink);
}

.notification-hero-desc {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--notice-sub);
}

.notification-stat-grid {
  margin-top: 26rpx;
  display: flex;
  flex-wrap: wrap;
  margin: 26rpx -7rpx 0;
}

.notification-stat-card {
  width: calc(50% - 14rpx);
  min-height: 124rpx;
  margin: 0 7rpx 14rpx;
  padding: 20rpx 20rpx 18rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.84);
  box-sizing: border-box;
}

.notification-stat-card-strong {
  background: linear-gradient(180deg, rgba(255, 238, 223, 0.98), rgba(255, 246, 236, 0.94));
}

.notification-stat-card-wide {
  width: calc(100% - 14rpx);
  min-height: 104rpx;
  margin-bottom: 0;
}

.notification-stat-value {
  font-size: 46rpx;
  line-height: 1;
  font-weight: 800;
  color: var(--notice-ink);
}

.notification-stat-label {
  margin-top: 14rpx;
  font-size: 22rpx;
  color: var(--notice-soft);
}

.notification-stat-caption {
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: #b1845c;
}

.notification-stat-note {
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: var(--notice-ink);
  font-weight: 700;
}

.notification-hero-updated {
  margin-top: 18rpx;
  display: inline-flex;
  align-items: center;
  min-height: 54rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: #9a7f66;
  font-size: 22rpx;
  font-weight: 600;
}

.notification-toolbar {
  margin-top: 20rpx;
  padding: 22rpx 22rpx 20rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.82);
  box-shadow:
    0 18rpx 50rpx rgba(101, 108, 83, 0.08),
    inset 0 0 0 2rpx rgba(255, 255, 255, 0.82);
}

.notification-toolbar-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.notification-toolbar-title {
  font-size: 30rpx;
  line-height: 1.3;
  font-weight: 800;
  color: var(--notice-ink);
}

.notification-toolbar-subtitle {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--notice-soft);
}

.toolbar-action {
  min-height: 60rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(255, 239, 226, 0.98), rgba(255, 248, 240, 0.96));
  color: #b46d58;
  font-size: 22rpx;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: inset 0 0 0 2rpx rgba(255, 228, 211, 0.9);
}

.toolbar-action.disabled {
  opacity: 0.55;
  box-shadow: inset 0 0 0 2rpx rgba(228, 228, 220, 0.72);
}

.filter-row {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.filter-row-types {
  margin-top: 14rpx;
}

.type-picker {
  width: 100%;
}

.type-picker-trigger {
  min-height: 88rpx;
  padding: 0 20rpx 0 22rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  background: linear-gradient(180deg, rgba(248, 246, 240, 0.96), rgba(255, 255, 255, 0.92));
  box-shadow:
    inset 0 0 0 2rpx rgba(218, 214, 202, 0.62),
    0 10rpx 24rpx rgba(122, 125, 108, 0.06);
}

.type-picker-copy {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 14rpx;
}

.type-picker-kicker {
  flex-shrink: 0;
  font-size: 20rpx;
  letter-spacing: 2rpx;
  color: #b08c69;
  font-weight: 700;
}

.type-picker-value {
  min-width: 0;
  font-size: 26rpx;
  color: var(--notice-ink);
  font-weight: 800;
}

.type-picker-meta {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 14rpx;
}

.type-picker-count {
  min-width: 46rpx;
  height: 46rpx;
  padding: 0 12rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  color: #7f877f;
  font-size: 21rpx;
  font-weight: 800;
  box-shadow: inset 0 0 0 2rpx rgba(235, 233, 226, 0.82);
}

.type-picker-arrow {
  width: 16rpx;
  height: 16rpx;
  border-right: 4rpx solid rgba(118, 124, 114, 0.84);
  border-bottom: 4rpx solid rgba(118, 124, 114, 0.84);
  border-radius: 2rpx;
  transform: rotate(45deg) translateY(-2rpx);
  box-sizing: border-box;
}

.filter-chip {
  min-height: 70rpx;
  padding: 0 20rpx;
  border-radius: 22rpx;
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(246, 244, 238, 0.92);
  box-shadow: inset 0 0 0 2rpx rgba(214, 214, 204, 0.45);
}

.filter-chip.active {
  background: linear-gradient(180deg, rgba(221, 238, 229, 0.98), rgba(243, 249, 244, 0.96));
  box-shadow: inset 0 0 0 2rpx rgba(177, 208, 191, 0.74);
}

.filter-chip-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #6b726d;
}

.filter-chip.active .filter-chip-label {
  color: var(--notice-ink);
}

.filter-chip-count {
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.88);
  font-size: 20rpx;
  font-weight: 700;
  color: #8a8f87;
}

.notification-stream {
  margin-top: 20rpx;
}

.notification-card-shell + .notification-card-shell {
  margin-top: 18rpx;
}

.notification-card-shell {
  --notification-accent: #d09c75;
  --notification-accent-soft: rgba(244, 225, 206, 0.76);
  --notification-surface: rgba(255, 255, 255, 0.84);
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 18rpx;
  padding: 24rpx 22rpx;
  border-radius: 34rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 249, 244, 0.96)),
    var(--notification-surface);
  box-shadow:
    0 20rpx 56rpx rgba(111, 112, 92, 0.08),
    inset 0 0 0 2rpx rgba(255, 255, 255, 0.8);
}

.notification-card-shell.compact {
  padding-top: 22rpx;
  padding-bottom: 20rpx;
}

.notification-card-shell.unread {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 247, 240, 0.98)),
    var(--notification-surface);
}

.notification-card-shell.clickable {
  cursor: pointer;
}

.notification-card-active {
  transform: translateY(2rpx) scale(0.988);
}

.notification-rail {
  width: 8rpx;
  border-radius: 999rpx;
  align-self: stretch;
  background: linear-gradient(180deg, var(--notification-accent), rgba(255, 255, 255, 0));
  opacity: 0.88;
}

.notification-badge {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--notification-accent-soft);
  color: var(--notification-accent);
  font-size: 28rpx;
  font-weight: 800;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.68);
}

.notification-card-main {
  flex: 1;
  min-width: 0;
}

.notification-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.notification-type-pill {
  min-height: 44rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.84);
  color: var(--notification-accent);
  font-size: 20rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.notification-time {
  flex-shrink: 0;
  font-size: 21rpx;
  color: #9a9a8f;
}

.notification-title-row {
  margin-top: 14rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.notification-title {
  flex: 1;
  min-width: 0;
  font-size: 32rpx;
  line-height: 1.42;
  font-weight: 800;
  color: var(--notice-ink);
}

.notification-dot {
  width: 14rpx;
  height: 14rpx;
  margin-top: 10rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff9f7b, #eb6e64);
  box-shadow: 0 0 0 8rpx rgba(255, 186, 156, 0.14);
  flex-shrink: 0;
}

.notification-card-content {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--notice-sub);
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.notification-card-content.compact {
  -webkit-line-clamp: 2;
}

.notification-meta {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.notification-actor-line {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.notification-actor {
  font-size: 22rpx;
  color: #8e938a;
}

.notification-soft-flag {
  min-height: 42rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(241, 244, 246, 0.9);
  color: #8291a1;
  font-size: 20rpx;
  font-weight: 700;
}

.notification-tail {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.notification-tag {
  min-width: 92rpx;
  min-height: 46rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(243, 240, 233, 0.9);
  color: #8a867d;
  font-size: 20rpx;
  font-weight: 800;
}

.notification-tag.unread {
  background: linear-gradient(180deg, rgba(255, 237, 224, 0.98), rgba(255, 247, 242, 0.98));
  color: #b46854;
}

.notification-arrow {
  width: 16rpx;
  height: 16rpx;
  border-top: 4rpx solid rgba(120, 125, 113, 0.82);
  border-right: 4rpx solid rgba(120, 125, 113, 0.82);
  border-radius: 2rpx;
  transform: rotate(45deg);
  box-sizing: border-box;
}

.notification-empty-shell {
  margin-top: 20rpx;
}

.notification-empty-card {
  padding: 34rpx 28rpx;
  border-radius: 34rpx;
  background: rgba(255, 252, 247, 0.88);
  box-shadow:
    0 18rpx 50rpx rgba(101, 108, 83, 0.08),
    inset 0 0 0 2rpx rgba(255, 255, 255, 0.82);
  text-align: center;
}

.notification-empty-kicker {
  font-size: 21rpx;
  letter-spacing: 2rpx;
  color: #bb8a62;
  font-weight: 700;
}

.notification-empty-title {
  margin-top: 16rpx;
  font-size: 32rpx;
  line-height: 1.36;
  color: var(--notice-ink);
  font-weight: 800;
}

.notification-empty-desc {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--notice-sub);
}

.pagination-state {
  margin-top: 18rpx;
  display: flex;
  justify-content: center;
}

.pagination-copy {
  min-height: 56rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 252, 247, 0.88);
  color: #9a9388;
  font-size: 22rpx;
}

.pagination-copy-finished {
  color: #8b867c;
}

.theme-anniversary {
  --notification-accent: #d06f5a;
  --notification-accent-soft: rgba(252, 225, 214, 0.86);
}

.theme-album {
  --notification-accent: #c88d52;
  --notification-accent-soft: rgba(247, 232, 210, 0.92);
}

.theme-improvement {
  --notification-accent: #7e8d67;
  --notification-accent-soft: rgba(224, 234, 215, 0.92);
}

.theme-countdown {
  --notification-accent: #5b8fa0;
  --notification-accent-soft: rgba(219, 236, 242, 0.92);
}

.theme-auth {
  --notification-accent: #8592ac;
  --notification-accent-soft: rgba(230, 236, 245, 0.92);
}

.theme-daily {
  --notification-accent: #da7c66;
  --notification-accent-soft: rgba(251, 230, 221, 0.92);
}

.theme-plan {
  --notification-accent: #6f8a79;
  --notification-accent-soft: rgba(221, 234, 226, 0.92);
}

.theme-meal {
  --notification-accent: #d08a4f;
  --notification-accent-soft: rgba(250, 231, 209, 0.92);
}

.theme-shared {
  --notification-accent: #9b8f74;
  --notification-accent-soft: rgba(239, 234, 222, 0.92);
}

@media screen and (max-width: 560px) {
  .notification-hero-title {
    font-size: 36rpx;
  }

  .notification-toolbar-head {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-action {
    align-self: flex-start;
  }

  .notification-card-shell {
    gap: 14rpx;
    padding-left: 18rpx;
    padding-right: 18rpx;
  }

  .notification-badge {
    width: 64rpx;
    height: 64rpx;
    border-radius: 20rpx;
    font-size: 26rpx;
  }
}
</style>
