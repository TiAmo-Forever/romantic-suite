<template>
  <view class="page app-page-shell admin-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="admin-glow admin-glow-a"></view>
    <view class="admin-glow admin-glow-b"></view>

    <view class="admin-hero app-fade-up">
      <view class="admin-kicker">爱意成笺</view>
      <view class="admin-title">把重要的信息安静地放在这里</view>
      <view class="admin-desc">可以先看看两个人的基础资料、见面安排和重要日子。</view>
      <view class="admin-chip-row">
        <view class="admin-chip">基础资料</view>
        <view class="admin-chip">见面倒计时</view>
        <view class="admin-chip">纪念日摘要</view>
      </view>
    </view>

    <view class="admin-panel app-card-soft app-fade-up app-delay-1" hover-class="surface-press" hover-stay-time="70" @click="openCouplePage">
      <view class="panel-head">
        <view class="panel-title">情侣基础信息</view>
        <view class="panel-tag">查看详情</view>
      </view>
      <view class="profile-grid">
        <view v-for="item in profileList" :key="item.username || item.nickname" class="profile-card">
          <view class="profile-avatar">{{ resolveAvatarText(item.nickname) }}</view>
          <view class="profile-name">{{ item.nickname || '未设置昵称' }}</view>
          <view class="profile-city">{{ item.city || '未设置城市' }}</view>
        </view>
      </view>
      <view class="couple-meta">
        <view class="couple-meta-item">
          <view class="couple-meta-label">恋爱纪念日</view>
          <view class="couple-meta-value">{{ overview.anniversaryDate || '待设置' }}</view>
        </view>
        <view class="couple-meta-item">
          <view class="couple-meta-label">相恋天数</view>
          <view class="couple-meta-value">{{ overview.togetherDays || 0 }} 天</view>
        </view>
      </view>
    </view>

    <view class="admin-panel app-card-soft app-fade-up app-delay-2" hover-class="surface-press" hover-stay-time="70" @click="openCountdownPage">
      <view class="panel-head">
        <view class="panel-title">见面倒计时</view>
        <view class="panel-tag">查看详情</view>
      </view>
      <view class="countdown-days">{{ countdownValue }}</view>
      <view class="countdown-copy">{{ countdownCopy }}</view>
      <view class="countdown-meta">
        <view class="countdown-meta-row">
          <text class="countdown-meta-label">下次见面</text>
          <text class="countdown-meta-value">{{ overview.countdown?.nextMeetingAt || '待设置' }}</text>
        </view>
        <view class="countdown-meta-row">
          <text class="countdown-meta-label">上次见面</text>
          <text class="countdown-meta-value">{{ overview.countdown?.lastMeetingAt || '待设置' }}</text>
        </view>
        <view class="countdown-meta-row">
          <text class="countdown-meta-label">见面地点</text>
          <text class="countdown-meta-value">{{ overview.countdown?.place || '待设置' }}</text>
        </view>
      </view>
    </view>

    <view class="admin-panel app-card-soft app-fade-up app-delay-3" hover-class="surface-press" hover-stay-time="70" @click="openAnniversaryPage">
      <view class="panel-head">
        <view class="panel-title">纪念日摘要</view>
        <view class="panel-tag">查看详情</view>
      </view>
      <view class="anniversary-title">{{ overview.anniversary?.title || '还没有可展示的纪念日' }}</view>
      <view class="anniversary-date">{{ overview.anniversary?.eventDate || '待设置' }}</view>
      <view class="anniversary-offset">{{ anniversaryOffsetText }}</view>
    </view>

    <button class="admin-logout" @click="handleLogout">退出登录</button>
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { logout, requireAuth, isAdminUser } from '@/utils/auth.js'
import { goPage, relaunchPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import { fetchAdminOverview } from '@/services/admin.js'

const { themeStyle } = useThemePage()

const overview = reactive({
  accessNotice: '',
  anniversaryDate: '',
  togetherDays: 0,
  profileList: [],
  countdown: null,
  anniversary: null
})

const profileList = computed(() => Array.isArray(overview.profileList) ? overview.profileList : [])

const countdownValue = computed(() => {
  const raw = Number(overview.countdown?.daysUntilNextMeeting || 0)
  if (raw < 0) {
    return '已过期'
  }
  return `${raw} 天`
})

const countdownCopy = computed(() => {
  if (!overview.countdown?.nextMeetingAt) {
    return '还没有公开的见面安排。'
  }
  const raw = Number(overview.countdown?.daysUntilNextMeeting || 0)
  if (raw < 0) {
    return '当前展示的是一条已经过去的见面安排。'
  }
  if (raw === 0) {
    return '今天就是见面的日子。'
  }
  return `距离这次见面还有 ${raw} 天。`
})

const anniversaryOffsetText = computed(() => {
  const title = overview.anniversary?.title
  if (!title) {
    return '这里还没有可以展示的重要日子。'
  }
  const offset = Number(overview.anniversary?.dayOffset || 0)
  if (offset === 0) {
    return '今天就是这个纪念日。'
  }
  if (offset > 0) {
    return `距离这一天还有 ${offset} 天。`
  }
  return `这一天已经过去 ${Math.abs(offset)} 天。`
})

function resolveAvatarText(name) {
  const safe = String(name || '').trim()
  return safe ? safe.slice(0, 1) : '爱'
}

function openCouplePage() {
  goPage('/pages/admin/couple')
}

function openCountdownPage() {
  goPage('/pages/admin/countdown')
}

function openAnniversaryPage() {
  goPage('/pages/admin/anniversary-index')
}

async function loadOverview() {
  const payload = await fetchAdminOverview()
  overview.accessNotice = payload?.accessNotice || ''
  overview.anniversaryDate = payload?.anniversaryDate || ''
  overview.togetherDays = Number(payload?.togetherDays || 0)
  overview.profileList = Array.isArray(payload?.profileList) ? payload.profileList : []
  overview.countdown = payload?.countdown || null
  overview.anniversary = payload?.anniversary || null
}

async function handleLogout() {
  await logout()
  relaunchPage('/pages/login/login')
}

onShow(() => {
  if (!requireAuth()) {
    return
  }
  if (!isAdminUser()) {
    relaunchPage('/pages/home/home')
    return
  }
  loadOverview().catch((error) => {
    uni.showToast({
      title: error?.message || '加载失败',
      icon: 'none'
    })
  })
})
</script>

<style scoped>
  .admin-page {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top, rgba(255, 255, 255, 0.94), rgba(255, 248, 241, 0.9)),
      var(--app-page-gradient-soft);
  }

  .admin-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(10rpx);
    opacity: 0.58;
  }

  .admin-glow-a {
    width: 260rpx;
    height: 260rpx;
    top: 180rpx;
    right: -70rpx;
    background: rgba(255, 219, 199, 0.68);
  }

  .admin-glow-b {
    width: 220rpx;
    height: 220rpx;
    left: -80rpx;
    bottom: 240rpx;
    background: rgba(213, 227, 193, 0.62);
  }

  .admin-hero,
  .admin-panel,
  .admin-logout {
    position: relative;
    z-index: 2;
  }

  .admin-hero {
    padding: 26rpx 30rpx;
    border-radius: 36rpx;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: var(--app-shadow-card);
  }

  .admin-kicker {
    font-size: 22rpx;
    letter-spacing: 6rpx;
    color: var(--app-color-primary-strong);
  }

  .admin-title {
    margin-top: 10rpx;
    font-size: 42rpx;
    line-height: 1.3;
    color: var(--app-color-text-strong);
    font-weight: 600;
  }

  .admin-desc {
    margin-top: 14rpx;
    font-size: 25rpx;
    line-height: 1.8;
    color: var(--app-color-text);
  }

  .admin-chip-row {
    margin-top: 18rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
  }

  .admin-chip {
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
  }

  .admin-chip {
    background: rgba(255, 242, 235, 0.95);
    color: var(--app-color-primary-strong);
  }

  .admin-panel {
    margin-top: 22rpx;
    padding: 28rpx;
    border-radius: 34rpx;
  }

  .surface-press {
    transform: translateY(2rpx) scale(0.986);
    box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.08);
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .panel-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--app-color-text-strong);
  }

  .panel-tag {
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: rgba(255, 241, 232, 0.96);
    color: var(--app-color-primary-strong);
    font-size: 20rpx;
    font-weight: 700;
  }

  .profile-grid {
    margin-top: 22rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
  }

  .profile-card {
    padding: 24rpx 18rpx;
    border-radius: 28rpx;
    background: rgba(255, 255, 255, 0.95);
    text-align: center;
    box-shadow: inset 0 0 0 2rpx rgba(244, 232, 220, 0.88);
  }

  .profile-avatar {
    width: 72rpx;
    height: 72rpx;
    margin: 0 auto;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #f7d8b5, #ebc28e);
    color: #8d6037;
    font-size: 32rpx;
    font-weight: 700;
  }

  .profile-name {
    margin-top: 16rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: var(--app-color-text-strong);
  }

  .profile-city {
    margin-top: 8rpx;
    font-size: 23rpx;
    color: var(--app-color-text);
  }

  .couple-meta,
  .countdown-meta {
    margin-top: 22rpx;
    display: flex;
    flex-direction: column;
    gap: 14rpx;
  }

  .couple-meta-item,
  .countdown-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .couple-meta-label,
  .countdown-meta-label {
    font-size: 24rpx;
    color: var(--app-color-text);
  }

  .couple-meta-value,
  .countdown-meta-value {
    font-size: 25rpx;
    color: var(--app-color-text-strong);
    font-weight: 600;
    text-align: right;
  }

  .countdown-days {
    margin-top: 24rpx;
    font-size: 74rpx;
    line-height: 1;
    color: var(--app-color-primary);
    font-weight: 600;
  }

  .countdown-copy {
    margin-top: 12rpx;
    font-size: 25rpx;
    line-height: 1.7;
    color: var(--app-color-text);
  }

  .anniversary-title {
    margin-top: 22rpx;
    font-size: 34rpx;
    line-height: 1.5;
    color: var(--app-color-text-strong);
    font-weight: 600;
  }

  .anniversary-date {
    margin-top: 12rpx;
    font-size: 26rpx;
    color: var(--app-color-primary-strong);
  }

  .anniversary-offset {
    margin-top: 14rpx;
    font-size: 24rpx;
    line-height: 1.7;
    color: var(--app-color-text);
  }

  .admin-logout {
    margin-top: 28rpx;
    height: 88rpx;
    line-height: 88rpx;
    border: none;
    border-radius: 999rpx;
    background: linear-gradient(180deg, #f1cc86 0%, #dca24c 100%);
    color: #fffdf7;
    font-size: 30rpx;
    font-weight: 700;
    letter-spacing: 6rpx;
    box-shadow: 0 16rpx 28rpx rgba(214, 161, 82, 0.22);
  }

  .admin-logout::after {
    border: none;
  }
</style>
