<template>
  <view class="meal-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="meal-bg"></view>

    <view class="meal-topbar">
      <view class="icon-btn" @click="goBack">
        <image class="top-icon" :src="iconBack" mode="aspectFit" />
      </view>
      <text class="top-title">今天吃什么</text>
      <view class="top-spacer"></view>
    </view>

    <view class="meal-hero">
      <image class="bowl-icon" :src="bowlIcon" mode="aspectFit" />
      <text class="hero-title">今天，想和你吃点什么？</text>
      <text class="hero-subtitle">把想吃的菜，留给今晚的我们。</text>
    </view>

    <view class="date-card glass-card">
      <view class="date-arrow" @click="changeDate(-1)">
        <image :src="iconPrev" mode="aspectFit" />
      </view>
      <view class="date-center">
        <view class="date-line"><text>今天</text><text>{{ dateLabel }}</text></view>
        <text class="week-line">{{ dailyPlan.weekLabel || weekLabel }}</text>
      </view>
      <view class="date-arrow" @click="changeDate(1)">
        <image :src="iconNext" mode="aspectFit" />
      </view>
    </view>

    <view class="section-head">
      <view class="section-title"><view class="section-mark"></view><text>今天的菜单</text></view>
      <text class="section-extra">共 {{ dailyPlan.dishCount || 0 }} 道</text>
    </view>

    <view class="menu-card glass-card">
      <template v-if="groupedDailyList.length">
        <view v-for="group in groupedDailyList" :key="group.category" class="dish-group">
          <view class="group-head">
            <text class="cat-tag" :class="`cat-${group.category}`">{{ group.label }}</text>
            <text class="group-count">{{ group.items.length }} 道</text>
          </view>
          <view v-for="item in group.items" :key="item.itemId" class="daily-dish-row">
            <view class="dish-cover" :class="`cover-${item.dish.category}`">
              <image v-if="item.dish.coverUrl" class="dish-image" :src="resolveMediaUrl(item.dish.coverUrl)" mode="aspectFill" />
            </view>
            <view class="daily-dish-main">
              <text class="dish-name">{{ item.dish.name }}</text>
              <text v-if="item.dish.preferenceLabel" class="pref-tag" :class="`pref-${item.dish.preference}`">{{ item.dish.preferenceLabel }}</text>
            </view>
            <view class="row-remove" @click="removeItem(item.itemId)">
              <image :src="iconClose" mode="aspectFit" />
            </view>
          </view>
        </view>
        <view class="card-divider"></view>
      </template>
      <view v-else class="empty-menu">今天还没选菜</view>

      <view class="add-row" @click="goRecipes">
        <view class="add-icon"><image :src="iconPlus" mode="aspectFit" /></view>
        <text>再选一道</text>
      </view>
      <view class="menu-foot">✦ {{ dailyPlan.remark || '今天吃得很满足' }}</view>
    </view>

    <view class="remark-card glass-card">
      <view class="remark-head">
        <image :src="iconNote" mode="aspectFit" />
        <text>菜单备注</text>
      </view>
      <textarea
        v-model="remarkDraft"
        class="remark-input"
        maxlength="500"
        auto-height
        placeholder="给今天的菜单留句话"
        placeholder-class="meal-placeholder"
        @blur="saveRemark"
      />
    </view>

    <view class="section-head weekly-head">
      <view class="section-title"><view class="section-mark"></view><text>本周精选</text></view>
      <text class="section-extra" @click="goWeekly">查看全部 →</text>
    </view>

    <view class="weekly-card glass-card" @click="goWeekly">
      <text class="weekly-copy">留几道菜，等我们慢慢吃</text>
      <view class="weekly-content">
        <view class="weekly-stack">
          <view v-for="(dish, index) in weeklyPreview" :key="dish.id || index" class="weekly-thumb" :class="`cover-${dish.category || 'hot'}`">
            <image v-if="dish.coverUrl" class="dish-image" :src="resolveMediaUrl(dish.coverUrl)" mode="aspectFill" />
          </view>
        </view>
        <view class="weekly-text">
          <text>本周想吃的 {{ weekly.dishCount || 0 }} 道菜</text>
          <text>点击查看全部 →</text>
        </view>
      </view>
    </view>

    <view class="page-bottom"></view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  fetchMealDailyPlan,
  fetchMealWeeklySelection,
  removeDailyPlanItem,
  saveMealDailyPlan
} from '@/services/meals.js'
import { requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import iconBack from '@/assets/meal/icon-back.svg'
import iconPrev from '@/assets/meal/icon-prev.svg'
import iconNext from '@/assets/meal/icon-next.svg'
import iconClose from '@/assets/meal/icon-close.svg'
import iconPlus from '@/assets/meal/icon-plus.svg'
import iconNote from '@/assets/meal/icon-note.svg'
import bowlIcon from '@/assets/meal/bowl.svg'

const { themeStyle } = useThemePage()
const activeDate = ref(formatDate(new Date()))
const dailyPlan = ref({ itemList: [], dishCount: 0, remark: '' })
const weekly = ref({ dishList: [], dishCount: 0 })
const remarkDraft = ref('')

const categoryOrder = ['hot', 'cold', 'soup', 'staple']

const dateLabel = computed(() => {
  const date = parseDate(activeDate.value)
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
})

const weekLabel = computed(() => {
  const labels = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return labels[parseDate(activeDate.value).getDay()]
})

const groupedDailyList = computed(() => {
  const map = new Map()
  for (const item of dailyPlan.value.itemList || []) {
    const category = item?.dish?.category || 'hot'
    if (!map.has(category)) {
      map.set(category, { category, label: resolveCategoryLabel(category), items: [] })
    }
    map.get(category).items.push(item)
  }
  return [...map.values()].sort((left, right) => categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category))
})

