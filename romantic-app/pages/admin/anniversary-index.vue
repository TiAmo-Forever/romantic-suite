<template>
  <view class="page app-page-shell admin-anniversary-page" :style="themeStyle">
    <view class="admin-topbar app-topbar">
      <view class="top-nav-btn app-topbar-btn" @click="backPage">
        <view class="top-nav-icon app-topbar-icon" aria-hidden="true"></view>
        <text class="top-nav-text app-topbar-text">返回</text>
      </view>
      <view class="app-topbar-center">
        <view class="app-topbar-eyebrow">纪念日</view>
        <view class="app-topbar-title">重要日子</view>
      </view>
      <view class="top-nav-placeholder"></view>
    </view>

    <view class="filter-row app-fade-up">
      <view v-for="item in filters" :key="item.key" class="filter-chip" :class="{ active: activeFilter === item.key }" @click="switchFilter(item.key)">
        {{ item.label }}
      </view>
    </view>

    <view v-if="eventList.length" class="event-list app-fade-up app-delay-1">
      <view v-for="item in eventList" :key="item.id" class="event-card app-card-soft" hover-class="event-card-active" hover-stay-time="70" @click="openDetail(item.id)">
        <view class="event-title-row">
          <view class="event-title">{{ item.title }}</view>
          <view v-if="item.pinned" class="event-pin-tag">首页置顶</view>
        </view>
        <view class="event-date">{{ item.eventDate || '待设置' }}</view>
        <view class="event-status">{{ formatStatus(item) }}</view>
        <view class="event-summary">{{ item.description || item.location || '暂无说明' }}</view>
      </view>
    </view>

    <view v-else class="empty-card app-card-soft app-fade-up app-delay-1">
      <view class="empty-title">还没有纪念日</view>
      <view class="empty-desc">暂无纪念日</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireAuth, isAdminUser } from '@/utils/auth.js'
import { backPage, goPage, relaunchPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import { fetchAdminAnniversaryList } from '@/services/admin.js'

const { themeStyle } = useThemePage()
const activeFilter = ref('all')
const eventList = ref([])

const filters = [
  { key: 'all', label: '全部' },
  { key: 'future', label: '未发生' },
  { key: 'past', label: '已发生' }
]

async function loadEvents() {
  eventList.value = await fetchAdminAnniversaryList(activeFilter.value)
}

async function switchFilter(filterKey) {
  if (activeFilter.value === filterKey) return
  activeFilter.value = filterKey
  await loadEvents()
}

function openDetail(id) {
  goPage(`/pages/admin/anniversary-detail?id=${id}`)
}

function formatStatus(item) {
  const offset = Number(item?.dayOffset || 0)
  if (item?.timeStatus === 'future') {
    return offset === 0 ? '就是今天' : `还有 ${offset} 天`
  }
  return `已过去 ${Math.abs(offset)} 天`
}

onShow(() => {
  if (!requireAuth()) return
  if (!isAdminUser()) {
    relaunchPage('/pages/home/home')
    return
  }
  loadEvents().catch((error) => {
    uni.showToast({ title: error?.message || '加载失败', icon: 'none' })
  })
})
</script>

<style scoped>
  .admin-anniversary-page { background: var(--app-page-gradient-main); }
  .admin-topbar { position: sticky; top: var(--app-sticky-top); z-index: 10; background: rgba(255, 255, 255, 0.58); backdrop-filter: blur(12px); }
  .top-nav-icon { width: 18rpx; height: 18rpx; border-left: 4rpx solid currentColor; border-bottom: 4rpx solid currentColor; border-radius: 2rpx; box-sizing: border-box; transform: rotate(45deg); }
  .top-nav-placeholder { width: 88rpx; }
  .filter-row { display: flex; gap: 16rpx; flex-wrap: wrap; }
  .filter-chip { padding: 14rpx 24rpx; border-radius: 999rpx; background: #fff3f7; color: #b77287; font-size: 24rpx; font-weight: 700; }
  .filter-chip.active { background: var(--app-gradient-primary); color: #fff; }
  .event-list { display: grid; gap: 20rpx; margin-top: 24rpx; }
  .event-card { padding: 26rpx 24rpx; }
  .event-card-active { transform: scale(0.985); }
  .event-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16rpx; }
  .event-title { flex: 1; min-width: 0; font-size: 30rpx; font-weight: 700; color: var(--app-color-primary-strong); }
  .event-pin-tag { padding: 8rpx 14rpx; border-radius: 999rpx; background: linear-gradient(135deg, #ffe9b8, #ffd48d); color: #9f6c10; font-size: 20rpx; font-weight: 700; }
  .event-date { margin-top: 14rpx; font-size: 24rpx; color: #8f6d78; }
  .event-status { margin-top: 10rpx; font-size: 26rpx; font-weight: 700; color: #ff6b97; }
  .event-summary { margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: #9a7682; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-all; }
  .empty-card { margin-top: 28rpx; padding: 46rpx 28rpx; text-align: center; }
  .empty-title { font-size: 30rpx; font-weight: 700; color: var(--app-color-primary-strong); }
  .empty-desc { margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: #9a7682; }
</style>
