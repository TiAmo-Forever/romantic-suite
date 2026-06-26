<template>
  <view class="page app-page-shell app-page-shell-tabbed mine-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="mine-bg mine-bg-a"></view>
    <view class="mine-bg mine-bg-b"></view>
    <view class="mine-bg mine-bg-c"></view>
    <view class="mine-bg mine-bg-d"></view>

    <view class="profile-hero app-fade-up">
      <view class="profile-hero-strip"></view>
      <view class="profile-hero-inner">
        <view class="profile-avatar-shell" hover-class="surface-press" hover-stay-time="60" @click="goAvatarSettings">
          <image v-if="isImageAvatar" class="profile-avatar-image" :src="avatarImageUrl" mode="aspectFill"></image>
          <text v-else class="profile-avatar-text">{{ avatarDisplay }}</text>
        </view>
        <view class="profile-name">{{ displayName }}</view>
        <view class="profile-bio">{{ bioText }}</view>

        <view class="profile-divider">
          <view class="profile-divider-line"></view>
          <view class="profile-divider-spark">✦ ✦ ✦</view>
          <view class="profile-divider-line"></view>
        </view>

        <view class="profile-relationship-chip">
          <view class="profile-chip-avatars">
            <view class="profile-chip-avatar profile-chip-avatar-main">{{ avatarDisplayShort }}</view>
            <view class="profile-chip-avatar profile-chip-avatar-partner">{{ partnerAvatarDisplayShort }}</view>
          </view>
          <view class="profile-chip-copy">{{ heroRelationText }}</view>
          <view class="profile-chip-days">{{ heroDayLabel }}</view>
        </view>

        <view class="profile-stats">
          <view class="profile-stat">
            <view class="profile-stat-value">{{ diaryCount }}</view>
            <view class="profile-stat-label">日记</view>
          </view>
          <view class="profile-stat">
            <view class="profile-stat-value">{{ photoCount }}</view>
            <view class="profile-stat-label">照片</view>
          </view>
          <view class="profile-stat">
            <view class="profile-stat-value">{{ wishCount }}</view>
            <view class="profile-stat-label">心愿</view>
          </view>
        </view>
      </view>
    </view>

    <view v-for="section in sections" :key="section.key" class="mine-section app-fade-up app-delay-1">
      <view class="section-label">
        <view class="section-label-bar"></view>
        <view class="section-label-text">{{ section.title }}</view>
      </view>

      <view class="section-card">
        <view
          v-for="(item, index) in section.items"
          :key="item.key"
          class="setting-row"
          :class="{ 'setting-row-last': index === section.items.length - 1 }"
          hover-class="surface-press"
          hover-stay-time="60"
          @click="handleRowClick(item.key)"
        >
          <view class="setting-icon" :class="item.tone">
            <image v-if="item.iconType === 'image'" class="setting-icon-image" :src="item.icon" mode="aspectFit"></image>
            <text v-else class="setting-icon-text">{{ item.icon }}</text>
          </view>

          <view class="setting-copy">
            <view class="setting-title">{{ item.title }}</view>
            <view class="setting-desc">{{ item.desc }}</view>
          </view>

          <view v-if="item.badge" class="setting-badge">{{ item.badge }}</view>
          <view class="setting-arrow"></view>
        </view>
      </view>
    </view>

    <view class="logout-shell app-fade-up app-delay-2">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <view class="version-shell app-fade-up app-delay-2">
      <view class="version-text">{{ versionText }}</view>
    </view>

    <BottomTab activeKey="mine" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUser, isAdminUser, requireAuth, logout } from '@/utils/auth.js'
import { resolveAvatarUrl } from '@/utils/avatar.js'
import { fetchAlbumMemoryList } from '@/services/albums.js'
import { fetchAnniversaryList } from '@/services/anniversaries.js'
import { fetchDailySummaryHistory } from '@/services/daily-summaries.js'
import { fetchPartnerProfile, fetchRemoteProfile } from '@/services/profile.js'
import { fetchRomanticPlanList } from '@/services/romantic-plans.js'
import iconData from '@/assets/icons/icon-data-outline.svg'
import iconProfile from '@/assets/icons/icon-profile-outline.svg'
import iconRelationship from '@/assets/icons/icon-relationship-outline.svg'
import iconSecurity from '@/assets/icons/icon-security-outline.svg'
import { goPage } from '@/utils/nav.js'
import { getAvatarPresetMap, getProfile } from '@/utils/profile.js'
import { useThemePage } from '@/utils/useThemePage.js'
import BottomTab from '@/pages/components/BottomTab.vue'

