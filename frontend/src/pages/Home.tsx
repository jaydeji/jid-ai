import { Outlet } from '@tanstack/react-router'
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
import { useMyChat } from '@/services/react-query/hooks'

export function Home() {
  const { data } = useMyChat()

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
                  {data?.title && (
                    <BreadcrumbPage className="line-clamp-1">
                      {data.title}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
