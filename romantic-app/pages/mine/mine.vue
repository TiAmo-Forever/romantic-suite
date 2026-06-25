<template>
  <view class="page app-page-shell app-page-shell-tabbed mine-page" :style="themeStyle">
    <GlobalNotificationBanner />

    <view class="mine-bg mine-bg-a"></view>
    <view class="mine-bg mine-bg-b"></view>

    <view class="mine-header app-fade-up">
      <view class="mine-back shell-btn" @click="goHome">
        <text class="shell-btn-icon">‹</text>
      </view>
      <view class="mine-header-title">{{ TEXT.pageTitle }}</view>
      <view class="mine-header-placeholder"></view>
    </view>

    <view class="mine-hero app-fade-up app-delay-1">
      <view class="mine-hero-glow mine-hero-glow-a"></view>
      <view class="mine-hero-glow mine-hero-glow-b"></view>
      <view class="mine-hero-badge">Our Story</view>
      <view class="mine-avatar-pair">
        <view class="mine-avatar-shell mine-avatar-shell-main" @click="goAvatarSettings">
          <image v-if="isImageAvatar" class="mine-avatar-image" :src="avatarImageUrl" mode="aspectFill"></image>
          <view v-else class="mine-avatar-text">{{ avatarDisplay }}</view>
        </view>
        <view class="mine-avatar-bridge" aria-hidden="true">
          <view class="mine-avatar-bridge-core">♥</view>
        </view>
        <view class="mine-avatar-shell mine-avatar-shell-partner">
          <image v-if="partnerIsImageAvatar" class="mine-avatar-image" :src="partnerAvatarImageUrl" mode="aspectFill"></image>
          <view v-else class="mine-avatar-partner-text">{{ loverAvatarDisplay }}</view>
        </view>
      </view>
      <view class="mine-avatar-tip">点击左侧头像修改</view>
      <view class="mine-name">{{ coupleTitle }}</view>
      <view class="mine-days">{{ togetherDaysText }}</view>
      <view class="mine-intro">{{ coupleMoodLine }}</view>
    </view>

    <view class="mine-feature-stack app-fade-up app-delay-2">
      <view class="mine-feature-card profile-card-surface" hover-class="surface-press" hover-stay-time="70" @click="goAccountSettings">
        <view class="mine-feature-watermark">person</view>
        <view class="mine-feature-head">
          <view class="mine-feature-icon accent-profile">
            <image class="mine-feature-icon-svg" :src="iconProfile" mode="aspectFit"></image>
          </view>
          <view class="mine-feature-title">{{ TEXT.profileTitle }}</view>
        </view>
        <view class="mine-feature-kicker">{{ TEXT.profileKicker }}</view>
        <view class="mine-feature-summary">{{ profileSummary }}</view>
        <view class="mine-feature-action">{{ TEXT.profileAction }}</view>
      </view>

      <view class="mine-feature-card relationship-card-surface" hover-class="surface-press" hover-stay-time="70" @click="goRelationshipSettings">
        <view class="mine-feature-watermark">favorite</view>
        <view class="mine-feature-head">
          <view class="mine-feature-icon accent-relationship">
            <image class="mine-feature-icon-svg" :src="iconRelationship" mode="aspectFit"></image>
          </view>
          <view class="mine-feature-title">{{ TEXT.relationshipTitle }}</view>
        </view>
        <view class="mine-feature-kicker">{{ relationshipTag }}</view>
        <view class="mine-feature-summary">{{ relationshipSummary }}</view>
        <view class="mine-feature-action">{{ TEXT.relationshipAction }}</view>
      </view>
    </view>

    <view class="mine-menu-stack app-fade-up app-delay-3">
      <view class="mine-list-card" hover-class="surface-press" hover-stay-time="70" @click="goSecuritySettings">
        <view class="mine-list-icon">
          <image class="mine-list-icon-svg" :src="iconSecurity" mode="aspectFit"></image>
        </view>
        <view class="mine-list-copy">
          <view class="mine-list-title">{{ TEXT.securityTitle }}</view>
          <view class="mine-list-desc">{{ securitySummary }}</view>
        </view>
        <view class="mine-list-arrow"></view>
      </view>

      <view class="mine-list-card" hover-class="surface-press" hover-stay-time="70" @click="goDataSettings">
        <view class="mine-list-icon">
          <image class="mine-list-icon-svg" :src="iconData" mode="aspectFit"></image>
        </view>
        <view class="mine-list-copy">
          <view class="mine-list-title">{{ TEXT.dataTitle }}</view>
          <view class="mine-list-desc">{{ TEXT.dataDesc }}</view>
        </view>
        <view class="mine-list-arrow"></view>
      </view>

      <view class="mine-list-card" hover-class="surface-press" hover-stay-time="70" @click="goNotifications">
        <view class="mine-list-icon mine-list-icon-dot">
          <image class="mine-list-icon-svg" :src="iconNotification" mode="aspectFit"></image>
          <view v-if="unreadNotificationCount > 0" class="mine-list-dot"></view>
        </view>
        <view class="mine-list-copy">
          <view class="mine-list-title">{{ TEXT.messageTitle }}</view>
          <view class="mine-list-desc">{{ notificationSummaryText }}</view>
        </view>
        <view class="mine-list-side">
          <view class="mine-list-status" :class="unreadNotificationCount > 0 ? 'active' : ''">
            {{ unreadNotificationCount > 0 ? `${unreadNotificationCount} 条新提醒` : TEXT.readAll }}
          </view>
          <view class="mine-list-arrow"></view>
        </view>
      </view>

      <view class="mine-list-card" hover-class="surface-press" hover-stay-time="70" @click="goThemeSettings">
        <view class="mine-list-icon">
          <image class="mine-list-icon-svg" :src="iconTheme" mode="aspectFit"></image>
        </view>
        <view class="mine-list-copy">
          <view class="mine-list-title">{{ TEXT.themeTitle }}</view>
          <view class="mine-list-desc">{{ currentTheme.name }}</view>
        </view>
        <view class="mine-list-arrow"></view>
      </view>
    </view>

    <view class="mine-logout-shell app-fade-up app-delay-4">
      <button class="mine-logout-btn" @click="handleLogout">{{ TEXT.logoutTitle }}</button>
    </view>

    <view class="mine-footer app-fade-up app-delay-4">
      <view class="mine-footer-copy">{{ TEXT.footerCopy }}</view>
      <view class="mine-footer-dots">
        <text class="mine-footer-dot active"></text>
        <text class="mine-footer-dot"></text>
        <text class="mine-footer-dot"></text>
      </view>
    </view>

    <BottomTab activeKey="mine" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { getUser, requireAuth, logout } from '@/utils/auth.js'
