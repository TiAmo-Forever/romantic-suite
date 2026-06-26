<template>
  <view class="page app-page-shell app-page-shell-tabbed home-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="home-bg home-bg-a"></view>
    <view class="home-bg home-bg-b"></view>
    <view class="home-bg home-bg-c"></view>

    <view class="home-header app-fade-up">
      <view class="home-header-copy">
        <view class="home-date">{{ pageDateLabel }}</view>
        <view class="home-greeting">{{ greetingLabel }}，{{ greetingName }}<text class="home-greeting-emoji">{{ greetingEmoji }}</text></view>
      </view>
      <view class="home-notice" hover-class="surface-press" hover-stay-time="60" @click="goNotifications">
        <view class="home-notice-dot"></view>
        <view class="home-notice-icon">
          <view class="bell-top"></view>
          <view class="bell-body"></view>
          <view class="bell-bottom"></view>
        </view>
      </view>
    </view>

    <view class="hero-card app-fade-up app-delay-1" hover-class="surface-press" hover-stay-time="70" @click="goAnniversary">
      <view class="hero-strip"></view>
      <view class="hero-spark hero-spark-a">✦</view>
      <view class="hero-spark hero-spark-b">♥</view>
      <view class="hero-spark hero-spark-c">✦</view>
      <view class="hero-avatars">
        <view class="hero-avatar hero-avatar-left">{{ heroLeftName }}</view>
        <view class="hero-heart">♥</view>
        <view class="hero-avatar hero-avatar-right">{{ heroRightName }}</view>
      </view>
      <view class="hero-copy">我 们 相 爱 已 经</view>
      <view class="hero-days-row">
        <view class="hero-days">{{ relationshipDaysText }}</view>
        <view class="hero-unit">天</view>
      </view>
      <view class="hero-meta-row">
        <view class="hero-line"></view>
        <view class="hero-meta">{{ relationshipMetaText }}</view>
        <view class="hero-line"></view>
      </view>
    </view>

    <view class="dual-grid app-fade-up app-delay-2">
      <view class="info-card meet-card" hover-class="surface-press" hover-stay-time="70" @click="goCountdown">
        <view class="card-kicker"><text class="card-kicker-dot accent-pink"></text>下次见面</view>
        <view class="meet-days-row">
          <view class="meet-days">{{ nextMeetingSummary.days }}</view>
          <view class="meet-unit">天后</view>
        </view>
        <view class="meet-date">{{ nextMeetingSummary.dateLabel }}</view>
        <view class="meet-dots">
          <view v-for="index in 10" :key="`meet_dot_${index}`" class="meet-dot" :class="{ active: index <= countdownProgressDotCount }"></view>
        </view>
      </view>

      <view class="info-card summary-card" hover-class="surface-press" hover-stay-time="70" @click="goMemo">
        <view class="card-kicker"><text class="card-kicker-dot accent-gold"></text>今日小计</view>
        <view class="summary-stat">
          <view class="summary-icon summary-icon-note">
            <view class="line a"></view>
            <view class="line b"></view>
          </view>
          <view class="summary-main"><text class="summary-value">{{ memoMiniSummary.entryCount }}</text><text class="summary-label">条日记</text></view>
        </view>
        <view class="summary-stat">
          <view class="summary-icon summary-icon-photo">
            <view class="dot"></view>
            <view class="mountain"></view>
          </view>
          <view class="summary-main"><text class="summary-value">{{ memoMiniSummary.imageCount }}</text><text class="summary-label">张照片</text></view>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-footer">{{ memoMiniSummary.footer }}</view>
      </view>
    </view>

    <view class="anniversary-section app-fade-up app-delay-3">
      <view class="section-head">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <view class="section-title">即将到来的纪念日</view>
        </view>
        <view class="section-link" @click="goAnniversary">全部<text>→</text></view>
      </view>
      <scroll-view class="anniversary-scroll" scroll-x enable-flex :show-scrollbar="false">
        <view class="anniversary-list">
          <view v-for="item in upcomingAnniversaryCards" :key="item.id" class="anniversary-card" hover-class="surface-press" hover-stay-time="70" @click="goAnniversary">
            <view class="anniversary-icon">{{ item.icon }}</view>
            <view class="anniversary-title">{{ item.title }}</view>
            <view class="anniversary-days-row">
              <view class="anniversary-days">{{ item.days }}</view>
              <view class="anniversary-unit">天后</view>
            </view>
          </view>
          <view v-if="!upcomingAnniversaryCards.length" class="anniversary-card anniversary-card-empty" hover-class="surface-press" hover-stay-time="70" @click="goAnniversary">
            <view class="anniversary-icon">✦</view>
            <view class="anniversary-title">还没有纪念日</view>
            <view class="anniversary-empty-copy">去补上重要日子</view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="memo-focus-card app-fade-up app-delay-4" hover-class="surface-press" hover-stay-time="70" @click="goMemo">
      <view class="memo-focus-topline"></view>
      <view class="memo-focus-head">
        <view class="memo-focus-title-wrap">
          <view class="memo-focus-icon">
            <view class="line a"></view>
            <view class="line b"></view>
          </view>
          <view class="memo-focus-title">今日小计</view>
        </view>
        <view class="memo-focus-badge">{{ memoFocusSummary.badge }}</view>
      </view>
      <view class="memo-focus-body">
        <view class="memo-focus-kicker">{{ memoFocusSummary.kicker }}</view>
        <view class="memo-focus-content">{{ memoFocusSummary.content }}</view>
      </view>
      <view class="memo-focus-foot">
        <view class="memo-focus-meta">{{ memoFocusSummary.meta }}</view>
        <view class="memo-focus-action" @click.stop="handleMemoPrimaryAction">
          <text>{{ memoFocusSummary.actionText }}</text>
          <view class="memo-focus-arrow"></view>
        </view>
      </view>
    </view>

    <view class="quick-section app-fade-up app-delay-4">
      <view class="quick-kicker">快 速 入 口</view>
      <view class="quick-grid">
        <view class="quick-card" hover-class="surface-press" hover-stay-time="70" @click="goMemo">
          <view class="quick-icon note">
            <view class="line a"></view>
            <view class="line b"></view>
          </view>
          <view class="quick-label">今日小计</view>
        </view>
        <view class="quick-card" hover-class="surface-press" hover-stay-time="70" @click="goAlbum">
          <view class="quick-icon photo">
            <view class="dot"></view>
            <view class="mountain"></view>
          </view>
          <view class="quick-label">甜蜜相册</view>
        </view>
        <view class="quick-card" hover-class="surface-press" hover-stay-time="70" @click="goAnniversary">
          <view class="quick-icon calendar">
            <view class="ring left"></view>
            <view class="ring right"></view>
            <view class="heart"></view>
          </view>
          <view class="quick-label">纪念日</view>
        </view>
        <view class="quick-card" hover-class="surface-press" hover-stay-time="70" @click="goImprovement">
          <view class="quick-icon book">
            <view class="line a"></view>
            <view class="line b"></view>
          </view>
          <view class="quick-label">改进簿</view>
        </view>
      </view>
    </view>

    <BottomTab activeKey="home" />
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUser, requireAuth } from '@/utils/auth.js'
import { getProfile } from '@/utils/profile.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import { fetchSharedCountdownPlan } from '@/services/countdown.js'
import { fetchTodayDailySummary, getDailySummaryMoodMeta } from '@/services/daily-summaries.js'
import { fetchAnniversaryList } from '@/services/anniversaries.js'
import { fetchPartnerProfile, fetchRemoteProfile } from '@/services/profile.js'
import BottomTab from '@/pages/components/BottomTab.vue'

