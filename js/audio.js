// 音频控制器
class AudioController {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.audioBlob = null;
        this.audioUrl = null;
        this.recognition = null;
        
        this.init();
    }
    
    init() {
        this.setupRecordingControls();
        this.initializeSpeechRecognition();
    }
    
    setupRecordingControls() {
        const startBtn = document.getElementById('startRecord');
        const stopBtn = document.getElementById('stopRecord');
        const playBtn = document.getElementById('playRecord');
        const audioSyncCheckbox = document.getElementById('audioSync');
        
        startBtn.addEventListener('click', () => {
            this.startRecording();
        });
        
        stopBtn.addEventListener('click', () => {
            this.stopRecording();
        });
        
        playBtn.addEventListener('click', () => {
            this.playRecording();
        });
        
        audioSyncCheckbox.addEventListener('change', () => {
            this.toggleAudioSync(audioSyncCheckbox.checked);
        });
        
        // 音频播放弹窗控制
        this.setupAudioPlayerModal();
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.audioUrl = URL.createObjectURL(this.audioBlob);
                this.updateRecordingControls();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.updateRecordingControls();
            
            // 开始语音识别（如果启用）
            if (document.getElementById('audioSync').checked) {
                this.startSpeechRecognition();
            }
            
        } catch (error) {
            console.error('录音失败:', error);
            alert('无法访问麦克风，请检查权限设置');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            
            // 停止语音识别
            if (this.recognition) {
                this.recognition.stop();
            }
        }
    }
    
    playRecording() {
        if (this.audioUrl) {
            this.showAudioPlayerModal();
        }
    }
    

    
    updateRecordingControls() {
        const startBtn = document.getElementById('startRecord');
        const stopBtn = document.getElementById('stopRecord');
        const playBtn = document.getElementById('playRecord');
        
        if (this.isRecording) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            playBtn.disabled = true;
            startBtn.textContent = '录音中...';
            startBtn.style.background = '#dc3545';
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            startBtn.textContent = '开始录音';
            startBtn.style.background = '#007bff';
            
            if (this.audioUrl) {
                playBtn.disabled = false;
            }
        }
    }
    
    initializeSpeechRecognition() {
        // 检查浏览器支持
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            console.warn('当前浏览器不支持语音识别功能');
            return;
        }
        
        if (this.recognition) {
            this.recognition.lang = 'zh-CN';
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            
            this.recognition.onresult = (event) => {
                this.handleSpeechResult(event);
            };
            
            this.recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
            };
        }
    }
    
    startSpeechRecognition() {
        if (this.recognition) {
            this.recognition.start();
        }
    }
    
    handleSpeechResult(event) {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
            const transcript = result[0].transcript;
            this.syncScrollWithSpeech(transcript);
        }
    }
    
    syncScrollWithSpeech(transcript) {
        // 简化的语音同步逻辑
        const editor = document.getElementById('textEditor');
        const text = editor.textContent;
        
        // 在文本中查找匹配的位置
        const index = text.indexOf(transcript.trim());
        if (index !== -1) {
            // 计算滚动位置
            const beforeText = text.substring(0, index);
            const lines = beforeText.split('\n').length;
            const totalLines = text.split('\n').length;
            const scrollRatio = lines / totalLines;
            
            // 滚动到对应位置
            if (window.scrollController) {
                window.scrollController.scrollToPosition(scrollRatio);
            }
        }
    }
    
    toggleAudioSync(enabled) {
        if (enabled && this.recognition) {
            console.log('音频智能识别滚动已启用');
        } else {
            console.log('音频智能识别滚动已禁用');
        }
    }
    
    setupAudioPlayerModal() {
        const modal = document.getElementById('audioPlayerModal');
        const closeBtn = document.getElementById('closeAudioPlayer');
        const replayBtn = document.getElementById('replayAudio');
        const downloadBtn = document.getElementById('downloadAudio');
        const audio = document.getElementById('audioPlayer');
        
        // 关闭弹窗
        closeBtn.addEventListener('click', () => {
            this.hideAudioPlayerModal();
        });
        
        // 点击背景关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAudioPlayerModal();
            }
        });
        
        // 重新播放
        replayBtn.addEventListener('click', () => {
            audio.currentTime = 0;
            audio.play();
        });
        
        // 下载录音
        downloadBtn.addEventListener('click', () => {
            if (this.audioBlob) {
                const url = URL.createObjectURL(this.audioBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `teleprompter-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        });
        
        // 音频加载完成时更新时长
        audio.addEventListener('loadedmetadata', () => {
            this.updateAudioInfo();
        });
        
        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                this.hideAudioPlayerModal();
            }
        });
    }
    
    showAudioPlayerModal() {
        const modal = document.getElementById('audioPlayerModal');
        const audio = document.getElementById('audioPlayer');
        
        // 设置音频源
        audio.src = this.audioUrl;
        
        // 显示弹窗
        modal.style.display = 'flex';
        
        // 更新音频信息
        this.updateAudioInfo();
    }
    
    hideAudioPlayerModal() {
        const modal = document.getElementById('audioPlayerModal');
        const audio = document.getElementById('audioPlayer');
        
        // 暂停播放
        audio.pause();
        
        // 隐藏弹窗
        modal.style.display = 'none';
    }
    
    updateAudioInfo() {
        const audio = document.getElementById('audioPlayer');
        const fileNameSpan = document.getElementById('audioFileName');
        const durationSpan = document.getElementById('audioDuration');
        
        // 更新文件名
        const now = new Date();
        const fileName = `录音-${now.toLocaleDateString()}-${now.toLocaleTimeString()}`;
        fileNameSpan.textContent = fileName;
        
        // 更新时长
        if (audio.duration && !isNaN(audio.duration)) {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            durationSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            durationSpan.textContent = '--:--';
        }
    }
}