# 🚀 Railway 部署 - 快速開始指南

## 📋 你現在有什麼？

✅ 完整的 Notable 程式代碼  
✅ Railway 部署配置文件  
✅ Supabase 連接設定  
✅ GitHub 上傳腳本  

---

## ⚡ 3 分鐘快速部署

### 第 1 步：在 GitHub 創建倉庫（1 分鐘）

1. 訪問 https://github.com/new
2. 填寫：
   - **Repository name**: `notable`
   - **Description**: `Note taking app`
   - **Public/Private**: 選擇你偏好的
3. 點 "Create repository"

**就這樣！** 你的空倉庫已創建。

---

### 第 2 步：上傳代碼到 GitHub（1 分鐘）

**Windows 用戶：**

1. 解壓下載的 `notable-railway-complete.zip`
2. 進入文件夾
3. 右鍵 → "在終端中打開"（或 PowerShell）
4. 複製並執行以下指令：

```powershell
# 如果你有 PowerShell 腳本，執行它
.\SETUP_GITHUB.ps1

# 或者手動執行這些指令：
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/poeeguo-blip/notable.git
git push -u origin main
```

**出現密碼提示時：**
- **用戶名**: 你的 GitHub 帳號 (poeeguo-blip)
- **密碼**: 不是你的 GitHub 密碼，而是 PAT（個人訪問令牌）

**如何獲取 PAT：**
1. GitHub 設定 → Developer settings → Personal access tokens
2. 點 "Generate new token"
3. 選 "repo" 權限
4. 複製生成的令牌
5. 粘貼到 PowerShell 的密碼框

---

### 第 3 步：Railway 部署（1 分鐘）

1. 訪問 https://railway.app/
2. 登入（用你的郵箱）
3. 點 "+ New Project"
4. 選 "Empty Project"
5. 進入專案 → 點 "+ New"
6. 選 "GitHub Repo"
7. 授權 GitHub
8. 選擇 `poeeguo-blip/notable`
9. 點 "Deploy"

**待機 2-3 分鐘...**

看到綠色的 ✅ 就成功了！

---

## 🌐 如何訪問你的應用？

部署完成後，Railway 會給你一個網址：

```
https://notable-[something].up.railway.app
```

複製這個網址到瀏覽器就可以訪問！

---

## 🔑 但是等等... 還需要一步！

### 在 Railway 設定環境變數

1. 在 Railway 專案頁面
2. 點進你的應用
3. 找到 "Variables" 標籤
4. 點 "New Variable"
5. 添加以下 3 個變數：

**變數 1:**
```
Name: VITE_SUPABASE_PROJECT_ID
Value: eqnjusnoluufxfqjqklr
```

**變數 2:**
```
Name: VITE_SUPABASE_URL
Value: https://eqnjusnoluufxfqjqklr.supabase.co
```

**變數 3:**
```
Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbmp1c25vbHV1ZnhmcWpxa2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzU4NzcsImV4cCI6MjA3OTQ1MTg3N30.CDyvgLfZwpSEgiz92OZ1A64NBmIpm_xWmqscMCjfKLc
```

保存後，Railway 會自動重新部署。

---

## ✅ 完成後檢查清單

- [ ] GitHub 倉庫已創建
- [ ] 代碼已推送到 GitHub
- [ ] Railway 專案已連接 GitHub
- [ ] 環境變數已設定
- [ ] 應用已成功部署（綠色 ✅）
- [ ] 訪問應用網址可以打開
- [ ] 可以註冊/登入
- [ ] 可以創建和編輯筆記

---

## 🎉 就完成了！

你現在有：

✅ 完全獨立的筆記應用  
✅ 不再依賴 Lovable 訂閱  
✅ 免費的雲端託管  
✅ 自動備份的數據  
✅ 可以隨時修改和更新  

---

## 🔄 未來如何修改應用？

假設你想改顏色、改功能等：

**方法 1：直接在 GitHub 網頁編輯**
1. 打開你的倉庫
2. 找要修改的文件
3. 點編輯按鈕（鉛筆圖標）
4. 修改並提交
5. Railway 自動重新部署

**方法 2：在本地修改（適合大改動）**
1. 在電腦上編輯文件
2. 用 Git 推送到 GitHub
3. Railway 自動重新部署

---

## 💾 數據安全

你的所有筆記永遠儲存在 Supabase（專業數據庫服務）：

- 🔐 加密儲存
- 📱 自動備份
- 🌍 全球複製
- ✅ 99.99% 正常運行時間

**即使 Railway 宕機，你的數據也 100% 安全！**

---

## 💰 成本

| 服務 | 費用 | 免費額度 |
|------|------|--------|
| Railway | 付費 | $5/月 |
| Supabase | 付費 | 足夠用 |
| GitHub | 免費 | ∞ |

**預期費用：每月 $0-5（通常完全免費）**

---

## 🆘 常見問題

### Q: 部署失敗？
**A:** 檢查：
1. GitHub 倉庫是否有代碼
2. 環境變數是否完整
3. Railway 日誌中的錯誤信息

### Q: 如何查看運行日誌？
**A:** Railway 專案 → "Logs" 標籤

### Q: 如何停止應用？
**A:** Railway 專案 → "Settings" → "Delete Project"

### Q: 代碼會不會被暴露？
**A:** 你可以設定倉庫為 Private，代碼只有你看得到

### Q: 可以用自己的域名嗎？
**A:** 可以，但需要額外設定（付費）

---

## 📞 需要幫助？

如果遇到問題，告訴我：
1. 你卡在哪一步
2. 錯誤信息是什麼
3. 你已經試過什麼

我會幫你調試！

---

## 📚 有用的鏈接

- Railway 文檔: https://docs.railway.app/
- Supabase 文檔: https://supabase.com/docs
- GitHub 幫助: https://docs.github.com/
- 在線 Git 教程: https://git-scm.com/book

---

**祝你部署順利！** 🚀✨
