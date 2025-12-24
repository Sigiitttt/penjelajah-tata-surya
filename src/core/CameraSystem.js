import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraSystem {
    constructor(camera, canvas) {
        this.camera = camera;
        
        // Inisialisasi OrbitControls
        this.controls = new OrbitControls(camera, canvas);
        
        // Konfigurasi agar terasa smooth (ada inersia saat berhenti)
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Batas Zoom (Agar tidak tembus objek atau terlalu jauh)
        this.controls.minDistance = 5;
        this.controls.maxDistance = 500;
        
        // Opsional: Matikan Pan (geser kanan-kiri) jika ingin fokus orbit saja
        // this.controls.enablePan = false; 
    }

    // Fungsi ini harus dipanggil di Loop agar damping bekerja
    tick() {
        this.controls.update();
    }
}