import * as THREE from 'three';
import { Loop } from './Loop';
import { AssetLoader } from './AssetLoader';
import { CameraSystem } from './CameraSystem';

// IMPORT MODUL POST-PROCESSING (EFEK VISUAL)
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
            5000000 // <--- [UPDATE] Naikkan jadi 20.000 agar bisa lihat ujung tata surya
        );
        this.camera.position.set(0, 50, 400); 

        // 3. Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // TONE MAPPING (Agar cahaya bloom tidak gosong/putih polos)
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 1.5; 

        this.container.appendChild(this.renderer.domElement);

        // --- SETUP BLOOM (EFEK SILAU) ---
        this.composer = new EffectComposer(this.renderer);
        
        // Pass 1: Render Gambar Asli
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Pass 2: Efek UnrealBloom
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight), 
            0.5,  // Strength
            0.4,  // Radius
            0.85  // Threshold
        );
        this.composer.addPass(bloomPass);
        // ----------------------------------------

        // 4. Setup System Utama
        // Kirim 'this.composer' ke Loop agar dia yang dipakai untuk render
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

        // Update ukuran Composer juga!
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}