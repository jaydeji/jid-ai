import { toast } from 'sonner'
import c from 'copy-to-clipboard'

export const formatPrice = (n: string) => {
  return (Math.floor(Number(n) * 10) / 10).toFixed(1)
}

export const copy = async (text: string, cb?: () => void) => {
  if ('clipboard' in navigator) {
    await navigator.clipboard.writeText(text)
    cb?.()
  } else {
    c(text, { onCopy: () => cb?.() })
  }

  toast.success('copied')
}

export const extractTextFromParts = (parts: Array<any>) => {
  return parts
    .filter((part) => part.type === 'text' && part.text)
    .map((part) => part.text)
    .join(' ')
}
