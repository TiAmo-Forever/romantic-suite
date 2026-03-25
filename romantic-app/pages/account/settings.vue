<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="账号设置" eyebrow="设置中心" />
    </view>

    <view class="app-account-content">
      <view class="hero-card app-fade-up">
        <view class="hero-glow hero-glow-a"></view>
        <view class="hero-glow hero-glow-b"></view>
        <view class="hero-left">
          <view class="hero-avatar">
            <image v-if="isImageAvatar" class="hero-avatar-image" :src="avatarImageUrl" mode="aspectFill" @click.stop="previewAvatar"></image>
            <text v-else class="hero-avatar-text">{{ avatarDisplay }}</text>
          </view>
          <view class="hero-copy">
            <view class="hero-title">{{ profile.nickname || '浪漫用户' }}</view>
            <view class="hero-desc">{{ profile.bio || '把常用资料、安全设置和同步入口都收在这里。' }}</view>
          </view>
        </view>
        <view class="hero-tags">
          <view v-if="profile.city" class="hero-chip app-pill app-pill-glass">{{ profile.city }}</view>
          <view v-if="profile.loverNickname" class="hero-chip app-pill app-pill-glass">{{ profile.loverNickname }}</view>
        </view>
      </view>

      <AccountPanel title="资料与外观" description="先整理当前账号自己的资料与头像，让首页和个人卡片展示更自然。">
        <view class="menu-list menu-list-tight app-fade-up app-delay-1">
          <view class="menu-card app-card-soft" hover-class="menu-card-active" hover-stay-time="70" @click="goPage('/pages/account/profile')">
            <view class="menu-accent accent-profile"></view>
            <view class="menu-main">
              <view class="menu-title-row">
                <view class="menu-title">个人资料</view>
                <view class="menu-summary-chip">{{ profileSummaryTag }}</view>
              </view>
              <view class="menu-summary">{{ profileSummary }}</view>
              <view class="menu-desc">姓名、城市、签名和邮箱</view>
            </view>
            <view class="menu-side">
              <view class="menu-preview-card profile-preview">
                <view class="preview-kicker">当前城市</view>
                <view class="preview-value">{{ profile.city || '未设置' }}</view>
                <view class="preview-sub">{{ profile.email || '邮箱未填写' }}</view>
              </view>
              <view class="menu-arrow" aria-hidden="true"></view>
            </view>
          </view>

          <view class="menu-card app-card-soft" hover-class="menu-card-active" hover-stay-time="70" @click="goPage('/pages/account/avatar')">
            <view class="menu-accent accent-avatar"></view>
            <view class="menu-main">
              <view class="menu-title-row">
                <view class="menu-title">头像设置</view>
                <view class="menu-summary-chip">{{ avatarModeLabel }}</view>
              </view>
              <view class="menu-summary">{{ avatarSummary }}</view>
              <view class="menu-desc">预设头像、上传头像、字符头像</view>
            </view>
            <view class="menu-side">
              <view class="menu-preview-card avatar-preview">
                <image v-if="isImageAvatar" class="menu-preview-avatar-image" :src="avatarImageUrl" mode="aspectFill" @click.stop="previewAvatar"></image>
                <view v-else class="menu-preview-avatar-text">{{ avatarDisplay }}</view>
              </view>
              <view class="menu-arrow" aria-hidden="true"></view>
            </view>
          </view>
        </view>
      </AccountPanel>

      <AccountPanel title="关系与安全" description="这里同时管理共享的关系资料，以及只属于当前账号自己的登录安全设置。">
        <view class="menu-list menu-list-tight app-fade-up app-delay-2">
          <view class="menu-card app-card-soft" hover-class="menu-card-active" hover-stay-time="70" @click="goPage('/pages/account/relationship')">
            <view class="menu-accent accent-relationship"></view>
            <view class="menu-main">
              <view class="menu-title-row">
                <view class="menu-title">关系信息</view>
                <view class="menu-summary-chip">{{ relationshipSummaryTag }}</view>
              </view>
              <view class="menu-summary">{{ relationshipSummary }}</view>
              <view class="menu-desc">称呼、纪念日、见面地点</view>
            </view>
            <view class="menu-side">
              <view class="menu-preview-card anniversary-preview">
                <view class="preview-kicker">纪念日</view>
                <view class="preview-value preview-date">{{ anniversaryDisplay }}</view>
                <view class="preview-sub">{{ profile.defaultMeetingPlace || '未设置地点' }}</view>
              </view>
              <view class="menu-arrow" aria-hidden="true"></view>
            </view>
          </view>

          <view class="menu-card app-card-soft" hover-class="menu-card-active" hover-stay-time="70" @click="goPage('/pages/account/security')">
            <view class="menu-accent accent-security"></view>
            <view class="menu-main">
              <view class="menu-title-row">
                <view class="menu-title">账号安全</view>
                <view class="menu-summary-chip">{{ securitySummaryTag }}</view>
              </view>
              <view class="menu-summary">{{ securitySummary }}</view>
              <view class="menu-desc">修改密码</view>
            </view>
            <view class="menu-side">
              <view class="menu-preview-card security-preview">
                <view class="preview-kicker">密码状态</view>
                <view class="preview-value">{{ securitySummaryTag }}</view>
                <view class="preview-sub">{{ passwordDots }}</view>
              </view>
              <view class="menu-arrow" aria-hidden="true"></view>
            </view>
          </view>
        </view>
      </AccountPanel>

      <AccountPanel title="数据管理" description="谨慎处理当前账号资料的重置与同步操作，避免误覆盖本地暂存内容。">
        <view class="menu-list menu-list-tight app-fade-up app-delay-3">
          <view class="menu-card app-card-soft" hover-class="menu-card-active" hover-stay-time="70" @click="goPage('/pages/account/data')">
            <view class="menu-accent accent-data"></view>
            <view class="menu-main">
              <view class="menu-title-row">
                <view class="menu-title">本地数据</view>
                <view class="menu-summary-chip warn">谨慎操作</view>
              </view>
              <view class="menu-summary">资料同步与重置</view>
              <view class="menu-desc">恢复默认、重新同步</view>
            </view>
            <view class="menu-side">
              <view class="menu-preview-card data-preview">
                <view class="preview-kicker">同步状态</view>
                <view class="preview-value">账号资料</view>
                <view class="preview-sub">服务端主数据，本地缓存兜底</view>
              </view>
              <view class="menu-arrow" aria-hidden="true"></view>
            </view>
          </view>
        </view>
      </AccountPanel>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { resolveAvatarUrl } from '@/utils/avatar.js'
