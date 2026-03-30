<template>
  <view class="page app-page-shell app-page-shell-tabbed mine-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="mine-bg mine-bg-a"></view>
    <view class="mine-bg mine-bg-b"></view>

    <view class="mine-top app-fade-up">
      <view class="mine-brand-wrap">
        <view class="mine-brand-kicker">{{ TEXT.brandKicker }}</view>
        <view class="mine-brand">{{ TEXT.brand }}</view>
        <view class="mine-brand-sub">{{ TEXT.brandSub }}</view>
        <view class="mine-brand-line">
          <view class="mine-brand-sep"></view>
          <view class="mine-brand-icon-wrap">
            <view class="mine-brand-dot"></view>
            <view class="mine-brand-icon">{{ TEXT.brandIcon }}</view>
            <view class="mine-brand-dot"></view>
          </view>
          <view class="mine-brand-sep"></view>
        </view>
      </view>
    </view>

    <view class="profile-card app-fade-up app-delay-1">
      <view class="profile-head">
        <view class="avatar-shell" @click="previewAvatar">
          <image v-if="isImageAvatar" class="avatar-image" :src="avatarImageUrl" mode="aspectFill"></image>
          <view v-else class="avatar-text">{{ avatarDisplay }}</view>
        </view>
        <view class="profile-copy">
          <view class="profile-name">{{ profile.nickname || user?.username || TEXT.defaultName }}</view>
          <view class="profile-intro">{{ profile.bio || TEXT.defaultIntro }}</view>
          <view class="profile-chip-row">
            <view class="status-badge status-badge-soft">{{ profile.city || TEXT.cityFallback }}</view>
            <view class="status-badge status-badge-soft">{{ profile.loverNickname || profile.nickname || TEXT.loverFallback }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="menu-grid app-fade-up app-delay-2">
      <view class="menu-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goAccountSettings">
        <view class="menu-icon">账号</view>
        <view class="menu-copy">
          <view class="menu-title">{{ TEXT.accountTitle }}</view>
          <view class="menu-desc">{{ TEXT.accountMenuDesc }}</view>
        </view>
        <view class="status-badge status-badge-open">{{ TEXT.synced }}</view>
      </view>

      <view class="menu-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goThemeSettings">
        <view class="menu-icon">主题</view>
        <view class="menu-copy">
          <view class="menu-title">{{ TEXT.themeTitle }}</view>
          <view class="menu-desc">{{ TEXT.themeMenuDesc }}</view>
        </view>
        <view class="status-badge status-badge-open">{{ currentTheme.name }}</view>
      </view>

      <view class="menu-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="goNotifications">
        <view class="menu-icon menu-icon-with-dot">
          消息
          <view v-if="unreadNotificationCount > 0" class="menu-icon-dot"></view>
        </view>
        <view class="menu-copy">
          <view class="menu-title">{{ TEXT.messageTitle }}</view>
          <view class="menu-desc">{{ notificationSummaryText }}</view>
        </view>
        <view class="status-badge" :class="unreadNotificationCount > 0 ? 'status-badge-open' : 'status-badge-quiet'">
          {{ unreadNotificationCount > 0 ? `${unreadNotificationCount} 条新提醒` : TEXT.readAll }}
        </view>
      </view>

      <view class="menu-card app-card-soft" hover-class="surface-press" hover-stay-time="70" @click="handleLogout">
        <view class="menu-icon">退出</view>
        <view class="menu-copy">
          <view class="menu-title">{{ TEXT.logoutTitle }}</view>
          <view class="menu-desc">{{ TEXT.logoutDesc }}</view>
        </view>
        <view class="status-badge status-badge-quiet">{{ TEXT.safeExit }}</view>
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
import { goPage } from '@/utils/nav.js'
import { syncNotificationUnreadCount } from '@/utils/notification-indicator.js'
import { subscribeNotificationSocket } from '@/utils/notification-socket.js'
import { getCurrentThemePreset, getThemeSettings } from '@/utils/theme.js'
import { useThemePage } from '@/utils/useThemePage.js'
import BottomTab from '@/pages/components/BottomTab.vue'

const TEXT = {
  brandKicker: '我的空间',
  brand: '我的',
  brandSub: '把账号、主题和日常设置收在这里',
  brandIcon: '♥',
  defaultName: '浪漫用户',
  defaultIntro: '把喜欢写进每一天。',
  cityFallback: '城市未设置',
  loverFallback: '未设置称呼',
  accountTitle: '账号设置',
  accountMenuDesc: '资料、头像、关系与安全',
  themeTitle: '主题设置',
  themeMenuDesc: '颜色、背景和整体氛围',
  messageTitle: '消息中心',
  messageEmptyDesc: '最近还没有新的提醒，你们的动态会慢慢收在这里。',
  logoutTitle: '退出登录',
  logoutDesc: '安全退出当前账号',
  synced: '已同步',
  readAll: '已查看',
  safeExit: '安全'
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
    return avatarPresetMap[profile.value.avatarPreset] || '♥'
  }
  return String(profile.value.avatarText || '').trim() || '♥'
})
const notificationSummaryText = computed(() => {
  const title = String(latestNotification.value?.title || '').trim()
  const content = String(latestNotification.value?.content || '').trim()
  if (title && content) {
    return `${title} · ${content}`
  }
  return title || content || TEXT.messageEmptyDesc
})

