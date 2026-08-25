// Data source fetchers — all keyless/free.
// Yahoo for index + stocks + ETFs + gold change; gold-api for spot gold price; er-api for FX.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

async function getJson(url: string, headers: Record<string, string> = {}): Promise<any> {
  let lastErr: unknown
  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, ...headers } })
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`)
      return await r.json()
    } catch (e) { lastErr = e; await sleep(800) }
  }
  throw lastErr
}

export interface Quote {
  price: number; prev: number; change: number; pct: number; time: number; volume: number
}

export async function yahooQuote(symbol: string): Promise<Quote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`
  const j = await getJson(url)
  const meta = j.chart.result[0].meta
  const price = meta.regularMarketPrice
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? price
  const change = price - prev
  return { price, prev, change, pct: prev ? (change / prev) * 100 : 0, time: meta.regularMarketTime, volume: meta.regularMarketVolume ?? 0 }
}

export interface GoldInfo { price: number; change: number | null; pct: number | null }

// Spot price from gold-api; daily change from Yahoo gold futures (GC=F ≈ spot).
export async function gold(): Promise<GoldInfo> {
  const g = await getJson('https://api.gold-api.com/price/XAU')
  const price = g.price
  let change: number | null = null, pct: number | null = null
  try { const q = await yahooQuote('GC=F'); change = q.change; pct = q.pct } catch {}
  return { price, change, pct }
}

export interface FxInfo { usdTwd: number; usdJpy: number }

export async function fx(): Promise<FxInfo> {
  const j = await getJson('https://open.er-api.com/v6/latest/USD')
  return { usdTwd: j.rates.TWD, usdJpy: j.rates.JPY }
}

// Lenient holiday detection: skip only if latest ^TWII trade is from an earlier day
// AND it's already past 09:30 (well after open, still yesterday's data → holiday).
export async function marketOpen(): Promise<boolean> {
  try {
    const q = await yahooQuote('^TWII')
    const lastTrade = new Date(q.time * 1000)
    const now = new Date()
    const differentDay = lastTrade.toDateString() !== now.toDateString()
    const pastOpen = now.getHours() * 60 + now.getMinutes() >= 9 * 60 + 30
    return !(differentDay && pastOpen)
  } catch { return true } // if we can't tell, assume open (avoid false skips)
}