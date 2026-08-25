# 團隊招募｜一起做一個真的會走進教室的專案

> 專案名稱：Cairn Lab／教學 Panel
>
> 本文件為招募文案草稿；招募前請補上預計時程、每週投入時間、溝通平台、例會安排與報名方式。

## 這個專案在做什麼？

我們正在開發一套給實作課程使用的即時進度工具——「教學 Panel」。

在程式設計、AI 工具、Git 或其他實作課程中，講師經常會遇到一個問題：台上繼續往下教，但不知道台下有多少人已經完成、多少人還卡在前一個步驟。TA 也可能不知道哪些問題還沒有人處理，或兩個人同時跑去協助同一位學員。

教學 Panel 希望讓：

- 學員可以回報每個關卡「完成」或「卡住」。
- TA 可以認領問題、標記處理中、求救或解決。
- 講師可以掌握全班進度，依現場狀況調整課堂節奏。
- 教室投影只顯示匿名的整體進度，不讓學員感受到排名壓力。
- 講師可以事前設計關卡，並在課堂中安全地修改與發布。

這不是只為了練習而想像出來的 side project。它來自真實的課堂需求，完成後預計會實際帶進課程裡使用。你做的按鈕、流程或資料設計，都可能直接影響學員求助與 TA 協作的方式。

## 為什麼值得一起做？

很多大學生已經寫過作業或自己的小專案，卻很少有機會參與一個由多人共同維護、而且真的有使用者的產品。

在這個專案裡，你會有機會經歷：

- 從產品規格理解一個功能為什麼需要存在。
- 讓自己的前端、API 或資料設計與其他人的工作接在一起。
- 使用 Git branch、Pull Request 和 code review 與團隊協作。
- 處理 loading、錯誤、權限、離線和多人同時操作等真實情境。
- 讓自己的修改出現在可互動的頁面或可自動驗證的流程中。
- 看到功能在實際課堂中被使用，並根據現場回饋繼續改善。

我們會把 Ver1 的工作拆成約半天到一天半、可以單獨認領的 task。許多前端功能可以先使用 mock data，不必等待後端完成，就能在瀏覽器中看到自己的改動。

## 我們預計怎麼合作？

- 先完成已經定義清楚的 Ver1，不在開發中無限擴張功能。
- Task 會標示新手、中階或進階難度，並說明可以如何驗證。
- 每個人一次認領一個 task，完成 Pull Request 後再領下一個。
- 新手 task 會由較有經驗的成員 review。
- 所有重要修改都透過 Pull Request 討論，不要求一個人自己解決所有問題。
- 角色代表主要技術方向；完成一個 task 後，也可以跨方向認領其他工作。

## 預計招募角色

| 角色 | 建議人數 | 經驗分佈 |
|---|---:|---|
| Frontend Product Contributor | 7～8 | 新手、中階都可以參與 |
| Backend Workflow Contributor | 2～3 | 具基本 TypeScript／API 經驗，含至少一位較資深成員 |
| Database & Reliability Contributor | 1～2 | 建議具 SQL 或資料庫基礎 |
| Quality & Classroom Simulation Contributor | 1～2 | 新手可從人工驗收與測試案例開始 |
| Developer Experience & Documentation Contributor | 1 | 新手、中階都可以參與 |

以 15 人為例，可以是 8 位 Frontend、3 位 Backend、2 位 Database & Reliability、1 位 Quality，以及 1 位 Developer Experience & Documentation。實際人數較少時，不需要重新切分專案；每位成員只要依序認領更多 task 即可。

---

# 角色一：Frontend Product Contributor

## 白話說，這個角色在做什麼？

你會把產品規格和設計稿，做成學員、TA 與講師真的可以操作的網頁。

這不只是調整顏色或排版。你也會處理按鈕按下後畫面怎麼變化、等待資料時顯示什麼、API 失敗時如何提醒，以及使用者能不能清楚理解目前狀態。

## 你會創造什麼改變？

學員端是學員整堂課最常看的畫面；TA 與講師則依賴你做出的工作台判斷誰需要協助。Public 畫面要讓教室後排也能一眼讀懂，課程編輯畫面則要讓講師敢在上課中途修改內容。

你的工作會直接影響：

- 學員能不能快速回報完成或卡住。
- TA 能不能找到還沒有人處理的問題。
- 講師能不能一眼掌握全班節奏。
- 課程內容能不能被安全地編輯與發布。

## 你可能認領的任務

你可以選擇其中一個功能方向，不需要一開始就掌握所有畫面：

