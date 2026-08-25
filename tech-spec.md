# 教學 Panel — Technical Specification v1

> 本文件是 [`spec-v1.md`](./spec-v1.md) 的技術實作方案。產品規格回答「要做什麼」，本文件回答「打算怎麼做，以及為什麼這樣做」。

| 項目 | 內容 |
|---|---|
| 文件狀態 | Draft，供開發前討論 |
| 對應產品規格 | `spec-v1.md` |
| 目標規模 | 單堂課 10～50 位學員，另有講師、TA 與一個 Public 投影畫面 |
| 主要使用情境 | 2～3 小時的現場實作課程 |
| 技術方向 | TypeScript 單體 Web App＋PostgreSQL |

---

## 1. 技術目標

這個系統會在真實課堂中使用，因此技術設計的優先順序是：

1. **上課時穩定**：不能因為某個 TA 同時按按鈕、Wi-Fi 短暫不穩或服務剛喚醒，就讓進度資料錯亂。
2. **資料正確**：TA 認領、課程發布、duplicate 與匯出必須產生一致的結果。
3. **容易維護**：初期不拆微服務，前後端使用同一種語言，降低一人或小團隊維護的負擔。
4. **保留成長空間**：Phase 1 使用輪詢，但資料與 API 設計不能阻礙未來改成即時推播、加入截圖或進度分析。
5. **保護學員資料**：Public 不得取得姓名；學員只能操作自己的資料；管理角色必須正式登入。

### 白話說明

這個產品的規模不大，但「同一時間很多人一起用」是它的特色。技術上不需要很複雜的分散式系統，真正需要注意的是：不要丟資料、不要讓兩位 TA 同時認領成功、不要讓尚未發布的題目被學員看到，以及出問題時要能快速知道發生了什麼。

---

## 2. 架構總覽

採用 **modular monolith（模組化單體）**：前端頁面、API、權限判斷與主要商業邏輯放在同一個 Next.js 專案中；資料集中在 PostgreSQL。

```text
學員 / TA / 講師 / Admin / Public 瀏覽器
                    │
                    │ HTTPS
                    ▼
          Next.js Web App（Vercel）
          ├─ 頁面與 UI
          ├─ Route Handlers / API
          ├─ 權限與輸入驗證
          └─ 課程、進度、認領等商業邏輯
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
 PostgreSQL（Supabase）  Supabase Auth
 課程與進度資料          員工登入
```

瀏覽器**不直接讀寫資料庫**。所有業務操作都要通過 Next.js API，讓權限、狀態轉換、輸入驗證與 audit log 集中在同一層處理。

### Phase 1 刻意不加入的元件

- 不拆獨立 frontend API 與 backend API。
- 不使用 microservices。
- 不使用 Kubernetes。
- 不先加入 Redis、message queue 或 background worker。
- 不先使用 WebSocket；依產品規格採 2～5 秒輪詢。
- 不把 Supabase Data API 直接開放給瀏覽器操作業務資料。

這些技術不是不好，而是目前沒有解決到必要問題，卻會增加部署、除錯與權限管理的成本。未來有明確需求時再加入。

---

## 3. 技術選型

