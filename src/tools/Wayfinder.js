import * as THREE from 'three';
import { KM_TO_UNIT } from '../utils/Constants';

export class Wayfinder {
    constructor(scene, shipMesh, planets) {
        this.scene = scene;
        this.shipMesh = shipMesh;
        this.planets = planets;
        this.currentTargetIndex = 0;
        
        // [BARU] Status Aktif (Default False/Mati)
        this.isActive = false;

        // --- 1. SETUP OBJEK 3D (BOLA & TALI) ---
        const ballGeo = new THREE.SphereGeometry(1, 16, 16);
        const ballMat = new THREE.MeshBasicMaterial({
            color: 0xff0000, 
            transparent: true,
            opacity: 0.8,
            depthTest: false 
        });

        this.guideBall = new THREE.Mesh(ballGeo, ballMat);
        this.guideBall.renderOrder = 999; 
        this.guideBall.visible = false; // Sembunyikan awal
        this.scene.add(this.guideBall);

        // Cincin Target
        const ringGeo = new THREE.RingGeometry(1.5, 1.8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.5,
            depthTest: false 
        });
        this.guideRing = new THREE.Mesh(ringGeo, ringMat);
        this.guideBall.add(this.guideRing); 


        // Tali Penghubung (Tether)
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0,0,0), 
            new THREE.Vector3(0,0,0)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0xff4444, 
            transparent: true, 
            opacity: 0.3 
        });
        this.tether = new THREE.Line(lineGeo, lineMat);
        this.tether.frustumCulled = false;
        this.tether.visible = false; // Sembunyikan awal
        this.scene.add(this.tether);


        // --- 2. SETUP CONTROLS & UI ---
        window.addEventListener('keydown', (e) => {
            // Tombol M untuk ON/OFF Manual
            if (e.code === 'KeyM') {
                this.toggleSystem();
            }
            // Tombol N untuk Ganti Target (Otomatis Nyala)
            if (e.code === 'KeyN') {
                if (!this.isActive) this.toggleSystem(true); // Force ON
                this.nextTarget();
            }
        });

        this.gpsLabel = document.createElement('div');
        this.gpsLabel.style.position = 'absolute';
        this.gpsLabel.style.top = '15%'; 
        this.gpsLabel.style.left = '50%';
        this.gpsLabel.style.transform = 'translateX(-50%)';
        this.gpsLabel.style.color = '#ff4444'; 
        this.gpsLabel.style.fontFamily = 'monospace';
        this.gpsLabel.style.fontSize = '20px';
        this.gpsLabel.style.fontWeight = 'bold';
        this.gpsLabel.style.textAlign = 'center';
        this.gpsLabel.style.textShadow = '0 0 10px #ff0000';
        this.gpsLabel.style.display = 'none'; // Sembunyikan awal
        this.gpsLabel.innerText = "SYSTEM READY";
        document.body.appendChild(this.gpsLabel);
    }

    // Fungsi Toggle (Nyala/Mati)
    toggleSystem(forceOn = null) {
        // Jika forceOn diisi true/false pakai itu, jika null maka switch (flip)
        this.isActive = (forceOn !== null) ? forceOn : !this.isActive;

        // Atur Visibilitas Objek 3D
        this.guideBall.visible = this.isActive;
        this.tether.visible = this.isActive;
        
        // Atur Visibilitas UI
        this.gpsLabel.style.display = this.isActive ? 'block' : 'none';

        // Efek Suara/Log visual (Opsional)
        if(this.isActive) {
            this.gpsLabel.innerText = "GPS SYSTEM: ONLINE";
            this.gpsLabel.style.color = '#00ffff';
            setTimeout(() => this.gpsLabel.style.color = '#ff4444', 500);
        }
    }

    nextTarget() {
        this.currentTargetIndex++;
        if (this.currentTargetIndex >= this.planets.length) {
            this.currentTargetIndex = 0;
        }
        
        // Efek UI
        this.gpsLabel.style.transform = 'translateX(-50%) scale(1.5)';
        setTimeout(() => this.gpsLabel.style.transform = 'translateX(-50%) scale(1.0)', 150);
    }

    tick() {
        // [PENTING] Jika sistem mati, jangan hitung apa-apa (Hemat Baterai/CPU)
        if (!this.isActive) return;

        if (!this.planets || this.planets.length === 0) return;

        const targetPlanet = this.planets[this.currentTargetIndex];
        
        // --- LOGIKA UTAMA (Sama seperti sebelumnya) ---
        const shipPos = this.shipMesh.position.clone();
        const targetPos = targetPlanet.mesh.position.clone();

        const direction = new THREE.Vector3().subVectors(targetPos, shipPos).normalize();
        const guideDistance = 40; 
        const guidePos = shipPos.clone().add(direction.multiplyScalar(guideDistance));

        this.guideBall.position.copy(guidePos);
        this.guideBall.lookAt(this.scene.position); 

        const positions = this.tether.geometry.attributes.position.array;
        positions[0] = shipPos.x;
        positions[1] = shipPos.y + 1; 
        positions[2] = shipPos.z;
        positions[3] = guidePos.x;
        positions[4] = guidePos.y;
        positions[5] = guidePos.z;
        this.tether.geometry.attributes.position.needsUpdate = true;

        // UI Update
        const realDistance = shipPos.distanceTo(targetPos);
        const distMillionKm = (realDistance / KM_TO_UNIT / 1000000).toFixed(1); 
        
        this.gpsLabel.innerText = `♦ TARGET: ${targetPlanet.data.name.toUpperCase()} ♦\nDIST: ${distMillionKm} M km\n[M: OFF | N: NEXT]`;
        
        // Cek Kelurusan (Warna Hijau/Merah)
        const shipForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.shipMesh.quaternion).normalize();
        const dirToTarget = new THREE.Vector3().subVectors(targetPos, shipPos).normalize();
        const alignment = shipForward.dot(dirToTarget);

        if (alignment > 0.98) { 
            this.guideBall.material.color.setHex(0x00ff00); 
            this.guideRing.material.color.setHex(0x00ff00);
            this.tether.material.color.setHex(0x00ff00);
        } else {
            this.guideBall.material.color.setHex(0xff0000); 
            this.guideRing.material.color.setHex(0xff0000);
            this.tether.material.color.setHex(0xff4444);
        }
    }
}