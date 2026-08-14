import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export function useKeyboardAvoidance(options = {}) {
  const extraBottom = Math.max(0, Number(options.extraBottom || 0))
  const keyboardHeight = ref(0)

  const keyboardAvoidanceStyle = computed(() => {
    const height = Math.max(0, keyboardHeight.value - extraBottom)
    return height > 0 ? { bottom: `${height}px` } : {}
  })

  function updateKeyboardHeight(value) {
    keyboardHeight.value = Math.max(0, Number(value || 0))
  }

  function handleKeyboardHeightChange(event) {
    updateKeyboardHeight(event?.detail?.height)
  }

  function resetKeyboardHeight() {
    updateKeyboardHeight(0)
  }

  const handleGlobalKeyboardHeightChange = (result) => {
    updateKeyboardHeight(result?.height)
  }

  onMounted(() => {
    if (typeof uni !== 'undefined' && typeof uni.onKeyboardHeightChange === 'function') {
      uni.onKeyboardHeightChange(handleGlobalKeyboardHeightChange)
    }
  })

  onBeforeUnmount(() => {
    if (typeof uni !== 'undefined' && typeof uni.offKeyboardHeightChange === 'function') {
      uni.offKeyboardHeightChange(handleGlobalKeyboardHeightChange)
    }
  })

  return {
    keyboardHeight,
    keyboardAvoidanceStyle,
    handleKeyboardHeightChange,
    resetKeyboardHeight
  }
}
