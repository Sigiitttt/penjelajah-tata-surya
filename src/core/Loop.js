import * as THREE from 'three';

export class Loop {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.updatables = []; 
        this.clock = new THREE.Clock();
        this.timeController = null; // [BARU] Slot untuk controller
    }

    // [BARU] Fungsi untuk memasang controller
    setTimeController(controller) {
        this.timeController = controller;
    }

    start() {
        this.renderer.setAnimationLoop(() => {
            this.tick();
        });
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }

    tick() {
        // Ambil delta time (waktu normal antar frame, misal 0.016 detik)
        const rawDelta = this.clock.getDelta();

        // [BARU] Ambil multiplier dari slider (kalau belum ada, default 1)
        const speedMultiplier = this.timeController ? this.timeController.getSpeed() : 1;

        // [BARU] Kalikan delta dengan speed
        const simDelta = rawDelta * speedMultiplier;

        // Kirim waktu yang sudah dipercepat ke semua objek (Planet)
        for (const object of this.updatables) {
            // Pastikan objek punya method tick sebelum dipanggil
            if (object.tick) {
                object.tick(simDelta); 
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}