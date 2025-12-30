import * as THREE from 'three';
import { bus } from '../core/EventBus';

export class Teleporter {
    constructor(scene, ship, cameraSystem, targets) {
        this.scene = scene;
        this.ship = ship;
        this.cameraSystem = cameraSystem; // Kita butuh akses ke ChaseCamera
        this.targets = targets; // Array berisi Planet & Matahari
        
        this.isActive = false;

        // --- 1. SETUP VISUAL LUBANG HITAM (PORTAL) ---
        // Kita buat Cincin bersinar
        const geometry = new THREE.TorusGeometry(10, 1, 16, 100);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x8800ff, // Ungu Neon
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        this.portalMesh = new THREE.Mesh(geometry, material);
        this.portalMesh.visible = false;
        this.scene.add(this.portalMesh);

        // Bola Hitam di tengah
        const blackHoleGeo = new THREE.SphereGeometry(8, 32, 32);
        const blackHoleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.blackHole = new THREE.Mesh(blackHoleGeo, blackHoleMat);
        this.portalMesh.add(this.blackHole);

        // --- 2. SETUP UI MENU ---
        this.createMenu();

        // --- 3. INPUT LISTENER ---
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyH') { // H for Hole/Hyperjump
                this.toggleMenu();
            }
        });
    }

    createMenu() {
        this.menuContainer = document.createElement('div');
        this.menuContainer.style.position = 'absolute';
        this.menuContainer.style.top = '50%';
        this.menuContainer.style.left = '50%';
        this.menuContainer.style.transform = 'translate(-50%, -50%)';
        this.menuContainer.style.background = 'rgba(0, 0, 0, 0.9)';
        this.menuContainer.style.border = '2px solid #8800ff';
        this.menuContainer.style.padding = '20px';
        this.menuContainer.style.borderRadius = '10px';
        this.menuContainer.style.display = 'none';
        this.menuContainer.style.zIndex = '2000';
        this.menuContainer.style.textAlign = 'center';
        this.menuContainer.style.fontFamily = 'monospace';

        const title = document.createElement('h2');
        title.innerText = "SELECT WORMHOLE DESTINATION";
        title.style.color = '#8800ff';
        title.style.margin = '0 0 15px 0';
        this.menuContainer.appendChild(title);

        const list = document.createElement('div');
        list.style.maxHeight = '300px';
        list.style.overflowY = 'auto';
        list.style.display = 'grid';
        list.style.gridTemplateColumns = '1fr 1fr'; // 2 Kolom
        list.style.gap = '10px';

        // Loop semua target (Planet/Matahari)
        this.targets.forEach(target => {
            const btn = document.createElement('button');
            // Cek nama: kalo Planet ada di data.name, kalo Matahari mungkin beda
            const name = target.data ? target.data.name : "SUN"; 
            
            btn.innerText = name.toUpperCase();
            btn.style.padding = '10px';
            btn.style.background = '#220044';
            btn.style.color = 'white';
            btn.style.border = '1px solid #440088';
            btn.style.cursor = 'pointer';
            btn.style.fontFamily = 'monospace';
            btn.style.fontWeight = 'bold';

            btn.onmouseover = () => btn.style.background = '#440088';
            btn.onmouseout = () => btn.style.background = '#220044';

            btn.onclick = () => {
                this.teleportTo(target);
                this.toggleMenu(); // Tutup menu
            };

            list.appendChild(btn);
        });

        this.menuContainer.appendChild(list);
        document.body.appendChild(this.menuContainer);
    }

    toggleMenu() {
        this.isActive = !this.isActive;
        this.menuContainer.style.display = this.isActive ? 'block' : 'none';
    }

    teleportTo(target) {
        const shipMesh = this.ship.getMesh();
        
        // 1. Tentukan Posisi Baru
        // Jangan pas di tengah planet (nanti tabrakan), tapi agak di samping
        // Kita ambil radius planet + jarak aman (misal 200 unit)
        const targetRadius = target.radius || 100; // Fallback kalau matahari ga ada property radius
        const offset = targetRadius + 200; 
        
        const newPos = target.mesh.position.clone();
        newPos.x += offset; 
        newPos.z += offset;

        // 2. Efek Visual Portal (Muncul sekejap di depan kapal sebelum pindah)
        this.portalMesh.position.copy(shipMesh.position);
        this.portalMesh.position.z -= 50; // Di depan kapal
        this.portalMesh.visible = true;
        
        // Animasi Teleportasi Sederhana
        setTimeout(() => {
            // 3. PINDAHKAN KAPAL
            shipMesh.position.copy(newPos);
            
            // 4. RESET FISIKA (PENTING!)
            // Hentikan kecepatan agar tidak menabrak planet dengan sisa momentum
            this.ship.physics.velocity.set(0, 0, 0);
            this.ship.physics.accel.set(0, 0, 0);
            this.ship.isLanded = false;
            shipMesh.userData.isLanded = false; // Reset status landing

            // 5. Reset Kamera agar langsung nempel (tidak "terbang" melintasi map)
            // Kita panggil manual posisi kamera
            if (this.cameraSystem) {
                this.cameraSystem.currentPosition.copy(newPos).add(this.cameraSystem.offsetTPS);
                this.cameraSystem.currentLookAt.copy(newPos);
            }

            // Sembunyikan Portal
            this.portalMesh.visible = false;
            
            console.log("WARP SUCCESSFUL TO: " + (target.data ? target.data.name : "SUN"));

        }, 500); // Delay 0.5 detik seolah masuk lubang
    }

    tick(delta) {
        if (this.portalMesh.visible) {
            // Efek putar portal
            this.portalMesh.rotation.z += 5.0 * delta;
            
            // Efek scaling (Membesar)
            const s = this.portalMesh.scale.x;
            if (s < 5) {
                this.portalMesh.scale.set(s + delta*10, s + delta*10, s + delta*10);
            }
        } else {
            this.portalMesh.scale.set(0.1, 0.1, 0.1);
        }
    }
}