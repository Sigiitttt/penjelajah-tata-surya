import * as THREE from 'three';
import { ArcadePhysics } from '../../physics/ArcadePhysics';
import { InputHandler } from '../../core/InputHandler';

export class Ship {
    constructor() {
        // 1. Buat Model Sederhana (Placeholder Pesawat)
        // Bentuk Kerucut gepeng agar mirip pesawat tempur
        const geometry = new THREE.ConeGeometry(5, 20, 32);
        geometry.rotateX(Math.PI / 2); // Putar agar moncong menghadap depan (Z-negative)
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xff0000, // Merah biar kelihatan
            roughness: 0.4,
            metalness: 0.8
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0, 100); // Mulai agak jauh dari matahari (dekat Bumi)

        // 2. Pasang Sistem Input & Fisika
        this.input = new InputHandler();
        this.physics = new ArcadePhysics(this.mesh);
    }

    getMesh() {
        return this.mesh;
    }

    tick(delta) {
        // --- LOGIKA INPUT (WASD) ---
        
        // Rotasi (A / D)
        if (this.input.isDown('KeyA')) {
            this.mesh.rotation.y += this.physics.rotationSpeed * delta;
        }
        if (this.input.isDown('KeyD')) {
            this.mesh.rotation.y -= this.physics.rotationSpeed * delta;
        }

        // Maju (W) / Mundur (S)
        if (this.input.isDown('KeyW')) {
            // Hitung arah depan pesawat
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
            // Dorong pesawat ke arah depan
            this.physics.applyForce(forward.multiplyScalar(this.physics.accelPower * delta));
        }
        if (this.input.isDown('KeyS')) {
            const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
            this.physics.applyForce(backward.multiplyScalar(this.physics.accelPower * delta));
        }

        // Boost (Shift) - Kecepatan Ganda
        if (this.input.isDown('ShiftLeft')) {
            this.physics.maxSpeed = 5.0; // Ngebut
        } else {
            this.physics.maxSpeed = 2.0; // Normal
        }

        // Rem Spasi (Space) - Friction Tinggi
        if (this.input.isDown('Space')) {
            this.physics.friction = 0.90; // Cepat berhenti
        } else {
            this.physics.friction = 0.98; // Licin (Drift mode)
        }

        // Update Fisika
        this.physics.update(delta);
    }
}