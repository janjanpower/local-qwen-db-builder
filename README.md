# Local Qwen DB Builder

這個版本把前端整理成兩個入口：

- GitHub Pages：靜態文件網站，呈現 Local AI Canvas Platform 的企畫書、系統規格書、開發進度監測與架構決策紀錄。
- 本機 localhost / 127.0.0.1：操作者介面原型，呈現格線畫布、可拖拉視窗、左側工具面板與本地資料庫操作流程。

目前靜態文件版本不依賴後端 API，適合先公開展示專案規劃內容與開發路線。本機操作者介面仍是前端原型，用來討論 UI、工具擺放規則、離線 Gemma 意圖判斷與資料庫操作流程。

## 目前進度

- 已建立文件站與 GitHub Pages 部署流程。
- 已建立本機操作者介面原型，採 40x24 滿版格線。
- 視窗支援拖拉、上下左右縮放、收合、關閉、最小尺寸限制、邊界限制與最終防重疊。
- 畫布位置目前使用 localStorage 保存，後續資料層規劃改用 IndexedDB。
- 左側工具面板支援 hover 展開、釘選、工具收納與底部固定資料庫入口。
- 關閉視窗使用 GSAP 做整體收球動畫，並在投向左側面板時同步回彈。
- 離線 AI 方向暫定 Gemma，離線版先聚焦本地資料庫查詢、新增、修改、刪除。
- 會員登入、工具市場與會員專屬 AI 設定延後。

## 本機開發

```powershell
cd frontend
npm install
npm run dev
```

## 靜態建置

```powershell
cd frontend
npm run build
```

建置結果會輸出到 `frontend/dist`。

## GitHub Pages

專案已加入 `.github/workflows/deploy-pages.yml`。推送到 `main` 後，GitHub Actions 會建置 `frontend` 並部署 `frontend/dist` 到 GitHub Pages。
