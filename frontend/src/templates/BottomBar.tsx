import { DropdownMenuCheckboxes } from './DropDown'
import { ChatInputSubmit } from '@/components/ui/chat-input'

export const BottomBar = ({ model, setModel }: any) => {
  return (
    <div className="w-full flex justify-between items-center">
      <DropdownMenuCheckboxes
        model={model}
        onSelect={(val: string) => {
          setModel(val)
        }}
        value={model}
      />
      <ChatInputSubmit />
    </div>
  )
}
