<template>
	<view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
		<view class="app-account-topbar-shell"><AccountHeader title="账号安全" eyebrow="密码管理" /></view>
		<view class="app-account-content">
			<view class="app-account-stack">
				<AccountIntroCard
					eyebrow="私有安全"
					title="登录密码"
					description="修改当前账号登录密码"
					:tags="['仅当前账号可见', '下次登录立即生效']"
				/>
				<AccountPanel title="登录密码" description="密码长度不少于 4 位">
					<view class="app-account-form-row">
						<view class="app-account-form-col"><AccountField label="新密码"><input v-model="form.nextPassword" password class="input app-field" placeholder="请输入新密码" placeholder-class="app-account-input-placeholder" /></AccountField></view>
						<view class="app-account-form-col"><AccountField label="确认密码"><input v-model="form.confirmPassword" password class="input app-field" placeholder="请再次输入新密码" placeholder-class="app-account-input-placeholder" /></AccountField></view>
					</view>
				</AccountPanel>
				<view class="app-account-action-bar">
					<view class="app-account-action-note">
						<view class="app-account-action-note-title">保存后使用新密码登录</view>
						<view class="app-account-action-note-desc">两次输入需保持一致</view>
					</view>
					<button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleSave">保存密码</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { savePasswordAndBack } from '@/utils/account.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountIntroCard from '@/pages/account/components/AccountIntroCard.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()
const form = reactive({ nextPassword: '', confirmPassword: '' })

onLoad(() => { requireAuth() })
async function handleSave() {
	if (form.nextPassword.length < 4) return void uni.showToast({ title: '新密码至少 4 位', icon: 'none' })
	if (form.nextPassword !== form.confirmPassword) return void uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
	try {
		await savePasswordAndBack(form.nextPassword, '密码已保存')
	} catch (error) {
		uni.showToast({ title: error?.message || '密码保存失败', icon: 'none' })
	}
}
</script>
