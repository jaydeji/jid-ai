import { useNavigate, useParams } from '@tanstack/react-router'
import { DefaultChatTransport, generateId } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useEffect, useState } from 'react'
import type { MyUIMessage } from '@/types'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { MyChat } from '@/components/chat'
import { SidebarApp } from '@/components/sidebar-app'
import { useChat as useChatHook } from '@/services/react-query/hooks'
import { config } from '@/services'

export default function Main() {
  const { chatId } = useParams({ strict: false })
  const { data } = useChatHook(chatId)

  const chatOptions = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      api: config.VITE_API_URL + '/chat',
    }),
  })

  const navigate = useNavigate()

  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<string>(
    'novita/meta-llama/llama-3.2-1b-instruct', // openai/gpt-5-mini:flex
  )

  useEffect(() => {
    if (!chatId) {
      chatOptions.setMessages([])
    }
  }, [chatId])

  useEffect(() => {
    if (chatId && data) {
      chatOptions.setMessages(data.messages)
    }
  }, [data])

  const handleSubmit = () => {
    const chat_id = data?.id ? data.id : generateId()

    chatOptions.sendMessage({ text }, { body: { model, chatId: chat_id } })
    setText('')

    navigate({
      to: '/chats/$chatId',
      params: { chatId: chat_id },
    })
  }

  const isLoading = chatOptions.status === 'submitted'

  const handleSubmitMessage = () => {
    if (isLoading) {
      return
    }
    handleSubmit()
  }

  return (
    <SidebarProvider>
      <SidebarApp />
      <SidebarInset className="flex flex-col h-screen overflow-y-auto">
        {data && (
          <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      {data.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
        )}
        <MyChat
          chatOptions={chatOptions}
          setModel={setModel}
          model={model}
          isLoading={isLoading}
          handleSubmitMessage={handleSubmitMessage}
          setText={setText}
          text={text}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
