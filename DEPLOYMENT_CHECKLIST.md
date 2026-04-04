# ✅ Railway 部署檢查清單

## 準備階段
- [ ] 下載 `notable-railway-complete.zip`
- [ ] 解壓到你的電腦
- [ ] 確認你有 GitHub 帳號 (poeeguo-blip)
- [ ] 確認你有 Railway 帳號 (poeeguo@gmail.com)

---

## GitHub 階段（第 1 步）

### 創建空倉庫
- [ ] 訪問 https://github.com/new
- [ ] 倉庫名稱: `notable`
- [ ] 點擊 "Create repository"

### 上傳代碼
- [ ] 打開 PowerShell（在解壓後的文件夾中）
- [ ] 運行上傳腳本或手動執行 Git 指令
- [ ] 看到 "successfully pushed" 消息

---

## Railway 階段（第 2 步）

### 創建項目
- [ ] 訪問 https://railway.app/
- [ ] 點擊 "+ New Project"
- [ ] 選擇 "Empty Project"

### 連接 GitHub
- [ ] 在項目中點 "+ New"
- [ ] 選擇 "GitHub Repo"
- [ ] 授權並選擇 `poeeguo-blip/notable`
- [ ] 點擊 "Deploy"
- [ ] 等待 2-3 分鐘，看到綠色 ✅

### 設定環境變數
- [ ] 進入部署的應用
- [ ] 切換到 "Variables" 標籤
- [ ] 添加 3 個變數：
  - [ ] `VITE_SUPABASE_PROJECT_ID`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] 保存

---

## 測試階段（第 3 步）

### 訪問應用
- [ ] 複製 Railway 提供的網址
- [ ] 在瀏覽器中打開
- [ ] 看到登入界面

### 驗證功能
- [ ] 可以註冊新帳號
- [ ] 可以登入
- [ ] 可以創建筆記
- [ ] 可以編輯筆記
- [ ] 可以刪除筆記
- [ ] 可以創建文件夾
- [ ] 筆記自動保存

---

## 完成！🎉

如果所有項目都打勾了：

✅ 你的應用已成功部署到 Railway  
✅ 不再依賴 Lovable  
✅ 數據永遠儲存在 Supabase  
✅ 代碼備份在 GitHub  
✅ 可以隨時修改和更新  

---

## 下一步

1. **告訴朋友** - 分享你的筆記應用網址
2. **備份提醒** - 定期檢查 GitHub 和 Supabase 備份
3. **自定義** - 修改顏色、功能、样式等
4. **升級** - 如果需要更多功能，修改代碼並推送

---

## 遇到問題？

使用此表格記錄並提供給開發者：

| 項目 | 狀態 | 說明 |
|------|------|------|
| GitHub 上傳 | ✅/❌ | |
| Railway 部署 | ✅/❌ | |
| 環境變數 | ✅/❌ | |
| 應用訪問 | ✅/❌ | |
| 登入功能 | ✅/❌ | |
| 筆記創建 | ✅/❌ | |
| 數據保存 | ✅/❌ | |

---

祝部署順利！🚀
