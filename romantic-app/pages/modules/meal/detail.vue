<template>
  <view class="meal-page detail-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="meal-bg"></view>

    <view class="meal-topbar">
      <view class="icon-btn" @click="goBack"><image class="top-icon" :src="iconBack" mode="aspectFit" /></view>
      <text class="top-title">菜品详情</text>
      <view class="icon-btn" @click="goEdit"><image class="top-icon save-icon" :src="iconSave" mode="aspectFit" /></view>
    </view>

    <view v-if="dish.id" class="detail-content">
      <view class="hero-card glass-card">
        <view class="hero-cover" :class="`cover-${dish.category}`" @click="previewCover">
          <image v-if="dish.coverUrl" class="dish-image" :src="resolveMediaUrl(dish.coverUrl)" mode="aspectFill" />
          <view v-else class="cover-empty">朝夕同味</view>
        </view>
        <view class="hero-info">
          <view class="tag-row">
            <text class="cat-tag" :class="`cat-${dish.category}`">{{ dish.categoryLabel || categoryText }}</text>
            <text v-if="dish.preferenceLabel" class="pref-tag" :class="`pref-${dish.preference}`">{{ dish.preferenceLabel }}</text>
          </view>
          <text class="dish-name">{{ dish.name }}</text>
          <text v-if="dish.memory" class="dish-memory">{{ dish.memory }}</text>
        </view>
      </view>

      <view class="action-card glass-card">
        <view class="action-btn primary" :class="{ done: dish.addedToday }" @click="addToday">
          {{ dish.addedToday ? '已经在今天' : '加到今天' }}
        </view>
        <view class="action-btn secondary" :class="{ done: dish.selectedThisWeek }" @click="addWeekly">
          {{ dish.selectedThisWeek ? '已经在本周' : '加入本周' }}
        </view>
      </view>

      <view class="usage-card glass-card">
        <view class="usage-item">
          <text class="usage-value">{{ dish.dailyUsedCount || 0 }}</text>
          <text class="usage-label">进过菜单</text>
        </view>
        <view class="usage-line"></view>
        <view class="usage-item">
          <text class="usage-value">{{ dish.weeklySelectedCount || 0 }}</text>
          <text class="usage-label">入选本周</text>
        </view>
        <view class="usage-line"></view>
        <view class="usage-item">
          <text class="usage-value small">{{ dish.lastAddedDate || '还没有' }}</text>
          <text class="usage-label">最近一次</text>
        </view>
      </view>

      <view class="section-card glass-card">
        <view class="section-title">
          <view class="section-mark"></view>
          <text>这道菜的故事</text>
        </view>
        <text class="section-copy">{{ dish.description || dish.memory || '暂无内容' }}</text>
      </view>

      <view class="section-card glass-card">
        <view class="section-title">
          <view class="section-mark"></view>
          <text>制作方法</text>
        </view>
        <text class="section-copy">{{ dish.recipe || '暂无内容' }}</text>
      </view>

      <view class="meta-card glass-card">
        <view class="meta-row">
          <text>记录人</text>
          <text>{{ dish.creatorNickname || dish.creatorUsername || '我们' }}</text>
        </view>
        <view class="meta-row">
          <text>最后更新</text>
          <text>{{ dish.updatedAt || '暂未记录' }}</text>
        </view>
      </view>

      <view class="danger-card glass-card" @click="confirmDelete">删除这道菜</view>
    </view>
    <view v-else class="empty-card glass-card">菜品加载中</view>

    <view class="page-bottom"></view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { addDishToDailyPlan, addDishToWeeklySelection, deleteMealDish, fetchMealDishDetail } from '@/services/meals.js'
import { requireAuth } from '@/utils/auth.js'
import { previewImages } from '@/utils/image-preview.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import iconBack from '@/assets/meal/icon-back.svg'
import iconSave from '@/assets/meal/icon-save.svg'

const { themeStyle } = useThemePage()
const dishId = ref('')
const date = ref('')
const dish = ref({})

const categoryText = computed(() => {
  const category = dish.value.category
  if (category === 'cold') return '凉菜'
  if (category === 'soup') return '汤'
  if (category === 'staple') return '主食'
  return '热菜'
})

onLoad((options) => {
  dishId.value = String(options?.id || '').trim()
  date.value = String(options?.date || '').trim()
})

onShow(async () => {
  if (!requireAuth()) return
  await loadDish()
})

async function loadDish() {
  if (!dishId.value) {
    uni.showToast({ title: '菜品参数缺失', icon: 'none' })
    return
  }
  try {
    dish.value = await fetchMealDishDetail(dishId.value, date.value)
  } catch (error) {
    uni.showToast({ title: error?.message || '菜品加载失败', icon: 'none' })
  }
}

async function addToday() {
  if (!dish.value.id || dish.value.addedToday) return
  try {
    await addDishToDailyPlan(dish.value.id, date.value)
    dish.value = { ...dish.value, addedToday: true }
    uni.$emit('meal:changed')
    uni.showToast({ title: '已加到今天', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || '加入失败', icon: 'none' })
  }
}