import { resolveAvatarUrl } from '@/utils/avatar.js'
import { getAvatarPresetMap, getProfile } from '@/utils/profile.js'
import { fetchLatestNotification, fetchUnreadNotificationCount } from '@/services/notifications.js'
import { fetchPartnerProfile, fetchRemoteProfile } from '@/services/profile.js'
import iconData from '@/assets/icons/icon-data-outline.svg'
import iconNotification from '@/assets/icons/icon-notification-outline.svg'
import iconProfile from '@/assets/icons/icon-profile-outline.svg'
import iconRelationship from '@/assets/icons/icon-relationship-outline.svg'
import iconSecurity from '@/assets/icons/icon-security-outline.svg'
import iconTheme from '@/assets/icons/icon-theme-outline.svg'
import { goPage } from '@/utils/nav.js'
import { syncNotificationUnreadCount } from '@/utils/notification-indicator.js'
import { subscribeNotificationSocket } from '@/utils/notification-socket.js'
import { getCurrentThemePreset, getThemeSettings } from '@/utils/theme.js'
import { useThemePage } from '@/utils/useThemePage.js'
import BottomTab from '@/pages/components/BottomTab.vue'

const TEXT = {
  pageTitle: '我的设置',
  defaultName: '浪漫用户',
  defaultIntro: '个人资料与关系设置',
  cityFallback: '城市未设置',
  loverFallback: 'TA',
  profileTitle: '我的资料',
  profileKicker: '预览',
  profileAction: '编辑详情',
  relationshipTitle: '关系信息',
  relationshipAction: '查看契约',
  securityTitle: '账号安全',
  dataTitle: '数据管理',
  dataDesc: '备份、导出、同步',
  messageTitle: '通知提醒',
  themeTitle: '主题外观',
  messageEmptyDesc: '暂无提醒',
  readAll: '已查看',
  logoutTitle: '退出当前登录',
  footerCopy: '管理个人资料、关系信息与账号设置'
}

