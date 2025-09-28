import { useParams } from '@tanstack/react-router'
import { ChatPage } from './Chat'

export const ChatWrapper = () => {
  const { chatId } = useParams({ strict: false })

  const routeKey = chatId || 'new'

  return <ChatPage key={routeKey} />
}
