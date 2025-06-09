// 设置控制器
class SettingsController {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupFontSettings();
        this.loadSettings();
    }
    
    setupFontSettings() {
        const fontFamily = document.getElementById('fontFamily');
        const fontSize = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        const fontColor = document.getElementById('fontColor');
        const marginLeft = document.getElementById('marginLeft');
        const marginLeftValue = document.getElementById('marginLeftValue');
        const marginRight = document.getElementById('marginRight');
        const marginRightValue = document.getElementById('marginRightValue');
        const letterSpacing = document.getElementById('letterSpacing');
        const letterSpacingValue = document.getElementById('letterSpacingValue');
        const lineHeight = document.getElementById('lineHeight');
        const lineHeightValue = document.getElementById('lineHeightValue');
        
        const editor = document.getElementById('textEditor');
        
        // 字体系列
        fontFamily.addEventListener('change', () => {
            editor.style.fontFamily = fontFamily.value;
            this.saveSettings();
        });
        
        // 字体大小
        fontSize.addEventListener('input', () => {
            const size = fontSize.value + 'px';
            editor.style.fontSize = size;
            fontSizeValue.textContent = size;
            this.saveSettings();
        });
        
        // 字体颜色
        fontColor.addEventListener('input', () => {
            editor.style.color = fontColor.value;
            this.saveSettings();
        });
        
        // 左边距
        marginLeft.addEventListener('input', () => {
            const margin = marginLeft.value + 'px';
            editor.style.paddingLeft = margin;
            marginLeftValue.textContent = margin;
            this.saveSettings();
        });
        
        // 右边距
        marginRight.addEventListener('input', () => {
            const margin = marginRight.value + 'px';
            editor.style.paddingRight = margin;
            marginRightValue.textContent = margin;
            this.saveSettings();
        });
        
        // 字间距
        letterSpacing.addEventListener('input', () => {
            const spacing = letterSpacing.value + 'px';
            editor.style.letterSpacing = spacing;
            letterSpacingValue.textContent = spacing;
            this.saveSettings();
        });
        
        // 行距
        lineHeight.addEventListener('input', () => {
            const height = lineHeight.value;
            editor.style.lineHeight = height;
            lineHeightValue.textContent = height;
            this.saveSettings();
        });
    }
    
    saveSettings() {
        const settings = {
            fontFamily: document.getElementById('fontFamily').value,
            fontSize: document.getElementById('fontSize').value,
            fontColor: document.getElementById('fontColor').value,
            marginLeft: document.getElementById('marginLeft').value,
            marginRight: document.getElementById('marginRight').value,
            letterSpacing: document.getElementById('letterSpacing').value,
            lineHeight: document.getElementById('lineHeight').value,
            autoScroll: document.getElementById('autoScroll').checked,
            scrollType: document.getElementById('scrollType').value,
            scrollSpeed: document.getElementById('scrollSpeed').value,
            horizontalFlip: document.getElementById('horizontalFlip')?.checked || false,
            verticalFlip: document.getElementById('verticalFlip')?.checked || false,
            watermarkEnabled: document.getElementById('watermarkEnabled')?.checked || false,
            watermarkText: document.getElementById('watermarkText')?.value || '',
            watermarkType: document.getElementById('watermarkType')?.value || 'center'
        };
        
        localStorage.setItem('teleprompter-settings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('teleprompter-settings');
        if (!savedSettings) {
            this.applyDefaultSettings();
            return;
        }
        
        try {
            const settings = JSON.parse(savedSettings);
            this.applySettings(settings);
        } catch (error) {
            console.error('加载设置失败:', error);
            this.applyDefaultSettings();
        }
    }
    
    applyDefaultSettings() {
        const defaultSettings = {
            fontFamily: 'SimSun, serif',
            fontSize: 16,
            fontColor: window.themeController?.isDarkTheme() ? '#ffffff' : '#333333',
            marginLeft: 50,
            marginRight: 50,
            letterSpacing: 1,
            lineHeight: 1.6,
            autoScroll: false,
            scrollType: 'line',
            scrollSpeed: 30,
            horizontalFlip: false,
            verticalFlip: false,
            watermarkEnabled: false,
            watermarkText: '',
            watermarkType: 'center'
        };
        
        this.applySettings(defaultSettings);
    }
    
    applySettings(settings) {
        const editor = document.getElementById('textEditor');
        
        // 应用字体设置
        if (settings.fontFamily) {
            document.getElementById('fontFamily').value = settings.fontFamily;
            editor.style.fontFamily = settings.fontFamily;
        }
        
        if (settings.fontSize) {
            document.getElementById('fontSize').value = settings.fontSize;
            document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';
            editor.style.fontSize = settings.fontSize + 'px';
        }
        
        if (settings.fontColor) {
            document.getElementById('fontColor').value = settings.fontColor;
            editor.style.color = settings.fontColor;
        }
        
        if (settings.marginLeft !== undefined) {
            document.getElementById('marginLeft').value = settings.marginLeft;
            document.getElementById('marginLeftValue').textContent = settings.marginLeft + 'px';
            editor.style.paddingLeft = settings.marginLeft + 'px';
        }
        
        if (settings.marginRight !== undefined) {
            document.getElementById('marginRight').value = settings.marginRight;
            document.getElementById('marginRightValue').textContent = settings.marginRight + 'px';
            editor.style.paddingRight = settings.marginRight + 'px';
        }
        
        if (settings.letterSpacing !== undefined) {
            document.getElementById('letterSpacing').value = settings.letterSpacing;
            document.getElementById('letterSpacingValue').textContent = settings.letterSpacing + 'px';
            editor.style.letterSpacing = settings.letterSpacing + 'px';
        }
        
        if (settings.lineHeight !== undefined) {
            document.getElementById('lineHeight').value = settings.lineHeight;
            document.getElementById('lineHeightValue').textContent = settings.lineHeight;
            editor.style.lineHeight = settings.lineHeight;
        }
        
        // 应用滚动设置
        if (settings.autoScroll !== undefined) {
            document.getElementById('autoScroll').checked = settings.autoScroll;
        }
        
        if (settings.scrollType) {
            document.getElementById('scrollType').value = settings.scrollType;
        }
        
        if (settings.scrollSpeed !== undefined) {
            document.getElementById('scrollSpeed').value = settings.scrollSpeed;
            document.getElementById('scrollSpeedValue').textContent = settings.scrollSpeed;
        }
        
        // 应用翻转设置
        if (settings.horizontalFlip !== undefined && document.getElementById('horizontalFlip')) {
            document.getElementById('horizontalFlip').checked = settings.horizontalFlip;
        }
        
        if (settings.verticalFlip !== undefined && document.getElementById('verticalFlip')) {
            document.getElementById('verticalFlip').checked = settings.verticalFlip;
        }
        
        // 应用水印设置
        if (settings.watermarkEnabled !== undefined && document.getElementById('watermarkEnabled')) {
            document.getElementById('watermarkEnabled').checked = settings.watermarkEnabled;
        }
        
        if (settings.watermarkText && document.getElementById('watermarkText')) {
            document.getElementById('watermarkText').value = settings.watermarkText;
        }
        
        if (settings.watermarkType && document.getElementById('watermarkType')) {
            document.getElementById('watermarkType').value = settings.watermarkType;
        }
    }
    
    resetSettings() {
        if (confirm('确定要重置所有设置吗？')) {
            localStorage.removeItem('teleprompter-settings');
            this.applyDefaultSettings();
        }
    }
    
    exportSettings() {
        const settings = localStorage.getItem('teleprompter-settings');
        if (settings) {
            const blob = new Blob([settings], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `teleprompter-settings-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
    
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                this.applySettings(settings);
                this.saveSettings();
                alert('设置导入成功！');
            } catch (error) {
                alert('设置文件格式错误！');
            }
        };
        reader.readAsText(file);
    }
}