async function addWeekly() {
  if (!dish.value.id || dish.value.selectedThisWeek) return
  try {
    await addDishToWeeklySelection(dish.value.id, date.value)
    dish.value = { ...dish.value, selectedThisWeek: true }
    uni.$emit('meal:changed')
    uni.showToast({ title: '已加入本周', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || '加入失败', icon: 'none' })
  }
}

function previewCover() {
  const url = resolveMediaUrl(dish.value.coverUrl)
  if (!url) return
  previewImages([url], url)
}

function goEdit() {
  if (!dish.value.id) return
  goPage(`/pages/modules/meal/edit?id=${encodeURIComponent(dish.value.id)}`)
}

function confirmDelete() {
  if (!dish.value.id) return
  uni.showModal({
    title: '删除菜品',
    content: '删除后会同时从今日菜单和本周精选中移除，是否继续？',
    confirmText: '删除',
    confirmColor: '#d06050',
    cancelText: '取消',
    success: async (result) => {
      if (!result.confirm) return
      await handleDelete()
    }
  })
}

async function handleDelete() {
  try {
    await deleteMealDish(dish.value.id)
    uni.$emit('meal:changed')
    uni.showToast({ title: '已删除', icon: 'success' })
    setTimeout(() => backPage(), 500)
  } catch (error) {
    uni.showToast({ title: error?.message || '删除失败', icon: 'none' })
  }
}

function goBack() {
  backPage()
}
</script>

<style scoped lang="scss">
@import './meal-page.scss';

.detail-page {
  padding-bottom: 40rpx;
}

.save-icon {
  width: 28rpx;
  height: 28rpx;
}

.detail-content {
  position: relative;
  z-index: 1;
  padding-top: 28rpx;
}

.hero-card {
  margin-top: 0;
  overflow: hidden;
  border-radius: 44rpx;
}

.hero-cover {
  height: 420rpx;
  overflow: hidden;
  border-radius: 44rpx 44rpx 0 0;
}

.cover-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 250, 246, 0.86);
  font-size: 34rpx;
  letter-spacing: 4rpx;
}

.hero-info {
  padding: 30rpx 34rpx 34rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.dish-name {
  font-size: 42rpx;
  line-height: 1.25;
  color: #6b3f32;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.dish-memory {
  font-size: 24rpx;
  line-height: 1.7;
  color: #9b7060;
}

.action-card {
  margin-top: 26rpx;
  padding: 24rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
  box-sizing: border-box;
}

.action-btn {
  height: 82rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  letter-spacing: 2rpx;
}

.action-btn.primary {
  color: #fff8f4;
  background: linear-gradient(165deg, #e8877a 4%, #d4635a 96%);
  box-shadow: 0 10rpx 22rpx rgba(224, 123, 106, 0.28);
}

.action-btn.secondary {
  color: #9b7060;
  background: rgba(245, 235, 228, 0.72);
}

.action-btn.done {
  color: #7aaa88;
  background: rgba(156, 184, 144, 0.15);
  box-shadow: none;
}

.usage-card {
  margin-top: 26rpx;
  padding: 28rpx 20rpx;
  display: grid;
  grid-template-columns: 1fr 1rpx 1fr 1rpx 1.25fr;
  align-items: center;
  box-sizing: border-box;
}

.usage-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.usage-value {
  max-width: 100%;
  color: #6b3f32;
  font-size: 34rpx;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.usage-value.small {
  font-size: 24rpx;
}

.usage-label {
  color: #b8896e;
  font-size: 19rpx;
  letter-spacing: 1rpx;
}

.usage-line {
  width: 1rpx;
  height: 54rpx;
  background: rgba(201, 168, 122, 0.16);
}

.section-card,
.meta-card {
  margin-top: 26rpx;
  padding: 32rpx 34rpx;
  box-sizing: border-box;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 14rpx;
  font-size: 23rpx;
  color: #8a6255;
  letter-spacing: 2rpx;
}

.section-mark {
  width: 6rpx;
  height: 24rpx;
  border-radius: 4rpx;
  background: rgba(201, 168, 122, 0.62);
}

.section-copy {
  margin-top: 22rpx;
  display: block;
  font-size: 27rpx;
  line-height: 1.8;
  color: #6b3f32;
  white-space: pre-wrap;
}

.meta-row {
  min-height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  font-size: 23rpx;
  color: #9b7060;
}

.meta-row text:last-child {
  color: #6b3f32;
  text-align: right;
}

.danger-card {
  margin-top: 26rpx;
  height: 82rpx;
  color: #d06050;
  background: rgba(224, 123, 106, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25rpx;
  letter-spacing: 2rpx;
}

.empty-card {
  margin-top: 40rpx;
  padding: 52rpx 30rpx;
  text-align: center;
  color: #b8896e;
  font-size: 24rpx;
}
</style>
