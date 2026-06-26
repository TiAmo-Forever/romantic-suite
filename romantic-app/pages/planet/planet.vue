<template>
  <view class="page app-page-shell app-page-shell-tabbed planet-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <image class="planet-texture" :src="pageBackgroundImage" mode="scaleToFill"></image>
    <view class="planet-bg planet-bg-a"></view>
    <view class="planet-bg planet-bg-b"></view>
    <view class="planet-bg planet-bg-c"></view>
    <view class="planet-bg planet-bg-d"></view>

    <view class="planet-content">
      <view class="planet-hero app-fade-up">
        <view class="planet-kicker">我 们 的</view>
        <view class="planet-title">宇 宙</view>
        <view class="planet-subline">
          <view class="planet-subline-line"></view>
          <view class="planet-subline-text">已相爱 {{ relationshipDays }} 天 · {{ relationshipDateLabel }}</view>
          <view class="planet-subline-line"></view>
        </view>

        <view class="planet-orbit-shell app-delay-1">
          <image class="planet-orbit-decor" :src="orbitalDecorImage" mode="widthFix"></image>
          <view class="planet-ball planet-ball-left orbit-float-left">
            <image class="planet-ball-image planet-ball-image-left" :src="leftPlanetImage" mode="aspectFit"></image>
            <text class="planet-ball-name">{{ heroLeftName }}</text>
          </view>
          <view class="planet-ball planet-ball-right orbit-float-right">
            <image class="planet-ball-image planet-ball-image-right" :src="rightPlanetImage" mode="aspectFit"></image>
            <text class="planet-ball-name">{{ heroRightName }}</text>
          </view>
        </view>
      </view>

      <view class="planet-divider app-fade-up app-delay-1">
        <view class="planet-divider-line"></view>
        <view class="planet-divider-spark">✦ ✦ ✦</view>
        <view class="planet-divider-line"></view>
      </view>

      <view class="relation-card app-fade-up app-delay-1">
        <view class="relation-card-head">
          <view class="relation-card-title-wrap">
            <view class="section-kicker-bar"></view>
            <view class="relation-card-title">关系档案</view>
          </view>
          <view class="relation-card-star">✦</view>
        </view>

        <view class="relation-row">
          <view class="relation-label">我们的称呼</view>
          <view class="relation-value">{{ relationCallNames }}</view>
        </view>
        <view class="relation-divider"></view>

        <view class="relation-row">
          <view class="relation-label">在一起</view>
          <view class="relation-value">{{ relationshipDateText }}</view>
        </view>
        <view class="relation-divider"></view>

        <view class="relation-row">
          <view class="relation-label">常驻城市</view>
          <view class="relation-value">{{ residentCityText }}</view>
        </view>
        <view class="relation-divider"></view>

        <view class="relation-row relation-row-intro">
          <view class="relation-label">我们是</view>
          <view class="relation-value relation-value-intro">{{ relationIntroText }}</view>
        </view>
      </view>

      <view class="section-head recent-head app-fade-up app-delay-2">
        <view class="section-head-left">
          <view class="section-kicker-bar"></view>
          <view class="section-head-title">最近节点</view>
        </view>
        <view class="section-head-link" hover-class="surface-press" hover-stay-time="60" @click="openRecentList">更多 →</view>
      </view>

      <view class="timeline-list app-fade-up app-delay-2">
        <view
          v-for="(item, index) in recentNodes"
          :key="item.id || index"
          class="timeline-item"
          hover-class="surface-press"
          hover-stay-time="60"
          @click="openRecentDetail(item)"
        >
          <view class="timeline-rail">
            <view class="timeline-dot" :class="[`timeline-dot-${index}`]"></view>
            <view v-if="index !== recentNodes.length - 1" class="timeline-line"></view>
          </view>
          <view class="timeline-copy">
            <view class="timeline-meta">{{ item.meta }}</view>
            <view class="timeline-title">{{ item.title }}</view>
            <view class="timeline-desc">{{ item.desc }}</view>
          </view>
        </view>
      </view>

      <view class="section-head app-fade-up app-delay-3">
        <view class="section-head-left">
          <view class="section-kicker-bar"></view>
          <view class="section-head-title">回忆相册</view>
        </view>
      </view>

      <view class="album-grid app-fade-up app-delay-3">
        <view
          v-for="item in albumDisplayList"
          :key="item.id"
          class="album-card"
          hover-class="surface-press"
          hover-stay-time="60"
          @click="openAlbum(item)"
        >
          <view class="album-cover-shell" :class="{ 'album-cover-shell-empty': !item.coverUrl }">
            <image v-if="item.coverUrl" class="album-cover" :src="item.coverUrl" mode="aspectFill"></image>
            <view v-else class="album-placeholder">{{ item.symbol }}</view>
          </view>
          <view class="album-card-body">
            <view class="album-card-title">{{ item.title }}</view>
            <view class="album-card-count">{{ item.countLabel }}</view>
          </view>
        </view>
      </view>

      <view class="year-card app-fade-up app-delay-3">
        <view class="year-card-head">
          <view class="year-card-title">今年的我们</view>
          <view class="year-card-range">{{ yearRangeLabel }}</view>
        </view>
        <view class="year-grid">
          <view class="year-metric year-metric-border-right year-metric-border-bottom">
            <view class="year-metric-value">{{ yearSnapshot.tripCount }}<text class="year-metric-unit">次</text></view>
            <view class="year-metric-label">一起出行</view>
          </view>
          <view class="year-metric year-metric-border-bottom">
            <view class="year-metric-value">{{ yearSnapshot.diaryCount }}<text class="year-metric-unit">篇</text></view>
            <view class="year-metric-label">日记</view>
          </view>
          <view class="year-metric year-metric-border-right">
            <view class="year-metric-value">{{ yearSnapshot.photoCount }}<text class="year-metric-unit">张</text></view>
            <view class="year-metric-label">照片</view>
          </view>
          <view class="year-metric">
            <view class="year-metric-value year-metric-value-accent">{{ yearSnapshot.nextDays }}<text class="year-metric-unit">天</text></view>
            <view class="year-metric-label">↓ {{ yearSnapshot.nextLabel }}</view>
          </view>
        </view>
        <view class="year-card-topline"></view>
      </view>

      <view class="footprint-entry app-fade-up app-delay-3" hover-class="surface-press" hover-stay-time="60" @click="openFootprints">
        <view class="footprint-icon-shell">
          <image class="footprint-icon" :src="footprintsIconImage" mode="aspectFit"></image>
        </view>
        <view class="footprint-copy">
          <view class="footprint-title">我们走过 {{ footprintSummary.cityCount }} 座城市</view>
          <view class="footprint-desc">最近：{{ footprintSummary.latestCity }}</view>
        </view>
        <image class="footprint-arrow" :src="footprintsArrowImage" mode="aspectFit"></image>
      </view>
    </view>

    <BottomTab activeKey="planet" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import { fetchAlbumMemoryList } from '@/services/albums.js'