- **Student Experience**：學員加入、進度條、關卡卡片、完成與卡住回報。
- **TA／Instructor Operations**：問題清單、篩選、認領操作與全班統計。
- **Public Display & Timer**：大螢幕進度、卡住人數與簡易倒數。
- **Course Authoring**：章節與關卡編輯、拖曳排序、軟刪除與發布狀態。
- **Admin**：課程列表、duplicate、刪除與匯出入口。
- **UI System & Accessibility**：共用元件、錯誤狀態、鍵盤操作與文字對比。

許多任務可以先接 mock data，所以不必等待後端完成，就能在瀏覽器裡看到自己的改動。

## 你會使用或學到

1. **TypeScript：會在程式執行前幫你找出一部分資料型別錯誤的 JavaScript。**
   - 定義課程、關卡、學員進度和卡住狀態的資料形狀。
   - 讓前端與 API 使用相同的資料契約。

2. **React：用可重複組合的 component 建立互動畫面。**
   - 建立關卡卡片、狀態標籤、進度條與對話視窗。
   - 處理按鈕、表單、loading、error 與 optimistic UI。

3. **Next.js：把 React 頁面、路由與 server API 放在同一個 Web 專案中。**
   - 為學員、TA、講師、Public 與 Admin 建立不同頁面。
   - 理解 client 與 server 的邊界，以及什麼資料不應該放在瀏覽器中。

4. **Tailwind CSS：使用小型 utility class 快速組合出一致的視覺與排版。**
   - 實作 Cockpit 風格、狀態色彩與桌機版排版。
   - 處理大螢幕投影、長關卡列表和各種錯誤狀態。

5. **GitHub 協作：讓多個人能夠使用 branch、Pull Request 和 code review 共同修改同一個專案。**
   - 從 issue 認領一個小任務，並透過 Pull Request 展示與說明自己的改動。
   - 練習回應 review、解決小型衝突，並將自己的功能與別人的 API 接在一起。

## 適合什麼樣的人？

只要你具備基本 HTML、CSS 或 JavaScript 經驗，願意閱讀規格、提問並根據 review 修改，就有適合的入門 task。

如果你想認領拖曳排序、複雜表單或 optimistic update，建議已寫過 React component，並理解基本 async／API 操作。React 經驗不是所有 Frontend task 的必要條件。

---

# 角色二：Backend Workflow Contributor

## 白話說，這個角色在做什麼？

你會負責畫面背後的操作邏輯：收到前端請求後，確認使用者是誰、他能不能做這件事、輸入是不是正確，再把操作交給資料層安全完成。

例如，學員只能更新自己的進度；TA 可以認領與解決問題，卻不能修改課程關卡；Public 畫面只能取得匿名統計。這些都是 Backend Workflow 需要守住的規則。

## 你會創造什麼改變？

你會把前端上看得見的按鈕，變成可以被信任的完整流程。

你的工作會讓：

- 學員只能讀寫自己的進度與卡住回報。
- TA、講師與 Public 只能進入自己有權限的流程。
- API 遇到錯誤、重複點擊或過期連結時，會回傳一致、可理解的結果。
- Frontend 可以依照明確的 API contract 開發，而不用猜測後端資料格式。

## 你可能認領的任務

- Student join API 與瀏覽器 session。
- 學員完成、取消完成與卡住回報。
- TA 問題池、篩選、認領、求救與解決 API。
- Instructor 全班進度與卡住統計 API。
- Public 專用的匿名 response。
- 課程編輯、發布、duplicate 與匯出的 use case。
- 共通 validation、錯誤格式、request ID 與 audit event。

## 你會使用或學到

1. **TypeScript：讓前端、API 與商業邏輯能夠共用可檢查的資料型別。**
   - 定義 request、response、角色、進度與求援狀態。
   - 將不同功能拆成清楚的 service 與 domain module。

2. **Next.js Route Handlers：Next.js 內建的 server API 入口。**
   - 接收 HTTP request，處理 cookie、權限與 response。
   - 讓前端頁面不直接讀寫資料庫。

3. **Zod：使用 schema 檢查外部輸入是否符合預期。**
   - 檢查表單、API request 與 JSON 匯入檔案。
   - 將「哪個欄位出錯」回傳給前端，而不只是回傳模糊的失敗訊息。

4. **HTTP API 設計：定義瀏覽器如何向 server 查詢與修改資料。**
   - 理解 `401`、`403`、`409` 與 `422` 等錯誤之間的差異。
   - 處理重複點擊、browser retry、polling 與狀態衝突。

5. **Vitest 與 API integration test：用自動化測試驗證權限和狀態流程。**
   - 測試學員不能修改其他人的進度。
   - 測試認領、求救、解決、發布和 duplicate 等完整流程。

## 適合什麼樣的人？

