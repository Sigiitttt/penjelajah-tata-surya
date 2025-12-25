import * as THREE from 'three';
import { bus } from './EventBus';

export class InteractionManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Bind event agar 'this' tetap mengacu ke class
        this.onClickHandler = this.onClick.bind(this);
        
        window.addEventListener('click', this.onClickHandler);
        
        // Support Touchscreen (HP)
        window.addEventListener('touchstart', (event) => {
            // Prevent default agar tidak dianggap scroll/zoom
            // event.preventDefault(); 
            const touch = event.changedTouches[0];
            // Simulasi struct event mouse
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            this.onClickHandler(fakeEvent);
        }, { passive: false });
    }

    onClick(event) {
        // 1. Konversi Mouse ke Normal Device Coordinates (-1 s/d +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 2. Tembakkan Sinar
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 3. Cek Tabrakan
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            // Ambil objek paling depan yang tertabrak
            const firstHitObject = intersects[0].object;

            // [LOGIKA PINTAR: TRAVERSE UP]
            // Jika yang kena adalah Awan/Atmosfer, kita naik ke Parent-nya
            // Loop sampai ketemu objek yang punya userData type 'PLANET' atau 'STAR'
            
            let currentObj = firstHitObject;
            let foundData = null;

            // Cari ke atas (Parent) maksimal 5 tingkat biar gak infinite loop
            let depth = 0;
            while(currentObj && depth < 5) {
                if (currentObj.userData && (currentObj.userData.type === 'PLANET' || currentObj.userData.type === 'STAR')) {
                    foundData = currentObj.userData;
                    break; // KETEMU!
                }
                currentObj = currentObj.parent;
                depth++;
            }

            if (foundData) {
                console.log("👆 Raycaster Kena:", foundData.name);
                bus.emit('objectClicked', foundData);
            } else {
                console.log("❌ Kena objek kosong (Bintang/Space)");
            }
        }
    }
    
    // Cleanup jika scene dihancurkan (opsional, good practice)
    dispose() {
        window.removeEventListener('click', this.onClickHandler);
    }
}