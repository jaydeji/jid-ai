export const formatPrice = (n: string) => {
  return (Math.floor(Number(n) * 10) / 10).toFixed(1)
}
