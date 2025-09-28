import { Outlet, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
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
  useSidebar,
} from '@/components/ui/sidebar'
import { SidebarApp } from '@/components/sidebar-app'
import { useChatData } from '@/services/react-query/hooks'

function CloseMobileSheetOnRouteChange() {
  const { setOpenMobile } = useSidebar()
  const location = useRouterState({
    select: (s) => s.location,
  })
  useEffect(() => {
    setOpenMobile(false)
  }, [location.pathname, setOpenMobile])
  return null
}

export function Home() {
  const title = useChatData().title

  return (
    <SidebarProvider>
      <CloseMobileSheetOnRouteChange />
      <SidebarApp />
      <SidebarInset className="flex flex-col h-[100dvh] min-h-0 overflow-hidden overscroll-none">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 bg-background">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {title && (
                    <BreadcrumbPage className="line-clamp-1">
                      {title}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
