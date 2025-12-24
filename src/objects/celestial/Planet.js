import * as THREE from 'three';
import { KeplerSolver } from '../../physics/KeplerSolver';
import { KM_TO_UNIT } from '../../utils/Constants';
import { vertexShader, fragmentShader } from '../../shaders/atmosphereShader';

export class Planet {
    /**
     * @param {Object} data - Data JSON
     * @param {Object} textures - { map, normal, cloud } <--- Update parameter ini
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

        // --- [BARU] FITUR AWAN ---
        if (textures.cloud) {
            // Buat bola awan sedikit lebih besar (1.02x radius asli)
            const cloudGeo = new THREE.SphereGeometry(this.radius * 1.02, 64, 64);
            
            const cloudMat = new THREE.MeshStandardMaterial({
                map: textures.cloud,
                transparent: true, // Wajib agar bagian hitam jadi tembus pandang
                opacity: 0.8,      // Sedikit transparan biar elegan
                blending: THREE.AdditiveBlending, // Agar awan terlihat bercahaya kena matahari
                side: THREE.DoubleSide
            });

            this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
            
            // Tempelkan awan ke planet utama
            this.mesh.add(this.cloudMesh);
        }if (textures.cloud) {
            const atmoGeo = new THREE.SphereGeometry(this.radius * 1.2, 64, 64); // Lebih besar (1.2x)
            
            const atmoMat = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                blending: THREE.AdditiveBlending, // Agar warnanya "nambah" cahaya
                side: THREE.BackSide, // Render bagian belakang bola agar efeknya di pinggir luar
                transparent: true
            });

            this.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
            this.mesh.add(this.atmosphereMesh);
        }

        this.accumulatedTime = Math.random() * 100;
    }

    tick(delta, speedMultiplier = 1) {
        this.accumulatedTime += delta * speedMultiplier;
        if (this.orbitRadius === 0) return;
        
        // 1. Gerakan Orbit
        const pos = KeplerSolver.solve(this.orbitRadius, this.eccentricity, this.period, this.accumulatedTime);
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.z;
        
        // 2. Rotasi Planet (Siang/Malam)
        this.mesh.rotation.y += 0.5 * delta * speedMultiplier;

        // 3. [BARU] Rotasi Awan
        // Awan bergerak sedikit lebih cepat/lambat dari planet biar terlihat dinamis
        if (this.cloudMesh) {
            this.cloudMesh.rotation.y += 0.07 * delta * speedMultiplier; 
        }
    }

    getMesh() {
        return this.mesh;
    }
}