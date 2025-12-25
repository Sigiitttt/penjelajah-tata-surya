import * as THREE from 'three';

export class Exhaust {
    constructor(scene) {
        this.scene = scene;
        this.particles = []; // Menyimpan partikel hidup
    }

    /**
     * Spawn partikel baru di posisi mesin
     * @param {THREE.Vector3} position - Posisi mesin pesawat
     * @param {boolean} isBoosting - Apakah sedang ngebut (partikel lebih besar/banyak)
     */
    spawn(position, isBoosting) {
        // 1. Buat Mesh Partikel (Kotak kecil glowing)
        const size = isBoosting ? 0.8 : 0.4;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshBasicMaterial({
            color: isBoosting ? 0x00ffff : 0x0088ff, // Cyan saat ngebut, Biru saat biasa
            transparent: true,
            opacity: 0.8
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Copy posisi pesawat
        mesh.position.copy(position);
        
        // Random sedikit posisinya biar terlihat alami (Jitter)
        mesh.position.x += (Math.random() - 0.5) * 0.5;
        mesh.position.y += (Math.random() - 0.5) * 0.5;
        mesh.position.z += (Math.random() - 0.5) * 0.5;

        // Simpan ke array
        this.particles.push({ mesh, life: 1.0 }); // Life 1.0 artinya hidup 100%
        this.scene.add(mesh);
    }

    tick(delta) {
        // Loop semua partikel mundur
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // 1. Kurangi Nyawa
            p.life -= delta * 2.0; // Mati dalam 0.5 detik

            // 2. Animasi (Mengecil & Memudar)
            p.mesh.scale.setScalar(p.life);
            p.mesh.material.opacity = p.life;

            // 3. Cek Mati
            if (p.life <= 0) {
                // Hapus dari Scene & Array
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    }
}