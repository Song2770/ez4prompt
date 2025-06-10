// 滚动控制器
export class ScrollController {
    constructor() {
        this.isAutoScrolling = false;
        this.scrollSpeed = 30;
        this.scrollType = 'line';
        this.scrollInterval = null;
        this.totalDuration = 10; // 分钟
        this.autoCalculateDuration = false;
        this.currentScrollPosition = 0;
        this.targetScrollPosition = 0;
        this.smoothScrollFrame = null;
        
        this.init();
    }
    
    init() {
        this.setupScrollSettings();
        this.updateReadingLine();
    }
    
    setupScrollSettings() {
        const autoScrollCheckbox = document.getElementById('autoScroll');
        const autoScrollOptions = document.getElementById('autoScrollOptions');
        const scrollTypeSelect = document.getElementById('scrollType');
        const scrollSpeedRange = document.getElementById('scrollSpeed');
        const scrollSpeedValue = document.getElementById('scrollSpeedValue');
        const autoDurationCheckbox = document.getElementById('autoDuration');
        const durationSettings = document.getElementById('durationSettings');
        const totalDurationInput = document.getElementById('totalDuration');
        
        // 自动滚动开关
        autoScrollCheckbox.addEventListener('change', () => {
            if (autoScrollCheckbox.checked) {
                autoScrollOptions.style.display = 'block';
            } else {
                autoScrollOptions.style.display = 'none';
                this.stopAutoScroll();
            }
        });
        
        // 滚动类型选择
        scrollTypeSelect.addEventListener('change', () => {
            this.scrollType = scrollTypeSelect.value;
            if (this.autoCalculateDuration) {
                this.calculateOptimalSpeed();
            }
        });
        
        // 滚动速度调整
        scrollSpeedRange.addEventListener('input', () => {
            this.scrollSpeed = parseInt(scrollSpeedRange.value);
            scrollSpeedValue.textContent = this.scrollSpeed;
        });
        
        // 自动计算时长
        autoDurationCheckbox.addEventListener('change', () => {
            this.autoCalculateDuration = autoDurationCheckbox.checked;
            if (autoDurationCheckbox.checked) {
                durationSettings.style.display = 'block';
                this.calculateOptimalSpeed();
            } else {
                durationSettings.style.display = 'none';
            }
        });
        
        // 总时长设置
        totalDurationInput.addEventListener('input', () => {
            this.totalDuration = parseInt(totalDurationInput.value);
            if (this.autoCalculateDuration) {
                this.calculateOptimalSpeed();
            }
        });
    }
    
    startAutoScroll() {
        if (this.isAutoScrolling) return;
        
        const autoScrollEnabled = document.getElementById('autoScroll').checked;
        if (!autoScrollEnabled) return;
        
        this.isAutoScrolling = true;
        const editor = document.getElementById('textEditor');
        this.currentScrollPosition = editor.scrollTop;
        
        this.smoothAutoScroll();
    }
    
    smoothAutoScroll() {
        if (!this.isAutoScrolling) return;
        
        const editor = document.getElementById('textEditor');
        const maxScroll = editor.scrollHeight - editor.clientHeight;
        
        if (this.currentScrollPosition >= maxScroll) {
            this.stopAutoScroll();
            return;
        }
        
        // 计算每帧的滚动距离，实现平滑滚动
        const scrollStep = this.calculateScrollStep();
        this.currentScrollPosition += scrollStep;
        
        // 平滑更新滚动位置
        editor.scrollTop = this.currentScrollPosition;
        
        this.updateReadingLine();
        if (window.app && window.app.updateScrollbar) {
            window.app.updateScrollbar();
        }
        
        // 使用 requestAnimationFrame 实现平滑滚动
        this.smoothScrollFrame = requestAnimationFrame(() => {
            this.smoothAutoScroll();
        });
    }
    
    calculateScrollStep() {
        // 根据滚动速度和类型计算每帧的滚动距离
        const baseSpeed = this.scrollSpeed / 100; // 将速度转换为0-1的比例
        
        if (this.scrollType === 'line') {
            // 按行滚动：基于行高计算
            const editor = document.getElementById('textEditor');
            const lineHeight = parseInt(window.getComputedStyle(editor).lineHeight) || 24;
            return (lineHeight * baseSpeed) / 60; // 60fps
        } else {
            // 按字滚动：更细粒度的滚动
            return baseSpeed * 2; // 每帧2像素的基础速度
        }
    }
    
    stopAutoScroll() {
        this.isAutoScrolling = false;
        if (this.smoothScrollFrame) {
            cancelAnimationFrame(this.smoothScrollFrame);
            this.smoothScrollFrame = null;
        }
    }
    
    calculateOptimalSpeed() {
        const editor = document.getElementById('textEditor');
        const text = editor.textContent;
        
        let unitCount;
        if (this.scrollType === 'line') {
            unitCount = text.split('\n').length;
        } else {
            unitCount = text.length;
        }
        
        // 根据总时长计算最优速度
        const totalSeconds = this.totalDuration * 60;
        const optimalSpeed = Math.round((unitCount / totalSeconds) * 10);
        
        this.scrollSpeed = Math.max(1, Math.min(100, optimalSpeed));
        
        // 更新UI
        const scrollSpeedRange = document.getElementById('scrollSpeed');
        const scrollSpeedValue = document.getElementById('scrollSpeedValue');
        scrollSpeedRange.value = this.scrollSpeed;
        scrollSpeedValue.textContent = this.scrollSpeed;
    }
    
    updateReadingLine() {
        const editor = document.getElementById('textEditor');
        const readingLine = document.getElementById('readingLine');
        
        // 计算当前阅读位置
        const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        const totalLines = editor.textContent.split('\n').length;
        const currentLine = Math.floor(scrollRatio * totalLines);
        
        // 高亮当前行
        this.highlightCurrentLine(currentLine);
    }
    
    highlightCurrentLine(lineNumber) {
        // 简化的高亮处理，避免复杂的DOM操作
        const editor = document.getElementById('textEditor');
        const lines = editor.textContent.split('\n');
        
        // 这里可以添加更复杂的高亮逻辑
        // 由于contenteditable的复杂性，暂时保持简单处理
    }
    
    scrollToPosition(ratio) {
        const editor = document.getElementById('textEditor');
        const targetScrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
        
        // 平滑滚动到目标位置
        this.smoothScrollTo(targetScrollTop);
    }
    
    smoothScrollTo(targetPosition) {
        const editor = document.getElementById('textEditor');
        const startPosition = editor.scrollTop;
        const distance = targetPosition - startPosition;
        const duration = 500; // 500ms的滚动动画
        let startTime = null;
        
        const animateScroll = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // 使用缓动函数实现平滑效果
            const easeInOutQuad = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            editor.scrollTop = startPosition + distance * easeInOutQuad;
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                this.updateReadingLine();
                if (window.app && window.app.updateScrollbar) {
                    window.app.updateScrollbar();
                }
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
    
    getScrollProgress() {
        const editor = document.getElementById('textEditor');
        return editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    }
}