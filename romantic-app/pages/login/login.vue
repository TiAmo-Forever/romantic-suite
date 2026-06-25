<template>
	<view class="login-page" :style="pageStyle">
		<GlobalNotificationBanner />
		<view class="glow glow-a"></view>
		<view class="glow glow-b"></view>
		<view class="glow glow-c"></view>
		<view class="glow glow-d"></view>
		<view v-for="item in hearts" :key="item.id" class="heart" :style="getHeartStyle(item)">{{ item.text }}</view>

		<view class="login-shell">
			<view class="intro-copy">两 个 人 的 时 光</view>

			<view class="hero-stage">
				<view class="hero-ring hero-ring-outer"></view>
				<view class="hero-ring hero-ring-inner"></view>
				<view class="hero-float">
					<image class="hero-illustration" :src="loginIllustrationUrl" mode="aspectFit" />
				</view>
			</view>

			<view class="brand-block">
				<view class="brand-title">爱意成笺</view>
				<view class="brand-subline">
					<view class="brand-line"></view>
					<text class="brand-roman">SHI GUANG</text>
					<view class="brand-line"></view>
				</view>
				<view class="brand-desc">把每一天好好记下来</view>
			</view>

			<view class="login-card">
				<view class="field-group">
					<view class="field-label">账 号</view>
					<view class="field-box">
						<input
							v-model.trim="form.username"
							class="field-input"
							placeholder="请输入邮箱或账号"
							placeholder-class="field-placeholder"
						/>
					</view>
				</view>

				<view class="field-group field-group-password">
					<view class="field-label">密 码</view>
					<view class="field-box field-box-password">
						<input
							v-model="form.password"
							class="field-input field-input-password"
							:password="!showPassword"
							placeholder="请输入密码"
							placeholder-class="field-placeholder"
						/>
						<view class="password-toggle" @click.stop="togglePassword">
							<image class="password-eye-icon" :src="passwordEyeIconUrl" mode="aspectFit" />
							<view class="password-toggle-line" :class="{ active: !showPassword }"></view>
						</view>
					</view>
				</view>

				<button class="login-btn" :loading="submitting" @click.stop="handleLogin">进 入 我 们 的 空 间</button>

			</view>

			<view class="bottom-ornament">
				<view class="ornament-line"></view>
				<view class="ornament-dot ornament-dot-small"></view>
				<view class="ornament-dot ornament-dot-large"></view>
				<view class="ornament-dot ornament-dot-small"></view>
				<view class="ornament-line"></view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { clearLoginState, login } from '@/utils/auth.js'
