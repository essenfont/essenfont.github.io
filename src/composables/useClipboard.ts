import { ref } from 'vue'

// Copy-to-clipboard with visual feedback. Extracted from UnicodeCharPage
// so any page can use it without duplicating the pattern.
//
// @example
//   const { copied, copy } = useClipboard()
//   <button @click="copy('label', 'text')">copy</button>
//   <span v-if="copied === 'label'">✓</span>
export function useClipboard(timeout = 1200) {
  const copied = ref<string | null>(null)

  async function copy(label: string, text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = label
      setTimeout(() => {
        if (copied.value === label) copied.value = null
      }, timeout)
    } catch {
      // SSR or insecure context — silent fail
    }
  }

  return { copied, copy }
}