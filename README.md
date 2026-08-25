# Cairn Lab — 教學 Panel

> 讓每個卡住的人，都能被看見。

Cairn Lab 是為 10～50 人的實作課程設計的即時進度與求援看板（Workshop Progress Board）。學員可以回報每個關卡的完成或卡住狀態；TA 能認領並處理問題；講師則能掌握全班節奏，適時調整教學內容。

## 目前狀態

專案目前在**產品規格與互動展示階段**，尚未開始正式 Web App 實作。

- [`spec-v1.md`](./spec-v1.md) 定義 v1 的產品需求與六個主要畫面
- [`design/v120/`](./design/v120/) 提供視覺、樣式與排版參考
- [`showcase/`](./showcase/) 是依照設計方向整理過的可操作展示頁
- [`tech-spec.md`](./tech-spec.md) 是正式產品的技術架構草案，仍待開發前確認

`design/` 內的檔案不是直接給觀眾瀏覽的最終內容；showcase 會重新整理資訊與操作流程，只保留適合對外說明的部分。

## Design Showcase

Showcase 使用精簡的 Vite＋React＋TypeScript 製作，所有資料都只存在瀏覽器記憶體中，不會連接 API 或寫入資料庫。

目前可操作：

| 畫面 | 狀態 | 可以體驗的內容 |
|---|---|---|
| Intro | 可瀏覽 | 專案簡介、課堂即時訊號與六個頁面的關係圖 |
| Student 學員端 | 可操作 | 切換學員、完成關卡、回報或解除卡住 |
| Course Design 講師設計頁 | 可操作 | 編輯、新增、複製、排序、刪除、還原與發布關卡 |
| Public 投影畫面 | 可瀏覽 | 匿名顯示全班完成進度、卡住人數與倒數 |
| TA 救援頁 | 規劃中 | 認領、求救與解決學員問題 |
| Instructor 講師控制台 | 規劃中 | 掌握全班進度、求援與課堂倒數 |
| Admin 課程管理頁 | 規劃中 | 建立、複製、匯出與軟刪除課程 |

Student、Course Design 與 Public 共用同一份 mock state。Course Design 的變更必須按下「發布」，才會同步到 Student 與 Public，藉此模擬正式產品的 draft／published 流程。

### 在本機開啟

需要先安裝 Node.js LTS 與 npm，接著執行：

```bash
cd showcase
npm install
npm run dev
```

終端機會顯示本機網址，通常是 <http://localhost:5173/>。結束時可在終端機按 `Ctrl+C`。

若要檢查 production build：

```bash
cd showcase
npm run build
npm run preview
```

## GitHub Pages 預覽

Repo 已包含 [GitHub Pages workflow](./.github/workflows/showcase-pages.yml)。推送到 `main` 且 `showcase/` 有變更時，GitHub Actions 會自動建置並發布展示頁。

第一次使用時，需要到 GitHub repo：

1. 開啟 **Settings → Pages**。
2. 將 **Build and deployment / Source** 設為 **GitHub Actions**。
3. 推送到 `main`，或到 **Actions** 手動執行 `Deploy showcase to GitHub Pages`。

預期網址為：<https://slimucs.github.io/cairn-lab/>

Showcase 使用相對資源路徑與 hash navigation，因此可以直接放在 GitHub Pages 的 repository 子路徑下，不需要額外的 server routing。

## v1 產品範圍

- 學員以暱稱加入課程，回報各關卡完成或卡住
- TA 認領、求救與解決學員問題
- 講師查看全班進度、控制簡易倒數並發布關卡
- Public 畫面只顯示匿名統計，不揭露學員姓名
- Admin 管理、複製、匯出與軟刪除課程
- 各畫面以定時更新取得最新狀態

完整需求、角色權限與狀態流程請以 [`spec-v1.md`](./spec-v1.md) 為準。

## Repo 結構

```text
cairn-lab/
├── design/          # 歷次設計輸出與視覺參考
├── showcase/        # 可部署到 GitHub Pages 的互動展示
├── spec-v1.md       # 產品規格
├── tech-spec.md     # 正式產品技術方案草案
└── .github/         # GitHub Pages 自動發布流程
```

## Showcase 不包含什麼

目前展示頁的目標是溝通設計、排版與主要互動，不代表正式產品已完成。它暫時不包含：

- 真實 API 與資料庫
- 登入、角色權限與專用連結驗證
- 多人同步或跨裝置狀態
- 正式資料持久化、匯出與 audit log
- Production 的效能、安全性與錯誤監控

正式實作的技術選型與資料模型請參考 [`tech-spec.md`](./tech-spec.md)，但產品行為仍以 [`spec-v1.md`](./spec-v1.md) 為主要依據。
