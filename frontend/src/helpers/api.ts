import type { GroupedModels, Model, Models } from '@/types'

export const groupByProvider = async (
  models: Promise<Models>,
): Promise<{
  models: Array<Model>
  groupedModels: GroupedModels
  keys: Array<string>
}> => {
  const data = (await models).data

  // group models by provider
  const grouped: GroupedModels = data.reduce<GroupedModels>(
    (acc: any, model) => {
      const provider = model.id.split('/')[0] || 'unknown'
      if (!acc[provider]) {
        acc[provider] = []
      }
      acc[provider].push(model)
      return acc
    },
    {},
  )

  const keys = Object.keys(grouped)

  // sort each provider's models by input_price (ascending)
  keys.forEach((provider) => {
    grouped[provider].sort((a, b) => a.input_price - b.input_price)
  })

  // return an object with provider keys ordered alphabetically
  const groupedModels = keys
    .sort((a, b) => a.localeCompare(b))
    .reduce<GroupedModels>((acc, provider) => {
      acc[provider] = grouped[provider]
      return acc
    }, {})

  return { groupedModels, models: data, keys }
}

export const formatNumber = ({
  price,
  isCents,
}: {
  price: number
  isCents?: boolean
}) => {
  return isCents
    ? new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price * 100)
    : `$${(price * 1_000_000).toFixed(2)}/M`
}
