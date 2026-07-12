<template>
  <view class="meal-page edit-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="meal-bg"></view>

    <view class="meal-topbar">
      <view class="icon-btn" @click="goBack"><image class="top-icon" :src="iconBack" mode="aspectFit" /></view>
      <text class="top-title">{{ isEditing ? '调整一下' : '添一道菜' }}</text>
      <view class="top-spacer"></view>
    </view>

    <view class="upload-card" @click="chooseImage">
      <image v-if="form.coverUrl || localImage" class="upload-preview" :src="localImage || resolveMediaUrl(form.coverUrl)" mode="aspectFill" />
      <view v-else class="upload-empty">
        <image :src="iconUpload" mode="aspectFit" />
        <text>上传这道菜的照片</text>
      </view>
    </view>

    <view class="form-card glass-card">
      <text class="field-label">菜名</text>
      <input v-model="form.name" maxlength="80" class="field-input" placeholder="这道菜叫什么？" placeholder-class="meal-placeholder" />
    </view>

    <view class="form-card glass-card">
      <text class="field-label">分类</text>
      <view class="chip-row">
        <view v-for="item in categoryOptions" :key="item.key" class="choice-chip" :class="[{ active: form.category === item.key }, `choice-${item.key}`]" @click="form.category = item.key">
          {{ item.label }}
        </view>
      </view>
    </view>

    <view class="form-card glass-card">
      <text class="field-label">谁最喜欢这道菜？</text>
      <view class="chip-row">
        <view v-for="item in preferenceOptions" :key="item.key" class="choice-chip" :class="[{ active: form.preference === item.key }, `pref-choice-${item.key}`]" @click="form.preference = item.key">
          {{ item.label }}
        </view>
      </view>
    </view>

    <view class="form-card glass-card">
      <text class="field-label">一句话记忆</text>
      <textarea v-model="form.memory" maxlength="255" auto-height class="field-textarea short" placeholder="写一句关于它的小记忆" placeholder-class="meal-placeholder" />
    </view>

    <view class="form-card glass-card">
      <text class="field-label">关于这道菜</text>
      <textarea v-model="form.description" maxlength="1000" class="field-textarea" placeholder="比如第一次做给对方吃，或者特别适合哪一天" placeholder-class="meal-placeholder" />
    </view>

    <view class="recipe-card glass-card">
      <view class="recipe-toggle" @click="recipeOpen = !recipeOpen">
        <view><text>制作方法</text><text>（选填）</text></view>
        <image :class="{ expanded: recipeOpen }" :src="iconChevron" mode="aspectFit" />
      </view>
      <textarea
        v-if="recipeOpen"
        v-model="form.recipe"
        maxlength="2000"
        class="field-textarea recipe-input"
        placeholder="记录步骤、火候和你们喜欢的口味"
        placeholder-class="meal-placeholder"
      />
    </view>

    <button class="save-btn" :disabled="saving" @click="handleSave">
      <image :src="iconSave" mode="aspectFit" />
      <text>{{ saving ? '保存中' : '收进我们的菜谱' }}</text>
    </button>
    <view v-if="isEditing" class="delete-btn" @click="handleDelete">删除这道菜</view>
    <view class="page-bottom"></view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createMealDish, deleteMealDish, fetchMealDishDetail, updateMealDish } from '@/services/meals.js'
import { requireAuth } from '@/utils/auth.js'
import { prepareImageFile, resolveMediaUrl, uploadMealMedia } from '@/utils/media-upload.js'
import { backPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import iconBack from '@/assets/meal/icon-back.svg'
import iconUpload from '@/assets/meal/icon-upload.svg'
import iconChevron from '@/assets/meal/icon-chevron-down.svg'
import iconSave from '@/assets/meal/icon-save.svg'

const { themeStyle } = useThemePage()
const dishId = ref('')
const saving = ref(false)
const localImage = ref('')
const recipeOpen = ref(false)
const form = reactive({
  name: '',
  category: 'hot',
  preference: 'both',
  coverUrl: '',
  memory: '',
  description: '',
  recipe: ''
})

const categoryOptions = [
  { key: 'cold', label: '凉菜' },
  { key: 'hot', label: '热菜' },
  { key: 'soup', label: '汤' },
  { key: 'staple', label: '主食' }
]
const preferenceOptions = [
  { key: 'me', label: '我最爱' },
  { key: 'partner', label: 'TA最爱' },
  { key: 'both', label: '我们都爱' }
]

const isEditing = computed(() => Boolean(dishId.value))

onLoad(async (options) => {
  if (!requireAuth()) return
  dishId.value = String(options?.id || '').trim()
  if (dishId.value) {
    await loadDetail()
  }
})

async function loadDetail() {
  try {
    const detail = await fetchMealDishDetail(dishId.value)
    Object.assign(form, {
      name: detail.name,
      category: detail.category || 'hot',
      preference: detail.preference || 'none',
      coverUrl: detail.coverUrl || '',
      memory: detail.memory || '',
      description: detail.description || '',
      recipe: detail.recipe || ''
    })
    recipeOpen.value = Boolean(detail.recipe)
  } catch (error) {
    uni.showToast({ title: error?.message || '菜品加载失败', icon: 'none' })
  }
}

async function chooseImage() {
  try {
    const result = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject
      })
    })
    const path = result.tempFilePaths?.[0]
    if (!path) return
    localImage.value = await prepareImageFile(path)
  } catch (error) {
    if (error?.message) {
      uni.showToast({ title: error.message, icon: 'none' })
    }
  }
}

