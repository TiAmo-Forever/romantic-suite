<template>
  <view class="page app-page-shell app-page-shell-tabbed home-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="home-bg home-bg-a"></view>
    <view class="home-bg home-bg-b"></view>

    <view class="home-top app-fade-up">
      <view class="home-brand-wrap">
        <view class="home-brand-kicker">{{ TEXT.brandKicker }}</view>
        <view class="home-brand">{{ TEXT.brand }}</view>
        <view class="home-brand-sub">{{ TEXT.brandSub }}</view>
        <view class="home-brand-line">
          <view class="home-brand-sep"></view>
          <view class="home-brand-icon-wrap">
            <view class="home-brand-leaf home-brand-leaf-left"></view>
            <view class="home-brand-icon">{{ TEXT.brandIcon }}</view>
            <view class="home-brand-leaf home-brand-leaf-right"></view>
          </view>
          <view class="home-brand-sep"></view>
        </view>
      </view>
      <view class="home-setting" hover-class="home-setting-active" hover-stay-time="60" @click="goSettings">
        <view class="home-setting-icon"></view>
      </view>
    </view>

    <view class="countdown-card app-fade-up app-delay-1" hover-class="surface-press" hover-stay-time="70" @click="goCountdown">
      <view class="countdown-kicker">{{ TEXT.countdownKicker }}</view>
      <view class="countdown-main">
        <text class="countdown-days">{{ countdownSummary.days }}</text>
        <text class="countdown-unit">{{ TEXT.dayUnit }}</text>
      </view>
      <view class="countdown-caption">{{ countdownSummary.caption }}</view>
    </view>

    <view class="summary-grid app-fade-up app-delay-2">
      <view class="summary-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goAnniversary">
        <view class="summary-title-row">
          <view class="summary-title">{{ TEXT.anniversaryTitle }}</view>
        </view>
        <view class="summary-main">
          <text class="summary-number">{{ anniversarySummary.days }}</text>
          <text class="summary-unit">{{ TEXT.dayUnit }}</text>
        </view>
        <view class="summary-desc">{{ anniversarySummary.label }}</view>
        <view class="summary-meta">{{ anniversarySummary.meta }}</view>
        <view class="summary-deco summary-deco-flower"></view>
      </view>

      <view class="summary-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goImprovement">
        <view class="summary-title-row">
          <view class="summary-title">{{ TEXT.improvementTitle }}</view>
        </view>
        <view class="summary-progress-row">
          <text class="summary-inline-label">{{ TEXT.improvementPrefix }}</text>
          <text class="summary-inline-number">{{ improvementSummary.count }}</text>
          <text class="summary-inline-label">{{ TEXT.improvementSuffix }}</text>
        </view>
        <view class="status-badge" :class="improvementSummary.tagClass">{{ improvementSummary.tagText }}</view>
        <view class="summary-deco summary-deco-wave"></view>
      </view>
    </view>

    <view class="memo-card app-fade-up app-delay-2">
      <view class="memo-head">
        <view class="memo-title">{{ TEXT.memoTitle }}</view>
        <view class="memo-add" hover-class="memo-add-active" hover-stay-time="60" @click="goMemo">
          <text class="memo-add-plus">+</text>
          <text class="memo-add-text">{{ TEXT.memoAdd }}</text>
        </view>
      </view>
      <view class="memo-content">{{ memoSummary.content }}</view>
      <view class="memo-meta">{{ memoSummary.meta }}</view>
    </view>

    <view class="entry-grid app-fade-up app-delay-3">
      <view class="entry-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goAlbum">
        <view class="entry-icon entry-icon-frame">
          <view class="icon-album">
            <view class="icon-album-back"></view>
            <view class="icon-album-front">
              <view class="icon-album-sun"></view>
              <view class="icon-album-mountain icon-album-mountain-left"></view>
              <view class="icon-album-mountain icon-album-mountain-right"></view>
              <view class="icon-album-flower"></view>
            </view>
          </view>
        </view>
        <view class="entry-label">{{ TEXT.albumTitle }}</view>
      </view>

      <view class="entry-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goAnniversary">
        <view class="entry-icon entry-icon-frame">
          <view class="icon-calendar">
            <view class="icon-calendar-ring icon-calendar-ring-left"></view>
            <view class="icon-calendar-ring icon-calendar-ring-right"></view>
            <view class="icon-calendar-top"></view>
            <view class="icon-calendar-heart"></view>
            <view class="icon-calendar-dot icon-calendar-dot-a"></view>
            <view class="icon-calendar-dot icon-calendar-dot-b"></view>
            <view class="icon-calendar-dot icon-calendar-dot-c"></view>
            <view class="icon-calendar-dot icon-calendar-dot-d"></view>
          </view>
        </view>
        <view class="entry-label">{{ TEXT.anniversaryShort }}</view>
      </view>

      <view class="entry-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goImprovement">
        <view class="entry-icon entry-icon-frame">
          <view class="icon-book">
            <view class="icon-book-cover icon-book-cover-left"></view>
            <view class="icon-book-cover icon-book-cover-right"></view>
            <view class="icon-book-page"></view>
            <view class="icon-book-line icon-book-line-a"></view>
            <view class="icon-book-line icon-book-line-b"></view>
            <view class="icon-book-pen"></view>
          </view>
        </view>
        <view class="entry-label">{{ TEXT.improvementShort }}</view>
      </view>

      <view class="entry-card entry-card-more app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goPlanet">
        <view class="entry-icon entry-icon-frame">
          <view class="icon-grid">
            <view class="icon-grid-cell"></view>
            <view class="icon-grid-cell"></view>
            <view class="icon-grid-cell"></view>
            <view class="icon-grid-cell"></view>
          </view>
        </view>
        <view class="entry-label">{{ TEXT.moreTitle }}</view>
      </view>
    </view>

    <BottomTab activeKey="home" />
  </view>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import { fetchSharedCountdownPlan } from '@/services/countdown.js'
