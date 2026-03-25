<template>
	<view class="page" @click="handlePageTap">
		<GlobalNotificationBanner />
		<view class="ambient ambient-a"></view>
		<view class="ambient ambient-b"></view>
		<view class="ambient ambient-c"></view>
		<view class="sparkle sparkle-a"></view>
		<view class="sparkle sparkle-b"></view>
		<view class="sparkle sparkle-c"></view>

		<view v-for="item in hearts" :key="item.id" class="heart" :style="getHeartStyle(item)">
			{{ item.text }}
		</view>

		<view class="page-shell">
			<view class="brand-block">
				<view class="brand-mark">
					<view class="envelope-back"></view>
					<view class="envelope-flap"></view>
					<view class="letter-card">
						<view class="letter-line short"></view>
						<view class="letter-line"></view>
						<view class="letter-seal"></view>
					</view>
					<view class="leaf leaf-left"></view>
					<view class="leaf leaf-right"></view>
				</view>
				<view class="brand-title">爱意成笺</view>
				<view class="brand-divider">
					<view class="divider-line"></view>
					<view class="divider-text">一起记录每一个甜蜜瞬间</view>
					<view class="divider-line"></view>
				</view>
			</view>

			<view class="login-card">
				<view class="card-outline"></view>

				<view class="field-shell">
					<view class="field-icon" aria-hidden="true">账</view>
					<input
						v-model.trim="form.username"
						class="field-input"
						placeholder="输入账号，继续今天的心动"
						placeholder-class="field-placeholder"
					/>
				</view>

				<view class="field-shell">
					<view class="field-icon" aria-hidden="true">锁</view>
					<input
						v-model="form.password"
						class="field-input"
						:password="!showPassword"
						placeholder="输入密码，赴约今天的甜蜜"
						placeholder-class="field-placeholder"
					/>
					<view class="field-action" @click.stop="togglePassword">
						{{ showPassword ? '隐藏' : '显示' }}
					</view>
				</view>

				<view class="assist-row">
					<view class="remember-trigger" @click.stop="toggleRemember">
						<view class="remember-dot" :class="{ active: rememberAccount }">
							<view class="remember-dot-inner"></view>
						</view>
						<text class="assist-text">记住账号</text>
					</view>
					<view class="assist-link" @click.stop="handleForgotPassword">忘记密码？</view>
				</view>

				<button class="login-btn" :loading="submitting" @click.stop="handleLogin">登录</button>
			</view>

			<view class="footer-copy">爱意成笺，陪伴你们每一天的温柔时光</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { clearLoginState, login } from '@/utils/auth.js'
import { openHomePage } from '@/utils/nav.js'

const REMEMBERED_LOGIN_KEY = 'romantic_remembered_login'

const form = reactive({
	username: '',
	password: ''
})

const hearts = ref([])
const rememberAccount = ref(false)
const showPassword = ref(false)
const submitting = ref(false)

let heartTimer = null
let heartId = 1
let screenWidth = 375
let screenHeight = 667

const heartTexts = ['❤', '♡', '♥', '✦', '✿']
const heartColors = ['rgba(227, 170, 103, 0.34)', 'rgba(214, 188, 148, 0.34)', 'rgba(255, 255, 255, 0.45)']

function random(min, max) {
	return Math.random() * (max - min) + min
}

function initSystemInfo() {
	const info = uni.getSystemInfoSync()
	screenWidth = info.windowWidth || 375
	screenHeight = info.windowHeight || 667
}

function restoreRememberedUsername() {
	const rememberedLogin = uni.getStorageSync(REMEMBERED_LOGIN_KEY)
	if (!rememberedLogin || typeof rememberedLogin !== 'object') {
		return
	}

	form.username = String(rememberedLogin.username || '').trim()
	form.password = String(rememberedLogin.password || '')

	if (!form.username || !form.password) {
		form.username = ''
		form.password = ''
		return
	}

	rememberAccount.value = true
}

function persistRememberedUsername() {
	if (rememberAccount.value && form.username && form.password) {
		uni.setStorageSync(REMEMBERED_LOGIN_KEY, {
			username: form.username,
			password: form.password
		})
		return
	}

	uni.removeStorageSync(REMEMBERED_LOGIN_KEY)
}

