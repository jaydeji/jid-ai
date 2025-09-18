import type { GroupedModels, Model, Models } from '@/types'

export const groupByProvider = async (
  models: Promise<Models>,
): Promise<{
  models: Array<Model & { provider: string }>
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
    grouped[provider].sort(
      (a, b) => Number(a.pricing.prompt) - Number(b.pricing.completion),
    )
  })

  // return an object with provider keys ordered alphabetically
  const groupedModels = keys
    .sort((a, b) => a.localeCompare(b))
    .reduce<GroupedModels>((acc, provider) => {
      acc[provider] = grouped[provider]
      return acc
    }, {})

  return {
    groupedModels,
    models: data
      .sort((a, b) => Number(a.pricing.prompt) - Number(b.pricing.completion))
      .map((e) => ({ ...e, provider: e.id.split('/')[0] || 'unknown' })),
    keys,
  }
}

export const formatNumber = ({
  price,
  isCents,
}: {
  price: number | string
  isCents?: boolean
}) => {
  return isCents
    ? new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(price) * 100)
    : `$${(Number(price) * 1_000_000).toFixed(2)}/M`
}
