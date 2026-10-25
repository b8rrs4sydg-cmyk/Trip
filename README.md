# 家人旅行規劃

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/b8rrs4sydg-cmyk/Trip)

給家中長輩用的簡單旅遊規劃網頁:把 Google 地圖的分享連結貼進來,AI 幫忙分天排順序,家人(約 5 人)可同時編輯。

跑在 Cloudflare 上:Workers(API 與網頁)、D1(資料庫)、Workers AI(排行程)。不需要 Google API,也不需要自己申請任何金鑰。

## 一鍵部署

1. 按上面的 **Deploy to Cloudflare** 按鈕,登入 Cloudflare 帳號並授權 GitHub。
2. 設定頁面直接按「Create and deploy」。資料庫(D1)和 AI 會自動建立並綁定,資料表第一次使用時自動建立。
3. 部署完會得到網址 `https://family-trip.<你的帳號>.workers.dev`,打開就能用。

> 按鈕需要這個 GitHub 儲存庫是**公開**的。程式裡沒有任何金鑰或個人資料,可以放心公開。

## 功能

- **地圖**:每天一種顏色的編號標記,同一天的地點用虛線連起來;可以只看某一天。點標記會彈出導航與「在行程中看」,清單上也有「地圖」按鈕。手機用下方的「行程 / 地圖」切換,電腦並排顯示。
- **一個輸入框,三種加入方式**:貼 Google 地圖連結、打地名、或直接用說的(見下)。只打地名的地點會自動在地圖上找位置。
- **用說的建立行程**:例如「第一天13:00從台灣飛往東京,第五天13:00從東京飛往台灣」,會自動在第 1 天和第 5 天建立對應的航班;也可以說「第二天晚上7點吃壽司」「最後一天中午退房」。連結前面可以加天數與時間,例如「第三天14:00 https://maps.app.goo.gl/…」。
- **AI 排行程**:依距離把還沒指定天數的地點分到每一天;你用說的指定好的行程(如航班)不會被移動,AI 會配合它們安排。
- **AI 推薦景點**:根據旅行名稱(寫上目的地更準)和已加的地點,推薦順路的景點與餐廳,按「加入」就進行程。
- **時間軸**:每個項目有時間、類型圖示、備註、花費;站與站之間顯示估算的移動時間與距離,並附「怎麼去」(開 Google 地圖大眾運輸路線)。
- **花費與日期**:每項可填花費,每天和全程自動加總;設定出發日期後,每天旁邊顯示日期與星期。
- **分享**:「分享給家人」傳連結;「複製行程文字」一鍵複製整份行程,貼到 LINE。
- **共同編輯**:約 5 人用同一個連結,每幾秒自動同步。

## 怎麼用

1. 首頁輸入旅行名稱(建議寫目的地)和天數,按「開始規劃」。
2. 用輸入框加入地點與行程;按「讓 AI 幫你排」分天。
3. 點「編輯」改時間、名稱、備註、花費、換天或刪除;也可用 ↑ ↓ 調整順序。
4. 右上「設定」可改名稱、天數、出發日期。
5. 按「分享給家人」,把網址傳到 LINE。**知道網址的人都能編輯**,網址本身就是通行證(12 碼隨機字元),請不要公開張貼。

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

## 地圖與定位用到的服務

- 地圖:[MapLibre GL JS](https://maplibre.org/)(BSD-3)搭配 [OpenFreeMap](https://openfreemap.org/) 圖磚,免費、免金鑰,資料 © OpenStreetMap 貢獻者。
- 地名轉座標:OpenStreetMap 的 [Nominatim](https://nominatim.org/release-docs/latest/api/Search/)。依其使用規範,伺服器每秒最多查一次、帶可辨識的 User-Agent,而且查到的座標存進資料庫,同一地點不會重查。供家人少量使用沒問題;若要大量使用,請改用自架服務並設定 `wrangler.jsonc` 的 `vars.GEOCODE_BASE`(相容 Nominatim 的 `/search`)。
- 瀏覽器會從 jsDelivr 載入 MapLibre(已加完整性雜湊),從 OpenFreeMap 載入圖磚。

## 已知限制

- 沒有帳號系統;連結外流就等於開放編輯。需要更嚴格可再加 Cloudflare Access。
- Google 短網址若被導向同意頁或需登入的頁面,會讀不到名稱,畫面會請使用者改打地點名稱。
- 同時編輯採「最後寫入為準」,每 4 秒同步一次。
- 用說的建立行程時,AI 解析失敗會改用規則解析,常見說法(第N天、幾點、飛往、入住)都能處理,但很口語的句子可能解析不完整,建立後請確認一下。
- 地名可能查到同名的別處(例如「中央車站」):在「編輯」改成更完整的名稱,或直接貼 Google 地圖連結。查不到位置的地點不會顯示在地圖上,但仍在清單裡。
- 移動時間是用直線距離估算的,不是即時路況或時刻表;要準確請點「怎麼去」看 Google 地圖。
- 沒有拖曳排序(長輩用 ↑ ↓ 比較不會誤觸)、沒有離線模式、沒有機票/飯店搜尋與訂位。
- 尚未實作:翻譯。
