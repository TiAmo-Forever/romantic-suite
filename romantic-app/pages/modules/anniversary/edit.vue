<template>
  <view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="app-account-topbar-shell">
      <AccountHeader :title="pageTitle" eyebrow="纪念日编辑" />
    </view>
    <view class="app-account-content">
      <AccountPanel title="基础信息">
        <AccountField label="纪念日标题">
          <input v-model="form.title" class="input app-field" placeholder="请输入标题" placeholder-class="app-account-input-placeholder" />
        </AccountField>

        <view class="app-account-form-row">
          <view class="app-account-form-col">
            <AccountField label="纪念日类型">
              <picker class="picker app-field" mode="selector" :range="typeOptions" range-key="label" :value="typeIndex" @change="handleTypeChange">
                <view class="picker-value">{{ typeOptions[typeIndex]?.label || '请选择类型' }}</view>
              </picker>
            </AccountField>
          </view>
          <view class="app-account-form-col">
            <AccountField label="日期">
              <picker class="picker app-field" mode="date" :value="form.eventDate" @change="handleDateChange">
                <view class="picker-value">{{ form.eventDate || '请选择日期' }}</view>
              </picker>
            </AccountField>
          </view>
        </view>

        <AccountField label="地点">
          <view class="picker app-field location-picker" @click="openLocationPicker">
            <view class="picker-value">{{ form.location || '请选择或填写地点' }}</view>
          </view>
        </AccountField>

        <AccountField label="文字说明">
          <textarea v-model="form.description" maxlength="500" class="textarea app-textarea" placeholder="请输入内容" placeholder-class="app-account-input-placeholder" />
        </AccountField>

        <AccountField label="提醒设置">
          <picker class="picker app-field" mode="selector" :range="reminderOptions" range-key="label" :value="reminderIndex" @change="handleReminderChange">
            <view class="picker-value">{{ reminderOptions[reminderIndex]?.label || '请选择提醒方式' }}</view>
          </picker>
        </AccountField>

        <AccountField label="首页展示">
          <view class="pin-setting-row app-field">
            <view class="pin-setting-copy">
              <view class="pin-setting-title">置顶到首页摘要</view>
              <view class="pin-setting-desc">只有置顶的纪念日，才会显示在首页纪念日板块。</view>
            </view>
            <switch :checked="form.pinned" color="#ff7ea6" @change="handlePinnedChange" />
          </view>
        </AccountField>
      </AccountPanel>

      <AccountPanel title="图片与视频">
        <view class="media-toolbar">
          <button class="compact-media-btn" @click="chooseImages">添加图片</button>
          <button class="compact-media-btn" @click="chooseVideo">添加视频</button>
        </view>
        <view class="media-tips">已选 {{ imageCount }} 张图片，{{ videoCount }} 个视频</view>

        <view
          v-if="mediaList.length"
          class="sort-list"
          @touchmove.stop.prevent="handleDragMove"
          @touchend="finishDrag"
          @touchcancel="finishDrag"
        >
          <view
            v-for="(item, index) in mediaList"
            :key="item.localId"
            class="sort-item"
            :class="{
              dragging: dragState.dragging && dragState.activeIndex === index,
              shifting: dragState.dragging && dragState.activeIndex !== index,
              rebound: dragState.reboundIndex === index
            }"
            @longpress="startDrag(index)"
          >
            <view class="sort-thumb-wrap">
              <image v-if="item.mediaType === 'image'" class="sort-thumb" :src="item.previewUrl" mode="aspectFill" @click.stop="previewEditImage(item)"></image>
              <video v-else class="sort-thumb" :src="item.previewUrl" objectFit="cover"></video>
              <view class="media-tag">{{ item.mediaType === 'image' ? '图片' : '视频' }}</view>
            </view>
            <view class="sort-body">
              <view class="sort-top">
                <view class="sort-order">第 {{ index + 1 }} 项</view>
                <view v-if="index === 0" class="cover-badge">封面</view>
              </view>
              <view class="sort-desc">
                {{ item.mediaType === 'image' ? '长按排序' : '视频排序' }}
              </view>
              <view class="sort-actions">
                <view class="drag-hint">长按排序</view>
                <view class="media-remove media-remove-inline" @click.stop="removeMedia(index)">x</view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="media-empty">暂无媒体</view>
      </AccountPanel>

      <button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleSave">保存纪念日</button>
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { createAnniversary, fetchAnniversaryDetail, updateAnniversary } from '@/services/anniversaries.js'
import { requireAuth } from '@/utils/auth.js'
import { buildAreaPickerUrl, clearAreaDraft, getAreaDraft } from '@/utils/area.js'
import { previewImages } from '@/utils/image-preview.js'
import { prepareImageFile, resolveMediaUrl, uploadAnniversaryMedia } from '@/utils/media-upload.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()
const instance = getCurrentInstance()
const eventId = ref('')
const form = reactive({
  title: '',
  type: 'custom',
  eventDate: '',
  location: '',
  description: '',
  reminderType: 'none',
  pinned: false
})

