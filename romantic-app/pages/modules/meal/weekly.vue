<template>
  <view class="meal-page weekly-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="meal-bg"></view>

    <view class="meal-topbar">
      <view class="icon-btn" @click="goBack"><image class="top-icon" :src="iconBack" mode="aspectFit" /></view>
      <text class="top-title">本周精选</text>
      <view class="top-spacer"></view>
    </view>

    <view class="weekly-hero">
      <text class="weekly-title">这一周，想和你吃这些</text>
      <view class="weekly-count">本周想吃的 {{ weekly.dishCount || 0 }} 道菜</view>
    </view>

    <view v-if="weekly.dishList.length" class="weekly-list">
      <view v-for="dish in weekly.dishList" :key="dish.id" class="weekly-row glass-card" @click="goDishDetail(dish.id)">
        <view class="dish-cover" :class="`cover-${dish.category}`">
          <image v-if="dish.coverUrl" class="dish-image" :src="resolveMediaUrl(dish.coverUrl)" mode="aspectFill" />
        </view>
        <view class="dish-main">
          <text class="dish-name">{{ dish.name }}</text>
          <view class="tag-row">
            <text class="cat-tag" :class="`cat-${dish.category}`">{{ dish.categoryLabel }}</text>
            <text v-if="dish.preferenceLabel" class="pref-tag" :class="`pref-${dish.preference}`">{{ dish.preferenceLabel }}</text>
          </view>
        </view>
        <view class="row-tools">
          <view class="remove-icon" @click.stop="removeWeekly(dish.id)"><image :src="iconRemove" mode="aspectFit" /></view>
          <view class="today-btn" :class="{ done: dish.addedToday }" @click.stop="addToday(dish)">
            {{ dish.addedToday ? '✓ 今天' : '加到今天' }}
          </view>
        </view>
      </view>
    </view>
    <view v-else class="empty-card glass-card">本周还没有精选菜</view>

    <view class="join-card" @click="goRecipes">
      <image :src="iconWeekPlus" mode="aspectFit" />
      <text>加入本周精选</text>
    </view>
    <view class="page-bottom"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { addDishToDailyPlan, fetchMealWeeklySelection, removeDishFromWeeklySelection } from '@/services/meals.js'
import { requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import iconBack from '@/assets/meal/icon-back.svg'
import iconRemove from '@/assets/meal/icon-remove.svg'
import iconWeekPlus from '@/assets/meal/icon-week-plus.svg'

const { themeStyle } = useThemePage()
const date = ref('')
const weekly = ref({ dishList: [], dishCount: 0 })

onLoad((options) => {
  date.value = String(options?.date || '').trim()
})

onShow(async () => {
  if (!requireAuth()) return
  await loadWeekly()
})

async function loadWeekly() {
  try {
    weekly.value = await fetchMealWeeklySelection(date.value)
  } catch (error) {
    uni.showToast({ title: error?.message || '本周精选加载失败', icon: 'none' })
  }
}

async function removeWeekly(dishId) {
  try {
    weekly.value = await removeDishFromWeeklySelection(dishId, date.value)
    uni.$emit('meal:changed')
  } catch (error) {
    uni.showToast({ title: error?.message || '移出失败', icon: 'none' })
  }
}

async function addToday(dish) {
  if (!dish?.id || dish.addedToday) return
  try {
    await addDishToDailyPlan(dish.id, date.value)
    dish.addedToday = true
    uni.$emit('meal:changed')
    uni.showToast({ title: '已加到今天', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || '加入失败', icon: 'none' })
  }
}

function goRecipes() {
  goPage(`/pages/modules/meal/recipes?date=${encodeURIComponent(date.value)}&weekly=1`)
}

function goDishDetail(id) {
  if (!id) return
  goPage(`/pages/modules/meal/detail?id=${encodeURIComponent(id)}&date=${encodeURIComponent(date.value)}&weekly=1`)
}

function goBack() {
  backPage()
}
</script>

<style scoped lang="scss">
@import './meal-page.scss';

.weekly-hero {
  position: relative;
  z-index: 1;
  padding: 28rpx 48rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.weekly-title {
  font-size: 42rpx;
  line-height: 1.3;
  letter-spacing: 2rpx;
  color: #6b3f32;
}

.weekly-count {
  margin-top: 24rpx;
  padding: 12rpx 30rpx;
  border-radius: 28rpx;
  background: rgba(224, 123, 106, 0.1);
  border: 1rpx solid rgba(224, 123, 106, 0.22);
  color: #d06050;
  font-size: 21rpx;
  letter-spacing: 1rpx;
}

.weekly-list {
  position: relative;
  z-index: 1;
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.weekly-row {
  min-height: 112rpx;
  padding: 25rpx 29rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 24rpx;
  border-radius: 36rpx;
}

.dish-cover {
  width: 96rpx;
  height: 96rpx;
  border-radius: 26rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.4);
}

.dish-main {
  flex: 1;
  min-width: 0;
}

.dish-name {
  font-size: 28rpx;
  color: #6b3f32;
  font-weight: 600;
}

.tag-row {
  margin-top: 8rpx;
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.row-tools {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.remove-icon {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.55;
}

.remove-icon image {
  width: 100%;
  height: 100%;
}

.today-btn {
  min-width: 112rpx;
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 22rpx;
  background: rgba(224, 123, 106, 0.12);
  color: #d06050;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21rpx;
  white-space: nowrap;
}

.today-btn.done {
  background: rgba(156, 184, 144, 0.15);
  color: #7aaa88;
}

.empty-card {
  margin-top: 32rpx;
  padding: 52rpx 30rpx;
  text-align: center;
  color: #b8896e;
  font-size: 24rpx;
}

.join-card {
  position: relative;
  z-index: 1;
  margin: 32rpx 40rpx 0;
  height: 94rpx;
  border-radius: 36rpx;
  border: 3rpx dashed rgba(201, 168, 122, 0.3);
  background: rgba(255, 250, 246, 0.7);
  color: #c9a87a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  font-size: 25rpx;
}

.join-card image {
  width: 26rpx;
  height: 26rpx;
}
</style>
