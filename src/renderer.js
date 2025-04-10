const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const nodeVigemClient = require('node-vigem-client');

// 初始化設定儲存庫
const store = new Store();

// 控制器元素
const leftStick = document.getElementById('left-stick');
const rightStick = document.getElementById('right-stick');
const leftKnob = document.getElementById('left-knob');
const rightKnob = document.getElementById('right-knob');
const settingsButton = document.getElementById('settings-button');
const overlayButton = document.getElementById('overlay-button');
const settingsPanel = document.getElementById('settings-panel');
const saveSettingsButton = document.getElementById('save-settings');
const cancelSettingsButton = document.getElementById('cancel-settings');
const opacitySlider = document.getElementById('opacity-slider');
const alwaysOnTopCheckbox = document.getElementById('always-on-top');
const controllerSizeSelect = document.getElementById('controller-size');
const lockPositionCheckbox = document.getElementById('lock-position');
const vibrationEnabledCheckbox = document.getElementById('vibration-enabled');
const keyboardMappingCheckbox = document.getElementById('keyboard-mapping-enabled');
const keyboardMappingContainer = document.getElementById('keyboard-mapping-container');

// 初始化按鈕狀態
const buttonStates = {
  a: false,
  b: false,
  x: false,
  y: false,
  lb: false,
  rb: false,
  lt: false,
  rt: false,
  start: false,
  back: false,
  up: false,
  down: false,
  left: false,
  right: false
};

// 初始化搖桿位置
const stickStates = {
  leftX: 0,
  leftY: 0,
  rightX: 0,
  rightY: 0
};

// 初始化扳機狀態
const triggerStates = {
  leftTrigger: 0,
  rightTrigger: 0
};

// 判斷是否正在拖動
let isDraggingLeft = false;
let isDraggingRight = false;

// 鍵盤映射
let keyboardMappings = {
  a: '',
  b: '',
  x: '',
  y: '',
  lb: '',
  rb: '',
  lt: '',
  rt: '',
  start: '',
  back: '',
  up: '',
  down: '',
  left: '',
  right: ''
};

// 觸覺反饋設定
let vibrationEnabled = store.get('controllerConfig.vibrationEnabled', true);

// 載入設定
const loadSettings = () => {
  const controllerConfig = store.get('controllerConfig') || {};
  
  opacitySlider.value = controllerConfig.opacity || 0.8;
  alwaysOnTopCheckbox.checked = controllerConfig.alwaysOnTop !== undefined ? 
    controllerConfig.alwaysOnTop : true;
  controllerSizeSelect.value = controllerConfig.controllerSize || 'medium';
  
  // 載入新增設定
  lockPositionCheckbox.checked = controllerConfig.lockPosition || false;
  vibrationEnabledCheckbox.checked = controllerConfig.vibrationEnabled !== undefined ? 
    controllerConfig.vibrationEnabled : true;
  
  // 載入鍵盤映射
  if (controllerConfig.keyboardMapping) {
    keyboardMappingCheckbox.checked = controllerConfig.keyboardMapping.enabled || false;
    keyboardMappingContainer.style.display = keyboardMappingCheckbox.checked ? 'block' : 'none';
    
    if (controllerConfig.keyboardMapping.mappings) {
      keyboardMappings = { ...keyboardMappings, ...controllerConfig.keyboardMapping.mappings };
      
      // 更新映射輸入欄位
      Object.keys(keyboardMappings).forEach(key => {
        const input = document.getElementById(`key-map-${key}`);
        if (input) {
          input.value = keyboardMappings[key];
        }
      });
    }
  }
  
  vibrationEnabled = vibrationEnabledCheckbox.checked;
  
  applyControllerSize(controllerSizeSelect.value);
};

