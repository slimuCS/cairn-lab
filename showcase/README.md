# Cairn Lab Showcase

依 `design/v120` 的視覺方向重新實作的互動 design showcase。這裡的資料全部是瀏覽器內的假資料，不會寫入 database。

## 目前畫面

- Student：切換學員、選擇關卡、完成／取消完成、回報／解除卡住。
- Course Design：編輯課程與關卡、新增、複製、軟刪除、排序、還原與發布。
- Public：匿名顯示各關完成／卡住人數與倒數。

三個畫面共用同一份 mock state；Course Design 必須按「發布」才會將變更套用到 Student 與 Public。

## 本機開發

```bash
npm install
npm run dev
```

Production build：

```bash
npm run build
```

## 展示範圍

Showcase 用來展示視覺、排版與主要互動，不包含正式 API、權限、資料持久化與多人同步。
