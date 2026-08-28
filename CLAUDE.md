# tw-market-brief — 專案 Recap

> 2026-08-27 建立部署;2026-08-28 改 3 則排程 + repo 改 public。回到這專案時先讀這份。

## 這是什麼
每個交易日自動抓 **台股大盤 + 8 檔個股/ETF + 黃金 + 匯率**,整理後推到 Discord 的 bot。跑在 **GitHub Actions**(免費、免常駐機器)。

## 排程(台灣時間 UTC+8)— 每個交易日 3 則
- `intraday-brief`:**09:05** 與 **10:45** 各推一則盤中快報(2 個獨立 cron,各跑一次短任務)
- `close-brief`:**14:05** 推一則收盤總結
- 週末不跑(cron `1-5`);國定假日偵測到 `^TWII` 無當日成交則跳過
- ⚠️ GitHub Actions 排程可能延遲;repo 已設為 **public**(優先序較高)。若仍嚴重延遲,考慮改 Cloudflare Workers Cron。

## 資料源(全免費、免 API key)
| 項目 | 來源 |
|---|---|
| 大盤(加權指數)即時 | Yahoo `^TWII` |
| 個股 / ETF 即時 | Yahoo `2330.TW`、`00981A.TW`、`00403A.TW` 等 |
| 黃金(現貨 USD/oz) | gold-api `https://api.gold-api.com/price/XAU` |
| 黃金漲跌 | Yahoo `GC=F`(gold-api 無昨收,故借 GC=F) |
| 匯率 USD/TWD、USD/JPY | open.er-api `https://open.er-api.com/v6/latest/USD` |

## 觀察清單(固定順序 — 改 `src/config.ts` 的 `WATCHLIST`)
`2330 台積電` / `2308 台達電` / `2454 聯發科` / `0050 元大台灣50` / `00981A 主動統一台股增長` / `2646 星宇航空` / `00403A 主動統一升級50` / `2317 鴻海`

## 推播格式
Discord **embed**:色條隨大盤方向(**漲紅 `#F44336` / 跌綠 `#4CAF50`**,台股慣例、與西方相反),每行前綴 🔴漲 / 🟢跌 / ⚪平。
內容:大盤(點數+漲跌點+%)+ 8 檔個股(固定順序,漲跌+%,不排序不警示)+ 黃金(USD/oz+漲跌)+ 匯率 4 項:
- `臺幣兌美元:1 USD = X TWD`
- `臺幣兌日幣:1 TWD = X JPY`
- `US$100 = NT$X`
- `¥10,000 = NT$X`

## 關鍵檔案
- `src/config.ts` — WATCHLIST、時段、顏色(40min 間隔僅本機 loop 用)
- `src/sources.ts` — 各資料源 fetch(Yahoo/gold-api/er-api)+ 休市偵測
- `src/format.ts` — 組 Discord embed
- `src/discord.ts` — POST webhook
- `src/run.ts` — CLI:`probe` / `intraday` / `close`
- `src/loop.ts` — 盤中迴圈(本機模擬用;workflow 已改用 3 個獨立 cron,不再用此檔)
- `src/env.ts` — 本機 `.env` 載入器(GH 用 workflow env,不讀 .env)
- `.github/workflows/intraday.yml`(2 cron:09:05/10:45)、`close.yml`(1 cron:14:05)— 排程(cron 為 UTC)
- `.env`(gitignore,本機 webhook)/ `.env.example`

## 本機指令
```bash
cd ~/Desktop/tw-market-brief
npm install
npm run probe   # 只抓資料+預覽,不送 Discord
npm run once    # 送一則盤中快報
npm run close   # 送一則收盤總結
npm run loop    # 本機模擬盤中迴圈(09:05–13:05)
```

## GitHub
- repo:`XRMaisa/tw-market-brief`(**public** — 為提升 GH Actions 排程優先序;webhook 在 secret、程式碼公開無妨)
- secret:`DISCORD_WEBHOOK_URL`(本機 `.env` 同值,已 gitignore)
- 手動觸發:Actions 頁面 → Run workflow,或 `gh workflow run <workflow-id>`
- 看 run:`gh run list` / `gh run view <id> --log`

## 改完修改後
改完 `src/*` 或 workflow → `git add -A && git commit -m "..." && git push`,GH Actions 自動用新版。

## 已知小事 / Gotchas
- **GH Actions 排程會延遲**:2026-08-27 close-brief 曾延遲 11 小時(凌晨才送到)、intraday 4h 迴圈漏掉整段。已改 3 個獨立 cron + repo 改 public 提升優先序;若仍嚴重延遲,考慮改 Cloudflare Workers Cron。
- GH log 的 `Node 20 deprecated` 警告是 **action 自身 runtime**(checkout/setup-node 內部),不影響腳本(腳本用 Node 22)。要消音可把 `actions/checkout@v4`、`actions/setup-node@v4` 升 `@v5`(選用)。
- 著色只能用 Discord **embed 色條 + emoji**(純文字不能著色)。
- 收盤總結 MVP 用 **Yahoo 14:05 的值**(≈官方收盤);官方 TWSE 盤後 API(FMTQIK/STOCK_DAY_ALL)之後可再接,做更權威的收盤數字。
- `gh` 在這台機器裝在 `C:\Program Files\GitHub CLI\gh.exe`;若某個 shell 打 `gh` 找不到(舊 session 的 PATH 未更新),用完整路徑即可。
- 這個專案的 dashboard 淵源(`~/Desktop/finance-dashboard`,Nuxt 4)不是 git repo、未上 GitHub;本 bot 另開獨立 repo,不動 dashboard。

## 狀態(2026-08-28)
- 08-27 部署完成(close-brief run success)。
- 08-28 發現 GH Actions 排程嚴重延遲(close-brief 延遲 11h 到凌晨、intraday 4h 迴圈漏掉整段 → 0 則盤中)。
- 08-28 改成 3 個獨立 cron(09:05 / 10:45 / 14:05)+ repo 改 public 以提升優先序。若仍延遲再考慮 Cloudflare。