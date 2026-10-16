// Static approximate exchange rates — base: JPY
// Update these values if you want fresher rates.
export const RATES_TO_JPY = {
  JPY: 1,
  USD: 150,
  EUR: 165,
  GBP: 193,
  NTD: 4.6,
  KRW: 0.11,
  CNY: 21,
  HKD: 19,
}

export const SYMBOLS = {
  JPY: '¥', USD: '$', EUR: '€', GBP: '£',
  NTD: 'NT$', KRW: '₩', CNY: 'CN¥', HKD: 'HK$',
}

// Currencies shown as rounded integers (no cents)
const INTEGER_CURRS = new Set(['JPY', 'KRW'])

export function convert(amount, from, to) {
  if (from === to) return amount
  const fromRate = RATES_TO_JPY[from] || 1
  const toRate   = RATES_TO_JPY[to]   || 1
  return amount * (fromRate / toRate)
}

function cycleMultiplier(cycle) {
  return { Monthly: 1, Yearly: 1 / 12, Quarterly: 1 / 3, Weekly: 4.33, Custom: 1 }[cycle] || 1
}

// Monthly amount in the subscription's own currency
export function toMonthly(sub) {
  return sub.amount * cycleMultiplier(sub.cycle)
}

// Monthly amount converted to targetCurrency
export function toMonthlyIn(sub, targetCurrency) {
  return convert(toMonthly(sub), sub.currency || 'JPY', targetCurrency)
}

export function fmt(amount, currency = 'JPY') {
  const sym = SYMBOLS[currency] || currency
  return INTEGER_CURRS.has(currency)
    ? sym + Math.round(amount).toLocaleString()
    : sym + amount.toFixed(2)
}