import { fetchAnniversaryList } from '@/services/anniversaries.js'
import { fetchImprovementNoteList } from '@/services/improvement-notes.js'
import BottomTab from '@/pages/components/BottomTab.vue'

const TEXT = {
  brandKicker: '首页主站',
  brand: '爱意成笺',
  brandSub: '把喜欢写进每天的小日子',
  brandIcon: '✉',
  countdownKicker: '距离下次见面',
  dayUnit: '天',
  anniversaryTitle: '恋爱纪念日',
  anniversaryShort: '纪念日',
  improvementTitle: '恋爱改进簿',
  improvementShort: '改进簿',
  improvementPrefix: '本周待改进',
  improvementSuffix: '项',
  memoTitle: '今日小记',
  memoAdd: '添加',
  albumTitle: '甜蜜相册',
  moreTitle: '更多功能'
}

const DAY_MS = 24 * 60 * 60 * 1000
const { themeStyle } = useThemePage()

const countdownPlan = reactive({
  nextMeetingAt: '',
  note: '',
  place: '',
  loverName: ''
})

const anniversaryState = reactive({
  days: 0,
  label: '把纪念感好好留下来',
  meta: '日期待设置'
})

const improvementState = reactive({
  pendingCount: 0,
  activeCount: 0
})

const memoState = reactive({
  content: '记录今日的心情与点滴，让每一天都有被认真收藏。',
  meta: '今日可记录'
})

const countdownSummary = computed(() => {
  const nextDate = parseDateTime(countdownPlan.nextMeetingAt)
  if (!nextDate) {
    return {
      days: '00',
      caption: '把下一次见面的日子定下来吧'
    }
  }

  const today = startOfDay(new Date())
  const target = startOfDay(nextDate)
  const days = Math.max(0, Math.ceil((target.getTime() - today.getTime()) / DAY_MS))
  return {
    days: String(days).padStart(2, '0'),
    caption: days === 0
      ? '今天就能见到啦'
      : days <= 7
        ? '很快就能见到啦'
        : (countdownPlan.note || '一起把期待慢慢攒满')
  }
})

const anniversarySummary = computed(() => ({
  days: String(Math.max(anniversaryState.days, 0)),
  label: anniversaryState.label || '把纪念感好好留下来',
  meta: anniversaryState.meta || '日期待设置'
}))

