import * as THREE from 'three';

export class ChaseCamera {
    constructor(camera, shipMesh) {
        this.camera = camera;
        this.shipMesh = shipMesh;
        this.enabled = false; 

        // 1. Mode Terbang (TPS) - Di belakang
        this.offsetTPS = new THREE.Vector3(0, 1.2, 5.0); 
        this.lookAtTPS = new THREE.Vector3(0, 0, -20);

        // 2. Mode Kokpit (FPS) - Di depan
        this.offsetFPS = new THREE.Vector3(0, 0.2, -0.2); 
        this.lookAtFPS = new THREE.Vector3(0, 0, -50); 

        // 3. [BARU] Mode Mendarat (Cinematic Parking)
        // Posisi: Di samping kanan (X: 3), agak rendah (Y: 0.5), dan agak depan (Z: -2)
        // Kesan: Seperti Anda turun dari pesawat dan melihatnya dari tanah.
        this.offsetLanded = new THREE.Vector3(3.0, 0.5, 2.0); 
        this.lookAtLanded = new THREE.Vector3(0, 0.5, 0); // Fokus ke tengah badan pesawat

        // Default
        this.currentOffsetTarget = this.offsetTPS;
        this.currentLookAtTarget = this.lookAtTPS;

        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        
        this.isCockpitMode = false;
        
        // Init
        this.currentPosition.copy(shipMesh.position).add(this.offsetTPS);
        this.currentLookAt.copy(shipMesh.position).add(this.lookAtTPS);
    }

    setFirstPerson(isFirstPerson) {
        this.isCockpitMode = isFirstPerson;
        // Kita handle logic target di tick() saja biar dinamis
    }

    tick(delta) {
        if (!this.enabled) return;

        // Sync Orientasi
        this.camera.up.copy(this.shipMesh.up);

        // --- LOGIKA PEMILIHAN KAMERA ---
        
        // Cek apakah pesawat sedang Mendarat? (Baca data dari Ship.js tadi)
        const isLanded = this.shipMesh.userData.isLanded;

        let targetOffset, targetLookAt;

        if (isLanded) {
            // [MODE MENDARAT]
            // Gunakan sudut pandang sinematik samping
            targetOffset = this.offsetLanded;
            targetLookAt = this.lookAtLanded;
        } else if (this.isCockpitMode) {
            // [MODE KOKPIT]
            targetOffset = this.offsetFPS;
            targetLookAt = this.lookAtFPS;
        } else {
            // [MODE TERBANG BIASA]
            targetOffset = this.offsetTPS;
            targetLookAt = this.lookAtTPS;
        }

        // --- HITUNG POSISI ---

        const idealPosition = targetOffset.clone();
        idealPosition.applyQuaternion(this.shipMesh.quaternion);
        idealPosition.add(this.shipMesh.position);

        const idealLookAt = targetLookAt.clone();
        idealLookAt.applyQuaternion(this.shipMesh.quaternion);
        idealLookAt.add(this.shipMesh.position);

        // --- PERGERAKAN HALUS (LERP) ---
        
        // Saat mendarat, kita buat kamera bergerak pelan (Cinematic Slow Pan)
        // Saat terbang/kokpit, gerak cepat (Responsif)
        const stiffness = isLanded ? 2.0 : (this.isCockpitMode ? 20.0 : 15.0);
        
        const t = 1.0 - Math.exp(-stiffness * delta);

        this.currentPosition.lerp(idealPosition, t);
        this.currentLookAt.lerp(idealLookAt, t);

        // Apply
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }
}