| 層次 | 選擇 | 用途與理由 |
|---|---|---|
| 語言 | TypeScript | 前後端共用型別與驗證規則，減少切換語言的維護成本 |
| Web framework | Next.js App Router | 同一專案提供 React 頁面與 server API，適合此規模的單體系統 |
| UI | React | 學員卡片、進度矩陣、對話與計時器都有較多互動狀態 |
| CSS | Tailwind CSS | 快速建立一致的 spacing、色彩與 responsive layout |
| UI primitives | Radix UI／shadcn/ui | 提供 dialog、dropdown、tabs 等具基本 accessibility 的元件；實際視覺仍依專案設計調整 |
| Client data | TanStack Query | 管理輪詢、cache、重新整理、失敗重試與 loading 狀態 |
| 表單／輸入驗證 | Zod | 同一份 schema 可用於 API、表單與 JSON 匯入驗證 |
| 拖曳排序 | dnd-kit | 講師設計頁的關卡與分區排序 |
| Database | PostgreSQL（Supabase managed） | 關聯、統計、矩陣、transaction、匯出與併發控制都適合關聯式資料庫 |
| ORM／query builder | Drizzle ORM | 保留 TypeScript 型別，同時能清楚控制 SQL、aggregate query 與 transaction |
| 員工 Auth | Supabase Auth | 處理 Google OAuth 或 Magic Link，不自行保存密碼 |
| Web hosting | Vercel | 與 Next.js 整合完整，降低初期維運成本 |
| Error monitoring | Sentry | 收集前後端例外、request trace 與 release 資訊 |
| CI | GitHub Actions | 自動執行 lint、typecheck、測試與 build |
| 單元／整合測試 | Vitest | 測試狀態機、計時器、權限與資料操作 |
| 瀏覽器 E2E | Playwright | 模擬學員、TA、講師與 Public 的完整操作 |
| Load test | k6 | 模擬上課時大量瀏覽器固定輪詢與同時寫入 |

### 版本政策

- 開始實作時選擇各工具的**正式穩定版本**，不使用 canary、beta 或 release candidate。
- Node.js 使用當時仍受支援的 LTS 版本。
- 在 `package.json`、lockfile 與版本管理檔中固定版本；production 不使用浮動的 `latest` tag。
- major version 升級要在 staging 驗證，不在上課前臨時升級。

---

## 4. 執行環境與區域

Production 預計使用：

- **Web**：Vercel paid production plan
- **Database / Auth**：Supabase paid production plan
- **Region**：Tokyo 或 Singapore，Web function 與 database 必須放在相同或相近區域
- **Domain**：自有網域並強制 HTTPS

正式選區域前，應從台灣實測 Tokyo 與 Singapore 的延遲，再固定 production region。不要沿用平台預設的美國區域，否則每次 API 存取資料庫都會繞遠路。

至少建立三套環境：

| 環境 | 用途 | 資料原則 |
|---|---|---|
| Local | 開發者本機 | 假資料 |
| Staging | 測試、展示、load test、migration rehearsal | 不使用 production 個資 |
| Production | 真實課程 | 僅正式 deployment 可存取 |

Preview deployment 不得連到 production database。

---

## 5. 使用者身分與權限

系統中有兩種不同的身分模型：**需要正式登入的工作人員**，以及**只在單堂課有效的學員身分**。

### 5.1 Admin／Instructor／TA

- 使用 Supabase Auth 登入。
- 第一階段建議先選 Google OAuth 或 Email Magic Link，不自行實作帳號密碼。
- `profiles` 保存系統需要的顯示名稱與 global role；不複製或保存 OAuth 密碼。
- `course_staff` 決定某位 Instructor／TA 可以進入哪些課。
- Admin 可以存取所有未刪除課程。
- Instructor 可以設計與控制自己有權限的課程。
- TA 可以查看進度、認領與回覆，但不能修改課程設計。
- 每一個 API 都在 server 端重新檢查權限，不能只靠「前端沒顯示按鈕」。

### 5.2 Student

Phase 1 不要求學員註冊長期帳號：

1. 學員透過課程連結或課程代碼進入。
2. 輸入暱稱。
3. Server 建立 `participant` 與高強度隨機 session token。
4. 瀏覽器以 `HttpOnly + Secure + SameSite` cookie 保存 token。
5. Database 只保存 token hash，不保存可直接使用的原始 token。

同一堂課的暱稱預設不允許重複，避免 TA 無法分辨兩個相同名字。若撞名，UI 提示加上容易辨認的後綴。

學員 session 只能：

- 讀取該堂課已發布的內容。
- 讀寫自己的進度與 help request。
- 讀寫自己 help request 下的訊息。
- 看自己的處理狀態。

### 5.3 Public

- 使用獨立、可撤銷的 read-only public token。
- API 只回傳課程標題、總人數、計時器與聚合後的關卡人數。
- Public response 不得包含 participant ID、暱稱、卡住原因或訊息。

### 5.4 待確認的登入細節

