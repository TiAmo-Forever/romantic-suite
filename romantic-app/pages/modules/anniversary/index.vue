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
              <view class="like-burst">
                <text
                  v-for="particle in getLikeBursts(item.id)"
                  :key="particle.id"
                  class="like-particle"
                  :style="particle.style"
                >
                  {{ FILLED_HEART }}
                </text>
              </view>
              <view class="like-button" :class="{ liking: isLiking(item.id) }" @click.stop="handleLike(item)">
                <text class="like-icon">{{ FILLED_HEART }}</text>
                <text class="like-count">{{ item.likeCount || 0 }}</text>
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
import { fetchAnniversaryList, increaseAnniversaryLikeCount } from '@/services/anniversaries.js'
import { previewImages } from '@/utils/image-preview.js'
import { requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'

const HEART = '\u2661'
const FILLED_HEART = '\u2665'
const TEXT = {
  pageTitle: '\u604B\u7231\u7EAA\u5FF5\u65E5',
  eyebrow: '\u91CD\u8981\u65E5\u5B50',
  heroBadge: '\u604B\u7231\u7EAA\u5FF5\u65E5',
  heroTitle: '\u628A\u91CD\u8981\u7684\u65E5\u5B50\u8BA4\u771F\u6536\u85CF\u8D77\u6765',
  heroDesc: '\u652F\u6301\u8FC7\u53BB\u548C\u672A\u6765\u7684\u65E5\u671F\uFF0C\u65E2\u80FD\u8BB0\u5F55\u56DE\u5FC6\uFF0C\u4E5F\u80FD\u63D0\u524D\u671F\u5F85\u3002',
  createButton: '\u65B0\u589E\u7EAA\u5FF5\u65E5',
  defaultType: '\u7EAA\u5FF5\u65E5',
  cardFallback: '\u70B9\u51FB\u67E5\u770B\u7EAA\u5FF5\u65E5\u8BE6\u60C5\u3002',
  locationFallback: '\u628A\u8FD9\u4E00\u523B\u7559\u7ED9\u4F60\u4EEC\u7684\u56DE\u5FC6\u3002',
  emptyTitle: '\u8FD8\u6CA1\u6709\u7EAA\u5FF5\u65E5',
  emptyDesc: '\u5148\u6DFB\u52A0\u4E00\u4E2A\u91CD\u8981\u7684\u65E5\u5B50\uFF0C\u5217\u8868\u4F1A\u6309\u65F6\u95F4\u5012\u5E8F\u5C55\u793A\u3002',
  loadError: '\u7EAA\u5FF5\u65E5\u52A0\u8F7D\u5931\u8D25',
  likeError: '\u70B9\u8D5E\u5931\u8D25',
  creatorPrefix: '\u7531 ',
  creatorSuffix: ' \u521B\u5EFA',
  futureToday: '\u5C31\u662F\u4ECA\u5929',
  futurePrefix: '\u8FD8\u6709 ',
  futureSuffix: ' \u5929',
  pastPrefix: '\u5DF2\u8FC7\u53BB ',
  pastSuffix: ' \u5929'
}

const filters = [
  { key: 'all', label: '\u5168\u90E8' },
  { key: 'future', label: '\u672A\u53D1\u751F' },
  { key: 'past', label: '\u5DF2\u53D1\u751F' }
]

const typeLabels = {
  custom: '\u7EAA\u5FF5\u65E5',
  meet: '\u7B2C\u4E00\u6B21\u89C1\u9762',
  love: '\u786E\u8BA4\u5173\u7CFB',
  travel: '\u7B2C\u4E00\u6B21\u65C5\u884C',
  birthday: '\u751F\u65E5'
}

const { themeStyle } = useThemePage()
const activeFilter = ref('all')
const eventList = ref([])
const likeBursts = ref({})
const likingMap = ref({})

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

function getLikeBursts(eventId) {
  return likeBursts.value[eventId] || []
}

function isLiking(eventId) {
  return Boolean(likingMap.value[eventId])
}

async function handleLike(item) {
  if (!item?.id) return

  const eventId = item.id
  item.likeCount = Number(item.likeCount || 0) + 1
  triggerLikePulse(eventId)
  createLikeBurst(eventId)

  try {
    const latestLikeCount = await increaseAnniversaryLikeCount(eventId)
    item.likeCount = Math.max(Number(item.likeCount || 0), Number(latestLikeCount || 0))
  } catch (error) {
    item.likeCount = Math.max(0, Number(item.likeCount || 0) - 1)
    uni.showToast({ title: error?.message || TEXT.likeError, icon: 'none' })
  }
}

function triggerLikePulse(eventId) {
  const pulseToken = Date.now()
  likingMap.value = { ...likingMap.value, [eventId]: pulseToken }
  setTimeout(() => {
    if (likingMap.value[eventId] !== pulseToken) return
    const nextLikingMap = { ...likingMap.value }
    delete nextLikingMap[eventId]
    likingMap.value = nextLikingMap
  }, 260)
}

function createLikeBurst(eventId) {
  const particles = Array.from({ length: 7 }, (_, index) => ({
    id: `${eventId}_${Date.now()}_${index}`,
    style: {
      '--drift': `${Math.round((Math.random() - 0.5) * 180)}rpx`,
      '--lift': `${-220 - Math.round(Math.random() * 80)}rpx`,
      '--duration': `${1180 + Math.round(Math.random() * 360)}ms`,
      '--delay': `${index * 70}ms`,
      '--scale': `${0.95 + Math.random() * 0.55}`,
      '--hue': `${index % 2 === 0 ? '#ff5d8f' : '#ff91b2'}`
    }
  }))

  const existingParticles = likeBursts.value[eventId] || []
  likeBursts.value = {
    ...likeBursts.value,
    [eventId]: existingParticles.concat(particles)
  }

  setTimeout(() => {
    const currentParticles = likeBursts.value[eventId] || []
    const particleIds = new Set(particles.map((item) => item.id))
    const remainedParticles = currentParticles.filter((item) => !particleIds.has(item.id))
    const nextBursts = { ...likeBursts.value }
    if (remainedParticles.length) {
      nextBursts[eventId] = remainedParticles
    } else {
      delete nextBursts[eventId]
    }
    likeBursts.value = nextBursts
  }, 1900)
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
  .like-wrap { position: relative; min-width: 112rpx; display: flex; justify-content: flex-end; }
  .like-button { position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 10rpx; padding: 12rpx 18rpx; border-radius: 999rpx; background: #fff1f5; color: #ff5d8f; font-size: 24rpx; font-weight: 700; }
  .like-button.liking { transform: scale(1.1); }
  .like-icon { font-size: 28rpx; line-height: 1; }
  .like-count { min-width: 24rpx; text-align: left; }
  .like-burst { position: absolute; right: 10rpx; bottom: 18rpx; width: 180rpx; height: 280rpx; pointer-events: none; overflow: visible; }
  .like-particle { position: absolute; right: 18rpx; bottom: 0; color: var(--hue); font-size: 30rpx; line-height: 1; opacity: 0; transform: translate3d(0, 0, 0) scale(var(--scale)); animation: like-float var(--duration) ease-out forwards; animation-delay: var(--delay); }
  .empty-card { margin-top: 28rpx; padding: 46rpx 28rpx; text-align: center; }
  .empty-icon { font-size: 56rpx; color: #ff8fb0; }
  .empty-title { margin-top: 18rpx; font-size: 30rpx; font-weight: 700; color: var(--app-color-primary-strong); }
  .empty-desc { margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: #9a7682; }

  @keyframes like-float {
    0% {
      opacity: 0;
      transform: translate3d(0, 0, 0) scale(calc(var(--scale) * 0.8));
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate3d(var(--drift), var(--lift), 0) scale(var(--scale));
    }
  }
</style>
