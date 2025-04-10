# GitHub Action 自動編譯工作流程

此目錄包含用於自動編譯 Windows 執行檔的 GitHub Action 工作流程設定。

## 工作流程說明

`build.yml` 工作流程會在以下情況自動觸發：

1. 推送代碼到 main 或 master 分支
2. 建立新的版本標籤 (格式如 v1.0.0)
3. 建立拉取請求到 main 或 master 分支
4. 手動觸發工作流程

## 工作流程步驟

工作流程執行以下步驟：

1. 簽出程式碼
2. 設定 Node.js 環境 (Node.js 18)
3. 安裝專案依賴
4. 使用 `assets/generate-icons.js` 生成應用程式圖示
5. 使用 electron-builder 編譯應用程式
6. 上傳編譯結果作為工作流程成品

## 發布流程

當推送新的版本標籤時，工作流程還會：

1. 自動創建 GitHub 發布
2. 將編譯好的 .exe 檔案附加到發布中

## 如何使用

### 建立新版本

1. 更新 `package.json` 中的版本號
2. 提交更改並推送
3. 建立新的版本標籤並推送：

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 檢視編譯結果

1. 前往 GitHub 專案頁面
2. 點擊 "Actions" 分頁
3. 點擊最新的工作流程運行
4. 在 "Artifacts" 區域下載編譯結果

### 手動觸發編譯

1. 前往 GitHub 專案頁面
2. 點擊 "Actions" 分頁
3. 選擇 "自動編譯 Windows 執行檔" 工作流程
4. 點擊 "Run workflow" 按鈕
5. 選擇分支並確認 