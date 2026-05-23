# Local Qwen DB Builder

這個版本把前端整理成可部署到 GitHub Pages 的靜態文件網站。內容聚焦在 Local AI Canvas Platform 的企畫書、系統規格書、開發進度監測與架構決策紀錄。

目前靜態版本不依賴後端 API，適合先公開展示專案規劃內容與開發路線。

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
