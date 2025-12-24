import * as THREE from 'three';
import { KeplerSolver } from '../../physics/KeplerSolver';
import { KM_TO_UNIT } from '../../utils/Constants';

export class Planet {
    /**
     * @param {Object} data - Data JSON
     * @param {Object} textures - { map: Texture, normal: Texture }
     */
    constructor(data, textures = {}) {
        this.data = data;
        
        this.radius = data.radiusKm * KM_TO_UNIT * 100;
        this.orbitRadius = data.distanceFromSunKm * KM_TO_UNIT;
        this.period = data.orbitPeriodDays;
        this.eccentricity = data.eccentricity || 0;

        // 1. Geometry
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);

        // 2. Material dengan Tekstur
        const material = new THREE.MeshStandardMaterial({ 
            map: textures.map || null,        // Tekstur Warna (Diffuse)
            normalMap: textures.normal || null, // Tekstur Relief (Normal)
            color: textures.map ? 0xffffff : 0xaaaaaa, // Jika ada tekstur, warna dasar putih
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);

        this.accumulatedTime = Math.random() * 100; // Random start position
    }

    tick(delta, speedMultiplier = 1) {
        // ... (Logika tick SAMA PERSIS dengan sebelumnya, tidak berubah) ...
        this.accumulatedTime += delta * speedMultiplier;
        if (this.orbitRadius === 0) return;
        
        const pos = KeplerSolver.solve(this.orbitRadius, this.eccentricity, this.period, this.accumulatedTime);
        this.mesh.position.x = pos.x;
        this.mesh.position.z = pos.z;
        
        // [TAMBAHAN] Rotasi Planet pada porosnya (Rotasi Harian)
        this.mesh.rotation.y += 0.5 * delta * speedMultiplier;
    }

    getMesh() {
        return this.mesh;
    }
}