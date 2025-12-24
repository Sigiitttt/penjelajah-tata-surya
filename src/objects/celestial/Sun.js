import * as THREE from 'three';
import { KM_TO_UNIT } from '../../utils/Constants';

export class Sun {
    constructor(data, texture) {
        this.data = data;

        // 1. Geometry
        // Radius dikali 100 seperti planet lain agar terlihat
        const radius = data.radiusKm * KM_TO_UNIT * 100;
        const geometry = new THREE.SphereGeometry(radius, 64, 64); // Segmen tinggi biar mulus

        // 2. Material (PENTING: Emissive)
        // Kita pakai MeshBasicMaterial atau Standard dengan Emissive tinggi
        // Agar matahari terlihat seperti bola lampu pijar
        const material = new THREE.MeshStandardMaterial({
            map: texture, // Tekstur permukaan matahari
            emissive: 0xffff00, // Warna cahaya yang dipancarkan (Kuning/Putih)
            emissiveMap: texture, // Bagian mana yang bercahaya (semuanya)
            emissiveIntensity: 2.0, // Kekuatan cahaya visual
            color: 0xffffff
        });

        this.mesh = new THREE.Mesh(geometry, material);

        // 3. Sumber Cahaya (PointLight)
        // Matahari membawa lampunya sendiri!
        const sunLight = new THREE.PointLight(0xffffff, 2.5, 1000); // Intensity 2.5, Jarak 1000

        // Setup Shadow (Bayangan) - Opsional untuk nanti
        sunLight.castShadow = true;

        // Masukkan lampu ke dalam mesh matahari
        this.mesh.add(sunLight);
    }
    tick(delta) {
        // Matahari berputar sangat pelan pada porosnya
        this.mesh.rotation.y += 0.05 * delta;
    }
    getMesh() {
        return this.mesh;
    }
}