const weeklyPreview = computed(() => {
  const list = weekly.value.dishList || []
  return list.length ? list.slice(0, 3) : [{ category: 'hot' }, { category: 'cold' }, { category: 'staple' }]
})

onShow(async () => {
  if (!requireAuth()) return
  await loadPage()
})

async function loadPage() {
  try {
    const [dailyResult, weeklyResult] = await Promise.all([
      fetchMealDailyPlan(activeDate.value),
      fetchMealWeeklySelection(activeDate.value)
    ])
    dailyPlan.value = dailyResult
    weekly.value = weeklyResult
    remarkDraft.value = dailyResult.remark || ''
  } catch (error) {
    uni.showToast({ title: error?.message || '菜单加载失败', icon: 'none' })
  }
}

async function saveRemark() {
  if (remarkDraft.value === (dailyPlan.value.remark || '')) return
  try {
    dailyPlan.value = await saveMealDailyPlan(activeDate.value, {
      remark: remarkDraft.value,
      dishIds: (dailyPlan.value.itemList || []).map((item) => item.dish.id)
    })
    remarkDraft.value = dailyPlan.value.remark || ''
  } catch (error) {
    uni.showToast({ title: error?.message || '备注保存失败', icon: 'none' })
  }
}

async function removeItem(itemId) {
  try {
    dailyPlan.value = await removeDailyPlanItem(itemId, activeDate.value)
    remarkDraft.value = dailyPlan.value.remark || ''
  } catch (error) {
    uni.showToast({ title: error?.message || '移除失败', icon: 'none' })
  }
}

async function changeDate(offset) {
  const date = parseDate(activeDate.value)
  date.setDate(date.getDate() + offset)
  activeDate.value = formatDate(date)
  await loadPage()
}

function goRecipes() {
  goPage(`/pages/modules/meal/recipes?date=${encodeURIComponent(activeDate.value)}`)
}

function goWeekly() {
  goPage(`/pages/modules/meal/weekly?date=${encodeURIComponent(activeDate.value)}`)
}

