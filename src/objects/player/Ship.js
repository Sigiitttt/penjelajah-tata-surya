import * as THREE from 'three';
import { ArcadePhysics } from '../../physics/ArcadePhysics';
import { InputHandler } from '../../core/InputHandler';
import { WORLD_BOUNDARY } from '../../utils/Constants';
import { Exhaust } from './Exhaust';

export class Ship {
    // [PERBAIKAN 1] Constructor harus menerima 'scene'
    constructor(scene) {
        // 1. Setup Model (Kerucut Sederhana)
        const geometry = new THREE.ConeGeometry(0.5, 2, 8);
        geometry.rotateX(Math.PI / 2); 
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            roughness: 0.4,
            metalness: 0.8
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0, 100); 

        // 2. Setup Sistem
        this.input = new InputHandler();
        this.physics = new ArcadePhysics(this.mesh);
        this.isOutOfBounds = false;

        // [PERBAIKAN 2] Kirim scene ke Exhaust
        this.exhaust = new Exhaust(scene);
    }

    getMesh() {
        return this.mesh;
    }

    tick(delta) {
        // --- 1. CEK BATAS DUNIA ---
        const distanceFromCenter = this.mesh.position.length();

        if (distanceFromCenter > WORLD_BOUNDARY) {
            this.isOutOfBounds = true;
            const directionToCenter = this.mesh.position.clone().normalize().negate();
            const pushBackForce = (distanceFromCenter - WORLD_BOUNDARY) * 0.5;
            
            this.physics.applyForce(directionToCenter.multiplyScalar(pushBackForce * delta));
            this.physics.velocity.multiplyScalar(0.95); // Rem otomatis
        } else {
            this.isOutOfBounds = false;
        }

        // --- 2. UPDATE JEJAK MESIN (EXHAUST) ---
        // Update partikel yang sudah hidup (agar mengecil/hilang)
        this.exhaust.tick(delta);

        // --- 3. INPUT CONTROL ---
        
        // Rotasi (A / D)
        if (this.input.isDown('KeyA')) {
            this.mesh.rotation.y += this.physics.rotationSpeed * delta;
        }
        if (this.input.isDown('KeyD')) {
            this.mesh.rotation.y -= this.physics.rotationSpeed * delta;
        }

        // Maju (W) & Spawn Jejak
        if (this.input.isDown('KeyW')) {
            // A. Fisika Maju
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
            this.physics.applyForce(forward.multiplyScalar(this.physics.accelPower * delta));

            // B. [PERBAIKAN 3] Spawn Partikel Jejak
            const isBoosting = this.input.isDown('ShiftLeft');
            
            // Hitung posisi pantat pesawat (mundur dikit di sumbu Z lokal)
            const enginePos = new THREE.Vector3(0, 0, 1.2)
                .applyQuaternion(this.mesh.quaternion)
                .add(this.mesh.position);
            
            this.exhaust.spawn(enginePos, isBoosting);
        }

        // Mundur (S)
        if (this.input.isDown('KeyS')) {
            const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
            this.physics.applyForce(backward.multiplyScalar(this.physics.accelPower * delta));
        }

        // Boost (Shift)
        if (this.input.isDown('ShiftLeft')) {
            this.physics.maxSpeed = 5.0; 
        } else {
            this.physics.maxSpeed = 2.0; 
        }

        // Rem (Space)
        if (this.input.isDown('Space')) {
            this.physics.friction = 0.90; 
        } else {
            this.physics.friction = 0.98; 
        }

        // Update Fisika Terakhir
        this.physics.update(delta);
    }
}