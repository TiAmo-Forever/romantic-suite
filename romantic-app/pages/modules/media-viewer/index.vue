<template>
  <view class="page media-viewer-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader title="媒体查看" eyebrow="图片与视频" />
    </view>

    <view v-if="mediaList.length" class="viewer-shell">
      <swiper class="viewer-swiper" :current="currentIndex" @change="handleSwiperChange">
        <swiper-item v-for="(item, index) in mediaList" :key="`${item.mediaType}_${index}`">
          <view class="viewer-item">
            <image
              v-if="item.mediaType === 'image'"
              class="viewer-image"
              :src="resolveMedia(item.fileUrl)"
              mode="aspectFit"
            />
            <video
              v-else
              class="viewer-video"
              :src="resolveMedia(item.fileUrl)"
              controls
              show-center-play-btn
              enable-progress-gesture
              objectFit="contain"
            ></video>
          </view>
        </swiper-item>
      </swiper>

      <view class="viewer-footer">
        <view class="viewer-index">{{ currentIndex + 1 }} / {{ mediaList.length }}</view>
        <view class="viewer-meta">{{ mediaList[currentIndex]?.mediaType === 'video' ? '视频' : '图片' }}</view>
      </view>
    </view>

    <view v-else class="viewer-empty">暂无可查看的媒体内容</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'

const { themeStyle } = useThemePage()
const mediaList = ref([])
const currentIndex = ref(0)

onLoad((options) => {
  try {
    const decodedItems = decodeURIComponent(String(options?.items || ''))
    const parsedItems = JSON.parse(decodedItems)
    mediaList.value = Array.isArray(parsedItems) ? parsedItems : []
  } catch (error) {
    mediaList.value = []
  }

  currentIndex.value = Math.max(0, Math.min(Number(options?.index || 0), Math.max(mediaList.value.length - 1, 0)))
})

function handleSwiperChange(event) {
  currentIndex.value = Number(event.detail.current || 0)
}

function resolveMedia(path) {
  return resolveMediaUrl(path)
}
</script>

<style scoped>
.media-viewer-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(255, 209, 224, 0.36), transparent 28%), #fff3f7;
}

.viewer-shell {
  padding: 10rpx 0 30rpx;
}

.viewer-swiper {
  height: calc(100vh - 260rpx);
}

.viewer-item {
  width: 100%;
  height: 100%;
  padding: 0 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-image,
.viewer-video {
  width: 100%;
  height: 100%;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.58);
}

.viewer-footer {
  margin: 18rpx 30rpx 0;
  padding: 18rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #a66b7f;
  font-size: 24rpx;
  font-weight: 700;
}

.viewer-empty {
  padding: 180rpx 40rpx 0;
  text-align: center;
  color: #9a7682;
  font-size: 26rpx;
}
</style>
