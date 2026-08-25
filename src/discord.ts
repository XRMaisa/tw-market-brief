async function post(payload: object) {
  const url = process.env.DISCORD_WEBHOOK_URL
  if (!url) throw new Error('DISCORD_WEBHOOK_URL not set')
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    const t = await r.text().catch(() => '')
    throw new Error(`Discord HTTP ${r.status}: ${t}`)
  }
}

export async function postEmbed(embed: { title: string; description: string; color: number }) {
  await post({ embeds: [embed] })
}

export async function postText(content: string) {
  await post({ content })
}