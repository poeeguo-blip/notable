# ================================
# Notable Railway 部署 - GitHub 上傳腳本
# ================================
# 這個腳本會：
# 1. 初始化 Git 倉庫
# 2. 添加所有文件
# 3. 提交到 GitHub

# 重要：執行前請確保：
# 1. 安裝了 Git (https://git-scm.com/download/win)
# 2. 在 GitHub 創建了一個空倉庫名為 "notable"
# 3. 修改下面的 YOUR_USERNAME 為你的 GitHub 帳號

# ================================

# 設定你的 GitHub 帳號
$GITHUB_USERNAME = "poeeguo-blip"
$REPO_NAME = "notable"
$REPO_URL = "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# 顏色輸出
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error-Custom { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

Write-Info "========================================="
Write-Info "Notable Railway 部署 - GitHub 上傳"
Write-Info "========================================="
Write-Info ""

# 檢查 Git 是否安裝
Write-Info "檢查 Git 是否安裝..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "❌ 錯誤：找不到 Git！"
    Write-Info "請先安裝 Git: https://git-scm.com/download/win"
    exit 1
}
Write-Success "✅ Git 已安裝"

# 獲取當前目錄
$ProjectDir = Get-Location
Write-Info "📁 項目目錄: $ProjectDir"

# 初始化 Git 倉庫
Write-Info ""
Write-Info "初始化 Git 倉庫..."
git init
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "❌ Git 初始化失敗"
    exit 1
}
Write-Success "✅ Git 已初始化"

# 設定 Git 用戶信息
Write-Info ""
Write-Info "設定 Git 用戶信息..."
git config user.name "poeeguo"
git config user.email "poeeguo@gmail.com"
Write-Success "✅ 用戶信息已設定"

# 添加遠程倉庫
Write-Info ""
Write-Info "添加遠程倉庫: $REPO_URL"
git remote add origin $REPO_URL
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "❌ 添加遠程倉庫失敗"
    Write-Info "提示：倉庫可能已存在。嘗試移除..."
    git remote remove origin 2>$null
    git remote add origin $REPO_URL
}
Write-Success "✅ 遠程倉庫已添加"

# 添加所有文件
Write-Info ""
Write-Info "添加所有文件..."
git add .
Write-Success "✅ 文件已添加"

# 提交
Write-Info ""
Write-Info "提交代碼..."
git commit -m "Initial commit: Notable Railway deployment"
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "❌ 提交失敗"
    Write-Info "可能是沒有新文件需要提交"
}
Write-Success "✅ 代碼已提交"

# 推送到 GitHub
Write-Info ""
Write-Info "推送到 GitHub..."
Write-Info "（如果要求輸入密碼，請使用 GitHub 個人訪問令牌 (PAT)）"
Write-Info "獲取 PAT: https://github.com/settings/tokens"
Write-Info ""

git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Success "✅ 推送成功！"
    Write-Success ""
    Write-Success "========================================="
    Write-Success "🎉 完成！你的代碼已上傳到 GitHub"
    Write-Success "========================================="
    Write-Info ""
    Write-Info "接下來："
    Write-Info "1. 登入 Railway: https://railway.app/"
    Write-Info "2. 按照 RAILWAY_DEPLOYMENT_GUIDE.md 的說明部署"
    Write-Info ""
    Write-Info "倉庫地址: $REPO_URL"
} else {
    Write-Error-Custom "❌ 推送失敗"
    Write-Error-Custom "請檢查："
    Write-Error-Custom "  1. GitHub 帳號和密碼/PAT 是否正確"
    Write-Error-Custom "  2. 倉庫是否已在 GitHub 上創建"
    Write-Error-Custom "  3. 網絡連接是否正常"
}

# 暫停以查看結果
Write-Info ""
Write-Info "按任意鍵退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
