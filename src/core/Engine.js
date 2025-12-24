import * as THREE from 'three';
import { Loop } from './Loop';
import { AssetLoader } from './AssetLoader';
import { CameraSystem } from './CameraSystem';

// [BARU] IMPORT MODUL POST-PROCESSING (EFEK VISUAL)
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class Engine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // 1. Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);

        // 2. Setup Camera
        this.camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000 
        );
        this.camera.position.set(0, 50, 400); // Posisi mundur agar melihat Matahari utuh

        // 3. Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // [BARU] TONE MAPPING
        // Agar cahaya yang sangat terang (bloom) tidak membuat warna jadi putih polos (gosong)
        // Ini membuat gradasi warna cahaya lebih natural
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 1.5; 

        this.container.appendChild(this.renderer.domElement);

        // --- [BARU] SETUP BLOOM (EFEK SILAU) ---
        
        // A. Buat Composer (Manager Efek)
        // Composer ini akan menggantikan tugas renderer biasa
        this.composer = new EffectComposer(this.renderer);
        
        // B. Pass 1: Render Gambar Asli (Scene + Camera)
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // C. Pass 2: Efek UnrealBloom (Silau)
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight), 
           1.5,  // Strength: Kekuatan silau (Makin tinggi makin silau)
            0.2,  // Radius: Sebaran cahaya
            0.85  // Threshold: Batas kecerahan (Hanya matahari yg kena efek ini)
        );
        this.composer.addPass(bloomPass);
        // ----------------------------------------

        // 4. Setup System Utama
        // [PENTING] Kirim 'this.composer' ke Loop agar dia yang dipakai untuk render
        this.loop = new Loop(this.camera, this.scene, this.renderer, this.composer);
        
        this.assets = new AssetLoader();
        
        // 5. Setup Camera Control
        this.cameraSystem = new CameraSystem(this.camera, this.renderer.domElement);
        this.loop.updatables.push(this.cameraSystem);

        // 6. Handle Resize
        window.addEventListener('resize', this.onResize.bind(this));
    }
    
    start() {
        this.loop.start();
    }

    onResize() {
        // Update Kamera & Renderer
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // [BARU] Update ukuran Composer juga!
        // Kalau lupa ini, efek bloom akan jadi gepeng/pecah saat layar di-resize
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}