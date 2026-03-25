import { goPage } from '@/utils/nav.js'

export function openMediaViewer(mediaList = [], startIndex = 0) {
	const safeList = (Array.isArray(mediaList) ? mediaList : [])
		.map((item) => ({
			mediaType: String(item?.mediaType || '').trim(),
			fileUrl: String(item?.fileUrl || '').trim(),
			thumbnailUrl: String(item?.thumbnailUrl || '').trim()
		}))
		.filter((item) => item.mediaType && item.fileUrl)

	if (!safeList.length) {
		return
	}

	const encodedItems = encodeURIComponent(JSON.stringify(safeList))
	const safeIndex = Math.max(0, Math.min(Number(startIndex || 0), safeList.length - 1))
	goPage(`/pages/modules/media-viewer/index?items=${encodedItems}&index=${safeIndex}`)
}
