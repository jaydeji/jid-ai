import { MicIcon, PaperclipIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent, FormEventHandler } from 'react'
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input'
import { useModels } from '@/services/react-query/hooks'

const MyPromptInput = ({ onSubmit }: { onSubmit: (string: text) => void }) => {
  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<string>()
  const [status, setStatus] = useState<
    'submitted' | 'streaming' | 'ready' | 'error'
  >('ready')

  const { data, isSuccess } = useModels()

  useEffect(() => {
    if (isSuccess) {
      setModel('smart/task')
    }
  }, [isSuccess])

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (!text) {
      return
    }

    onSubmit(text)
    setText('')
  }
  return (
    <div className="p-8 w-full">
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          onChange={(e) => setText(e.target.value)}
          value={text}
          placeholder="Type your message..."
        />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputButton>
              <PaperclipIcon size={16} />
            </PromptInputButton>
            <PromptInputButton>
              <MicIcon size={16} />
              <span>Voice</span>
            </PromptInputButton>
            {/* <PromptInputModelSelect onValueChange={setModel} value={model}>
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent className="h-96">
                {data?.models.map((mod) => (
                  <PromptInputModelSelectItem key={mod.id} value={mod.id}>
                    {mod.id}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect> */}
          </PromptInputTools>
          <PromptInputSubmit disabled={!text} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}
export default MyPromptInput
