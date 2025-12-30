import * as THREE from 'three';

export class Exhaust {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        
        // Setup Material Partikel (Glowing)
        this.material = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Cyan
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending // Agar terlihat bercahaya
        });
        
        // [PERBAIKAN] Geometri Dikecilkan Drastis (0.02)
        // Agar tidak menutupi pesawat yang ukurannya 0.05
        this.geometry = new THREE.BoxGeometry(0.02, 0.02, 0.02); 
    }

    spawn(position, isBoosting) {
        // Batasi jumlah partikel biar gak berat
        if (this.particles.length > 50) return;

        const mesh = new THREE.Mesh(this.geometry, this.material);
        
        // Copy posisi pesawat
        mesh.position.copy(position);
        
        // [PERBAIKAN] Random Spread juga dikecilkan
        // Supaya asapnya rapi di belakang, bukan menyebar kemana-mana
        mesh.position.x += (Math.random() - 0.5) * 0.05; 
        mesh.position.y += (Math.random() - 0.5) * 0.05; 
        mesh.position.z += (Math.random() - 0.5) * 0.05;

        // Data partikel
        this.particles.push({
            mesh: mesh,
            life: 1.0, // Hidup 1 detik
            isBoosting: isBoosting
        });
        
        this.scene.add(mesh);
    }

    tick(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Kurangi umur
            // Kalau boosting, asap hilang lebih cepat (0.5 detik)
            const decay = p.isBoosting ? 2.0 : 1.0;
            p.life -= delta * decay;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            } else {
                // Efek Memudar
                p.mesh.material.opacity = p.life * 0.5;
                
                // Efek Mengecil
                const scale = p.life * (p.isBoosting ? 2.0 : 1.0); // Boost agak besar dikit
                p.mesh.scale.set(scale, scale, scale);
            }
        }
    }
}