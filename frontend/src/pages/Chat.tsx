import { useEffect, useState } from 'react'
import { MyChat } from '@/components/chat'
import { useMyChat, useUser } from '@/services/react-query/hooks'

export function ChatPage() {
  const [text, setText] = useState<string>('')
  const { data: user } = useUser()
  const [model, setModel] = useState<string>(
    user?.currentlySelectedModel || '', // openai/gpt-5-mini:flex
  )

  const { messages, error, stop, sendMessage, status, chatId } = useMyChat()

  useEffect(() => {
    if (!model && user?.currentlySelectedModel) {
      setModel(user.currentlySelectedModel)
    }
  }, [user?.currentlySelectedModel])

  const handleSubmit = () => {
    sendMessage({ text }, { body: { model, chatId } })
    setText('')
  }

  const isLoading = status === 'submitted'

  const handleSubmitMessage = () => {
    if (isLoading) {
      return
    }
    handleSubmit()
  }

  return (
    <MyChat
      setModel={setModel}
      model={model}
      isLoading={isLoading}
      handleSubmitMessage={handleSubmitMessage}
      setText={setText}
      text={text}
      error={error}
      messages={messages}
      stop={stop}
    />
  )
}
