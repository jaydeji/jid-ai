import { Link, useParams } from '@tanstack/react-router'
import { MessageCircle, SquarePen } from 'lucide-react'
import { PriceCard } from './price-card'
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
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { NavUser } from '@/components/nav-user'
import { useChats, useUser } from '@/services/react-query/hooks'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

export function SidebarApp({ ...props }: ComponentProps<typeof Sidebar>) {
  const { data: user } = useUser()
  const { data: chats } = useChats({ enabled: !!user })

  const { chatId } = useParams({ strict: false })

  // if (!loggedIn) {
  //   return (
  //     <Sidebar className="border-r-0" {...props}>
  //       <SidebarHeader>
  //         <div className="flex items-center justify-between p-2">
  //           <div className="flex items-center gap-3">
  //             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
  //               <MessageCircle className="h-5 w-5 text-primary-foreground" />
  //             </div>
  //             <span className="text-lg font-semibold">jid-ai</span>
  //           </div>
  //         </div>
  //       </SidebarHeader>
  //       <SidebarContent>
  //         <div className="p-4">
  //           <Link to="/login" className="w-full">
  //             <Button>Sign in</Button>
  //           </Link>
  //         </div>
  //       </SidebarContent>
  //     </Sidebar>
  //   )
  // }

  // if (!user || !chats) return null

  const { clearChat } = useStore()

  // Group chats by last activity with proper fallback
  const DAY = 24 * 60 * 60 * 1000
  const now = Date.now()
  const startOfToday = new Date().setHours(0, 0, 0, 0)
  const startOfYesterday = startOfToday - DAY

  // Ensure chats is an array and sort by most recent first
  const sortedChats = (chats ?? []).sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  // Initialize chat groups
  const todayChats: typeof sortedChats = []
  const yesterdayChats: typeof sortedChats = []
  const lastWeekChats: typeof sortedChats = []
  const lastMonthChats: typeof sortedChats = []
  const oldChats: typeof sortedChats = []

  // Group chats by time periods
  for (const chat of sortedChats) {
    const lastActivity = new Date(chat.updatedAt).getTime()

    if (lastActivity >= startOfToday) {
      todayChats.push(chat)
    } else if (lastActivity >= startOfYesterday) {
      yesterdayChats.push(chat)
    } else if (lastActivity >= now - 7 * DAY) {
      lastWeekChats.push(chat)
    } else if (lastActivity >= now - 30 * DAY) {
      lastMonthChats.push(chat)
    } else {
      oldChats.push(chat)
    }
  }

  // Helper function to render chat group
  const renderChatGroup = (chats: typeof sortedChats, label: string) => {
    if (chats.length === 0) return null

    return (
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <Link
                to="/chats/$chatId"
                params={{ chatId: chat.id }}
                className="w-full"
              >
                <SidebarMenuButton
                  className={cn(
                    'w-full flex items-center justify-start gap-2',
                    chatId === chat.id && 'bg-card text-chart-2',
                  )}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  <span
                    className="flex-1 min-w-0 truncate"
                    title={chat.title || 'Untitled Chat'}
                  >
                    {chat.title || 'Untitled Chat'}
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <Link
            to={'/'}
            className="flex items-center gap-3"
            onClick={() => clearChat()}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">jid AI</span>
            <PriceCard />
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={'/'} onClick={() => clearChat()}>
                <Button size="icon" variant="ghost" className="cursor-pointer">
                  <SquarePen className="h-5 w-5" />
                  <span className="sr-only">New Chat</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="flex flex-col">
          {renderChatGroup(todayChats, 'Today')}
          {renderChatGroup(yesterdayChats, 'Yesterday')}
          {renderChatGroup(lastWeekChats, 'Last 7 Days')}
          {renderChatGroup(lastMonthChats, 'Last 30 Days')}
          {renderChatGroup(oldChats, 'Old')}

          {/* Show message when no chats exist */}
          {sortedChats.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <p>No chats yet. Start a new conversation!</p>
            </div>
          )}
        </div>
      </SidebarContent>

      <SidebarRail />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
