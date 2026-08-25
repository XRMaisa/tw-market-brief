// Tiny .env loader for local runs. No-op if .env is absent (GitHub Actions uses
// workflow `env:` instead). Never overrides existing env vars.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

try {
  const here = dirname(fileURLToPath(import.meta.url))
  const envPath = join(here, '..', '.env')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
    }
  }
} catch { /* ignore */ }