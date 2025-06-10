export class DraggableLine {
    constructor() {
        this.readingLine = document.getElementById('readingLine');
        this.isDragging = false;
        this.startY = 0;
        this.startTop = 0;
        this.defaultPosition = 25; // 默认位置25%
        
        this.init();
    }
    
    init() {
        if (!this.readingLine) return;
        
        // 绑定事件
        this.readingLine.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // 触摸事件支持
        this.readingLine.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // 双击重置位置
        this.readingLine.addEventListener('dblclick', this.resetPosition.bind(this));
    }
    
    onMouseDown(e) {
        e.preventDefault();
        this.startDrag(e.clientY);
    }
    
    onTouchStart(e) {
        e.preventDefault();
        this.startDrag(e.touches[0].clientY);
    }
    
    startDrag(clientY) {
        this.isDragging = true;
        this.startY = clientY;
        
        // 获取当前top值（百分比）
        const computedStyle = window.getComputedStyle(this.readingLine);
        const currentTop = computedStyle.top;
        if (currentTop.includes('%')) {
            this.startTop = parseFloat(currentTop);
        } else {
            // 如果是像素值，转换为百分比
            const topPx = parseFloat(currentTop);
            this.startTop = (topPx / window.innerHeight) * 100;
        }
        
        this.readingLine.classList.add('dragging');
        document.body.style.userSelect = 'none';
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        this.updatePosition(e.clientY);
    }
    
    onTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.updatePosition(e.touches[0].clientY);
    }
    
    updatePosition(clientY) {
        const deltaY = clientY - this.startY;
        const deltaPercent = (deltaY / window.innerHeight) * 100;
        let newTop = this.startTop + deltaPercent;
        
        // 限制范围在5%到95%之间
        newTop = Math.max(5, Math.min(95, newTop));
        
        this.readingLine.style.top = newTop + '%';
    }
    
    onMouseUp() {
        this.endDrag();
    }
    
    onTouchEnd() {
        this.endDrag();
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.readingLine.classList.remove('dragging');
        document.body.style.userSelect = '';
        
        // 保存当前位置
        this.savePosition();
    }
    
    resetPosition() {
        this.readingLine.style.top = this.defaultPosition + '%';
        this.savePosition();
    }
    
    savePosition() {
        // 保存位置到localStorage
        const currentTop = window.getComputedStyle(this.readingLine).top;
        let topPercent;
        if (currentTop.includes('%')) {
            topPercent = parseFloat(currentTop);
        } else {
            const topPx = parseFloat(currentTop);
            topPercent = (topPx / window.innerHeight) * 100;
        }
        localStorage.setItem('readingLinePosition', topPercent.toString());
    }
    
    loadPosition() {
        // 从localStorage加载位置
        const savedPosition = localStorage.getItem('readingLinePosition');
        if (savedPosition) {
            const position = parseFloat(savedPosition);
            if (position >= 5 && position <= 95) {
                this.readingLine.style.top = position + '%';
                return;
            }
        }
        // 如果没有保存的位置或位置无效，使用默认位置
        this.readingLine.style.top = this.defaultPosition + '%';
    }
    
    getCurrentPosition() {
        const currentTop = window.getComputedStyle(this.readingLine).top;
        if (currentTop.includes('%')) {
            return parseFloat(currentTop);
        } else {
            const topPx = parseFloat(currentTop);
            return (topPx / window.innerHeight) * 100;
        }
    }
}

// 模块已在main.js中统一初始化