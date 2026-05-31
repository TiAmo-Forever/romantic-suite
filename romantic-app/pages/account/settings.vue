<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="我的设置" eyebrow="关系与账号" />
    </view>

    <view class="app-account-content">
      <view class="hero-card app-fade-up">
        <view class="hero-glow hero-glow-a"></view>
        <view class="hero-glow hero-glow-b"></view>
        <view class="hero-badge">Our Story</view>
        <view class="hero-avatar-pair">
          <view class="hero-avatar hero-avatar-main">
            <image v-if="isImageAvatar" class="hero-avatar-image" :src="avatarImageUrl" mode="aspectFill" @click.stop="previewAvatar"></image>
            <text v-else class="hero-avatar-text">{{ avatarDisplay }}</text>
          </view>
          <view class="hero-avatar-link" aria-hidden="true">
            <view class="hero-avatar-link-core">♥</view>
          </view>
          <view class="hero-avatar hero-avatar-partner">
            <image v-if="partnerIsImageAvatar" class="hero-avatar-image" :src="partnerAvatarImageUrl" mode="aspectFill"></image>
            <text v-else class="hero-avatar-partner-text">{{ loverAvatarDisplay }}</text>
          </view>
        </view>
        <view class="hero-title">{{ coupleTitle }}</view>
        <view class="hero-days">{{ togetherDaysText }}</view>
        <view class="hero-desc">{{ coupleMoodLine }}</view>
        <view class="hero-bottom-line"></view>
        <view class="hero-hint">头像和关系信息都可以在下面继续完善</view>
      </view>

      <view class="hero-intro app-fade-up app-delay-1">
        <view class="hero-intro-title">把“我”和“我们”都放在同一个舒服的位置</view>
        <view class="hero-intro-desc">这里主要负责账号资料、关系设定和安全管理，不抢首页的信息舞台，但保留一点专属于两个人的感觉。</view>
      </view>

      <AccountPanel title="资料与外观" description="先整理当前账号自己的资料与头像，让首页和个人卡片展示更自然。">
        <view class="menu-list menu-list-tight app-fade-up app-delay-2">
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
        <view class="menu-list menu-list-tight app-fade-up app-delay-3">
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
        <view class="menu-list menu-list-tight app-fade-up app-delay-4">
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
import { fetchPartnerProfile, fetchRemoteProfile } from '@/services/profile.js'
import { goPage } from '@/utils/nav.js'
import { getAvatarPresetMap, getProfile } from '@/utils/profile.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()
const profile = ref(getProfile())
const partnerProfile = ref(null)
const avatarPresetMap = getAvatarPresetMap()

const isImageAvatar = computed(() => profile.value.avatarType === 'upload' && !!profile.value.avatarImage)
const avatarImageUrl = computed(() => resolveAvatarUrl(profile.value.avatarImage))
const partnerIsImageAvatar = computed(() => partnerProfile.value?.avatarType === 'upload' && !!partnerProfile.value?.avatarImage)
const partnerAvatarImageUrl = computed(() => resolveAvatarUrl(partnerProfile.value?.avatarImage || ''))
const avatarDisplay = computed(() => {
  if (profile.value.avatarType === 'preset') {
    return avatarPresetMap[profile.value.avatarPreset] || '♥'
  }
  return String(profile.value.avatarText || '').trim() || '♥'
})
const anniversaryDisplay = computed(() => profile.value.anniversaryDate || '未设置')
const loverAvatarDisplay = computed(() => {
  if (partnerProfile.value) {
    if (partnerProfile.value.avatarType === 'preset') {
      return avatarPresetMap[partnerProfile.value.avatarPreset] || '♥'
    }

    const partnerAvatarText = String(partnerProfile.value.avatarText || '').trim()
    if (partnerAvatarText) return partnerAvatarText.slice(0, 2)
  }

  const raw = String(partnerProfile.value?.nickname || '').trim() || String(profile.value.loverNickname || '').trim()
  if (!raw) return '♥'
  if (/^[A-Za-z]{2,}$/.test(raw)) return raw.slice(0, 1).toUpperCase()
  return raw.slice(0, 1)
})
const loverDisplay = computed(() => profile.value.loverNickname || 'TA')
const partnerCallDisplay = computed(() => partnerProfile.value?.loverNickname || partnerProfile.value?.nickname || 'TA')
const coupleTitle = computed(() => `${loverDisplay.value} × ${partnerCallDisplay.value}`)
const togetherDaysText = computed(() => {
  const startDate = parseDateOnly(profile.value.anniversaryDate)
  if (!startDate) return '把我们的日子慢慢写长'

  const today = startOfDay(new Date())
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / DAY_MS)
  if (diffDays >= 0) return `已经一起 ${diffDays + 1} 天`
  return `距离我们的纪念开始还有 ${Math.abs(diffDays)} 天`
})
const coupleMoodLine = computed(() => {
  const bio = String(profile.value.bio || '').trim()
  if (bio && bio.length <= 18) return bio
  return '今天也在认真喜欢对方'
})
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