const typeOptions = [
  { key: 'custom', label: '自定义' },
  { key: 'meet', label: '第一次见面' },
  { key: 'love', label: '确认关系' },
  { key: 'travel', label: '第一次旅行' },
  { key: 'birthday', label: '生日' }
]
const reminderOptions = [
  { key: 'none', label: '不提醒' },
  { key: 'on_day', label: '当天提醒' },
  { key: 'one_day_before', label: '提前 1 天' },
  { key: 'three_days_before', label: '提前 3 天' }
]

const typeIndex = ref(0)
const reminderIndex = ref(0)
const mediaList = ref([])
const dragState = reactive({
  dragging: false,
  activeIndex: -1,
  targetIndex: -1,
  reboundIndex: -1,
  containerTop: 0,
  itemHeight: 0
})
const pageTitle = computed(() => (eventId.value ? '编辑纪念日' : '新增纪念日'))
const imageCount = computed(() => mediaList.value.filter((item) => item.mediaType === 'image').length)
const videoCount = computed(() => mediaList.value.filter((item) => item.mediaType === 'video').length)

onLoad(async (options) => {
  if (!requireAuth()) return
  eventId.value = options?.id || ''
  if (eventId.value) {
    await loadDetail(eventId.value)
  }
})

onShow(() => {
  const draft = getAreaDraft('anniversary_location')
  if (!draft) return
  form.location = draft.displayText || draft.mergerName || draft.name || ''
  clearAreaDraft('anniversary_location')
})

async function loadDetail(id) {
  try {
    const detail = await fetchAnniversaryDetail(id)
    form.title = detail.title || ''
    form.type = detail.type || 'custom'
    form.eventDate = detail.eventDate || ''
    form.location = detail.location || ''
    form.description = detail.description || ''
    form.reminderType = detail.reminderType || 'none'
    form.pinned = Boolean(detail.isPinned)
    typeIndex.value = Math.max(typeOptions.findIndex((item) => item.key === form.type), 0)
    reminderIndex.value = Math.max(reminderOptions.findIndex((item) => item.key === form.reminderType), 0)
    mediaList.value = (detail.mediaList || []).map((item) => ({
      localId: `remote_${item.id}`,
      id: item.id,
      mediaType: item.mediaType,
      fileUrl: item.fileUrl,
      thumbnailUrl: item.thumbnailUrl,
      previewUrl: resolveMediaUrl(item.fileUrl),
      localPath: ''
    }))
  } catch (error) {
    uni.showToast({ title: error?.message || '纪念日详情加载失败', icon: 'none' })
  }
}

function handleTypeChange(event) {
  typeIndex.value = Number(event.detail.value || 0)
  form.type = typeOptions[typeIndex.value]?.key || 'custom'
}

function handleReminderChange(event) {
  reminderIndex.value = Number(event.detail.value || 0)
  form.reminderType = reminderOptions[reminderIndex.value]?.key || 'none'
}

function handleDateChange(event) {
  form.eventDate = event.detail.value
}

function handlePinnedChange(event) {
  form.pinned = Boolean(event.detail.value)
}

function openLocationPicker() {
  goPage(buildAreaPickerUrl('anniversary_location', {
    value: form.location || ''
  }))
}