// 應用控制器大小設定
const applyControllerSize = (size) => {
  const controllerArea = document.getElementById('controller-area');
  controllerArea.className = ''; // 移除現有的尺寸類別
  controllerArea.classList.add('size-' + size);
  
  // 根據尺寸調整控制器元素大小
  let stickSize, knobSize, buttonSize, dpadSize;
  
  switch(size) {
    case 'small':
      stickSize = 100;
      knobSize = 30;
      buttonSize = 40;
      dpadSize = 40;
      break;
    case 'large':
      stickSize = 200;
      knobSize = 70;
      buttonSize = 80;
      dpadSize = 60;
      break;
    case 'medium':
    default:
      stickSize = 150;
      knobSize = 50;
      buttonSize = 60;
      dpadSize = 50;
      break;
  }
  
  // 調整搖桿大小
  const sticks = document.querySelectorAll('.control-stick');
  sticks.forEach(stick => {
    stick.style.width = stickSize + 'px';
    stick.style.height = stickSize + 'px';
  });
  
  // 調整搖桿桿子大小
  const knobs = document.querySelectorAll('.stick-knob');
  knobs.forEach(knob => {
    knob.style.width = knobSize + 'px';
    knob.style.height = knobSize + 'px';
  });
  
  // 調整按鈕大小
  const buttons = document.querySelectorAll('.action-button');
  buttons.forEach(button => {
    button.style.width = buttonSize + 'px';
    button.style.height = buttonSize + 'px';
  });
  
  // 調整方向鍵大小
  const dpadButtons = document.querySelectorAll('.dpad-button');
  dpadButtons.forEach(button => {
    button.style.width = dpadSize + 'px';
    button.style.height = dpadSize + 'px';
  });
};

// 初始化ViGEmBus客戶端
let vigemController = null;

const initializeController = async () => {
  try {
    console.log('初始化ViGEmBus控制器...');
    
    // 建立ViGEm客戶端連接
    const { ViGEmClient, Xbox360Controller } = nodeVigemClient;
    const client = new ViGEmClient();
    
    // 建立Xbox360控制器
    vigemController = new Xbox360Controller(client);
    
    // 連接控制器
    await vigemController.connect();
    console.log('ViGEmBus控制器已連接');
    
    // 顯示連接狀態
    document.getElementById('title-bar').classList.add('connected');
  } catch (error) {
    console.error('無法初始化ViGEmBus控制器:', error);
    
    // 顯示錯誤訊息
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = '無法連接到ViGEmBus驅動程式。請確認已安裝ViGEmBus驅動程式。';
    document.body.appendChild(errorMsg);
  }
};

// 更新控制器狀態
const updateControllerState = () => {
  if (!vigemController) return;
  
  try {
    // 更新搖桿位置
    vigemController.axes.leftX = Math.round(stickStates.leftX * 32767);
    vigemController.axes.leftY = Math.round(stickStates.leftY * 32767);
    vigemController.axes.rightX = Math.round(stickStates.rightX * 32767);
    vigemController.axes.rightY = Math.round(stickStates.rightY * 32767);
    
    // 更新按鈕狀態
    vigemController.buttons.A = buttonStates.a;
    vigemController.buttons.B = buttonStates.b;
    vigemController.buttons.X = buttonStates.x;
    vigemController.buttons.Y = buttonStates.y;
    vigemController.buttons.LeftShoulder = buttonStates.lb;
    vigemController.buttons.RightShoulder = buttonStates.rb;
    vigemController.buttons.Back = buttonStates.back;
    vigemController.buttons.Start = buttonStates.start;
    vigemController.buttons.DpadUp = buttonStates.up;
    vigemController.buttons.DpadDown = buttonStates.down;
    vigemController.buttons.DpadLeft = buttonStates.left;
    vigemController.buttons.DpadRight = buttonStates.right;
    
    // 更新扳機狀態
    vigemController.sliders.leftTrigger = triggerStates.leftTrigger;
    vigemController.sliders.rightTrigger = triggerStates.rightTrigger;
    
    // 更新控制器
    vigemController.update();
  } catch (error) {
    console.error('更新控制器狀態時發生錯誤:', error);
  }
};