function createHeart() {
	const item = {
		id: heartId++,
		left: random(0, screenWidth - 30),
		bottom: random(-20, 180),
		size: random(16, 28),
		duration: random(4, 6.5),
		drift: random(-36, 36),
		rotate: random(-18, 18),
		text: heartTexts[Math.floor(Math.random() * heartTexts.length)],
		color: heartColors[Math.floor(Math.random() * heartColors.length)]
	}

	hearts.value.push(item)
	setTimeout(() => {
		hearts.value = hearts.value.filter((value) => value.id !== item.id)
	}, item.duration * 1000)
}

function getHeartStyle(item) {
	return {
		left: `${item.left}px`,
		bottom: `${item.bottom}px`,
		fontSize: `${item.size}px`,
		color: item.color,
		'--float-x': `${item.drift}px`,
		'--float-y': `${screenHeight * 0.34}px`,
		'--rotate-deg': `${item.rotate}deg`,
		'--duration': `${item.duration}s`
	}
}

function toggleRemember() {
	rememberAccount.value = !rememberAccount.value
	persistRememberedUsername()
}

function togglePassword() {
	showPassword.value = !showPassword.value
}

function handleForgotPassword() {
	uni.showToast({
		title: '忘记密码功能暂未开放',
		icon: 'none'
	})
}

async function handleLogin() {
	if (submitting.value) {
		return
	}

	if (!form.username) {
		uni.showToast({
			title: '请输入账号',
			icon: 'none'
		})
		return
	}

	if (!form.password) {
		uni.showToast({
			title: '请输入密码',
			icon: 'none'
		})
		return
	}

	submitting.value = true

	try {
		const res = await login(form.username, form.password)
		if (!res.success) {
			uni.showToast({
				title: res.message,
				icon: 'none'
			})
			return
		}

		persistRememberedUsername()

		uni.showToast({
			title: '登录成功',
			icon: 'success'
		})
		setTimeout(() => {
			openHomePage()
		}, 400)
	} finally {
		submitting.value = false
	}
}

function handlePageTap() {
	for (let index = 0; index < 4; index += 1) {
		setTimeout(() => {
			createHeart()
		}, index * 90)
	}
}

onMounted(() => {
	clearLoginState()
	initSystemInfo()
	restoreRememberedUsername()
	heartTimer = setInterval(createHeart, 900)
})

onUnmounted(() => {
	if (heartTimer) {
		clearInterval(heartTimer)
	}
})
</script>

