import { useParams } from '@tanstack/react-router'
import { useChat } from '@ai-sdk/react'
import { useEffect, useState } from 'react'
import { MyChat } from '@/components/chat'
import { useChat as useChatHook, useUser } from '@/services/react-query/hooks'
import { useSharedChatContext } from '@/components/chat-context'

export function ChatPage() {
  const [text, setText] = useState<string>('')
  const { data: user } = useUser()
  const [model, setModel] = useState<string>(
    user?.currentlySelectedModel || '', // openai/gpt-5-mini:flex
  )
  const { chatId } = useParams({ strict: false })

  const { data } = useChatHook(chatId)

  const { chat } = useSharedChatContext()
  const chatOptions = useChat({
    chat,
  })

  useEffect(() => {
    if (!model && user?.currentlySelectedModel) {
      setModel(user.currentlySelectedModel)
    }
  }, [user?.currentlySelectedModel])

  const handleSubmit = () => {
    chatOptions.sendMessage({ text }, { body: { model, chatId: data?.id } })
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