- Staff 採 Google OAuth、Magic Link，或兩者並存。
- 是否限制特定 Google Workspace domain／email allowlist。
- 學員更換裝置或清除 cookie 後的「重新加入」流程。
- 課程代碼的長度、有效時間與是否由講師手動重設。

---

## 6. 核心資料模型

以下是概念模型；實際欄位名稱以 migration 為準。主鍵建議使用 UUID，所有時間存為 UTC `timestamptz`，UI 再依使用者時區顯示。

### 6.1 人員與權限

#### `profiles`

- `id`：對應 Supabase Auth user ID
- `display_name`
- `global_role`：`admin | instructor | ta`，表示這個帳號在平台上的最高權限層級
- `created_at`、`updated_at`

#### `course_staff`

- `course_id`
- `profile_id`
- `role`：`instructor | ta`
- Unique：`(course_id, profile_id)`

> 白話說明：`profiles` 表示「這個人在整個平台是誰、最高可以做什麼」，`course_staff` 表示「他在這一堂課實際負責什麼」。兩者分開後，一位 Instructor 可以在 A 課當講師、在 B 課只當 TA；但 TA 帳號不能自行把自己提升為 Instructor。

### 6.2 課程與發布版本

#### `courses`

- `id`
- `status`：`draft | active | ended`
- `published_revision_id`，可為 null
- `draft_revision_id`
- `created_by`
- `class_date`，可為 null
- `created_at`、`updated_at`
- `deleted_at`：課程軟刪除

#### `course_revisions`

- `id`
- `course_id`
- `revision_number`
- `state`：`draft | published | archived`
- `title`
- `description`
- `created_by`
- `created_at`、`published_at`
- Unique：`(course_id, revision_number)`
- Partial unique：同一 course 同時間只能有一份 draft

#### `course_access_tokens`

- `id`
- `course_id`
- `kind`：`join | public`
- `token_hash`
- `created_at`、`expires_at`，`expires_at` 可為 null
- `revoked_at`，可為 null

Join code／link 與 Public link 使用不同 token，任何一方外洩時都能單獨撤銷與重發。Database 不保存可直接使用的明文 token。

#### `stage_definitions`

- `id`
- `course_id`
- `created_at`
- `archived_at`，可為 null

#### `revision_sections`

- `id`
- `revision_id`
- `section_key`：同一課程內穩定識別用
- `title`
- `position`

#### `revision_stages`

- `id`
- `revision_id`
- `stage_id`：指向穩定的 `stage_definitions.id`
- `section_key`，可為 null
- `title`
- `criteria`
- `position`
- `is_visible`
- Unique：`(revision_id, stage_id)`

> 白話說明：講師編輯的是 draft 版本，學員只看 published 版本。發布不是逐欄修改學員正在看的資料，而是一次切換整份版本，所以不會出現「標題已改、關卡還沒改完」的半成品。

`stage_definitions` 提供不隨版本改變的 stage ID。即使關卡改文字或在新版中被隱藏，既有進度仍然能指向同一個關卡，不會因發布而消失。

### 6.3 學員與關卡進度

#### `participants`

- `id`
- `course_id`
- `display_name`
- `normalized_name`
- `joined_at`
- `last_seen_at`
- Unique：`(course_id, normalized_name)`

#### `participant_sessions`

- `id`
- `participant_id`
- `session_token_hash`
- `created_at`、`expires_at`
- `last_seen_at`
- `revoked_at`，可為 null

> 白話說明：學員本人與瀏覽器登入狀態分成兩張表。如此一來，未來要讓學員換裝置、撤銷遺失裝置或重新加入，不必刪掉他的進度。

#### `stage_progress`

- `id`
- `participant_id`
- `stage_id`
- `status`：`not_started | completed | stuck`
- `version`：optimistic concurrency 用
- `created_at`、`updated_at`
- Unique：`(participant_id, stage_id)`

`stage_progress.status` 只表示學員的關卡狀態。TA 按「已解決」不會擅自替學員標成完成；學員仍可自行決定改成未開始或已完成。

每位 participant 對當時 published stages 都建立明確的 progress row：加入課程時建立現有關卡的 `not_started`，發布新關卡時替既有 participants 補上 `not_started`。這讓矩陣與匯出不需要猜測「沒有資料」究竟代表未開始還是系統漏寫。

