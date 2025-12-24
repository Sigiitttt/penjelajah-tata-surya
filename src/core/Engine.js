import * as THREE from 'three';
import { Loop } from './Loop';
import { AssetLoader } from './AssetLoader';
import { CameraSystem } from './CameraSystem';

export class Engine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // 1. Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505); // Abu-abu gelap elegan

        // 2. Setup Camera
        this.camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000 
        );
        this.camera.position.set(0,50,400);//sisi awal kamera

        // 3. Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 4. Setup System Utama
        this.loop = new Loop(this.camera, this.scene, this.renderer);
        this.assets = new AssetLoader();
        
        // 5. Setup Camera Control (Agar bisa diputar mouse)
        this.cameraSystem = new CameraSystem(this.camera, this.renderer.domElement);
        
        // [PENTING] Masukkan Camera System ke Loop agar animasi 'damping' jalan
        this.loop.updatables.push(this.cameraSystem);

        // 6. Handle Resize Window
        window.addEventListener('resize', this.onResize.bind(this));
    }
    
    start() {
        this.loop.start();
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}