const { themeStyle } = useThemePage()
const user = ref(null)
const profile = ref(getProfile())
const partnerProfile = ref(null)
const avatarPresetMap = getAvatarPresetMap()
const currentTheme = ref(getCurrentThemePreset(getThemeSettings()))
const unreadNotificationCount = ref(0)
const latestNotification = ref(null)
let unsubscribeNotificationSocket = null

const isImageAvatar = computed(() => profile.value.avatarType === 'upload' && !!profile.value.avatarImage)
const avatarImageUrl = computed(() => resolveAvatarUrl(profile.value.avatarImage))
const partnerIsImageAvatar = computed(() => partnerProfile.value?.avatarType === 'upload' && !!partnerProfile.value?.avatarImage)
const partnerAvatarImageUrl = computed(() => resolveAvatarUrl(partnerProfile.value?.avatarImage || ''))
const avatarDisplay = computed(() => {
  if (profile.value.avatarType === 'preset') {
    return avatarPresetMap[profile.value.avatarPreset] || '爱'
  }
  return String(profile.value.avatarText || '').trim() || '爱'
})
const loverDisplay = computed(() => profile.value.loverNickname || TEXT.loverFallback)
const loverAvatarDisplay = computed(() => {
  if (partnerProfile.value) {
    if (partnerProfile.value.avatarType === 'preset') {
      return avatarPresetMap[partnerProfile.value.avatarPreset] || '爱'
    }
    const partnerAvatarText = String(partnerProfile.value.avatarText || '').trim()
    if (partnerAvatarText) return partnerAvatarText.slice(0, 2)
  }

  const raw = String(partnerProfile.value?.nickname || '').trim() || String(profile.value.loverNickname || '').trim()
  if (!raw) return '♥'
  if (/^[A-Za-z]{2,}$/.test(raw)) return raw.slice(0, 1).toUpperCase()
  return raw.slice(0, 1)
})
const partnerCallDisplay = computed(() => partnerProfile.value?.loverNickname || partnerProfile.value?.nickname || 'TA')
const coupleTitle = computed(() => `${loverDisplay.value} × ${partnerCallDisplay.value}`)
const togetherDaysText = computed(() => {
  const startDate = parseDateOnly(profile.value.anniversaryDate)
  if (!startDate) return '纪念日待设置'

  const today = startOfDay(new Date())
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / DAY_MS)
  if (diffDays >= 0) return `已经一起 ${diffDays + 1} 天`
  return `距离我们的纪念开始还有 ${Math.abs(diffDays)} 天`
})
const coupleMoodLine = computed(() => {
  const bio = String(profile.value.bio || '').trim()
  if (bio && bio.length <= 20) return bio
  return '资料待完善'
})
const anniversaryDisplay = computed(() => profile.value.anniversaryDate || '纪念日未设置')
const relationshipTag = computed(() => profile.value.loverNickname || '点滴')
const profileSummary = computed(() => {
  const parts = []
  if (profile.value.city) parts.push(`坐标：${profile.value.city}`)
  if (profile.value.bio) parts.push(profile.value.bio)
  return parts.join(' · ') || '城市未设置'
})
const relationshipSummary = computed(() => {
  const parts = []
  if (profile.value.defaultMeetingPlace) parts.push(`相遇：${profile.value.defaultMeetingPlace}`)
  parts.push(`纪念日：${anniversaryDisplay.value}`)
  return parts.join(' · ')
})
const securitySummary = computed(() => {
  const passwordLength = Math.max(String(profile.value.password || '').length, 4)
  return `密码、验证与设备管理 · ${'•'.repeat(passwordLength)}`
})
const notificationSummaryText = computed(() => {
  const title = String(latestNotification.value?.title || '').trim()
  const content = String(latestNotification.value?.content || '').trim()
  if (title && content) return `${title} · ${content}`
  return title || content || TEXT.messageEmptyDesc
})

const DAY_MS = 24 * 60 * 60 * 1000

function goHome() {
  goPage('/pages/home/home')
}

