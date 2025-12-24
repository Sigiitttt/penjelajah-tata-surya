import * as THREE from 'three';

export class AssetLoader {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {}; // Tempat menyimpan tekstur yang sudah diload
    }

    // Fungsi untuk memuat satu tekstur
    loadTexture(key, path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    this.textures[key] = texture;
                    console.log(`✅ Texture loaded: ${key}`);
                    resolve(texture);
                },
                undefined, // onProgress (opsional)
                (err) => {
                    console.error(`❌ Error loading texture: ${path}`, err);
                    reject(err);
                }
            );
        });
    }

    // Ambil tekstur yang sudah ada
    get(key) {
        return this.textures[key];
    }
}