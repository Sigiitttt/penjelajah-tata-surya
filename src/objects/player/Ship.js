import * as THREE from 'three';
import { ArcadePhysics } from '../../physics/ArcadePhysics';
import { InputHandler } from '../../core/InputHandler';
import { WORLD_BOUNDARY, KM_TO_UNIT } from '../../utils/Constants'; 
import { Exhaust } from './Exhaust';
import { bus } from '../../core/EventBus'; 
import planetData from '../../data/planets.json'; 

export class Ship {
    // [UPDATE] Constructor sekarang menerima 'modelTemplate' dari main.js
    constructor(scene, modelTemplate) {
        
        // --- 1. SETUP MODEL ---
        if (modelTemplate) {
            // [BARU] Gunakan Model 3D Asli (GLB)
            this.mesh = modelTemplate.clone();
            
            // Atur ukuran dan rotasi (sesuaikan dengan modelnya)
            this.mesh.scale.set(0.5, 0.5, 0.5); 
            this.mesh.rotation.y = Math.PI; // Putar balik jika pesawat menghadap belakang
        } else {
            // Fallback: Jika model gagal load, pakai kotak sementara (biar gak error)
            const geometry = new THREE.BoxGeometry(1, 1, 3);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            this.mesh = new THREE.Mesh(geometry, material);
        }

        this.mesh.position.set(0, 0, 100); 

        // 2. Setup Sistem
        this.input = new InputHandler();
        this.physics = new ArcadePhysics(this.mesh);
        this.isOutOfBounds = false;
        this.exhaust = new Exhaust(scene);
    }

    getMesh() {
        return this.mesh;
    }

    checkLocation() {
        let nearestName = "DEEP SPACE";

        // 1. Cek Matahari (Radius 0)
        const distToSun = this.mesh.position.length();
        const sunLimit = (planetData.sun.radiusKm * KM_TO_UNIT * 100) + 50; 

        if (distToSun < sunLimit) {
            nearestName = "SUN ORBIT";
        }

        // 2. Cek Sektor Bumi (Jarak sekitar 150 unit)
        // 149,600,000 km * KM_TO_UNIT = ~149.6 unit
        const earthOrbitDist = 149.6; 
        
        // Jika jarak pesawat ada di radius 130 - 170 unit, kita anggap dekat Bumi
        if (Math.abs(distToSun - earthOrbitDist) < 20) {
             nearestName = "EARTH SECTOR";
        }
        
        // Kirim ke UI
        bus.emit('locationUpdate', nearestName);
    }

    tick(delta) {
        // --- 1. CEK BATAS DUNIA ---
        const distanceFromCenter = this.mesh.position.length();

        if (distanceFromCenter > WORLD_BOUNDARY) {
            this.isOutOfBounds = true;
            const directionToCenter = this.mesh.position.clone().normalize().negate();
            const pushBackForce = (distanceFromCenter - WORLD_BOUNDARY) * 0.5;
            
            this.physics.applyForce(directionToCenter.multiplyScalar(pushBackForce * delta));
            this.physics.velocity.multiplyScalar(0.95); 
        } else {
            this.isOutOfBounds = false;
        }

        // --- 2. UPDATE JEJAK MESIN ---
        this.exhaust.tick(delta);

        // --- 3. INPUT CONTROL & BOOST LOGIC ---
        
        // [UPDATE] Setup variabel dasar (Lebih Cepat)
        let currentMaxSpeed = 10.0; // Dulu 2.0 (Sekarang jalan biasa agak cepat)
        let currentAccel = this.physics.accelPower;

        // LOGIKA BOOST (SHIFT)
        // [UPDATE] Interplanetary Speed (Ngebut Parah)
        if (this.input.isDown('ShiftLeft')) {
            currentMaxSpeed = 200.0;   // Dulu 8.0 (Sekarang 200.0)
            currentAccel *= 50.0;      // Tenaga mesin dikali 50x
        }
        
        // Terapkan limit kecepatan ke physics
        this.physics.maxSpeed = currentMaxSpeed;

        // Rotasi (A / D)
        if (this.input.isDown('KeyA')) {
            this.mesh.rotation.y += this.physics.rotationSpeed * delta;
        }
        if (this.input.isDown('KeyD')) {
            this.mesh.rotation.y -= this.physics.rotationSpeed * delta;
        }

        // Maju (W)
        if (this.input.isDown('KeyW')) {
            // [PENTING] Gunakan currentAccel yang sudah di-boost
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
            this.physics.applyForce(forward.multiplyScalar(currentAccel * delta));

            // Spawn Jejak
            const isBoosting = this.input.isDown('ShiftLeft');
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

        // Rem (Space)
        if (this.input.isDown('Space')) {
            this.physics.friction = 0.90; 
        } else {
            this.physics.friction = 0.98; 
        }

        // --- 4. UPDATE PHYSICS (WAJIB ADA) ---
        // Tanpa baris ini, kecepatan tidak akan pernah dihitung!
        this.physics.update(delta);
        
        // --- 5. UPDATE UI (HUD) ---
        const currentSpeed = this.physics.velocity.length();
        // console.log("Speed:", currentSpeed);
        bus.emit('speedUpdate', currentSpeed);

        // Update Nama Lokasi
        this.checkLocation();
    }
}