import { previewImages } from '@/utils/image-preview.js'
import { fetchRemoteProfile } from '@/services/profile.js'
import { goPage } from '@/utils/nav.js'
import { getAvatarPresetMap, getProfile } from '@/utils/profile.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()
const profile = ref(getProfile())
const avatarPresetMap = getAvatarPresetMap()

const isImageAvatar = computed(() => profile.value.avatarType === 'upload' && !!profile.value.avatarImage)
const avatarImageUrl = computed(() => resolveAvatarUrl(profile.value.avatarImage))
const avatarDisplay = computed(() => {
  if (profile.value.avatarType === 'preset') {
    return avatarPresetMap[profile.value.avatarPreset] || '♥'
  }
  return String(profile.value.avatarText || '').trim() || '♥'
})

const anniversaryDisplay = computed(() => profile.value.anniversaryDate || '未设置')
const passwordDots = computed(() => '•'.repeat(Math.max((profile.value.password || '').length, 4)))
const profileSummaryTag = computed(() => profile.value.city || '未设置')
const profileSummary = computed(() => {
  const pieces = [profile.value.nickname || '未设置真实姓名']
  if (profile.value.email) pieces.push(profile.value.email)
  return pieces.join(' · ')
})
const avatarModeLabel = computed(() => {
  if (profile.value.avatarType === 'upload' && profile.value.avatarImage) return '已上传'
  if (profile.value.avatarType === 'text') return '字符头像'
  return '默认头像'
})
const avatarSummary = computed(() => {
  if (profile.value.avatarType === 'upload' && profile.value.avatarImage) return '当前正在使用已同步到服务端的头像'
  if (profile.value.avatarType === 'text') return `当前字符：${String(profile.value.avatarText || '').trim() || '♥'}`
  return `当前预设：${avatarDisplay.value}`
})
const relationshipSummaryTag = computed(() => profile.value.loverNickname || '未设置称呼')
const relationshipSummary = computed(() => {
  const pieces = []
  if (profile.value.anniversaryDate) pieces.push(profile.value.anniversaryDate)
  pieces.push(profile.value.defaultMeetingPlace || '未设置地点')
  return pieces.join(' · ')
})
const securitySummaryTag = computed(() => ((profile.value.password || '').length >= 4 ? '已设置' : '待完善'))
const securitySummary = computed(() => {
  const length = (profile.value.password || '').length
  return length ? `当前密码长度 ${length} 位` : '还没有设置可用密码'
})

onShow(async () => {
  if (!requireAuth()) return
  try {
    profile.value = await fetchRemoteProfile()
  } catch (error) {
    profile.value = getProfile()
  }
})

