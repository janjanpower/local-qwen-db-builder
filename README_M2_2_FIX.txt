M2.2 修正說明

這版是以你上傳的 local-qwen-db-builder-m2-1-refactor(1).zip 為基礎直接修改。

已完成：
1. 左側收合功能保留。
2. 資料庫 TABLE 分頁移到新增欄位輸入列下方、資料筆數區塊上方。
3. 資料筆數與欄位同行。
4. 新增、重整、移除都在新增欄位輸入列同行，沒有底部操作區塊。
5. 新增 1 筆資料後，資料內容表格會顯示第 1 筆資料，即使內容為空也會顯示「空白」。
6. TABLE 分頁可用 x 移除。
7. 欄位可多選後用 Trash2 移除。

重啟：
docker compose -p local-qwen-db down
docker compose -p local-qwen-db up --build