const DAY_MS = 24 * 60 * 60 * 1000

onShow(async () => {
  if (!requireAuth()) return

  await Promise.all([syncProfileFromServer(), syncPartnerProfileFromServer()])
})

function previewAvatar() {
  if (!avatarImageUrl.value) return
  previewImages([avatarImageUrl.value], avatarImageUrl.value)
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
</script>

<style scoped>
.hero-card {
  position: relative;
  overflow: hidden;
  padding: 34rpx 30rpx 30rpx;
  border-radius: 36rpx;
  background:
    radial-gradient(circle at top center, rgba(255, 255, 255, 0.72), transparent 52%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 249, 0.94));
  color: var(--app-color-primary-strong);
  box-shadow: var(--app-shadow-card);
  border: 2rpx solid rgba(255, 255, 255, 0.6);
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(10rpx);
}

.hero-glow-a {
  width: 220rpx;
  height: 220rpx;
  right: -40rpx;
  top: -56rpx;
  background: rgba(119, 233, 220, 0.18);
}

.hero-glow-b {
  width: 180rpx;
  height: 180rpx;
  left: -24rpx;
  bottom: -40rpx;
  background: rgba(255, 191, 214, 0.24);
}

.hero-badge,
.hero-avatar-pair,
.hero-title,
.hero-days,
.hero-desc,
.hero-bottom-line,
.hero-hint {
  position: relative;
  z-index: 1;
}

.hero-badge {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: #87a5a1;
  font-size: 20rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.hero-avatar-pair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  margin-top: 26rpx;
}

.hero-avatar {
  width: 126rpx;
  height: 126rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow:
    0 18rpx 28rpx rgba(255, 176, 204, 0.18),
    inset 0 0 0 4rpx rgba(255, 255, 255, 0.68);
}

.hero-avatar-main {
  border: 2rpx solid rgba(133, 219, 211, 0.32);
}

.hero-avatar-partner {
  border: 2rpx solid rgba(255, 198, 210, 0.4);
  background: linear-gradient(135deg, #ffe4ec, #fff7f8);
}

.hero-avatar-image {
  width: 100%;
  height: 100%;
  display: block;
}

.hero-avatar-text {
  font-size: 42rpx;
  font-weight: 700;
  color: var(--app-color-primary-strong);
}

.hero-avatar-partner-text {
  font-size: 42rpx;
  font-weight: 700;
  color: #d88197;
}

.hero-avatar-link {
  position: relative;
  width: 42rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(145, 228, 218, 0.55), rgba(255, 191, 214, 0.65));
}

.hero-avatar-link-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 36rpx;
  height: 36rpx;
  margin-left: -18rpx;
  margin-top: -18rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ee9ab2;
  font-size: 18rpx;
  box-shadow: 0 8rpx 16rpx rgba(255, 173, 195, 0.16);
}

.hero-title {
  margin-top: 26rpx;
  text-align: center;
  font-size: 42rpx;
  font-weight: 700;
  color: #486b69;
}

.hero-days {
  margin-top: 14rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 700;
  color: #67bdb7;
}

.hero-desc {
  margin-top: 16rpx;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.6;
  color: #6c8a88;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.hero-bottom-line {
  width: 120rpx;
  height: 4rpx;
  margin: 20rpx auto 0;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(142, 227, 217, 0.08), rgba(236, 156, 186, 0.9), rgba(142, 227, 217, 0.08));
}

.hero-hint {
  margin-top: 18rpx;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.6;
  color: #8ea09e;
}

.hero-intro {
  padding: 10rpx 8rpx 2rpx;
}

.hero-intro-title {
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.6;
  color: var(--app-color-primary-strong);
}

.hero-intro-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.8;
  color: #87a09e;
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
