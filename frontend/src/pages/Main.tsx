import { useParams } from '@tanstack/react-router'
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
import { Chat } from '@/components/chat'
import { SidebarApp } from '@/components/sidebar-app'
import { useChat } from '@/services/react-query/hooks'

export default function Main() {
  const { chatId } = useParams({ strict: false })

  const { data } = useChat(chatId)

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
        <Chat data={data} />
      </SidebarInset>
    </SidebarProvider>
  )
}
