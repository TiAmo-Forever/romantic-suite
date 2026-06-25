<template>
  <view class="page app-page-shell admin-couple-page" :style="themeStyle">
    <view class="admin-topbar app-topbar">
      <view class="top-nav-btn app-topbar-btn" @click="backPage">
        <view class="top-nav-icon app-topbar-icon" aria-hidden="true"></view>
        <text class="top-nav-text app-topbar-text">返回</text>
      </view>
      <view class="app-topbar-center">
        <view class="app-topbar-eyebrow">基础资料</view>
        <view class="app-topbar-title">两个人的信息</view>
      </view>
      <view class="top-nav-placeholder"></view>
    </view>

    <view class="couple-meta app-card-soft app-fade-up">
      <view class="meta-row">
        <view class="meta-label">恋爱纪念日</view>
        <view class="meta-value">{{ overview.anniversaryDate || '待设置' }}</view>
      </view>
      <view class="meta-row">
        <view class="meta-label">相恋天数</view>
        <view class="meta-value">{{ overview.togetherDays || 0 }} 天</view>
      </view>
    </view>

    <view class="profile-list app-fade-up app-delay-1">
      <view v-for="item in profileList" :key="item.username || item.nickname" class="profile-card app-card-soft">
        <view class="profile-avatar">{{ resolveAvatarText(item.nickname) }}</view>
        <view class="profile-name">{{ item.nickname || '未设置昵称' }}</view>
        <view class="profile-city">{{ item.city || '未设置城市' }}</view>
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
import { fetchAdminOverview } from '@/services/admin.js'

const { themeStyle } = useThemePage()
const overview = reactive({
  anniversaryDate: '',
  togetherDays: 0,
  profileList: []
})

const profileList = computed(() => Array.isArray(overview.profileList) ? overview.profileList : [])

function resolveAvatarText(name) {
  const safe = String(name || '').trim()
  return safe ? safe.slice(0, 1) : '爱'
}

async function loadOverview() {
  const payload = await fetchAdminOverview()
  overview.anniversaryDate = payload?.anniversaryDate || ''
  overview.togetherDays = Number(payload?.togetherDays || 0)
  overview.profileList = Array.isArray(payload?.profileList) ? payload.profileList : []
}

onShow(() => {
  if (!requireAuth()) return
  if (!isAdminUser()) {
    relaunchPage('/pages/home/home')
    return
  }
  loadOverview().catch((error) => {
    uni.showToast({ title: error?.message || '加载失败', icon: 'none' })
  })
})
</script>

<style scoped>
  .admin-couple-page { background: var(--app-page-gradient-main); }
  .admin-topbar { position: sticky; top: var(--app-sticky-top); z-index: 10; background: rgba(255, 255, 255, 0.58); backdrop-filter: blur(12px); }
  .top-nav-icon { width: 18rpx; height: 18rpx; border-left: 4rpx solid currentColor; border-bottom: 4rpx solid currentColor; border-radius: 2rpx; box-sizing: border-box; transform: rotate(45deg); }
  .top-nav-placeholder { width: 88rpx; }
  .couple-meta { padding: 28rpx; }
  .meta-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
  .meta-row + .meta-row { margin-top: 18rpx; padding-top: 18rpx; border-top: 1rpx solid rgba(232, 221, 209, 0.86); }
  .meta-label { font-size: 24rpx; color: var(--app-color-text); }
  .meta-value { font-size: 25rpx; color: var(--app-color-text-strong); font-weight: 600; }
  .profile-list { margin-top: 22rpx; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18rpx; }
  .profile-card { padding: 28rpx 20rpx; text-align: center; }
  .profile-avatar { width: 84rpx; height: 84rpx; margin: 0 auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #f7d8b5, #ebc28e); color: #8d6037; font-size: 34rpx; font-weight: 700; }
  .profile-name { margin-top: 18rpx; font-size: 28rpx; font-weight: 600; color: var(--app-color-text-strong); }
  .profile-city { margin-top: 10rpx; font-size: 23rpx; color: var(--app-color-text); }
</style>
