import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { DefaultChatTransport } from 'ai'
import { ModelsPage } from './Models'
import type { MyUIMessage } from '@/types'
import { useUser } from '@/services/react-query/hooks'
import { getAuthHeader } from '@/services/auth'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { DropdownMenuCheckboxes, SideBar } from '@/templates'
import { ComboBox } from '@/templates/ComboBox'
import MyPromptInput from '@/templates/PromptInput'
import { MyConversation } from '@/templates/Conversation'

export const Home = () => {
  const { data: user, isLoading: isUserLoading } = useUser()
  const { messages, sendMessage, status } = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      api: 'http://localhost:3001/chat',
      headers: ((): Record<string, string> => {
        const header = getAuthHeader()
        return header ? { Authorization: header } : {}
      })(),
      credentials: 'same-origin',
    }),
  })

  const onSubmit = (input: string) => {
    sendMessage({ text: input })
  }

  return (
    <SideBar>
      <div className="w-full p-4">
        {/* <DropdownMenuCheckboxes /> */}
        <ComboBox />

        {/* <div>Welcome {isUserLoading ? ' user' : user?.userName}</div> */}

        <MyConversation messages={messages} />

        <MyPromptInput onSubmit={onSubmit} />
      </div>
    </SideBar>
  )
}
