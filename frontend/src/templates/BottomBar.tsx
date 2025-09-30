import { GlobeIcon } from 'lucide-react'
import { memo } from 'react'
import { ComboBox } from './ComboBox'
import { ChatInputSubmit } from '@/components/ui/chat-input'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'

export const BottomBarNoMemo = () => {
  const model = useStore((state) => state.model)
  const modelParameters = useStore((state) => state.modelParameters)
  const setModel = useStore((state) => state.setModel)
  const setModelParameters = useStore((state) => state.setModelParameters)

  return (
    <div className="w-full flex justify-between items-center mt-2">
      <div className="flex justify-between items-center gap-2">
        <Button
          className="rounded-full md:rounded-md flex gap-2"
          onClick={() => {
            if (!modelParameters) {
              setModelParameters({
                includeSearch: true,
              })
            }

            setModelParameters({
              includeSearch: !modelParameters?.includeSearch,
            })
          }}
          variant={modelParameters?.includeSearch ? 'default' : 'ghost'}
        >
          <GlobeIcon size={16} />
          <span className="hidden md:inline">Search</span>
        </Button>
        <ComboBox
          model={model}
          onSelect={(val: string) => {
            setModel(val)
          }}
        />
      </div>
      <ChatInputSubmit />
    </div>
  )
}

export const BottomBar = memo(BottomBarNoMemo)
