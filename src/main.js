import './styles/main.css';
import { Engine } from './core/Engine';
import { StarField } from './objects/celestial/StarField';
import { Planet } from './objects/celestial/Planet';
import { Sun } from './objects/celestial/Sun'; // [BARU] Import Sun
import { OrbitVisualizer } from './tools/OrbitVisualizer';
import { TimeController } from './tools/TimeController';
import * as THREE from 'three';
import planetData from './data/planets.json';
import { KM_TO_UNIT } from './utils/Constants';

async function main() {
    const engine = new Engine('app');

    // 1. LOAD TEXTURES (Tunggu sampai selesai / Await)
    // Pastikan nama file sesuai dengan yang Anda download di folder public/textures/
    console.log("Loading textures...");
    const sunTex = await engine.assets.loadTexture('sun', '/textures/sun.jpg');
    const earthTex = await engine.assets.loadTexture('earth', '/textures/earth_day.jpg');
    const earthNormal = await engine.assets.loadTexture('earthNorm', '/textures/earth_normal.jpg');
    const moonTex = await engine.assets.loadTexture('moon', '/textures/moon.jpg');
    console.log("Textures loaded!");

    // 2. Setup Dasar
    const stars = new StarField();
    engine.scene.add(stars.getMesh());
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); // Gelapkan ambient biar kontras matahari terasa
    engine.scene.add(ambientLight);

    // HAPUS PointLight manual yang lama, karena sekarang Sun.js membawanya sendiri

    const timeController = new TimeController();
    engine.loop.setTimeController(timeController);

    // --- PEMBUATAN OBJEK DENGAN TEKSTUR ---

    // A. MATAHARI (Pakai Class Sun Baru)
    const sun = new Sun(planetData.sun, sunTex); 
    engine.scene.add(sun.getMesh());

    // B. BUMI (Pakai Texture & Normal Map)
    const earth = new Planet(planetData.earth, {
        map: earthTex,
        normal: earthNormal
    });
    engine.scene.add(earth.getMesh());
    engine.loop.updatables.push(earth);

    // C. Orbit Bumi
    const earthOrbit = new OrbitVisualizer(planetData.earth, 0x444444);
    engine.scene.add(earthOrbit.getMesh());

    // D. BULAN
    const moonData = planetData.moon;
    const moonVisualDist = moonData.distanceFromSunKm * KM_TO_UNIT * 50;
    
    // Bulan Mesh Manual (Simple) - Update Material pake Texture
    const moonGeo = new THREE.SphereGeometry(moonData.radiusKm * KM_TO_UNIT * 100, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({ 
        map: moonTex,
        roughness: 0.9 
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    
    earth.getMesh().add(moonMesh);

    // Logic Orbit Bulan (Tetap sama)
    moonMesh.accumulatedTime = 0;
    moonMesh.tick = (delta) => {
        moonMesh.accumulatedTime += delta; 
        moonMesh.position.x = Math.cos(moonMesh.accumulatedTime) * moonVisualDist;
        moonMesh.position.z = Math.sin(moonMesh.accumulatedTime) * moonVisualDist;
        moonMesh.rotation.y += delta; // Bulan rotasi juga
    };
    engine.loop.updatables.push(moonMesh);

    engine.start();
}

main();