const APP_VERSION = '1.0.0'
const DAY_MS = 24 * 60 * 60 * 1000
const avatarPresetMap = getAvatarPresetMap()
const { themeStyle } = useThemePage()

const user = ref(getUser())
const profile = ref(getProfile())
const partnerProfile = ref(null)
const anniversaryCount = ref(0)
const diaryCount = ref(0)
const photoCount = ref(0)
const wishCount = ref(0)
const latestAlbumTitle = ref('')
const cacheSizeText = ref('0 B')

const isImageAvatar = computed(() => profile.value.avatarType === 'upload' && !!profile.value.avatarImage)
const avatarImageUrl = computed(() => resolveAvatarUrl(profile.value.avatarImage))
const avatarDisplay = computed(() => {
  if (profile.value.avatarType === 'preset') {
    return avatarPresetMap[profile.value.avatarPreset] || '晴'
  }
  return String(profile.value.avatarText || '').trim() || '晴'
})
const avatarDisplayShort = computed(() => shrinkAvatarText(avatarDisplay.value, displayName.value))
const partnerAvatarDisplay = computed(() => {
  if (partnerProfile.value?.avatarType === 'preset') {
    return avatarPresetMap[partnerProfile.value.avatarPreset] || '泽'
  }
  const partnerAvatarText = String(partnerProfile.value?.avatarText || '').trim()
  if (partnerAvatarText) return partnerAvatarText
  return String(partnerProfile.value?.nickname || '').trim() || String(profile.value.loverNickname || '').trim() || 'TA'
})
const partnerAvatarDisplayShort = computed(() => shrinkAvatarText(partnerAvatarDisplay.value, partnerProfile.value?.nickname || partnerCallDisplay.value))
const displayName = computed(() => String(profile.value.nickname || user.value?.nickname || '浪漫用户').trim() || '浪漫用户')
const bioText = computed(() => String(profile.value.bio || '').trim() || '把日子过得细水长流')
const loverDisplay = computed(() => String(profile.value.loverNickname || '').trim() || 'TA')
const partnerCallDisplay = computed(() => String(partnerProfile.value?.loverNickname || partnerProfile.value?.nickname || '').trim() || 'TA')
const togetherDaysValue = computed(() => {
  const startDate = parseDateOnly(profile.value.anniversaryDate)
  if (!startDate) return 0
  const today = startOfDay(new Date())
  return Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / DAY_MS) + 1)
})
const heroRelationText = computed(() => `${loverDisplay.value} 与 ${partnerCallDisplay.value}相恋`)
const heroDayLabel = computed(() => togetherDaysValue.value > 0 ? `第 ${togetherDaysValue.value} 天` : '纪念日待设置')
const versionText = computed(() => `爱意成笺 · v${APP_VERSION}`)
const avatarSummaryText = computed(() => {
  if (profile.value.avatarType === 'upload' && profile.value.avatarImage) return '当前：已上传头像'
  if (profile.value.avatarType === 'text') return `当前：${String(profile.value.avatarText || '').trim() || '字符头像'}`
  return '当前：渐变珊瑚色'
})
const albumCoverText = computed(() => latestAlbumTitle.value ? `当前：${latestAlbumTitle.value}` : '选择展示封面图')
const relationshipInfoText = computed(() => profile.value.anniversaryDate ? `${formatDotDate(parseDateOnly(profile.value.anniversaryDate))} 起` : '纪念日待设置')
const anniversaryManageText = computed(() => anniversaryCount.value > 0 ? `已添加 ${anniversaryCount.value} 个纪念日` : '还没有纪念日')
const callNameText = computed(() => `${loverDisplay.value} · ${partnerCallDisplay.value}`)
const accountManageText = computed(() => profile.value.email ? '邮箱已绑定' : `登录账号：${user.value?.username || '未登录'}`)
const privacyText = computed(() => isAdminUser(user.value) ? '基础信息模块已开放' : '控制内容可见范围')
const loginBindingText = computed(() => {
  const passwordReady = Boolean(profile.value.passwordConfigured) || String(profile.value.password || '').length >= 4
  return `${user.value?.username || '未登录'} · ${passwordReady ? '已设置密码' : '待设置密码'}`
})
const syncText = computed(() => '恢复默认与重新同步资料')

