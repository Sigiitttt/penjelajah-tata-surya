import * as THREE from 'three';
import { ArcadePhysics } from '../../physics/ArcadePhysics';
import { InputHandler } from '../../core/InputHandler';
import { WORLD_BOUNDARY, KM_TO_UNIT } from '../../utils/Constants';
import { Exhaust } from './Exhaust';
import { bus } from '../../core/EventBus';
import planetData from '../../data/planets.json';

export class Ship {
    constructor(scene, modelTemplate, allPlanets = []) {
        this.scene = scene;
        this.planets = allPlanets;

        // --- 1. SETUP MODEL ---
        if (modelTemplate) {
            this.mesh = modelTemplate.clone();
            this.mesh.scale.set(0.05, 0.05, 0.05);
            this.mesh.rotation.y = 0;
        } else {
            const geometry = new THREE.ConeGeometry(0.1, 0.4, 8);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            this.mesh = new THREE.Mesh(geometry, material);
        }

        // Posisi Aman
        this.mesh.position.set(0, 0, 150000);

        // 2. Setup Physics
        this.input = new InputHandler();
        this.physics = new ArcadePhysics(this.mesh);

        // Tenaga Akselerasi Besar (Biar responsif)
        this.physics.accelPower = 200.0;
        this.physics.rotationSpeed = 2.5; // Rotasi dipercepat dikit biar lincah

        this.isOutOfBounds = false;
        this.exhaust = new Exhaust(scene);

        this.isLanded = false;
        this.nearestPlanet = null;
    }

    getMesh() { return this.mesh; }

    // --- LOGIKA GRAVITASI & ANTI-NEMBUS ---
    handlePlanetaryPhysics(delta) {
        let closestDist = Infinity;
        let closestPlanet = null;

        if (this.planets && this.planets.length > 0) {
            this.planets.forEach(p => {
                const dist = this.mesh.position.distanceTo(p.mesh.position);
                // Jarak ke PERMUKAAN (Bukan ke inti)
                const distToSurface = dist - p.radius;

                if (distToSurface < closestDist) {
                    closestDist = distToSurface;
                    closestPlanet = p;
                }
            });
        }

        this.nearestPlanet = closestPlanet;

        // Jika masuk area gravitasi (50 unit dari permukaan)
        if (closestPlanet && closestDist < 50) {
            const planetCenter = closestPlanet.mesh.position.clone();
            const shipPos = this.mesh.position.clone();

            const gravityVec = new THREE.Vector3().subVectors(planetCenter, shipPos).normalize();
            const surfaceNormal = gravityVec.clone().negate();

            // 1. Align Pesawat Mengikuti Lengkungan Planet
            this.mesh.up.copy(surfaceNormal);
            this.mesh.lookAt(planetCenter);

            // 2. Tarikan Gravitasi (Hanya jika belum mendarat)
            if (!this.isLanded) {
                this.physics.velocity.add(gravityVec.multiplyScalar(9.8 * delta * 0.8));
            }

            // 3. [FIX] ANTI-NEMBUS / HARD COLLISION
            // Jika jarak ke permukaan <= 0.5, paksa berhenti dan tempel di kulit planet
            // ... (kode atas sama) ...

            // D. Cek Tabrakan (Mendarat)
            const landHeight = 0.5;

            if (closestDist <= landHeight) {
                if (!this.isLanded) {
                    this.isLanded = true;
                    this.physics.velocity.set(0, 0, 0);

                    // [UPDATE] Simpan status di Mesh agar Kamera tahu
                    this.mesh.userData.isLanded = true;

                    bus.emit('locationUpdate', "LANDED: " + closestPlanet.data.name.toUpperCase());
                }

                // Snap posisi ke permukaan
                const surfacePos = planetCenter.add(surfaceNormal.multiplyScalar(closestPlanet.radius + landHeight));
                this.mesh.position.copy(surfacePos);

            } else {
                this.isLanded = false;

                // [UPDATE] Reset status saat terbang lagi
                this.mesh.userData.isLanded = false;
            }

        } else {
            // Di Luar Angkasa
            this.isLanded = false;
            this.mesh.userData.isLanded = false; // [UPDATE]
            this.mesh.up.set(0, 1, 0);
        }
    }


    tick(delta) {
        this.handlePlanetaryPhysics(delta);

        // Cek Batas Dunia
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

        this.exhaust.tick(delta);

        // --- INPUT CONTROL ---

        let currentMaxSpeed = 100.0;
        let currentAccel = this.physics.accelPower;

        const isBoosting = this.input.isDown('ShiftLeft') || this.input.isDown('ShiftRight');

        if (isBoosting) {
            // [FIX SPEED] Naikkan jadi 5.000 agar perjalanan antar planet cepat
            // Karena map kita RAKSASA, 500 itu kayak jalan kaki.
            currentMaxSpeed = 500000.0;
            currentAccel *= 10.0;
        }

        this.physics.maxSpeed = currentMaxSpeed;

        // Kontrol Rotasi (A/D & Arrow Left/Right)
        const isLeft = this.input.isDown('KeyA') || this.input.isDown('ArrowLeft');
        const isRight = this.input.isDown('KeyD') || this.input.isDown('ArrowRight');

        if (isLeft) this.mesh.rotation.y += this.physics.rotationSpeed * delta;
        if (isRight) this.mesh.rotation.y -= this.physics.rotationSpeed * delta;

        // Kontrol Maju (W & Arrow Up)
        const isForward = this.input.isDown('KeyW') || this.input.isDown('ArrowUp');

        if (isForward) {
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
            this.physics.applyForce(forward.multiplyScalar(currentAccel * delta));

            // Asap Engine
            const offsetEngine = new THREE.Vector3(0, 0, 0.5).applyQuaternion(this.mesh.quaternion);
            const enginePos = this.mesh.position.clone().add(offsetEngine);
            this.exhaust.spawn(enginePos, isBoosting);

            // Takeoff jump
            if (this.isLanded) {
                this.physics.velocity.add(this.mesh.up.clone().multiplyScalar(10)); // Jump lebih kuat
                this.isLanded = false;
            }
        }

        // Kontrol Mundur/Rem (S & Arrow Down)
        const isBackward = this.input.isDown('KeyS') || this.input.isDown('ArrowDown');

        if (isBackward) {
            // Rem lebih pakem (biar gak kebablasan lagi)
            const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
            this.physics.applyForce(backward.multiplyScalar(this.physics.accelPower * 2.0 * delta));
        }

        // Space untuk Rem Darurat
        if (this.input.isDown('Space')) {
            // Langsung set velocity ke 0, berhenti seketika (seperti rem tangan)
            this.physics.velocity.set(0, 0, 0);
            this.physics.accel.set(0, 0, 0);
        } else {
            this.physics.friction = 0.98; // Friction udara biasa saat dilepas
        }

        this.physics.update(delta);

        const currentSpeed = this.physics.velocity.length();
        // Tampilkan speed dibagi 10 biar angkanya gak lebay di UI
        bus.emit('speedUpdate', Math.floor(currentSpeed));
    }
}