function goBack() {
  backPage()
}

function resolveCategoryLabel(category) {
  if (category === 'cold') return '凉菜'
  if (category === 'soup') return '汤'
  if (category === 'staple') return '主食'
  return '热菜'
}

function parseDate(value) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.meal-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(134deg, #fdf4ee 8%, #fceae0 46%, #f8d9ce 92%);
  color: #6b3f32;
}

.meal-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 64% 0%, rgba(244, 190, 175, 0.22), transparent 38%),
    radial-gradient(circle at 0% 46%, rgba(240, 208, 196, 0.18), transparent 34%),
    radial-gradient(circle at 86% 70%, rgba(232, 196, 160, 0.15), transparent 32%);
}

.meal-topbar {
  position: relative;
  z-index: 1;
  padding: var(--app-account-topbar-padding-top) 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon-btn {
  width: 68rpx;
  height: 68rpx;
  border-radius: 34rpx;
  background: rgba(255, 250, 246, 0.84);
  border: 1rpx solid rgba(220, 160, 130, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(180, 80, 60, 0.07);
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-icon {
  width: 30rpx;
  height: 30rpx;
}

.top-title {
  font-size: 37rpx;
  line-height: 1.5;
  letter-spacing: 4rpx;
  color: #6b3f32;
}

.top-spacer {
  width: 68rpx;
  height: 68rpx;
}

.meal-hero {
  position: relative;
  z-index: 1;
  padding: 40rpx 40rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bowl-icon {
  align-self: flex-start;
  width: 144rpx;
  height: 112rpx;
}

.hero-title {
  margin-top: 20rpx;
  font-size: 49rpx;
  line-height: 1.3;
  letter-spacing: 3rpx;
  color: #6b3f32;
  text-align: center;
}

.hero-subtitle {
  margin-top: 12rpx;
  font-size: 23rpx;
  line-height: 1.5;
  letter-spacing: 1rpx;
  color: #b8896e;
}

.glass-card {
  position: relative;
  z-index: 1;
  margin-left: 40rpx;
  margin-right: 40rpx;
  border-radius: 32rpx;
  background: rgba(255, 250, 246, 0.86);
  border: 1rpx solid rgba(220, 160, 130, 0.14);
  box-shadow: 0 12rpx 56rpx rgba(180, 80, 60, 0.07), inset 0 2rpx 0 rgba(255, 255, 255, 0.9);
}

.date-card {
  margin-top: 32rpx;
  min-height: 141rpx;
  padding: 20rpx 37rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.date-arrow image {
  width: 26rpx;
  height: 26rpx;
}

.date-center {
  text-align: center;
}

.date-line {
  display: flex;
  align-items: baseline;
  gap: 18rpx;
  justify-content: center;
}

.date-line text:first-child {
  font-size: 34rpx;
}

.date-line text:last-child,
.week-line {
  font-size: 23rpx;
  color: #b8896e;
}

.week-line {
  margin-top: 12rpx;
  display: block;
  color: #c9a87a;
}

.section-head {
  position: relative;
  z-index: 1;
  margin: 40rpx 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 14rpx;
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.section-mark {
  width: 6rpx;
  height: 24rpx;
  border-radius: 4rpx;
  background: rgba(201, 168, 122, 0.62);
}

.section-extra {
  font-size: 19rpx;
  color: #c9a87a;
}

.menu-card {
  margin-top: 24rpx;
  overflow: hidden;
  border-radius: 44rpx;
}

.dish-group {
  padding-top: 20rpx;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 36rpx 12rpx;
}

.cat-tag,
.pref-tag {
  width: fit-content;
  border-radius: 14rpx;
  padding: 4rpx 14rpx;
  font-size: 18rpx;
  line-height: 1.5;
}

.cat-hot { color: #b84030; background: rgba(224, 123, 106, 0.13); }
.cat-cold { color: #388060; background: rgba(100, 180, 130, 0.13); }
.cat-soup { color: #3860a0; background: rgba(100, 140, 200, 0.13); }
.cat-staple { color: #806010; background: rgba(210, 168, 80, 0.14); }

.group-count {
  font-size: 18rpx;
  color: #b8896e;
  opacity: 0.6;
}

.daily-dish-row {
  min-height: 89rpx;
  padding: 18rpx 36rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.dish-cover,
.weekly-thumb {
  overflow: hidden;
  border-radius: 24rpx;
  background: linear-gradient(145deg, #f0a880, #e07860);
  border: 1rpx solid rgba(255, 255, 255, 0.4);
}

.dish-cover {
  width: 88rpx;
  height: 88rpx;
}

.cover-cold { background: linear-gradient(145deg, #a8c890, #80a870); }
.cover-hot { background: linear-gradient(145deg, #f0a880, #e07860); }
.cover-soup { background: linear-gradient(145deg, #c0d4e8, #a0b8d0); }
.cover-staple { background: linear-gradient(145deg, #f0d890, #d8b860); }

.dish-image {
  width: 100%;
  height: 100%;
}

.daily-dish-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.dish-name {
  font-size: 27rpx;
  line-height: 1.5;
  color: #6b3f32;
  font-weight: 600;
}

.pref-me { color: #c05840; background: rgba(224, 123, 106, 0.12); border: 1rpx solid rgba(224, 123, 106, 0.26); }
.pref-partner { color: #906820; background: rgba(201, 168, 122, 0.14); border: 1rpx solid rgba(201, 168, 122, 0.28); }
.pref-both { color: #a03868; background: rgba(210, 140, 170, 0.12); border: 1rpx solid rgba(210, 140, 170, 0.26); }

.row-remove image {
  width: 28rpx;
  height: 28rpx;
}

.card-divider {
  height: 1rpx;
  margin: 0 36rpx;
  background: rgba(201, 168, 122, 0.1);
}

.empty-menu {
  padding: 58rpx 36rpx 20rpx;
  color: #b8896e;
  font-size: 24rpx;
}

.add-row {
  padding: 26rpx 36rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  color: #c9a87a;
  font-size: 25rpx;
}

.add-icon {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background: rgba(224, 123, 106, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon image {
  width: 22rpx;
  height: 22rpx;
}

.menu-foot {
  padding: 10rpx 36rpx 28rpx;
  color: #9b7060;
  opacity: 0.65;
  font-size: 19rpx;
  letter-spacing: 1rpx;
}

.remark-card {
  margin-top: 32rpx;
  padding: 29rpx 33rpx;
  box-sizing: border-box;
}

.remark-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #9b7060;
  font-size: 20rpx;
  letter-spacing: 1rpx;
}

.remark-head image {
  width: 24rpx;
  height: 24rpx;
}

.remark-input {
  margin-top: 16rpx;
  width: 100%;
  min-height: 44rpx;
  font-size: 26rpx;
  line-height: 1.65;
  color: #6b3f32;
}

.weekly-head {
  margin-top: 40rpx;
}

.weekly-card {
  margin-top: 24rpx;
  min-height: 207rpx;
  padding: 37rpx 40rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.weekly-copy {
  font-size: 22rpx;
  color: #b8896e;
  letter-spacing: 1rpx;
}

.weekly-content {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.weekly-stack {
  display: flex;
  min-width: 140rpx;
}

.weekly-thumb {
  width: 80rpx;
  height: 80rpx;
  border-radius: 22rpx;
  border: 4rpx solid rgba(255, 248, 244, 0.9);
  margin-right: -20rpx;
}

.weekly-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.weekly-text text:first-child {
  font-size: 26rpx;
  font-weight: 600;
}

.weekly-text text:last-child {
  font-size: 19rpx;
  color: #c9a87a;
}

.page-bottom {
  height: 64rpx;
}
</style>