### 6.4 卡住、認領與訊息

#### `help_requests`

- `id`
- `course_id`
- `participant_id`
- `stage_id`
- `occurrence_number`
- `reason`
- `claim_status`：`unclaimed | claimed | escalated | resolved`
- `claimed_by`，可為 null
- `escalated_by`，可為 null
- `resolution_code`，可為 null，例如 `solved_by_staff | withdrawn_by_student | student_changed_status | closed_by_instructor`
- `created_at`
- `claimed_at`、`escalated_at`、`resolved_at`，可為 null
- `updated_at`
- Partial unique：同一 `(participant_id, stage_id)` 同時間最多只有一筆尚未 resolved 的 help request

#### `help_messages`

- `id`
- `help_request_id`
- `sender_participant_id`，可為 null
- `sender_profile_id`，可為 null
- `body`
- `client_mutation_id`：避免網路重試時送出重複訊息
- `created_at`
- Check constraint：participant sender 與 profile sender 必須剛好只有一個
- Unique：`client_mutation_id`

同一位學員在同一關可能「第一次卡住 → 解決 → 後來又卡住」。因此 help request 是可重複發生的事件，不直接塞進 `stage_progress`。舊問題與對話會保留，新的卡住產生新的一筆 help request。

### 6.5 計時器

#### `course_timers`

- `course_id`，Primary Key
- `mode`：`countdown | countup`
- `status`：`idle | running | paused | finished`
- `duration_ms`，倒數時計時使用
- `started_at`，可為 null
- `paused_at`，可為 null
- `paused_elapsed_ms`
- `version`
- `updated_by`
- `updated_at`

Server 不會每秒更新 database。它只記錄開始時間與狀態，各瀏覽器自行計算目前顯示值，輪詢時再校正。這樣 50 個畫面一起倒數也不會造成每秒大量寫入。

### 6.6 Audit log

#### `audit_events`

至少記錄以下重要操作：

- 課程建立、duplicate、軟刪除與恢復
- 課程發布
- Staff 權限異動
- TA 認領、求救與解決
- 計時器開始、暫停與重設
- 匯出執行者與時間

Audit log 主要用來釐清「誰在什麼時候做了什麼」，不保存 session token 或其他 secret。

---

## 7. 關鍵流程與一致性

### 7.1 更新學員進度

- 使用 `(participant_id, stage_id)` unique constraint。
- API 以 upsert 更新狀態。
- Server 確認 stage 屬於該 course，且 participant 只能更新自己。
- 從 `stuck` 改成其他狀態時，不刪除舊 help request。
- 從 `stuck` 改成 `not_started` 或 `completed` 時，如仍有 active help request，於同一 transaction 將它標記為 resolved，並記錄 `student_changed_status`；它不再留在 TA 待處理池，但歷史對話仍保留。
- 再次按「卡住」時，如沒有 active help request 才新增一筆，避免連點產生多筆問題。

### 7.2 TA 認領

認領必須是單一 atomic database operation，概念如下：

```sql
UPDATE help_requests
SET claim_status = 'claimed', claimed_by = :ta_id, claimed_at = now()
WHERE id = :id
  AND claim_status IN ('unclaimed', 'escalated')
RETURNING *;
```

- 回傳一列：認領成功。
- 回傳零列：已被別人搶先認領，API 回 `409 Conflict`，UI 重新整理並顯示目前處理人。

> 白話說明：兩位 TA 同時按「我來處理」時，不是由兩台瀏覽器自行猜誰先，而是由 database 在同一瞬間決定唯一成功者。

### 7.3 求救

- 只有目前認領者或 Instructor 可以操作。
- `claim_status` 改為 `escalated`。
- 保留 `escalated_by`，清除 `claimed_by`。
- 其他 TA 可以重新認領。
- 原有訊息繼續保留在同一筆 help request。

### 7.4 已解決

