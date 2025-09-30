import { GlobeIcon } from 'lucide-react'
import { memo } from 'react'
import { ComboBox } from './ComboBox'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Attachment } from '@/components/Attachment'

export const BottomBarNoMemo = ({
  className,
}: {
  className?: HTMLElement['className']
}) => {
  const model = useStore((state) => state.model)
  const modelParameters = useStore((state) => state.modelParameters)
  const setModel = useStore((state) => state.setModel)
  const setModelParameters = useStore((state) => state.setModelParameters)

  return (
    <div className={cn('w-full flex justify-between items-center', className)}>
      <div className="flex justify-between items-center gap-2">
        <Attachment />

        <Button
          className=" flex gap-2 cursor-pointer"
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
          <span className="hidden md:inline text-sm font-normal">Search</span>
        </Button>

        <ComboBox
          model={model}
          onSelect={(val: string) => {
            setModel(val)
          }}
        />
      </div>
    </div>
  )
}

export const BottomBar = memo(BottomBarNoMemo)