async function chooseImages() {
  const remain = 10 - imageCount.value
  if (remain <= 0) {
    uni.showToast({ title: '图片最多 10 张', icon: 'none' })
    return
  }

  try {
    const result = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: remain,
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject
      })
    })

    for (const path of result.tempFilePaths || []) {
      const preparedPath = await prepareImageFile(path)
      mediaList.value.push({
        localId: `local_${Date.now()}_${Math.random()}`,
        mediaType: 'image',
        fileUrl: '',
        thumbnailUrl: '',
        previewUrl: preparedPath,
        localPath: preparedPath
      })
    }
  } catch (error) {
    if (error?.message) {
      uni.showToast({ title: error.message, icon: 'none' })
    }
  }
}

async function chooseVideo() {
  if (videoCount.value >= 1) {
    uni.showToast({ title: '视频最多 1 个', icon: 'none' })
    return
  }

  try {
    const result = await new Promise((resolve, reject) => {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject
      })
    })

    mediaList.value.push({
      localId: `local_${Date.now()}_${Math.random()}`,
      mediaType: 'video',
      fileUrl: '',
      thumbnailUrl: '',
      previewUrl: result.tempFilePath,
      localPath: result.tempFilePath
    })
  } catch (error) {
    if (error?.message) {
      uni.showToast({ title: error.message, icon: 'none' })
    }
  }
}

function removeMedia(index) {
  mediaList.value.splice(index, 1)
  finishDrag()
}

function previewEditImage(currentItem) {
  if (currentItem?.mediaType !== 'image') return
  const imageUrls = mediaList.value
    .filter((item) => item.mediaType === 'image')
    .map((item) => item.previewUrl)
    .filter(Boolean)
  if (!imageUrls.length || !currentItem.previewUrl) return
  previewImages(imageUrls, currentItem.previewUrl)
}

function startDrag(index) {
  if (mediaList.value.length < 2) return
  dragState.reboundIndex = -1
  dragState.dragging = true
  dragState.activeIndex = index
  dragState.targetIndex = index

  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance?.proxy)
    query.select('.sort-list').boundingClientRect()
    query.select('.sort-item').boundingClientRect()
    query.exec((result) => {
      const listRect = result?.[0]
      const itemRect = result?.[1]
      if (!listRect || !itemRect) {
        finishDrag()
        return
      }
      dragState.containerTop = listRect.top
      dragState.itemHeight = itemRect.height + 12
      if (typeof uni.vibrateShort === 'function') {
        uni.vibrateShort({ type: 'light' })
      }
    })
  })
}

function handleDragMove(event) {
  if (!dragState.dragging || dragState.itemHeight <= 0) return

  const touch = event.touches?.[0] || event.changedTouches?.[0]
  if (!touch) return

  const relativeY = touch.clientY - dragState.containerTop
  const maxIndex = mediaList.value.length - 1
  const nextIndex = Math.max(0, Math.min(maxIndex, Math.floor(relativeY / dragState.itemHeight)))
  if (nextIndex === dragState.activeIndex) return

  moveMedia(dragState.activeIndex, nextIndex)
  dragState.activeIndex = nextIndex
  dragState.targetIndex = nextIndex
}

function finishDrag() {
  const finishedIndex = dragState.activeIndex
  dragState.dragging = false
  dragState.activeIndex = -1
  dragState.targetIndex = -1
  dragState.containerTop = 0
  dragState.itemHeight = 0
  if (finishedIndex >= 0) {
    dragState.reboundIndex = finishedIndex
    setTimeout(() => {
      if (dragState.reboundIndex === finishedIndex) {
        dragState.reboundIndex = -1
      }
    }, 220)
  }
}

function moveMedia(fromIndex, toIndex) {
  if (fromIndex === toIndex) return
  const nextList = [...mediaList.value]
  const [movedItem] = nextList.splice(fromIndex, 1)
  nextList.splice(toIndex, 0, movedItem)
  mediaList.value = nextList
}

