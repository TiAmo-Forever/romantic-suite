<template>
  <view class="page app-page-shell app-page-shell-tabbed improvement-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="恋爱改进簿" eyebrow="记录列表" />
    </view>

    <view class="hero-card app-fade-up">
      <view class="hero-chip">恋爱改进簿</view>
      <view class="hero-title">把每一次认真靠近，都留成可以回看的记录</view>
      <button class="hero-btn app-primary-btn app-primary-btn-shadow" @click="goCreate">新增记录</button>
    </view>

    <view class="filter-row app-fade-up app-delay-1">
      <view
        v-for="item in filters"
        :key="item.key"
        class="filter-chip"
        :class="{ active: activeFilter === item.key }"
        @click="switchFilter(item.key)"
      >
        {{ item.label }}
      </view>
    </view>

    <view v-if="noteList.length" class="note-list app-fade-up app-delay-2">
      <view
        v-for="item in noteList"
        :key="item.id"
        class="note-card app-card-soft"
        :class="`note-card-${item.status}`"
        hover-class="note-card-active"
        hover-stay-time="70"
        @click="openDetail(item.id)"
      >
        <view class="note-body">
          <view class="note-top">
            <view class="note-heading">
              <view class="identity-badge" :class="identityBadgeClass(item)">
                <view class="identity-badge-dot"></view>
                <text>{{ identityBadgeText(item) }}</text>
              </view>
              <view class="note-status-ribbon" :class="`note-status-ribbon-${item.status}`">
                <text class="note-status-ribbon-icon">{{ resolveStatusEmoji(item.status) }}</text>
                <text class="note-status-ribbon-text">{{ statusLabelMap[item.status] }}</text>
              </view>
              <view class="note-title">{{ item.title }}</view>
            </view>
            <view class="note-target">{{ targetLabelMap[item.targetType] }}</view>
          </view>

          <view class="note-meta-row">
            <view class="note-meta-chip">{{ item.startDate || '未设置开始日期' }}</view>
            <view class="note-meta-chip">{{ resolveElapsedLabel(item) }}</view>
            <view class="note-meta-chip note-meta-chip-feedback">{{ resolveTotalFeedbackValue(item) }}</view>
          </view>

          <view class="note-desc">{{ item.latestFeedback || '还没有反馈记录' }}</view>

          <view v-if="item.mediaList?.length" class="media-summary">
            <view class="media-preview">
              <image
                v-if="item.mediaList[0].mediaType === 'image'"
                class="media-preview-thumb"
                :src="resolveMedia(item.mediaList[0].fileUrl)"
                mode="aspectFill"
              />
              <image
                v-else-if="item.mediaList[0].thumbnailUrl"
                class="media-preview-thumb"
                :src="resolveMedia(item.mediaList[0].thumbnailUrl)"
                mode="aspectFill"
              />
              <view v-else class="media-preview-thumb media-preview-video">
                <view class="media-play-icon"></view>
              </view>
            </view>
            <view class="media-summary-text">
              <view class="media-summary-title">已附媒体 {{ mediaText(item.mediaList) }}</view>
              <view class="media-summary-desc">点开查看这条记录里的照片和视频</view>
            </view>
          </view>

          <view class="note-footer">
            <view class="note-tone">{{ statusToneMap[item.status] }}</view>
            <view class="note-arrow" aria-hidden="true"></view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-card app-card-soft app-fade-up app-delay-2">
      <view class="empty-icon">记</view>
      <view class="empty-title">还没有记录</view>
      <view class="empty-desc">把想认真改善的小事写下来，就从第一条记录开始。</view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { fetchImprovementNoteList } from '@/services/improvement-notes.js'
