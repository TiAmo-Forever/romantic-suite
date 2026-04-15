<template>
  <view class="page romantic-plan-edit-page" :style="themeStyle">
    <GlobalNotificationBanner />

    <view class="page-bg">
      <view class="cloud cloud-left"></view>
      <view class="cloud cloud-right"></view>
      <view class="cloud cloud-bottom"></view>
      <view class="spark spark-a"></view>
      <view class="spark spark-b"></view>
    </view>

    <view class="edit-shell">
      <view class="topbar-row">
        <view class="back-chip" @click="goBack">
          <text class="back-chip-arrow">‹</text>
          <text>返回</text>
        </view>
        <view class="save-chip" @click="submitForm">{{ loading ? '保存中' : '保存' }}</view>
      </view>

      <view class="hero-banner">
        <view class="hero-banner-kicker">计划编辑</view>
        <view class="hero-title-wrap">
          <view class="hero-title">{{ pageTitle }}</view>
          <view class="hero-title-ornament"></view>
        </view>
      </view>

      <view class="section-card hero-card">
        <view class="ribbon ribbon-pink">基础草稿</view>
        <view class="section-card-inner hero-card-inner">
          <view class="hero-copy">
            <view class="hero-copy-title">先确定这份计划的节奏，再补内容与素材</view>
            <view class="hero-copy-desc">
              这版先把类型、时间、地点和条目结构搭起来。封面区单独预留，等你确认视觉方向后再补图。
            </view>
          </view>
          <view class="hero-cover">
            <view class="hero-cover-title">封面待补充</view>
            <view class="hero-cover-desc">这里预留给后续切图，不先硬写装饰图形</view>
          </view>
        </view>
      </view>

      <view class="section-card step-card">
        <view class="ribbon ribbon-green">编辑步骤</view>
        <view class="section-card-inner">
          <scroll-view class="step-scroll" scroll-x enable-flex show-scrollbar="false">
            <view class="step-row">
              <view
                v-for="item in stepOptions"
                :key="item.key"
                class="step-chip"
                :class="{ active: activeStep === item.key }"
                @click="activeStep = item.key"
              >
                {{ item.label }}
              </view>
            </view>
          </scroll-view>

          <view v-if="activeStep === 'basic'" class="content-block">
            <view class="block-title">基础信息</view>
            <view class="block-desc">先把这份计划是什么、用哪种形式推进、打算持续多久说明白。</view>

            <view class="form-card">
              <view class="field-group">
                <view class="field-label">计划标题</view>
                <input v-model="form.title" class="field-input" maxlength="120" placeholder="例如：减脂饮食计划" />
              </view>

              <view class="field-group">
                <view class="field-label">计划说明</view>
                <textarea
                  v-model="form.description"
                  class="field-textarea"
                  maxlength="300"
                  placeholder="写下这份计划为什么做、希望达到什么效果。"
                />
              </view>

              <view class="field-group">
                <view class="field-label">计划类型</view>
                <scroll-view class="chip-scroll" scroll-x enable-flex show-scrollbar="false">
                  <view class="chip-row">
                    <view
                      v-for="item in planTypeOptions"
                      :key="item.value"
                      class="choice-chip"
                      :class="{ active: form.planType === item.value }"
                      @click="form.planType = item.value"
                    >
                      {{ item.label }}
                    </view>
                  </view>
                </scroll-view>
              </view>

              <view class="field-group">
                <view class="field-label">计划状态</view>
                <scroll-view class="chip-scroll" scroll-x enable-flex show-scrollbar="false">
                  <view class="chip-row">
                    <view
                      v-for="item in statusOptions"
                      :key="item.value"
                      class="choice-chip"
                      :class="{ active: form.status === item.value }"
                      @click="form.status = item.value"
                    >
                      {{ item.label }}
                    </view>
                  </view>
                </scroll-view>
              </view>
            </view>
          </view>

          <view v-if="activeStep === 'schedule'" class="content-block">
            <view class="block-title">时间与地点</view>
            <view class="block-desc">可以精确到日期和时分，也可以给周期计划留出固定间隔和常用地点。</view>

            <view class="form-card">
              <view class="datetime-grid">
                <view class="field-group">
                  <view class="field-label">开始日期</view>
                  <picker mode="date" :value="form.startDate" @change="(event) => form.startDate = event.detail.value">
                    <view class="picker-field">{{ form.startDate || '选择开始日期' }}</view>
                  </picker>
                </view>
                <view class="field-group">
                  <view class="field-label">开始时间</view>
                  <picker mode="time" :value="form.startTime" @change="(event) => form.startTime = event.detail.value">
                    <view class="picker-field">{{ form.startTime || '选择开始时间' }}</view>
                  </picker>
                </view>
                <view class="field-group">
                  <view class="field-label">结束日期</view>
                  <picker mode="date" :value="form.endDate" @change="(event) => form.endDate = event.detail.value">
                    <view class="picker-field">{{ form.endDate || '选择结束日期' }}</view>
                  </picker>
                </view>
                <view class="field-group">
                  <view class="field-label">结束时间</view>
                  <picker mode="time" :value="form.endTime" @change="(event) => form.endTime = event.detail.value">
                    <view class="picker-field">{{ form.endTime || '选择结束时间' }}</view>
                  </picker>
                </view>
              </view>

              <view v-if="form.planType === 'interval'" class="field-group">
                <view class="field-label">间隔天数</view>
                <input v-model="form.intervalDays" class="field-input" type="number" placeholder="例如：3" />
              </view>

              <view class="field-group">
                <view class="field-label">常用地点</view>
                <scroll-view class="chip-scroll" scroll-x enable-flex show-scrollbar="false">
                  <view class="chip-row">
                    <view
                      v-for="item in locationOptions"
                      :key="item"
                      class="choice-chip"
                      :class="{ active: form.location === item }"
                      @click="form.location = item"
                    >
                      {{ item }}
                    </view>
                  </view>
                </scroll-view>
                <input v-model="form.location" class="field-input field-input-inline" maxlength="120" placeholder="也可以自定义地点" />
              </view>
            </view>
          </view>

          <view v-if="activeStep === 'items'" class="content-block">
            <view class="block-head">
              <view>
                <view class="block-title">计划条目</view>
                <view class="block-desc">把每日安排、周期节点或阶段任务拆成更容易执行的小块。</view>
              </view>
              <view class="block-action" @click="addItem">新增条目</view>
            </view>

            <view class="item-stack">
              <view v-for="(item, index) in form.itemList" :key="index" class="item-card">
                <view class="item-head">
                  <view class="item-title">条目 {{ index + 1 }}</view>
                  <view class="item-remove" @click="removeItem(index)">删除</view>
                </view>

                <input v-model="item.title" class="field-input" maxlength="120" placeholder="条目标题，例如：早餐安排" />
                <textarea
                  v-model="item.content"
                  class="field-textarea"
                  maxlength="300"
                  placeholder="条目内容，例如：鸡蛋、牛奶和全麦面包。"
                />

                <view class="datetime-grid">
                  <view class="field-group">
                    <view class="field-label">日期</view>
                    <picker mode="date" :value="item.date" @change="(event) => item.date = event.detail.value">
                      <view class="picker-field">{{ item.date || '选择日期' }}</view>
                    </picker>
                  </view>
                  <view class="field-group">
                    <view class="field-label">时间</view>
                    <picker mode="time" :value="item.time" @change="(event) => item.time = event.detail.value">
                      <view class="picker-field">{{ item.time || '选择时间' }}</view>
                    </picker>
                  </view>
                </view>

                <input v-model="item.location" class="field-input" maxlength="120" placeholder="这一项发生在哪里" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-submit" @click="submitForm">{{ loading ? '保存中...' : '保存计划' }}</view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createRomanticPlan, fetchRomanticPlanDetail, updateRomanticPlan } from '@/services/romantic-plans.js'
