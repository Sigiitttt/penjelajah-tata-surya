export class TimeController {
    constructor() {
        this.timeScale = 1; // Default: 1 detik game = 1 detik asli
        this.createUI();
    }

    createUI() {
        // 1. Buat Container UI
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.color = 'white';
        container.style.fontFamily = 'sans-serif';
        container.style.zIndex = '1000'; // Pastikan di atas canvas
        container.style.padding = '10px';
        container.style.background = 'rgba(0, 0, 0, 0.5)';
        container.style.borderRadius = '8px';

        // 2. Label
        const label = document.createElement('div');
        label.innerText = 'Kecepatan Waktu: 1x';
        label.style.marginBottom = '5px';
        
        // 3. Slider (Range Input)
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '2000'; // Maksimal 2000x lebih cepat
        slider.value = '1';
        slider.style.width = '200px';
        slider.style.cursor = 'pointer';

        // 4. Event Listener (Saat slider digeser)
        slider.addEventListener('input', (e) => {
            this.timeScale = parseFloat(e.target.value);
            label.innerText = `Kecepatan Waktu: ${this.timeScale}x`;
        });

        // Gabungkan dan pasang ke layar
        container.appendChild(label);
        container.appendChild(slider);
        document.body.appendChild(container);
    }

    // Fungsi untuk mengambil nilai speed saat ini
    getSpeed() {
        return this.timeScale;
    }
}