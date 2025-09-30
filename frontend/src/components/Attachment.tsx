import { PaperclipIcon } from 'lucide-react'
import { useRef } from 'react'
import { Button } from './ui/button'
import type { ChangeEvent } from 'react'
import type { FileUIPart } from 'ai'
import { useStore } from '@/store'

const fileToDataURL = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve((e.target as any).result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function Attachment() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setFiles = useStore((state) => state.setFiles)

  const handleAttachClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const selectedFiles = Array.from(e.target.files as FileList)

    try {
      // Convert files to FileUIPart format with data URLs
      const filePromises = selectedFiles.map(async (file) => {
        const url = await fileToDataURL(file)

        return {
          // id: crypto.randomUUID(),
          type: 'file',
          mediaType: file.type,
          filename: file.name,
          url: url,
          // size: file.size,
        } as FileUIPart
      })

      const newFiles = await Promise.all(filePromises)

      setFiles(newFiles)
    } catch (error) {
      console.error('Error processing files:', error)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center -mr-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple
        accept="image/*,.pdf,.doc,.docx"
      />

      <Button
        onClick={handleAttachClick}
        type="button"
        className="cursor-pointer"
        variant="ghost"
      >
        <PaperclipIcon size={16} />
        <span className="hidden md:inline text-sm font-normal">Attach</span>
      </Button>
    </div>
  )
}
