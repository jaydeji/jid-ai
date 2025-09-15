import { Outlet, useParams } from '@tanstack/react-router'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useEffect } from 'react'
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
import { SidebarApp } from '@/components/sidebar-app'
import {
  queryClient,
  useChat as useChatHook,
} from '@/services/react-query/hooks'
import { config } from '@/services'
import { getAuthHeader } from '@/services/auth'
import { chatsKey } from '@/services/react-query/keys'

export default function Main() {
  const { chatId } = useParams({ strict: false })
  const { data } = useChatHook(chatId)

  const chatOptions = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      api: config.VITE_API_URL + '/chat',
      headers: ((): Record<string, string> => {
        const header = getAuthHeader()
        return header ? { Authorization: header } : {}
      })(),
    }),
    onFinish: () => console.log('finished'),
  })

  useEffect(() => {
    if (!chatId) {
      chatOptions.setMessages([])
    }
  }, [chatId])

  useEffect(() => {
    if (chatId && data) {
      chatOptions.setMessages(data.messages)
    }

    queryClient.invalidateQueries({ queryKey: chatsKey })
  }, [data])

  return (
    <SidebarProvider>
      <SidebarApp />
      <SidebarInset className="flex flex-col h-screen overflow-y-auto">
        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {data && (
                    <BreadcrumbPage className="line-clamp-1">
                      {data.title}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