// 處理搖桿拖動
const handleStickDrag = (stick, knob, event, isLeft) => {
  const stickRect = stick.getBoundingClientRect();
  const centerX = stickRect.width / 2;
  const centerY = stickRect.height / 2;
  
  let posX, posY;
  
  // 檢查事件類型 (觸控或滑鼠)
  if (event.type.includes('touch')) {
    const touch = event.touches[0];
    posX = touch.clientX - stickRect.left;
    posY = touch.clientY - stickRect.top;
  } else {
    posX = event.clientX - stickRect.left;
    posY = event.clientY - stickRect.top;
  }
  
  // 計算相對於中心的偏移量
  let offsetX = (posX - centerX) / centerX;
  let offsetY = (posY - centerY) / centerY;
  
  // 限制偏移量在單位圓內
  const magnitude = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
  if (magnitude > 1) {
    offsetX /= magnitude;
    offsetY /= magnitude;
  }
  
  // 更新搖桿外觀位置
  const knobOffsetX = offsetX * (centerX - knob.offsetWidth / 2);
  const knobOffsetY = offsetY * (centerY - knob.offsetHeight / 2);
  knob.style.transform = `translate(${knobOffsetX}px, ${knobOffsetY}px)`;
  
  // 更新搖桿狀態 (Y軸需要反轉，因為CSS座標系的Y軸是向下的)
  if (isLeft) {
    stickStates.leftX = offsetX;
    stickStates.leftY = -offsetY;
  } else {
    stickStates.rightX = offsetX;
    stickStates.rightY = -offsetY;
  }
  
  // 更新控制器狀態
  updateControllerState();
};

// 重置搖桿位置
const resetStick = (knob, isLeft) => {
  knob.style.transform = 'translate(0, 0)';
  
  if (isLeft) {
    stickStates.leftX = 0;
    stickStates.leftY = 0;
  } else {
    stickStates.rightX = 0;
    stickStates.rightY = 0;
  }
  
  updateControllerState();
};

// 提供觸覺反饋
const provideFeedback = (button) => {
  if (!vibrationEnabled) return;
  
  // 視覺反饋 - 按鈕閃爍效果
  button.classList.add('feedback');
  setTimeout(() => {
    button.classList.remove('feedback');
  }, 100);
  
  // 觸覺反饋 (如果裝置支援)
  if (window.navigator.vibrate) {
    window.navigator.vibrate(50);
  }
};

// 處理按鈕按下
const handleButtonPress = (buttonId, isPressed) => {
  const buttonKey = buttonId.replace('button-', '').replace('dpad-', '');
  
  if (isPressed) {
    const button = document.getElementById(buttonId);
    if (button) {
      provideFeedback(button);
    }
  }
  
  switch (buttonId) {
    case 'button-a':
      buttonStates.a = isPressed;
      break;
    case 'button-b':
      buttonStates.b = isPressed;
      break;
    case 'button-x':
      buttonStates.x = isPressed;
      break;
    case 'button-y':
      buttonStates.y = isPressed;
      break;
    case 'button-lb':
      buttonStates.lb = isPressed;
      break;
    case 'button-rb':
      buttonStates.rb = isPressed;
      break;
    case 'button-lt':
      triggerStates.leftTrigger = isPressed ? 255 : 0;
      break;
    case 'button-rt':
      triggerStates.rightTrigger = isPressed ? 255 : 0;
      break;
    case 'button-start':
      buttonStates.start = isPressed;
      break;
    case 'button-back':
      buttonStates.back = isPressed;
      break;
    case 'dpad-up':
      buttonStates.up = isPressed;
      break;
    case 'dpad-down':
      buttonStates.down = isPressed;
      break;
    case 'dpad-left':
      buttonStates.left = isPressed;
      break;
    case 'dpad-right':
      buttonStates.right = isPressed;
      break;
  }
  
  updateControllerState();
};

// 設定鍵盤映射
const setupKeyboardMapping = () => {
  // 取消現有的事件監聽器
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  
  // 如果啟用鍵盤映射，添加事件監聽器
  if (keyboardMappingCheckbox.checked) {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }
};

