<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="纪念日详情" eyebrow="回忆卡片" />
    </view>
    <view v-if="detail" class="app-account-content">
      <AccountPanel :title="detail.title" :description="detail.location || ''">
        <view class="detail-meta">
          <view class="detail-chip">{{ detail.eventDate }}</view>
          <view class="detail-chip strong">{{ formatStatus(detail) }}</view>
        </view>
        <view v-if="detail.creatorNickname" class="detail-creator">由 {{ detail.creatorNickname }} 创建</view>
        <view class="detail-desc">{{ detail.description || '暂无内容' }}</view>
      </AccountPanel>

      <AccountPanel title="图片与视频">
        <view v-if="detail.mediaList?.length" class="media-list">
          <view v-for="item in detail.mediaList" :key="item.id" class="media-item">
            <image v-if="item.mediaType === 'image'" class="media-preview" :src="resolveMediaUrl(item.fileUrl)" mode="aspectFill" @click="previewMedia(item)"></image>
            <video v-else class="media-preview" :src="resolveMediaUrl(item.fileUrl)" controls objectFit="cover"></video>
          </view>
        </view>
        <view v-else class="detail-empty">暂无媒体</view>
      </AccountPanel>

      <view class="detail-actions">
        <button class="detail-action-btn" @click="goEdit">编辑纪念日</button>
        <button class="detail-action-btn" @click="handleDelete">删除纪念日</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { deleteAnniversary, fetchAnniversaryDetail } from '@/services/anniversaries.js'
import { previewImages } from '@/utils/image-preview.js'
import { requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()
const detail = ref(null)
const eventId = ref('')

onLoad(async (options) => {
  if (!requireAuth()) return
  eventId.value = options?.id || ''
  await loadDetail()
})

onShow(async () => {
  if (!eventId.value || !requireAuth()) return
  await loadDetail()
})

async function loadDetail() {
  if (!eventId.value) return
  try {
    detail.value = await fetchAnniversaryDetail(eventId.value)
  } catch (error) {
    uni.showToast({ title: error?.message || '纪念日详情加载失败', icon: 'none' })
  }
}

function formatStatus(item) {
  if (item.timeStatus === 'future') {
    if (Number(item.dayOffset) === 0) return '就是今天'
    return `还有 ${item.dayOffset} 天`
  }
  return `已过去 ${Math.abs(Number(item.dayOffset || 0))} 天`
}

function goEdit() {
  goPage(`/pages/modules/anniversary/edit?id=${detail.value.id}`)
}

function previewMedia(currentItem) {
  const imageUrls = (detail.value?.mediaList || [])
    .filter((item) => item.mediaType === 'image')
    .map((item) => resolveMediaUrl(item.fileUrl))
    .filter(Boolean)
  const currentUrl = resolveMediaUrl(currentItem?.fileUrl)
  if (!imageUrls.length || !currentUrl) return
  previewImages(imageUrls, currentUrl)
}

function handleDelete() {
  uni.showModal({
    title: '删除纪念日',
    content: '删除后会一并移除相关图片和视频，是否继续？',
    success: async (result) => {
      if (!result.confirm) return
      try {
        await deleteAnniversary(detail.value.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => backPage(), 250)
      } catch (error) {
        uni.showToast({ title: error?.message || '删除失败', icon: 'none' })
      }
    }
  })
}
</script>

<style scoped>
  .detail-meta { display: flex; gap: 14rpx; flex-wrap: wrap; margin-top: 8rpx; }
  .detail-chip { padding: 10rpx 16rpx; border-radius: 999rpx; background: #fff4f8; color: #bc7990; font-size: 22rpx; font-weight: 700; }
  .detail-chip.strong { background: #ffe8f0; color: #ff6b97; }
  .detail-creator { margin-top: 16rpx; font-size: 22rpx; color: #bc8b9b; }
  .detail-desc { margin-top: 18rpx; font-size: 24rpx; line-height: 1.8; color: #8d6c77; }
  .media-list { display: grid; gap: 18rpx; }
  .media-item { overflow: hidden; border-radius: 24rpx; background: #fff4f7; }
  .media-preview { width: 100%; height: 360rpx; display: block; }
  .detail-empty { font-size: 24rpx; line-height: 1.7; color: #98707d; }
  .detail-actions { display: flex; flex-wrap: wrap; gap: 20rpx 28rpx; margin-top: 20rpx; }
  .detail-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    min-width: 0;
    height: 88rpx;
    margin: 0;
    padding: 0 32rpx;
    border: none;
    border-radius: 999rpx;
    background: linear-gradient(180deg, #fff6f9, #fff1f6);
    box-shadow: inset 0 0 0 2rpx rgba(255, 214, 226, 0.65);
    color: var(--app-color-primary-strong);
    font-size: 25rpx;
    font-weight: 800;
    line-height: 1;
    text-align: center;
  }
</style>