import { requireAuth } from '@/utils/auth.js'
import { backPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'

const stepOptions = [
  { key: 'basic', label: '基础信息' },
  { key: 'schedule', label: '时间地点' },
  { key: 'items', label: '计划条目' }
]

const planTypeOptions = [
  { value: 'daily', label: '日程计划' },
  { value: 'interval', label: '周期计划' },
  { value: 'stage', label: '阶段计划' }
]

const statusOptions = [
  { value: 'active', label: '进行中' },
  { value: 'draft', label: '草稿' },
  { value: 'completed', label: '已完成' }
]

const locationOptions = ['家里', '公司', '外面', '路上']

const { themeStyle } = useThemePage()
const planId = ref('')
const loading = ref(false)
const activeStep = ref('basic')

function createEmptyItem() {
  return {
    title: '',
    content: '',
    date: '',
    time: '08:00',
    location: ''
  }
}

const form = reactive({
  title: '',
  description: '',
  planType: 'daily',
  status: 'active',
  startDate: '',
  startTime: '08:00',
  endDate: '',
  endTime: '21:00',
  intervalDays: '1',
  location: '',
  itemList: [createEmptyItem()]
})

const pageTitle = computed(() => (planId.value ? '编辑浪漫计划' : '新建浪漫计划'))

onLoad(async (options) => {
  planId.value = String(options?.id || '').trim()
  if (!requireAuth()) return
  if (planId.value) {
    await loadDetail()
  }
})

async function loadDetail() {
  try {
    const detail = await fetchRomanticPlanDetail(planId.value)
    form.title = detail?.title || ''
    form.description = detail?.description || ''
    form.planType = detail?.planType || 'daily'
    form.status = detail?.status || 'active'
    const startParts = splitDateTime(detail?.startAt)
    const endParts = splitDateTime(detail?.endAt)
    form.startDate = startParts.date
    form.startTime = startParts.time || '08:00'
    form.endDate = endParts.date
    form.endTime = endParts.time || '21:00'
    form.intervalDays = String(detail?.intervalDays || 1)
    form.location = detail?.location || ''
    form.itemList = (detail?.itemList?.length ? detail.itemList : [createEmptyItem()]).map((item) => {
      const value = splitDateTime(item?.scheduledAt)
      return {
        title: item?.title || '',
        content: item?.content || '',
        date: value.date,
        time: value.time || '08:00',
        location: item?.location || ''
      }
    })
  } catch (error) {
    uni.showToast({ title: error?.message || '读取计划失败', icon: 'none' })
  }
}

// 中文注释：编辑页内部统一按“日期 + 时间”拆分，提交时再还原成后端需要的完整时间字符串。
function splitDateTime(value) {
  const text = String(value || '').trim()
  if (!text) {
    return { date: '', time: '' }
  }
  const normalized = text.replace('T', ' ')
  const parts = normalized.split(' ')
  return {
    date: parts[0] || '',
    time: String(parts[1] || '').slice(0, 5)
  }
}

function joinDateTime(dateValue, timeValue) {
  if (!dateValue) return ''
  return `${dateValue} ${timeValue || '00:00'}:00`
}

function addItem() {
  form.itemList.push(createEmptyItem())
  activeStep.value = 'items'
}

function removeItem(index) {
  if (form.itemList.length <= 1) {
    form.itemList = [createEmptyItem()]
    return
  }
  form.itemList.splice(index, 1)
}

async function submitForm() {
  if (loading.value) return
  if (!String(form.title || '').trim()) {
    uni.showToast({ title: '请先填写计划标题', icon: 'none' })
    activeStep.value = 'basic'
    return
  }
  if (!form.startDate) {
    uni.showToast({ title: '请选择开始日期', icon: 'none' })
    activeStep.value = 'schedule'
    return
  }

  const payload = {
    title: form.title,
    description: form.description,
    planType: form.planType,
    status: form.status,
    startAt: joinDateTime(form.startDate, form.startTime),
    endAt: form.endDate ? joinDateTime(form.endDate, form.endTime) : '',
    intervalDays: Number(form.intervalDays || 1),
    location: form.location,
    itemList: form.itemList
      .filter((item) => String(item.title || '').trim())
      .map((item, index) => ({
        title: item.title,
        content: item.content,
        scheduledAt: item.date ? joinDateTime(item.date, item.time) : '',
        location: item.location,
        sortOrder: index
      }))
  }

  loading.value = true
  try {
    if (planId.value) {
      await updateRomanticPlan(planId.value, payload)
    } else {
      await createRomanticPlan(payload)
    }
    uni.showToast({ title: '计划已保存', icon: 'success' })
    setTimeout(() => {
      backPage()
    }, 300)
  } catch (error) {
    uni.showToast({ title: error?.message || '保存计划失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  backPage()
}
</script>

<style scoped>
.romantic-plan-edit-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.82), rgba(255, 248, 244, 0.24) 38%, transparent 60%),
    linear-gradient(180deg, #f9e8df 0%, #f7ddd6 26%, #efd9e5 58%, #f7e4da 100%);
}

.page-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cloud,
.spark {
  position: absolute;
  opacity: 0.82;
}

.cloud {
  border-radius: 999rpx;
  background:
    radial-gradient(circle at 25% 40%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.12) 70%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 240, 235, 0.3));
  filter: blur(4rpx);
}