function previewAvatar() {
  if (!avatarImageUrl.value) return
  previewImages([avatarImageUrl.value], avatarImageUrl.value)
}
</script>

<style scoped>
.hero-card {
  position: relative;
  overflow: hidden;
  padding: 30rpx;
  border-radius: 32rpx;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.24), transparent 30%), var(--app-gradient-hero);
  color: #fff;
  box-shadow: var(--app-shadow-card);
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  filter: blur(8rpx);
}

.hero-glow-a {
  width: 180rpx;
  height: 180rpx;
  right: -30rpx;
  top: -40rpx;
}

.hero-glow-b {
  width: 120rpx;
  height: 120rpx;
  left: 40rpx;
  bottom: -36rpx;
}

.hero-left,
.hero-tags {
  position: relative;
  z-index: 1;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.hero-avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 4rpx rgba(255, 255, 255, 0.12);
}

.hero-avatar-image {
  width: 100%;
  height: 100%;
}

.hero-avatar-text {
  font-size: 38rpx;
  font-weight: 700;
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 700;
}

.hero-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.92);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 20rpx;
}

.menu-list {
  display: grid;
  gap: 18rpx;
}

.menu-list-tight {
  margin-top: 18rpx;
}

.menu-card {
  position: relative;
  overflow: hidden;
  padding: 28rpx 24rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  min-height: 188rpx;
}

.menu-card-active {
  transform: scale(0.985);
  box-shadow: 0 8rpx 18rpx rgba(255, 128, 160, 0.12);
  background: rgba(255, 250, 252, 0.98);
}

.menu-accent {
  position: absolute;
  left: 0;
  top: 18rpx;
  bottom: 18rpx;
  width: 10rpx;
  border-radius: 999rpx;
}

.accent-profile {
  background: var(--app-gradient-primary);
}

.accent-avatar {
  background: linear-gradient(180deg, #ff96b6, #ffd1de);
}

.accent-relationship {
  background: linear-gradient(180deg, #ffb07f, #ffd5b7);
}

.accent-security {
  background: linear-gradient(180deg, #b18cff, #e0d1ff);
}

.accent-data {
  background: linear-gradient(180deg, #ff8a9a, #ffc5cf);
}

.menu-main {
  flex: 1;
  min-width: 0;
  padding-left: 8rpx;
}

.menu-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.menu-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.menu-summary-chip {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #fff2f6;
  color: #c86f8c;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1;
}

.menu-summary-chip.warn {
  background: #fff0f3;
  color: #d8617e;
}

.menu-summary {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--app-color-text-strong);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
  min-height: 76rpx;
}

.menu-desc {
  margin-top: 8rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: #98707d;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.menu-side {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.menu-preview-card {
  width: 150rpx;
  min-height: 132rpx;
  padding: 16rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.38);
}

.profile-preview,
.avatar-preview,
.anniversary-preview,
.security-preview,
.data-preview {
  background: var(--app-card-gradient-soft);
}

.avatar-preview {
  padding: 0;
  overflow: hidden;
}

.preview-kicker {
  font-size: 18rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  color: #b88392;
}

.preview-value {
  margin-top: 10rpx;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.3;
  color: var(--app-color-primary-strong);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.preview-date {
  font-size: 22rpx;
}

.preview-sub {
  margin-top: 8rpx;
  font-size: 19rpx;
  line-height: 1.5;
  color: #9e7e88;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.menu-preview-avatar-image,
.menu-preview-avatar-text {
  width: 100%;
  height: 100%;
}

.menu-preview-avatar-image {
  display: block;
}

.menu-preview-avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  font-weight: 700;
  background: var(--app-gradient-primary);
  color: #fff;
}

.menu-arrow {
  width: 18rpx;
  height: 18rpx;
  margin-top: 10rpx;
  border-top: 4rpx solid #d18aa1;
  border-right: 4rpx solid #d18aa1;
  border-radius: 2rpx;
  flex-shrink: 0;
  transform: rotate(45deg);
  transition: transform 0.18s ease;
  box-sizing: border-box;
}

.menu-card-active .menu-arrow {
  transform: translateX(4rpx) rotate(45deg);
}

@media screen and (max-width: 620px) {
  .menu-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }

  .menu-side {
    width: 100%;
    grid-column: 1 / span 2;
    justify-content: space-between;
    align-items: center;
    padding-left: 8rpx;
  }

  .menu-preview-card {
    width: min(100%, 220rpx);
    min-height: 112rpx;
    align-items: flex-start;
    text-align: left;
  }

  .menu-arrow {
    margin-top: 0;
    align-self: center;
  }
}
</style>
