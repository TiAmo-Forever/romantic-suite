<template>
  <view class="meal-page recipe-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="meal-bg"></view>

    <view class="meal-topbar">
      <view class="icon-btn" @click="goBack"><image class="top-icon" :src="iconBack" mode="aspectFit" /></view>
      <text class="top-title">一起收藏的味道</text>
      <view class="top-spacer"></view>
    </view>

    <view class="intro-copy">把每一道喜欢，都收进我们的菜谱。</view>

    <view class="search-card glass-card">
      <image class="search-icon" :src="iconSearch" mode="aspectFit" />
      <input
        v-model="keyword"
        class="search-input"
        placeholder="搜一搜想吃的菜"
        placeholder-class="meal-placeholder"
        confirm-type="search"
        @confirm="loadDishes"
      />
    </view>

    <scroll-view class="filter-scroll" scroll-x enable-flex :show-scrollbar="false">
      <view class="filter-row">
        <view v-for="item in categories" :key="item.key" class="filter-pill" :class="{ active: category === item.key }" @click="changeCategory(item.key)">
          {{ item.label }}
        </view>
      </view>
    </scroll-view>

    <scroll-view class="pref-scroll" scroll-x enable-flex :show-scrollbar="false">
      <view class="pref-row">
        <view v-for="item in preferences" :key="item.key" class="pref-filter" :class="{ active: preference === item.key }" @click="changePreference(item.key)">
          {{ item.label }}
        </view>
      </view>
    </scroll-view>

    <view v-if="dishList.length" class="dish-grid">
      <view v-for="dish in dishList" :key="dish.id" class="dish-card glass-card">
        <view class="dish-photo" :class="`cover-${dish.category}`" @click="openDish(dish)">
          <image v-if="dish.coverUrl" class="dish-image" :src="resolveMediaUrl(dish.coverUrl)" mode="aspectFill" />
          <text class="cat-tag" :class="`cat-${dish.category}`">{{ dish.categoryLabel }}</text>
        </view>
        <view class="dish-info">
          <text class="dish-name">{{ dish.name }}</text>
          <text v-if="dish.preferenceLabel" class="pref-tag" :class="`pref-${dish.preference}`">{{ dish.preferenceLabel }}</text>
          <text class="dish-memory">{{ dish.memory || '把这道菜补充得更完整一点' }}</text>
          <view class="dish-actions">
            <text class="link-btn" @click="openDish(dish)">{{ dish.recipe ? '看看怎么做' : '查看详情' }}</text>
            <view class="add-today-btn" :class="{ done: isPrimaryDone(dish) }" @click="handlePrimary(dish)">
              {{ primaryButtonText(dish) }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="empty-card glass-card">还没有收藏菜品</view>

    <view class="create-fixed" @click="goEdit()">
      <image :src="iconAdd" mode="aspectFit" />
      <text>添一道菜</text>
    </view>

    <view v-if="activeDish" class="sheet-mask" @click="activeDish = null">
      <view class="dish-sheet" @click.stop>
        <view class="sheet-head">
          <view>
            <text class="sheet-title">{{ activeDish.name }}</text>
            <view class="sheet-tags">
              <text class="cat-tag" :class="`cat-${activeDish.category}`">{{ activeDish.categoryLabel }}</text>
              <text v-if="activeDish.preferenceLabel" class="pref-tag" :class="`pref-${activeDish.preference}`">{{ activeDish.preferenceLabel }}</text>
            </view>
          </view>
          <view class="sheet-close" @click="activeDish = null"><image :src="iconClose" mode="aspectFit" /></view>
        </view>
        <text class="sheet-copy">{{ activeDish.description || activeDish.memory || '这道菜还没有补充说明。' }}</text>
        <view class="recipe-toggle" @click="recipeExpanded = !recipeExpanded">
          <text>制作方法</text>
          <image :class="{ expanded: recipeExpanded }" :src="iconChevron" mode="aspectFit" />
        </view>
        <text v-if="recipeExpanded" class="recipe-content">{{ activeDish.recipe || '还没有记录制作方法。' }}</text>
        <view class="sheet-actions">
          <view class="sheet-secondary" @click="goEdit(activeDish.id)">调整一下</view>
          <view class="sheet-primary" @click="handlePrimary(activeDish)">{{ primaryButtonText(activeDish, true) }}</view>
        </view>
      </view>
    </view>

    <view class="page-bottom"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { addDishToDailyPlan, addDishToWeeklySelection, fetchMealDishes, MEAL_CATEGORIES, MEAL_PREFERENCES } from '@/services/meals.js'
import { requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import iconBack from '@/assets/meal/icon-back.svg'
import iconSearch from '@/assets/meal/icon-search.svg'
import iconAdd from '@/assets/meal/icon-add.svg'
import iconClose from '@/assets/meal/icon-close.svg'
import iconChevron from '@/assets/meal/icon-chevron-down.svg'

const { themeStyle } = useThemePage()
const categories = MEAL_CATEGORIES
const preferences = MEAL_PREFERENCES
const date = ref('')
const weeklyMode = ref(false)
const category = ref('all')
const preference = ref('all')
const keyword = ref('')
const dishList = ref([])
const activeDish = ref(null)
const recipeExpanded = ref(false)

onLoad((options) => {
  date.value = String(options?.date || '').trim()
  weeklyMode.value = String(options?.weekly || '') === '1'
})

onShow(async () => {
  if (!requireAuth()) return
  await loadDishes()
})

async function loadDishes() {
  try {
    dishList.value = await fetchMealDishes({ category: category.value, preference: preference.value, keyword: keyword.value })
  } catch (error) {
    uni.showToast({ title: error?.message || '菜谱加载失败', icon: 'none' })
  }
}

async function changeCategory(value) {
  if (category.value === value) return
  category.value = value
  await loadDishes()
}

async function changePreference(value) {
  preference.value = preference.value === value ? 'all' : value
  await loadDishes()
}

async function handlePrimary(dish) {
  if (!dish?.id || isPrimaryDone(dish)) return
  try {
    if (weeklyMode.value) {
      await addDishToWeeklySelection(dish.id, date.value)
      dish.selectedThisWeek = true
    } else {
      await addDishToDailyPlan(dish.id, date.value)
      dish.addedToday = true
    }
    if (activeDish.value && activeDish.value.id === dish.id) {
      activeDish.value.addedToday = dish.addedToday
      activeDish.value.selectedThisWeek = dish.selectedThisWeek
    }
    uni.showToast({ title: weeklyMode.value ? '已加入本周' : '已加到今天', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || '加入失败', icon: 'none' })
  }
}

function isPrimaryDone(dish) {
  return weeklyMode.value ? Boolean(dish?.selectedThisWeek) : Boolean(dish?.addedToday)
}

function primaryButtonText(dish, expanded = false) {
  if (weeklyMode.value) {
    return isPrimaryDone(dish) ? (expanded ? '已经在本周' : '✓ 已选') : '加入本周'
  }
  return isPrimaryDone(dish) ? (expanded ? '已经在今天' : '✓ 已加') : '加到今天'
}

function openDish(dish) {
  activeDish.value = dish
  recipeExpanded.value = false
}

function goEdit(id = '') {
  const dishId = typeof id === 'string' || typeof id === 'number' ? String(id).trim() : ''
  const query = dishId ? `?id=${encodeURIComponent(dishId)}` : ''
  goPage(`/pages/modules/meal/edit${query}`)
}

function goBack() {
  backPage()
}
</script>

<style scoped lang="scss">
@import './meal-page.scss';

.recipe-page {
  padding-bottom: 120rpx;
}

.intro-copy {
  position: relative;
  z-index: 1;
  margin: 16rpx 40rpx 0;
  font-size: 22rpx;
  line-height: 1.5;
  color: #b8896e;
  letter-spacing: 1rpx;
}

.search-card {
  margin-top: 28rpx;
  min-height: 82rpx;
  padding: 21rpx 29rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-sizing: border-box;
}

.search-icon {
  width: 28rpx;
  height: 28rpx;
}

.search-input {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #6b3f32;
}

.filter-scroll,
.pref-scroll {
  position: relative;
  z-index: 1;
  margin-top: 24rpx;
  white-space: nowrap;
}

.filter-row,
.pref-row {
  display: inline-flex;
  gap: 14rpx;
  padding: 0 40rpx;
}

.filter-pill,
.pref-filter {
  border-radius: 24rpx;
  background: rgba(255, 250, 246, 0.78);
  border: 1rpx solid rgba(220, 160, 130, 0.14);
  color: #9b7060;
  font-size: 22rpx;
  line-height: 1;
}

.filter-pill {
  padding: 18rpx 27rpx;
}

.pref-filter {
  padding: 14rpx 25rpx;
  font-size: 20rpx;
}

.filter-pill.active {
  color: #d06050;
  background: rgba(224, 123, 106, 0.14);
  border-color: rgba(224, 123, 106, 0.3);
}

.pref-filter.active {
  color: #a03868;
  background: rgba(210, 140, 170, 0.12);
  border-color: rgba(210, 140, 170, 0.26);
}

.dish-grid {
  position: relative;
  z-index: 1;
  margin: 28rpx 40rpx 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

.dish-card {
  margin: 0;
  overflow: hidden;
  border-radius: 36rpx;
}

.dish-photo {
  position: relative;
  height: 192rpx;
  border-radius: 36rpx 36rpx 0 0;
  overflow: hidden;
}

.dish-photo .cat-tag {
  position: absolute;
  left: 16rpx;
  bottom: 14rpx;
}

.dish-info {
  padding: 20rpx 22rpx 22rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.dish-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #6b3f32;
}

.dish-memory {
  min-height: 64rpx;
  font-size: 21rpx;
  line-height: 1.55;
  color: #9b7060;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.dish-actions {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.link-btn {
  font-size: 19rpx;
  color: #c9a87a;
}

.add-today-btn {
  padding: 10rpx 18rpx;
  border-radius: 20rpx;
  background: rgba(224, 123, 106, 0.12);
  color: #d06050;
  font-size: 19rpx;
  white-space: nowrap;
}

.add-today-btn.done {
  background: rgba(156, 184, 144, 0.15);
  color: #7aaa88;
}

.empty-card {
  margin-top: 28rpx;
  padding: 48rpx 30rpx;
  text-align: center;
  color: #b8896e;
  font-size: 24rpx;
}

.create-fixed {
  position: fixed;
  z-index: 9;
  left: 50%;
  bottom: 32rpx;
  transform: translateX(-50%);
  height: 82rpx;
  padding: 0 56rpx;
  border-radius: 40rpx;
  background: linear-gradient(165deg, #e8877a 4%, #d4635a 96%);
  box-shadow: 0 12rpx 22rpx rgba(224, 123, 106, 0.38);
  color: #fff8f4;
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 27rpx;
  letter-spacing: 2rpx;
}

.create-fixed image {
  width: 28rpx;
  height: 28rpx;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(63, 42, 36, 0.18);
  display: flex;
  align-items: flex-end;
}

.dish-sheet {
  width: 100%;
  padding: 34rpx 40rpx 44rpx;
  border-radius: 40rpx 40rpx 0 0;
  background: #fffaf6;
  box-shadow: 0 -18rpx 46rpx rgba(180, 80, 60, 0.12);
}

.sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.sheet-title {
  font-size: 36rpx;
  color: #6b3f32;
  font-weight: 600;
}

.sheet-tags {
  margin-top: 14rpx;
  display: flex;
  gap: 10rpx;
}

.sheet-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet-close image {
  width: 28rpx;
  height: 28rpx;
}

.sheet-copy,
.recipe-content {
  margin-top: 26rpx;
  display: block;
  font-size: 26rpx;
  line-height: 1.75;
  color: #8a6255;
  white-space: pre-wrap;
}

.recipe-toggle {
  margin-top: 24rpx;
  padding: 22rpx 0;
  border-top: 1rpx solid rgba(201, 168, 122, 0.16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #9b7060;
  font-size: 24rpx;
}

.recipe-toggle image {
  width: 26rpx;
  height: 26rpx;
  transition: transform 0.2s ease;
}

.recipe-toggle image.expanded {
  transform: rotate(180deg);
}

.sheet-actions {
  margin-top: 30rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18rpx;
}

.sheet-secondary,
.sheet-primary {
  height: 82rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.sheet-secondary {
  color: #9b7060;
  background: rgba(245, 235, 228, 0.68);
}

.sheet-primary {
  color: #fff8f4;
  background: linear-gradient(165deg, #e8877a 4%, #d4635a 96%);
}
</style>