import { fetchAnniversaryList } from '@/services/anniversaries.js'
import { fetchDailySummaryHistory } from '@/services/daily-summaries.js'
import { fetchPartnerProfile, fetchRemoteProfile } from '@/services/profile.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import pageBackgroundImage from '@/assets/planet/page-background.png'
import orbitalDecorImage from '@/assets/planet/orbital-decor.svg'
import leftPlanetImage from '@/assets/planet/planet-left.svg'
import rightPlanetImage from '@/assets/planet/planet-right.svg'
import footprintsIconImage from '@/assets/planet/footprints-icon.png'
import footprintsArrowImage from '@/assets/planet/footprints-arrow.png'
import BottomTab from '@/pages/components/BottomTab.vue'

const DAY_MS = 24 * 60 * 60 * 1000
const { themeStyle } = useThemePage()

const profile = ref({})
const partnerProfile = ref(null)
const anniversaryList = ref([])
const albumList = ref([])
const dailyHistory = ref([])

const heroLeftName = computed(() => shrinkName(getSelfCallName(), 3))
const heroRightName = computed(() => shrinkName(getPartnerCallName(), 3))
const relationshipDays = computed(() => {
  const startDate = parseDateOnly(profile.value?.anniversaryDate)
  if (!startDate) return 0
  const today = startOfDay(new Date())
  return Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / DAY_MS) + 1)
})
const relationshipDateLabel = computed(() => formatDotDate(parseDateOnly(profile.value?.anniversaryDate)) || '--')
const relationshipDateText = computed(() => formatChineseDate(parseDateOnly(profile.value?.anniversaryDate)) || '待设置')
const residentCityText = computed(() => String(profile.value?.city || profile.value?.defaultMeetingPlace || '待设置').trim() || '待设置')
const relationIntroText = computed(() => String(profile.value?.bio || '').trim() || '两个认真相爱的人，把喜欢慢慢过成了日常')
const relationCallNames = computed(() => `${getSelfCallName()} & ${getPartnerCallName()}`)
const yearRangeLabel = computed(() => {
  const now = new Date()
  return `${now.getFullYear()} · 1—${now.getMonth() + 1}月`
})

