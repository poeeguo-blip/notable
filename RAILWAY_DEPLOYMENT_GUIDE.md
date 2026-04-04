# Railway 部署指南

## 📋 部署步驟（3 步完成）

### 第 1 步：準備 GitHub 倉庫

這個代碼已經準備好了。你需要：

1. 登入 GitHub：https://github.com/poeeguo-blip
2. 新建一個倉庫 (repository)，命名為 `notable`
3. 上傳這些文件到你的倉庫

**如何上傳？** 我會幫你準備一個 PowerShell 指令，你只需要複製並執行。

---

### 第 2 步：在 Railway 設定環境變數

1. 登入 Railway：https://railway.app/
2. 新建專案 → 選 "Empty Project"
3. 進入專案設定 → Variables
4. 添加以下環境變數：

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `VITE_SUPABASE_PROJECT_ID` | `eqnjusnoluufxfqjqklr` | 你的 Supabase 專案 ID |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbmp1c25vbHV1ZnhmcWpxa2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzU4NzcsImV4cCI6MjA3OTQ1MTg3N30.CDyvgLfZwpSEgiz92OZ1A64NBmIpm_xWmqscMCjfKLc` | 你的 Supabase 匿名鑰匙 |
| `VITE_SUPABASE_URL` | `https://eqnjusnoluufxfqjqklr.supabase.co` | 你的 Supabase URL |

**重要！** 這些是你目前 Lovable 使用的密鑰。

---

### 第 3 步：連接 GitHub 倉庫並部署

1. 在 Railway 專案頁面，點擊 "+ New"
2. 選 "GitHub Repo"
3. 授權 GitHub 連接
4. 選擇 `poeeguo-blip/notable` 倉庫
5. 點擊 "Deploy"

**就完成了！** 🎉

Railway 會自動：
- ✅ 下載代碼
- ✅ 安裝依賴 (npm install)
- ✅ 編譯構建 (npm run build)
- ✅ 部署到雲端
- ✅ 分配一個公開網址

---

## 🔗 獲取網址

部署完成後，你會在 Railway 中看到：

```
Domains
├─ [yourapp].up.railway.app  ← 使用這個！
```

點擊它就可以訪問你的筆記應用了！

---

## 📱 使用你的應用

1. 訪問 `https://[yourapp].up.railway.app`
2. 用你的 Supabase 帳號登入（如果沒有，點 "Sign up"）
3. 開始寫筆記！

所有筆記會自動儲存在你的 Supabase 數據庫。

---

## 🔄 未來的更新

如果你想修改應用代碼：

1. 在 GitHub 上編輯文件（或本地編輯後 push）
2. Railway 會自動檢測到更改
3. 自動重新編譯和部署
4. 你的應用會自動更新！

---

## 💾 數據備份

你的所有筆記永遠儲存在：
- **Supabase** - 獨立的數據庫，不受 Railway 影響
- **GitHub** - 代碼備份，可隨時克隆

**即使 Railway 宕機，你的數據也安全！** ✅

---

## 🆘 遇到問題？

如果部署失敗，檢查：

1. ✅ GitHub 倉庫名稱是否正確
2. ✅ 環境變數是否完整且沒有空格
3. ✅ Supabase 密鑰是否有效
4. ✅ Railway 日誌中是否有錯誤信息

點擊 "View Logs" 查看詳細日誌。

---

## 💰 費用

- **Railway**: 免費額度通常足夠（每月 $5 額度）
- **Supabase**: 免費額度通常足夠（每月免費配額）
- **GitHub**: 完全免費

**零成本！** 🎉

---

## 📞 需要幫助？

如果有任何問題，我可以幫你調試。只需告訴我：

1. Railway 顯示的錯誤信息
2. 你的應用網址
3. 是什麼在不工作

我會立即幫你修復！