function goAccountSettings() {
  goPage('/pages/account/settings')
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
  --mine-accent: var(--app-color-primary);
  --mine-accent-strong: var(--app-color-primary-strong);
  --mine-accent-soft: var(--app-color-primary-soft);
  --mine-text-main: var(--app-color-text-strong);
  --mine-text-sub: var(--app-color-text);
  --mine-surface: rgba(255, 255, 255, 0.96);
  --mine-surface-soft: var(--app-color-surface-soft);
  --mine-border: rgba(255, 255, 255, 0.72);
  --mine-shadow: var(--app-shadow-card);
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.94), rgba(255, 248, 241, 0.92)),
    var(--app-page-gradient-soft);
}

.mine-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(10rpx);
  opacity: 0.58;
}

.mine-bg-a {
  width: 240rpx;
  height: 240rpx;
  top: 220rpx;
  right: -70rpx;
  background: color-mix(in srgb, var(--mine-accent-soft) 26%, #ffd7c0 74%);
}

.mine-bg-b {
  width: 220rpx;
  height: 220rpx;
  left: -80rpx;
  bottom: 280rpx;
  background: color-mix(in srgb, var(--mine-accent-soft) 18%, #deebd0 82%);
}

.mine-top,
.profile-card,
.menu-grid {
  position: relative;
  z-index: 2;
}

.mine-top {
  margin-top: 8rpx;
}

.mine-brand-wrap {
  text-align: center;
}

.mine-brand-kicker {
  font-size: 20rpx;
  letter-spacing: 6rpx;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--mine-accent-soft) 56%, #d5c3aa 44%);
}

.mine-brand {
  margin-top: 8rpx;
  font-size: 66rpx;
  line-height: 1.02;
  font-weight: 500;
  letter-spacing: 2rpx;
  color: var(--mine-accent);
}

.mine-brand-sub {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: color-mix(in srgb, var(--mine-text-sub) 70%, #d1c0b1 30%);
}

.mine-brand-line {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
}

.mine-brand-sep {
  width: 118rpx;
  height: 2rpx;
  background: linear-gradient(90deg, rgba(219, 192, 154, 0), rgba(219, 192, 154, 0.8), rgba(219, 192, 154, 0));
}

.mine-brand-icon-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
}

.mine-brand-icon {
  font-size: 24rpx;
  line-height: 1;
  color: var(--mine-accent);
}

.mine-brand-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #efe3d0, #d9c0a2);
  box-shadow: 0 0 0 6rpx rgba(255, 255, 255, 0.24);
}

.profile-card {
  margin-top: 28rpx;
  padding: 28rpx 24rpx;
  border-radius: 34rpx;
  background: linear-gradient(180deg, var(--mine-surface), color-mix(in srgb, var(--mine-surface-soft) 55%, #fff9f4 45%));
  box-shadow: var(--mine-shadow), inset 0 0 0 2rpx var(--mine-border);
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 22rpx;
}

.avatar-shell {
  width: 126rpx;
  height: 126rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.08);
  background: color-mix(in srgb, var(--mine-accent-soft) 26%, #fff6fa 74%);
}

.avatar-image,
.avatar-text {
  width: 100%;
  height: 100%;
}

.avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  font-weight: 700;
  color: #fff;
  background: var(--app-gradient-primary);
}

.profile-copy {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 40rpx;
  line-height: 1.3;
  font-weight: 700;
  color: var(--mine-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-intro {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.75;
  color: var(--mine-text-sub);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.profile-chip-row {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.menu-grid {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.menu-card {
  min-height: 190rpx;
  padding: 22rpx;
  border-radius: 34rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14rpx;
  background:
    radial-gradient(circle at 25% 92%, rgba(255, 231, 217, 0.3), transparent 26%),
    radial-gradient(circle at 82% 88%, rgba(228, 236, 208, 0.25), transparent 22%),
    linear-gradient(180deg, var(--mine-surface), color-mix(in srgb, var(--mine-surface-soft) 55%, #fff9f4 45%));
  box-shadow: var(--mine-shadow), inset 0 0 0 2rpx var(--mine-border);
}

.menu-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  line-height: 1;
  color: var(--mine-accent-strong);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.45);
}

.menu-icon-with-dot {
  overflow: visible;
}

.menu-icon-dot {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff9e9a, #ff6e82);
  box-shadow:
    0 0 0 4rpx rgba(255, 255, 255, 0.88),
    0 8rpx 18rpx rgba(255, 110, 130, 0.18);
}

.menu-copy {
  flex: 1;
  min-width: 0;
}

.menu-title {
  font-size: 30rpx;
  line-height: 1.4;
  font-weight: 600;
  color: var(--mine-text-main);
}

.menu-desc {
  margin-top: 8rpx;
  font-size: 23rpx;
  line-height: 1.7;
  color: var(--mine-text-sub);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.status-badge {
  min-width: 108rpx;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 21rpx;
  font-weight: 700;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.45);
}

.status-badge-open {
  background: color-mix(in srgb, var(--mine-accent-soft) 20%, #fff4f7 80%);
  color: var(--mine-accent-strong);
}

.status-badge-soft {
  background: color-mix(in srgb, var(--mine-accent-soft) 16%, #fff7ef 84%);
  color: var(--mine-accent-strong);
}

.status-badge-quiet {
  background: #f7f4ee;
  color: var(--mine-text-sub);
}

.surface-press {
  transform: translateY(2rpx) scale(0.986);
  box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.08);
}
</style>
