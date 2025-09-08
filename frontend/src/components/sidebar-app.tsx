import { Link } from '@tanstack/react-router'
import { MessageCircle, SquarePen } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { NavUser } from '@/components/nav-user'
import { useChats, useUser } from '@/services/react-query/hooks'

export function SidebarApp({ ...props }: ComponentProps<typeof Sidebar>) {
  const { data: user } = useUser()
  const { data: chats } = useChats({ enabled: !!user })

  if (!user || !chats) return null

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">jid-ai</span>
          </div>
          {/* New Chat Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Link to="/" className="w-full">
                    <SquarePen className="h-5 w-5" />
                    <span className="sr-only">New Chat</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-4">
          {/* Recent Chats */}
          <SidebarGroup>
            <SidebarGroupLabel>Recent</SidebarGroupLabel>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.title}>
                  <Link
                    to="/chats/$chatId"
                    params={{ chatId: chat.id }}
                    className="w-full"
                  >
                    <SidebarMenuButton className="w-full flex items-center justify-start gap-2">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span
                        className="flex-1 min-w-0 truncate"
                        title={chat.title}
                      >
                        {chat.title}
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* Previous 7 Days */}
          {/* <SidebarGroup>
            <SidebarGroupLabel>Previous 7 Days</SidebarGroupLabel>
            <SidebarMenu>
              {lastWeekChats.map((chat) => (
                <SidebarMenuItem key={chat.title}>
                  <SidebarMenuButton className="w-full justify-start">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {chat.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup> */}

          {/* Previous 30 Days */}
          {/* <SidebarGroup>
            <SidebarGroupLabel>Previous 30 Days</SidebarGroupLabel>
            <SidebarMenu>
              {lastMonthChats.map((chat) => (
                <SidebarMenuItem key={chat.title}>
                  <SidebarMenuButton className="w-full justify-start">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {chat.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup> */}

          {/* Previous Years */}
          {/* <SidebarGroup>
            <SidebarGroupLabel>Previous Years</SidebarGroupLabel>
            <SidebarMenu>
              {previousChats.map((chat) => (
                <SidebarMenuItem key={chat.title}>
                  <SidebarMenuButton className="w-full justify-start">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {chat.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup> */}
        </div>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
