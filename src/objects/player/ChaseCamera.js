import * as THREE from 'three';

export class ChaseCamera {
    constructor(camera, shipMesh) {
        this.camera = camera;
        this.shipMesh = shipMesh;
        this.enabled = false; 

        // Settingan TPS (Belakang)
        this.offsetTPS = new THREE.Vector3(0, 5, 25); 
        this.lookAtTPS = new THREE.Vector3(0, 0, -20);

        // Settingan FPS (Kokpit) - Posisi di depan/hidung
        // Sesuaikan 'z' dan 'y' agar pas di "kaca" pesawat
        this.offsetFPS = new THREE.Vector3(0, 1, -2); 
        this.lookAtFPS = new THREE.Vector3(0, 0, -100); // Lihat jauh ke depan

        // Default mulai di TPS
        this.currentOffsetTarget = this.offsetTPS;
        this.currentLookAtTarget = this.lookAtTPS;

        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        
        this.isCockpitMode = false;
    }

    // Method untuk ganti mode view
    setFirstPerson(isFirstPerson) {
        this.isCockpitMode = isFirstPerson;
        if (isFirstPerson) {
            this.currentOffsetTarget = this.offsetFPS;
            this.currentLookAtTarget = this.lookAtFPS;
        } else {
            this.currentOffsetTarget = this.offsetTPS;
            this.currentLookAtTarget = this.lookAtTPS;
        }
    }

    tick(delta) {
        if (!this.enabled) return;

        // 1. Hitung Posisi Ideal
        const idealPosition = this.currentOffsetTarget.clone();
        idealPosition.applyQuaternion(this.shipMesh.quaternion);
        idealPosition.add(this.shipMesh.position);

        const idealLookAt = this.currentLookAtTarget.clone();
        idealLookAt.applyQuaternion(this.shipMesh.quaternion);
        idealLookAt.add(this.shipMesh.position);

        // 2. Gerakkan Kamera (Lerp)
        // Jika FPS (Kokpit), lerp-nya harus sangat cepat (responsive) biar ga pusing
        const lerpSpeed = this.isCockpitMode ? 0.2 : 0.05; // 0.05 itu smooth lambat, 0.2 itu cepat
        
        const t = 1.0 - Math.pow(lerpSpeed, delta); 

        this.currentPosition.lerp(idealPosition, this.isCockpitMode ? 0.5 : t * 2.0); // FPS lebih "snappy"
        this.currentLookAt.lerp(idealLookAt, this.isCockpitMode ? 0.5 : t * 3.0);

        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }
}