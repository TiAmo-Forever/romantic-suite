<template>
  <view class="page app-page-shell admin-countdown-page" :style="themeStyle">
    <view class="admin-topbar app-topbar">
      <view class="top-nav-btn app-topbar-btn" @click="backPage">
        <view class="top-nav-icon app-topbar-icon" aria-hidden="true"></view>
        <text class="top-nav-text app-topbar-text">返回</text>
      </view>
      <view class="app-topbar-center">
        <view class="app-topbar-eyebrow">见面计划</view>
        <view class="app-topbar-title">见面倒计时</view>
      </view>
      <view class="top-nav-placeholder"></view>
    </view>

    <view class="hero-card app-fade-up">
      <view class="hero-badge app-pill app-pill-glass">{{ heroBadge }}</view>
      <view class="hero-date">{{ detail.nextMeetingAt || '待设置' }}</view>
      <view class="hero-title">{{ heroTitle }}</view>
      <view class="hero-desc">{{ detail.note || '暂无说明' }}</view>
    </view>

    <view class="countdown-card app-card-soft app-fade-up app-delay-1">
      <view class="section-title">距离这次见面</view>
      <view class="countdown-main">{{ countdownValue }}</view>
      <view class="countdown-copy">{{ countdownCopy }}</view>
    </view>

    <view class="detail-grid app-fade-up app-delay-2">
      <view class="detail-card app-card-soft">
        <view class="detail-label">上次见面</view>
        <view class="detail-value">{{ detail.lastMeetingAt || '待设置' }}</view>
        <view class="detail-sub">相隔 {{ detail.daysSinceLastMeeting || 0 }} 天</view>
      </view>
      <view class="detail-card app-card-soft">
        <view class="detail-label">当前进度</view>
        <view class="detail-value">{{ detail.progressPercent || 0 }}%</view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: `${detail.progressPercent || 0}%` }"></view>
        </view>
        <view class="detail-sub">{{ progressCopy }}</view>
      </view>
    </view>

    <view class="summary-card app-card-soft app-fade-up app-delay-2">
      <view class="summary-row">
        <view class="summary-label">见面地点</view>
        <view class="summary-value">{{ detail.place || '待设置' }}</view>
      </view>
      <view class="summary-row">
        <view class="summary-label">称呼</view>
        <view class="summary-value">{{ detail.loverName || 'TA' }}</view>
      </view>
      <view class="summary-row">
        <view class="summary-label">安排形式</view>
        <view class="summary-value">{{ detail.allDay ? '全天见面' : '具体时间见面' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireAuth, isAdminUser } from '@/utils/auth.js'
import { backPage, relaunchPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import { fetchAdminCountdownDetail } from '@/services/admin.js'

const { themeStyle } = useThemePage()
const detail = reactive({
  loverName: '',
  place: '',
  note: '',
  nextMeetingAt: '',
  lastMeetingAt: '',
  allDay: false,
  daysUntilNextMeeting: 0,
  daysSinceLastMeeting: 0,
  progressPercent: 0,
  timeStatus: 'unknown'
})

const countdownValue = computed(() => {
  const days = Number(detail.daysUntilNextMeeting || 0)
  return days < 0 ? '已过期' : `${days} 天`
})

const heroBadge = computed(() => {
  switch (detail.timeStatus) {
    case 'today':
      return '今天见面'
    case 'soon':
      return '即将见面'
    case 'past':
      return '已结束'
    default:
      return '见面计划'
  }
})

const heroTitle = computed(() => {
  if (detail.timeStatus === 'today') {
    return '今天就是见面的日子'
  }
  if (detail.timeStatus === 'past') {
    return '该计划已结束'
  }
  return `${detail.loverName || 'TA'}见面安排`
})

const countdownCopy = computed(() => {
  const days = Number(detail.daysUntilNextMeeting || 0)
  if (!detail.nextMeetingAt) {
    return '暂无见面时间'
  }
  if (days < 0) {
    return '该见面安排已结束'
  }
  if (days === 0) {
    return '今天见面'
  }
  return `还有 ${days} 天`
})

const progressCopy = computed(() => {
  if (detail.timeStatus === 'past') {
    return '本次安排已结束'
  }
  if (detail.timeStatus === 'today') {
    return '今天见面'
  }
  return '按自然日计算'
})

async function loadDetail() {
  const payload = await fetchAdminCountdownDetail()
  Object.assign(detail, payload || {})
}

onShow(() => {
  if (!requireAuth()) {
    return
  }
  if (!isAdminUser()) {
    relaunchPage('/pages/home/home')
    return
  }
  loadDetail().catch((error) => {
    uni.showToast({ title: error?.message || '加载失败', icon: 'none' })
  })
})
</script>

<style scoped>
  .admin-countdown-page { background: var(--app-page-gradient-main); }
  .admin-topbar { position: sticky; top: var(--app-sticky-top); z-index: 10; background: rgba(255, 255, 255, 0.58); backdrop-filter: blur(12px); }
  .top-nav-icon { width: 18rpx; height: 18rpx; border-left: 4rpx solid currentColor; border-bottom: 4rpx solid currentColor; border-radius: 2rpx; box-sizing: border-box; transform: rotate(45deg); }
  .top-nav-placeholder { width: 88rpx; }
  .hero-card { padding: 36rpx 30rpx; border-radius: 32rpx; background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.24), transparent 30%), var(--app-gradient-hero); box-shadow: var(--app-shadow-card); color: #fff; }
  .hero-date { margin-top: 18rpx; font-size: 50rpx; line-height: 1.3; font-weight: 700; }
  .hero-title { margin-top: 18rpx; font-size: 30rpx; line-height: 1.6; font-weight: 600; }
  .hero-desc { margin-top: 14rpx; font-size: 24rpx; line-height: 1.8; color: rgba(255, 255, 255, 0.82); }
  .countdown-card, .summary-card { margin-top: 22rpx; padding: 28rpx; }
  .section-title { font-size: 30rpx; font-weight: 600; color: var(--app-color-text-strong); }
  .countdown-main { margin-top: 20rpx; font-size: 72rpx; line-height: 1; color: var(--app-color-primary); font-weight: 700; }
  .countdown-copy { margin-top: 14rpx; font-size: 24rpx; line-height: 1.7; color: var(--app-color-text); }
  .detail-grid { margin-top: 22rpx; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18rpx; }
  .detail-card { padding: 24rpx; }
  .detail-label { font-size: 24rpx; color: var(--app-color-text); }
  .detail-value { margin-top: 14rpx; font-size: 30rpx; line-height: 1.5; color: var(--app-color-primary-strong); font-weight: 700; }
  .detail-sub { margin-top: 14rpx; font-size: 22rpx; line-height: 1.7; color: #8f6b77; }
  .progress-bar { height: 12rpx; margin-top: 18rpx; border-radius: 999rpx; background: #ffe3ec; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: inherit; background: var(--app-gradient-primary); }
  .summary-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
  .summary-row + .summary-row { margin-top: 18rpx; padding-top: 18rpx; border-top: 1rpx solid rgba(232, 221, 209, 0.86); }
  .summary-label { font-size: 24rpx; color: var(--app-color-text); }
  .summary-value { font-size: 25rpx; line-height: 1.7; color: var(--app-color-text-strong); font-weight: 600; text-align: right; }
</style>
