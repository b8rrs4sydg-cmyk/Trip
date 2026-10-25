# 家人旅行規劃

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/b8rrs4sydg-cmyk/Trip)

給家中長輩用的簡單旅遊規劃網頁:把 Google 地圖的分享連結貼進來,AI 幫忙分天排順序,家人(約 5 人)可同時編輯。

跑在 Cloudflare 上:Workers(API 與網頁)、D1(資料庫)、Workers AI(排行程)。不需要 Google API,也不需要自己申請任何金鑰。

## 一鍵部署

1. 按上面的 **Deploy to Cloudflare** 按鈕,登入 Cloudflare 帳號並授權 GitHub。
2. 設定頁面直接按「Create and deploy」。資料庫(D1)和 AI 會自動建立並綁定,資料表第一次使用時自動建立。
3. 部署完會得到網址 `https://family-trip.<你的帳號>.workers.dev`,打開就能用。

> 按鈕需要這個 GitHub 儲存庫是**公開**的。程式裡沒有任何金鑰或個人資料,可以放心公開。

## 怎麼用

1. 首頁輸入旅行名稱和天數,按「開始規劃」。
2. 在 Google 地圖按「分享」複製連結,貼到「加入地點」(也可以直接打地點名稱)。
3. 按「AI 幫我排行程」,AI 會依距離分天排序;之後可用 ↑ ↓ 與「移到第幾天」手動調整。
4. 按「分享給家人」,把網址傳到 LINE。**知道網址的人都能編輯**,網址本身就是通行證(12 碼隨機字元),請不要公開張貼。

## 手動部署(不用按鈕)

需要 Node 20 以上與 Cloudflare 帳號:

```sh
npm install
npx wrangler login
npm run deploy      # 第一次會自動建立 D1 資料庫
```

## 本機開發

```sh
npm install
npm run dev         # 本機自動建立測試資料庫;Workers AI 走遠端,需要 npx wrangler login
npm test
```

沒登入時 `wrangler dev` 無法啟動 AI 綁定;只想測 API 的話,可暫時從 `wrangler.jsonc` 拿掉 `ai` 區塊,「AI 幫我排行程」會自動改用依距離排序的保底方案。

## 模型與費用

預設模型在 `wrangler.jsonc` 的 `AI_MODEL`(目前是 `@cf/google/gemma-4-26b-a4b-it`)。Workers AI 每天有 10,000 neurons 免費額度,一次排程約幾十 neurons,五個人用不完;Workers 與 D1 在免費額度內也是 $0。模型清單和價格以 [Cloudflare 官方文件](https://developers.cloudflare.com/workers-ai/platform/pricing/)為準,若模型下架,改這個變數即可。

AI 輸出一律驗證:未知或重複的地點會被丟掉、漏掉的會補回;AI 失敗或逾時則改用依距離排序。

## 已知限制

- 沒有帳號系統;連結外流就等於開放編輯。需要更嚴格可再加 Cloudflare Access。
- Google 短網址若被導向同意頁或需登入的頁面,會讀不到名稱,畫面會請使用者改打地點名稱。
- 同時編輯採「最後寫入為準」,每 4 秒同步一次。
- 尚未實作:翻譯、機票與飯店卡片。
