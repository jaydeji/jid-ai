import type { GroupedModels, Model, Models } from '@/types'

export const groupByProvider = async (
  models: Promise<Models>,
): Promise<{
  models: Array<Model & { provider: string }>
  groupedModels: GroupedModels
  keys: Array<string>
}> => {
  const data = (await models).data
  // const data = (await models).data
  // .filter((e) => !e.id.includes(':free'))
  // .slice(0, 150)

  // console.log(data.map((e) => e.id))

  // const providers = [
  //   'openai',
  //   'z-ai',
  //   'x-ai',
  //   'qwen',
  //   'mistral',
  //   'anthropic',
  //   'moonshot',
  //   'meta',
  //   'google',
  //   'anthropic',
  //   'deepseek',
  // ]

  // const map = providers.reduce((acc: any, e: string) => {
  //   acc[e] = []
  //   return acc
  // }, {})

  // data.forEach((e) => {
  //   const validId = providers.find((s) => e.id.toLowerCase().includes(s))

  //   if (validId && !e.id.includes(':free')) {
  //     map[validId].push(e)
  //   }
  // })

  // for (const key in map) {
  //   map[key] = map[key]
  //     .sort((a: any, b: any) => a.created - b.createdAt)
  //     .filter((_: any, i: number) => i < 6)
  // }

  // console.log(map)

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

  // console.log(grouped)

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
      .sort((a, b) => {
        const promptDiff = Number(a.pricing.prompt) - Number(b.pricing.prompt)
        if (promptDiff !== 0) {
          return promptDiff
        }
        return Number(a.pricing.completion) - Number(b.pricing.completion)
      })
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
    : `$${(Number(price) * 1_000_000).toFixed(3)}/M`
}
