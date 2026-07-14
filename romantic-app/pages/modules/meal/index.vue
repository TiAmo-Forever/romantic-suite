<template>
  <view class="meal-page" :style="themeStyle">
    <GlobalNotificationBanner />
    <view class="meal-bg"></view>

    <view class="meal-topbar">
      <view class="icon-btn" @click="goBack">
        <image class="top-icon" :src="iconBack" mode="aspectFit" />
      </view>
      <text class="top-title">朝夕同味</text>
      <view class="top-spacer"></view>
    </view>

    <view class="meal-hero">
      <image class="bowl-icon" :src="bowlIcon" mode="aspectFit" />
      <text class="hero-title">朝夕同味，今天想吃什么？</text>
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
      <view class="section-extra menu-tools"><text>共 {{ dailyPlan.dishCount || 0 }} 道</text></view>
    </view>

    <view class="menu-card glass-card">
      <template v-if="orderedDailyList.length">
        <view v-for="(item, index) in visibleDailyList" :key="item.itemId" class="daily-dish-row">
          <view class="dish-row-top">
            <view class="order-no">{{ index + 1 }}</view>
            <view class="dish-cover" :class="`cover-${item.dish.category}`" @click="goDishDetail(item.dish.id)">
              <image v-if="item.dish.coverUrl" class="dish-image" :src="resolveMediaUrl(item.dish.coverUrl)" mode="aspectFill" />
            </view>
            <view class="daily-dish-main" @click="goDishDetail(item.dish.id)">
              <text class="dish-name">{{ item.dish.name }}</text>
              <view class="dish-tag-row">
                <text class="cat-tag" :class="`cat-${item.dish.category}`">{{ item.dish.categoryLabel || resolveCategoryLabel(item.dish.category) }}</text>
                <text v-if="item.dish.preferenceLabel" class="pref-tag" :class="`pref-${item.dish.preference}`">{{ item.dish.preferenceLabel }}</text>
              </view>
            </view>
            <view class="row-remove" @click.stop="removeItem(item.itemId)">×</view>
          </view>
          <view class="row-actions">
            <view class="action-link" @click.stop="replaceItem(item.itemId)">换一道</view>
            <view class="action-link" :class="{ disabled: index === 0 }" @click.stop="moveItem(index, -1)">上移</view>
            <view class="action-link" :class="{ disabled: index === orderedDailyList.length - 1 }" @click.stop="moveItem(index, 1)">下移</view>
          </view>
        </view>
        <view v-if="hasFoldedDishes" class="fold-row" @click="toggleMenuExpanded">
          {{ menuExpanded ? '收起菜单' : `展开全部 ${orderedDailyList.length} 道` }}
        </view>
        <view class="card-divider"></view>
      </template>
      <view v-else class="empty-menu">
        <text>今天还没选菜</text>
        <view class="empty-actions">
          <view class="empty-action" @click="copyYesterday">复制昨天</view>
          <view class="empty-action primary" @click="goRecipes">去选菜</view>
        </view>
      </view>

      <view class="menu-action-row">
        <view class="menu-action-item" @click="goRecipes">
          <view class="add-icon"><image :src="iconPlus" mode="aspectFit" /></view>
          <text>再选一道</text>
        </view>
        <view class="menu-action-item copy-action" @click="copyYesterday">
          <view class="add-icon"><image :src="iconPlus" mode="aspectFit" /></view>
          <text>复制昨天</text>
        </view>
      </view>
      <view v-if="dailyPlan.remark" class="menu-foot">✦ {{ dailyPlan.remark }}</view>
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
import { computed, onBeforeUnmount, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  fetchMealDailyPlan,
  fetchMealWeeklySelection,
  copyPreviousDailyPlan,
  removeDailyPlanItem,
  replaceDailyPlanItem,
  saveMealDailyPlan
} from '@/services/meals.js'
import { requireAuth } from '@/utils/auth.js'
import { resolveMediaUrl } from '@/utils/media-upload.js'
import { backPage, goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import iconBack from '@/assets/meal/icon-back.svg'
import iconPrev from '@/assets/meal/icon-prev.svg'
import iconNext from '@/assets/meal/icon-next.svg'
import iconPlus from '@/assets/meal/icon-plus.svg'
import iconNote from '@/assets/meal/icon-note.svg'
import bowlIcon from '@/assets/meal/bowl.svg'

const { themeStyle } = useThemePage()
const activeDate = ref(formatDate(new Date()))
const dailyPlan = ref({ itemList: [], dishCount: 0, remark: '' })
const weekly = ref({ dishList: [], dishCount: 0 })
const remarkDraft = ref('')
const menuExpanded = ref(false)

const dateLabel = computed(() => {
  const date = parseDate(activeDate.value)
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
})

const weekLabel = computed(() => {
  const labels = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return labels[parseDate(activeDate.value).getDay()]
})

const orderedDailyList = computed(() => dailyPlan.value.itemList || [])

const hasFoldedDishes = computed(() => orderedDailyList.value.length > 4)

const visibleDailyList = computed(() => {
  if (menuExpanded.value || !hasFoldedDishes.value) {
    return orderedDailyList.value
  }
  return orderedDailyList.value.slice(0, 4)
})

const weeklyPreview = computed(() => {
  const list = weekly.value.dishList || []
  return list.length ? list.slice(0, 3) : [{ category: 'hot' }, { category: 'cold' }, { category: 'staple' }]
})

onLoad((options) => {
  const routeDate = String(options?.date || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(routeDate)) {
    activeDate.value = routeDate
  }
})

onShow(async () => {
  if (!requireAuth()) return
  await loadPage()
})

uni.$on('meal:changed', loadPage)

onBeforeUnmount(() => {
  uni.$off('meal:changed', loadPage)
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
    if ((dailyResult.itemList || []).length <= 4) {
      menuExpanded.value = false
    }
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

async function replaceItem(itemId) {
  try {
    dailyPlan.value = await replaceDailyPlanItem(itemId, activeDate.value)
    remarkDraft.value = dailyPlan.value.remark || ''
    uni.showToast({ title: '已换一道', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || '替换失败', icon: 'none' })
  }
}

function copyYesterday() {
  uni.showModal({
    title: '复制昨天菜单',
    content: orderedDailyList.value.length ? '会用昨天的菜单替换今天的菜单，是否继续？' : '把昨天的菜单复制到今天，是否继续？',
    confirmText: '复制',
    cancelText: '取消',
    success: async (result) => {
      if (!result.confirm) return
      await handleCopyYesterday()
    }
  })
}

function toggleMenuExpanded() {
  menuExpanded.value = !menuExpanded.value
}

async function handleCopyYesterday() {
  try {
    dailyPlan.value = await copyPreviousDailyPlan(activeDate.value)
    remarkDraft.value = dailyPlan.value.remark || ''
    uni.showToast({ title: '已复制昨天', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error?.message || '复制失败', icon: 'none' })
  }
}

async function moveItem(index, offset) {
  const list = [...(dailyPlan.value.itemList || [])]
  const targetIndex = index + offset
  if (targetIndex < 0 || targetIndex >= list.length) return
  const current = list[index]
  list[index] = list[targetIndex]
  list[targetIndex] = current
  dailyPlan.value = {
    ...dailyPlan.value,
    itemList: list.map((item, nextIndex) => ({ ...item, sortOrder: nextIndex }))
  }
  await saveDailyOrder()
}

async function saveDailyOrder() {
  try {
    dailyPlan.value = await saveMealDailyPlan(activeDate.value, {
      remark: remarkDraft.value,
      dishIds: (dailyPlan.value.itemList || []).map((item) => item.dish.id)
    })
    remarkDraft.value = dailyPlan.value.remark || ''
  } catch (error) {
    uni.showToast({ title: error?.message || '排序保存失败', icon: 'none' })
    await loadPage()
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

function goDishDetail(id) {
  if (!id) return
  goPage(`/pages/modules/meal/detail?id=${encodeURIComponent(id)}&date=${encodeURIComponent(activeDate.value)}`)
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
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", sans-serif;
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
  font-size: 25rpx;
  letter-spacing: 2rpx;
}

.section-mark {
  width: 6rpx;
  height: 24rpx;
  border-radius: 4rpx;
  background: rgba(201, 168, 122, 0.62);
}

.section-extra {
  font-size: 22rpx;
  color: #c9a87a;
}

.menu-tools {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.menu-card {
  margin-top: 24rpx;
  overflow: hidden;
  border-radius: 44rpx;
}

.cat-tag,
.pref-tag {
  width: fit-content;
  border-radius: 18rpx;
  padding: 6rpx 18rpx;
  font-size: 22rpx;
  line-height: 1.45;
}

.cat-hot { color: #b84030; background: rgba(224, 123, 106, 0.13); }
.cat-cold { color: #388060; background: rgba(100, 180, 130, 0.13); }
.cat-soup { color: #3860a0; background: rgba(100, 140, 200, 0.13); }
.cat-staple { color: #806010; background: rgba(210, 168, 80, 0.14); }

.daily-dish-row {
  padding: 30rpx 34rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.dish-row-top {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 22rpx;
}

.order-no {
  width: 54rpx;
  height: 54rpx;
  border-radius: 27rpx;
  background: rgba(224, 123, 106, 0.1);
  color: #d06050;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23rpx;
  font-weight: 600;
}

.dish-cover,
.weekly-thumb {
  overflow: hidden;
  border-radius: 24rpx;
  background: linear-gradient(145deg, #f0a880, #e07860);
  border: 1rpx solid rgba(255, 255, 255, 0.4);
}

.dish-cover {
  width: 112rpx;
  height: 112rpx;
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
  gap: 12rpx;
}

.dish-tag-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
  min-width: 0;
}

.dish-name {
  width: 100%;
  font-size: 35rpx;
  line-height: 1.35;
  color: #6b3f32;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pref-me { color: #c05840; background: rgba(224, 123, 106, 0.12); border: 1rpx solid rgba(224, 123, 106, 0.26); }
.pref-partner { color: #906820; background: rgba(201, 168, 122, 0.14); border: 1rpx solid rgba(201, 168, 122, 0.28); }
.pref-both { color: #a03868; background: rgba(210, 140, 170, 0.12); border: 1rpx solid rgba(210, 140, 170, 0.26); }

.row-actions {
  width: 100%;
  padding-left: 188rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 48rpx;
}

.action-link {
  color: #9b7060;
  font-size: 24rpx;
  line-height: 1.5;
}

.action-link.disabled {
  opacity: 0.32;
}

.row-remove {
  width: 50rpx;
  height: 50rpx;
  border-radius: 25rpx;
  color: rgba(208, 96, 80, 0.54);
  background: rgba(224, 123, 106, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  line-height: 1;
}

.fold-row {
  margin: 2rpx 36rpx 8rpx;
  height: 64rpx;
  border-radius: 26rpx;
  background: rgba(245, 235, 228, 0.58);
  color: #9b7060;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23rpx;
  letter-spacing: 1rpx;
}

.card-divider {
  height: 1rpx;
  margin: 2rpx 34rpx 0;
  background: rgba(201, 168, 122, 0.1);
}

.empty-menu {
  padding: 58rpx 36rpx 24rpx;
  color: #b8896e;
  font-size: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.empty-actions {
  display: flex;
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

.menu-action-row {
  padding: 22rpx 32rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.menu-action-item {
  min-width: 158rpx;
  height: 66rpx;
  padding: 0 26rpx;
  box-sizing: border-box;
  border-radius: 28rpx;
  background: rgba(255, 244, 238, 0.92);
  border: 1rpx solid rgba(224, 123, 106, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  color: #d06050;
  font-size: 26rpx;
}

.copy-action {
  color: #8f6b3e;
  background: rgba(255, 248, 231, 0.92);
  border-color: rgba(201, 168, 122, 0.18);
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

.copy-action .add-icon {
  background: rgba(201, 168, 122, 0.16);
}

.add-icon image {
  width: 22rpx;
  height: 22rpx;
}

.menu-foot {
  padding: 10rpx 36rpx 28rpx;
  color: #9b7060;
  opacity: 0.65;
  font-size: 22rpx;
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
  font-size: 23rpx;
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
  min-height: 166rpx;
  padding: 30rpx 34rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.weekly-content {
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.weekly-stack {
  display: flex;
  min-width: 156rpx;
}

.weekly-thumb {
  width: 92rpx;
  height: 92rpx;
  border-radius: 24rpx;
  border: 4rpx solid rgba(255, 248, 244, 0.9);
  margin-right: -20rpx;
}

.weekly-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.weekly-text text:first-child {
  font-size: 29rpx;
  font-weight: 600;
}

.weekly-text text:last-child {
  font-size: 24rpx;
  color: #c9a87a;
}

.page-bottom {
  height: 64rpx;
}
</style>
