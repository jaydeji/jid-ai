import { toast } from 'sonner'
import c from 'copy-to-clipboard'

export const formatPrice = (n: string) => {
  return (Math.floor(Number(n) * 10) / 10).toFixed(1)
}
export const copy = async (text: string) => {
  if ('clipboard' in navigator) {
    await navigator.clipboard.writeText(text)
  } else {
    c(text)
  }

  toast.success('copied')
}
