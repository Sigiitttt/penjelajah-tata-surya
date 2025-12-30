export class TimeController {
    constructor() {
        this.timeScale = 1; // Default: 1x Speed
        this.savedScale = 1;
        this.isPaused = false;
        
        this.slider = null;
        this.label = null;

        this.createUI();
        this.setupKeyboard();
    }

    createUI() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.color = '#00ff00'; 
        container.style.fontFamily = 'monospace';
        container.style.fontWeight = 'bold';
        container.style.zIndex = '1000';
        container.style.padding = '15px';
        container.style.background = 'rgba(0, 0, 0, 0.8)';
        container.style.border = '1px solid #00ff00';
        container.style.borderRadius = '8px';

        this.label = document.createElement('div');
        this.label.innerText = 'TIME WARP: 1.0x';
        this.label.style.marginBottom = '10px';
        
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.min = '0';
        this.slider.max = '2000'; 
        this.slider.step = '0.1'; 
        this.slider.value = '1';
        this.slider.style.width = '200px';
        this.slider.style.cursor = 'pointer';

        const helpText = document.createElement('div');
        helpText.style.fontSize = '10px';
        helpText.style.marginTop = '5px';
        helpText.style.color = '#aaa';
        helpText.innerText = "[T]: PAUSE | [R]: RESET 1x";

        this.slider.addEventListener('input', (e) => {
            this.timeScale = parseFloat(e.target.value);
            this.updateLabel();
            if (this.timeScale > 0) this.isPaused = false;
        });

        container.appendChild(this.label);
        container.appendChild(this.slider);
        container.appendChild(helpText);
        document.body.appendChild(container);
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyT') this.togglePause();
            if (e.code === 'KeyR') this.resetTime();
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.savedScale = (this.timeScale === 0) ? 1 : this.timeScale;
            this.timeScale = 0;
        } else {
            this.timeScale = this.savedScale;
        }
        this.syncUI();
    }

    resetTime() {
        this.isPaused = false;
        this.timeScale = 1.0;
        this.syncUI();
    }

    syncUI() {
        if (this.slider) this.slider.value = this.timeScale;
        this.updateLabel();
    }

    updateLabel() {
        if (!this.label) return;
        if (this.timeScale === 0) {
            this.label.innerText = "TIME WARP: PAUSED ⏸️";
            this.label.style.color = 'red';
        } else {
            this.label.innerText = `TIME WARP: ${this.timeScale.toFixed(1)}x ▶️`;
            this.label.style.color = '#00ff00';
        }
    }

    getDelta(delta) {
        return delta * this.timeScale;
    }

    // --- [FIX: INI YANG HILANG TADI] ---
    // Menambahkan kembali getSpeed() agar Loop.js tidak error
    getSpeed() {
        return this.timeScale;
    }
}