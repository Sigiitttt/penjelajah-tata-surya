export class Crosshair {
    constructor() {
        this.element = document.createElement('div');
        this.initStyle();
        document.body.appendChild(this.element);
        this.hide(); // Default sembunyi (muncul saat mode Cockpit)
    }

    initStyle() {
        // Style agar titik ada tepat di tengah layar
        this.element.style.position = 'absolute';
        this.element.style.top = '50%';
        this.element.style.left = '50%';
        this.element.style.width = '20px';
        this.element.style.height = '20px';
        this.element.style.transform = 'translate(-50%, -50%)';
        this.element.style.pointerEvents = 'none'; // Agar tembus klik mouse
        
        // Gambar Crosshair sederhana (+) menggunakan CSS border
        // Anda bisa ganti dengan gambar PNG jika mau
        this.element.style.border = '2px solid rgba(0, 255, 255, 0.8)'; // Cyan
        this.element.style.borderRadius = '50%'; // Lingkaran
        
        // Titik tengah kecil
        const dot = document.createElement('div');
        dot.style.position = 'absolute';
        dot.style.top = '50%';
        dot.style.left = '50%';
        dot.style.width = '4px';
        dot.style.height = '4px';
        dot.style.background = 'white';
        dot.style.transform = 'translate(-50%, -50%)';
        dot.style.borderRadius = '50%';
        
        this.element.appendChild(dot);
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }
}