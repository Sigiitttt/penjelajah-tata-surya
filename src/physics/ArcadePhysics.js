import * as THREE from 'three';

export class ArcadePhysics {
    constructor(mesh) {
        this.mesh = mesh;
        
        // Vektor Fisika
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        
        // Setting Rasa Mengemudi (Tuning di sini)
        this.maxSpeed = 2.0;       // Kecepatan maksimum
        this.accelPower = 5.0;     // Kekuatan mesin (Akselerasi)
        this.friction = 0.98;      // Gesekan (0.98 = Licin/Drift, 0.90 = Pakem)
        this.rotationSpeed = 2.5;  // Kecepatan putar
    }

    applyForce(forceVector) {
        // Hukum Newton: F = m * a (Kita abaikan massa dulu, anggap massa = 1)
        this.acceleration.add(forceVector);
    }

    update(delta) {
        // 1. Tambahkan Akselerasi ke Kecepatan
        // Velocity += Acceleration * delta
        this.velocity.addScaledVector(this.acceleration, delta);

        // 2. Batasi Kecepatan (Terminal Velocity) agar tidak terlalu ngebut
        this.velocity.clampLength(0, this.maxSpeed);

        // 3. Aplikasikan Gesekan (Friction/Drag)
        // Kecepatan berkurang perlahan setiap frame (Space Drag)
        this.velocity.multiplyScalar(this.friction);

        // 4. Pindahkan Posisi Objek (Posisi += Velocity)
        this.mesh.position.add(this.velocity); // Disini tidak dikali delta karena velocity sudah kecil/scale

        // 5. Reset Akselerasi (Agar tidak menumpuk selamanya)
        this.acceleration.set(0, 0, 0);
    }
}