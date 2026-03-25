import { buildApiUrl, buildServerAssetUrl } from '@/utils/app-config.js'
import { markServerOffline, markServerOnline } from '@/utils/server-state.js'
import { redirectToLogin } from '@/utils/auth.js'

const IMAGE_MAX_SIZE = 5 * 1024 * 1024
const AUTH_INVALID_MESSAGES = [
	'AUTH_INVALID',
	'LOGIN_EXPIRED',
	'UNAUTHORIZED'
]

function parseUploadResponse(rawData) {
	if (typeof rawData === 'object' && rawData !== null) {
		return rawData
	}
	if (!rawData) {
		return null
	}
	try {
		return JSON.parse(rawData)
	} catch (error) {
		return null
	}
}

function isAuthInvalid(statusCode, payload) {
	const message = String(payload?.message || '').trim()
	return statusCode === 401 || AUTH_INVALID_MESSAGES.includes(message)
}

export function resolveMediaUrl(path) {
	const value = String(path || '').trim()
	if (!value) {
		return ''
	}
	if (/^(https?:|data:|file:|wxfile:|blob:)/i.test(value)) {
		return value
	}
	return buildServerAssetUrl(value)
}

function getFileSize(filePath) {
	return new Promise((resolve, reject) => {
		uni.getFileInfo({
			filePath,
			success(result) {
				resolve(Number(result.size || 0))
			},
			fail: reject
		})
	})
}

async function compressImageToLimit(filePath) {
	let currentPath = filePath
	let currentSize = await getFileSize(filePath)

	if (currentSize <= IMAGE_MAX_SIZE) {
		return currentPath
	}

	for (const quality of [80, 60, 40]) {
		currentPath = await new Promise((resolve, reject) => {
			uni.compressImage({
				src: currentPath,
				quality,
				success(result) {
					resolve(result.tempFilePath)
				},
				fail: reject
			})
		})

		currentSize = await getFileSize(currentPath)
		if (currentSize <= IMAGE_MAX_SIZE) {
			return currentPath
		}
	}

	throw new Error('图片压缩后仍然超过 5MB')
}

export async function prepareImageFile(filePath) {
	return compressImageToLimit(filePath)
}

function uploadMedia(filePath, endpoint) {
	const token = uni.getStorageSync('romantic_token')

	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: buildApiUrl(endpoint),
			filePath,
			name: 'file',
			header: token ? { Authorization: `Bearer ${token}` } : {},
			success(response) {
				const payload = parseUploadResponse(response.data)
				const message = payload?.message || '上传失败'

				if (isAuthInvalid(response.statusCode, payload)) {
					redirectToLogin(message)
					reject(new Error(message))
					return
				}

				if (response.statusCode >= 200 && response.statusCode < 300 && payload?.success && payload?.data?.path) {
					markServerOnline()
					resolve(payload.data.path)
					return
				}

				reject(new Error(message))
			},
			fail(error) {
				markServerOffline()
				reject(new Error(error?.errMsg || '上传失败'))
			}
		})
	})
}

export function uploadAnniversaryMedia(filePath) {
	return uploadMedia(filePath, '/api/files/anniversary-media')
}

export function uploadImprovementMedia(filePath) {
	return uploadMedia(filePath, '/api/files/improvement-media')
}

export function uploadAlbumMedia(filePath) {
	return uploadMedia(filePath, '/api/files/album-media')
}