.cloud-left {
  top: 180rpx;
  left: -40rpx;
  width: 280rpx;
  height: 180rpx;
}

.cloud-right {
  top: 560rpx;
  right: -50rpx;
  width: 320rpx;
  height: 220rpx;
}

.cloud-bottom {
  bottom: 100rpx;
  left: 50%;
  margin-left: -260rpx;
  width: 520rpx;
  height: 200rpx;
}

.spark {
  width: 22rpx;
  height: 22rpx;
  background: rgba(255, 255, 255, 0.95);
  clip-path: polygon(50% 0%, 64% 36%, 100% 50%, 64% 64%, 50% 100%, 36% 64%, 0% 50%, 36% 36%);
  box-shadow: 0 0 18rpx rgba(255, 255, 255, 0.6);
}

.spark-a {
  top: 250rpx;
  left: 88rpx;
}

.spark-b {
  top: 420rpx;
  right: 118rpx;
}

.edit-shell {
  position: relative;
  z-index: 1;
  padding: 28rpx 18rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.topbar-row,
.hero-card-inner,
.block-head,
.item-head {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.topbar-row {
  align-items: center;
  justify-content: space-between;
}

.back-chip,
.save-chip,
.block-action,
.bottom-submit {
  min-width: 136rpx;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.back-chip {
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10rpx 22rpx rgba(196, 161, 156, 0.18);
  color: #c67f82;
}

.back-chip-arrow {
  font-size: 38rpx;
  line-height: 1;
}

.save-chip,
.block-action,
.bottom-submit {
  background: linear-gradient(135deg, #ff7f91, #ef5f73);
  color: #fff;
  box-shadow: 0 10rpx 18rpx rgba(205, 109, 121, 0.22);
}

.hero-banner {
  padding-top: 8rpx;
  text-align: center;
}

.hero-banner-kicker {
  position: relative;
  display: inline-block;
  padding: 0 34rpx;
  color: #c77278;
  font-size: 24rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.hero-banner-kicker::before,
.hero-banner-kicker::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 88rpx;
  height: 2rpx;
  background: rgba(210, 125, 123, 0.56);
}

.hero-banner-kicker::before {
  left: -68rpx;
}

.hero-banner-kicker::after {
  right: -68rpx;
}

.hero-title-wrap {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  font-size: 62rpx;
  line-height: 1.1;
  font-weight: 800;
  color: #2a9c94;
  text-shadow: 0 6rpx 16rpx rgba(255, 255, 255, 0.48);
}

.hero-title-ornament {
  margin-top: 10rpx;
  width: 250rpx;
  height: 14rpx;
  border-bottom: 6rpx solid rgba(36, 149, 144, 0.82);
  border-radius: 50%;
  transform: rotate(-4deg);
}

.section-card {
  position: relative;
  border-radius: 34rpx;
  background: rgba(255, 251, 247, 0.9);
  box-shadow:
    0 16rpx 30rpx rgba(210, 169, 158, 0.16),
    inset 0 0 0 2rpx rgba(233, 198, 190, 0.62);
}

.section-card-inner {
  padding: 40rpx 24rpx 24rpx;
}

.ribbon {
  position: absolute;
  top: -12rpx;
  left: 18rpx;
  min-width: 174rpx;
  height: 64rpx;
  padding: 0 26rpx;
  border-radius: 18rpx 30rpx 22rpx 12rpx;
  display: inline-flex;
  align-items: center;
  color: #fff;
  font-size: 24rpx;
  font-weight: 800;
  box-shadow: 0 10rpx 18rpx rgba(201, 140, 142, 0.22);
}

.ribbon::after {
  content: '';
  position: absolute;
  right: -16rpx;
  bottom: 6rpx;
  border-width: 14rpx 0 14rpx 16rpx;
  border-style: solid;
}

.ribbon-pink {
  background: linear-gradient(135deg, #ef8f9e, #d96c7c);
}

.ribbon-pink::after {
  border-color: transparent transparent transparent #d96c7c;
}

.ribbon-green {
  background: linear-gradient(135deg, #89b670, #5a8d52);
}

.ribbon-green::after {
  border-color: transparent transparent transparent #5a8d52;
}

.hero-card-inner {
  align-items: stretch;
}

.hero-copy {
  min-width: 0;
  flex: 1;
}

.hero-copy-title,
.block-title {
  font-size: 34rpx;
  line-height: 1.36;
  font-weight: 800;
  color: #1f948f;
}

.hero-copy-desc,
.block-desc,
.field-label {
  margin-top: 16rpx;
  font-size: 24rpx;
  line-height: 1.72;
  color: #6d5f68;
}

.hero-cover {
  width: 220rpx;
  min-height: 220rpx;
  border-radius: 28rpx;
  padding: 24rpx 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(180deg, #f8ede7 0%, #ebd2ca 100%);
  flex: 0 0 auto;
}

.hero-cover-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #715258;
}

.hero-cover-desc {
  margin-top: 8rpx;
  font-size: 20rpx;
  line-height: 1.6;
  color: #886d72;
}

.step-scroll,
.chip-scroll {
  white-space: nowrap;
}

.step-row,
.chip-row {
  display: inline-flex;
  gap: 14rpx;
}

.step-chip,
.choice-chip {
  min-width: 142rpx;
  height: 68rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 250, 245, 0.96);
  box-shadow: inset 0 0 0 2rpx rgba(224, 197, 189, 0.7);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9d6266;
  font-size: 24rpx;
  font-weight: 700;
}

.step-chip.active,
.choice-chip.active {
  color: #1f948f;
  box-shadow: inset 0 0 0 2rpx rgba(86, 156, 138, 0.42);
}

.content-block {
  margin-top: 24rpx;
}

.form-card,
.item-card {
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10rpx 20rpx rgba(214, 176, 166, 0.12);
}

.field-group + .field-group {
  margin-top: 20rpx;
}

.field-label {
  margin-top: 0;
  margin-bottom: 12rpx;
  font-weight: 700;
  color: #4d434c;
}

.field-input,
.field-textarea,
.picker-field {
  width: 100%;
  box-sizing: border-box;
  border-radius: 22rpx;
  background: #fff6f1;
  color: #5d535d;
  font-size: 24rpx;
}

.field-input,
.picker-field {
  min-height: 72rpx;
  padding: 0 22rpx;
  line-height: 72rpx;
}

.field-textarea {
  min-height: 170rpx;
  padding: 22rpx;
  line-height: 1.7;
}

.field-input-inline {
  margin-top: 14rpx;
}

.datetime-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.item-stack {
  margin-top: 22rpx;
  display: grid;
  gap: 18rpx;
}

.item-head {
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.item-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1f948f;
}

.item-remove {
  font-size: 22rpx;
  color: #d16f74;
}

.bottom-submit {
  margin-top: 6rpx;
}

@media screen and (max-width: 720rpx) {
  .hero-card-inner,
  .datetime-grid {
    display: grid;
    grid-template-columns: 1fr;
  }

  .hero-cover {
    width: 100%;
  }
}
</style>