適合寫過基本 JavaScript／TypeScript，知道 HTTP request 與 JSON 是什麼，並對 API、權限或產品流程有興趣的人。

不需要一開始就會資料庫 transaction；但需要願意閱讀規格、考慮錯誤情境，並為關鍵流程補上測試。

---

# 角色三：Database & Reliability Contributor

## 白話說，這個角色在做什麼？

你會負責讓系統的資料「存得下來、不會亂掉，而且出問題時有辦法恢復」。

前端和 Backend Workflow 負責定義使用者要做什麼；你則負責設計資料如何被保存，以及在多個人同時操作時，資料庫如何決定唯一正確的結果。

## 你會創造什麼改變？

你會讓這套系統能夠在真實課堂裡被信任：

- 學員重新整理後，進度仍然存在。
- 兩位 TA 同時認領同一個問題時，只有一位會成功。
- 講師發布新關卡時，不會讓學員看到改到一半的內容。
- Duplicate 新課程時，不會把舊班級的學員資料一起複製。
- 團隊成員可以用可重複的 migration 和 seed 建立一致開發環境。

## 你可能認領的任務

- 建立 Supabase local 與 staging 環境。
- 設計 course、stage、participant、progress 與 help request 等資料表。
- 建立 migration、seed 與 reset 指令。
- 設計角色連結、student session 與 token hash 的儲存方式。
- 實作 TA atomic claim 與課程 publish transaction。
- 實作 duplicate、軟刪除與匯出所需的 query。
- 建立 index、concurrency test、load test 與 backup rehearsal。

## 你會使用或學到

1. **PostgreSQL：世界上最常被使用的開源關聯式資料庫之一。**
   - 使用 table、foreign key、unique constraint 與 index 表達資料關係。
   - 寫出課程統計、進度矩陣與問題池所需的 SQL query。

2. **Supabase Database：以 PostgreSQL 為核心的 managed database 平台。**
   - 建立 local、staging 與 production 環境。
   - 處理 connection、environment variables、secrets 和基本備份設定。

3. **Drizzle ORM 與 migration：用 TypeScript 定義 schema，並依序管理資料庫結構變更。**
   - 讓 schema 與 application type 保持對齊。
   - 練習只透過新 migration 往前升級，不直接改寫已經執行的歷史。

4. **Database transaction 與 concurrency control：讓多個同時操作仍然得到唯一且完整的結果。**
   - 保證兩位 TA 同時點擊時只有一人認領成功。
   - 確保 publish、duplicate 與軟刪除不會留下只完成一半的資料。

5. **Database reliability：透過 index、測試、備份與復原演練，讓資料不只是「應該安全」。**
   - 使用 integration test 與 concurrency test 驗證關鍵資料規則。
   - 檢查慢 query、connection 數量，並實際將備份還原到另一個環境。

## 適合什麼樣的人？

適合寫過基本 SQL、理解 table、foreign key 與 unique constraint，並對資料模型或系統可靠性有興趣的人。

不要求事先熟悉 Supabase 或 Drizzle；但 atomic claim、transaction 與備份復原等任務，建議由有後端或資料庫經驗的成員負責。

---

# 角色四：Quality & Classroom Simulation Contributor

## 白話說，這個角色在做什麼？

你會同時扮演學員、TA 和講師，想辦法在系統真的走進教室前，先找出會讓上課流程中斷的問題。

這不只是檢查按鈕會不會動，還包含同時開啟多個角色、刻意斷線、快速重複點擊，以及確認 Public 畫面沒有洩漏姓名。

## 你會創造什麼改變？

你會把「在開發者電腦上能跑」的功能，變成「敢在上課當天打開」的產品。

你會幫團隊發現：

- 多個角色串在一起後才出現的問題。
- 網路慢、API 失敗、沒有資料時的 UI 缺口。
- 雙重認領、發布半成品與資料洩漏等高風險問題。
- 鍵盤無法操作、對比不足或訊息不清楚的使用體驗。

## 你可能認領的任務

- 根據產品規格撰寫人工驗收清單。
- 自動化「學員完成／卡住→TA 認領→解決」的完整流程。
- 測試講師發布後，Student 與 Public 是否正確更新。
- 測試 Admin duplicate、軟刪除與 CSV 匯出。
- 檢查 Public API 是否包含學員姓名或原始問題。
- 檢查 loading、empty、error、offline 與過期資料狀態。
- 模擬 100 個 clients 定期 polling 與同時操作。
- 在實際課程前執行 smoke test 和課堂演練。

## 你會使用或學到

1. **Playwright：可以操作真實瀏覽器的 end-to-end 測試工具。**
   - 模擬學員、TA、講師與 Admin 在不同瀏覽器情境中操作。
   - 驗證從點擊按鈕到資料更新的完整流程。