function goAccountSettings() {
  goPage('/pages/account/profile')
}

function goAvatarSettings() {
  goPage('/pages/account/avatar')
}

function goRelationshipSettings() {
  goPage('/pages/account/relationship')
}

function goSecuritySettings() {
  goPage('/pages/account/security')
}

function goDataSettings() {
  goPage('/pages/account/data')
}

function goThemeSettings() {
  goPage('/pages/theme/index')
}

function goNotifications() {
  goPage('/pages/modules/notifications/index')
}

async function handleLogout() {
  await logout()
  uni.reLaunch({ url: '/pages/login/login' })
}

async function syncProfileFromServer() {
  try {
    profile.value = await fetchRemoteProfile()
  } catch (error) {
    profile.value = getProfile()
  }
}

async function syncPartnerProfileFromServer() {
  try {
    partnerProfile.value = await fetchPartnerProfile()
  } catch (error) {
    partnerProfile.value = null
  }
}

async function loadUnreadNotificationCount() {
  try {
    unreadNotificationCount.value = Number(await fetchUnreadNotificationCount())
    syncNotificationUnreadCount(unreadNotificationCount.value)
  } catch (error) {
    unreadNotificationCount.value = 0
    syncNotificationUnreadCount(0)
  }
}

async function loadLatestNotification() {
  try {
    latestNotification.value = await fetchLatestNotification()
  } catch (error) {
    latestNotification.value = null
  }
}

function applyRealtimeNotificationEvent(event) {
  unreadNotificationCount.value = Number(event?.unreadCount || 0)
  syncNotificationUnreadCount(unreadNotificationCount.value)
  latestNotification.value = event?.latestNotification || null
}

