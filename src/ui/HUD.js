import { bus } from '../core/EventBus';

export class HUD {
    constructor() {
        this.container = document.createElement('div');
        this.initStyle();
        this.initElements();
        
        document.body.appendChild(this.container);

        // --- MENDENGARKAN EVENT ---
        bus.on('speedUpdate', (speed) => {
            // DEBUG: Cek apakah data masuk ke HUD
            // console.log("HUD Terima Speed:", speed); 
            this.updateSpeed(speed);
        });

        bus.on('locationUpdate', (locName) => this.updateLocation(locName));
    }

    initStyle() {
        // Posisi di KANAN BAWAH agar tidak tertutup setting
        this.container.style.position = 'absolute';
        this.container.style.bottom = '20px';
        this.container.style.right = '20px'; 
        this.container.style.padding = '15px';
        this.container.style.fontFamily = '"Courier New", Courier, monospace'; 
        this.container.style.color = '#00ffff'; 
        this.container.style.border = '2px solid rgba(0, 255, 255, 0.3)';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; 
        this.container.style.borderRadius = '10px';
        this.container.style.minWidth = '200px';
        this.container.style.userSelect = 'none'; 
    }

    initElements() {
        // 1. Label Lokasi
        this.locationLabel = document.createElement('div');
        this.locationLabel.innerText = 'LOC: SYSTEM START';
        this.locationLabel.style.fontSize = '16px';
        this.locationLabel.style.fontWeight = 'bold';
        this.locationLabel.style.color = '#ffcc00'; 
        this.locationLabel.style.marginBottom = '10px';
        this.locationLabel.style.textAlign = 'right';
        this.container.appendChild(this.locationLabel);

        // 2. Label Speed
        this.speedLabel = document.createElement('div');
        this.speedLabel.innerText = 'SPEED';
        this.speedLabel.style.fontSize = '12px';
        this.speedLabel.style.opacity = '0.7';
        this.container.appendChild(this.speedLabel);

        // 3. Angka Speed
        this.speedValue = document.createElement('div');
        this.speedValue.innerText = '0 km/h';
        this.speedValue.style.fontSize = '32px';
        this.speedValue.style.fontWeight = 'bold';
        this.speedValue.style.textShadow = '0 0 10px #00ffff'; 
        this.container.appendChild(this.speedValue);

        // 4. Bar
        this.speedBarContainer = document.createElement('div');
        this.speedBarContainer.style.width = '100%';
        this.speedBarContainer.style.height = '6px';
        this.speedBarContainer.style.backgroundColor = '#333';
        this.speedBarContainer.style.marginTop = '5px';
        
        this.speedBarFill = document.createElement('div');
        this.speedBarFill.style.width = '0%';
        this.speedBarFill.style.height = '100%';
        this.speedBarFill.style.backgroundColor = '#00ffff';
        this.speedBarFill.style.transition = 'width 0.1s linear'; 
        
        this.speedBarContainer.appendChild(this.speedBarFill);
        this.container.appendChild(this.speedBarContainer);
    }

    updateSpeed(speed) {
        // Rumus: Speed asli dikali 1000 agar terlihat besar
        const displaySpeed = Math.floor(speed * 1000); 
        this.speedValue.innerText = `${displaySpeed} km/h`;

        // Bar visual (Max 8.0 = 100%)
        let percentage = (speed / 8.0) * 100;
        if (percentage > 100) percentage = 100;
        
        this.speedBarFill.style.width = `${percentage}%`;
        
        if (percentage > 80) {
            this.speedBarFill.style.backgroundColor = '#ff0000';
            this.speedBarFill.style.boxShadow = '0 0 10px #ff0000';
        } else {
            this.speedBarFill.style.backgroundColor = '#00ffff';
            this.speedBarFill.style.boxShadow = 'none';
        }
    }

    updateLocation(name) {
        if (this.locationLabel.innerText !== `LOC: ${name}`) {
            this.locationLabel.innerText = `LOC: ${name}`;
            this.locationLabel.style.opacity = '0.5';
            setTimeout(() => this.locationLabel.style.opacity = '1', 100);
        }
    }
}