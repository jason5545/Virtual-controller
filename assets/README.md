# 虛擬觸控控制器圖標資源

本目錄包含應用程式所需的圖標和資源文件。

## 必要的圖標文件

應用程式需要以下圖標文件才能正常運行：

- `icon.png` - 應用程式主圖標 (256x256)
- `icon.ico` - Windows 應用程式圖標 (多尺寸)
- `tray.png` - 系統托盤圖標 (32x32)

## 生成圖標

目前提供了兩種方式生成圖標：

### 自動生成

運行以下命令安裝依賴並生成圖標：

```bash
npm install
npm run generate-icons
```

這將使用 `generate-icons.js` 腳本自動生成基本的 PNG 圖標文件。

### 手動創建

也可以使用 SVG 文件作為模板，手動創建圖標：

1. 使用任何支援 SVG 的編輯器打開 `icon.svg` 和 `tray.svg`
2. 導出為所需的格式 (PNG, ICO)
3. 確保尺寸正確 (icon.png: 256x256, tray.png: 32x32)

## ICO 文件創建

對於 Windows 應用，需要 .ico 格式的圖標：

1. 首先創建 PNG 格式的圖標
2. 使用線上轉換工具如 https://convertico.com 轉換為 ICO 格式
3. 或使用專業工具如 IcoFX 創建包含多種尺寸的 ICO 文件

## 說明

- `.txt` 文件只是佔位符，應該替換為實際的圖像文件
- SVG 文件可以根據需要自定義和編輯 