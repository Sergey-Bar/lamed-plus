export function XpFly({ amount = 10 }: { amount?: number }) {
  return (
    <span className="xp-fly absolute -top-1 start-full ms-1 text-sm font-extrabold text-brand-green-dark">
      +{amount}
    </span>
  )
}
