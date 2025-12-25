import * as THREE from 'three';

export class ChaseCamera {
    constructor(camera, shipMesh) {
        this.camera = camera;
        this.shipMesh = shipMesh;
        this.enabled = false; // Default mati (Mode Orbit dulu)

        // Vektor posisi ideal (Jarak kamera relatif terhadap pesawat)
        // (0, 5, 15) artinya: Tepat di tengah, 5 unit di atas, 15 unit di belakang
        this.offset = new THREE.Vector3(0, 5, 25); 
        
        // Vektor target pandangan (Kamera melihat ke arah mana)
        // (0, 0, -20) artinya: Melihat ke depan pesawat sejauh 20 unit
        this.lookAtOffset = new THREE.Vector3(0, 0, -20);

        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
    }

    tick(delta) {
        if (!this.enabled) return;

        // 1. Hitung Posisi Ideal (Di belakang pesawat saat ini)
        const idealPosition = this.offset.clone();
        idealPosition.applyQuaternion(this.shipMesh.quaternion); // Putar sesuai rotasi pesawat
        idealPosition.add(this.shipMesh.position); // Tempel ke posisi pesawat

        // 2. Hitung Target Pandangan Ideal (Ke depan pesawat)
        const idealLookAt = this.lookAtOffset.clone();
        idealLookAt.applyQuaternion(this.shipMesh.quaternion);
        idealLookAt.add(this.shipMesh.position);

        // 3. Gerakkan Kamera secara Halus (Lerp)
        // Angka 2.0 dan 3.0 adalah kecepatan kamera mengejar (semakin kecil semakin lambat/berat)
        const t = 1.0 - Math.pow(0.05, delta); // Rumus damping independen frame-rate

        this.currentPosition.lerp(idealPosition, t * 2.0);
        this.currentLookAt.lerp(idealLookAt, t * 3.0);

        // 4. Update Posisi Kamera Asli
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }
}