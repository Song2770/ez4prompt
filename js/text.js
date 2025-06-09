// 文本控制器
class TextController {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupTextEditor();
    }
    
    setupTextEditor() {
        const editor = document.getElementById('textEditor');
        
        // 监听文本变化
        editor.addEventListener('input', () => {
            this.onTextChange();
        });
        
        // 监听粘贴事件
        editor.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
        
        // 监听拖拽文件
        editor.addEventListener('dragover', (e) => {
            e.preventDefault();
            editor.classList.add('drag-over');
        });
        
        editor.addEventListener('dragleave', () => {
            editor.classList.remove('drag-over');
        });
        
        editor.addEventListener('drop', (e) => {
            e.preventDefault();
            editor.classList.remove('drag-over');
            this.handleFileDrop(e);
        });
        
        // 监听窗口大小变化，保持文本格式
        window.addEventListener('resize', () => {
            this.preserveTextFormat();
        });
    }
    
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.txt')) {
            alert('请选择.txt格式的文本文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            this.setText(text);
        };
        reader.readAsText(file, 'utf-8');
    }
    
    handleFileDrop(event) {
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.toLowerCase().endsWith('.txt')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target.result;
                    this.setText(text);
                };
                reader.readAsText(file, 'utf-8');
            } else {
                alert('请拖拽.txt格式的文本文件');
            }
        }
    }
    
    handlePaste(event) {
        // 处理粘贴的纯文本，保持换行格式
        event.preventDefault();
        const text = (event.clipboardData || window.clipboardData).getData('text');
        
        // 保持原有的换行符
        const formattedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            // 创建文本节点并插入，保持换行
            const lines = formattedText.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (i > 0) {
                    range.insertNode(document.createElement('br'));
                }
                if (lines[i]) {
                    range.insertNode(document.createTextNode(lines[i]));
                }
            }
            
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        this.onTextChange();
    }
    
    setText(text) {
        const editor = document.getElementById('textEditor');
        // 保持换行格式
        const formattedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = formattedText.split('\n');
        
        editor.innerHTML = '';
        for (let i = 0; i < lines.length; i++) {
            if (i > 0) {
                editor.appendChild(document.createElement('br'));
            }
            if (lines[i]) {
                editor.appendChild(document.createTextNode(lines[i]));
            }
        }
        
        this.onTextChange();
    }
    
    getText() {
        const editor = document.getElementById('textEditor');
        return editor.innerText || editor.textContent;
    }
    
    preserveTextFormat() {
        // 在窗口大小变化时保持文本格式
        const editor = document.getElementById('textEditor');
        const currentText = this.getText();
        
        // 重新设置文本以保持格式
        setTimeout(() => {
            this.setText(currentText);
        }, 100);
    }
    
    onTextChange() {
        // 更新滚动条
        if (window.app && window.app.updateScrollbar) {
            setTimeout(() => window.app.updateScrollbar(), 100);
        }
        
        // 如果启用了自动计算时长，重新计算
        if (window.scrollController && window.scrollController.autoCalculateDuration) {
            window.scrollController.calculateOptimalSpeed();
        }
        
        // 保存到本地存储
        this.saveToLocalStorage();
    }
    
    saveToLocalStorage() {
        const text = this.getText();
        localStorage.setItem('teleprompter-text', text);
    }
    
    loadFromLocalStorage() {
        const savedText = localStorage.getItem('teleprompter-text');
        if (savedText) {
            this.setText(savedText);
            return true;
        }
        return false;
    }
    
    exportText() {
        const text = this.getText();
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `teleprompter-text-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    clearText() {
        if (confirm('确定要清空所有文本吗？')) {
            this.setText('');
        }
    }
    
    insertAtCursor(text) {
        const editor = document.getElementById('textEditor');
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            range.collapse(false);
        } else {
            editor.appendChild(document.createTextNode(text));
        }
        
        this.onTextChange();
    }
    
    getWordCount() {
        const text = this.getText();
        return {
            characters: text.length,
            charactersNoSpaces: text.replace(/\s/g, '').length,
            words: text.trim().split(/\s+/).filter(word => word.length > 0).length,
            lines: text.split('\n').length,
            paragraphs: text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length
        };
    }
}