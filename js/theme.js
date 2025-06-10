// 主题控制器
export class ThemeController {
    constructor() {
        this.currentTheme = 'dark';
        this.init();
    }
    
    init() {
        // 从本地存储加载主题设置
        const savedTheme = localStorage.getItem('teleprompter-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        
        // 移除所有主题类
        document.body.classList.remove('dark-theme', 'light-theme');
        
        // 添加新主题类
        document.body.classList.add(`${theme}-theme`);
        
        // 更新按钮图标
        this.updateThemeButton();
        
        // 更新文字颜色
        this.updateTextColor();
        
        // 保存到本地存储
        localStorage.setItem('teleprompter-theme', theme);
        
        // 触发主题变化事件
        this.dispatchThemeChange(theme);
    }
    
    updateThemeButton() {
        const themeBtn = document.getElementById('themeBtn');
        const icon = themeBtn.querySelector('img');
        
        if (this.currentTheme === 'dark') {
            icon.src = 'images/sun.svg';
            themeBtn.title = '切换到浅色模式';
        } else {
            icon.src = 'images/moon.svg';
            themeBtn.title = '切换到深色模式';
        }
    }
    
    updateTextColor() {
        const editor = document.getElementById('textEditor');
        const fontColorInput = document.getElementById('fontColor');
        
        if (this.currentTheme === 'dark') {
            if (!fontColorInput.value || fontColorInput.value === '#333333') {
                fontColorInput.value = '#ffffff';
                editor.style.color = '#ffffff';
            }
        } else {
            if (!fontColorInput.value || fontColorInput.value === '#ffffff') {
                fontColorInput.value = '#333333';
                editor.style.color = '#333333';
            }
        }
    }
    
    dispatchThemeChange(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    isDarkTheme() {
        return this.currentTheme === 'dark';
    }
    
    isLightTheme() {
        return this.currentTheme === 'light';
    }
}