const WEEK_LABELS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const SHORT_WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const ANNIVERSARY_ICON_MAP = {
  love: '♡',
  birthday: '✦',
  meet: '☽',
  travel: '✦',
  custom: '♡'
}
const DAY_MS = 24 * 60 * 60 * 1000
const { themeStyle } = useThemePage()

const profileState = reactive({
  currentName: '',
  currentRelationName: '',
  partnerName: 'TA',
  partnerRelationName: '',
  anniversaryDate: ''
})

const countdownState = reactive({
  nextMeetingAt: '',
  note: '',
  place: '',
  loverName: ''
})

const relationshipState = reactive({
  days: 0,
  eventDate: '',
  meta: '请在纪念日中补充确认关系日期'
})

const memoState = reactive({
  mood: 'gentle',
  content: '今天还没有留下新的记录',
  hasRecord: false,
  entryCount: 0,
  imageCount: 0,
  updatedBy: '',
  updatedAt: '',
  summaryDate: ''
})

const upcomingAnniversaries = ref([])

const pageDateLabel = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${WEEK_LABELS[now.getDay()]}`
})

const greetingMeta = computed(() => {
  const hour = new Date().getHours()
  if (hour < 5) return { label: '夜深了', emoji: '🌙' }
  if (hour < 9) return { label: '早安', emoji: '☀' }
  if (hour < 12) return { label: '上午好', emoji: '🌤' }
  if (hour < 18) return { label: '下午好', emoji: '🌤' }
  return { label: '晚安', emoji: '🌙' }
})

const greetingLabel = computed(() => greetingMeta.value.label)
const greetingEmoji = computed(() => greetingMeta.value.emoji)
const greetingName = computed(() => profileState.currentName || '你')
const heroLeftName = computed(() => shortenName(profileState.currentRelationName || profileState.currentName || '我'))
const heroRightName = computed(() => shortenName(profileState.partnerRelationName || profileState.partnerName || countdownState.loverName || 'TA'))
const relationshipDaysText = computed(() => String(Math.max(Number(relationshipState.days || 0), 0)))
const relationshipMetaText = computed(() => relationshipState.eventDate ? `${formatDotDate(parseDateTime(relationshipState.eventDate))} — 今天` : relationshipState.meta)

const nextMeetingSummary = computed(() => {
  const nextDate = parseDateTime(countdownState.nextMeetingAt)
  if (!nextDate) {
    return {
      days: '--',
      dateLabel: '见面日期待设置'
    }
  }
  const today = startOfDay(new Date())
  const target = startOfDay(nextDate)
  const days = Math.max(0, Math.ceil((target.getTime() - today.getTime()) / DAY_MS))
  return {
    days: String(days),
    dateLabel: `${nextDate.getMonth() + 1}月${nextDate.getDate()}日·${SHORT_WEEK_LABELS[nextDate.getDay()]}`
  }
})

const countdownProgressDotCount = computed(() => {
  const days = Number(nextMeetingSummary.value.days)
  if (!Number.isFinite(days)) return 0
  const safeDays = Math.max(0, Math.min(days, 30))
  return Math.max(1, Math.min(10, 10 - Math.floor(safeDays / 3)))
})

const memoMiniSummary = computed(() => ({
  entryCount: memoState.entryCount,
  imageCount: memoState.imageCount,
  footer: memoState.hasRecord ? `${resolveMemoUpdatedBy()}也记录了今天♡` : '等你们写下今天的心情'
}))

const upcomingAnniversaryCards = computed(() => upcomingAnniversaries.value.slice(0, 3))

const memoFocusSummary = computed(() => ({
  badge: memoState.hasRecord ? `${memoState.entryCount}条记录` : '今天待记录',
  kicker: memoState.hasRecord ? getDailySummaryMoodMeta(memoState.mood).label : '留下一句今天的话',
  content: memoState.hasRecord ? memoState.content : '今天还没有新的今日小计，去写下你们的小日常吧',
  meta: memoState.hasRecord ? formatMemoMeta() : '今天 · 暂无记录',
  actionText: memoState.hasRecord ? '查看详情' : '立即记录'
}))

function parseDateTime(value) {
  if (!value) return null
  const date = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function shortenName(value) {
  const text = String(value || '').trim()
  if (!text) return 'TA'
  return text.slice(0, 2)
}

function resolveDisplayName(value, fallback) {
  const text = String(value || '').trim()
  return text || fallback
}

function formatDotDate(date) {
  if (!date) return '未设置'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function getCurrentUsername() {
  try {
    return String(getUser()?.username || '').trim()
  } catch (error) {
    return ''
  }
}

function resolveMemoUpdatedBy() {
  const currentUsername = getCurrentUsername()
  if (memoState.updatedBy && memoState.updatedBy === currentUsername) {
    return profileState.currentName || '你'
  }
  return profileState.partnerName || 'TA'
}

function formatMemoMeta() {
  const date = parseDateTime(memoState.updatedAt || memoState.summaryDate)
  const dateLabel = date ? `${date.getMonth() + 1}月${date.getDate()}日` : '今天'
  return `${dateLabel} · ${resolveMemoUpdatedBy()}更新`
}

function buildRelationshipState(list, fallbackDate) {
  const relationshipItem = (Array.isArray(list) ? list : []).find((item) => item.type === 'love')
  const eventDate = relationshipItem?.eventDate || fallbackDate || ''
  const event = parseDateTime(eventDate)
  if (!event) {
    relationshipState.days = 0
    relationshipState.eventDate = ''
    relationshipState.meta = '请在纪念日中补充确认关系日期'
    return
  }
  const today = startOfDay(new Date())
  const target = startOfDay(event)
  relationshipState.days = Math.max(1, Math.floor((today.getTime() - target.getTime()) / DAY_MS) + 1)
  relationshipState.eventDate = eventDate
  relationshipState.meta = ''
}

function buildUpcomingAnniversaries(list) {
  const cards = (Array.isArray(list) ? list : [])
    .filter((item) => Number(item.dayOffset) >= 0)
    .sort((left, right) => Number(left.dayOffset || 0) - Number(right.dayOffset || 0))
    .slice(0, 3)
    .map((item, index) => ({
      id: item.id || `anniversary_${index}`,
      title: item.title || '纪念日',
      days: Math.max(Number(item.dayOffset || 0), 0),
      icon: ANNIVERSARY_ICON_MAP[item.type] || (index % 2 === 0 ? '✦' : '♡')
    }))
  upcomingAnniversaries.value = cards
}

async function loadHomeSummary() {
  const localProfile = getProfile()
  profileState.currentName = resolveDisplayName(localProfile.nickname || getUser()?.nickname, '你')
  profileState.currentRelationName = resolveDisplayName(localProfile.loverNickname, profileState.currentName || '我')
  profileState.partnerName = resolveDisplayName(countdownState.loverName, 'TA')
  profileState.partnerRelationName = resolveDisplayName(profileState.partnerName, countdownState.loverName || 'TA')
  profileState.anniversaryDate = String(localProfile.anniversaryDate || '').trim()

  const [profileResult, countdownResult, memoResult, anniversaryResult, partnerResult] = await Promise.allSettled([
    fetchRemoteProfile(),
    fetchSharedCountdownPlan(),
    fetchTodayDailySummary(),
    fetchAnniversaryList('all'),
    fetchPartnerProfile()
  ])

  if (profileResult.status === 'fulfilled' && profileResult.value) {
    profileState.currentName = resolveDisplayName(profileResult.value.nickname, profileState.currentName || '你')
    profileState.currentRelationName = resolveDisplayName(profileResult.value.loverNickname, profileState.currentRelationName || profileState.currentName || '我')
    profileState.anniversaryDate = String(profileResult.value.anniversaryDate || profileState.anniversaryDate || '').trim()
  }

  if (countdownResult.status === 'fulfilled' && countdownResult.value) {
    Object.assign(countdownState, {
      nextMeetingAt: countdownResult.value.nextMeetingAt || '',
      note: countdownResult.value.note || '',
      place: countdownResult.value.place || '',
      loverName: countdownResult.value.loverName || ''
    })
  }

  if (partnerResult.status === 'fulfilled' && partnerResult.value) {
    profileState.partnerName = resolveDisplayName(partnerResult.value.nickname, profileState.partnerName || 'TA')
    profileState.partnerRelationName = resolveDisplayName(partnerResult.value.loverNickname, profileState.partnerRelationName || profileState.partnerName || 'TA')
  } else if (countdownState.loverName) {
    profileState.partnerName = resolveDisplayName(countdownState.loverName, profileState.partnerName || 'TA')
    profileState.partnerRelationName = resolveDisplayName(profileState.partnerName, profileState.partnerRelationName || 'TA')
  }

  if (anniversaryResult.status === 'fulfilled') {
    buildRelationshipState(anniversaryResult.value, profileState.anniversaryDate)
    buildUpcomingAnniversaries(anniversaryResult.value)
  } else {
    buildRelationshipState([], profileState.anniversaryDate)
    buildUpcomingAnniversaries([])
  }

  if (memoResult.status === 'fulfilled' && memoResult.value) {
    const summary = memoResult.value
    const entryList = Array.isArray(summary.entryList) ? summary.entryList : []
    memoState.mood = summary.mood || 'gentle'
    memoState.content = String(summary.content || '').trim() || '今天还没有留下新的记录'
    memoState.hasRecord = Boolean(summary.hasRecord)
    memoState.entryCount = Number(summary.entryCount || entryList.length || 0)
    memoState.imageCount = entryList.reduce((total, item) => total + (Array.isArray(item.mediaList) ? item.mediaList.filter((media) => media.mediaType === 'image').length : 0), 0)
    memoState.updatedBy = String(summary.updaterUsername || summary.creatorUsername || '').trim()
    memoState.updatedAt = String(summary.updatedAt || '').trim()
    memoState.summaryDate = String(summary.summaryDate || '').trim()
  } else {
    memoState.mood = 'gentle'
    memoState.content = '今天还没有留下新的记录'
    memoState.hasRecord = false
    memoState.entryCount = 0
    memoState.imageCount = 0
    memoState.updatedBy = ''
    memoState.updatedAt = ''
    memoState.summaryDate = ''
  }
}

function handleMemoPrimaryAction() {
  if (memoState.hasRecord) {
    goMemo()
    return
  }
  goMemoEdit()
}

function goCountdown() { goPage('/pages/modules/countdown/index') }
function goAnniversary() { goPage('/pages/modules/anniversary/index') }
function goAlbum() { goPage('/pages/modules/album/index') }
function goImprovement() { goPage('/pages/modules/improvement/index') }
function goMemo() { goPage('/pages/modules/daily-summary/detail') }
function goMemoEdit() { goPage('/pages/modules/daily-summary/edit') }
function goNotifications() { goPage('/pages/modules/notifications/index') }

onMounted(() => {
  requireAuth()
})

onShow(() => {
  if (requireAuth()) {
    loadHomeSummary()
  }
})
</script>

<style scoped>
  .home-page {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top, rgba(255, 255, 255, 0.92), rgba(255, 245, 242, 0.94)),
      linear-gradient(180deg, #fff5f0 0%, #fff7f5 52%, #fff3ee 100%);
  }

  .home-bg {
    position: absolute;
    border-radius: 999rpx;
    filter: blur(18rpx);
    opacity: 0.7;
    pointer-events: none;
  }

  .home-bg-a {
    width: 260rpx;
    height: 260rpx;
    top: 220rpx;
    right: -100rpx;
    background: rgba(255, 223, 213, 0.9);
  }

  .home-bg-b {
    width: 220rpx;
    height: 220rpx;
    top: 820rpx;
    left: -90rpx;
    background: rgba(255, 234, 226, 0.88);
  }

  .home-bg-c {
    width: 260rpx;
    height: 260rpx;
    bottom: 260rpx;
    right: -80rpx;
    background: rgba(248, 228, 218, 0.86);
  }

  .home-header,
  .hero-card,
  .dual-grid,
  .anniversary-section,
  .memo-focus-card,
  .quick-section {
    position: relative;
    z-index: 2;
  }

  .home-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24rpx;
    margin-top: 6rpx;
    margin-bottom: 24rpx;
  }

  .home-date {
    font-size: 24rpx;
    letter-spacing: 1rpx;
    color: #cda692;
  }

  .home-greeting {
    margin-top: 12rpx;
    font-size: 44rpx;
    line-height: 1.15;
    font-weight: 600;
    color: #8f665d;
  }

  .home-greeting-emoji {
    margin-left: 10rpx;
  }

  .home-notice {
    position: relative;
    flex-shrink: 0;
    width: 82rpx;
    height: 82rpx;
    border-radius: 28rpx;
    background: rgba(255, 255, 255, 0.74);
    box-shadow: 0 12rpx 24rpx rgba(230, 185, 164, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(14px);
  }

  .home-notice-dot {
    position: absolute;
    top: 18rpx;
    right: 18rpx;
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: #f08d92;
    box-shadow: 0 0 0 4rpx rgba(255, 255, 255, 0.92);
  }

  .home-notice-icon {
    position: relative;
    width: 34rpx;
    height: 36rpx;
  }

  .bell-top {
    position: absolute;
    left: 12rpx;
    top: 2rpx;
    width: 10rpx;
    height: 6rpx;
    border-radius: 999rpx 999rpx 0 0;
    background: #d9a88f;
  }

  .bell-body {
    position: absolute;
    left: 5rpx;
    top: 8rpx;
    width: 24rpx;
    height: 20rpx;
    border-radius: 14rpx 14rpx 10rpx 10rpx;
    background: linear-gradient(180deg, #efc2ad, #dca488);
  }

  .bell-bottom {
    position: absolute;
    left: 10rpx;
    bottom: 2rpx;
    width: 14rpx;
    height: 5rpx;
    border-radius: 999rpx;
    background: #d19a82;
  }

  .hero-card {
    overflow: hidden;
    padding: 30rpx 28rpx 36rpx;
    border-radius: 40rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 251, 249, 0.96) 100%);
    box-shadow:
      0 18rpx 42rpx rgba(232, 198, 183, 0.22),
      inset 0 0 0 2rpx rgba(255, 255, 255, 0.92);
  }

  .hero-strip {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 18rpx;
    background: linear-gradient(90deg, #f6c6cb 0%, #f5d7c4 48%, #f2d3c8 100%);
  }

  .hero-spark {
    position: absolute;
    color: rgba(234, 187, 174, 0.72);
    font-size: 22rpx;
  }

  .hero-spark-a { top: 60rpx; left: 120rpx; }
  .hero-spark-b { top: 104rpx; right: 110rpx; }
  .hero-spark-c { top: 156rpx; left: 88rpx; }

  .hero-avatars {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18rpx;
    margin-top: 28rpx;
  }

  .hero-avatar {
    width: 94rpx;
    height: 94rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 600;
    color: #9e7267;
    background: radial-gradient(circle at 30% 30%, #fffaf8, #f9ece5);
    box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.94);
  }

  .hero-avatar-left {
    background: linear-gradient(180deg, #fff6f1, #fbe7df);
  }

  .hero-avatar-right {
    background: linear-gradient(180deg, #fff8f4, #f7e8dd);
  }

  .hero-heart {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    color: #fff;
    background: linear-gradient(180deg, #ef9ea3, #e48a90);
    box-shadow: 0 10rpx 18rpx rgba(234, 146, 154, 0.28);
  }

  .hero-copy {
    margin-top: 34rpx;
    text-align: center;
    font-size: 24rpx;
    letter-spacing: 10rpx;
    color: #c39d91;
  }

  .hero-days-row {
    margin-top: 24rpx;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 12rpx;
    color: #9c695f;
  }

  .hero-days {
    font-size: 128rpx;
    line-height: 0.9;
    font-weight: 600;
    letter-spacing: 3rpx;
  }

  .hero-unit {
    margin-bottom: 18rpx;
    font-size: 34rpx;
    font-weight: 600;
  }

  .hero-meta-row {
    margin-top: 24rpx;
    display: flex;
    align-items: center;
    gap: 18rpx;
  }

  .hero-line {
    flex: 1;
    height: 2rpx;
    background: linear-gradient(90deg, rgba(233, 210, 198, 0), rgba(233, 210, 198, 0.95), rgba(233, 210, 198, 0));
  }

  .hero-meta {
    flex-shrink: 0;
    font-size: 22rpx;
    color: #c39d91;
  }

  .dual-grid {
    margin-top: 24rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
  }

  .info-card,
  .anniversary-card,
  .memo-focus-card,
  .quick-card {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 246, 0.96));
    box-shadow:
      0 16rpx 34rpx rgba(232, 198, 183, 0.18),
      inset 0 0 0 2rpx rgba(255, 255, 255, 0.9);
  }

  .info-card {
    min-height: 260rpx;
    padding: 24rpx;
    border-radius: 32rpx;
  }

  .card-kicker {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 24rpx;
    color: #aa8174;
  }

  .card-kicker-dot {
    width: 10rpx;
    height: 10rpx;
    border-radius: 50%;
  }

  .accent-pink { background: #f29ca2; }
  .accent-gold { background: #dfbc7a; }

  .meet-days-row {
    margin-top: 26rpx;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 8rpx;
    color: #9d6b61;
  }

  .meet-days {
    font-size: 88rpx;
    line-height: 0.92;
    font-weight: 600;
  }

  .meet-unit {
    margin-bottom: 14rpx;
    font-size: 28rpx;
    font-weight: 600;
  }

  .meet-date {
    margin-top: 12rpx;
    text-align: center;
    font-size: 24rpx;
    color: #c39d91;
  }

  .meet-dots {
    margin-top: 22rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
  }

  .meet-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: rgba(241, 208, 196, 0.72);
  }

  .meet-dot.active {
    background: linear-gradient(180deg, #f19ca2, #e59097);
    box-shadow: 0 6rpx 12rpx rgba(234, 146, 154, 0.24);
  }

  .summary-card {
    display: flex;
    flex-direction: column;
  }

  .summary-stat {
    margin-top: 18rpx;
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .summary-icon,
  .memo-focus-icon,
  .quick-icon {
    position: relative;
    flex-shrink: 0;
  }

  .summary-icon-note,
  .memo-focus-icon,
  .quick-icon.note,
  .quick-icon.book {
    width: 40rpx;
    height: 40rpx;
    border-radius: 12rpx;
    background: linear-gradient(180deg, #f8efe8, #f3e4db);
  }

  .summary-icon-note .line,
  .memo-focus-icon .line,
  .quick-icon.note .line,
  .quick-icon.book .line {
    position: absolute;
    left: 10rpx;
    right: 10rpx;
    height: 4rpx;
    border-radius: 999rpx;
    background: #c69c8f;
  }

  .summary-icon-note .line.a,
  .memo-focus-icon .line.a,
  .quick-icon.note .line.a,
  .quick-icon.book .line.a {
    top: 13rpx;
  }

  .summary-icon-note .line.b,
  .memo-focus-icon .line.b,
  .quick-icon.note .line.b,
  .quick-icon.book .line.b {
    top: 22rpx;
  }

  .summary-icon-photo,
  .quick-icon.photo {
    width: 40rpx;
    height: 40rpx;
    border-radius: 12rpx;
    background: linear-gradient(180deg, #f7eee5, #efe1d6);
    overflow: hidden;
  }

  .summary-icon-photo .dot,
  .quick-icon.photo .dot {
    position: absolute;
    top: 8rpx;
    left: 9rpx;
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: #dfbc7a;
  }

  .summary-icon-photo .mountain,
  .quick-icon.photo .mountain {
    position: absolute;
    left: 7rpx;
    right: 7rpx;
    bottom: 8rpx;
    height: 16rpx;
    border-radius: 10rpx 10rpx 4rpx 4rpx;
    background: linear-gradient(180deg, #cfa39a, #b98880);
    transform: skewX(-16deg);
  }
  .summary-main {
    display: flex;
    align-items: baseline;
    gap: 6rpx;
    color: #9d6b61;
  }

  .summary-value {
    font-size: 42rpx;
    line-height: 1;
    font-weight: 600;
  }

  .summary-label {
    font-size: 24rpx;
    color: #b38679;
  }

  .summary-divider {
    margin-top: 18rpx;
    height: 2rpx;
    background: linear-gradient(90deg, rgba(235, 211, 198, 0), rgba(235, 211, 198, 0.96), rgba(235, 211, 198, 0));
  }

  .summary-footer {
    margin-top: auto;
    padding-top: 18rpx;
    font-size: 22rpx;
    line-height: 1.6;
    color: #bf988b;
  }

  .anniversary-section {
    margin-top: 28rpx;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .section-title-wrap {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .section-accent {
    width: 8rpx;
    height: 28rpx;
    border-radius: 999rpx;
    background: linear-gradient(180deg, #efabaf, #e2959b);
  }

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #8f665d;
  }

  .section-link {
    font-size: 24rpx;
    color: #bf988b;
  }

  .section-link text {
    margin-left: 6rpx;
  }

  .anniversary-scroll {
    margin-top: 20rpx;
    width: 100%;
    overflow: visible;
  }

  .anniversary-list {
    display: flex;
    gap: 16rpx;
    padding-right: 8rpx;
  }

  .anniversary-card {
    width: 196rpx;
    min-height: 176rpx;
    padding: 24rpx 22rpx;
    border-radius: 30rpx;
    flex-shrink: 0;
  }

  .anniversary-icon {
    width: 44rpx;
    height: 44rpx;
    border-radius: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    color: #fff;
    background: linear-gradient(180deg, #efb6b4, #e2959b);
    box-shadow: 0 10rpx 18rpx rgba(234, 146, 154, 0.2);
  }

  .anniversary-title {
    margin-top: 24rpx;
    font-size: 28rpx;
    line-height: 1.4;
    font-weight: 600;
    color: #8f665d;
  }

  .anniversary-days-row {
    margin-top: 16rpx;
    display: flex;
    align-items: flex-end;
    gap: 6rpx;
    color: #a56f65;
  }

  .anniversary-days {
    font-size: 42rpx;
    line-height: 1;
    font-weight: 600;
  }

  .anniversary-unit {
    margin-bottom: 4rpx;
    font-size: 22rpx;
  }

  .anniversary-card-empty {
    display: flex;
    flex-direction: column;
  }

  .anniversary-empty-copy {
    margin-top: 16rpx;
    font-size: 22rpx;
    line-height: 1.5;
    color: #c19a8c;
  }

  .memo-focus-card {
    position: relative;
    margin-top: 28rpx;
    padding: 0 28rpx 28rpx;
    border-radius: 36rpx;
    overflow: hidden;
  }

  .memo-focus-topline {
    height: 18rpx;
    margin: 0 -28rpx;
    background: linear-gradient(90deg, #f5d2d3, #f6decb, #f0d8cc);
  }

  .memo-focus-head {
    margin-top: 28rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
  }

  .memo-focus-title-wrap {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .memo-focus-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #8f665d;
  }

  .memo-focus-badge {
    flex-shrink: 0;
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    color: #ba897b;
    background: rgba(247, 233, 225, 0.92);
  }

  .memo-focus-body {
    margin-top: 22rpx;
    padding: 26rpx 24rpx;
    border-radius: 28rpx;
    background: linear-gradient(180deg, rgba(255, 250, 247, 0.98), rgba(255, 244, 239, 0.92));
  }

  .memo-focus-kicker {
    font-size: 24rpx;
    color: #c49f91;
  }

  .memo-focus-content {
    margin-top: 14rpx;
    font-size: 30rpx;
    line-height: 1.8;
    color: #8f665d;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .memo-focus-foot {
    margin-top: 22rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
  }

  .memo-focus-meta {
    min-width: 0;
    font-size: 22rpx;
    color: #bf988b;
  }

  .memo-focus-action {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 10rpx;
    padding: 16rpx 22rpx;
    border-radius: 999rpx;
    color: #fff;
    background: linear-gradient(180deg, #f2acae, #e5969b);
    box-shadow: 0 12rpx 22rpx rgba(234, 146, 154, 0.22);
  }

  .memo-focus-action text {
    font-size: 24rpx;
    font-weight: 600;
  }

  .memo-focus-arrow {
    width: 14rpx;
    height: 14rpx;
    border-top: 3rpx solid rgba(255, 255, 255, 0.96);
    border-right: 3rpx solid rgba(255, 255, 255, 0.96);
    transform: rotate(45deg);
  }

  .quick-section {
    margin-top: 28rpx;
  }

  .quick-kicker {
    text-align: center;
    font-size: 22rpx;
    letter-spacing: 10rpx;
    color: #c39d91;
  }

  .quick-grid {
    margin-top: 18rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
  }

  .quick-card {
    min-height: 174rpx;
    padding: 24rpx;
    border-radius: 32rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18rpx;
  }

  .quick-icon {
    width: 48rpx;
    height: 48rpx;
  }

  .quick-icon.calendar {
    border-radius: 14rpx;
    background: linear-gradient(180deg, #f7eee6, #efe0d5);
  }

  .quick-icon.calendar .ring {
    position: absolute;
    top: -3rpx;
    width: 8rpx;
    height: 14rpx;
    border-radius: 999rpx;
    background: #cf9b85;
  }

  .quick-icon.calendar .ring.left { left: 11rpx; }
  .quick-icon.calendar .ring.right { right: 11rpx; }

  .quick-icon.calendar .heart {
    position: absolute;
    left: 15rpx;
    top: 18rpx;
    width: 18rpx;
    height: 16rpx;
    transform: rotate(-45deg);
    background: #e79da1;
  }

  .quick-icon.calendar .heart::before,
  .quick-icon.calendar .heart::after {
    content: '';
    position: absolute;
    width: 18rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #e79da1;
  }

  .quick-icon.calendar .heart::before { top: -9rpx; left: 0; }
  .quick-icon.calendar .heart::after { top: 0; left: 9rpx; }

  .quick-label {
    font-size: 28rpx;
    font-weight: 600;
    color: #8f665d;
  }

  .surface-press {
    transform: translateY(2rpx) scale(0.986);
  }

  @media screen and (max-width: 520px) {
    .hero-days {
      font-size: 112rpx;
    }

    .home-greeting {
      font-size: 40rpx;
    }
  }
</style>
