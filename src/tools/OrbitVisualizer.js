import * as THREE from 'three';
import { KeplerSolver } from '../physics/KeplerSolver';

export class OrbitVisualizer {
    /**
     * @param {Object} planetData - Data JSON planet (jarak, ecc)
     * @param {number} color - Warna garis (misal 0xffffff)
     */
    constructor(planetData, color = 0xffffff) {
        this.data = planetData;
        this.color = color;
        this.pointsCount = 128; // Semakin banyak semakin halus lingkarannya
    }

    getMesh() {
        const points = [];
        const orbitRadius = this.data.distanceFromSunKm * (1 / 1000000); // Sesuaikan dengan Constants.KM_TO_UNIT
        const eccentricity = this.data.eccentricity || 0;
        const period = 1; // Dummy period, kita cuma butuh bentuk jalurnya

        // Kita hitung posisi planet di setiap sudut (0 sampai 360 derajat)
        // Simulasi 1 putaran penuh
        for (let i = 0; i <= this.pointsCount; i++) {
            const time = (i / this.pointsCount) * period;
            
            // Panggil rumus Kepler untuk dapat koordinat titik jalur
            const pos = KeplerSolver.solve(orbitRadius, eccentricity, period, time);
            
            points.push(new THREE.Vector3(pos.x, 0, pos.z));
        }

        // Buat Geometry Garis
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: this.color,
            transparent: true,
            opacity: 0.3 // Agak transparan biar elegan
        });

        // Gunakan LineLoop agar titik awal dan akhir menyambung
        return new THREE.LineLoop(geometry, material);
    }
}