const recentNodes = computed(() => {
  const list = [...anniversaryList.value]
    .filter((item) => parseDateOnly(item.eventDate))
    .sort((a, b) => parseDateOnly(b.eventDate).getTime() - parseDateOnly(a.eventDate).getTime())
    .slice(0, 3)
    .map((item, index) => ({
      id: item.id || `node_${index}`,
      title: String(item.title || '新的纪念').trim() || '新的纪念',
      meta: buildTimelineMeta(item),
      desc: buildTimelineDesc(item),
      detailId: item.id || ''
    }))

  if (list.length > 0) return list

  return [
    {
      id: 'empty_node',
      title: '还没有最近节点',
      meta: '现在',
      desc: '去纪念日里记录属于你们的下一段故事',
      detailId: ''
    }
  ]
})

const albumDisplayList = computed(() => {
  const list = (Array.isArray(albumList.value) ? albumList.value : []).slice(0, 4).map((item, index) => ({
    id: item.id || `album_${index}`,
    title: String(item.title || `回忆 ${index + 1}`).trim() || `回忆 ${index + 1}`,
    countLabel: `${Number(item.imageCount || 0)} 张`,
    coverUrl: pickAlbumCover(item),
    symbol: inferAlbumSymbol(item, index),
    detailId: item.id || ''
  }))

  while (list.length < 4) {
    list.push({
      id: `placeholder_${list.length}`,
      title: '等待新回忆',
      countLabel: '0 张',
      coverUrl: '',
      symbol: ['✈', '☽', '✦', '♡'][list.length % 4],
      detailId: ''
    })
  }

  return list
})

const yearSnapshot = computed(() => {
  const diaryCount = dailyHistory.value.reduce((sum, item) => sum + Math.max(Number(item.entryCount || 0), 1), 0)
  const photoCount = albumList.value.reduce((sum, item) => sum + Math.max(Number(item.imageCount || 0), 0), 0)
  const tripCount = albumList.value.filter((item) => isTripMemory(item)).length || albumList.value.filter((item) => String(item.location || '').trim()).length
  const upcoming = getUpcomingMilestone(anniversaryList.value, profile.value?.anniversaryDate)

  return {
    tripCount,
    diaryCount,
    photoCount,
    nextDays: upcoming.days,
    nextLabel: upcoming.label
  }
})

const footprintSummary = computed(() => {
  const citySet = new Set()
  const timeline = []

  appendLocation(citySet, timeline, profile.value?.city, profile.value?.anniversaryDate)
  anniversaryList.value.forEach((item) => appendLocation(citySet, timeline, item.location, item.eventDate))
  albumList.value.forEach((item) => appendLocation(citySet, timeline, item.location, item.memoryDate))

  timeline.sort((a, b) => getDateTimestamp(b.date) - getDateTimestamp(a.date))
  const latest = timeline.find((item) => item.city)

  return {
    cityCount: citySet.size || 1,
    latestCity: latest ? `${latest.city} · ${formatYearMonth(parseDateOnly(latest.date))}` : residentCityText.value
  }
})

onShow(async () => {
  if (!requireAuth()) return
  await loadPlanetPage()
})

