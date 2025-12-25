import { InputHandler } from './InputHandler';

export class ModeManager {
    /**
     * @param {Engine} engine - Agar bisa akses cameraSystem
     * @param {ChaseCamera} chaseCamera - Kamera pilot
     */
    constructor(engine, chaseCamera) {
        this.engine = engine;
        this.chaseCamera = chaseCamera;
        this.input = new InputHandler(); // Butuh input buat deteksi tombol 'C'
        
        this.mode = 'ORBIT'; // Mulai dari orbit
        
        // Debounce agar sekali tekan tidak gonta-ganti mode 100x per detik
        this.lastPress = 0; 
    }

    tick() {
        // Cek tombol 'C' (Camera)
        if (this.input.isDown('KeyC')) {
            const now = Date.now();
            if (now - this.lastPress > 500) { // Delay 0.5 detik antar switch
                this.toggleMode();
                this.lastPress = now;
            }
        }
    }

    toggleMode() {
        if (this.mode === 'ORBIT') {
            this.setCockpitMode();
        } else {
            this.setOrbitMode();
        }
    }

    setCockpitMode() {
        console.log("Switching to COCKPIT MODE");
        this.mode = 'COCKPIT';

        // 1. Matikan OrbitControls (Kamera bebas mati)
        // Kita akses controls di dalam cameraSystem
        if (this.engine.cameraSystem && this.engine.cameraSystem.controls) {
            this.engine.cameraSystem.controls.enabled = false;
        }

        // 2. Nyalakan Chase Camera
        this.chaseCamera.enabled = true;
        
        // 3. (Opsional) Set posisi awal Chase Camera ke posisi kamera saat ini biar smooth (nanti di-lerp)
        this.chaseCamera.currentPosition.copy(this.engine.camera.position);
    }

    setOrbitMode() {
        console.log("Switching to ORBIT MODE");
        this.mode = 'ORBIT';

        // 1. Nyalakan OrbitControls
        if (this.engine.cameraSystem && this.engine.cameraSystem.controls) {
            this.engine.cameraSystem.controls.enabled = true;
        }

        // 2. Matikan Chase Camera
        this.chaseCamera.enabled = false;
    }
}