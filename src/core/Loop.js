import * as THREE from 'three';

export class Loop {
    constructor(camera, scene, renderer, composer = null) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.composer = composer; // Simpan composer
        this.updatables = []; 
        this.clock = new THREE.Clock();
        this.timeController = null;
    }

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
        const rawDelta = this.clock.getDelta();
        const speedMultiplier = this.timeController ? this.timeController.getSpeed() : 1;
        const simDelta = rawDelta * speedMultiplier;

        for (const object of this.updatables) {
            if (object.tick) {
                object.tick(simDelta); 
            }
        }

        // --- [BAGIAN KRUSIAL] ---
        // Jika Bloom aktif (composer ada), render pakai composer
        if (this.composer) {
            this.composer.render();
        } else {
            // Jika tidak, render biasa
            this.renderer.render(this.scene, this.camera);
        }
    }
}