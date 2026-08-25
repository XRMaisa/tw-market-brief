import { WATCHLIST, TAIEX_YAHOO, COLOR_UP, COLOR_DOWN, COLOR_FLAT } from './config.js'
import { yahooQuote, gold, fx } from './sources.js'

export interface Embed { title: string; description: string; color: number }

function dir(change: number): { emoji: string; arrow: string } {
  if (change > 0) return { emoji: '🔴', arrow: '▲' }   // 漲紅
  if (change < 0) return { emoji: '🟢', arrow: '▼' }   // 跌綠
  return { emoji: '⚪', arrow: '▬' }
}
const f2 = (n: number) => n.toFixed(2)
const f1 = (n: number) => n.toFixed(1)
const f0 = (n: number) => n.toFixed(0)
const s2 = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2)
const fpts = (n: number) => Math.abs(n).toFixed(2) // magnitude only — arrow/emoji carry direction

function timeLabel(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

export async function buildIntraday(): Promise<Embed> {
  const lines: string[] = []
  let color = COLOR_FLAT

  // 大盤
  try {
    const q = await yahooQuote(TAIEX_YAHOO)
    color = q.change > 0 ? COLOR_UP : q.change < 0 ? COLOR_DOWN : COLOR_FLAT
    const d = dir(q.change)
    lines.push(`**大盤** ${f2(q.price)}  ${d.emoji} ${d.arrow}${fpts(q.change)} (${s2(q.pct)}%)`)
  } catch {
    lines.push(`**大盤** ⚠️ 抓取失敗`)
  }

  // 個股 (fixed order, no sorting, no warnings beyond ⚠️ on failure)
  lines.push('')
  lines.push(`**個股**`)
  for (const w of WATCHLIST) {
    try {
      const q = await yahooQuote(w.yahoo)
      const d = dir(q.change)
      lines.push(`${w.name} ${f2(q.price)}  ${d.emoji} ${d.arrow}${fpts(q.change)} (${s2(q.pct)}%)`)
    } catch {
      lines.push(`${w.name} ⚠️ 抓取失敗`)
    }
  }

  // 黃金
  lines.push('')
  try {
    const g = await gold()
    if (g.change == null) {
      lines.push(`**黃金** ${f1(g.price)} USD/oz`)
    } else {
      const d = dir(g.change)
      lines.push(`**黃金** ${f1(g.price)} USD/oz  ${d.emoji} ${d.arrow}${fpts(g.change)} (${s2(g.pct!)}%)`)
    }
  } catch {
    lines.push(`**黃金** ⚠️ 抓取失敗`)
  }

  // 匯率 (4 items, daily — no intraday change)
  lines.push('')
  lines.push(`**匯率**`)
  try {
    const { usdTwd, usdJpy } = await fx()
    const jpyPerTwd = usdJpy / usdTwd      // 1 TWD = X JPY
    const twdPerJpy = usdTwd / usdJpy      // 1 JPY = X TWD
    lines.push(`臺幣兌美元:1 USD = ${f2(usdTwd)} TWD`)
    lines.push(`臺幣兌日幣:1 TWD = ${f2(jpyPerTwd)} JPY`)
    lines.push(`US$100 = NT$${f0(usdTwd * 100)}`)
    lines.push(`¥10,000 = NT$${f0(twdPerJpy * 10000)}`)
  } catch {
    lines.push(`匯率 ⚠️ 抓取失敗`)
  }

  return { title: `📊 台股盤中快報  ${timeLabel()}`, description: lines.join('\n'), color }
}

export async function buildClose(): Promise<Embed> {
  const e = await buildIntraday()
  e.title = `📊 台股收盤總結  ${timeLabel()}`
  return e
}