const sections = computed(() => [
  {
    key: 'profile',
    title: '个人信息',
    items: [
      { key: 'profile', title: '个人资料', desc: '昵称、签名、邮箱', iconType: 'image', icon: iconProfile, tone: 'tone-salmon' },
      { key: 'avatar', title: '我的头像', desc: avatarSummaryText.value, iconType: 'text', icon: '📷', tone: 'tone-soft' },
      { key: 'album-cover', title: '相册封面', desc: albumCoverText.value, iconType: 'text', icon: '🖼', tone: 'tone-peach' }
    ]
  },
  {
    key: 'relationship',
    title: '关系设置',
    items: [
      { key: 'relationship-info', title: '关系信息', desc: relationshipInfoText.value, iconType: 'image', icon: iconRelationship, tone: 'tone-gold' },
      { key: 'anniversary-manage', title: '纪念日管理', desc: anniversaryManageText.value, iconType: 'text', icon: '📅', tone: 'tone-rose' },
      { key: 'call-name', title: '我们的称呼', desc: callNameText.value, iconType: 'text', icon: '💞', tone: 'tone-mint' }
    ]
  },
  {
    key: 'security',
    title: '账号与安全',
    items: [
      { key: 'account-manage', title: '账号管理', desc: accountManageText.value, iconType: 'image', icon: iconSecurity, tone: 'tone-peach' },
      { key: 'privacy', title: '隐私设置', desc: privacyText.value, iconType: 'text', icon: '🔒', tone: 'tone-sand' },
      { key: 'binding', title: '登录与密码', desc: loginBindingText.value, iconType: 'text', icon: '🔑', tone: 'tone-lilac' }
    ]
  },
  {
    key: 'data',
    title: '数据管理',
    items: [
      { key: 'data-sync', title: '资料同步', desc: syncText.value, iconType: 'image', icon: iconData, tone: 'tone-mint', badge: '建议同步' },
      { key: 'export', title: '导出手帐', desc: '导出为 PDF 或图片集', iconType: 'text', icon: '🗂', tone: 'tone-soft' },
      { key: 'clear-cache', title: '清空本地缓存', desc: `释放 ${cacheSizeText.value}`, iconType: 'text', icon: '🧹', tone: 'tone-warm' }
    ]
  },
  {
    key: 'other',
    title: '其他',
    items: [
      { key: 'about', title: '爱意成笺', desc: `v ${APP_VERSION} · 更新日志`, iconType: 'text', icon: '✦', tone: 'tone-peach' },
      { key: 'notifications', title: '消息中心', desc: '查看提醒与互动消息', iconType: 'text', icon: '🔔', tone: 'tone-soft' },
      { key: 'help', title: '帮助与反馈', desc: '遇到问题？来这里', iconType: 'text', icon: '💌', tone: 'tone-soft' }
    ]
  }
])

onShow(async () => {
  if (!requireAuth()) return
  user.value = getUser()
  await loadMinePage()
})

async function loadMinePage() {
  const [profileResult, partnerResult, anniversaryResult, diaryHistoryResult, albumResult, planResult] = await Promise.allSettled([
    fetchRemoteProfile(),
    fetchPartnerProfile(),
    fetchAnniversaryList('all'),
    fetchDailySummaryHistory(),
    fetchAlbumMemoryList(),
    fetchRomanticPlanList('all')
  ])

  profile.value = profileResult.status === 'fulfilled' ? profileResult.value : getProfile()
  partnerProfile.value = partnerResult.status === 'fulfilled' ? partnerResult.value : null
  anniversaryCount.value = anniversaryResult.status === 'fulfilled' && Array.isArray(anniversaryResult.value) ? anniversaryResult.value.length : 0
  diaryCount.value = diaryHistoryResult.status === 'fulfilled'
    ? diaryHistoryResult.value.reduce((sum, item) => sum + Math.max(Number(item.entryCount || 0), 1), 0)
    : 0

  if (albumResult.status === 'fulfilled') {
    const list = Array.isArray(albumResult.value) ? albumResult.value : []
    photoCount.value = list.reduce((sum, item) => sum + Math.max(Number(item.imageCount || 0), 0), 0)
    latestAlbumTitle.value = String(list[0]?.title || '').trim()
  } else {
    photoCount.value = 0
    latestAlbumTitle.value = ''
  }

  if (planResult.status === 'fulfilled') {
    const list = Array.isArray(planResult.value) ? planResult.value : []
    wishCount.value = list.reduce((sum, item) => {
      const total = Number(item.totalItemCount || item.itemList?.length || 0)
      return sum + Math.max(total, 0)
    }, 0)
  } else {
    wishCount.value = 0
  }

  refreshCacheSize()
}

