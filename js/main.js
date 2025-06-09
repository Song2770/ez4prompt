// 主应用程序入口
class TeleprompterApp {
    constructor() {
        this.isPlaying = false;
        this.isLocked = false;
        this.currentSettings = this.getDefaultSettings();
        this.scrollController = null;
        this.activePanel = null;
        this.currentLanguage = 'zh-CN';
        this.sidebarHidden = false;
        this.countdownDuration = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDefaultText();
        this.updateTimeDisplay();
        this.initializeScrollbar();
        this.setupSidebarBehavior();
        
        // 每秒更新时间显示
        setInterval(() => this.updateTimeDisplay(), 1000);
        
        // 初始化各个模块
        window.themeController = new ThemeController();
        window.scrollController = new ScrollController();
        window.textController = new TextController();
        window.audioController = new AudioController();
        window.settingsController = new SettingsController();
        window.watermarkController = new WatermarkController();
        window.flipController = new FlipController();
    }
    
    getDefaultSettings() {
        return {
            theme: 'dark',
            fontSize: 16,
            fontFamily: 'SimSun, serif',
            fontColor: '#ffffff',
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
            watermarkType: 'center',
            language: 'zh-CN',
            countdownDuration: 0
        };
    }
    
    setupEventListeners() {
        // 全屏切换
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // 主题切换
        document.getElementById('themeBtn').addEventListener('click', () => {
            window.themeController.toggleTheme();
        });
        
        // 播放/暂停 - 现在包含倒计时功能
        document.getElementById('playBtn').addEventListener('click', () => {
            this.showCountdownSettings();
        });
        
        // 语言切换
        document.getElementById('languageBtn').addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        // 文本锁定
        document.getElementById('lockBtn').addEventListener('click', () => {
            this.toggleTextLock();
        });
        
        // 侧边栏隐藏/显示
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // 设置面板切换
        this.setupSettingsPanels();
        
        // 文件导入
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('fileInput').addEventListener('change', (e) => {
            window.textController.handleFileImport(e);
        });
        
        // 倒计时设置
        document.getElementById('startCountdown').addEventListener('click', () => {
            this.startCountdownAndPlay();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // 滚动检测
        let scrollTimeout;
        document.addEventListener('scroll', () => {
            if (!this.sidebarHidden) {
                document.body.classList.add('scrolling');
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    document.body.classList.remove('scrolling');
                }, 1000);
            }
        });
        
        // 鼠标滚轮事件
        document.addEventListener('wheel', (e) => {
            this.handleMouseWheel(e);
        });
        
        // 点击外部关闭设置面板
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.settings-panel') && !e.target.closest('.sidebar-btn')) {
                this.closeAllPanels();
            }
        });
    }
    
    setupSidebarBehavior() {
        const sidebar = document.getElementById('sidebar');
        const trigger = document.getElementById('sidebarTrigger');
        
        // 鼠标移入按钮显示设置面板
        const buttons = document.querySelectorAll('.sidebar-btn:not(.sidebar-toggle)');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!this.sidebarHidden) {
                    const panelId = this.getPanelIdForButton(btn.id);
                    if (panelId) {
                        this.showSettingsPanel(panelId, btn);
                    }
                }
            });
        });
        
        // 鼠标离开侧边栏区域隐藏面板
        sidebar.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!document.querySelector('.settings-panel:hover')) {
                    this.closeAllPanels();
                }
            }, 100);
        });
        
        // 左侧边缘触发显示
        trigger.addEventListener('mouseenter', () => {
            if (this.sidebarHidden) {
                this.showSidebar();
            }
        });
    }
    
    getPanelIdForButton(buttonId) {
        const mapping = {
            'scrollBtn': 'scrollSettings',
            'fontBtn': 'fontSettings',
            'flipBtn': 'flipSettings',
            'watermarkBtn': 'watermarkSettings',
            'recordBtn': 'recordSettings'
        };
        return mapping[buttonId];
    }
    
    setupSettingsPanels() {
        // 移除点击事件，改为鼠标移入事件
        // 这些事件现在在 setupSidebarBehavior 中处理
    }
    
    showSettingsPanel(panelId, buttonElement) {
        this.closeAllPanels();
        
        const panel = document.getElementById(panelId);
        if (!panel) return;
        
        // 显示面板
        panel.style.display = 'block';
        this.activePanel = panelId;
        
        // 定位面板
        const rect = buttonElement.getBoundingClientRect();
        panel.style.left = `${rect.right + 10}px`;
        panel.style.top = `${rect.top}px`;
        
        // 激活按钮样式
        buttonElement.classList.add('active');
    }
    
    showCountdownSettings() {
        this.closeAllPanels();
        
        const panel = document.getElementById('countdownSettings');
        const playBtn = document.getElementById('playBtn');
        
        panel.style.display = 'block';
        this.activePanel = 'countdownSettings';
        
        // 定位面板
        const rect = playBtn.getBoundingClientRect();
        panel.style.left = `${rect.right + 10}px`;
        panel.style.top = `${rect.top}px`;
        
        playBtn.classList.add('active');
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const trigger = document.getElementById('sidebarTrigger');
        const toggleBtn = document.getElementById('sidebarToggle');
        const toggleIcon = toggleBtn.querySelector('img');
        
        if (this.sidebarHidden) {
            this.showSidebar();
        } else {
            this.hideSidebar();
        }
    }
    
    showSidebar() {
        const sidebar = document.getElementById('sidebar');
        const trigger = document.getElementById('sidebarTrigger');
        const toggleIcon = document.querySelector('#sidebarToggle img');
        
        this.sidebarHidden = false;
        sidebar.classList.remove('hidden');
        trigger.classList.remove('active');
        toggleIcon.src = 'images/chevron-left.svg';
        document.getElementById('sidebarToggle').title = '隐藏功能区';
    }
    
    hideSidebar() {
        const sidebar = document.getElementById('sidebar');
        const trigger = document.getElementById('sidebarTrigger');
        const toggleIcon = document.querySelector('#sidebarToggle img');
        
        this.sidebarHidden = true;
        sidebar.classList.add('hidden');
        trigger.classList.add('active');
        toggleIcon.src = 'images/chevron-right.svg';
        document.getElementById('sidebarToggle').title = '显示功能区';
        this.closeAllPanels();
    }
    
    closeAllPanels() {
        const panels = document.querySelectorAll('.settings-panel');
        const buttons = document.querySelectorAll('.sidebar-btn');
        
        panels.forEach(panel => {
            panel.style.display = 'none';
        });
        
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.activePanel = null;
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                document.body.classList.add('fullscreen');
            });
        } else {
            document.exitFullscreen().then(() => {
                document.body.classList.remove('fullscreen');
            });
        }
    }
    
    toggleLanguage() {
        // 简单的语言切换示例
        if (this.currentLanguage === 'zh-CN') {
            this.currentLanguage = 'en-US';
            this.updateLanguageDisplay('English');
        } else {
            this.currentLanguage = 'zh-CN';
            this.updateLanguageDisplay('中文');
        }
        
        // 保存语言设置
        localStorage.setItem('teleprompter-language', this.currentLanguage);
        
        // 更新语音识别语言
        if (window.audioController && window.audioController.recognition) {
            window.audioController.recognition.lang = this.currentLanguage;
        }
    }
    
    updateLanguageDisplay(languageName) {
        // 可以在这里更新界面语言显示
        console.log(`语言已切换到: ${languageName}`);
        
        // 显示临时提示
        const notification = document.createElement('div');
        notification.textContent = `语言已切换到: ${languageName}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            z-index: 2000;
            animation: fadeInOut 2s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }
    
    startCountdownAndPlay() {
        this.countdownDuration = parseInt(document.getElementById('countdownDuration').value) || 0;
        this.closeAllPanels();
        
        if (this.countdownDuration > 0) {
            this.showCountdown().then(() => {
                this.startReading();
            });
        } else {
            this.startReading();
        }
    }
    
    startReading() {
        this.isPlaying = true;
        this.updatePlayButton();
        
        if (window.scrollController) {
            window.scrollController.startAutoScroll();
        }
        
        if (window.audioController && window.audioController.isRecording) {
            // 音频同步逻辑
        }
    }
    
    pauseReading() {
        this.isPlaying = false;
        this.updatePlayButton();
        
        if (window.scrollController) {
            window.scrollController.stopAutoScroll();
        }
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        const icon = playBtn.querySelector('img');
        
        if (this.isPlaying) {
            icon.src = 'images/pause.svg';
            playBtn.title = '暂停';
        } else {
            icon.src = 'images/play.svg';
            playBtn.title = '播放/暂停';
        }
    }
    
    showCountdown() {
        return new Promise((resolve) => {
            const countdown = document.getElementById('countdownDisplay');
            const text = document.getElementById('countdownText');
            let count = this.countdownDuration;
            
            countdown.style.display = 'flex';
            
            const timer = setInterval(() => {
                text.textContent = count;
                count--;
                
                if (count < 0) {
                    clearInterval(timer);
                    countdown.style.display = 'none';
                    resolve();
                }
            }, 1000);
        });
    }
    
    toggleTextLock() {
        const editor = document.getElementById('textEditor');
        const lockIcon = document.getElementById('lockIcon');
        
        this.isLocked = !this.isLocked;
        
        if (this.isLocked) {
            editor.contentEditable = false;
            editor.classList.add('locked');
            lockIcon.src = 'images/lock.svg';
            document.getElementById('lockBtn').title = '解锁文本';
        } else {
            editor.contentEditable = true;
            editor.classList.remove('locked');
            lockIcon.src = 'images/unlock.svg';
            document.getElementById('lockBtn').title = '锁定文本';
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Esc 键退出全屏
        if (e.key === 'Escape' && document.fullscreenElement) {
            document.exitFullscreen();
        }
        
        // 空格键播放/暂停
        if (e.key === ' ' && !e.target.contentEditable) {
            e.preventDefault();
            if (this.isPlaying) {
                this.pauseReading();
            } else {
                this.startCountdownAndPlay();
            }
        }
        
        // F11 全屏
        if (e.key === 'F11') {
            e.preventDefault();
            this.toggleFullscreen();
        }
    }
    
    handleMouseWheel(e) {
        const editor = document.getElementById('textEditor');
        const delta = e.deltaY;
        
        // 手动滚动不中断自动滚动，但会更新当前位置
        if (window.scrollController && window.scrollController.isAutoScrolling) {
            // 更新自动滚动的当前位置
            window.scrollController.currentScrollPosition = editor.scrollTop + delta;
            editor.scrollTop = window.scrollController.currentScrollPosition;
            
            // 更新滚动条位置
            this.updateScrollbar();
        }
    }
    
    loadDefaultText() {
        fetch('example.txt')
            .then(response => response.text())
            .then(text => {
                window.textController.setText(text);
                this.updateScrollbar();
            })
            .catch(error => {
                console.error('加载默认文本失败:', error);
                window.textController.setText('请导入文本文件或直接编辑此处内容。');
            });
    }
    
    updateTimeDisplay() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('timeDisplay').textContent = timeString;
    }
    
    initializeScrollbar() {
        const editor = document.getElementById('textEditor');
        const scrollbar = document.getElementById('customScrollbar');
        const thumb = document.getElementById('scrollbarThumb');
        
        // 更新滚动条
        const updateScrollbar = () => {
            const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
            const thumbHeight = Math.max(20, (editor.clientHeight / editor.scrollHeight) * scrollbar.clientHeight);
            const thumbTop = scrollRatio * (scrollbar.clientHeight - thumbHeight);
            
            thumb.style.height = `${thumbHeight}px`;
            thumb.style.transform = `translateY(${thumbTop}px)`;
        };
        
        // 监听文本编辑器滚动
        editor.addEventListener('scroll', updateScrollbar);
        
        // 拖拽滚动条
        let isDragging = false;
        
        thumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            const startY = e.clientY;
            const startScrollTop = editor.scrollTop;
            
            const mouseMoveHandler = (e) => {
                if (!isDragging) return;
                
                const deltaY = e.clientY - startY;
                const scrollRatio = deltaY / (scrollbar.clientHeight - thumb.clientHeight);
                const newScrollTop = startScrollTop + scrollRatio * (editor.scrollHeight - editor.clientHeight);
                
                editor.scrollTop = Math.max(0, Math.min(newScrollTop, editor.scrollHeight - editor.clientHeight));
            };
            
            const mouseUpHandler = () => {
                isDragging = false;
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };
            
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
        
        // 点击滚动条跳转
        scrollbar.addEventListener('click', (e) => {
            if (e.target === thumb) return;
            
            const clickRatio = e.offsetY / scrollbar.clientHeight;
            const newScrollTop = clickRatio * (editor.scrollHeight - editor.clientHeight);
            
            // 使用平滑滚动
            if (window.scrollController) {
                window.scrollController.smoothScrollTo(newScrollTop);
            } else {
                editor.scrollTop = newScrollTop;
            }
        });
        
        // 初始更新
        setTimeout(updateScrollbar, 100);
        
        // 保存更新函数到实例
        this.updateScrollbar = updateScrollbar;
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// 应用程序启动
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TeleprompterApp();
});