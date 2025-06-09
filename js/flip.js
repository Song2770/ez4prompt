// 翻转控制器
class FlipController {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupFlipControls();
    }
    
    setupFlipControls() {
        const horizontalFlip = document.getElementById('horizontalFlip');
        const verticalFlip = document.getElementById('verticalFlip');
        
        horizontalFlip.addEventListener('change', () => {
            this.updateFlip();
            this.saveSettings();
        });
        
        verticalFlip.addEventListener('change', () => {
            this.updateFlip();
            this.saveSettings();
        });
    }
    
    updateFlip() {
        const editor = document.getElementById('textEditor');
        const horizontalFlip = document.getElementById('horizontalFlip').checked;
        const verticalFlip = document.getElementById('verticalFlip').checked;
        
        // 清除所有翻转类
        editor.classList.remove('flipped-horizontal', 'flipped-vertical', 'flipped-both');
        
        // 应用新的翻转状态
        if (horizontalFlip && verticalFlip) {
            editor.classList.add('flipped-both');
        } else if (horizontalFlip) {
            editor.classList.add('flipped-horizontal');
        } else if (verticalFlip) {
            editor.classList.add('flipped-vertical');
        }
        
        // 更新翻转变换
        this.applyFlipTransform(horizontalFlip, verticalFlip);
    }
    
    applyFlipTransform(horizontal, vertical) {
        const editor = document.getElementById('textEditor');
        let transform = '';
        
        if (horizontal && vertical) {
            transform = 'scale(-1, -1)';
        } else if (horizontal) {
            transform = 'scaleX(-1)';
        } else if (vertical) {
            transform = 'scaleY(-1)';
        } else {
            transform = 'none';
        }
        
        editor.style.transform = transform;
    }
    
    saveSettings() {
        if (window.settingsController) {
            window.settingsController.saveSettings();
        }
    }
    
    resetFlip() {
        document.getElementById('horizontalFlip').checked = false;
        document.getElementById('verticalFlip').checked = false;
        this.updateFlip();
        this.saveSettings();
    }
}