- 目前認領者、Instructor 或 Admin 可以標記 resolved。
- 已解決不等於關卡完成，不自動修改 `stage_progress.status`。
- 如學員仍需要協助，可產生新的 help request。
- Resolved help request 保留為唯讀歷史；不在已結束的 thread 繼續加訊息。

### 7.5 課程發布

發布在同一個 database transaction 中完成：

1. 驗證 draft title、sections、stages 與排序。
2. 將目前 published revision 改為 archived。
3. 將 draft revision 改為 published。
4. 更新 `courses.published_revision_id`。
5. 為所有既有 participants 補上新關卡的 `not_started` progress。
6. 從剛發布的內容建立下一份可編輯 draft copy。
7. 寫入 audit event。

任何一步失敗，整次發布回滾，學員繼續看到上一個完整版本。

### 7.6 軟刪除關卡

講師在 draft 中刪除關卡時，實際上是讓它不出現在下一個 revision。發布後：

- 學員、Public 與一般進度畫面不再顯示該關。
- `stage_definitions`、既有 `stage_progress` 與 help requests 保留。
- 匯出時預設可選擇是否包含已隱藏關卡；Phase 1 預設包含並標示為 archived，避免歷史資料憑空消失。

### 7.7 Duplicate 課程

- 有 published revision 時，複製目前 published 設計；只有 draft 時，複製 draft。
- 建立全新的 course、revision、section 與 stage IDs。
- 不複製 participants、progress、help requests、messages、timer 與 audit history。
- 新課程狀態為 `draft`。

### 7.8 匯出

- 由 server 產生 UTF-8 CSV；若要給 Excel 使用，需驗證中文與 BOM 相容性。
- 列為學員、欄為關卡、格子為最終關卡狀態。
- 附上 course ID、course title、匯出時間與關卡是否已隱藏。
- 對以 `=`, `+`, `-`, `@` 開頭的使用者文字做 CSV formula injection 防護。
- Phase 1 資料量小，可同步產生；超過合理時間後再改 background job。

---

## 8. API 與 Server 邊界

實際 URL 可在開發時微調，以下定義責任邊界。

### Student API

- 加入課程／恢復 session
- 取得已發布課程與自己的完整狀態
- 更新某關進度
- 建立 help request
- 取得 help request 與訊息
- 新增訊息

### TA／Instructor API

- 取得問題池，依狀態、認領人、關卡與時間篩選
- 未指定排序時依關卡排列，但 `escalated` 與 `unclaimed` 必須優先於一般處理中／已解決項目；API 另支援最新與最舊排序
- 認領、求救、解決
- 回覆訊息
- 取得全班聚合進度與矩陣
- Instructor 操作 timer

### Design API

- 讀寫 draft revision
- 關卡與分區新增、修改、複製、刪除、排序
- 匯入／匯出 JSON
- 驗證並發布 revision

### Admin API

- 課程列表
- 建立、duplicate、軟刪除、進入觀看
- 匯出最終狀態

### Public API

- 只回傳匿名聚合數據與 timer state
- 不共用 Instructor response，以避免某次欄位新增時意外洩漏姓名

### 通用 API 規則

- 所有輸入使用 Zod 驗證，server 不信任 browser 傳入的 course ID、role 或 sender ID。
- Mutation 接受 `clientMutationId`，可安全處理 browser retry 或重複點擊。
- 採一致錯誤格式：`code`、`message`、`requestId`；production 不回傳 stack trace。
- 權限不足回 `403`，未登入回 `401`，狀態衝突回 `409`，驗證失敗回 `422`。
- 即時狀態 API 使用 `Cache-Control: no-store`；可搭配 ETag／version，沒有變更時回 `304`。
- 所有 list endpoint 都要有明確排序；不能依賴 database 的自然順序。

---

## 9. 輪詢與前端同步

Phase 1 不使用即時推播，建議預設頻率：

| 畫面 | 前景輪詢 | 說明 |
|---|---:|---|
| Student | 3～5 秒 | 自己的進度、處理狀態與訊息 |
| TA 問題池 | 2～3 秒 | 優先看到未處理與求救 |
| Instructor | 3 秒 | 聚合進度、問題池與矩陣 |
| Public | 3～5 秒 | 匿名統計與 timer 校時 |
| Admin／Design | 不固定輪詢 | 依操作重新取得，避免編輯途中被覆蓋 |

