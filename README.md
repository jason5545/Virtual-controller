# 虛擬觸控控制器

這是一個基於 ViGEmBus 驅動程式的 Windows 觸控螢幕虛擬 XInput 控制器應用程式。它允許您在觸控螢幕上模擬 Xbox 控制器的操作，非常適合平板電腦或二合一筆電上的遊戲使用。

## 功能特色

- 完整支援 Xbox 360 控制器按鈕和操作
- 覆蓋模式支援，可在遊戲上方顯示透明控制器
- 可自定義控制器大小
- 可調整透明度
- 支援觸覺反饋
- 鍵盤按鍵映射功能
- 全域快捷鍵
- 系統托盤支援

## 系統需求

- Windows 10 64位元或更高版本
- ViGEmBus 驅動程式已安裝
- 觸控螢幕裝置（最佳體驗）

## 安裝步驟

1. 下載並安裝 [ViGEmBus 驅動程式](https://github.com/ViGEm/ViGEmBus/releases)
2. 下載本應用程式的最新版本
3. 解壓縮並執行安裝程式，或直接執行可攜版

## 使用說明

### 基本操作

- 左側和右側的圓形區域為類比搖桿
- 右側的 A、B、X、Y 按鈕對應 Xbox 控制器上的相同按鈕
- 左側的方向鍵可以控制 D-pad
- 頂部的 LB、RB、LT、RT 按鈕對應肩膀和扳機按鈕
- 中央的 BACK 和 START 按鈕對應 Xbox 控制器上的相同按鈕

### 設定選項

點擊右上角的「設定」按鈕可以開啟設定面板：

**一般設定**
- 不透明度：調整控制器界面的透明度
- 視窗保持在最上層：啟用或停用控制器視窗置頂
- 控制器大小：選擇小、中、大三種尺寸

**鍵盤映射**
- 啟用鍵盤映射：允許通過鍵盤按鍵操作控制器
- 自定義按鍵映射：為每個控制器按鈕設定對應的鍵盤按鍵

**進階設定**
- 鎖定控制器位置：防止控制器位置被意外移動
- 啟用觸覺反饋：如果裝置支援，按下按鈕時提供振動反饋

### 快捷鍵

- `Alt+Shift+C`：切換顯示/隱藏控制器
- `Alt+Shift+O`：切換覆蓋模式

## 覆蓋模式

點擊右上角的「切換覆蓋模式」按鈕可以將控制器切換為覆蓋模式。在此模式下：

- 控制器視窗將變為透明，沒有邊框
- 可以直接在遊戲上方操作控制器
- 通過系統托盤選單可以調整設定

## 疑難排解

**問題：控制器無法連接**
- 請確認已安裝 ViGEmBus 驅動程式
- 重新啟動應用程式
- 檢查您的電腦是否支援 .NET Framework 4.6 或更高版本

**問題：按鈕無反應**
- 檢查您的觸控螢幕是否正常運作
- 嘗試調整控制器大小，適應您的螢幕

**問題：覆蓋模式無法使用**
- 部分遊戲可能不支援透明視窗疊加
- 嘗試以管理員身分執行應用程式

## 授權條款

本應用程式使用 MIT 授權。完整條款請參閱專案中的 LICENSE 文件。

## 技術支援

如有任何問題或建議，請透過 GitHub Issues 提出。 