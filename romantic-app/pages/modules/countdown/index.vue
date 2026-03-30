<template>
	<view class="page countdown-page" :style="themeStyle" @click="handlePageTap">
    <GlobalNotificationBanner />
		<view class="bg"></view>
		<view v-for="heart in hearts" :key="heart.id" class="heart" :style="getHeartStyle(heart)">
			{{ heart.text }}
		</view>

		<view class="top-bar app-topbar" @click.stop>
			<view class="top-nav-btn app-topbar-btn" @click.stop="goBack">
				<view class="top-nav-icon app-topbar-icon" aria-hidden="true"></view>
				<text class="top-nav-text app-topbar-text">返回</text>
			</view>
			<view class="page-title-wrap app-topbar-center">
				<view class="page-eyebrow app-topbar-eyebrow">倒计时计划</view>
				<view class="page-title app-topbar-title">见面倒计时</view>
			</view>
			<view class="top-ghost-btn app-topbar-btn top-menu-trigger" @click.stop="toggleActionMenu">···</view>
		</view>

		<view class="content" @click.stop>
			<view class="hero-card">
				<view class="hero-badge app-pill app-pill-glass">{{ heroBadge }}</view>
				<view class="hero-plan-label">下次见面</view>
				<view class="hero-date">{{ nextMeetingDateText }}</view>
				<view class="hero-meta-row">
					<view class="hero-chip hero-chip-strong app-pill app-pill-glass">{{ nextMeetingClockText }}</view>
					<view class="hero-chip app-pill app-pill-glass">📍 {{ meetingPlan.place || '还没有设置地点' }}</view>
				</view>
				<view class="hero-title">{{ heroTitle }}</view>
				<view class="hero-desc">{{ heroDesc }}</view>
			</view>

			<view class="countdown-card app-card app-card-gradient">
				<view class="app-section-kicker">倒计时</view>
				<view class="app-section-title">距离这次见面</view>
				<view class="app-section-desc">下次见面倒计时</view>
				<view class="countdown-grid">
					<view v-for="item in countdownItems" :key="item.label" class="time-box app-card-soft">
						<view class="time-cap"></view>
						<text class="num">{{ item.value }}</text>
						<text class="unit">{{ item.label }}</text>
					</view>
				</view>
				<view class="love-text">{{ stageMessage }}</view>
			</view>

			<view class="overview-grid">
				<view class="info-card app-card">
					<view class="info-icon">💖</view>
					<view class="info-label">上次见面</view>
					<view class="info-value">{{ lastMeetingText }}</view>
					<view class="info-sub">已经想念了 {{ daysSinceLast }} 天</view>
				</view>
				<view class="info-card app-card">
					<view class="info-icon">✨</view>
					<view class="info-label">进度值</view>
					<view class="info-value">{{ progressPercent }}%</view>
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: `${progressPercent}%` }"></view>
					</view>
					<view class="info-sub">{{ progressText }}</view>
				</view>
			</view>

			<view class="plan-summary-card app-card">
				<view class="section-row">
					<view>
						<view class="app-section-kicker">见面计划</view>
						<view class="app-section-title">把这次期待慢慢写下来</view>
					</view>
					<view class="section-tip">{{ meetingPlan.isAllDay ? '全天安排' : nextMeetingClockText }}</view>
				</view>
				<view class="plan-summary-note">{{ meetingPlan.note || '还没有补充这次见面的安排，可以先写下想去的地方和想一起做的小事。' }}</view>
				<view class="plan-summary-meta">
					<view class="plan-meta-chip app-pill app-pill-soft">📍 {{ meetingPlan.place || '还没有设置地点' }}</view>
					<view class="plan-meta-chip app-pill app-pill-soft">💌 {{ meetingPlan.loverName || '宝贝' }}</view>
				</view>
			</view>

			<view class="action-bar">
				<button class="save-btn app-primary-btn app-primary-btn-shadow" @click.stop="openEditorSheet">编辑见面计划</button>
			</view>
		</view>

		<view v-if="showActionMenu" class="floating-layer" @click.stop="closeActionMenu">
			<view class="floating-mask"></view>
			<view class="top-action-menu app-card" @click.stop>
				<view class="menu-action-item" @click.stop="handleMenuEdit">编辑计划</view>
				<view class="menu-action-item menu-action-item-danger" @click.stop="handleResetConfirm">重置计划</view>
			</view>
		</view>

		<view v-if="showEditorSheet" class="floating-layer" @click.stop="closeEditorSheet">
			<view class="floating-mask"></view>
			<view class="editor-sheet app-card app-card-gradient" @click.stop>
				<view class="sheet-handle"></view>
				<view class="sheet-head">
					<view>
						<view class="app-section-kicker">见面计划编辑</view>
						<view class="app-section-title">把新的安排悄悄更新一下</view>
					</view>
					<view class="sheet-close" @click.stop="closeEditorSheet">取消</view>
				</view>
				<view class="editor-desc">修改见面时间、地点和这次想一起完成的小计划。</view>

				<view class="form-item">
					<view class="label">称呼</view>
					<input v-model="form.loverName" class="input app-input-shell app-field" placeholder="请输入称呼" placeholder-class="input-placeholder" />
				</view>

				<view class="form-item">
					<view class="label">见面地点</view>
					<view class="picker app-input-shell app-field location-picker" @click="openPlacePicker">
						<view class="picker-value">{{ form.place || '请选择或填写见面地点' }}</view>
					</view>
				</view>

				<view class="form-item">
					<view class="label">下次见面</view>
					<view class="picker-row">
						<picker class="picker app-input-shell app-field" mode="date" :value="form.nextDate" @change="handleNextDateChange"><view class="picker-value">{{ form.nextDate }}</view></picker>
						<picker v-if="!form.isAllDay" class="picker app-input-shell app-field" mode="time" :value="form.nextTime" @change="handleNextTimeChange"><view class="picker-value">{{ form.nextTime }}</view></picker>
						<view v-else class="picker app-input-shell app-field picker-static"><view class="picker-value">全天见面</view></view>
					</view>
					<view class="switch-row">
						<view class="switch-label">按全天见面计算</view>
						<switch :checked="form.isAllDay" :color="switchColor" @change="handleAllDayChange" />
					</view>
				</view>

				<view class="form-item">
					<view class="label">上次见面</view>
					<view class="picker-row">
						<picker class="picker app-input-shell app-field picker-single" mode="date" :value="form.lastDate" @change="handleLastDateChange"><view class="picker-value">{{ form.lastDate }}</view></picker>
					</view>
				</view>

				<view class="form-item">
					<view class="label">这次想一起做什么</view>
					<textarea v-model="form.note" class="textarea app-input-shell app-textarea" maxlength="120" placeholder="请输入计划内容" placeholder-class="input-placeholder" />
				</view>

				<view class="sheet-actions">
					<button class="sheet-btn sheet-btn-secondary" @click.stop="closeEditorSheet">取消</button>
					<button class="sheet-btn app-primary-btn app-primary-btn-shadow" @click.stop="handleSave">保存计划</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { buildAreaPickerUrl, clearAreaDraft, getAreaDraft } from '@/utils/area.js'