同步行為：

- Browser tab 進入背景時降頻或暫停輪詢。
- 回到前景、重新連線或 focus 視窗時立即 refresh。
- 失敗時 exponential backoff，不要每秒持續轟炸 server。
- UI 顯示「最後同步時間」與明顯的離線／資料過期提示。
- Mutation 成功後先更新 local cache，再向 server revalidate。
- Phase 1 不做離線寫入佇列；離線時禁止送出新的進度或訊息，避免重連後產生難以理解的衝突。
- Timer 每秒更新的是 browser 畫面，不是每秒呼叫 API。
- Participant 的 `last_seen_at` 最多每 30～60 秒更新一次，不隨每次 2～5 秒輪詢都寫 database；Instructor 畫面的「在線」依最近活動時間推算，「已加入」則使用 participant 總數。

倒數到零時，各 client 立即顯示「時間到」。Server 在讀取 timer 時依 timestamp 計算 effective status，因此即使 database 中最後保存的是 `running`，超過結束時間後也會對外回傳 `finished`，不需要背景工作每秒改狀態。

若未來課程規模、訊息即時性或 polling 成本真的成為問題，再評估 Server-Sent Events、Supabase Realtime 或 WebSocket。API response 與資料模型不應依賴某一種傳輸方式。

---

## 10. JSON 匯入／匯出

必須相容產品規格中的 Phase 1 最小格式：

```json
{
  "courseTitle": "Git 入門實作",
  "stages": [
    {
      "id": "s1",
      "title": "安裝 Git",
      "criteria": "終端機執行 git --version 看到版本號"
    }
  ]
}
```

處理規則：

- JSON 上傳只修改 draft，不會自動發布。
- 整份檔案先通過 schema 驗證才寫入；不能匯入一半成功、一半失敗。
- 匯入使用 transaction。
- `id` 是匯入檔內的識別字，不直接當 database UUID。
- 限制檔案大小、關卡數量與文字長度，避免錯誤檔案耗盡資源。
- 錯誤訊息要指出第幾關、哪個欄位有問題。
- 未來新增 section、hint、link 時，格式加入 `schemaVersion`；仍需保留舊版 importer。

---

## 11. Security 與隱私

### 必做項目

- 所有流量使用 HTTPS。
- Cookie 使用 `HttpOnly`、`Secure`、適當的 `SameSite` 與有效期限。
- 所有 mutation 具 CSRF 防護。
- Join、登入、訊息與匯入 API 設 rate limit。
- 課程代碼、public token、participant token 不以明文存入 database。
- Supabase service key、database URL、OAuth secret 只能放 server environment variables，絕不能進 browser bundle 或 Git。
- 業務資料表放在不對 Data API 暴露的 schema；若受工具限制必須暴露，對 `anon`／`authenticated` 採 RLS default-deny。
- Backend 使用權限最小化的 database role。
- React 以純文字 render 學員輸入；不允許任意 HTML。
- 對暱稱、原因與訊息設定合理長度上限。
- Log 不記錄 session token、完整 cookie、OAuth token 或完整訊息內容。
- Public endpoint 要有獨立 response schema 與自動測試，防止姓名洩漏。

### 資料保留待確認

正式上線前必須決定：

- 課後進度與對話保留多久。
- 講師／Admin 是否能刪除或匿名化一堂課的學員資料。
- 匯出檔案是否暫存在 server；建議即時串流下載，不長期保存。
- 是否需要在加入頁顯示簡短隱私說明。

---

## 12. 效能與容量目標

### 預期負載

- 正常：50 位學員＋5 位 TA＋1 位 Instructor＋1 個 Public 畫面。
- 以 3 秒輪詢估算，約 20 requests/second，加上少量 mutation。
- 驗收測試至少模擬 100 個同時 client。

### 初期目標

