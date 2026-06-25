<template>
  <view class="page app-page-shell admin-anniversary-detail-page" :style="themeStyle">
    <view class="admin-topbar app-topbar">
      <view class="top-nav-btn app-topbar-btn" @click="backPage">
        <view class="top-nav-icon app-topbar-icon" aria-hidden="true"></view>
        <text class="top-nav-text app-topbar-text">返回</text>
      </view>
      <view class="app-topbar-center">
        <view class="app-topbar-eyebrow">纪念日详情</view>
        <view class="app-topbar-title">这一天</view>
      </view>
      <view class="top-nav-placeholder"></view>
    </view>

    <view class="hero-card app-fade-up">
      <view class="hero-chip app-pill app-pill-glass">{{ statusText }}</view>
      <view class="hero-title">{{ detail.title || '纪念日' }}</view>
      <view class="hero-date">{{ detail.eventDate || '待设置' }}</view>
      <view class="hero-desc">{{ detail.description || '暂无说明' }}</view>
    </view>

    <view class="detail-card app-card-soft app-fade-up app-delay-1">
      <view class="detail-row">
        <view class="detail-label">地点</view>
        <view class="detail-value">{{ detail.location || '未填写' }}</view>
      </view>
      <view class="detail-row">
        <view class="detail-label">类型</view>
        <view class="detail-value">{{ resolveType(detail.type) }}</view>
      </view>
      <view class="detail-row">
        <view class="detail-label">创建人</view>
        <view class="detail-value">{{ detail.creatorNickname || detail.creatorUsername || '未设置' }}</view>
      </view>
      <view class="detail-row">
        <view class="detail-label">首页置顶</view>
        <view class="detail-value">{{ detail.pinned ? '是' : '否' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { requireAuth, isAdminUser } from '@/utils/auth.js'
import { backPage, relaunchPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import { fetchAdminAnniversaryDetail } from '@/services/admin.js'

const { themeStyle } = useThemePage()
const detail = reactive({
  id: 0,
  title: '',
  type: '',
  eventDate: '',
  description: '',
  location: '',
  pinned: false,
  timeStatus: 'future',
  dayOffset: 0,
  creatorUsername: '',
  creatorNickname: ''
})
let anniversaryId = 0

const statusText = computed(() => {
  const offset = Number(detail.dayOffset || 0)
  if (detail.timeStatus === 'future') {
    return offset === 0 ? '就是今天' : `还有 ${offset} 天`
  }
  return `已过去 ${Math.abs(offset)} 天`
})

function resolveType(type) {
  const map = { custom: '纪念日', meet: '第一次见面', love: '确认关系', travel: '第一次旅行', birthday: '生日' }
  return map[type] || '纪念日'
}

async function loadDetail() {
  if (!anniversaryId) {
    uni.showToast({ title: '纪念日不存在', icon: 'none' })
    return
  }
  const payload = await fetchAdminAnniversaryDetail(anniversaryId)
  Object.assign(detail, payload || {})
}

onLoad((options) => {
  anniversaryId = Number(options?.id || 0)
})

onShow(() => {
  if (!requireAuth()) return
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
  .admin-anniversary-detail-page { background: var(--app-page-gradient-main); }
  .admin-topbar { position: sticky; top: var(--app-sticky-top); z-index: 10; background: rgba(255, 255, 255, 0.58); backdrop-filter: blur(12px); }
  .top-nav-icon { width: 18rpx; height: 18rpx; border-left: 4rpx solid currentColor; border-bottom: 4rpx solid currentColor; border-radius: 2rpx; box-sizing: border-box; transform: rotate(45deg); }
  .top-nav-placeholder { width: 88rpx; }
  .hero-card { padding: 36rpx 30rpx; border-radius: 32rpx; background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.24), transparent 30%), var(--app-gradient-hero); box-shadow: var(--app-shadow-card); color: #fff; }
  .hero-title { margin-top: 18rpx; font-size: 40rpx; line-height: 1.4; font-weight: 700; }
  .hero-date { margin-top: 14rpx; font-size: 28rpx; color: rgba(255, 255, 255, 0.92); }
  .hero-desc { margin-top: 16rpx; font-size: 24rpx; line-height: 1.8; color: rgba(255, 255, 255, 0.82); }
  .detail-card { margin-top: 22rpx; padding: 28rpx; }
  .detail-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 20rpx; }
  .detail-row + .detail-row { margin-top: 18rpx; padding-top: 18rpx; border-top: 1rpx solid rgba(232, 221, 209, 0.86); }
  .detail-label { font-size: 24rpx; color: var(--app-color-text); }
  .detail-value { max-width: 68%; text-align: right; font-size: 25rpx; line-height: 1.7; color: var(--app-color-text-strong); font-weight: 600; word-break: break-all; }
</style>
