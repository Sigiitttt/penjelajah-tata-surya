import { InputHandler } from './InputHandler';
import { Crosshair } from '../ui/Crosshair';

export class ModeManager {
    constructor(engine, chaseCamera) {
        this.engine = engine;
        this.chaseCamera = chaseCamera;
        this.input = new InputHandler();
        this.crosshair = new Crosshair(); 
        
        // Kita ubah string mode jadi integer state biar gampang siklusnya
        // 0: ORBIT
        // 1: TPS (Third Person)
        // 2: FPS (Cockpit)
        this.modeState = 0; 
        
        this.lastPress = 0; 
    }

    tick() {
        if (this.input.isDown('KeyC')) {
            const now = Date.now();
            if (now - this.lastPress > 300) { // Delay 0.3 detik
                this.cycleMode();
                this.lastPress = now;
            }
        }
    }

    cycleMode() {
        this.modeState++;
        if (this.modeState > 2) this.modeState = 0; // Reset ke 0 jika lebih dari 2

        switch (this.modeState) {
            case 0: // ORBIT
                console.log("Mode: ORBIT");
                // Enable Orbit Controls
                if (this.engine.cameraSystem.controls) this.engine.cameraSystem.controls.enabled = true;
                // Disable Chase Camera
                this.chaseCamera.enabled = false;
                this.crosshair.hide();
                break;

            case 1: // TPS (Belakang)
                console.log("Mode: THIRD PERSON");
                // Disable Orbit
                if (this.engine.cameraSystem.controls) this.engine.cameraSystem.controls.enabled = false;
                // Enable Chase Camera & Set TPS
                this.chaseCamera.enabled = true;
                this.chaseCamera.setFirstPerson(false); // Mode TPS
                this.chaseCamera.currentPosition.copy(this.engine.camera.position); // Biar smooth transisinya
                this.crosshair.show();
                break;

            case 2: // FPS (Kokpit)
                console.log("Mode: COCKPIT");
                // Disable Orbit
                if (this.engine.cameraSystem.controls) this.engine.cameraSystem.controls.enabled = false;
                // Enable Chase Camera & Set FPS
                this.chaseCamera.enabled = true;
                this.chaseCamera.setFirstPerson(true); // Mode FPS
                this.crosshair.show(); // Crosshair tetap nyala
                break;
        }
    }
}