async function loadPlanetPage() {
  const [profileResult, partnerResult, anniversaryResult, albumResult, historyResult] = await Promise.allSettled([
    fetchRemoteProfile(),
    fetchPartnerProfile(),
    fetchAnniversaryList('all'),
    fetchAlbumMemoryList(),
    fetchDailySummaryHistory()
  ])

  profile.value = profileResult.status === 'fulfilled' ? profileResult.value || {} : {}
  partnerProfile.value = partnerResult.status === 'fulfilled' ? partnerResult.value || null : null
  anniversaryList.value = anniversaryResult.status === 'fulfilled' && Array.isArray(anniversaryResult.value) ? anniversaryResult.value : []
  albumList.value = albumResult.status === 'fulfilled' && Array.isArray(albumResult.value) ? albumResult.value : []
  dailyHistory.value = historyResult.status === 'fulfilled' && Array.isArray(historyResult.value) ? historyResult.value : []
}

function openRecentList() {
  goPage('/pages/modules/anniversary/index')
}

function openRecentDetail(item) {
  if (!item?.detailId) {
    openRecentList()
    return
  }
  goPage(`/pages/modules/anniversary/detail?id=${encodeURIComponent(item.detailId)}`)
}

function openAlbum(item) {
  if (!item?.detailId) {
    goPage('/pages/modules/album/index')
    return
  }
  goPage(`/pages/modules/album/detail?id=${encodeURIComponent(item.detailId)}`)
}

function openFootprints() {
  goPage('/pages/modules/coming-soon/index?title=' + encodeURIComponent('共同足迹'))
}



function getSelfCallName() {
  return String(partnerProfile.value?.loverNickname || profile.value?.nickname || '我').trim() || '我'
}

function getPartnerCallName() {
  return String(profile.value?.loverNickname || partnerProfile.value?.nickname || 'TA').trim() || 'TA'
}

function buildTimelineMeta(item) {
  const date = parseDateOnly(item.eventDate)
  const dateLabel = formatDotDate(date) || '待补充'
  return `${getTimelineTypeLabel(item.type)} · ${dateLabel}`
}

function buildTimelineDesc(item) {
  const description = String(item.description || '').trim()
  const location = String(item.location || '').trim()
  if (description) return description
  if (location) return `一起去过 ${location}`
  return '把这一天记下来，留给以后慢慢回看'
}

function pickAlbumCover(item) {
  const firstMedia = Array.isArray(item?.mediaList) ? item.mediaList[0] : null
  const coverPath = item?.coverUrl || firstMedia?.thumbnailUrl || firstMedia?.fileUrl || ''
  return resolveMediaUrl(coverPath)
}

function inferAlbumSymbol(item, index) {
  const source = `${String(item?.title || '')} ${String(item?.summary || '')} ${String(item?.location || '')}`
  if (/[旅途游玩出发海边山川]/.test(source)) return '✈'
  if (/[夜晚月亮日常晚安]/.test(source)) return '☽'
  if (/[节日生日纪念]/.test(source)) return '✦'
  if (/[喜欢心动美食做饭]/.test(source)) return '♡'
  return ['✈', '☽', '✦', '♡'][index % 4]
}

function isTripMemory(item) {
  const source = `${String(item?.title || '')} ${String(item?.summary || '')} ${String(item?.location || '')}`
  return /[旅途旅行出发机场高铁海边山川东京西安厦门上海]/.test(source)
}

function getUpcomingMilestone(list, fallbackDateValue) {
  const today = startOfDay(new Date())
  const candidates = []

  list.forEach((item) => {
    const baseDate = parseDateOnly(item.eventDate)
    if (!baseDate) return
    const nextDate = getNextOccurrence(baseDate, today)
    const days = Math.max(0, Math.floor((nextDate.getTime() - today.getTime()) / DAY_MS))
    candidates.push({ label: String(item.title || '重要日子').trim() || '重要日子', days })
  })

  const fallbackDate = parseDateOnly(fallbackDateValue)
  if (fallbackDate) {
    const nextDate = getNextOccurrence(fallbackDate, today)
    const days = Math.max(0, Math.floor((nextDate.getTime() - today.getTime()) / DAY_MS))
    candidates.push({ label: '纪念日', days })
  }

  if (candidates.length === 0) {
    return { label: '下一次见面', days: 0 }
  }

  candidates.sort((a, b) => a.days - b.days)
  return candidates[0]
}

function getNextOccurrence(baseDate, today) {
  const year = today.getFullYear()
  const candidate = new Date(year, baseDate.getMonth(), baseDate.getDate())
  if (candidate.getTime() < today.getTime()) {
    candidate.setFullYear(year + 1)
  }
  return startOfDay(candidate)
}