- 一般狀態 API：p95 server response time 小於 500 ms。
- Mutation：p95 小於 800 ms。
- 持續承受 50 RPS，短暫 burst 100 RPS，不產生錯誤或 database connection exhaustion。
- 認領壓力測試中，同一 help request 永遠只能有一位成功認領者。
- 50×合理關卡數量的進度矩陣不做 N+1 query。

### Database index

至少依查詢模式建立：

- `participants(course_id, normalized_name)` unique
- `stage_progress(participant_id, stage_id)` unique
- `stage_progress(stage_id, status)`
- `help_requests(course_id, claim_status, created_at)`
- `help_requests(claimed_by, claim_status)`
- `help_messages(help_request_id, created_at)`
- `revision_stages(revision_id, position)`

上線前以 `EXPLAIN ANALYZE` 檢查問題池、Public 聚合與進度矩陣的主要 query。

---

## 13. 失敗處理與課堂韌性

現場 Wi-Fi 或雲端服務短暫異常是合理預期，UI 必須能誠實表達狀態：

- 輪詢失敗時保留上一份畫面，但標示「資料可能已過期」。
- 寫入失敗不能顯示成功；提供重試按鈕。
- 狀態衝突時取得 server 最新狀態，而不是無限重送。
- Server 產生 request ID，錯誤畫面可提供給維護者查 log。
- `/healthz` 檢查 app 是否存活；另設受保護的 readiness check 驗證 database。
- 上課開始前有一份 smoke test，至少驗證加入、進度、卡住、認領、訊息、Public 與 timer。
- 上課進行中設定 production deployment blackout，除非是明確核准的緊急修復。

建議另外準備非系統內的簡短備援流程，例如服務中斷時由學員在視訊／群組訊息回報，讓課程能繼續；這屬於營運 runbook，不需要做成另一套軟體。

---

## 14. Observability、備份與復原

### Monitoring

- Sentry 收集 frontend exception、server exception、release 與 transaction trace。
- Structured log 至少包含 timestamp、level、request ID、route、course ID、actor type、duration 與 result；不放敏感文字。
- 監控 5xx rate、p95 latency、database connection、慢 query 與 deployment 狀態。
- 建立外部 uptime check 定期存取 public health endpoint。
- 課程期間若錯誤率或 health check 異常，要有通知管道。

### Backup

- Production 使用含每日備份的付費 database plan。
- 另外定期產生 logical backup 並保存於不同 provider／儲存位置。
- 上線前至少做一次完整 restore rehearsal，確認備份「真的可以還原」。
- 之後每季演練，或每次重大 schema 變更後演練。
- 記錄 RPO／RTO；Phase 1 建議目標：最多遺失 24 小時資料、4 小時內恢復。若課堂資料不能接受 24 小時損失，再評估 PITR。

> 白話說明：有顯示「備份成功」不代表真的救得回來。只有把備份還原到另一個環境並驗證過，才算完成備份方案。

---

## 15. 測試策略

### Unit tests

- 關卡狀態轉換。
- Help request 狀態機與權限。
- Timer 的開始、暫停、重設、倒數歸零。
- JSON validation。
- CSV escaping 與 formula injection 防護。

### Database integration tests

- Course publish transaction。
- Duplicate 不帶入學員資料。
- 軟刪除保留歷史進度。
- 兩位以上 TA 同時認領只有一位成功。
- Participant、Staff、Admin 的資料隔離。
- 聚合數字與矩陣正確。

### Playwright E2E

至少覆蓋：

1. 學員加入並標記完成。
2. 學員卡住、TA 認領、雙方來回訊息、TA 解決。
3. TA 求救後另一位 TA 接手。
4. Instructor 修改 draft；發布前學員看不到，發布後看得到。
5. Public 不顯示任何姓名。
6. Timer 在 Instructor 與 Public 顯示一致。
7. Admin duplicate 與 CSV 匯出。

### Load test

- Staging 模擬 100 clients 以 2～5 秒輪詢。
- 混合進度更新、訊息與認領 mutation。
- 測試至少涵蓋一堂課的高峰，不只跑十幾秒。
- 驗證 response time、error rate、database connections 與唯一認領條件。

---

## 16. 開發流程與程式結構

建議以單一 repository／單一 Next.js app 開始，不建立 monorepo。