// 處理鍵盤按下事件
const handleKeyDown = (e) => {
  e.preventDefault();
  
  const key = e.key.toLowerCase();
  
  // 檢查映射
  Object.keys(keyboardMappings).forEach(buttonKey => {
    if (keyboardMappings[buttonKey].toLowerCase() === key) {
      const buttonId = buttonKey === 'a' || buttonKey === 'b' || buttonKey === 'x' || buttonKey === 'y' ||
                    buttonKey === 'start' || buttonKey === 'back' ? 
                    `button-${buttonKey}` : 
                    (buttonKey === 'up' || buttonKey === 'down' || buttonKey === 'left' || buttonKey === 'right' ?
                    `dpad-${buttonKey}` : `button-${buttonKey}`);
      
      handleButtonPress(buttonId, true);
      const button = document.getElementById(buttonId);
      if (button) {
        button.classList.add('pressed');
      }
    }
  });
};

// 處理鍵盤釋放事件
const handleKeyUp = (e) => {
  const key = e.key.toLowerCase();
  
  // 檢查映射
  Object.keys(keyboardMappings).forEach(buttonKey => {
    if (keyboardMappings[buttonKey].toLowerCase() === key) {
      const buttonId = buttonKey === 'a' || buttonKey === 'b' || buttonKey === 'x' || buttonKey === 'y' ||
                    buttonKey === 'start' || buttonKey === 'back' ? 
                    `button-${buttonKey}` : 
                    (buttonKey === 'up' || buttonKey === 'down' || buttonKey === 'left' || buttonKey === 'right' ?
                    `dpad-${buttonKey}` : `button-${buttonKey}`);
      
      handleButtonPress(buttonId, false);
      const button = document.getElementById(buttonId);
      if (button) {
        button.classList.remove('pressed');
      }
    }
  });
};

// 記錄鍵盤按鍵
const recordKey = (inputElement) => {
  const overlay = document.createElement('div');
  overlay.className = 'key-recording-overlay';
  overlay.textContent = '按下鍵盤按鍵...';
  document.body.appendChild(overlay);
  
  inputElement.blur();
  
  const keyHandler = (e) => {
    e.preventDefault();
    inputElement.value = e.key;
    document.body.removeChild(overlay);
    document.removeEventListener('keydown', keyHandler);
  };
  
  document.addEventListener('keydown', keyHandler);
};

