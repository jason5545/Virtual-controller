const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 生成應用圖標
function generateAppIcon() {
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, 256, 256);
    
    // 控制器輪廓
    ctx.fillStyle = '#4c9ed9';
    
    // 左側搖桿區域
    ctx.beginPath();
    ctx.arc(70, 140, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // 右側搖桿區域
    ctx.beginPath();
    ctx.arc(186, 140, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // 搖桿桿子
    ctx.fillStyle = '#d9d9d9';
    
    // 左搖桿
    ctx.beginPath();
    ctx.arc(70, 140, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // 右搖桿
    ctx.beginPath();
    ctx.arc(186, 140, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // 按鈕
    // A按鈕 (綠色)
    ctx.fillStyle = '#32cd32';
    ctx.beginPath();
    ctx.arc(186, 90, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // B按鈕 (紅色)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(220, 90, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // X按鈕 (藍色)
    ctx.fillStyle = '#1e90ff';
    ctx.beginPath();
    ctx.arc(150, 90, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Y按鈕 (黃色)
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(180, 50, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // D-pad
    ctx.fillStyle = '#d9d9d9';
    ctx.fillRect(55, 70, 30, 10); // 水平
    ctx.fillRect(65, 60, 10, 30); // 垂直
    
    // 保存圖標
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, 'icon.png'), buffer);
    console.log('應用圖標已創建: icon.png');
}

// 生成托盤圖標
function generateTrayIcon() {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, 32, 32);
    
    // 控制器輪廓
    ctx.fillStyle = '#4c9ed9';
    
    // 左側搖桿
    ctx.beginPath();
    ctx.arc(9, 18, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 右側搖桿
    ctx.beginPath();
    ctx.arc(23, 18, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 按鈕 (簡化)
    ctx.fillStyle = '#d9d9d9';
    ctx.beginPath();
    ctx.arc(23, 12, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // D-pad (簡化)
    ctx.fillRect(7, 12, 5, 2); // 水平
    ctx.fillRect(9, 10, 2, 5); // 垂直
    
    // 保存圖標
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, 'tray.png'), buffer);
    console.log('托盤圖標已創建: tray.png');
}

// 運行生成
generateAppIcon();
generateTrayIcon(); 