function appendLocation(citySet, timeline, rawLocation, dateValue) {
  const city = normalizeLocation(rawLocation)
  if (!city) return
  citySet.add(city)
  timeline.push({ city, date: dateValue })
}

function normalizeLocation(rawLocation) {
  const value = String(rawLocation || '').trim()
  if (!value) return ''
  return value.split(/[·,，/\s]+/).filter(Boolean)[0] || value
}

function parseDateOnly(value) {
  const raw = String(value || '').trim()
  if (!raw) return null
  const normalized = raw.replace(/\./g, '-').replace(/\//g, '-')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null
  return startOfDay(date)
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDotDate(date) {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function formatChineseDate(date) {
  if (!date) return ''
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function getDateTimestamp(value) {
  const date = parseDateOnly(value)
  return date ? date.getTime() : 0
}

function getTimelineTypeLabel(type) {
  const value = String(type || '').trim()
  const map = {
    anniversary: '纪念日',
    meeting: '见面日',
    birthday: '生日',
    travel: '旅行',
    festival: '节日'
  }
  return map[value] || '纪念日'
}

function formatYearMonth(date) {
  if (!date) return '最近'
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function shrinkName(value, limit) {
  const text = String(value || '').trim() || 'TA'
  return text.length > limit ? text.slice(0, limit) : text
}
</script>

<style scoped>
  .planet-page {
    position: relative;
    overflow: hidden;
    background: linear-gradient(134deg, #fdf4ee 8%, #fceae0 46%, #f8d9ce 91%);
  }

  .planet-content {
    position: relative;
    z-index: 2;
    padding: 56rpx 20rpx 184rpx;
  }

  .planet-texture {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.86;
  }

  .planet-bg {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .planet-bg-a {
    top: -168rpx;
    left: 96rpx;
    width: 840rpx;
    height: 840rpx;
    background: rgba(244, 190, 175, 0.22);
    filter: blur(180rpx);
  }

  .planet-bg-b {
    top: 596rpx;
    left: -196rpx;
    width: 720rpx;
    height: 720rpx;
    background: rgba(240, 208, 196, 0.18);
    filter: blur(160rpx);
  }

  .planet-bg-c {
    top: 978rpx;
    left: 140rpx;
    width: 640rpx;
    height: 640rpx;
    background: rgba(232, 196, 160, 0.15);
    filter: blur(140rpx);
  }

  .planet-bg-d {
    top: 632rpx;
    left: -40rpx;
    width: 560rpx;
    height: 560rpx;
    background: rgba(242, 200, 184, 0.14);
    filter: blur(160rpx);
  }

  .planet-hero {
    text-align: center;
  }

  .planet-kicker {
    font-size: 19rpx;
    line-height: 1.5;
    letter-spacing: 6rpx;
    color: rgba(184, 137, 110, 0.65);
  }

  .planet-title {
    margin-top: 10rpx;
    font-family: 'Times New Roman', serif;
    font-size: 84rpx;
    line-height: 1;
    letter-spacing: 8rpx;
    color: #6b3f32;
  }

  .planet-subline {
    margin-top: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18rpx;
  }

  .planet-subline-line {
    width: 52rpx;
    height: 2rpx;
    background: linear-gradient(90deg, rgba(201, 168, 122, 0), rgba(201, 168, 122, 0.78), rgba(201, 168, 122, 0));
  }

  .planet-subline-text {
    font-size: 19rpx;
    line-height: 1.5;
    letter-spacing: 2rpx;
    color: #c9a87a;
  }

  .planet-orbit-shell {
    position: relative;
    margin: 18rpx auto 0;
    width: 100%;
    max-width: 748rpx;
    height: 338rpx;
  }

  .planet-orbit-decor {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  .planet-ball {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .planet-ball-left {
    left: 86rpx;
    top: 86rpx;
    width: 164rpx;
    height: 150rpx;
  }

  .planet-ball-right {
    right: 86rpx;
    top: 94rpx;
    width: 138rpx;
    height: 126rpx;
  }

  .planet-ball-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .planet-ball-name {
    position: relative;
    z-index: 2;
    max-width: 72rpx;
    text-align: center;
    font-family: 'Times New Roman', serif;
    font-size: 30rpx;
    line-height: 1.15;
    color: rgba(255, 248, 244, 0.96);
    text-shadow: 0 2rpx 8rpx rgba(123, 60, 44, 0.18);
    word-break: break-all;
  }

  .orbit-float-left {
    animation: orbitFloatLeft 4.8s ease-in-out infinite;
  }

  .orbit-float-right {
    animation: orbitFloatRight 5.2s ease-in-out infinite;
  }

  .planet-divider {
    margin: 28rpx 8rpx 0;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .planet-divider-line {
    flex: 1;
    height: 2rpx;
    background: linear-gradient(90deg, rgba(201, 168, 122, 0), rgba(201, 168, 122, 0.32), rgba(201, 168, 122, 0));
  }

  .planet-divider-spark {
    font-size: 16rpx;
    line-height: 1;
    letter-spacing: 3rpx;
    color: rgba(201, 168, 122, 0.62);
  }

  .relation-card,
  .year-card,
  .footprint-entry {
    position: relative;
    overflow: hidden;
    border: 2rpx solid rgba(220, 160, 130, 0.14);
    background: rgba(255, 250, 246, 0.86);
    box-shadow: 0 12rpx 36rpx rgba(180, 80, 60, 0.07);
  }

  .relation-card {
    margin-top: 28rpx;
    border-radius: 48rpx;
    padding: 42rpx 46rpx 36rpx;
  }

  .relation-card::after,
  .year-card::after,
  .footprint-entry::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 0.9);
  }

  .relation-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .relation-card-title-wrap,
  .section-head-left {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .section-kicker-bar {
    width: 6rpx;
    height: 22rpx;
    border-radius: 999rpx;
    background: rgba(201, 168, 122, 0.72);
  }

  .relation-card-title,
  .section-head-title {
    font-size: 28rpx;
    line-height: 1.3;
    color: #6b3f32;
    font-weight: 500;
  }

  .relation-card-star {
    font-size: 24rpx;
    color: rgba(201, 168, 122, 0.8);
  }

  .relation-row {
    min-height: 88rpx;
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .relation-row-intro {
    align-items: flex-start;
    padding-top: 16rpx;
    min-height: 112rpx;
  }

  .relation-label {
    flex-shrink: 0;
    width: 124rpx;
    font-size: 22rpx;
    line-height: 1.5;
    white-space: nowrap;
    color: #b8896e;
  }

  .relation-value {
    flex: 1;
    min-width: 0;
    font-size: 32rpx;
    line-height: 1.45;
    color: #6b3f32;
    word-break: break-word;
  }

  .relation-value-intro {
    font-size: 30rpx;
    line-height: 1.6;
  }

  .relation-divider {
    height: 2rpx;
    background: rgba(201, 168, 122, 0.14);
  }

  .section-head {
    margin-top: 34rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-head-link {
    font-size: 22rpx;
    line-height: 1.5;
    color: rgba(201, 168, 122, 0.92);
  }

  .timeline-list {
    margin-top: 14rpx;
    padding: 0 6rpx;
  }

  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 18rpx;
    padding: 12rpx 0 22rpx;
  }

  .timeline-rail {
    width: 18rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .timeline-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    border: 2rpx solid rgba(224, 123, 106, 0.3);
  }

  .timeline-dot-0 {
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(224, 123, 106, 0.45);
  }

  .timeline-dot-1 {
    background: #e68b80;
    border-color: rgba(230, 139, 128, 0.12);
  }

  .timeline-dot-2 {
    background: #d8b37a;
    border-color: rgba(216, 179, 122, 0.16);
  }

  .timeline-line {
    width: 2rpx;
    min-height: 90rpx;
    margin-top: 8rpx;
    background: linear-gradient(180deg, rgba(224, 123, 106, 0.3), rgba(201, 168, 122, 0.08));
  }

  .timeline-copy {
    flex: 1;
    min-width: 0;
  }

  .timeline-meta {
    font-size: 18rpx;
    line-height: 1.45;
    color: rgba(201, 168, 122, 0.86);
  }

  .timeline-title {
    margin-top: 8rpx;
    font-size: 32rpx;
    line-height: 1.25;
    color: #6b3f32;
  }

  .timeline-desc {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 1.7;
    color: #a87b69;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .album-grid {
    margin-top: 14rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
  }

  .album-card {
    overflow: hidden;
    border-radius: 26rpx;
    border: 2rpx solid rgba(220, 160, 130, 0.14);
    background: rgba(255, 250, 246, 0.82);
    box-shadow: 0 12rpx 32rpx rgba(180, 80, 60, 0.07);
  }

  .album-cover-shell {
    height: 140rpx;
    background: linear-gradient(180deg, rgba(255, 240, 231, 0.95), rgba(248, 227, 212, 0.88));
  }

  .album-cover-shell-empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .album-cover {
    width: 100%;
    height: 100%;
    display: block;
  }

  .album-placeholder {
    font-size: 56rpx;
    line-height: 1;
    color: rgba(201, 168, 122, 0.82);
  }

  .album-card-body {
    padding: 22rpx 24rpx 24rpx;
  }

  .album-card-title {
    font-size: 28rpx;
    line-height: 1.4;
    color: #6b3f32;
    font-weight: 500;
  }

  .album-card-count {
    margin-top: 8rpx;
    font-size: 22rpx;
    line-height: 1.4;
    color: #b8896e;
  }

  .year-card {
    margin-top: 28rpx;
    border-radius: 44rpx;
    padding: 38rpx 42rpx 34rpx;
  }

  .year-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .year-card-title {
    font-family: 'Times New Roman', serif;
    font-size: 34rpx;
    line-height: 1.3;
    letter-spacing: 2rpx;
    color: #6b3f32;
  }

  .year-card-range {
    font-size: 20rpx;
    line-height: 1.4;
    color: rgba(201, 168, 122, 0.78);
  }

  .year-grid {
    position: relative;
    margin-top: 28rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .year-metric {
    min-height: 128rpx;
    padding: 20rpx 12rpx 18rpx;
    text-align: center;
  }

  .year-metric-border-right {
    border-right: 2rpx solid rgba(201, 168, 122, 0.15);
  }

  .year-metric-border-bottom {
    border-bottom: 2rpx solid rgba(201, 168, 122, 0.15);
  }

  .year-metric-value {
    font-family: 'Times New Roman', serif;
    font-size: 50rpx;
    line-height: 1;
    color: #6b3f32;
  }

  .year-metric-value-accent {
    color: #e07b6a;
  }

  .year-metric-unit {
    margin-left: 4rpx;
    font-size: 20rpx;
    color: #c9a87a;
  }

  .year-metric-label {
    margin-top: 10rpx;
    font-size: 20rpx;
    line-height: 1.4;
    color: rgba(184, 137, 110, 0.7);
  }

  .year-card-topline {
    position: absolute;
    top: 0;
    left: 50%;
    width: 390rpx;
    height: 4rpx;
    transform: translateX(-50%);
    background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(201, 168, 122, 0.88), rgba(0, 0, 0, 0));
  }

  .footprint-entry {
    margin-top: 24rpx;
    border-radius: 40rpx;
    padding: 30rpx 34rpx;
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .footprint-icon-shell {
    width: 76rpx;
    height: 76rpx;
    border-radius: 24rpx;
    background: rgba(156, 184, 144, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .footprint-icon {
    width: 36rpx;
    height: 36rpx;
  }

  .footprint-copy {
    flex: 1;
    min-width: 0;
  }

  .footprint-title {
    font-size: 26rpx;
    line-height: 1.45;
    color: #6b3f32;
    font-weight: 500;
  }

  .footprint-desc {
    margin-top: 6rpx;
    font-size: 20rpx;
    line-height: 1.4;
    color: rgba(184, 137, 110, 0.7);
  }

  .footprint-arrow {
    width: 28rpx;
    height: 28rpx;
    flex-shrink: 0;
  }
  .surface-press {
    transform: translateY(2rpx) scale(0.992);
  }

  @keyframes orbitFloatLeft {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-12rpx);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes orbitFloatRight {
    0% {
      transform: translateY(-2rpx);
    }
    50% {
      transform: translateY(10rpx);
    }
    100% {
      transform: translateY(-2rpx);
    }
  }
</style>