import { openHomePage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'

const loginIllustrationUrl = '/static/login/hero.png'
const passwordEyeIconUrl = '/static/login/eye.svg'
const { themeStyle: pageStyle } = useThemePage()

const form = reactive({
	username: '',
	password: ''
})

const hearts = ref([])
const showPassword = ref(false)
const submitting = ref(false)

let heartTimer = null
let heartId = 1
let screenWidth = 375
let screenHeight = 851

const heartTexts = ['❤', '♡', '♥', '✦', '✿']
const heartColors = ['rgba(209, 122, 104, 0.28)', 'rgba(196, 153, 114, 0.24)', 'rgba(255, 255, 255, 0.36)']

function random(min, max) {
	return Math.random() * (max - min) + min
}

function initSystemInfo() {
	const info = uni.getSystemInfoSync()
	screenWidth = info.windowWidth || 375
	screenHeight = info.windowHeight || 851
}

function createHeart() {
	const item = {
		id: heartId++,
		left: random(0, Math.max(24, screenWidth - 30)),
		bottom: random(-20, 220),
		size: random(16, 28),
		duration: random(4.2, 6.4),
		drift: random(-32, 32),
		rotate: random(-14, 14),
		text: heartTexts[Math.floor(Math.random() * heartTexts.length)],
		color: heartColors[Math.floor(Math.random() * heartColors.length)]
	}

	hearts.value.push(item)
	setTimeout(() => {
		hearts.value = hearts.value.filter((value) => value.id !== item.id)
	}, item.duration * 1000)
}

function burstHearts() {
	for (let index = 0; index < 4; index += 1) {
		setTimeout(() => {
			createHeart()
		}, index * 90)
	}
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

function togglePassword() {
	showPassword.value = !showPassword.value
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

onMounted(() => {
	clearLoginState()
	initSystemInfo()
	burstHearts()
	heartTimer = setInterval(createHeart, 900)
})

onUnmounted(() => {
	if (heartTimer) {
		clearInterval(heartTimer)
	}
})
</script>

<style scoped>
	.login-page {
		position: relative;
		min-height: 100vh;
		overflow: hidden;
		background:
			radial-gradient(circle at 50% 18%, rgba(255, 247, 241, 0.72), rgba(255, 247, 241, 0) 28%),
			linear-gradient(135deg, #fdf4ee 8.49%, #fceae0 45.85%, #f8d9ce 91.51%);
	}

	.login-shell {
		position: relative;
		z-index: 2;
		min-height: 100vh;
		padding: var(--app-login-shell-padding-top) 24rpx 64rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.glow {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.heart {
		position: absolute;
		z-index: 1;
		pointer-events: none;
		line-height: 1;
		animation: heartFloat var(--duration) ease-out forwards;
	}

	.glow-a {
		width: 516rpx;
		height: 516rpx;
		left: -42rpx;
		top: -118rpx;
		background: rgba(244, 190, 175, 0.28);
		filter: blur(90rpx);
	}

	.glow-b {
		width: 430rpx;
		height: 430rpx;
		left: -116rpx;
		top: 318rpx;
		background: rgba(240, 208, 196, 0.22);
		filter: blur(80rpx);
	}

	.glow-c {
		width: 388rpx;
		height: 388rpx;
		left: 8rpx;
		top: 700rpx;
		background: rgba(232, 196, 160, 0.18);
		filter: blur(70rpx);
	}

	.glow-d {
		width: 324rpx;
		height: 324rpx;
		left: 20rpx;
		top: 484rpx;
		background: rgba(242, 200, 184, 0.16);
		filter: blur(80rpx);
	}

	.intro-copy {
		margin-top: 2rpx;
		font-size: 22rpx;
		line-height: 1.5;
		letter-spacing: 7rpx;
		color: #b8896e;
		opacity: 0.75;
	}

	.hero-stage {
		position: relative;
		width: 320rpx;
		height: 320rpx;
		margin-top: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-ring {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.hero-ring-outer {
		inset: 12rpx;
		border: 2rpx dashed rgba(229, 192, 177, 0.72);
		opacity: 0.58;
	}

	.hero-ring-inner {
		inset: 42rpx;
		background: #fbf0e9;
		box-shadow:
			inset 0 0 0 2rpx rgba(236, 196, 179, 0.72),
			0 18rpx 40rpx rgba(216, 171, 151, 0.12);
	}

	.hero-float {
		position: relative;
		z-index: 3;
		width: 236rpx;
		height: 236rpx;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fbf0e9;
		animation: heroFloat 4.2s ease-in-out infinite;
		filter: drop-shadow(0 18rpx 28rpx rgba(203, 145, 123, 0.16));
	}

	.hero-illustration {
		width: 236rpx;
		height: 236rpx;
		display: block;
	}

	.brand-block {
		margin-top: 10rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.brand-title {
		font-size: 84rpx;
		line-height: 1.1;
		letter-spacing: 8rpx;
		color: #6b3f32;
		font-family: Georgia, 'Times New Roman', serif;
		font-weight: 500;
	}

	.brand-subline {
		margin-top: 12rpx;
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.brand-line {
		width: 56rpx;
		height: 2rpx;
		background: linear-gradient(90deg, rgba(201, 168, 122, 0), #c9a87a, rgba(201, 168, 122, 0));
	}

	.brand-roman {
		font-size: 18rpx;
		line-height: 1;
		letter-spacing: 5rpx;
		color: #c9a87a;
	}

	.brand-desc {
		margin-top: 18rpx;
		font-size: 24rpx;
		line-height: 1.5;
		letter-spacing: 4rpx;
		color: #b8896e;
		opacity: 0.82;
	}

	.login-card {
		position: relative;
		width: 100%;
		margin-top: 54rpx;
		padding: 42rpx 32rpx 34rpx;
		border-radius: 56rpx;
		background: rgba(255, 250, 246, 0.82);
		border: 2rpx solid rgba(220, 160, 130, 0.15);
		box-shadow:
			0 20rpx 96rpx rgba(180, 90, 70, 0.1),
			0 4rpx 20rpx rgba(180, 90, 70, 0.06),
			inset 0 2rpx 0 rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10rpx);
	}

	.field-group + .field-group {
		margin-top: 28rpx;
	}

	.field-group-password {
		margin-top: 34rpx;
	}

	.field-label {
		margin-bottom: 16rpx;
		font-size: 20rpx;
		line-height: 1.5;
		letter-spacing: 6rpx;
		color: #a07860;
		font-weight: 500;
	}

	.field-box {
		height: 98rpx;
		padding: 0 30rpx;
		display: flex;
		align-items: center;
		border-radius: 32rpx;
		background: rgba(252, 236, 224, 0.55);
		border: 2rpx solid rgba(210, 150, 120, 0.18);
	}

	.field-box-password {
		position: relative;
		padding-right: 82rpx;
	}

	.field-input {
		flex: 1;
		height: 100%;
		font-size: 30rpx;
		color: #5c3d35;
	}

	.field-input-password {
		padding-right: 12rpx;
	}

	.field-placeholder {
		color: rgba(92, 61, 53, 0.5);
		font-size: 30rpx;
	}

	.password-toggle {
		position: absolute;
		right: 16rpx;
		top: 50%;
		width: 54rpx;
		height: 54rpx;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.password-eye-icon {
		position: relative;
		z-index: 1;
		width: 26rpx;
		height: 26rpx;
		display: block;
		opacity: 0.72;
	}

	.password-toggle-line {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 30rpx;
		height: 2.5rpx;
		border-radius: 999rpx;
		background: rgba(184, 137, 110, 0.82);
		transform: translate(-50%, -50%) rotate(-28deg) scaleX(0);
		transform-origin: center;
		transition: transform 0.18s ease, opacity 0.18s ease;
		opacity: 0;
	}

	.password-toggle-line.active {
		transform: translate(-50%, -50%) rotate(-28deg) scaleX(1);
		opacity: 1;
	}

	.login-btn {
		margin-top: 40rpx;
		height: 104rpx;
		line-height: 104rpx;
		border: none;
		border-radius: 36rpx;
		background: linear-gradient(172deg, #e8c0b8 3.67%, #deb0a8 96.33%);
		color: #fff8f4;
		font-size: 30rpx;
		letter-spacing: 8rpx;
		font-weight: 500;
	}

	.login-btn::after {
		border: none;
	}

	.login-note {
		margin-top: 28rpx;
		font-size: 20rpx;
		line-height: 1.5;
		letter-spacing: 2rpx;
		color: #b8896e;
		opacity: 0.5;
		text-align: center;
	}

	.bottom-ornament {
		margin-top: auto;
		margin-left: -288rpx;
		margin-bottom: 10rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
		opacity: 0.78;
	}

	.ornament-line {
		width: 50rpx;
		height: 2rpx;
		background: linear-gradient(90deg, rgba(201, 168, 122, 0), rgba(201, 168, 122, 0.86), rgba(201, 168, 122, 0));
	}

	.ornament-dot {
		border-radius: 50%;
		background: #c9a87a;
	}

	.ornament-dot-small {
		width: 5rpx;
		height: 5rpx;
		opacity: 0.56;
	}

	.ornament-dot-large {
		width: 8rpx;
		height: 8rpx;
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

	@keyframes heroFloat {
		0%,
		100% {
			transform: translateY(0);
		}

		50% {
			transform: translateY(-14rpx);
		}
	}
</style>
