import { bus } from '../core/EventBus';

export class HUD {
    constructor() {
        this.container = document.createElement('div');
        this.initStyle();
        this.initElements();
        
        document.body.appendChild(this.container);

        // --- MENDENGARKAN EVENT DARI EVENTBUS ---
        // Saat ada sinyal 'speedUpdate', jalankan fungsi updateSpeed
        bus.on('speedUpdate', (speed) => this.updateSpeed(speed));
        
        // Nanti bisa tambah: bus.on('fuelUpdate', ...)
    }

    initStyle() {
        // Container UI di pojok kiri bawah
        this.container.style.position = 'absolute';
        this.container.style.bottom = '20px';
        this.container.style.left = '20px';
        this.container.style.padding = '15px';
        this.container.style.fontFamily = '"Courier New", Courier, monospace'; // Font ala hacker
        this.container.style.color = '#00ffff'; // Warna Cyan Sci-Fi
        this.container.style.border = '2px solid rgba(0, 255, 255, 0.3)';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Hitam transparan
        this.container.style.borderRadius = '10px';
        this.container.style.minWidth = '200px';
        this.container.style.userSelect = 'none'; // Biar gak ke-blok saat nge-drag mouse
    }

    initElements() {
        // 1. Label Kecepatan
        this.speedLabel = document.createElement('div');
        this.speedLabel.innerText = 'SPEED';
        this.speedLabel.style.fontSize = '12px';
        this.speedLabel.style.opacity = '0.7';
        this.container.appendChild(this.speedLabel);

        // 2. Angka Kecepatan Besar
        this.speedValue = document.createElement('div');
        this.speedValue.innerText = '0 km/h';
        this.speedValue.style.fontSize = '32px';
        this.speedValue.style.fontWeight = 'bold';
        this.speedValue.style.textShadow = '0 0 10px #00ffff'; // Efek glowing
        this.container.appendChild(this.speedValue);

        // 3. Bar Visual (Garis Speedometer)
        this.speedBarContainer = document.createElement('div');
        this.speedBarContainer.style.width = '100%';
        this.speedBarContainer.style.height = '6px';
        this.speedBarContainer.style.backgroundColor = '#333';
        this.speedBarContainer.style.marginTop = '5px';
        
        this.speedBarFill = document.createElement('div');
        this.speedBarFill.style.width = '0%';
        this.speedBarFill.style.height = '100%';
        this.speedBarFill.style.backgroundColor = '#00ffff';
        this.speedBarFill.style.transition = 'width 0.1s linear'; // Animasi halus
        
        this.speedBarContainer.appendChild(this.speedBarFill);
        this.container.appendChild(this.speedBarContainer);
    }

    updateSpeed(speed) {
        // Update Teks (Kita kali 1000 biar angkanya terlihat cepat/keren)
        const displaySpeed = Math.floor(speed * 1000); 
        this.speedValue.innerText = `${displaySpeed} km/h`;

        // Update Bar (Asumsi max speed 5.0 = 100%)
        // 5.0 adalah maxSpeed saat boost di ArcadePhysics
        let percentage = (speed / 5.0) * 100;
        if (percentage > 100) percentage = 100;
        
        this.speedBarFill.style.width = `${percentage}%`;
        
        // Ubah warna bar jadi merah kalau ngebut banget (Boost)
        if (percentage > 80) {
            this.speedBarFill.style.backgroundColor = '#ff0000'; // Merah
            this.speedBarFill.style.boxShadow = '0 0 10px #ff0000';
        } else {
            this.speedBarFill.style.backgroundColor = '#00ffff'; // Cyan
            this.speedBarFill.style.boxShadow = 'none';
        }
    }
}