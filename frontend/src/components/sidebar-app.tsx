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

// This is sample data.
const data = {
  recentChats: [
    {
      title: 'Project Planning Assistant',
      date: new Date(2024, 2, 20),
      url: '#',
    },
    {
      title: 'Code Review Helper',
      date: new Date(2024, 2, 19),
      url: '#',
    },
    {
      title: 'Bug Analysis Chat',
      date: new Date(2024, 2, 18),
      url: '#',
    },
  ],
  lastWeekChats: [
    {
      title: 'API Design Discussion',
      date: new Date(2024, 2, 15),
      url: '#',
    },
    {
      title: 'Database Schema Planning',
      date: new Date(2024, 2, 14),
      url: '#',
    },
  ],
  lastMonthChats: [
    {
      title: 'Architecture Overview',
      date: new Date(2024, 1, 28),
      url: '#',
    },
    {
      title: 'Performance Optimization',
      date: new Date(2024, 1, 25),
      url: '#',
    },
  ],
  previousChats: [
    {
      title: 'Initial Project Setup',
      date: new Date(2023, 11, 15),
      url: '#',
    },
    {
      title: 'Requirements Analysis',
      date: new Date(2023, 11, 10),
      url: '#',
    },
  ],
}

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
                  <SquarePen className="h-5 w-5" />
                  <span className="sr-only">New Chat</span>
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
                  <SidebarMenuButton className="w-full flex items-center justify-start gap-2">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span
                      className="flex-1 min-w-0 truncate"
                      title={chat.title}
                    >
                      {chat.title}
                    </span>
                  </SidebarMenuButton>
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
