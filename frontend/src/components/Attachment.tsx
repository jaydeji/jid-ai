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

const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve((e.target as any).result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

const isTextFile = (file: File): boolean => {
  return file.type.includes('text')
}

export function Attachment() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setFiles = useStore((state) => state.setFiles)
  const setTextAttachments = useStore((state) => state.setTextAttachments)

  const handleAttachClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const selectedFiles = Array.from(e.target.files as FileList)

    try {
      const textFiles: Array<{ filename: string; content: string }> = []
      const regularFiles: Array<FileUIPart> = []

      // Process each file
      for (const file of selectedFiles) {
        if (isTextFile(file)) {
          // Read text file content
          const content = await fileToText(file)
          textFiles.push({
            filename: file.name,
            content: content,
          })
        } else {
          // Convert to data URL for images and other files
          const url = await fileToDataURL(file)
          regularFiles.push({
            type: 'file',
            mediaType: file.type,
            filename: file.name,
            url: url,
          } as FileUIPart)
        }
      }

      // Update store with separate arrays
      if (textFiles.length > 0) {
        setTextAttachments(textFiles)
      }
      if (regularFiles.length > 0) {
        setFiles(regularFiles)
      }
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
        // accept="image/*,.pdf,.doc,.docx,.txt,text/plain"
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