function parseDateOnly(value) {
  if (!value) return null
  const date = new Date(`${String(value).trim()}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date) {
  const current = new Date(date)
  current.setHours(0, 0, 0, 0)
  return current
}

onShow(async () => {
  if (!requireAuth()) return
  if (!unsubscribeNotificationSocket) {
    unsubscribeNotificationSocket = subscribeNotificationSocket(applyRealtimeNotificationEvent)
  }
  user.value = getUser()
  await Promise.all([
    syncProfileFromServer(),
    syncPartnerProfileFromServer(),
    loadUnreadNotificationCount(),
    loadLatestNotification()
  ])
  currentTheme.value = getCurrentThemePreset(getThemeSettings())
})

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
.mine-page {
  --mine-surface: rgba(255, 255, 255, 0.92);
  --mine-surface-soft: rgba(255, 255, 255, 0.78);
  --mine-stroke: rgba(255, 255, 255, 0.62);
  --mine-text-main: var(--app-color-text-strong);
  --mine-text-sub: var(--app-color-text);
  position: relative;
  overflow: hidden;
  background: var(--app-page-gradient-main);
}

.mine-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(12rpx);
  opacity: 0.68;
}

.mine-bg-a {
  width: 240rpx;
  height: 240rpx;
  top: 180rpx;
  right: -70rpx;
  background: color-mix(in srgb, var(--app-page-glow-strong) 64%, #fff2f6 36%);
}

.mine-bg-b {
  width: 220rpx;
  height: 220rpx;
  left: -80rpx;
  bottom: 280rpx;
  background: color-mix(in srgb, var(--app-page-glow-mid) 58%, #fff8fb 42%);
}

.mine-header,
.mine-hero,
.mine-feature-grid,
.mine-menu-stack,
.mine-logout-shell,
.mine-footer {
  position: relative;
  z-index: 2;
}

.mine-header {
  display: grid;
  grid-template-columns: 76rpx 1fr 76rpx;
  align-items: center;
  margin-top: 8rpx;
}

.shell-btn,
.mine-header-placeholder {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
}

.shell-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 10rpx 24rpx rgba(255, 128, 160, 0.1);
}

.shell-btn-icon {
  font-size: 40rpx;
  line-height: 1;
  color: var(--app-color-primary);
  margin-top: -4rpx;
}

.mine-header-title {
  text-align: center;
  font-size: 40rpx;
  font-weight: 600;
  color: var(--app-color-primary);
  letter-spacing: 2rpx;
}

.mine-hero {
  margin-top: 24rpx;
  padding: 34rpx 28rpx 36rpx;
  border-radius: 42rpx;
  background:
    radial-gradient(circle at top center, rgba(255, 255, 255, 0.74), transparent 46%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(255, 249, 251, 0.94));
  box-shadow: var(--app-shadow-card);
  text-align: center;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.62);
}

.mine-hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(18rpx);
}

.mine-hero-glow-a {
  width: 220rpx;
  height: 220rpx;
  top: -56rpx;
  right: -44rpx;
  background: rgba(128, 232, 221, 0.18);
}

.mine-hero-glow-b {
  width: 190rpx;
  height: 190rpx;
  left: -30rpx;
  bottom: -42rpx;
  background: rgba(255, 191, 214, 0.24);
}

.mine-hero-badge,
.mine-avatar-pair,
.mine-avatar-tip,
.mine-name,
.mine-days,
.mine-intro {
  position: relative;
  z-index: 1;
}

.mine-hero-badge {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.76);
  color: #87a5a1;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.mine-avatar-pair {
  margin-top: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
}

.mine-avatar-shell {
  width: 132rpx;
  height: 132rpx;
  border-radius: 50%;
  overflow: hidden;
  box-shadow:
    0 18rpx 30rpx rgba(255, 176, 204, 0.18),
    inset 0 0 0 6rpx rgba(255, 255, 255, 0.68);
  background: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.mine-avatar-shell-main {
  border: 2rpx solid rgba(133, 219, 211, 0.32);
}

.mine-avatar-shell-partner {
  border: 2rpx solid rgba(255, 198, 210, 0.42);
  background: linear-gradient(135deg, #ffe4ec, #fff8fa);
}

.mine-avatar-image,
.mine-avatar-text {
  width: 100%;
  height: 100%;
}

.mine-avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50rpx;
  font-weight: 700;
  color: #fff;
  background: var(--app-gradient-primary);
}

.mine-avatar-partner-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 46rpx;
  font-weight: 700;
  color: #d88197;
}

.mine-avatar-bridge {
  position: relative;
  width: 44rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(145, 228, 218, 0.55), rgba(255, 191, 214, 0.65));
}

.mine-avatar-bridge-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 36rpx;
  height: 36rpx;
  margin-left: -18rpx;
  margin-top: -18rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ee9ab2;
  font-size: 18rpx;
  box-shadow: 0 8rpx 16rpx rgba(255, 173, 195, 0.18);
}

.mine-avatar-tip {
  margin-top: 14rpx;
  font-size: 22rpx;
  color: color-mix(in srgb, var(--app-color-primary-strong) 62%, #b89ba5 38%);
}

.mine-name {
  margin-top: 22rpx;
  font-size: 46rpx;
  line-height: 1.18;
  font-weight: 700;
  color: var(--mine-text-main);
}

.mine-days {
  margin-top: 14rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #67bdb7;
}

.mine-intro {
  margin-top: 16rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--mine-text-sub);
}

.mine-feature-stack {
  margin-top: 26rpx;
  display: grid;
  gap: 20rpx;
}

.mine-feature-card {
  min-height: 248rpx;
  padding: 28rpx 28rpx 30rpx;
  border-radius: 36rpx;
  box-shadow: var(--app-shadow-card);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(255, 250, 252, 0.95));
  position: relative;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.48);
}

.mine-feature-watermark {
  position: absolute;
  right: 24rpx;
  top: 20rpx;
  font-size: 86rpx;
  line-height: 1;
  font-weight: 300;
  letter-spacing: -2rpx;
  text-transform: lowercase;
  color: color-mix(in srgb, var(--app-color-primary-soft) 44%, #ffffff 56%);
  opacity: 0.16;
  pointer-events: none;
}

.relationship-card-surface {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 246, 248, 0.95));
  box-shadow:
    var(--app-shadow-card),
    inset 0 0 0 2rpx rgba(255, 171, 186, 0.22);
}

.mine-feature-head {
  display: flex;
  align-items: center;
  gap: 16rpx;
  position: relative;
  z-index: 1;
}

.mine-feature-icon {
  width: 62rpx;
  height: 62rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.36);
}

.mine-feature-icon-svg {
  width: 34rpx;
  height: 34rpx;
  display: block;
}

.accent-profile {
  background: color-mix(in srgb, var(--app-color-primary-soft) 26%, #fff3f7 74%);
}

.accent-relationship {
  background: color-mix(in srgb, #ffb7a3 34%, #fff4f6 66%);
}

.mine-feature-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--mine-text-main);
}

.mine-feature-kicker {
  position: relative;
  z-index: 1;
  margin-top: 24rpx;
  font-size: 22rpx;
  color: color-mix(in srgb, var(--app-color-primary-strong) 68%, #b98f9c 32%);
}

.mine-feature-summary {
  position: relative;
  z-index: 1;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.75;
  color: var(--mine-text-main);
}

.mine-feature-action {
  position: relative;
  z-index: 1;
  margin-top: 24rpx;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.mine-feature-action::after {
  content: '›';
  font-size: 28rpx;
  line-height: 1;
}

.mine-menu-stack {
  margin-top: 20rpx;
  display: grid;
  gap: 18rpx;
}

.mine-list-card {
  min-height: 116rpx;
  padding: 20rpx 22rpx;
  border-radius: 30rpx;
  background: linear-gradient(180deg, var(--mine-surface), var(--mine-surface-soft));
  box-shadow:
    var(--app-shadow-soft),
    inset 0 0 0 2rpx var(--mine-stroke);
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.mine-list-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.84);
  color: var(--mine-text-main);
  font-size: 28rpx;
  font-weight: 600;
}

.mine-list-icon-svg {
  width: 36rpx;
  height: 36rpx;
  display: block;
}

.mine-list-icon-dot {
  position: relative;
  overflow: visible;
}

.mine-list-dot {
  position: absolute;
  top: -4rpx;
  right: -2rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff9e9a, #ff6e82);
  box-shadow: 0 0 0 4rpx rgba(255, 255, 255, 0.9);
}

.mine-list-copy {
  flex: 1;
  min-width: 0;
}

.mine-list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--mine-text-main);
}

.mine-list-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.65;
  color: var(--mine-text-sub);
}

.mine-list-side {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.mine-list-status {
  min-height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  color: var(--mine-text-sub);
  font-size: 20rpx;
  font-weight: 700;
}

.mine-list-status.active {
  background: color-mix(in srgb, var(--app-color-primary-soft) 18%, #fff4f7 82%);
  color: var(--app-color-primary-strong);
}

.mine-list-arrow {
  width: 18rpx;
  height: 18rpx;
  border-top: 4rpx solid color-mix(in srgb, var(--app-color-primary-strong) 58%, #c8a2ae 42%);
  border-right: 4rpx solid color-mix(in srgb, var(--app-color-primary-strong) 58%, #c8a2ae 42%);
  transform: rotate(45deg);
  border-radius: 2rpx;
  box-sizing: border-box;
}

.surface-press {
  transform: translateY(2rpx) scale(0.988);
  box-shadow: 0 10rpx 24rpx rgba(255, 128, 160, 0.08);
}

.mine-logout-shell {
  margin-top: 34rpx;
}

.mine-logout-btn {
  width: 100%;
  height: 96rpx;
  border: none;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.76);
  box-shadow:
    var(--app-shadow-soft),
    inset 0 0 0 2rpx color-mix(in srgb, var(--app-color-primary-soft) 26%, #f7d8e1 74%);
  color: var(--mine-text-main);
  font-size: 30rpx;
  font-weight: 500;
}

.mine-logout-btn::after {
  border: none;
}

.mine-footer {
  margin-top: 34rpx;
  padding: 0 18rpx;
  text-align: center;
}

.mine-footer-copy {
  font-size: 22rpx;
  line-height: 1.8;
  color: color-mix(in srgb, var(--mine-text-sub) 68%, #b89ba5 32%);
}

.mine-footer-dots {
  margin-top: 12rpx;
  display: inline-flex;
  gap: 10rpx;
  align-items: center;
  justify-content: center;
}

.mine-footer-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: rgba(255, 179, 199, 0.58);
}

.mine-footer-dot.active {
  background: var(--app-color-primary);
}

@media screen and (max-width: 520px) {
  .mine-feature-card {
    min-height: 228rpx;
  }

  .mine-list-card {
    border-radius: 28rpx;
    align-items: flex-start;
  }

  .mine-list-side {
    align-self: center;
  }
}
</style>