// 事件監聽器
document.addEventListener('DOMContentLoaded', () => {
  // 初始化設定
  loadSettings();
  
  // 初始化控制器
  initializeController();
  
  // 左搖桿事件
  leftStick.addEventListener('mousedown', (e) => {
    isDraggingLeft = true;
    handleStickDrag(leftStick, leftKnob, e, true);
  });
  
  leftStick.addEventListener('touchstart', (e) => {
    isDraggingLeft = true;
    handleStickDrag(leftStick, leftKnob, e, true);
    e.preventDefault(); // 防止觸控時的滾動
  });
  
  // 右搖桿事件
  rightStick.addEventListener('mousedown', (e) => {
    isDraggingRight = true;
    handleStickDrag(rightStick, rightKnob, e, false);
  });
  
  rightStick.addEventListener('touchstart', (e) => {
    isDraggingRight = true;
    handleStickDrag(rightStick, rightKnob, e, false);
    e.preventDefault();
  });
  
  // 全域拖動和觸控移動事件
  document.addEventListener('mousemove', (e) => {
    if (isDraggingLeft) {
      handleStickDrag(leftStick, leftKnob, e, true);
    }
    if (isDraggingRight) {
      handleStickDrag(rightStick, rightKnob, e, false);
    }
  });
  
  document.addEventListener('touchmove', (e) => {
    if (isDraggingLeft) {
      handleStickDrag(leftStick, leftKnob, e, true);
    }
    if (isDraggingRight) {
      handleStickDrag(rightStick, rightKnob, e, false);
    }
    e.preventDefault();
  });
  
  // 釋放事件
  document.addEventListener('mouseup', () => {
    if (isDraggingLeft) {
      isDraggingLeft = false;
      resetStick(leftKnob, true);
    }
    if (isDraggingRight) {
      isDraggingRight = false;
      resetStick(rightKnob, false);
    }
  });
  
  document.addEventListener('touchend', () => {
    if (isDraggingLeft) {
      isDraggingLeft = false;
      resetStick(leftKnob, true);
    }
    if (isDraggingRight) {
      isDraggingRight = false;
      resetStick(rightKnob, false);
    }
  });
  
  // 按鈕事件
  document.querySelectorAll('.action-button, .shoulder-button, .dpad-button, .center-button').forEach(button => {
    // 滑鼠事件
    button.addEventListener('mousedown', () => {
      handleButtonPress(button.id, true);
      button.classList.add('pressed');
    });
    
    button.addEventListener('mouseup', () => {
      handleButtonPress(button.id, false);
      button.classList.remove('pressed');
    });
    
    button.addEventListener('mouseleave', () => {
      if (button.classList.contains('pressed')) {
        handleButtonPress(button.id, false);
        button.classList.remove('pressed');
      }
    });
    
    // 觸控事件
    button.addEventListener('touchstart', (e) => {
      handleButtonPress(button.id, true);
      button.classList.add('pressed');
      e.preventDefault();
    });
    
    button.addEventListener('touchend', () => {
      handleButtonPress(button.id, false);
      button.classList.remove('pressed');
    });
  });
  
  // 設定按鈕事件
  settingsButton.addEventListener('click', () => {
    settingsPanel.style.display = 'block';
  });
  
  // 關閉設定面板
  cancelSettingsButton.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
    loadSettings(); // 重新載入設定
  });
  
  // 設定面板事件
  keyboardMappingCheckbox.addEventListener('change', () => {
    keyboardMappingContainer.style.display = keyboardMappingCheckbox.checked ? 'block' : 'none';
    setupKeyboardMapping();
  });
  
  // 設定按鍵映射輸入欄位
  document.querySelectorAll('.key-mapping-input').forEach(input => {
    input.addEventListener('focus', () => {
      recordKey(input);
    });
    
    input.addEventListener('change', () => {
      const buttonKey = input.id.replace('key-map-', '');
      keyboardMappings[buttonKey] = input.value;
    });
  });
  
  // 儲存設定
  saveSettingsButton.addEventListener('click', () => {
    // 儲存設定
    ipcRenderer.send('set-opacity', parseFloat(opacitySlider.value));
    ipcRenderer.send('set-always-on-top', alwaysOnTopCheckbox.checked);
    ipcRenderer.send('set-controller-size', controllerSizeSelect.value);
    
    // 儲存新設定
    ipcRenderer.send('set-lock-position', lockPositionCheckbox.checked);
    ipcRenderer.send('set-vibration-enabled', vibrationEnabledCheckbox.checked);
    
    // 儲存鍵盤映射
    ipcRenderer.send('set-keyboard-mapping', {
      enabled: keyboardMappingCheckbox.checked,
      mappings: keyboardMappings
    });
    
    // 更新變數
    vibrationEnabled = vibrationEnabledCheckbox.checked;
    
    // 設定鍵盤映射
    setupKeyboardMapping();
    
    // 應用控制器大小
    applyControllerSize(controllerSizeSelect.value);
    
    // 關閉設定面板
    settingsPanel.style.display = 'none';
  });
  
  // 切換覆蓋模式
  overlayButton.addEventListener('click', () => {
    ipcRenderer.send('toggle-overlay-mode');
  });
  
  // 接收設定開啟事件
  ipcRenderer.on('open-settings', () => {
    settingsPanel.style.display = 'block';
  });
});

// 在視窗關閉前斷開控制器連接
window.addEventListener('beforeunload', () => {
  if (vigemController) {
    try {
      vigemController.disconnect();
      console.log('控制器已斷開連接');
    } catch (error) {
      console.error('斷開控制器連接時發生錯誤:', error);
    }
  }
}); 