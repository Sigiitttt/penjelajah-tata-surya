import * as THREE from 'three';
// [BARU] Import GLTFLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetLoader {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader(); // [BARU] Setup Loader
    }

    loadTexture(key, path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    console.log(`✅ Texture loaded: ${key}`);
                    resolve(texture);
                },
                undefined,
                (err) => {
                    console.error(`❌ Error loading texture: ${key}`, err);
                    reject(err);
                }
            );
        });
    }

    // [BARU] Method untuk load Model 3D
    loadModel(key, path) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    console.log(`✅ Model loaded: ${key}`);
                    // Kita return 'scene' nya karena itu adalah Mesh utamanya
                    resolve(gltf.scene);
                },
                undefined,
                (err) => {
                    console.error(`❌ Error loading model: ${key}`, err);
                    reject(err);
                }
            );
        });
    }
}