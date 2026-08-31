import './env.js'
import { buildClose } from './format.js'
import { postEmbed, postText } from './discord.js'
import { yahooQuote, gold, fx } from './sources.js'
import { WATCHLIST, TAIEX_YAHOO } from './config.js'

// Usage: tsx src/run.ts probe|close

async function probe() {
  const out: Record<string, unknown> = {}
  try { out.taiex = await yahooQuote(TAIEX_YAHOO) } catch (e: any) { out.taiex = 'ERR ' + e.message }
  for (const w of WATCHLIST) {
    try { out[w.yahoo] = await yahooQuote(w.yahoo) } catch (e: any) { out[w.yahoo] = 'ERR ' + e.message }
  }
  try { out.gold = await gold() } catch (e: any) { out.gold = 'ERR ' + e.message }
  try { out.fx = await fx() } catch (e: any) { out.fx = 'ERR ' + e.message }
  console.log(JSON.stringify(out, null, 2))
  try {
    const e = await buildClose()
    console.log('\n--- PREVIEW (close) ---\n' + e.description)
    console.log('\ncolor: #' + e.color.toString(16).padStart(6, '0'))
  } catch (e: any) { console.log('preview ERR', e.message) }
}

async function main() {
  const mode = process.argv[2] ?? 'close'
  if (mode === 'probe') return probe()
  try {
    if (mode === 'close') { await postEmbed(await buildClose()) }
    else throw new Error(`unknown mode: ${mode}`)
    console.log(`[${new Date().toISOString()}] pushed ${mode}`)
  } catch (e) {
    console.error('FAILED', e)
    await postText(`⚠️ 台股快報(${mode})失敗: ${e instanceof Error ? e.message : String(e)}`).catch(() => {})
    process.exit(1)
  }
}

main()