function handleRowClick(key) {
  switch (key) {
    case 'profile':
    case 'account-manage':
      goPage('/pages/account/profile')
      return
    case 'avatar':
      goAvatarSettings()
      return
    case 'album-cover':
      goPage('/pages/modules/album/index')
      return
    case 'relationship-info':
    case 'call-name':
      goPage('/pages/account/relationship')
      return
    case 'anniversary-manage':
      goPage('/pages/modules/anniversary/index')
      return
    case 'privacy':
      openComingSoon('隐私设置')
      return
    case 'binding':
      goPage('/pages/account/security')
      return
    case 'data-sync':
      goPage('/pages/account/data')
      return
    case 'export':
      openComingSoon('导出手帐')
      return
    case 'clear-cache':
      handleClearCache()
      return
    case 'about':
      openComingSoon('爱意成笺')
      return
    case 'notifications':
      goPage('/pages/modules/notifications/index')
      return
    case 'help':
      openComingSoon('帮助与反馈')
      return
    default:
      break
  }
}

function goAvatarSettings() {
  goPage('/pages/account/avatar')
}

function openComingSoon(title) {
  goPage(`/pages/modules/coming-soon/index?title=${encodeURIComponent(title)}`)
}

function handleClearCache() {
  uni.showModal({
    title: '清空本地缓存',
    content: '这不会退出当前登录，也不会删除服务端数据',
    success: (result) => {
      if (!result.confirm) return
      const keys = getClearableCacheKeys()
      const bytes = estimateCacheBytes(keys)
      keys.forEach((key) => uni.removeStorageSync(key))
      refreshCacheSize()
      uni.showToast({
        title: bytes > 0 ? `已释放 ${formatBytes(bytes)}` : '本地缓存已清空',
        icon: 'none'
      })
    }
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定退出当前账号吗',
    success: async (result) => {
      if (!result.confirm) return
      await logout()
      uni.reLaunch({ url: '/pages/login/login' })
    }
  })
}

function refreshCacheSize() {
  cacheSizeText.value = formatBytes(estimateCacheBytes(getClearableCacheKeys()))
}

function getClearableCacheKeys() {
  const username = String(user.value?.username || '').trim()
  const userThemeKey = username ? `romantic_theme_settings_${username}` : 'romantic_theme_settings'
  const protectedKeys = new Set(['romantic_token', 'romantic_user', 'romantic_profile', userThemeKey, 'romantic_theme_settings'])
  const keys = uni.getStorageInfoSync().keys || []
  return keys.filter((key) => String(key || '').startsWith('romantic_') && !protectedKeys.has(key))
}

function estimateCacheBytes(keys) {
  return keys.reduce((sum, key) => sum + getStorageByteLength(uni.getStorageSync(key)), 0)
}

function getStorageByteLength(value) {
  try {
    const text = JSON.stringify(value ?? '') || ''
    return unescape(encodeURIComponent(text)).length
  } catch (error) {
    return 0
  }
}

function shrinkAvatarText(value, fallback) {
  const raw = String(value || fallback || '').trim()
  if (!raw) return 'TA'
  if (/^[A-Za-z]{2,}$/.test(raw)) return raw.slice(0, 1).toUpperCase()
  return raw.slice(0, 1)
}

