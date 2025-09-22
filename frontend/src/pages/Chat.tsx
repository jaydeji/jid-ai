import { useEffect, useState } from 'react'
import { MyChat } from '@/components/chat'
import { useChat as useChatHook, useUser } from '@/services/react-query/hooks'

export function ChatPage() {
  const [text, setText] = useState<string>('')
  const { data: user } = useUser()
  const [model, setModel] = useState<string>(
    user?.currentlySelectedModel || '', // openai/gpt-5-mini:flex
  )

  const { chatOptions, chatId } = useChatHook()

  useEffect(() => {
    if (!model && user?.currentlySelectedModel) {
      setModel(user.currentlySelectedModel)
    }
  }, [user?.currentlySelectedModel])

  const handleSubmit = () => {
    chatOptions.sendMessage({ text }, { body: { model, chatId } })
    setText('')
  }

  const isLoading = chatOptions.status === 'submitted'

  const handleSubmitMessage = () => {
    if (isLoading) {
      return
    }
    handleSubmit()
  }

  return (
    <MyChat
      chatOptions={chatOptions}
      setModel={setModel}
      model={model}
      isLoading={isLoading}
      handleSubmitMessage={handleSubmitMessage}
      setText={setText}
      text={text}
    />
  )
}
