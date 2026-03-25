<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="TEXT.detailTitle" :eyebrow="TEXT.albumTitle" />
    </view>

    <view v-if="detail" class="app-account-content">
      <view class="memory-cover-panel app-card-soft">
        <swiper class="memory-swiper" circular indicator-dots indicator-active-color="#ff7ea6">
          <swiper-item v-for="(item, index) in detail.mediaList" :key="item.id || index">
            <view class="memory-swiper-item" @click="openViewer(detail.mediaList, index)">
              <image
                v-if="item.mediaType === 'image' && resolveMedia(item.fileUrl)"
                class="memory-swiper-media"
                :src="resolveMedia(item.fileUrl)"
                mode="aspectFill"
              />
              <image
                v-else-if="resolveMedia(item.thumbnailUrl)"
                class="memory-swiper-media"
                :src="resolveMedia(item.thumbnailUrl)"
                mode="aspectFill"
              />
              <view v-else class="memory-swiper-media memory-swiper-fallback">
                <view class="memory-play-icon"></view>
              </view>
              <view class="memory-media-tag">{{ item.mediaType === 'video' ? TEXT.videoWord : TEXT.imageWord }}</view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <AccountPanel :title="detail.title" :description="detail.summary || ''">
        <view class="detail-meta">
          <view v-if="detail.memoryDate" class="detail-chip">{{ detail.memoryDate }}</view>
          <view v-if="detail.location" class="detail-chip">{{ detail.location }}</view>
          <view class="detail-chip strong">{{ detail.imageCount }} {{ TEXT.imageUnit }}</view>
          <view v-if="detail.videoCount" class="detail-chip strong">{{ detail.videoCount }} {{ TEXT.videoUnit }}</view>
        </view>

        <view v-if="detail.summary" class="detail-summary">{{ detail.summary }}</view>

        <view v-if="detail.tags.length" class="detail-tags">
          <view v-for="tag in detail.tags" :key="tag" class="detail-tag">{{ tag }}</view>
        </view>
      </AccountPanel>

      <AccountPanel :title="TEXT.mediaTitle">
        <view v-if="detail.mediaList.length" class="media-grid">
          <view
            v-for="(item, index) in detail.mediaList"
            :key="item.id || index"
            class="media-card"
            @click="openViewer(detail.mediaList, index)"
          >
            <image
              v-if="item.mediaType === 'image' && resolveMedia(item.fileUrl)"
              class="media-thumb"
              :src="resolveMedia(item.fileUrl)"
              mode="aspectFill"
            />
            <image
              v-else-if="resolveMedia(item.thumbnailUrl)"
              class="media-thumb"
              :src="resolveMedia(item.thumbnailUrl)"
              mode="aspectFill"
            />
            <view v-else class="media-thumb memory-swiper-fallback">
              <view class="memory-play-icon"></view>
            </view>
            <view class="media-tag">{{ item.mediaType === 'video' ? TEXT.videoWord : TEXT.imageWord }}</view>
          </view>
        </view>
        <view v-else class="detail-empty">{{ TEXT.emptyMedia }}</view>
      </AccountPanel>

      <view class="detail-actions">
        <button class="detail-action-btn" @click="goEdit">{{ TEXT.editButton }}</button>
        <button class="detail-action-btn" @click="handleDelete">{{ TEXT.deleteButton }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { deleteAlbumMemory, fetchAlbumMemoryDetail } from '@/services/albums.js'
import { requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { openMediaViewer } from '@/utils/media-viewer.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const TEXT = {
  albumTitle: '\u751c\u871c\u76f8\u518c',
  detailTitle: '\u56de\u5fc6\u8be6\u60c5',
  imageWord: '\u56fe\u7247',
  videoWord: '\u89c6\u9891',
  imageUnit: '\u5f20\u56fe\u7247',
  videoUnit: '\u4e2a\u89c6\u9891',
  mediaTitle: '\u7167\u7247\u4e0e\u89c6\u9891',
  emptyMedia: '\u6682\u65e0\u5a92\u4f53',
  editButton: '\u7f16\u8f91\u56de\u5fc6',
  deleteButton: '\u5220\u9664\u56de\u5fc6',
  deleteTitle: '\u5220\u9664\u56de\u5fc6',
  deleteContent: '\u5220\u9664\u540e\u4f1a\u79fb\u9664\u8fd9\u6bb5\u56de\u5fc6\u548c\u5173\u8054\u5a92\u4f53\uff0c\u662f\u5426\u7ee7\u7eed\uff1f',
  deleted: '\u5df2\u5220\u9664',
  deleteFailed: '\u5220\u9664\u5931\u8d25',
  loadFailed: '\u56de\u5fc6\u8be6\u60c5\u52a0\u8f7d\u5931\u8d25'
}

const { themeStyle } = useThemePage()
const detail = ref(null)
const memoryId = ref('')

onLoad(async (options) => {
  if (!requireAuth()) return
  memoryId.value = String(options?.id || '')
  await loadDetail()
})

onShow(async () => {
  if (!memoryId.value || !requireAuth()) return
  await loadDetail()
})

async function loadDetail() {
  if (!memoryId.value) return
  try {
    detail.value = await fetchAlbumMemoryDetail(memoryId.value)
  } catch (error) {
    uni.showToast({ title: error?.message || TEXT.loadFailed, icon: 'none' })
  }
}

function resolveMedia(path) {
  return resolveMediaUrl(path)
}

function openViewer(mediaList, index) {
  const safeList = Array.isArray(mediaList) ? mediaList : []
  const payload = []
  let nextIndex = 0

  safeList.forEach((item, itemIndex) => {
    if (!item?.fileUrl) return
    if (itemIndex === index) {
      nextIndex = payload.length
    }
    payload.push({
      mediaType: item.mediaType,
      fileUrl: item.fileUrl,
      thumbnailUrl: item.thumbnailUrl
    })
  })

  if (!payload.length) return
  openMediaViewer(payload, nextIndex)
}

function goEdit() {
  if (!detail.value?.id) return
  goPage(`/pages/modules/album/edit?id=${detail.value.id}`)
}

function handleDelete() {
  if (!detail.value?.id) return

  uni.showModal({
    title: TEXT.deleteTitle,
    content: TEXT.deleteContent,
    success: async (result) => {
      if (!result.confirm) return
      try {
        await deleteAlbumMemory(detail.value.id)
        uni.showToast({ title: TEXT.deleted, icon: 'success' })
        setTimeout(() => backPage(), 250)
      } catch (error) {
        uni.showToast({ title: error?.message || TEXT.deleteFailed, icon: 'none' })
      }
    }
  })
}

</script>

<style scoped>
  .app-account-topbar-shell {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(255, 250, 252, 0.88);
  }
  .memory-cover-panel {
    overflow: hidden;
    padding: 18rpx;
    border-radius: 34rpx;
    background: linear-gradient(135deg, #fff2f7, #fffafc);
  }
  .memory-swiper {
    height: 430rpx;
  }
  .memory-swiper-item {
    position: relative;
    height: 100%;
    overflow: hidden;
    border-radius: 26rpx;
  }
  .memory-swiper-media {
    width: 100%;
    height: 100%;
    display: block;
    background: rgba(255, 255, 255, 0.4);
  }
  .memory-swiper-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.32);
  }
  .memory-play-icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.76);
    position: relative;
  }
  .memory-play-icon::before {
    content: '';
    position: absolute;
    left: 36rpx;
    top: 24rpx;
    border-left: 26rpx solid #ff7ea6;
    border-top: 18rpx solid transparent;
    border-bottom: 18rpx solid transparent;
  }
  .memory-media-tag {
    position: absolute;
    left: 18rpx;
    bottom: 18rpx;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.8);
    color: #bf6f8b;
    font-size: 22rpx;
    font-weight: 700;
  }
  .detail-meta {
    display: flex;
    gap: 14rpx;
    flex-wrap: wrap;
    margin-top: 8rpx;
  }
  .detail-chip {
    padding: 10rpx 16rpx;
    border-radius: 999rpx;
    background: #fff4f8;
    color: #bc7990;
    font-size: 22rpx;
    font-weight: 700;
  }
  .detail-chip.strong {
    background: #ffe8f0;
    color: #ff6b97;
  }
  .detail-summary {
    margin-top: 18rpx;
    font-size: 25rpx;
    line-height: 1.8;
    color: #8d6c77;
  }
  .detail-tags {
    margin-top: 18rpx;
    display: flex;
    gap: 12rpx;
    flex-wrap: wrap;
  }
  .detail-tag {
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: #fff5f8;
    color: #c36f8f;
    font-size: 22rpx;
    font-weight: 700;
  }
  .media-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
  }
  .media-card {
    position: relative;
    overflow: hidden;
    border-radius: 24rpx;
    background: #fff4f7;
    min-height: 240rpx;
  }
  .media-thumb {
    width: 100%;
    height: 240rpx;
    display: block;
  }
  .media-tag {
    position: absolute;
    left: 14rpx;
    bottom: 14rpx;
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    background: rgba(0, 0, 0, 0.42);
    color: #fff;
    font-size: 20rpx;
  }
  .detail-empty {
    font-size: 24rpx;
    line-height: 1.7;
    color: #98707d;
  }
  .detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx 28rpx;
    margin-top: 20rpx;
  }
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