const improvementSummary = computed(() => {
  if (improvementState.pendingCount > 0) {
    return {
      count: improvementState.pendingCount,
      tagText: '持续跟进中',
      tagClass: 'status-badge-warn'
    }
  }
  if (improvementState.activeCount > 0) {
    return {
      count: improvementState.activeCount,
      tagText: '本周有进展',
      tagClass: 'status-badge-soft'
    }
  }
  return {
    count: 0,
    tagText: '状态平稳',
    tagClass: 'status-badge-quiet'
  }
})

const memoSummary = computed(() => ({
  content: memoState.content,
  meta: memoState.meta
}))

function parseDateTime(value) {
  if (!value) return null
  const date = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date) {
  if (!date) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatMonthDay(date) {
  if (!date) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

function formatDate(date) {
  if (!date) return '日期待设置'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function loadHomeSummary() {
  try {
    const [countdown, anniversaries, notes] = await Promise.all([
      fetchSharedCountdownPlan(),
      fetchAnniversaryList('all'),
      fetchImprovementNoteList('all')
    ])

    Object.assign(countdownPlan, {
      nextMeetingAt: countdown?.nextMeetingAt || '',
      note: countdown?.note || '',
      place: countdown?.place || '',
      loverName: countdown?.loverName || ''
    })

    const anniversary = Array.isArray(anniversaries) ? anniversaries[0] : null
    if (anniversary) {
      const eventDate = parseDateTime(anniversary.eventDate || '')
      anniversaryState.days = Math.abs(Number(anniversary.dayOffset || 0))
      anniversaryState.label = String(anniversary.title || anniversary.name || '把纪念感好好留下来').trim()
      anniversaryState.meta = formatDate(eventDate)
    } else {
      anniversaryState.days = 0
      anniversaryState.label = '还没有设置纪念日'
      anniversaryState.meta = '日期待设置'
    }

    const list = Array.isArray(notes) ? notes : []
    improvementState.pendingCount = list.filter((item) => ['pending', 'improving'].includes(String(item.status || '').trim())).length
    improvementState.activeCount = list.length

    if (countdown?.note) {
      memoState.content = countdown.note
      memoState.meta = `${formatMonthDay(parseDateTime(countdown.nextMeetingAt)) || '今日'} · 关于见面的期待`
    } else if (anniversary) {
      memoState.content = String(anniversary.description || anniversary.summary || anniversary.title || '').trim() || '今天也值得留下一个温柔的小记。'
      memoState.meta = `${formatMonthDay(parseDateTime(anniversary.eventDate || '')) || '今日'} · 纪念感进行中`
    } else {
      memoState.content = '今天也值得留下一个温柔的小记。'
      memoState.meta = '今日 · 适合记录心情'
    }
  } catch (error) {
    memoState.content = '把今天的心情记下来，下一次回头看也会觉得很温柔。'
    memoState.meta = '离线展示'
  }
}

function goCountdown() { goPage('/pages/modules/countdown/index') }
function goAnniversary() { goPage('/pages/modules/anniversary/index') }
function goAlbum() { goPage('/pages/modules/album/index') }
function goImprovement() { goPage('/pages/modules/improvement/index') }
function goMemo() { goPage('/pages/modules/coming-soon/index?title=' + encodeURIComponent('今日小记')) }
function goPlanet() { goPage('/pages/planet/planet') }
function goSettings() { goPage('/pages/account/settings') }

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
    --home-accent: var(--app-color-primary);
    --home-accent-strong: var(--app-color-primary-strong);
    --home-accent-soft: var(--app-color-primary-soft);
    --home-text-main: var(--app-color-text-strong);
    --home-text-sub: var(--app-color-text);
    --home-surface: rgba(255, 255, 255, 0.96);
    --home-surface-soft: var(--app-color-surface-soft);
    --home-border: rgba(255, 255, 255, 0.72);
    --home-shadow: var(--app-shadow-card);
    --home-glow-warm: color-mix(in srgb, var(--app-color-primary-soft) 28%, #ffd9c3 72%);
    --home-glow-cool: color-mix(in srgb, var(--app-color-primary-soft) 18%, #dfead0 82%);
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top, rgba(255, 255, 255, 0.94), rgba(255, 248, 241, 0.92)),
      var(--app-page-gradient-soft);
  }

  .home-bg {
    position: absolute;
    border-radius: 50%;
    filter: blur(10rpx);
    opacity: 0.6;
  }

  .home-bg-a {
    width: 260rpx;
    height: 260rpx;
    top: 260rpx;
    right: -80rpx;
    background: var(--home-glow-warm);
  }

  .home-bg-b {
    width: 220rpx;
    height: 220rpx;
    bottom: 250rpx;
    left: -70rpx;
    background: var(--home-glow-cool);
  }

  .home-top,
  .countdown-card,
  .summary-grid,
  .memo-card,
  .entry-grid {
    position: relative;
    z-index: 2;
  }

  .home-top {
    position: relative;
    margin-top: 8rpx;
    min-height: 206rpx;
  }

  .home-brand-wrap {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: calc(100% - 120rpx);
    text-align: center;
  }

  .home-brand-kicker {
    font-size: 20rpx;
    letter-spacing: 6rpx;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--home-accent-soft) 56%, #d5c3aa 44%);
  }

  .home-brand {
    margin-top: 8rpx;
    font-size: 70rpx;
    line-height: 1.02;
    font-weight: 500;
    letter-spacing: 2rpx;
    color: var(--home-accent);
  }

  .home-brand-sub {
    margin-top: 10rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: color-mix(in srgb, var(--home-text-sub) 70%, #d1c0b1 30%);
  }

  .home-brand-line {
    margin-top: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18rpx;
    color: color-mix(in srgb, var(--home-accent-soft) 60%, #d9c3a2 40%);
  }

  .home-brand-sep {
    width: 118rpx;
    height: 2rpx;
    background: linear-gradient(90deg, rgba(219, 192, 154, 0), rgba(219, 192, 154, 0.8), rgba(219, 192, 154, 0));
  }

  .home-brand-icon-wrap {
    display: inline-flex;
    align-items: center;
    gap: 10rpx;
  }

  .home-brand-icon {
    font-size: 28rpx;
    line-height: 1;
  }

  .home-brand-leaf {
    width: 14rpx;
    height: 24rpx;
    border-radius: 14rpx 14rpx 14rpx 2rpx;
    background: linear-gradient(180deg, #c9d7b5, #a8ba8b);
    opacity: 0.86;
  }

  .home-brand-leaf-left { transform: rotate(-36deg); }
  .home-brand-leaf-right { transform: rotate(36deg) scaleX(-1); }

  .home-setting {
    position: absolute;
    top: 10rpx;
    right: 0;
    z-index: 3;
    width: 74rpx;
    height: 74rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .home-setting-active { transform: scale(0.97); }

  .home-setting-icon {
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    border: 6rpx solid color-mix(in srgb, var(--home-accent-soft) 45%, #d8c3aa 55%);
    position: relative;
    box-sizing: border-box;
  }

  .home-setting-icon::before,
  .home-setting-icon::after {
    content: '';
    position: absolute;
    inset: -14rpx;
    border-radius: 50%;
    border: 4rpx dashed color-mix(in srgb, var(--home-accent-soft) 45%, #d8c3aa 55%);
    opacity: 0.9;
  }

  .countdown-card {
    margin-top: 28rpx;
    padding: 50rpx 34rpx 46rpx;
    border-radius: 42rpx;
    text-align: center;
    background:
      radial-gradient(circle at 15% 90%, rgba(255, 224, 210, 0.34), transparent 30%),
      radial-gradient(circle at 88% 88%, rgba(232, 239, 213, 0.28), transparent 28%),
      linear-gradient(180deg, var(--home-surface), color-mix(in srgb, var(--home-surface-soft) 55%, #fff9f4 45%));
    box-shadow:
      var(--home-shadow),
      inset 0 0 0 2rpx var(--home-border);
  }

  .countdown-card::before {
    content: '';
    position: absolute;
    inset: 12rpx;
    border-radius: 34rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.86);
    pointer-events: none;
  }

  .surface-press {
    transform: translateY(2rpx) scale(0.986);
    box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.08);
  }

  .countdown-kicker {
    font-size: 28rpx;
    color: var(--home-text-sub);
    letter-spacing: 2rpx;
  }

  .countdown-main {
    margin-top: 22rpx;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 10rpx;
    color: var(--home-accent);
  }

  .countdown-days {
    font-size: 144rpx;
    line-height: 0.9;
    font-weight: 500;
    letter-spacing: 4rpx;
  }

  .countdown-unit {
    margin-bottom: 18rpx;
    font-size: 44rpx;
    line-height: 1;
    font-weight: 500;
  }

  .countdown-caption {
    margin-top: 20rpx;
    font-size: 29rpx;
    line-height: 1.8;
    color: var(--home-text-sub);
  }

  .summary-grid {
    margin-top: 24rpx;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18rpx;
  }

  .summary-card {
    position: relative;
    overflow: hidden;
    min-height: 246rpx;
    padding: 24rpx 22rpx;
    border-radius: 34rpx;
    background: linear-gradient(180deg, var(--home-surface), color-mix(in srgb, var(--home-surface-soft) 55%, #fff9f4 45%));
    box-shadow: var(--home-shadow), inset 0 0 0 2rpx var(--home-border);
  }

  .summary-title-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .summary-title-row::before,
  .summary-title-row::after {
    content: '';
    height: 2rpx;
    flex: 1;
    background: linear-gradient(90deg, rgba(217, 196, 168, 0), rgba(217, 196, 168, 0.9), rgba(217, 196, 168, 0));
  }

  .summary-title {
    flex-shrink: 0;
    font-size: 26rpx;
    color: var(--home-text-main);
    font-weight: 600;
  }

  .summary-main {
    margin-top: 22rpx;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 8rpx;
    color: var(--home-accent);
  }

  .summary-number {
    font-size: 82rpx;
    line-height: 0.92;
    font-weight: 500;
  }

  .summary-unit {
    margin-bottom: 12rpx;
    font-size: 30rpx;
  }

  .summary-desc {
    margin-top: 10rpx;
    text-align: center;
    font-size: 27rpx;
    line-height: 1.5;
    color: var(--home-text-sub);
  }

  .summary-meta {
    margin-top: 8rpx;
    text-align: center;
    font-size: 22rpx;
    line-height: 1.5;
    color: color-mix(in srgb, var(--home-text-sub) 70%, #cfbeab 30%);
  }

  .summary-progress-row {
    margin-top: 48rpx;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 10rpx;
    flex-wrap: wrap;
    color: var(--home-text-sub);
  }

  .summary-inline-label {
    font-size: 27rpx;
    line-height: 1.6;
  }

  .summary-inline-number {
    font-size: 72rpx;
    line-height: 0.92;
    color: var(--home-accent);
    font-weight: 500;
  }

  .status-badge {
    margin: 16rpx auto 0;
    min-width: 144rpx;
    padding: 10rpx 16rpx;
    border-radius: 999rpx;
    text-align: center;
    font-size: 21rpx;
    font-weight: 700;
    box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.45);
  }

  .status-badge-warn {
    background: color-mix(in srgb, var(--home-accent-soft) 18%, #fff4ea 82%);
    color: var(--home-accent-strong);
  }

  .status-badge-soft {
    background: color-mix(in srgb, var(--home-accent-soft) 22%, #fff4f6 78%);
    color: var(--home-accent-strong);
  }

  .status-badge-quiet {
    background: #f7f4ee;
    color: var(--home-text-sub);
  }

  .summary-deco {
    position: absolute;
    pointer-events: none;
    opacity: 0.8;
  }

  .summary-deco-flower {
    right: 22rpx;
    bottom: 16rpx;
    width: 100rpx;
    height: 120rpx;
    background:
      radial-gradient(circle at 24% 34%, #f0c6b4 0 10rpx, transparent 11rpx),
      radial-gradient(circle at 52% 16%, #f5d0c1 0 12rpx, transparent 13rpx),
      radial-gradient(circle at 78% 36%, #eec1aa 0 10rpx, transparent 11rpx),
      linear-gradient(180deg, transparent 0 54%, #a5b27b 54% 56%, transparent 56%),
      linear-gradient(165deg, transparent 0 58%, #a5b27b 58% 60%, transparent 60%);
  }

  .summary-deco-wave {
    right: -18rpx;
    bottom: -8rpx;
    width: 220rpx;
    height: 110rpx;
    background:
      radial-gradient(circle at 80% 80%, rgba(210, 224, 181, 0.72), transparent 38%),
      linear-gradient(180deg, transparent 0%, rgba(239, 240, 223, 0.65) 70%, rgba(227, 236, 205, 0.92) 100%);
    border-top-left-radius: 110rpx;
  }

  .memo-card {
    margin-top: 24rpx;
    padding: 24rpx;
    border-radius: 34rpx;
    background: linear-gradient(180deg, var(--home-surface), color-mix(in srgb, var(--home-surface-soft) 55%, #fff9f4 45%));
    box-shadow: var(--home-shadow), inset 0 0 0 2rpx var(--home-border);
  }

  .memo-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .memo-title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--home-text-main);
  }

  .memo-add {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8rpx 20rpx rgba(223, 203, 172, 0.16);
    color: var(--home-accent);
  }

  .memo-add-active { transform: scale(0.97); }
  .memo-add-plus { font-size: 34rpx; line-height: 1; font-weight: 400; }
  .memo-add-text { font-size: 27rpx; line-height: 1; font-weight: 600; }

  .memo-content {
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 2rpx solid rgba(233, 223, 205, 0.9);
    font-size: 30rpx;
    line-height: 1.8;
    color: color-mix(in srgb, var(--home-text-sub) 68%, #cbbfb5 32%);
  }

  .memo-meta {
    margin-top: 14rpx;
    font-size: 22rpx;
    color: var(--home-accent);
  }

  .entry-grid {
    margin-top: 24rpx;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18rpx;
  }

  .entry-card {
    min-height: 184rpx;
    padding: 24rpx 22rpx 20rpx;
    border-radius: 34rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14rpx;
    background:
      radial-gradient(circle at 25% 92%, rgba(255, 231, 217, 0.3), transparent 26%),
      radial-gradient(circle at 82% 88%, rgba(228, 236, 208, 0.25), transparent 22%),
      linear-gradient(180deg, var(--home-surface), color-mix(in srgb, var(--home-surface-soft) 55%, #fff9f4 45%));
    box-shadow: var(--home-shadow), inset 0 0 0 2rpx var(--home-border);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .entry-card-more { opacity: 0.92; }

  .entry-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .entry-icon-frame {
    width: 110rpx;
    height: 88rpx;
    position: relative;
  }

  .entry-label {
    font-size: 29rpx;
    line-height: 1.4;
    font-weight: 600;
    color: var(--home-text-main);
  }

  .icon-album {
    position: relative;
    width: 96rpx;
    height: 74rpx;
  }

  .icon-album-back,
  .icon-album-front {
    position: absolute;
    border-radius: 12rpx;
    background: #fff9ef;
    box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.06);
  }

  .icon-album-back {
    width: 64rpx;
    height: 52rpx;
    right: 6rpx;
    top: 12rpx;
    background: rgba(236, 224, 207, 0.7);
    transform: rotate(8deg);
  }

  .icon-album-front {
    width: 72rpx;
    height: 56rpx;
    left: 8rpx;
    top: 6rpx;
    overflow: hidden;
  }

  .icon-album-sun {
    position: absolute;
    top: 10rpx;
    left: 12rpx;
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: #f1dcc3;
  }

  .icon-album-mountain {
    position: absolute;
    bottom: 8rpx;
    border-bottom: 26rpx solid #b7c29b;
    border-left: 16rpx solid transparent;
    border-right: 16rpx solid transparent;
  }

  .icon-album-mountain-left { left: 8rpx; }
  .icon-album-mountain-right { right: 8rpx; border-bottom-color: #94a56f; }

  .icon-album-flower {
    position: absolute;
    right: 2rpx;
    bottom: 0;
    width: 22rpx;
    height: 22rpx;
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 30%, #fff7ef 0 5rpx, transparent 6rpx),
      radial-gradient(circle at 30% 60%, #f0d7c7 0 6rpx, transparent 7rpx),
      radial-gradient(circle at 70% 60%, #f0d7c7 0 6rpx, transparent 7rpx),
      radial-gradient(circle at 50% 80%, #f0d7c7 0 6rpx, transparent 7rpx);
  }

  .icon-calendar {
    position: relative;
    width: 82rpx;
    height: 74rpx;
    border-radius: 16rpx;
    background: #fffaf3;
    box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .icon-calendar-top {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 22rpx;
    background: linear-gradient(180deg, #d8b779, #e7c998);
  }

  .icon-calendar-ring {
    position: absolute;
    top: -4rpx;
    width: 8rpx;
    height: 18rpx;
    border-radius: 999rpx;
    background: #f5efe4;
    box-shadow: 0 0 0 2rpx rgba(210, 186, 150, 0.45);
    z-index: 2;
  }

  .icon-calendar-ring-left { left: 18rpx; }
  .icon-calendar-ring-right { right: 18rpx; }

  .icon-calendar-heart {
    position: absolute;
    top: 28rpx;
    left: 31rpx;
    width: 20rpx;
    height: 18rpx;
    transform: rotate(-45deg);
    background: #e7a08f;
  }

  .icon-calendar-heart::before,
  .icon-calendar-heart::after {
    content: '';
    position: absolute;
    width: 20rpx;
    height: 18rpx;
    border-radius: 50%;
    background: #e7a08f;
  }

  .icon-calendar-heart::before { top: -10rpx; left: 0; }
  .icon-calendar-heart::after { left: 10rpx; top: 0; }

  .icon-calendar-dot {
    position: absolute;
    width: 6rpx;
    height: 6rpx;
    border-radius: 50%;
    background: rgba(211, 193, 168, 0.8);
  }

  .icon-calendar-dot-a { left: 16rpx; bottom: 18rpx; }
  .icon-calendar-dot-b { left: 28rpx; bottom: 18rpx; }
  .icon-calendar-dot-c { right: 28rpx; bottom: 18rpx; }
  .icon-calendar-dot-d { right: 16rpx; bottom: 18rpx; }

  .icon-book {
    position: relative;
    width: 92rpx;
    height: 72rpx;
  }

  .icon-book-cover {
    position: absolute;
    top: 10rpx;
    width: 36rpx;
    height: 48rpx;
    border-radius: 8rpx;
  }

  .icon-book-cover-left { left: 10rpx; background: #aebc94; transform: skewY(-8deg); }
  .icon-book-cover-right { right: 10rpx; background: #f4ead8; transform: skewY(8deg); }

  .icon-book-page {
    position: absolute;
    left: 26rpx;
    right: 26rpx;
    top: 6rpx;
    bottom: 10rpx;
    border-radius: 6rpx;
    background: #fffaf2;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .icon-book-line {
    position: absolute;
    left: 34rpx;
    right: 36rpx;
    height: 3rpx;
    border-radius: 999rpx;
    background: rgba(206, 189, 163, 0.82);
  }

  .icon-book-line-a { top: 24rpx; }
  .icon-book-line-b { top: 34rpx; }

  .icon-book-pen {
    position: absolute;
    right: 6rpx;
    bottom: 8rpx;
    width: 34rpx;
    height: 10rpx;
    border-radius: 999rpx;
    background: linear-gradient(90deg, #d4ae67, #c8954f);
    transform: rotate(-34deg);
  }

  .icon-book-pen::after {
    content: '';
    position: absolute;
    right: -8rpx;
    top: 0;
    border-left: 10rpx solid #d9c4a8;
    border-top: 5rpx solid transparent;
    border-bottom: 5rpx solid transparent;
  }

  .icon-grid {
    width: 68rpx;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10rpx;
  }

  .icon-grid-cell {
    width: 28rpx;
    height: 28rpx;
    border-radius: 8rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 241, 232, 0.98));
    box-shadow: inset 0 0 0 2rpx rgba(230, 218, 199, 0.96);
  }

  @media screen and (max-width: 520px) {
    .countdown-days { font-size: 128rpx; }
  }
</style>
