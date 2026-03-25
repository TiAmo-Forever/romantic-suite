<template>
	<view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
		<view class="app-account-topbar-shell"><AccountHeader title="裁剪头像" eyebrow="头像裁剪" /></view>
		<view class="app-account-content">
			<view class="crop-card app-card app-account-section">
				<view class="crop-tip">拖动图片、双指缩放并调整取景，头像会裁成正方形。</view>
				<view class="crop-shell">
					<view class="crop-viewport" :style="viewportStyle" @touchstart.stop="handleTouchStart" @touchmove.stop.prevent="handleTouchMove" @touchend.stop="handleTouchEnd" @touchcancel.stop="handleTouchEnd">
						<image class="crop-image" :src="imagePath" :style="imageStyle" mode="aspectFill"></image>
					</view>
				</view>
				<slider class="crop-slider" :value="sliderValue" :min="100" :max="300" :step="1" activeColor="#ff7ea6" block-color="#ff7ea6" @changing="handleScaleChanging" @change="handleScaleChanging" />
				<view class="crop-actions">
					<button class="ghost-btn app-account-flat-btn app-account-flat-btn-soft" @click="resetCrop">重置位置</button>
					<button class="save-btn app-primary-btn app-primary-btn-shadow app-account-flat-btn" @click="handleCropSave">确认裁剪</button>
				</view>
			</view>
		</view>
		<canvas canvas-id="avatarCropCanvas" id="avatarCropCanvas" class="crop-canvas"></canvas>
	</view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { persistAvatarDraft, setAvatarDraft } from '@/utils/avatar.js'
import { backPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'

const { themeStyle } = useThemePage()
const MIN_SCALE = 1
const MAX_SCALE = 3
const instance = getCurrentInstance()
const imagePath = ref('')
const cropSize = ref(300)
const imageInfo = ref({ width: 0, height: 0 })
const baseSize = ref({ width: 300, height: 300 })
const scale = ref(MIN_SCALE)
const offset = ref({ x: 0, y: 0 })
const gestureState = ref({ mode: 'none', startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0, startDistance: 0, startScale: MIN_SCALE, startMidX: 0, startMidY: 0 })

const viewportStyle = computed(() => ({ width: `${cropSize.value}px`, height: `${cropSize.value}px` }))
const sliderValue = computed(() => Math.round(scale.value * 100))
const imageStyle = computed(() => ({ width: `${baseSize.value.width * scale.value}px`, height: `${baseSize.value.height * scale.value}px`, left: `${offset.value.x}px`, top: `${offset.value.y}px` }))

onLoad(async (options) => {
	if (!requireAuth()) return
	imagePath.value = decodeURIComponent(options.src || '')
	const systemInfo = uni.getSystemInfoSync()
	cropSize.value = Math.min(systemInfo.windowWidth - 48, 320)
	await initImageInfo()
	resetCrop()
})

async function initImageInfo() {
	if (!imagePath.value) return
	const info = await new Promise((resolve, reject) => uni.getImageInfo({ src: imagePath.value, success: resolve, fail: reject }))
	imageInfo.value = { width: info.width, height: info.height }
	const aspect = info.width / info.height
	baseSize.value = aspect >= 1 ? { width: cropSize.value * aspect, height: cropSize.value } : { width: cropSize.value, height: cropSize.value / aspect }
}
function clampScale(nextScale) { return Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale)) }
function clampOffset(nextX, nextY, nextScale = scale.value) { const width = baseSize.value.width * nextScale; const height = baseSize.value.height * nextScale; const minX = Math.min(0, cropSize.value - width); const minY = Math.min(0, cropSize.value - height); return { x: Math.max(minX, Math.min(0, nextX)), y: Math.max(minY, Math.min(0, nextY)) } }
function getViewportCenter() { return { x: cropSize.value / 2, y: cropSize.value / 2 } }
function resetCrop() { scale.value = MIN_SCALE; offset.value = clampOffset((cropSize.value - baseSize.value.width) / 2, (cropSize.value - baseSize.value.height) / 2, MIN_SCALE); gestureState.value.mode = 'none' }
function getTouchList(event) { return event.touches || event.changedTouches || event.detail?.touches || event.detail?.changedTouches || [] }
function normalizeTouch(touch) { const x = typeof touch.pageX === 'number' ? touch.pageX : touch.clientX; const y = typeof touch.pageY === 'number' ? touch.pageY : touch.clientY; return typeof x === 'number' && typeof y === 'number' ? { x, y } : null }
function getTouchPoints(event) { return Array.from(getTouchList(event)).map(normalizeTouch).filter(Boolean) }
function getDistance(first, second) { const dx = second.x - first.x; const dy = second.y - first.y; return Math.sqrt(dx * dx + dy * dy) }
function getMidpoint(first, second) { return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 } }
function beginDrag(point) { gestureState.value = { mode: 'drag', startX: point.x, startY: point.y, startOffsetX: offset.value.x, startOffsetY: offset.value.y, startDistance: 0, startScale: scale.value, startMidX: 0, startMidY: 0 } }
function beginPinch(first, second) { const midpoint = getMidpoint(first, second); gestureState.value = { mode: 'pinch', startX: 0, startY: 0, startOffsetX: offset.value.x, startOffsetY: offset.value.y, startDistance: getDistance(first, second), startScale: scale.value, startMidX: midpoint.x, startMidY: midpoint.y } }
function handleTouchStart(event) { const points = getTouchPoints(event); if (points.length >= 2) return beginPinch(points[0], points[1]); if (points.length === 1) beginDrag(points[0]) }
function handleTouchMove(event) { const points = getTouchPoints(event); if (!points.length) return; if (points.length >= 2) { if (gestureState.value.mode !== 'pinch') beginPinch(points[0], points[1]); const currentDistance = getDistance(points[0], points[1]); const currentMid = getMidpoint(points[0], points[1]); const ratio = gestureState.value.startDistance ? currentDistance / gestureState.value.startDistance : 1; const nextScale = clampScale(gestureState.value.startScale * ratio); const focusImageX = (gestureState.value.startMidX - gestureState.value.startOffsetX) / gestureState.value.startScale; const focusImageY = (gestureState.value.startMidY - gestureState.value.startOffsetY) / gestureState.value.startScale; scale.value = nextScale; offset.value = clampOffset(currentMid.x - focusImageX * nextScale, currentMid.y - focusImageY * nextScale, nextScale); return } const point = points[0]; if (gestureState.value.mode !== 'drag') beginDrag(point); offset.value = clampOffset(gestureState.value.startOffsetX + point.x - gestureState.value.startX, gestureState.value.startOffsetY + point.y - gestureState.value.startY) }
function handleTouchEnd(event) { const points = getTouchPoints(event); if (points.length >= 2) return beginPinch(points[0], points[1]); if (points.length === 1) return beginDrag(points[0]); gestureState.value.mode = 'none' }
function handleScaleChanging(event) { const nextScale = clampScale(Number(event.detail.value || 100) / 100); const prevScale = scale.value; if (!prevScale || nextScale === prevScale) return; const center = getViewportCenter(); const imagePointX = (center.x - offset.value.x) / prevScale; const imagePointY = (center.y - offset.value.y) / prevScale; scale.value = nextScale; offset.value = clampOffset(center.x - imagePointX * nextScale, center.y - imagePointY * nextScale, nextScale) }
async function handleCropSave() { const canvasSize = 600; const drawnWidth = baseSize.value.width * scale.value; const drawnHeight = baseSize.value.height * scale.value; const sourceX = Math.max(0, (-offset.value.x / drawnWidth) * imageInfo.value.width); const sourceY = Math.max(0, (-offset.value.y / drawnHeight) * imageInfo.value.height); const sourceWidth = Math.min(imageInfo.value.width, (cropSize.value / drawnWidth) * imageInfo.value.width); const sourceHeight = Math.min(imageInfo.value.height, (cropSize.value / drawnHeight) * imageInfo.value.height); const context = uni.createCanvasContext('avatarCropCanvas', instance?.proxy); context.clearRect(0, 0, canvasSize, canvasSize); context.drawImage(imagePath.value, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasSize, canvasSize); context.draw(false, () => { uni.canvasToTempFilePath({ canvasId: 'avatarCropCanvas', width: canvasSize, height: canvasSize, destWidth: canvasSize, destHeight: canvasSize, success: async (result) => { try { const draftPath = await persistAvatarDraft(result.tempFilePath); setAvatarDraft(draftPath); uni.showToast({ title: '裁剪完成', icon: 'success' }); setTimeout(() => backPage(), 220) } catch (error) { uni.showToast({ title: error?.message || '头像处理失败', icon: 'none' }) } } }, instance?.proxy) }) }
</script>

<style scoped>
	.crop-card { border-radius: 32rpx; }
	.crop-tip { font-size: 24rpx; line-height: 1.7; color: #98707d; }
	.crop-shell { margin-top: 24rpx; display: flex; justify-content: center; }
	.crop-viewport { position: relative; overflow: hidden; border-radius: 36rpx; background: #fff; box-shadow: inset 0 0 0 4rpx rgba(255, 143, 179, 0.12); }
	.crop-image { position: absolute; transform-origin: top left; }
	.crop-slider { margin-top: 20rpx; }
	.crop-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; margin-top: 24rpx; }
	.crop-canvas { position: fixed; left: -9999px; top: -9999px; width: 600px; height: 600px; }
	@media screen and (max-width: 520px) { .crop-actions { grid-template-columns: 1fr; } }
</style>
