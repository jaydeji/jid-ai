type KnownModality = 'text' | 'image' | 'file' | 'audio'

type ModalityType = KnownModality | (string & {})

export const Modality = ({ modality }: { modality: Array<ModalityType> }) => {
  const colorMap: Record<string, string> = {
    text: 'text-green-700',
    audio: 'text-red-700',
    image: 'text-blue-700',
    file: 'text-yellow-700',
  }

  return (
    <div className="flex flex-wrap gap-2">
      {modality
        .sort()
        .reverse()
        .map((e) => {
          const className = colorMap[e] ?? 'text-gray'
          return (
            <span className={className} key={e}>
              {e}
            </span>
          )
        })}
    </div>
  )
}
