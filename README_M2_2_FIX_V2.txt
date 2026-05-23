M2.2 Fix V2

修正內容：
1. 修正 frontend/src/App.jsx 內誤寫成字面量 \n，造成 Vite OXC Invalid Unicode escape sequence。
2. 保留左側資料庫收合功能。
3. 保留 M2.2 的 TABLE 分頁位置、資料筆數/欄位同行、資料內容表格。

使用方式：
docker compose -p local-qwen-db down
docker compose -p local-qwen-db up --build
