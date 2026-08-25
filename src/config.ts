// Fixed watchlist (order matters — reports keep this order, no sorting).
export type Kind = 'stock' | 'etf';
export interface WatchItem {
  code: string;      // TWSE code, e.g. 2330 / 00981A
  name: string;      // display name
  kind: Kind;
  yahoo: string;     // Yahoo Finance symbol, e.g. 2330.TW / 00981A.TW
}

export const WATCHLIST: WatchItem[] = [
  { code: '2330',   name: '台積電',           kind: 'stock', yahoo: '2330.TW' },
  { code: '2308',   name: '台達電',           kind: 'stock', yahoo: '2308.TW' },
  { code: '2454',   name: '聯發科',           kind: 'stock', yahoo: '2454.TW' },
  { code: '0050',   name: '元大台灣50',       kind: 'etf',   yahoo: '0050.TW' },
  { code: '00981A', name: '主動統一台股增長', kind: 'etf',   yahoo: '00981A.TW' },
  { code: '2646',   name: '星宇航空',         kind: 'stock', yahoo: '2646.TW' },
  { code: '00403A', name: '主動統一升級50',   kind: 'etf',   yahoo: '00403A.TW' },
  { code: '2317',   name: '鴻海',             kind: 'stock', yahoo: '2317.TW' },
];

// Taiwan weighted index on Yahoo.
export const TAIEX_YAHOO = '^TWII';

// Discord embed colors (Asian convention: red = up, green = down).
export const COLOR_UP = 0xF44336;   // red
export const COLOR_DOWN = 0x4CAF50; // green
export const COLOR_FLAT = 0x9E9E9E; // grey

// Intraday loop window (Taiwan time, UTC+8).
export const FIRST_PUSH = { h: 9, m: 5 };   // 09:05
export const LAST_PUSH = { h: 13, m: 5 };    // 13:05
export const PUSH_EVERY_MS = 40 * 60 * 1000; // 40 minutes

// Retry per fetch.
export const FETCH_RETRIES = 1;