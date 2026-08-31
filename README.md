# tw-market-brief

每個交易日收盤後(14:05)自動抓台股大盤 + 8 檔個股/ETF + 黃金 + 匯率,整理後推一則**收盤總結**到 Discord。跑在 GitHub Actions。

## 排程

| Workflow | cron(UTC) | 台灣時間 | 內容 |
|---|---|---|---|
| `close.yml` | `5 6 * * 1-5` | **14:05** | 一則**收盤總結** |

GitHub Actions runner 設 `TZ=Asia/Taipei`,腳本以本地時間(台灣,UTC+8,無夏令)計算時段。週末不觸發(cron `1-5`);國定假日以 ^TWII 最新成交日偵測,確認休市則跳過。

> ⚠️ GitHub Actions 排程可能延遲/漏掉;收盤總結每日一則、較不時間敏感,延遲個幾小時仍可用。若要分鐘級準時,需改 Cloudflare Workers Cron。

## 資料源(全部免費、免 API key)

| 項目 | 來源 |
|---|---|
| 大盤(加權指數) | Yahoo `^TWII` |
| 個股 / ETF | Yahoo `2330.TW`、`00981A.TW`、`00403A.TW` 等 |
| 黃金(現貨 USD/oz) | gold-api `https://api.gold-api.com/price/XAU` |
| 黃金漲跌 | Yahoo `GC=F`(gold-api 無昨收) |
| 匯率 USD/TWD、USD/JPY | open.er-api `https://open.er-api.com/v6/latest/USD` |

## 觀察清單(固定順序)

`2330 台積電 → 2308 台達電 → 2454 聯發科 → 0050 元大台灣50 → 00981A 主動統一台股增長 → 2646 星宇航空 → 00403A 主動統一升級50 → 2317 鴻海`

修改 `src/config.ts` 的 `WATCHLIST`。

## 推播格式

Discord embed:色條隨大盤方向(漲紅 `#F44336` / 跌綠 `#4CAF50`),每行前綴 🔴(漲)/ 🟢(跌)/ ⚪(平)。內容:大盤(點數+漲跌+%)、8 檔個股(漲跌+%,固定順序)、黃金(USD/oz+漲跌)、匯率 4 項(臺幣兌美元 / 臺幣兌日幣 / US$100→TWD / ¥10,000→TWD)。

## 本機測試

```bash
npm install
cp .env.example .env      # 填入 DISCORD_WEBHOOK_URL(本機測試用;.env 已 gitignore)
npm run probe             # 只抓資料 + 預覽,不送 Discord
npm run close             # 送一則收盤總結到 Discord
```

## GitHub 部署

1. repo `XRMaisa/tw-market-brief`(**public**)已建好並推送。
2. secret `DISCORD_WEBHOOK_URL` 已設(Settings → Secrets)。
3. 收盤排程(14:05)自動跑;也可在 Actions 頁面手動 `workflow_dispatch` 觸發。

> Webhook URL 是敏感資訊,只放在 secret / 本機 `.env`,絕不寫進會 commit 的程式碼。