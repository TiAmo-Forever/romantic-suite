<template>
  <view class="page app-page-shell app-page-shell-tabbed anniversary-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="TEXT.pageTitle" :eyebrow="TEXT.eyebrow" />
    </view>

    <view class="hero-card app-fade-up">
      <view class="hero-badge app-pill app-pill-glass">{{ TEXT.heroBadge }}</view>
      <view class="hero-title">{{ TEXT.heroTitle }}</view>
      <view class="hero-desc">{{ TEXT.heroDesc }}</view>
      <view class="hero-actions">
        <button class="hero-btn app-primary-btn app-primary-btn-shadow" @click="goCreate">{{ TEXT.createButton }}</button>
      </view>
    </view>

    <view class="filter-row app-fade-up app-delay-1">
      <view
        v-for="item in filters"
        :key="item.key"
        class="filter-chip"
        :class="{ active: activeFilter === item.key }"
        @click="switchFilter(item.key)"
      >
        {{ item.label }}
      </view>
    </view>

    <view v-if="eventList.length" class="event-list app-fade-up app-delay-2">
      <view
        v-for="item in eventList"
        :key="item.id"
        class="event-card app-card-soft"
        hover-class="event-card-active"
        hover-stay-time="70"
        @click="openDetail(item.id)"
      >
        <image v-if="item.coverUrl" class="event-cover" :src="resolveMediaUrl(item.coverUrl)" mode="aspectFill" @click.stop="previewEventCover(item)"></image>
        <view v-else class="event-cover event-cover-placeholder">
          <view class="event-cover-icon">{{ HEART }}</view>
        </view>
        <view class="event-body">
          <view class="event-title-row">
            <view class="event-title">{{ item.title }}</view>
            <view class="event-type">{{ typeLabels[item.type] || TEXT.defaultType }}</view>
          </view>
          <view class="event-date">{{ item.eventDate }}</view>
          <view class="event-status">{{ formatStatus(item) }}</view>
          <view v-if="item.creatorNickname" class="event-creator">{{ creatorText(item) }}</view>
          <view class="event-summary">{{ item.description || item.location || TEXT.cardFallback }}</view>

          <view class="event-footer">
            <view class="event-location">{{ item.location || TEXT.locationFallback }}</view>
            <view class="like-wrap">
              <view
                v-if="Number(item.likeCount || 0) > 0"
                class="like-button"
                :class="{ active: item.likedByCurrentUser }"
              >
                <text class="like-icon">{{ FILLED_HEART }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-card app-card-soft app-fade-up app-delay-2">
      <view class="empty-icon">{{ HEART }}</view>
      <view class="empty-title">{{ TEXT.emptyTitle }}</view>
      <view class="empty-desc">{{ TEXT.emptyDesc }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { fetchAnniversaryList } from '@/services/anniversaries.js'
import { previewImages } from '@/utils/image-preview.js'
import { requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'

const HEART = '♡'
const FILLED_HEART = '♥'
const TEXT = {
  pageTitle: '恋爱纪念日',
  eyebrow: '重要日子',
  heroBadge: '恋爱纪念日',
  heroTitle: '把重要的日子认真收藏起来',
  heroDesc: '支持过去和未来的日期，既能记录回忆，也能提前期待。',
  createButton: '新增纪念日',
  defaultType: '纪念日',
  cardFallback: '点击查看纪念日详情。',
  locationFallback: '把这一刻留给你们的回忆。',
  emptyTitle: '还没有纪念日',
  emptyDesc: '先添加一个重要的日子，列表会按时间倒序展示。',
  loadError: '纪念日加载失败',
  creatorPrefix: '由 ',
  creatorSuffix: ' 创建',
  futureToday: '就是今天',
  futurePrefix: '还有 ',
  futureSuffix: ' 天',
  pastPrefix: '已过去 ',
  pastSuffix: ' 天'
}

const filters = [
  { key: 'all', label: '全部' },
  { key: 'future', label: '未发生' },
  { key: 'past', label: '已发生' }
]

const typeLabels = {
  custom: '纪念日',
  meet: '第一次见面',
  love: '确认关系',
  travel: '第一次旅行',
  birthday: '生日'
}

const { themeStyle } = useThemePage()
const activeFilter = ref('all')
const eventList = ref([])

onShow(async () => {
  if (!requireAuth()) return
  await loadEvents()
})

async function loadEvents() {
  try {
    eventList.value = await fetchAnniversaryList(activeFilter.value)
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.loadError, icon: 'none' })
  }
}

async function switchFilter(filterKey) {
  if (activeFilter.value === filterKey) return
  activeFilter.value = filterKey
  await loadEvents()
}

function goCreate() {
  goPage('/pages/modules/anniversary/edit')
}

function openDetail(id) {
  goPage(`/pages/modules/anniversary/detail?id=${id}`)
}

function previewEventCover(item) {
  const coverUrl = resolveMediaUrl(item?.coverUrl)
  if (!coverUrl) return
  previewImages([coverUrl], coverUrl)
}

function creatorText(item) {
  return `${TEXT.creatorPrefix}${item.creatorNickname}${TEXT.creatorSuffix}`
}

function formatStatus(item) {
  if (item.timeStatus === 'future') {
    if (Number(item.dayOffset) === 0) return TEXT.futureToday
    return `${TEXT.futurePrefix}${item.dayOffset}${TEXT.futureSuffix}`
  }
  return `${TEXT.pastPrefix}${Math.abs(Number(item.dayOffset || 0))}${TEXT.pastSuffix}`
}
</script>

<style scoped>
  .anniversary-page { background: var(--app-page-gradient-main); }
  .hero-card { padding: 36rpx 30rpx; border-radius: 32rpx; background: radial-gradient(circle at top right, rgba(255,255,255,0.24), transparent 30%), var(--app-gradient-hero); box-shadow: var(--app-shadow-card); }
  .hero-badge { display: inline-flex; }
  .hero-title { margin-top: 18rpx; font-size: 40rpx; line-height: 1.4; font-weight: 700; color: #fff; }
  .hero-desc { margin-top: 12rpx; font-size: 25rpx; line-height: 1.7; color: rgba(255,255,255,0.92); }
  .hero-actions { margin-top: 24rpx; }
  .hero-btn { font-size: 28rpx; }
  .filter-row { display: flex; gap: 16rpx; margin-top: 28rpx; flex-wrap: wrap; }
  .filter-chip { padding: 14rpx 24rpx; border-radius: 999rpx; background: #fff3f7; color: #b77287; font-size: 24rpx; font-weight: 700; }
  .filter-chip.active { background: var(--app-gradient-primary); color: #fff; }
  .event-list { display: grid; gap: 20rpx; margin-top: 24rpx; }
  .event-card { overflow: hidden; padding: 0; }
  .event-card-active { transform: scale(0.985); }
  .event-cover { width: 100%; height: 280rpx; display: block; background: #fff0f4; }
  .event-cover-placeholder { display: flex; align-items: center; justify-content: center; }
  .event-cover-icon { font-size: 56rpx; color: #ff8fb0; }
  .event-body { padding: 24rpx; min-height: 260rpx; display: flex; flex-direction: column; }
  .event-title-row { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
  .event-title {
    font-size: 30rpx;
    font-weight: 700;
    color: var(--app-color-primary-strong);
    flex: 1;
    min-width: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }
  .event-type { padding: 8rpx 14rpx; border-radius: 999rpx; background: #fff0f5; color: #c5718b; font-size: 20rpx; font-weight: 700; }
  .event-date { margin-top: 14rpx; font-size: 24rpx; color: #8f6d78; }
  .event-status { margin-top: 10rpx; font-size: 26rpx; font-weight: 700; color: #ff6b97; }
  .event-creator {
    margin-top: 10rpx;
    font-size: 22rpx;
    color: #bc8b9b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .event-summary {
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 1.7;
    color: #9a7682;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
    min-height: 82rpx;
  }
  .event-footer { margin-top: auto; padding-top: 18rpx; display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
  .event-location {
    flex: 1;
    font-size: 22rpx;
    color: #b18a96;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
    min-height: 70rpx;
  }
  .like-wrap { position: relative; min-width: 64rpx; display: flex; justify-content: flex-end; }
  .like-button { position: relative; z-index: 2; display: inline-flex; align-items: center; justify-content: center; width: 56rpx; height: 56rpx; padding: 0; border-radius: 999rpx; background: #fff1f5; color: #ff5d8f; font-size: 24rpx; font-weight: 700; }
  .like-button.active { background: #ffedf3; box-shadow: inset 0 0 0 2rpx rgba(255, 150, 184, 0.34); }
  .like-icon { font-size: 28rpx; line-height: 1; }
  .empty-card { margin-top: 28rpx; padding: 46rpx 28rpx; text-align: center; }
  .empty-icon { font-size: 56rpx; color: #ff8fb0; }
  .empty-title { margin-top: 18rpx; font-size: 30rpx; font-weight: 700; color: var(--app-color-primary-strong); }
  .empty-desc { margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: #9a7682; }
</style>