async function handleSave() {
  const name = String(form.name || '').trim()
  if (!name) {
    uni.showToast({ title: '先写下菜名', icon: 'none' })
    return
  }
  try {
    saving.value = true
    uni.showLoading({ title: '保存中', mask: true })
    let coverUrl = form.coverUrl
    if (localImage.value) {
      coverUrl = await uploadMealMedia(localImage.value)
    }
    const payload = {
      name,
      category: form.category,
      preference: form.preference,
      coverUrl,
      memory: String(form.memory || '').trim(),
      description: String(form.description || '').trim(),
      recipe: String(form.recipe || '').trim()
    }
    if (isEditing.value) {
      await updateMealDish(dishId.value, payload)
    } else {
      await createMealDish(payload)
    }
    uni.hideLoading()
    uni.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => backPage(), 320)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error?.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

function handleDelete() {
  uni.showModal({
    title: '删除这道菜？',
    content: '删除后，今天菜单和本周精选里也会移除它。',
    confirmText: '删除',
    confirmColor: '#d06050',
    success: async (result) => {
      if (!result.confirm) return
      try {
        await deleteMealDish(dishId.value)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => backPage(), 320)
      } catch (error) {
        uni.showToast({ title: error?.message || '删除失败', icon: 'none' })
      }
    }
  })
}

function goBack() {
  backPage()
}
</script>

<style scoped lang="scss">
@import './meal-page.scss';

.edit-page {
  padding-bottom: 42rpx;
}

.upload-card {
  position: relative;
  z-index: 1;
  margin: 36rpx 40rpx 28rpx;
  height: 280rpx;
  border-radius: 40rpx;
  border: 3rpx dashed rgba(201, 168, 122, 0.36);
  background: rgba(255, 250, 246, 0.7);
  box-shadow: 0 8rpx 36rpx rgba(180, 80, 60, 0.06);
  overflow: hidden;
}

.upload-preview {
  width: 100%;
  height: 100%;
}

.upload-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  align-items: center;
  justify-content: center;
  color: #b8896e;
  font-size: 22rpx;
}

.upload-empty image {
  width: 56rpx;
  height: 56rpx;
}

.form-card,
.recipe-card {
  margin-top: 20rpx;
  padding: 29rpx 33rpx;
  box-sizing: border-box;
}

.field-label {
  display: block;
  font-size: 20rpx;
  line-height: 1.5;
  color: #9b7060;
  letter-spacing: 1rpx;
  margin-bottom: 12rpx;
}

.field-input,
.field-textarea {
  width: 100%;
  font-size: 27rpx;
  line-height: 1.7;
  color: #6b3f32;
}

.field-textarea {
  min-height: 104rpx;
}

.field-textarea.short {
  min-height: 58rpx;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.choice-chip {
  min-height: 63rpx;
  padding: 0 29rpx;
  border-radius: 24rpx;
  background: rgba(245, 235, 228, 0.6);
  border: 1rpx solid rgba(220, 160, 130, 0.12);
  color: #9b7060;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.choice-chip.active.choice-hot {
  color: #b84030;
  background: rgba(224, 123, 106, 0.13);
}

.choice-chip.active.choice-cold {
  color: #388060;
  background: rgba(100, 180, 130, 0.13);
}

.choice-chip.active.choice-soup {
  color: #3860a0;
  background: rgba(100, 140, 200, 0.13);
}

.choice-chip.active.choice-staple {
  color: #806010;
  background: rgba(210, 168, 80, 0.14);
}

.choice-chip.active.pref-choice-me {
  color: #c05840;
  background: rgba(224, 123, 106, 0.12);
  border-color: rgba(224, 123, 106, 0.26);
}

.choice-chip.active.pref-choice-partner {
  color: #906820;
  background: rgba(201, 168, 122, 0.14);
  border-color: rgba(201, 168, 122, 0.28);
}

.choice-chip.active.pref-choice-both {
  color: #a03868;
  background: rgba(210, 140, 170, 0.12);
  border-color: rgba(210, 140, 170, 0.26);
}

.recipe-card {
  padding: 0 32rpx;
  overflow: hidden;
}

.recipe-toggle {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recipe-toggle view {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.recipe-toggle text:first-child {
  font-size: 20rpx;
  color: #9b7060;
  letter-spacing: 1rpx;
}

.recipe-toggle text:last-child {
  font-size: 18rpx;
  color: #c9a87a;
}

.recipe-toggle image {
  width: 26rpx;
  height: 26rpx;
}

.recipe-toggle image.expanded {
  transform: rotate(180deg);
}

.recipe-input {
  padding-bottom: 28rpx;
  min-height: 220rpx;
}

.save-btn {
  margin: 20rpx 40rpx 0;
  height: 103rpx;
  border-radius: 40rpx;
  background: linear-gradient(173deg, #e8877a 4%, #d4635a 96%);
  color: #fff8f4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  font-size: 29rpx;
  letter-spacing: 2rpx;
  box-shadow: 0 12rpx 22rpx rgba(224, 123, 106, 0.32);
}

.save-btn[disabled] {
  opacity: 0.55;
}

.save-btn image {
  width: 30rpx;
  height: 30rpx;
}

.delete-btn {
  margin-top: 28rpx;
  text-align: center;
  color: #d06050;
  font-size: 24rpx;
}
</style>
