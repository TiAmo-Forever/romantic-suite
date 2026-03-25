export function previewImages(urls, current = '') {
	const validUrls = (Array.isArray(urls) ? urls : [urls])
		.map((item) => String(item || '').trim())
		.filter(Boolean)

	if (!validUrls.length) {
		return
	}

	uni.previewImage({
		urls: validUrls,
		current: current || validUrls[0],
		indicator: 'number',
		loop: true
	})
}
