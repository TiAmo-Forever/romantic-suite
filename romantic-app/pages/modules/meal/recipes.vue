<template>
  <view class="meal-page recipe-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="meal-bg"></view>

    <view class="meal-topbar">
      <view class="icon-btn" @click="goBack"><image class="top-icon" :src="iconBack" mode="aspectFit" /></view>
      <text class="top-title">一起收藏的味道</text>
      <view class="top-spacer"></view>
    </view>

    <view class="search-card glass-card">
      <image class="search-icon" :src="iconSearch" mode="aspectFit" />
      <input
        v-model="keyword"
        class="search-input"
        placeholder="搜一搜想吃的菜"
        placeholder-class="meal-placeholder"
        confirm-type="search"
        @confirm="searchDishes"
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
        <view class="dish-photo" :class="`cover-${dish.category}`" @click="previewDishImage(dish)">
          <image v-if="dish.coverUrl" class="dish-image" :src="resolveMediaUrl(dish.coverUrl)" mode="aspectFill" />
          <text class="cat-tag" :class="`cat-${dish.category}`">{{ dish.categoryLabel }}</text>
        </view>
        <view class="dish-info">
          <text class="dish-name">{{ dish.name }}</text>
          <text v-if="dish.preferenceLabel" class="pref-tag" :class="`pref-${dish.preference}`">{{ dish.preferenceLabel }}</text>
          <text v-if="dish.memory" class="dish-memory">{{ dish.memory }}</text>
          <view class="dish-actions">
            <text class="link-btn" @click="goDishDetail(dish.id)">{{ dish.recipe ? '看看怎么做' : '查看详情' }}</text>
            <view class="add-today-btn" :class="{ done: isPrimaryDone(dish) }" @click="handlePrimary(dish)">
              {{ primaryButtonText(dish) }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="empty-card glass-card">
      <text class="empty-title">{{ emptyTitle }}</text>
      <view class="empty-actions">
        <view v-if="hasActiveFilter" class="empty-action" @click="resetFilters">换个筛选</view>
        <view class="empty-action primary" @click="goEdit()">添一道菜</view>
      </view>
    </view>

    <view v-if="dishList.length" class="pagination-state">
      <text v-if="loadingMore">正在继续加载...</text>
      <text v-else-if="hasMore">上滑继续看更多菜</text>
      <text v-else>已经看到全部菜品</text>
    </view>

    <view class="create-fixed" @click="goEdit()">
      <image :src="iconAdd" mode="aspectFit" />
      <text>添一道菜</text>
    </view>

    <view class="page-bottom"></view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app'
import { addDishToDailyPlan, addDishToWeeklySelection, fetchMealDishes, MEAL_CATEGORIES, MEAL_PREFERENCES } from '@/services/meals.js'
import { requireAuth } from '@/utils/auth.js'
import { previewImages } from '@/utils/image-preview.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import iconBack from '@/assets/meal/icon-back.svg'
import iconSearch from '@/assets/meal/icon-search.svg'
import iconAdd from '@/assets/meal/icon-add.svg'

const { themeStyle } = useThemePage()
const categories = MEAL_CATEGORIES
const preferences = MEAL_PREFERENCES
const date = ref('')
const weeklyMode = ref(false)
const category = ref('all')
const preference = ref('all')
const keyword = ref('')
const dishList = ref([])
const page = ref(1)
const hasMore = ref(false)
const loadingInitial = ref(false)
const loadingMore = ref(false)
const PAGE_SIZE = 10

const hasActiveFilter = computed(() => {
  return category.value !== 'all' || preference.value !== 'all' || Boolean(keyword.value.trim())
})

const emptyTitle = computed(() => hasActiveFilter.value ? '没有找到合适的菜' : '还没有收藏菜品')

onLoad((options) => {
  date.value = String(options?.date || '').trim()
  weeklyMode.value = String(options?.weekly || '') === '1'
})

onShow(async () => {
  if (!requireAuth()) return
  await loadDishes({ reset: true })
})

onReachBottom(() => {
  loadDishes()
})

async function loadDishes(options = {}) {
  const reset = Boolean(options.reset)
  if (loadingInitial.value || loadingMore.value) return
  if (!reset && !hasMore.value) return
  if (reset) {
    loadingInitial.value = true
  } else {
    loadingMore.value = true
  }
  const targetPage = reset ? 1 : page.value + 1
  try {
    const pageData = await fetchMealDishes({
      category: category.value,
      preference: preference.value,
      keyword: keyword.value,
      date: date.value,
      page: targetPage,
      pageSize: PAGE_SIZE
    })
    dishList.value = reset ? pageData.list : dishList.value.concat(pageData.list)
    page.value = pageData.page
    hasMore.value = pageData.hasMore
  } catch (error) {
    uni.showToast({ title: error?.message || '菜谱加载失败', icon: 'none' })
  } finally {
    loadingInitial.value = false
    loadingMore.value = false
  }
}

async function changeCategory(value) {
  if (category.value === value) return
  category.value = value
  await loadDishes({ reset: true })
}

async function changePreference(value) {
  preference.value = preference.value === value ? 'all' : value
  await loadDishes({ reset: true })
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
    uni.$emit('meal:changed')
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

function goDishDetail(id) {
  if (!id) return
  const query = [
    `id=${encodeURIComponent(id)}`,
    `date=${encodeURIComponent(date.value)}`,
    weeklyMode.value ? 'weekly=1' : ''
  ].filter(Boolean).join('&')
  goPage(`/pages/modules/meal/detail?${query}`)
}

function previewDishImage(dish) {
  const url = resolveMediaUrl(dish?.coverUrl)
  if (!url) {
    return
  }
  previewImages([url], url)
}

function searchDishes() {
  loadDishes({ reset: true })
}

function resetFilters() {
  category.value = 'all'
  preference.value = 'all'
  keyword.value = ''
  loadDishes({ reset: true })
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18rpx;
}

.empty-title {
  color: #6b3f32;
  font-size: 30rpx;
  font-weight: 600;
}

.empty-actions {
  margin-top: 8rpx;
  display: flex;
  justify-content: center;
  gap: 16rpx;
}

.empty-action {
  min-width: 138rpx;
  height: 58rpx;
  border-radius: 24rpx;
  background: rgba(245, 235, 228, 0.72);
  color: #9b7060;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
}

.empty-action.primary {
  color: #fff8f4;
  background: linear-gradient(165deg, #e8877a 4%, #d4635a 96%);
}

.pagination-state {
  position: relative;
  z-index: 1;
  margin: 28rpx 40rpx 0;
  text-align: center;
  font-size: 21rpx;
  color: rgba(107, 63, 50, 0.55);
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
</style>