import { backPage, goPage } from '@/utils/nav.js'
import { fetchSharedCountdownPlan, resetSharedCountdownPlan, updateSharedCountdownPlan } from '@/services/countdown.js'
import { useThemePage } from '@/utils/useThemePage.js'

const { themeStyle } = useThemePage()
const countdown = reactive({ days: '00', hours: '00', minutes: '00', seconds: '00' })
const meetingPlan = reactive({ loverName: '', place: '', note: '', nextMeetingAt: '', lastMeetingAt: '', isAllDay: false })
const form = reactive({ loverName: '', place: '', note: '', nextDate: '', nextTime: '00:00', lastDate: '', isAllDay: false })
const hearts = ref([])
const showActionMenu = ref(false)
const showEditorSheet = ref(false)
const currentTime = ref(Date.now())
let timer = null
let heartTimer = null
let heartId = 1
let screenWidth = 375
let screenHeight = 667

const heartTexts = ['❤', '💕', '💗', '💖', '💘', '💞']
const heartColors = ['#ff4d6d', '#ff5e7d', '#ff85a1', '#ff99ac', '#ffb3c1', '#ffc2d1']
const switchColor = computed(() => getComputedStyleSafe('--app-color-primary', '#ff7ea6'))
const nextMeetingDate = computed(() => parseDateTime(meetingPlan.nextMeetingAt))
const lastMeetingDate = computed(() => parseDateTime(meetingPlan.lastMeetingAt))
const meetingStatus = computed(() => {
	const nextDate = nextMeetingDate.value
	if (!nextDate) return 'unknown'
	const diff = nextDate.getTime() - currentTime.value
	if (diff > 0) {
		if (diff <= 24 * 60 * 60 * 1000) return 'today'
		if (diff <= 7 * 24 * 60 * 60 * 1000) return 'soon'
		return 'waiting'
	}
	if (isSameDay(nextDate, new Date(currentTime.value))) return 'today'
	return 'passed'
})
const nextMeetingDateText = computed(() => formatDateText(nextMeetingDate.value))
const nextMeetingClockText = computed(() => formatTimeText(nextMeetingDate.value, meetingPlan.isAllDay))
const lastMeetingText = computed(() => formatDateText(lastMeetingDate.value))
const heroBadge = computed(() => ({ waiting: '满心期待', soon: '很快就见面', today: '今天就相见', passed: '该约下一次啦', unknown: '等待设定' }[meetingStatus.value]))
const heroTitle = computed(() => meetingStatus.value === 'today' ? '今天见面' : meetingStatus.value === 'passed' ? '请设置下一次见面' : `${meetingPlan.loverName || 'TA'} 的见面计划`)
const heroDesc = computed(() => meetingPlan.note || '请填写见面计划')
const countdownItems = computed(() => [{ label: '天', value: countdown.days }, { label: '时', value: countdown.hours }, { label: '分', value: countdown.minutes }, { label: '秒', value: countdown.seconds }])
const daysSinceLast = computed(() => {
	const lastDate = startOfDay(lastMeetingDate.value)
	const today = startOfDay(new Date(currentTime.value))
	if (!lastDate || !today) return 0
	return Math.max(0, Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)))
})
const progressPercent = computed(() => {
	const start = startOfDay(lastMeetingDate.value)?.getTime()
	const end = startOfDay(nextMeetingDate.value)?.getTime()
	const today = startOfDay(new Date(currentTime.value))?.getTime()
	if (!start || !end || !today || end <= start) return 0
	const percent = ((today - start) / (end - start)) * 100
	return Math.max(0, Math.min(100, Math.round(percent)))
})
const progressText = computed(() => meetingStatus.value === 'passed' ? '本次计划已结束' : meetingStatus.value === 'today' ? '今天见面' : `当前进度 ${progressPercent.value}%`)
const stageMessage = computed(() => meetingStatus.value === 'passed' ? '请设置下一次见面计划' : meetingStatus.value === 'today' ? '今天见面' : meetingStatus.value === 'soon' ? '即将见面' : '等待见面')