import { getUser, requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'

const filters = [
  { key: 'all', label: '全部' },
  { key: 'resolved', label: '已改善' },
  { key: 'improving', label: '跟进中' },
  { key: 'pending', label: '待开始' }
]

const targetLabelMap = {
  me: '我自己',
  lover: '对方感受',
  both: '共同努力'
}

const statusLabelMap = {
  resolved: '已改善',
  improving: '跟进中',
  pending: '待开始'
}

const statusToneMap = {
  resolved: '已经慢慢变好了',
  improving: '还在继续靠近',
  pending: '准备从这里开始'
}

const statusEmojiMap = {
  resolved: '✦',
  improving: '↗',
  pending: '·'
}

const { themeStyle } = useThemePage()
const activeFilter = ref('all')
const noteList = ref([])
const currentUsername = computed(() => String(getUser()?.username || '').trim())

onShow(async () => {
  if (!requireAuth()) return
  await loadList()
})

async function loadList() {
  try {
    noteList.value = await fetchImprovementNoteList(activeFilter.value)
  } catch (error) {
    uni.showToast({ title: error?.message || '获取改进记录失败', icon: 'none' })
  }
}

async function switchFilter(filterKey) {
  if (activeFilter.value === filterKey) return
  activeFilter.value = filterKey
  await loadList()
}

function resolveStatusEmoji(status) {
  return statusEmojiMap[status] || statusEmojiMap.improving
}

function resolveMedia(path) {
  return resolveMediaUrl(path)
}

function resolveElapsedLabel(item) {
  const baseDate = String(item?.startDate || item?.createdAt || '').trim().slice(0, 10)
  if (!baseDate) return '刚刚开始'
  const target = new Date(`${baseDate}T00:00:00`)
  if (Number.isNaN(target.getTime())) return '刚刚开始'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.max(0, Math.floor((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000)))
  if (diff <= 0) return '今天开始'
  if (diff === 1) return '已过 1 天'
  return `已过 ${diff} 天`
}

function resolveTotalFeedbackValue(item) {
  return `已记录 ${Math.max(0, Number(item?.feedbackCount || 0))} 次反馈`
}

function mediaText(mediaList = []) {
  const imageCount = mediaList.filter((item) => item.mediaType === 'image').length
  const videoCount = mediaList.filter((item) => item.mediaType === 'video').length
  const parts = []
  if (imageCount) parts.push(`${imageCount} 张图片`)
  if (videoCount) parts.push(`${videoCount} 个视频`)
  return parts.join(' · ') || '媒体'
}

function isMine(item) {
  return String(item?.creatorUsername || '').trim() === currentUsername.value
}

function identityBadgeText(item) {
  return isMine(item) ? '我' : 'TA'
}

function identityBadgeClass(item) {
  return isMine(item) ? 'identity-badge-mine' : 'identity-badge-other'
}

function goCreate() {
  goPage('/pages/modules/improvement/edit')
}

function openDetail(id) {
  goPage(`/pages/modules/improvement/detail?id=${id}`)
}
</script>

<style scoped>
.improvement-page { background: var(--app-page-gradient-main); }
.hero-card { padding: 34rpx 30rpx; border-radius: 34rpx; background: linear-gradient(135deg, #ff9ab4, #ffc9d6 56%, #ffe7ed); box-shadow: var(--app-shadow-card); }
.hero-chip { display: inline-flex; padding: 10rpx 18rpx; border-radius: 999rpx; background: rgba(255,255,255,0.28); color: #fff; font-size: 22rpx; font-weight: 700; }
.hero-title { margin-top: 18rpx; font-size: 38rpx; line-height: 1.45; font-weight: 800; color: #fff; }
.hero-btn { margin-top: 24rpx; }
.filter-row { display: flex; gap: 16rpx; margin-top: 28rpx; flex-wrap: wrap; }
.filter-chip { padding: 14rpx 24rpx; border-radius: 999rpx; background: #fff3f7; color: #b77287; font-size: 24rpx; font-weight: 700; }
.filter-chip.active { background: var(--app-gradient-primary); color: #fff; }
.note-list { display: grid; gap: 20rpx; margin-top: 24rpx; }
.note-card { position: relative; padding: 22rpx 24rpx; display: block; overflow: hidden; }
.note-card::before { content: ''; position: absolute; left: 0; top: 22rpx; bottom: 22rpx; width: 8rpx; border-radius: 999rpx; background: #ffc2d1; }
.note-card-resolved::before { background: linear-gradient(180deg, #ffd978, #ffefb2); }
.note-card-improving::before { background: linear-gradient(180deg, #ff9fba, #ffd3df); }
.note-card-pending::before { background: linear-gradient(180deg, #ffb09f, #ffd9cf); }
.note-card-active { transform: scale(0.985); }
.note-body { min-width: 0; min-height: 0; display: flex; flex-direction: column; padding-left: 6rpx; }
.note-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 14rpx; }
.note-heading { flex: 1; min-width: 0; position: relative; display: flex; flex-direction: column; gap: 12rpx; }
.identity-badge { display: inline-flex; align-items: center; gap: 8rpx; padding: 6rpx 14rpx; border-radius: 999rpx; font-size: 20rpx; font-weight: 700; width: fit-content; }
.identity-badge-dot { width: 10rpx; height: 10rpx; border-radius: 50%; background: currentColor; opacity: 0.85; }
.identity-badge-mine { background: rgba(223, 246, 242, 0.96); color: #3e9b92; }
.identity-badge-other { background: rgba(255, 238, 229, 0.96); color: #d18264; }
.note-status-ribbon { display: inline-flex; align-items: center; gap: 8rpx; padding: 10rpx 18rpx 10rpx 14rpx; border-radius: 16rpx 999rpx 999rpx 16rpx; font-size: 19rpx; font-weight: 700; line-height: 1; box-shadow: 0 10rpx 18rpx rgba(255, 159, 186, 0.16); width: fit-content; }
.note-status-ribbon-icon { font-size: 21rpx; line-height: 1; }
.note-status-ribbon-text { line-height: 1; }
.note-status-ribbon-resolved { background: linear-gradient(135deg, #fff6d8, #ffe8a0); color: #9f6c04; }
.note-status-ribbon-improving { background: linear-gradient(135deg, #ffe8f0, #ffd3df); color: #bf537f; }
.note-status-ribbon-pending { background: linear-gradient(135deg, #ffe8e1, #ffd1c5); color: #b85c49; }
.note-title { flex: 1; font-size: 28rpx; line-height: 1.4; color: var(--app-color-primary-strong); font-weight: 800; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-all; }
.note-target { padding: 6rpx 12rpx; border-radius: 999rpx; background: #fff3f7; color: #c5718b; font-size: 18rpx; font-weight: 700; }
.note-meta-row { margin-top: 10rpx; display: flex; align-items: center; gap: 10rpx; flex-wrap: wrap; }
.note-meta-chip { padding: 8rpx 14rpx; border-radius: 999rpx; background: #fff4f8; color: #a07884; font-size: 20rpx; line-height: 1.4; }
.note-meta-chip-feedback { color: #b45e7c; }
.note-desc { margin-top: 10rpx; font-size: 22rpx; line-height: 1.65; color: #8f6d78; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-all; }
.media-summary { margin-top: 14rpx; padding: 14rpx; border-radius: 22rpx; display: flex; gap: 14rpx; background: #fff4f8; }
.media-preview { width: 90rpx; height: 90rpx; flex-shrink: 0; }
.media-preview-thumb { width: 100%; height: 100%; border-radius: 20rpx; background: #ffe5ed; }
.media-preview-video { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ffcedd, #ff9db7); }
.media-play-icon { width: 0; height: 0; border-top: 14rpx solid transparent; border-bottom: 14rpx solid transparent; border-left: 22rpx solid #fff; margin-left: 8rpx; }
.media-summary-text { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.media-summary-title { font-size: 22rpx; font-weight: 700; color: #a85d77; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.media-summary-desc { margin-top: 4rpx; font-size: 20rpx; line-height: 1.5; color: #b98a99; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.note-footer { margin-top: auto; padding-top: 14rpx; display: flex; align-items: center; justify-content: space-between; gap: 14rpx; }
.note-tone { color: #bb8195; font-size: 18rpx; line-height: 1.5; flex: 1; min-width: 0; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.note-arrow { width: 16rpx; height: 16rpx; border-top: 4rpx solid #d18aa1; border-right: 4rpx solid #d18aa1; border-radius: 2rpx; box-sizing: border-box; transform: rotate(45deg); flex-shrink: 0; }
.empty-card { margin-top: 28rpx; padding: 46rpx 28rpx; text-align: center; }
.empty-icon { font-size: 56rpx; }
.empty-title { margin-top: 18rpx; font-size: 30rpx; font-weight: 700; color: var(--app-color-primary-strong); }
.empty-desc { margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: #9a7682; }
</style>
