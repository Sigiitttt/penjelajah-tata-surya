import { bus } from '../core/EventBus';

export class InfoPanel {
    constructor() {
        this.container = document.createElement('div');
        this.initStyle();
        document.body.appendChild(this.container);

        // Listen event dari InteractionManager
        bus.on('objectClicked', (data) => this.show(data));
    }

    initStyle() {
        // Panel Samping Kanan (Awalnya sembunyi di luar layar / translate X)
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.right = '0';
        this.container.style.width = '300px';
        this.container.style.height = '100%';
        this.container.style.backgroundColor = 'rgba(10, 20, 40, 0.95)'; // Biru Gelap
        this.container.style.borderLeft = '2px solid #00ffff';
        this.container.style.padding = '20px';
        this.container.style.boxSizing = 'border-box';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.transform = 'translateX(100%)'; // Sembunyi ke kanan
        this.container.style.transition = 'transform 0.3s ease-in-out'; // Animasi slide
        this.container.style.zIndex = '1000'; // Di atas segalanya
    }

    show(data) {
        // Isi konten HTML berdasarkan data JSON
        this.container.innerHTML = `
            <button id="closeBtn" style="float: right; background: none; border: none; color: red; font-size: 20px; cursor: pointer;">X</button>
            <h1 style="color: #00ffff; margin-top: 0;">${data.name.toUpperCase()}</h1>
            <p style="font-style: italic; opacity: 0.8;">${data.description}</p>
            <hr style="border-color: #00ffff; opacity: 0.3;">
            
            <div style="margin-top: 20px;">
                <p><strong>Radius:</strong> ${data.details.radiusKm} km</p>
                <p><strong>Orbit Period:</strong> ${data.details.orbitPeriodDays} days</p>
                <p><strong>Distance:</strong> ${data.details.distanceFromSunKm / 1000000} M km</p>
            </div>

            <div style="margin-top: 30px; background: rgba(0,255,255,0.1); padding: 10px; border-radius: 5px;">
                <small>CLASSIFICATION:</small><br>
                <strong style="color: #00ff00;">${data.type}</strong>
            </div>
        `;

        // Tampilkan Panel
        this.container.style.transform = 'translateX(0%)';

        // Fungsikan tombol close
        document.getElementById('closeBtn').onclick = () => this.hide();
    }

    hide() {
        this.container.style.transform = 'translateX(100%)';
    }
}