function getComputedStyleSafe(name, fallback) {
	if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') return fallback
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
function pad(num) { return String(num).padStart(2, '0') }
function splitDateTime(value) { const [date = '', time = '00:00'] = String(value || '').split(' '); return { date, time: time.slice(0, 5) || '00:00' } }
function parseDateTime(value) { if (!value) return null; const date = new Date(String(value).replace(' ', 'T')); return Number.isNaN(date.getTime()) ? null : date }
function formatDateText(date) { return date ? `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日` : '暂未设置' }
function formatDateTimeText(date, isAllDay = false) { if (!date) return '暂未设置'; const dateText = formatDateText(date); return isAllDay ? `${dateText} · 全天` : `${dateText} · ${pad(date.getHours())}:${pad(date.getMinutes())}` }
function formatTimeText(date, isAllDay = false) { if (!date) return '等待设置时间'; return isAllDay ? '全天见面' : `${pad(date.getHours())}:${pad(date.getMinutes())}` }
function buildDateTime(date, time, isAllDay = false) { return `${date} ${isAllDay ? '00:00' : time}` }
function isSameDay(dateA, dateB) { return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate() }
function startOfDay(date) { if (!date) return null; return new Date(date.getFullYear(), date.getMonth(), date.getDate()) }
function applyPlan(plan) { Object.assign(meetingPlan, { loverName: plan.loverName, place: plan.place, note: plan.note, nextMeetingAt: plan.nextMeetingAt, lastMeetingAt: plan.lastMeetingAt, isAllDay: !!plan.isAllDay }); const nextParts = splitDateTime(plan.nextMeetingAt); const lastParts = splitDateTime(plan.lastMeetingAt); Object.assign(form, { loverName: plan.loverName, place: plan.place, note: plan.note, nextDate: nextParts.date, nextTime: nextParts.time, lastDate: lastParts.date, isAllDay: !!plan.isAllDay }) }
async function loadPlan() {
	try {
		applyPlan(await fetchSharedCountdownPlan())
		updateCountdown()
	} catch (error) {
		uni.showToast({ title: error?.message || '见面计划加载失败', icon: 'none' })
	}
}
function updateCountdown() { currentTime.value = Date.now(); const nextDate = nextMeetingDate.value; if (!nextDate) return Object.assign(countdown, { days: '00', hours: '00', minutes: '00', seconds: '00' }); let diff = nextDate.getTime() - currentTime.value; if (diff < 0) diff = 0; countdown.days = pad(Math.floor(diff / (1000 * 60 * 60 * 24))); countdown.hours = pad(Math.floor((diff / (1000 * 60 * 60)) % 24)); countdown.minutes = pad(Math.floor((diff / (1000 * 60)) % 60)); countdown.seconds = pad(Math.floor((diff / 1000) % 60)) }
function random(min, max) { return Math.random() * (max - min) + min }
function initSystemInfo() { try { const info = uni.getSystemInfoSync(); screenWidth = info.windowWidth || 375; screenHeight = info.windowHeight || 667 } catch (error) { console.error('获取系统信息失败', error) } }
function createHeart(x = null, y = null) { const left = x !== null ? x : random(30, screenWidth - 30); const bottom = y !== null ? y : random(20, 120); const item = { id: heartId++, left: Math.max(10, Math.min(left, screenWidth - 30)), bottom, size: random(18, 42), duration: random(3.2, 5.5), drift: random(-40, 40), rotate: random(-25, 25), text: heartTexts[Math.floor(Math.random() * heartTexts.length)], color: heartColors[Math.floor(Math.random() * heartColors.length)] }; hearts.value.push(item); setTimeout(() => { hearts.value = hearts.value.filter((value) => value.id !== item.id) }, item.duration * 1000) }
function getHeartStyle(heart) { return { left: `${heart.left}px`, bottom: `${heart.bottom}px`, fontSize: `${heart.size}px`, color: heart.color, '--float-x': `${heart.drift}px`, '--float-y': `${screenHeight - heart.bottom + 50}px`, '--rotate-deg': `${heart.rotate}deg`, '--duration': `${heart.duration}s` } }
function handlePageTap(event) { const x = event?.detail?.x; const y = event?.detail?.y; if (typeof x !== 'number' || typeof y !== 'number') return; const bottomY = screenHeight - y; for (let i = 0; i < 4; i += 1) setTimeout(() => createHeart(x + random(-18, 18), bottomY + random(-18, 18)), i * 60) }
function toggleActionMenu() { showActionMenu.value = !showActionMenu.value }
function closeActionMenu() { showActionMenu.value = false }
function openEditorSheet() { showActionMenu.value = false; showEditorSheet.value = true }
function closeEditorSheet() { showEditorSheet.value = false }
function handleMenuEdit() { openEditorSheet() }
function handleNextDateChange(event) { form.nextDate = event.detail.value }
function handleNextTimeChange(event) { form.nextTime = event.detail.value }
function handleLastDateChange(event) { form.lastDate = event.detail.value }
function handleAllDayChange(event) { form.isAllDay = !!event.detail.value }
function openPlacePicker() { goPage(buildAreaPickerUrl('countdown_place', { value: form.place || '' })) }
async function handleSave() {
	if (!form.nextDate || !form.lastDate) return void uni.showToast({ title: '请先把见面日期补完整', icon: 'none' })
	const nextMeetingAt = buildDateTime(form.nextDate, form.nextTime, form.isAllDay)
	const lastMeetingAt = form.lastDate
	const nextDate = parseDateTime(nextMeetingAt)
	const lastDate = parseDateTime(`${lastMeetingAt} 00:00`)
	if (!nextDate || !lastDate) return void uni.showToast({ title: '日期格式不正确', icon: 'none' })
	if (nextDate.getTime() <= lastDate.getTime()) return void uni.showToast({ title: '下次见面要晚于上次见面', icon: 'none' })

	try {
		const payload = await updateSharedCountdownPlan({
			loverName: (form.loverName || '宝贝').trim() || '宝贝',
			place: (form.place || '未设置地点').trim() || '未设置地点',
			note: (form.note || '').trim(),
			nextMeetingAt,
			lastMeetingAt,
			isAllDay: form.isAllDay
		})
		applyPlan(payload)
		updateCountdown()
		closeEditorSheet()
		uni.showToast({ title: '见面计划已保存', icon: 'success' })
	} catch (error) {
		uni.showToast({ title: error?.message || '见面计划保存失败', icon: 'none' })
	}
}
function handleResetConfirm() {
	closeActionMenu()
	uni.showModal({
		title: '重置见面计划',
		content: '要恢复默认的见面计划吗？当前填写的内容会被覆盖。',
		confirmText: '重置',
		cancelText: '取消',
		success: (result) => {
			if (result.confirm) {
				handleReset()
			}
		}
	})
}
async function handleReset() {
	try {
		const payload = await resetSharedCountdownPlan()
		applyPlan(payload)
		updateCountdown()
		uni.showToast({ title: '已恢复默认计划', icon: 'none' })
	} catch (error) {
		uni.showToast({ title: error?.message || '恢复默认计划失败', icon: 'none' })
	}
}
function goBack() { backPage() }

onShow(() => {
	const draft = getAreaDraft('countdown_place')
	if (draft) {
		form.place = draft.displayText || draft.mergerName || draft.name || ''
		clearAreaDraft('countdown_place')
		return
	}

	if (requireAuth()) {
		loadPlan()
	}
})

onMounted(() => {
	if (!requireAuth()) return
	initSystemInfo()
	timer = setInterval(updateCountdown, 1000)
	heartTimer = setInterval(createHeart, 1200)
})

onUnmounted(() => {
	if (timer) clearInterval(timer)
	if (heartTimer) clearInterval(heartTimer)
	hearts.value = []
})
</script>

<style scoped>
	.countdown-page { position: relative; background: var(--app-page-gradient-main); overflow-x: hidden; }
	.bg { position: absolute; inset: 0; background: radial-gradient(circle at 12% 10%, var(--app-page-glow-strong), transparent 26%), radial-gradient(circle at 86% 18%, var(--app-page-glow-mid), transparent 24%), radial-gradient(circle at 52% 85%, var(--app-page-glow-soft), transparent 30%); }
	.top-bar { position: sticky; top: 0; z-index: 30; padding: 24rpx 28rpx; background: rgba(255, 255, 255, 0.58); backdrop-filter: blur(12px); }
	.top-nav-icon { width: 18rpx; height: 18rpx; border-left: 4rpx solid currentColor; border-bottom: 4rpx solid currentColor; border-radius: 2rpx; box-sizing: border-box; transform: rotate(45deg); flex-shrink: 0; }
	.top-ghost-btn { font-size: 24rpx; border: 2rpx solid rgba(255, 126, 166, 0.16); color: #c06f88; background: rgba(255, 255, 255, 0.7); }
	.top-menu-trigger { min-width: 74rpx; justify-content: center; letter-spacing: 4rpx; }
	.content { position: relative; z-index: 10; padding: 16rpx 24rpx 196rpx; }
	.hero-card { padding: 36rpx 30rpx; border-radius: 32rpx; box-shadow: var(--app-shadow-card); background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.24), transparent 30%), var(--app-gradient-hero); color: #fff; }
	.hero-title { margin-top: 22rpx; font-size: 28rpx; line-height: 1.6; font-weight: 600; color: rgba(255, 255, 255, 0.96); }
	.hero-plan-label { margin-top: 20rpx; font-size: 24rpx; color: rgba(255, 255, 255, 0.76); }
	.hero-date { margin-top: 12rpx; font-size: 52rpx; line-height: 1.28; letter-spacing: 1rpx; font-weight: 700; color: #fff; text-shadow: 0 8rpx 24rpx rgba(180, 59, 104, 0.18); }
	.hero-meta-row { display: flex; flex-wrap: wrap; gap: 14rpx; margin-top: 18rpx; }
	.hero-chip { display: inline-flex; align-items: center; padding: 12rpx 20rpx; border-radius: 999rpx; font-size: 24rpx; line-height: 1.5; font-weight: 600; color: rgba(255, 255, 255, 0.96); background: rgba(255, 255, 255, 0.18); box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.08); }
	.hero-chip-strong { background: rgba(255, 255, 255, 0.28); }
	.hero-desc { margin-top: 14rpx; font-size: 24rpx; line-height: 1.8; color: rgba(255, 255, 255, 0.78); }
	.countdown-card { margin-top: 22rpx; padding: 30rpx 26rpx; }
	.editor-desc { margin-top: 12rpx; font-size: 23rpx; line-height: 1.8; color: #98707d; }
	.section-row { display: flex; align-items: baseline; justify-content: space-between; gap: 20rpx; }
	.section-tip { font-size: 22rpx; color: #b48795; }
	.countdown-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16rpx; margin-top: 22rpx; }
	.time-box { position: relative; padding: 24rpx 12rpx; text-align: center; border-radius: 24rpx; background: var(--app-card-gradient-soft); box-shadow: inset 0 0 0 2rpx rgba(255, 143, 179, 0.08), 0 10rpx 24rpx rgba(255, 174, 194, 0.08); overflow: hidden; }
	.time-cap { position: absolute; top: 0; left: 0; right: 0; height: 8rpx; background: var(--app-gradient-primary); }
	.num { display: block; margin-top: 8rpx; font-size: 52rpx; font-weight: 700; color: var(--app-color-primary-strong); }
	.unit { display: block; margin-top: 10rpx; font-size: 24rpx; color: #a47582; }
	.love-text { margin-top: 22rpx; font-size: 26rpx; line-height: 1.8; color: #8f6a76; }
	.overview-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18rpx; margin-top: 22rpx; }
	.info-card { position: relative; padding: 28rpx 24rpx; overflow: hidden; }
	.info-icon { width: 56rpx; height: 56rpx; line-height: 56rpx; border-radius: 18rpx; text-align: center; font-size: 28rpx; background: #fff3f7; }
	.info-label { margin-top: 16rpx; font-size: 24rpx; color: #b38794; }
	.info-value { margin-top: 12rpx; font-size: 32rpx; line-height: 1.5; font-weight: 700; color: var(--app-color-primary-strong); }
	.info-sub { margin-top: 12rpx; font-size: 22rpx; line-height: 1.7; color: #8f6b77; }
	.progress-bar { height: 12rpx; margin-top: 18rpx; border-radius: 999rpx; background: #ffe3ec; overflow: hidden; }
	.progress-fill { height: 100%; border-radius: inherit; background: var(--app-gradient-primary); }
	.plan-summary-card { margin-top: 22rpx; padding: 30rpx 26rpx; }
	.plan-summary-note { margin-top: 18rpx; font-size: 26rpx; line-height: 1.85; color: #735560; }
	.plan-summary-meta { display: flex; flex-wrap: wrap; gap: 14rpx; margin-top: 20rpx; }
	.plan-meta-chip { color: #9a7080; background: rgba(255, 245, 248, 0.92); }
	.action-bar { position: fixed; left: 24rpx; right: 24rpx; bottom: calc(26rpx + env(safe-area-inset-bottom)); z-index: 26; padding: 18rpx 20rpx 20rpx; border-radius: 32rpx; background: rgba(255, 250, 252, 0.88); backdrop-filter: blur(16px); box-shadow: 0 -4rpx 22rpx rgba(194, 143, 160, 0.08), 0 18rpx 34rpx rgba(201, 154, 169, 0.16); }
	.form-item { margin-top: 24rpx; }
	.label { margin-bottom: 14rpx; font-size: 26rpx; font-weight: 600; color: #8e6673; }
	.input, .picker { min-height: 92rpx; padding: 0 24rpx; display: flex; align-items: center; font-size: 28rpx; color: #5c4550; }
	.input-placeholder { color: #c1a2ad; }
	.picker-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
	.picker-static, .picker-single { justify-content: center; }
	.picker-value { font-size: 28rpx; color: #5c4550; }
	.switch-row { display: flex; justify-content: space-between; align-items: center; margin-top: 16rpx; padding: 0 6rpx; }
	.switch-label { font-size: 24rpx; color: #9d7380; }
	.textarea { height: 190rpx; padding: 22rpx 24rpx; font-size: 28rpx; color: #5c4550; }
	.save-btn { margin-top: 30rpx; font-size: 30rpx; font-weight: 700; }
	.location-picker { justify-content: space-between; }
	.floating-layer { position: fixed; inset: 0; z-index: 40; }
	.floating-mask { position: absolute; inset: 0; background: rgba(75, 49, 60, 0.16); backdrop-filter: blur(6px); }
	.top-action-menu { position: absolute; top: calc(108rpx + env(safe-area-inset-top)); right: 28rpx; width: 220rpx; padding: 10rpx 0; border-radius: 24rpx; box-shadow: 0 18rpx 42rpx rgba(116, 76, 91, 0.2); }
	.menu-action-item { padding: 22rpx 26rpx; font-size: 26rpx; color: #735560; }
	.menu-action-item + .menu-action-item { border-top: 1rpx solid rgba(214, 183, 195, 0.34); }
	.menu-action-item-danger { color: #c25e78; }
	.editor-sheet { position: absolute; left: 18rpx; right: 18rpx; bottom: 0; max-height: calc(100vh - 132rpx); padding: 18rpx 24rpx calc(30rpx + env(safe-area-inset-bottom)); border-bottom-left-radius: 0; border-bottom-right-radius: 0; overflow-y: auto; box-shadow: 0 -18rpx 40rpx rgba(137, 91, 108, 0.16); }
	.sheet-handle { width: 76rpx; height: 8rpx; margin: 4rpx auto 18rpx; border-radius: 999rpx; background: rgba(199, 161, 174, 0.48); }
	.sheet-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
	.sheet-close { padding: 10rpx 0 10rpx 18rpx; font-size: 24rpx; color: #bc8295; }
	.sheet-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18rpx; margin-top: 30rpx; }
	.sheet-btn { min-height: 92rpx; border-radius: 999rpx; font-size: 28rpx; font-weight: 600; line-height: 92rpx; }
	.sheet-btn-secondary { color: #8d6975; background: rgba(255, 255, 255, 0.92); box-shadow: inset 0 0 0 2rpx rgba(226, 196, 207, 0.36); }
	.heart { position: absolute; z-index: 5; pointer-events: none; animation: float var(--duration) ease-in-out forwards; transform-origin: center center; }
	@keyframes float { 0% { transform: translate(0, 0) rotate(var(--rotate-deg)); opacity: 1; } 100% { transform: translate(var(--float-x), calc(-1 * var(--float-y))) rotate(var(--rotate-deg)); opacity: 0; } }
	@media screen and (max-width: 520px) { .countdown-grid, .overview-grid, .picker-row, .sheet-actions { grid-template-columns: repeat(2, 1fr); } .time-box { padding: 22rpx 8rpx; } .top-action-menu { width: 208rpx; } }
</style>
