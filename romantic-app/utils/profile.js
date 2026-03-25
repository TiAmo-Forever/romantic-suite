const PROFILE_KEY = 'romantic_profile'

const avatarPresets = [
	{ key: 'heart', text: '💕', label: '心动', gradient: 'linear-gradient(135deg, #ff8db1, #ffc0d2)' },
	{ key: 'bunny', text: '🐰', label: '软萌', gradient: 'linear-gradient(135deg, #ffd0dc, #fff1f5)' },
	{ key: 'star', text: '🌟', label: '闪耀', gradient: 'linear-gradient(135deg, #ffd36e, #fff1b0)' },
	{ key: 'cat', text: '🐱', label: '可爱', gradient: 'linear-gradient(135deg, #ffc8a8, #ffe7d5)' },
	{ key: 'moon', text: '🌙', label: '月光', gradient: 'linear-gradient(135deg, #a8b8ff, #d9e2ff)' },
	{ key: 'flower', text: '🌷', label: '花语', gradient: 'linear-gradient(135deg, #ffb7cc, #ffe5ef)' },
	{ key: 'bear', text: '🧸', label: '抱抱', gradient: 'linear-gradient(135deg, #d7b58a, #f5e4cc)' },
	{ key: 'cloud', text: '☁️', label: '云朵', gradient: 'linear-gradient(135deg, #cfe7ff, #eef7ff)' }
]

const avatarPresetMap = avatarPresets.reduce((accumulator, item) => {
	accumulator[item.key] = item.text
	return accumulator
}, {})

const defaultProfile = {
	nickname: '嘉嘉',
	avatarType: 'preset',
	avatarPreset: 'heart',
	avatarText: '💕',
	avatarImage: '',
	bio: '把喜欢写进每一天。',
	city: '上海',
	loverNickname: '',
	anniversaryDate: '2025-02-14',
	defaultMeetingAreaId: 310100,
	defaultMeetingPlace: '上海',
	email: '',
	password: 'admin',
	themePresetKey: 'pink'
}

function normalizeAvatarText(value) {
	const text = String(value || '').trim()
	if (!text || text.toUpperCase() === 'LOVE') {
		return defaultProfile.avatarText
	}
	if (/^[A-Za-z]{3,}$/.test(text)) {
		return text.slice(0, 1).toUpperCase()
	}
	return text.slice(0, 2)
}

function normalizeProfile(profile) {
	const payload = {
		...defaultProfile,
		...profile
	}

	if (!avatarPresetMap[payload.avatarPreset]) {
		payload.avatarPreset = defaultProfile.avatarPreset
	}

	payload.avatarText = normalizeAvatarText(payload.avatarText)
	payload.nickname = payload.nickname || defaultProfile.nickname
	payload.bio = payload.bio || defaultProfile.bio
	payload.city = payload.city || defaultProfile.city
	payload.loverNickname = payload.loverNickname || payload.nickname || defaultProfile.nickname
	payload.defaultMeetingAreaId = Number(payload.defaultMeetingAreaId || defaultProfile.defaultMeetingAreaId || 0)
	payload.defaultMeetingPlace = payload.defaultMeetingPlace || payload.city || defaultProfile.defaultMeetingPlace

	if (payload.avatarImage) {
		payload.avatarType = 'upload'
	} else if (payload.avatarType !== 'text' && payload.avatarType !== 'preset') {
		payload.avatarType = 'preset'
	}

	return payload
}

export function getDefaultProfile() {
	return { ...defaultProfile }
}

export function getAvatarPresets() {
	return avatarPresets.map((item) => ({ ...item }))
}

export function getAvatarPresetMap() {
	return { ...avatarPresetMap }
}

export function getProfile() {
	const stored = uni.getStorageSync(PROFILE_KEY)
	if (!stored || typeof stored !== 'object') {
		return getDefaultProfile()
	}

	return normalizeProfile(stored)
}

export function saveProfile(profile) {
	const payload = normalizeProfile(profile)
	uni.setStorageSync(PROFILE_KEY, payload)
	return payload
}

export function resetProfile() {
	const payload = getDefaultProfile()
	uni.setStorageSync(PROFILE_KEY, payload)
	return payload
}

export function clearRomanticData() {
	uni.removeStorageSync(PROFILE_KEY)
	uni.removeStorageSync('romantic_countdown_plan')
	uni.removeStorageSync('romantic_avatar_draft')
}

