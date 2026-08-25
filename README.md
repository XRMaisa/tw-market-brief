# tw-market-brief

每個交易日盤中每 40 分鐘自動抓台股大盤 + 8 檔個股/ETF + 黃金 + 匯率,整理後推到 Discord;收盤後再一則收盤總結。跑在 GitHub Actions。

## 排程

| Workflow | cron(UTC) | 台灣時間 | 內容 |
|---|---|---|---|
| `intraday.yml` | `0 1 * * 1-5` | 09:00 | 觸發**單一長任務**,內部迴圈 09:05→13:05 每 40 分鐘推一次(7 則) |
| `close.yml` | `5 6 * * 1-5` | 14:05 | 一則**收盤總結** |

GitHub Actions runner 設 `TZ=Asia/Taipei`,腳本以本地時間(台灣,UTC+8,無夏令)計算時段。週末不觸發(cron `1-5`);國定假日以 ^TWII 最新成交日偵測,確認休市則跳過。

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
npm run once              # 送一則盤中快報到 Discord
npm run close             # 送一則收盤總結到 Discord
npm run loop              # 本機模擬盤中迴圈(09:05–13:05 每 40 分)
```

## GitHub 部署

1. 把 repo 推上 GitHub。
2. 在 repo Settings → Secrets and variables → Actions 新增 secret `DISCORD_WEBHOOK_URL`(值 = Discord webhook URL)。
3. 兩個 workflow 會依排程自動跑(也可在 Actions 頁面手動 `workflow_dispatch` 觸發測試)。

> Webhook URL 是敏感資訊,只放在 secret / 本機 `.env`,絕不寫進會 commit 的程式碼。