2. **Vitest：適合 TypeScript 專案的快速單元與整合測試工具。**
   - 測試狀態轉換、計時器計算、JSON validation 與 CSV escaping。
   - 在還沒有打開瀏覽器前，快速找出已經壞掉的核心規則。

3. **k6：用 script 模擬多個使用者同時對系統發出請求的 load testing 工具。**
   - 模擬 50～100 個瀏覽器每幾秒取得最新資料。
   - 觀察 response time、error rate 與 database connection 是否超出預期。

4. **Accessibility testing：檢查鍵盤、文字對比與語意結構是否讓不同使用者都能操作。**
   - 使用鍵盤走完關鍵流程，並檢查 label、focus 與 status 訊息。
   - 檢查大螢幕投影與高密度工作台的可讀性。

5. **Staging 與 smoke test：在接近正式環境的地方，用一組快速檢查確認基本功能可用。**
   - 在 deployment 後驗證加入、進度、卡住、認領、Public 與 timer。
   - 建立課前檢查清單與系統故障時的備援流程。

## 適合什麼樣的人？

適合習慣從使用者角度找問題、願意把重現步驟寫清楚，並且不只測試正常情況的人。

不需要一開始就會 Playwright 或 k6；新手可以先從人工驗收、錯誤情境與 accessibility 檢查開始。

---

# 角色五：Developer Experience & Documentation Contributor

## 白話說，這個角色在做什麼？

你會負責讓一位新加入的協作者，不需要花好幾天猜測專案怎麼啟動、task 怎麼領、測試怎麼跑，以及 Pull Request 應該寫什麼。

這個角色處理的不是單一產品功能，而是整個團隊開發與加入專案的體驗。

## 你會創造什麼改變？

當團隊有 10～15 個人同時協作時，每個人少卡一小時，累積起來就是非常大的差異。

你會讓：

- 新成員可以快速啟動專案與完成第一個 PR。
- 每個 task 都有清楚的範圍、前置條件與驗收方式。
- 團隊不必一直重複解釋同樣的 setup 問題。
- CI 可以在合併前先找出 format、typecheck 與測試問題。
- 專案即使換了協作者，重要知識仍然會留下來。

## 你可能認領的任務

- 撰寫 local setup 與常見錯誤排除文件。
- 建立 Issue、Task 與 Pull Request template。
- 整理 task 難度、dependency、認領與 review 流程。
- 建立共用 demo data 與 component gallery。
- 將 format、lint、typecheck、test 與 build 整合到 CI。
- 整理 API route、資料型別與常用開發指令。
- 維護變更記錄、決策記錄與新成員 onboarding checklist。

## 你會使用或學到

1. **Git 與 GitHub：多人協作開發最常見的版本控制與專案協作工具。**
   - 設計 branch、Issue、Pull Request、label 和 reviewer 流程。
   - 讓 task 的狀態、dependency 與討論可以被追蹤。

2. **Markdown：使用簡單文字語法撰寫能夠跟著 repository 一起版本控制的文件。**
   - 撰寫 README、setup guide、troubleshooting 與架構說明。
   - 用範例、檢查清單和圖表降低理解門檻。

3. **GitHub Actions：GitHub 提供的自動化 CI 工具。**
   - 在 Pull Request 中自動執行 format、lint、typecheck、test 與 build。
   - 將失敗訊息整理成協作者能夠自己處理的提示。

4. **Node.js 與 package scripts：讓常用開發操作可以用一致指令執行的 JavaScript runtime 與專案工具。**
   - 整理 dev、test、seed、reset 與 build 指令。
   - 減少「只有某位開發者的電腦可以跑」的環境差異。

5. **Developer onboarding：把口頭經驗整理成可重複的加入流程。**
   - 設計從 clone repository、啟動環境到完成第一個 PR 的 checklist。
   - 透過 demo data、component gallery 和小型 starter task 讓新成員快速建立信心。

## 適合什麼樣的人？

適合喜歡整理資訊、改善流程，並能夠從「新加入的人會在哪裡卡住」出發思考的人。

不需要是最資深的程式開發者；只要願意親自走過 setup 與 task 流程，並把模糊的說明改寫成其他人跟著就能完成的文件，就很適合這個角色。

---

## 招募資訊

> 請在發布前補上以下內容。

- **預計開發期間：** [待補]
- **建議每週投入：** [待補]
- **固定會議／同步方式：** [待補]
- **主要溝通平台：** [待補]
- **Repository 與開發文件：** [待補]
- **貢獻者署名方式：** [待補]
- **報名方式：** [待補]
- **聯絡人：** [待補]

