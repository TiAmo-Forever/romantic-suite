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
      <view class="mine-hero-glow"></view>
      <view class="mine-avatar-shell" @click="previewAvatar">
        <image v-if="isImageAvatar" class="mine-avatar-image" :src="avatarImageUrl" mode="aspectFill"></image>
        <view v-else class="mine-avatar-text">{{ avatarDisplay }}</view>
      </view>
      <view class="mine-name">{{ profile.nickname || user?.username || TEXT.defaultName }}</view>
      <view class="mine-intro">{{ profile.bio || TEXT.defaultIntro }}</view>
      <view class="mine-meta-row">
        <view class="mine-meta-pill">
          <text class="mine-meta-dot"></text>
          <text>{{ profile.city || TEXT.cityFallback }}</text>
        </view>
        <view class="mine-meta-pill">
          <text class="mine-meta-dot"></text>
          <text>{{ loverDisplay }}</text>
        </view>
      </view>
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
import { previewImages } from '@/utils/image-preview.js'
import { getAvatarPresetMap, getProfile } from '@/utils/profile.js'
import { fetchLatestNotification, fetchUnreadNotificationCount } from '@/services/notifications.js'
import { fetchRemoteProfile } from '@/services/profile.js'
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
  defaultIntro: '把资料、偏好和关系慢慢整理成舒服的样子。',
  cityFallback: '城市未设置',
  loverFallback: '正在想念 TA',
  profileTitle: '我的资料',
  profileKicker: '预览',
  profileAction: '编辑详情',
  relationshipTitle: '关系信息',
  relationshipAction: '查看契约',
  securityTitle: '账号安全',
  dataTitle: '数据管理',
  dataDesc: '备份、导出和同步我们的小记忆',
  messageTitle: '通知提醒',
  themeTitle: '主题外观',
  messageEmptyDesc: '最近还没有新的提醒，关于 TA 的瞬间会慢慢收在这里。',
  readAll: '已查看',
  logoutTitle: '退出当前登录',
  footerCopy: '将您的个人资料、偏好和关系调整到最舒适的状态。'
}

const { themeStyle } = useThemePage()
const user = ref(null)
const profile = ref(getProfile())
const avatarPresetMap = getAvatarPresetMap()
const currentTheme = ref(getCurrentThemePreset(getThemeSettings()))
const unreadNotificationCount = ref(0)
const latestNotification = ref(null)
let unsubscribeNotificationSocket = null

const isImageAvatar = computed(() => profile.value.avatarType === 'upload' && !!profile.value.avatarImage)
const avatarImageUrl = computed(() => resolveAvatarUrl(profile.value.avatarImage))
const avatarDisplay = computed(() => {
  if (profile.value.avatarType === 'preset') {
    return avatarPresetMap[profile.value.avatarPreset] || '爱'
  }
  return String(profile.value.avatarText || '').trim() || '爱'
})
const loverDisplay = computed(() => profile.value.loverNickname || TEXT.loverFallback)
const anniversaryDisplay = computed(() => profile.value.anniversaryDate || '纪念日未设置')
const relationshipTag = computed(() => profile.value.loverNickname || '点滴')
const profileSummary = computed(() => {
  const parts = []
  if (profile.value.city) parts.push(`坐标：${profile.value.city}`)
  if (profile.value.bio) parts.push(profile.value.bio)
  return parts.join(' · ') || '坐标未设置 · 等你补上一点关于自己的介绍'
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

function goHome() {
  goPage('/pages/home/home')
}

function goAccountSettings() {
  goPage('/pages/account/profile')
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

function previewAvatar() {
  if (!avatarImageUrl.value) return
  previewImages([avatarImageUrl.value], avatarImageUrl.value)
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

onShow(async () => {
  if (!requireAuth()) return
  if (!unsubscribeNotificationSocket) {
    unsubscribeNotificationSocket = subscribeNotificationSocket(applyRealtimeNotificationEvent)
  }
  user.value = getUser()
  await Promise.all([
    syncProfileFromServer(),
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
  padding: 42rpx 28rpx 36rpx;
  border-radius: 40rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.42), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 252, 0.92));
  box-shadow: var(--app-shadow-card);
  text-align: center;
  overflow: hidden;
}

.mine-hero-glow {
  position: absolute;
  inset: auto auto 0 50%;
  width: 360rpx;
  height: 220rpx;
  transform: translateX(-50%);
  background: color-mix(in srgb, var(--app-page-glow-soft) 64%, transparent 36%);
  filter: blur(18rpx);
}

.mine-avatar-shell {
  width: 156rpx;
  height: 156rpx;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow:
    0 18rpx 30rpx rgba(255, 128, 160, 0.14),
    inset 0 0 0 8rpx rgba(255, 255, 255, 0.62);
  background: var(--app-card-gradient-soft);
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
  font-size: 58rpx;
  font-weight: 700;
  color: #fff;
  background: var(--app-gradient-primary);
}

.mine-name {
  position: relative;
  z-index: 1;
  margin-top: 24rpx;
  font-size: 54rpx;
  line-height: 1.18;
  font-weight: 700;
  color: var(--mine-text-main);
}

.mine-intro {
  position: relative;
  z-index: 1;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--mine-text-sub);
}

.mine-meta-row {
  position: relative;
  z-index: 1;
  margin-top: 22rpx;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.mine-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  min-height: 56rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.74);
  color: var(--mine-text-sub);
  font-size: 22rpx;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.4);
}

.mine-meta-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: var(--app-color-primary);
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
