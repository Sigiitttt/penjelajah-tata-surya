import * as THREE from 'three';

export class StarField {
    constructor() {
        // Kita gunakan BufferGeometry karena performanya jauh lebih cepat untuk ribuan partikel
        const geometry = new THREE.BufferGeometry();
        const count = 5000; // Jumlah bintang
        
        const positions = new Float32Array(count * 3); // x, y, z untuk setiap bintang

        for (let i = 0; i < count * 3; i++) {
            // Posisi acak antara -1000 sampai 1000
            // (Math.random() - 0.5) menghasilkan -0.5 s/d 0.5
            positions[i] = (Math.random() - 0.5) * 2000; 
        }

        // Masukkan data posisi ke geometry
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Material titik putih sederhana
        const material = new THREE.PointsMaterial({
            size: 0.5, // Ukuran bintang
            sizeAttenuation: true, // Bintang jauh terlihat lebih kecil
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });

        // Buat Mesh (Points)
        this.mesh = new THREE.Points(geometry, material);
    }

    getMesh() {
        return this.mesh;
    }
}