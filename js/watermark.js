// 水印控制器
export class WatermarkController {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupWatermarkControls();
    }
    
    setupWatermarkControls() {
        const watermarkEnabled = document.getElementById('watermarkEnabled');
        const watermarkOptions = document.getElementById('watermarkOptions');
        const watermarkText = document.getElementById('watermarkText');
        const watermarkType = document.getElementById('watermarkType');
        
        watermarkEnabled.addEventListener('change', () => {
            if (watermarkEnabled.checked) {
                watermarkOptions.style.display = 'block';
                this.showWatermark();
            } else {
                watermarkOptions.style.display = 'none';
                this.hideWatermark();
            }
            this.saveSettings();
        });
        
        watermarkText.addEventListener('input', () => {
            this.updateWatermark();
            this.saveSettings();
        });
        
        watermarkType.addEventListener('change', () => {
            this.updateWatermark();
            this.saveSettings();
        });
    }
    
    showWatermark() {
        const watermarkLayer = document.getElementById('watermarkLayer');
        watermarkLayer.style.display = 'block';
        this.updateWatermark();
    }
    
    hideWatermark() {
        const watermarkLayer = document.getElementById('watermarkLayer');
        watermarkLayer.style.display = 'none';
        watermarkLayer.innerHTML = '';
    }
    
    updateWatermark() {
        const watermarkEnabled = document.getElementById('watermarkEnabled');
        if (!watermarkEnabled.checked) return;
        
        const watermarkText = document.getElementById('watermarkText').value;
        const watermarkType = document.getElementById('watermarkType').value;
        const watermarkLayer = document.getElementById('watermarkLayer');
        
        if (!watermarkText.trim()) {
            watermarkLayer.innerHTML = '';
            return;
        }
        
        if (watermarkType === 'center') {
            this.createCenterWatermark(watermarkText, watermarkLayer);
        } else {
            this.createDiagonalWatermark(watermarkText, watermarkLayer);
        }
    }
    
    createCenterWatermark(text, container) {
        container.innerHTML = '';
        
        const watermark = document.createElement('div');
        watermark.textContent = text;
        watermark.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 120px;
            font-weight: bold;
            color: rgba(128, 128, 128, 0.1);
            white-space: nowrap;
            pointer-events: none;
            z-index: 50;
            user-select: none;
        `;
        
        container.appendChild(watermark);
    }
    
    createDiagonalWatermark(text, container) {
        container.innerHTML = '';
        
        const containerRect = container.getBoundingClientRect();
        const numRows = Math.ceil(containerRect.height / 150);
        const numCols = Math.ceil(containerRect.width / 300);
        
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const watermark = document.createElement('div');
                watermark.textContent = text;
                watermark.style.cssText = `
                    position: absolute;
                    top: ${row * 150 + 75}px;
                    left: ${col * 300 + 150}px;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 24px;
                    font-weight: normal;
                    color: rgba(128, 128, 128, 0.08);
                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 50;
                    user-select: none;
                `;
                
                container.appendChild(watermark);
            }
        }
    }
    
    saveSettings() {
        if (window.settingsController) {
            window.settingsController.saveSettings();
        }
    }
}