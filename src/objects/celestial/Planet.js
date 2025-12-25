import * as THREE from 'three';
import { KeplerSolver } from '../../physics/KeplerSolver';
import { KM_TO_UNIT } from '../../utils/Constants';
// Pastikan path ini sesuai dengan file shader Anda
// Jika Anda memisahkan file .glsl, sesuaikan import-nya
import { vertexShader, fragmentShader } from '../../shaders/atmosphereShader'; 

export class Planet {
    /**
     * @param {Object} data - Data JSON
     * @param {Object} textures - { map, normal, cloud }
     */
    constructor(data, textures = {}) {
        this.data = data;
        
        this.radius = data.radiusKm * KM_TO_UNIT * 100;
        this.orbitRadius = data.distanceFromSunKm * KM_TO_UNIT;
        this.period = data.orbitPeriodDays;
        this.eccentricity = data.eccentricity || 0;

        // 1. Bola Planet Utama (Tanah/Laut)
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({ 
            map: textures.map || null,
            normalMap: textures.normal || null,
            color: textures.map ? 0xffffff : 0xaaaaaa,
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.userData = { 
            type: 'PLANET', 
            name: data.name,
            description: data.description || "Planet di Tata Surya",
            details: data 
        };

        // --- 2. FITUR AWAN (Hanya jika ada tekstur awan) ---
        if (textures.cloud) {
            const cloudGeo = new THREE.SphereGeometry(this.radius * 1.02, 64, 64);
            const cloudMat = new THREE.MeshStandardMaterial({
                map: textures.cloud,
                transparent: true, 
                opacity: 0.8,      
                blending: THREE.AdditiveBlending, 
                side: THREE.DoubleSide
            });

            this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
            this.mesh.add(this.cloudMesh);
        }

        // --- 3. FITUR ATMOSFER / GLOW (Untuk Semua Planet kecuali Bulan & Merkurius) ---
        // [PERBAIKAN] Jangan cek textures.cloud di sini, tapi cek nama planetnya
        const noAtmosphere = ['The Moon', 'Mercury'];

        if (!noAtmosphere.includes(data.name)) {
            
            // Tentukan Warna Glow
            let atmosphereColor = new THREE.Vector3(0.3, 0.6, 1.0); // Default Biru (Bumi/Neptunus)

            if (data.name === 'Mars') atmosphereColor.set(1.0, 0.3, 0.0); // Merah
            if (data.name === 'Venus') atmosphereColor.set(1.0, 0.8, 0.2); // Kuning
            if (data.name === 'Jupiter') atmosphereColor.set(0.8, 0.7, 0.5); // Krem
            if (data.name === 'Saturn') atmosphereColor.set(0.9, 0.8, 0.6); // Krem/Emas
            if (data.name === 'Uranus') atmosphereColor.set(0.2, 0.8, 0.9); // Cyan

            // Buat Mesh Atmosfer
            const atmoGeo = new THREE.SphereGeometry(this.radius * 1.2, 64, 64);
            
            const atmoMat = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true,
                // [PENTING] Kirim warna ke shader lewat uniforms
                uniforms: {
                    colorVector: { value: atmosphereColor }
                }
            });

            this.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
            this.mesh.add(this.atmosphereMesh);
        }

        this.accumulatedTime = Math.random() * 100;
    }

    tick(delta, speedMultiplier = 1) {
        this.accumulatedTime += delta * speedMultiplier;
        if (this.orbitRadius === 0) return; // Matahari diam
        
        // 1. Gerakan Orbit (Kepler)
        const pos = KeplerSolver.solve(this.orbitRadius, this.eccentricity, this.period, this.accumulatedTime);
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.z;
        
        // 2. Rotasi Planet
        this.mesh.rotation.y += 0.5 * delta * speedMultiplier;

        // 3. Rotasi Awan
        if (this.cloudMesh) {
            this.cloudMesh.rotation.y += 0.07 * delta * speedMultiplier; 
        }

        // 4. Update Atmosfer (Opsional, jika shader butuh update posisi kamera)
        // Untuk saat ini dibiarkan statis karena Shader kita pakai vertexNormal sederhana
    }

    getMesh() {
        return this.mesh;
    }
}