async function handleSave() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请先填写纪念日标题', icon: 'none' })
    return
  }
  if (!form.eventDate) {
    uni.showToast({ title: '请选择纪念日日期', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '正在保存', mask: true })
    const uploadedMedia = []
    for (let index = 0; index < mediaList.value.length; index += 1) {
      const item = mediaList.value[index]
      let fileUrl = item.fileUrl
      if (item.localPath) {
        fileUrl = await uploadAnniversaryMedia(item.localPath)
      }
      uploadedMedia.push({
        mediaType: item.mediaType,
        fileUrl,
        thumbnailUrl: item.thumbnailUrl || '',
        sortOrder: index
      })
    }

    const payload = {
      title: form.title.trim(),
      type: form.type,
      eventDate: form.eventDate,
      location: form.location.trim(),
      description: form.description.trim(),
      reminderType: form.reminderType,
      pinned: form.pinned,
      mediaList: uploadedMedia
    }

    if (eventId.value) {
      await updateAnniversary(eventId.value, payload)
    } else {
      await createAnniversary(payload)
    }

    uni.hideLoading()
    uni.showToast({ title: '纪念日已保存', icon: 'success' })
    setTimeout(() => backPage(), 250)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error?.message || '纪念日保存失败', icon: 'none' })
  }
}
</script>

<style scoped>
  .media-toolbar { display: flex; flex-wrap: wrap; gap: 20rpx 28rpx; }
  .compact-media-btn {
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
  .location-picker { justify-content: space-between; }
  .pin-setting-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
  .pin-setting-copy { flex: 1; min-width: 0; }
  .pin-setting-title { font-size: 26rpx; font-weight: 700; color: var(--app-color-primary-strong); }
  .pin-setting-desc { margin-top: 8rpx; font-size: 22rpx; line-height: 1.7; color: #9b7481; }
  .media-tips { margin-top: 16rpx; font-size: 23rpx; color: #9b7481; }
  .sort-list { margin-top: 18rpx; display: grid; gap: 12rpx; }
  .sort-item { display: flex; gap: 18rpx; padding: 16rpx; border-radius: 24rpx; background: #fff3f7; transition: transform 0.24s ease, box-shadow 0.24s ease, opacity 0.24s ease; }
  .sort-item.dragging { opacity: 0.8; transform: scale(1.04) translateY(-8rpx); box-shadow: 0 24rpx 42rpx rgba(255, 122, 160, 0.22); }
  .sort-item.shifting { transform: scale(0.985); }
  .sort-item.rebound { animation: sort-rebound 0.22s ease-out; }
  .sort-thumb-wrap { position: relative; flex-shrink: 0; width: 180rpx; }
  .sort-thumb { width: 180rpx; height: 180rpx; border-radius: 20rpx; display: block; background: #ffeef3; }
  .sort-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 12rpx; }
  .sort-top { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }
  .sort-order { font-size: 25rpx; font-weight: 700; color: var(--app-color-primary-strong); }
  .cover-badge { padding: 6rpx 14rpx; border-radius: 999rpx; background: #ffe0eb; color: #ff5d8f; font-size: 20rpx; font-weight: 700; }
  .sort-desc { font-size: 22rpx; line-height: 1.7; color: #9b7481; }
  .sort-actions { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }
  .drag-hint { font-size: 22rpx; color: #b18a96; }
  .media-tag { position: absolute; left: 14rpx; bottom: 14rpx; padding: 6rpx 12rpx; border-radius: 999rpx; background: rgba(0, 0, 0, 0.45); color: #fff; font-size: 20rpx; }
  .media-remove { position: absolute; right: 12rpx; top: 12rpx; width: 42rpx; height: 42rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.45); color: #fff; font-size: 28rpx; }
  .media-remove-inline { position: static; flex-shrink: 0; }
  .media-empty { font-size: 24rpx; color: #9b7481; }
  @keyframes sort-rebound {
    0% { transform: scale(1.04); }
    65% { transform: scale(0.985); }
    100% { transform: scale(1); }
  }
  @media screen and (max-width: 520px) {
    .sort-item { align-items: flex-start; }
    .sort-thumb-wrap { width: 150rpx; }
    .sort-thumb { width: 150rpx; height: 150rpx; }
  }
</style>
