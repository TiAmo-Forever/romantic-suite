<template>
	<view class="page app-account-page" :style="themeStyle">
		<GlobalNotificationBanner />
		<view class="app-account-topbar-shell">
			<AccountHeader title="关系信息" eyebrow="关系编辑" />
		</view>
		<view class="app-account-content">
			<AccountPanel title="关系设定">
				<view class="app-account-form-row">
					<view class="app-account-form-col">
						<AccountField label="对方对你的称呼">
							<input v-model="form.loverNickname" class="input app-field" placeholder="请输入对方对你的称呼" placeholder-class="app-account-input-placeholder" />
						</AccountField>
					</view>
					<view class="app-account-form-col">
						<AccountField label="默认见面地点">
							<view class="picker app-field location-picker" @click="openAreaPicker">
								<view class="picker-value">{{ form.defaultMeetingPlace || '请选择你们常去的地方' }}</view>
							</view>
						</AccountField>
					</view>
				</view>
				<view class="location-actions">
					<button class="ghost-btn app-account-flat-btn app-account-flat-btn-soft" @click="openAreaPicker">重新选择地区</button>
					<button class="ghost-btn app-account-flat-btn app-account-flat-btn-soft" @click="useCurrentLocation">使用当前位置</button>
				</view>
				<AccountField label="恋爱纪念日">
					<picker class="picker app-field" mode="date" :value="form.anniversaryDate" @change="handleAnniversaryChange">
						<view class="picker-value">{{ form.anniversaryDate || '请选择纪念日' }}</view>
					</picker>
				</AccountField>
			</AccountPanel>
			<button class="save-btn app-primary-btn app-primary-btn-shadow app-account-save-btn" @click="handleSave">保存并同步</button>
		</view>
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { requireAuth } from '@/utils/auth.js'
import { saveProfilePatchAndBack } from '@/utils/account.js'
import { buildAreaPickerUrl, clearAreaDraft, getAreaDraft } from '@/utils/area.js'
import { searchAreas } from '@/services/areas.js'
import { getCurrentLocationInfo } from '@/utils/location.js'
import { getProfile } from '@/utils/profile.js'
import { goPage } from '@/utils/nav.js'
import { useThemePage } from '@/utils/useThemePage.js'
import AccountField from '@/pages/account/components/AccountField.vue'
import AccountHeader from '@/pages/account/components/AccountHeader.vue'
import AccountPanel from '@/pages/account/components/AccountPanel.vue'

const { themeStyle } = useThemePage()
const form = reactive(getProfile())

onLoad(() => {
	requireAuth()
})

onShow(() => {
	const draft = getAreaDraft('relationship_meeting')
	if (!draft) return
	form.defaultMeetingAreaId = draft.id || 0
	form.defaultMeetingPlace = draft.displayText || draft.mergerName || draft.name || ''
	clearAreaDraft('relationship_meeting')
})

function handleAnniversaryChange(event) {
	form.anniversaryDate = event.detail.value
}

function openAreaPicker() {
	goPage(buildAreaPickerUrl('relationship_meeting', {
		value: form.defaultMeetingPlace || '',
		areaId: Number(form.defaultMeetingAreaId || 0)
	}))
}

async function useCurrentLocation() {
	try {
		const location = await getCurrentLocationInfo()
		const keywords = [location.district, location.city, location.province].filter(Boolean)
		let matchedArea = null

		for (const keyword of keywords) {
			const result = await searchAreas(keyword, null, 10)
			matchedArea = result.find((item) => item.name === keyword || item.shortName === keyword) || result[0]
			if (matchedArea) break
		}

		form.defaultMeetingAreaId = matchedArea?.id || 0
		form.defaultMeetingPlace = matchedArea?.mergerName || location.label
	} catch (error) {
		uni.showToast({ title: error?.message || '定位失败，请检查定位权限', icon: 'none' })
	}
}

async function handleSave() {
	try {
		await saveProfilePatchAndBack({
			loverNickname: (form.loverNickname || '').trim() || (form.nickname || '').trim() || '恋人',
			defaultMeetingAreaId: Number(form.defaultMeetingAreaId || 0),
			defaultMeetingPlace: (form.defaultMeetingPlace || '').trim() || '以后再定',
			anniversaryDate: form.anniversaryDate
		}, '关系信息已保存')
	} catch (error) {
		uni.showToast({ title: error?.message || '关系信息保存失败', icon: 'none' })
	}
}
</script>

<style scoped>
	.location-actions { margin-top: 18rpx; }
	.location-picker { justify-content: space-between; }
</style>
