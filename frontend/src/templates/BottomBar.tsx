import { ComboBox } from './ComboBox'
import { ChatInputSubmit } from '@/components/ui/chat-input'

export const BottomBar = ({ model, setModel }: any) => {
  return (
    <div className="w-full flex justify-between items-center mt-2">
      <ComboBox
        model={model}
        onSelect={(val: string) => {
          setModel(val)
        }}
      />
      <ChatInputSubmit />
    </div>
  )
}
