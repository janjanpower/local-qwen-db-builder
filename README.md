# Local Qwen DB Builder

這個版本把前端整理成可部署到 GitHub Pages 的靜態網站。畫面保留 Local Qwen DB Builder 的產品前端：左側資料庫入口、中央對話視窗、待確認資料庫卡片、資料表欄位檢視與前端狀態操作。

目前靜態版本不依賴後端 API，適合先上傳 GitHub 展示前端流程。使用者輸入需求後，前端會用靜態規則產生待確認資料表卡片；確認後會在前端狀態中建立 TABLE。

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