function parseDateOnly(value) {
  if (!value) return null
  const date = new Date(`${String(value).trim()}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDotDate(date) {
  if (!date) return '未设置'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function formatBytes(bytes) {
  const size = Math.max(Number(bytes || 0), 0)
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(size >= 10 * 1024 ? 0 : 1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
  .mine-page {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top, rgba(255, 255, 255, 0.9), rgba(255, 245, 242, 0.92)),
      linear-gradient(180deg, #fff6f1 0%, #ffecdf 100%);
  }

  .mine-bg {
    position: absolute;
    border-radius: 50%;
    filter: blur(18rpx);
    pointer-events: none;
  }

  .mine-bg-a {
    width: 360rpx;
    height: 360rpx;
    right: -40rpx;
    top: -20rpx;
    background: rgba(244, 190, 175, 0.24);
  }

  .mine-bg-b {
    width: 300rpx;
    height: 300rpx;
    left: -100rpx;
    top: 420rpx;
    background: rgba(240, 208, 196, 0.2);
  }

  .mine-bg-c {
    width: 260rpx;
    height: 260rpx;
    right: 30rpx;
    top: 720rpx;
    background: rgba(232, 196, 160, 0.16);
  }

  .mine-bg-d {
    width: 240rpx;
    height: 240rpx;
    left: -20rpx;
    bottom: 160rpx;
    background: rgba(242, 200, 184, 0.16);
  }

  .profile-hero,
  .mine-section,
  .logout-shell,
  .version-shell {
    position: relative;
    z-index: 2;
  }

  .profile-hero {
    overflow: hidden;
    margin-top: 6rpx;
    border-radius: 42rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 246, 0.96));
    box-shadow: 0 18rpx 42rpx rgba(215, 166, 142, 0.16);
    border: 2rpx solid rgba(255, 255, 255, 0.92);
  }

  .profile-hero-strip {
    height: 168rpx;
    background: linear-gradient(180deg, #f3cfbd 0%, #efc0a8 100%);
  }
  .profile-hero-inner {
    position: relative;
    margin-top: -80rpx;
    padding: 0 42rpx 34rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .profile-avatar-shell {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(140deg, #e8887a 0%, #d4635a 100%);
    box-shadow: 0 12rpx 34rpx rgba(212, 99, 90, 0.28);
  }

  .profile-avatar-image {
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }

  .profile-avatar-text {
    font-size: 64rpx;
    line-height: 1;
    color: #fff8f4;
    font-family: 'Times New Roman', serif;
  }

  .profile-name {
    margin-top: 24rpx;
    font-size: 50rpx;
    line-height: 1.1;
    letter-spacing: 6rpx;
    color: #6b3f32;
    font-family: 'Times New Roman', serif;
  }

  .profile-bio {
    margin-top: 14rpx;
    font-size: 24rpx;
    line-height: 1.5;
    color: #9b7060;
    text-align: center;
  }

  .profile-divider {
    width: 100%;
    margin-top: 28rpx;
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .profile-divider-line {
    flex: 1;
    height: 2rpx;
    background: linear-gradient(90deg, rgba(201, 168, 122, 0), rgba(201, 168, 122, 0.35), rgba(201, 168, 122, 0));
  }

  .profile-divider-spark {
    flex-shrink: 0;
    font-size: 16rpx;
    letter-spacing: 4rpx;
    color: #c9a87a;
    opacity: 0.7;
  }

  .profile-relationship-chip {
    margin-top: 30rpx;
    min-height: 82rpx;
    padding: 0 24rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    background: rgba(252, 236, 224, 0.6);
    border: 2rpx solid rgba(220, 160, 130, 0.2);
  }

  .profile-chip-avatars {
    position: relative;
    width: 52rpx;
    height: 26rpx;
    flex-shrink: 0;
  }

  .profile-chip-avatar {
    position: absolute;
    top: 0;
    width: 26rpx;
    height: 26rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14rpx;
    color: #fff8f4;
    border: 2rpx solid rgba(255, 248, 244, 0.9);
    font-family: 'Times New Roman', serif;
  }

  .profile-chip-avatar-main {
    left: 0;
    background: linear-gradient(140deg, #e8887a 0%, #d4635a 100%);
    z-index: 2;
  }

  .profile-chip-avatar-partner {
    right: 0;
    background: linear-gradient(140deg, #d4a87a 0%, #b88860 100%);
  }

  .profile-chip-copy {
    font-size: 22rpx;
    color: #9b7060;
    letter-spacing: 1rpx;
  }

  .profile-chip-days {
    font-size: 22rpx;
    color: #e07b6a;
    font-family: 'Times New Roman', serif;
  }

  .profile-stats {
    width: 100%;
    margin-top: 30rpx;
    display: flex;
    justify-content: center;
    gap: 48rpx;
  }

  .profile-stat {
    min-width: 80rpx;
    text-align: center;
  }

  .profile-stat-value {
    font-size: 38rpx;
    line-height: 1.05;
    color: #6b3f32;
    font-family: 'Times New Roman', serif;
  }

  .profile-stat-label {
    margin-top: 8rpx;
    font-size: 20rpx;
    color: #b8896e;
  }

  .mine-section {
    margin-top: 28rpx;
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 0 6rpx 14rpx;
  }

  .section-label-bar {
    width: 6rpx;
    height: 24rpx;
    border-radius: 999rpx;
    background: rgba(201, 168, 122, 0.55);
  }

  .section-label-text {
    font-size: 22rpx;
    letter-spacing: 4rpx;
    color: #b8896e;
  }

  .section-card {
    overflow: hidden;
    border-radius: 34rpx;
    background: rgba(255, 250, 246, 0.82);
    box-shadow: 0 16rpx 34rpx rgba(180, 80, 60, 0.07);
    border: 2rpx solid rgba(220, 160, 130, 0.14);
  }

  .setting-row {
    min-height: 126rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    border-bottom: 2rpx solid rgba(220, 160, 130, 0.1);
    transition: transform 0.18s ease;
  }

  .setting-row-last {
    border-bottom: none;
  }

  .setting-icon {
    width: 64rpx;
    height: 64rpx;
    border-radius: 20rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tone-salmon { background: rgba(232, 150, 126, 0.12); }
  .tone-soft { background: rgba(255, 232, 222, 0.78); }
  .tone-peach { background: rgba(243, 212, 192, 0.42); }
  .tone-gold { background: rgba(212, 168, 122, 0.14); }
  .tone-rose { background: rgba(232, 150, 126, 0.14); }
  .tone-mint { background: rgba(156, 184, 144, 0.12); }
  .tone-sand { background: rgba(201, 168, 122, 0.12); }
  .tone-lilac { background: rgba(205, 194, 229, 0.18); }
  .tone-warm { background: rgba(255, 221, 198, 0.45); }

  .setting-icon-image {
    width: 32rpx;
    height: 32rpx;
  }

  .setting-icon-text {
    font-size: 30rpx;
    line-height: 1;
  }

  .setting-copy {
    flex: 1;
    min-width: 0;
  }

  .setting-title {
    font-size: 28rpx;
    line-height: 1.35;
    color: #6b3f32;
    font-weight: 600;
  }

  .setting-desc {
    margin-top: 8rpx;
    font-size: 22rpx;
    line-height: 1.5;
    color: #b8896e;
  }

  .setting-badge {
    flex-shrink: 0;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: rgba(255, 236, 224, 0.9);
    color: #d07b62;
    font-size: 20rpx;
  }

  .setting-arrow {
    width: 18rpx;
    height: 18rpx;
    flex-shrink: 0;
    border-top: 3rpx solid rgba(201, 168, 122, 0.8);
    border-right: 3rpx solid rgba(201, 168, 122, 0.8);
    transform: rotate(45deg);
  }

  .logout-shell {
    margin-top: 28rpx;
  }

  .logout-btn {
    width: 100%;
    height: 102rpx;
    padding: 0;
    border: none;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(200, 70, 60, 0.05);
    color: rgba(180, 60, 50, 0.78);
    font-size: 28rpx;
    letter-spacing: 8rpx;
    line-height: 1;
    font-weight: 600;
    box-shadow: none;
  }

  .logout-btn::after {
    border: 2rpx solid rgba(200, 70, 60, 0.14);
    border-radius: 32rpx;
  }

  .version-shell {
    padding: 28rpx 0 8rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .version-text {
    font-size: 20rpx;
    letter-spacing: 2rpx;
    color: rgba(201, 168, 122, 0.82);
  }

  .surface-press {
    transform: translateY(2rpx) scale(0.992);
  }

  @media screen and (max-width: 520px) {
    .profile-name {
      font-size: 46rpx;
    }

    .profile-stats {
      gap: 34rpx;
    }

    .setting-row {
      min-height: 118rpx;
    }
  }
</style>
