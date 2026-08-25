import './env.js'
import { buildIntraday } from './format.js'
import { postEmbed, postText } from './discord.js'
import { marketOpen } from './sources.js'
import { FIRST_PUSH, LAST_PUSH, PUSH_EVERY_MS } from './config.js'

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

function pushTimesToday(): number[] {
  const base = new Date()
  const start = new Date(base); start.setHours(FIRST_PUSH.h, FIRST_PUSH.m, 0, 0)
  const end = new Date(base); end.setHours(LAST_PUSH.h, LAST_PUSH.m, 0, 0)
  const out: number[] = []
  for (let t = start.getTime(); t <= end.getTime(); t += PUSH_EVERY_MS) out.push(t)
  return out
}

async function pushOnce() {
  try {
    if (!(await marketOpen())) {
      console.log(`[${new Date().toISOString()}] market closed (holiday) — skip`)
      return
    }
    await postEmbed(await buildIntraday())
    console.log(`[${new Date().toISOString()}] pushed intraday`)
  } catch (e) {
    console.error('push failed', e)
    await postText(`⚠️ 台股盤中快報失敗: ${e instanceof Error ? e.message : String(e)}`).catch(() => {})
  }
}

async function main() {
  for (const t of pushTimesToday()) {
    const now = Date.now()
    if (t < now - 10 * 60 * 1000) continue        // slot older than 10 min → skip
    if (t > now) await sleep(t - now)
    await pushOnce()
  }
  console.log('loop done')
}

main()