<style scoped>
	.page {
		position: relative;
		min-height: 100vh;
		overflow: hidden;
		background:
			radial-gradient(circle at 18% 14%, rgba(255, 255, 255, 0.76), transparent 20%),
			radial-gradient(circle at 84% 18%, rgba(255, 232, 204, 0.5), transparent 18%),
			radial-gradient(circle at 82% 82%, rgba(255, 228, 205, 0.44), transparent 22%),
			linear-gradient(180deg, #fffaf3 0%, #fff5e8 48%, #fffaf4 100%);
	}

	.page-shell {
		position: relative;
		z-index: 2;
		min-height: 100vh;
		padding: 132rpx 44rpx 72rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.ambient,
	.sparkle {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.ambient {
		filter: blur(8rpx);
		opacity: 0.72;
	}

	.ambient-a {
		width: 320rpx;
		height: 320rpx;
		left: -110rpx;
		top: 120rpx;
		background: radial-gradient(circle, rgba(255, 240, 220, 0.66) 0%, rgba(255, 240, 220, 0) 72%);
	}

	.ambient-b {
		width: 240rpx;
		height: 240rpx;
		right: -60rpx;
		top: 460rpx;
		background: radial-gradient(circle, rgba(255, 228, 195, 0.48) 0%, rgba(255, 228, 195, 0) 72%);
	}

	.ambient-c {
		width: 280rpx;
		height: 280rpx;
		right: -90rpx;
		bottom: 120rpx;
		background: radial-gradient(circle, rgba(255, 238, 223, 0.56) 0%, rgba(255, 238, 223, 0) 72%);
	}

	.sparkle {
		background: rgba(255, 255, 255, 0.82);
		box-shadow: 0 0 20rpx rgba(255, 255, 255, 0.65);
		animation: sparklePulse 3.2s ease-in-out infinite;
	}

	.sparkle-a {
		width: 12rpx;
		height: 12rpx;
		left: 102rpx;
		top: 160rpx;
	}

	.sparkle-b {
		width: 16rpx;
		height: 16rpx;
		right: 110rpx;
		top: 220rpx;
		animation-delay: 0.7s;
	}

	.sparkle-c {
		width: 14rpx;
		height: 14rpx;
		right: 140rpx;
		bottom: 210rpx;
		animation-delay: 1.3s;
	}

	.brand-block {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.brand-mark {
		position: relative;
		width: 168rpx;
		height: 130rpx;
	}

	.envelope-back {
		position: absolute;
		left: 22rpx;
		right: 22rpx;
		bottom: 18rpx;
		height: 66rpx;
		border-radius: 14rpx;
		background: linear-gradient(180deg, #f7cf9f 0%, #efbb7f 100%);
		box-shadow: 0 14rpx 26rpx rgba(214, 171, 108, 0.18);
	}

	.envelope-flap {
		position: absolute;
		left: 24rpx;
		right: 24rpx;
		top: 34rpx;
		margin: auto;
		width: 0;
		height: 0;
		border-left: 60rpx solid transparent;
		border-right: 60rpx solid transparent;
		border-bottom: 42rpx solid #f2c38d;
		filter: drop-shadow(0 8rpx 12rpx rgba(216, 175, 115, 0.14));
	}

	.letter-card {
		position: absolute;
		left: 48rpx;
		top: 10rpx;
		width: 72rpx;
		height: 54rpx;
		padding: 10rpx 12rpx;
		border-radius: 10rpx;
		background: rgba(255, 250, 242, 0.96);
		box-shadow: 0 10rpx 18rpx rgba(216, 190, 156, 0.22);
		transform: rotate(-4deg);
	}

	.letter-line {
		height: 4rpx;
		margin-top: 6rpx;
		border-radius: 999rpx;
		background: rgba(186, 136, 88, 0.42);
	}

	.letter-line.short {
		width: 62%;
		margin-top: 0;
	}

	.letter-seal {
		position: absolute;
		right: 10rpx;
		bottom: 10rpx;
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		background: linear-gradient(180deg, #ed9b6a 0%, #d87453 100%);
	}

	.leaf {
		position: absolute;
		top: 28rpx;
		width: 18rpx;
		height: 30rpx;
		background: linear-gradient(180deg, #98be87 0%, #6ea26e 100%);
		border-radius: 18rpx 18rpx 18rpx 2rpx;
		transform-origin: bottom center;
	}

	.leaf-left {
		right: 28rpx;
		transform: rotate(-18deg);
	}

	.leaf-right {
		right: 12rpx;
		height: 26rpx;
		transform: rotate(22deg);
	}

	.brand-title {
		margin-top: 20rpx;
		font-size: 82rpx;
		line-height: 1;
		font-weight: 500;
		letter-spacing: 4rpx;
		color: #b77943;
		text-shadow: 0 6rpx 18rpx rgba(191, 148, 93, 0.12);
	}

	.brand-divider {
		margin-top: 26rpx;
		display: flex;
		align-items: center;
		gap: 18rpx;
	}

	.divider-line {
		width: 74rpx;
		height: 2rpx;
		background: linear-gradient(90deg, rgba(217, 186, 148, 0), rgba(217, 186, 148, 0.72), rgba(217, 186, 148, 0));
	}

	.divider-text {
		font-size: 28rpx;
		color: #9ba08d;
		letter-spacing: 1rpx;
	}

	.login-card {
		position: relative;
		width: 100%;
		margin-top: 88rpx;
		padding: 44rpx 34rpx 40rpx;
		border-radius: 42rpx;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 252, 247, 0.92) 100%);
		box-shadow:
			0 28rpx 60rpx rgba(205, 179, 142, 0.16),
			inset 0 0 0 2rpx rgba(234, 220, 201, 0.58);
	}

	.card-outline {
		position: absolute;
		inset: 10rpx;
		border-radius: 36rpx;
		border: 2rpx solid rgba(233, 225, 214, 0.78);
		pointer-events: none;
	}

	.field-shell {
		position: relative;
		display: flex;
		align-items: center;
		height: 96rpx;
		margin-top: 22rpx;
		padding: 0 26rpx;
		border-radius: 26rpx;
		background: linear-gradient(180deg, #ffffff 0%, #fffdfa 100%);
		box-shadow:
			0 10rpx 24rpx rgba(211, 192, 164, 0.12),
			inset 0 0 0 2rpx rgba(236, 225, 211, 0.7);
	}

	.field-shell:first-of-type {
		margin-top: 0;
	}

	.field-icon {
		flex-shrink: 0;
		width: 40rpx;
		font-size: 30rpx;
		text-align: center;
		opacity: 0.72;
	}

	.field-input {
		flex: 1;
		height: 100%;
		padding: 0 16rpx;
		font-size: 30rpx;
		color: #7d6a58;
	}

	.field-placeholder {
		color: #c6b9aa;
	}

	.field-action {
		flex-shrink: 0;
		padding-left: 12rpx;
		font-size: 26rpx;
		font-weight: 600;
		color: #9b958d;
	}

	.assist-row {
		margin-top: 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
	}

	.remember-trigger {
		display: inline-flex;
		align-items: center;
		gap: 14rpx;
	}

	.remember-dot {
		width: 34rpx;
		height: 34rpx;
		padding: 5rpx;
		border-radius: 50%;
		border: 2rpx solid rgba(204, 188, 166, 0.86);
		background: rgba(255, 255, 255, 0.82);
		box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.56);
	}

	.remember-dot-inner {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: transparent;
		transform: scale(0.6);
		transition: all 0.2s ease;
	}

	.remember-dot.active {
		border-color: rgba(214, 169, 93, 0.88);
	}

	.remember-dot.active .remember-dot-inner {
		background: linear-gradient(180deg, #f2cf8a 0%, #dca24d 100%);
		box-shadow: 0 4rpx 8rpx rgba(212, 164, 88, 0.24);
		transform: scale(1);
	}

	.assist-text,
	.assist-link {
		font-size: 28rpx;
		color: #8f8f88;
	}

	.assist-link {
		color: #8e9787;
	}

	.login-btn {
		margin-top: 40rpx;
		height: 90rpx;
		line-height: 90rpx;
		border: none;
		border-radius: 999rpx;
		background: linear-gradient(180deg, #f3cf84 0%, #dca548 100%);
		color: #fffef9;
		font-size: 34rpx;
		font-weight: 700;
		letter-spacing: 10rpx;
		box-shadow:
			0 16rpx 30rpx rgba(213, 161, 81, 0.26),
			inset 0 2rpx 0 rgba(255, 250, 239, 0.55);
	}

	.login-btn::after {
		border: none;
	}

	.footer-copy {
		margin-top: 96rpx;
		font-size: 27rpx;
		line-height: 1.8;
		color: #8f7f71;
		letter-spacing: 1rpx;
		text-align: center;
	}

	.heart {
		position: absolute;
		z-index: 1;
		pointer-events: none;
		line-height: 1;
		animation: heartFloat var(--duration) ease-out forwards;
	}

	@keyframes heartFloat {
		0% {
			opacity: 0;
			transform: translate3d(0, 0, 0) scale(0.72) rotate(0deg);
		}

		18% {
			opacity: 1;
		}

		100% {
			opacity: 0;
			transform: translate3d(var(--float-x), calc(var(--float-y) * -1), 0) scale(1.08) rotate(var(--rotate-deg));
		}
	}

	@keyframes sparklePulse {
		0%,
		100% {
			opacity: 0.35;
			transform: scale(0.88);
		}

		50% {
			opacity: 0.92;
			transform: scale(1.08);
		}
	}
</style>