```text
app/                 Next.js routes、pages、layouts、Route Handlers
src/components/      共用 UI 元件
src/features/        student、help、dashboard、design、admin 等功能模組
src/domain/          狀態機與不依賴 framework 的商業規則
src/server/          auth、database、repositories、services、logging
db/schema/           Drizzle schema
db/migrations/       版本化 SQL migrations
tests/               integration 與 fixtures
e2e/                 Playwright tests
```

原則：

- Route Handler 負責 HTTP、auth、validation 與 response。
- Service 負責 use case 與 transaction。
- Repository／query module 負責 database query。
- Domain module 保存狀態轉換規則，避免散落在 React component。
- 不在 client component 中放 secret 或權限真相。

### Pull request 必過項目

- Format／lint
- TypeScript typecheck
- Unit tests
- Database integration tests
- Production build
- 關鍵 E2E smoke tests
- Migration review

Production schema migration 必須由受控的 deployment step 執行，不能由每個 app instance 啟動時自行同時執行。

---

## 17. 分階段實作建議

### Milestone 1：Foundation

- Next.js 專案、UI foundation、CI。
- Supabase local／staging／production。
- Drizzle schema 與 migration。
- Staff Auth、course role、participant session。
- Logging、Sentry、health check。

### Milestone 2：課堂核心流程

- 學員加入與進度。
- 卡住、訊息、TA 認領／求救／解決。
- Student、TA、Instructor 基本畫面。
- 輪詢與離線提示。

### Milestone 3：課程控制與管理

- Draft／publish revision。
- 關卡 CRUD、分區、拖曳排序。
- JSON import/export。
- Timer 與 Public。
- Admin duplicate、軟刪除、CSV 匯出。

### Milestone 4：Production hardening

- 完整 E2E、load test、安全檢查。
- Backup restore rehearsal。
- Staging classroom rehearsal。
- 課前 smoke test 與 incident runbook。

---

## 18. Phase 1 明確不做

- 學員長期帳號與跨課程歷史。
- 截圖上傳。
- WebSocket／Realtime push。
- 每五分鐘 snapshot 與分析報表。
- 自動卡關熱點提示。
- 原生手機 App。
- 多區域 active-active deployment。
- Background job infrastructure，除非匯出或其他操作實測已超過同步 request 能力。

---

## 19. 開發前仍需確認的產品決策

- [ ] 課程加入使用連結、短代碼，或兩者並存。
- [ ] Staff 登入採 Google OAuth、Magic Link，或兩者並存。
- [ ] Staff email 是否使用 allowlist／限定 domain。
- [ ] 學員遺失 session 後如何安全重新加入。
- [ ] 課程代碼與 Public token 的失效／重設方式。
- [ ] 課後 participant、messages 與 progress 的保存期限。
- [ ] 匯出是否預設包含已隱藏關卡。
- [ ] Production region 選 Tokyo 或 Singapore。
- [ ] Production 預算與是否啟用 PITR。
- [ ] 課程結束的定義，以及結束後學員是否仍能更新狀態。

---

## 20. 主要技術決策摘要

| 決策 | 結論 |
|---|---|
| 架構 | Modular monolith |
| 前後端 | Next.js＋TypeScript |
| Database | Managed PostgreSQL on Supabase |
| Database access | 只由 server API 存取；Drizzle ORM＋必要的 SQL |
| Staff Auth | Supabase Auth |
| Student Auth | 單堂課 participant session cookie |
| 即時更新 | Phase 1 使用 2～5 秒 polling |
| 認領一致性 | Database atomic conditional update |
| 課程編輯 | Revision-based draft／publish |
| Hosting | Vercel＋Supabase，同區域或相近區域 |
| Production | 使用付費 plan、monitoring、backup、restore rehearsal 與 load test |

---

## 21. 官方參考資料

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Vercel Function Regions](https://vercel.com/docs/functions/configuring-functions/region)
- [Supabase Auth Architecture](https://supabase.com/docs/guides/auth/architecture)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Database Connections and Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase Available Regions](https://supabase.com/docs/guides/platform/regions)
- [PostgreSQL Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
