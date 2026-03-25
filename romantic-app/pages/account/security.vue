<template>
	<view class="page app-account-page" :style="themeStyle">
    <GlobalNotificationBanner />
		<view class="app-account-topbar-shell"><AccountHeader title="账号安全" eyebrow="密码管理" /></view>
		<view class="app-account-content">
			<AccountPanel title="登录密码" description="密码会同步保存到服务端，修改后下次登录会立即生效。">
				<view class="app-account-form-row">
					<view class="app-account-form-col"><AccountField label="新密码"><input v-model="form.nextPassword" password class="input app-field" placeholder="至少 4 位" placeholder-class="app-account-input-placeholder" /></AccountField></view>
					<view class="app-account-form-col"><AccountField label="确认密码"><input v-model="form.confirmPassword" password class="input app-field" placeholder="再次输入密码" placeholder-class="app-account-input-placeholder" /></AccountField></view>
				</view>
			</AccountPanel>
			<button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleSave">保存密码</button>
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
