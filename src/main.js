import './styles/main.css';
import { Engine } from './core/Engine';
import { StarField } from './objects/celestial/StarField';
import { Planet } from './objects/celestial/Planet';
import { Sun } from './objects/celestial/Sun';
import { OrbitVisualizer } from './tools/OrbitVisualizer';
import { TimeController } from './tools/TimeController';
import * as THREE from 'three';
import planetData from './data/planets.json';
import { KM_TO_UNIT } from './utils/Constants';
import { Ship } from './objects/player/Ship';
import { ChaseCamera } from './objects/player/ChaseCamera';
import { ModeManager } from './core/ModeManager';
import { HUD } from './ui/HUD';
import { InteractionManager } from './core/InteractionManager';
import { InfoPanel } from './ui/InfoPanel';
import { Teleporter } from './tools/Teleporter';
import { Minimap } from './ui/Minimap';
import { Wayfinder } from './tools/Wayfinder';

async function main() {
  const engine = new Engine('app');

  // --- 1. LOAD ASSETS (TEXTURES & MODELS) ---
  console.log("Loading assets...");

  // A. Load Tekstur Spesial
  const sunTex = await engine.assets.loadTexture('sun', '/textures/sun.jpg');
  const earthTex = await engine.assets.loadTexture('earth', '/textures/earth_day.jpg');
  const earthNormal = await engine.assets.loadTexture('earthNorm', '/textures/earth_normal.jpg');
  const earthCloud = await engine.assets.loadTexture('earthCloud', '/textures/earth_clouds.jpg');
  const moonTex = await engine.assets.loadTexture('moon', '/textures/moon.jpg');

  // B. Load Tekstur Planet Lain
  const planetNames = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const textures = {};

  for (const name of planetNames) {
    textures[name] = await engine.assets.loadTexture(name, `/textures/${name}.jpg`);
  }

  // C. LOAD MODEL PESAWAT (GLB)
  let shipModel = null;
  try {
    shipModel = await engine.assets.loadModel('ship', '/models/spaceship.glb');
  } catch (err) {
    console.warn("⚠️ Model pesawat tidak ditemukan, menggunakan kotak default.");
  }

  console.log("All Assets loaded!");

  // --- 2. SETUP SCENE ---
  const stars = new StarField();
  engine.scene.add(stars.getMesh());

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
  engine.scene.add(ambientLight);

  const timeController = new TimeController();
  engine.loop.setTimeController(timeController);

  // --- 3. CREATE OBJECTS ---

  // [PENTING] Array untuk menampung semua planet agar bisa didaratkan
  const allPlanets = [];

  // A. MATAHARI
  const sun = new Sun(planetData.sun, sunTex);
  engine.scene.add(sun.getMesh());
  engine.loop.updatables.push(sun);

  // Lampu Matahari
  const sunLight = new THREE.PointLight(0xffffff, 2.5, 0, 0);
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = true;
  engine.scene.add(sunLight);

  // B. BUMI
  const earth = new Planet(planetData.earth, {
    map: earthTex,
    normal: earthNormal,
    cloud: earthCloud
  });
  engine.scene.add(earth.getMesh());
  engine.loop.updatables.push(earth);

  // [WAJIB] Masukkan Bumi ke daftar planet pendaratan
  allPlanets.push(earth);

  const earthOrbit = new OrbitVisualizer(planetData.earth, 0x444444);
  engine.scene.add(earthOrbit.getMesh());

  // C. PLANET LAINNYA (LOOP)
  planetNames.forEach(name => {
    const data = planetData[name];
    if (data) {
      const planet = new Planet(data, {
        map: textures[name]
      });
      engine.scene.add(planet.getMesh());
      engine.loop.updatables.push(planet);

      // [WAJIB] Masukkan planet lain ke daftar planet pendaratan
      allPlanets.push(planet);

      const orbit = new OrbitVisualizer(data, 0x333333);
      engine.scene.add(orbit.getMesh());
    }
  });


  // D. PLAYER SHIP
  // Kirim 'allPlanets' ke constructor Ship agar gravitasi aktif!
  const ship = new Ship(engine.scene, shipModel, allPlanets);

  engine.scene.add(ship.getMesh());
  engine.loop.updatables.push(ship);

  // --- SETUP CAMERA & TOOLS (Fixed Duplicate ChaseCam) ---
  
  // 1. Buat Kamera (CUKUP SEKALI SAJA)
  const chaseCam = new ChaseCamera(engine.camera, ship.getMesh());
  engine.loop.updatables.push(chaseCam);

  // 2. Mode Manager
  const modeManager = new ModeManager(engine, chaseCam);
  engine.loop.updatables.push({ tick: () => modeManager.tick() });

  // 3. Teleporter
  // [FIX] Definisikan target teleport SETELAH semua planet dimasukkan ke allPlanets
  const teleportTargets = [...allPlanets];
  teleportTargets.push(sun); // Tambahkan matahari manual

  const teleporter = new Teleporter(engine.scene, ship, chaseCam, teleportTargets);
  engine.loop.updatables.push(teleporter);

  // Lampu Ekor Pesawat
  const shipLight = new THREE.PointLight(0x00ffff, 1, 10);
  ship.getMesh().add(shipLight);
  shipLight.position.set(0, 0, 1);

  // E. BULAN
  const moonData = planetData.moon;
  const moonVisualDist = moonData.distanceFromSunKm * KM_TO_UNIT * 50;
  const moonGeo = new THREE.SphereGeometry(moonData.radiusKm * KM_TO_UNIT * 100, 32, 32);
  const moonMat = new THREE.MeshStandardMaterial({
    map: moonTex,
    roughness: 0.9
  });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);

  moonMesh.userData = { type: 'MOON', name: 'The Moon', description: moonData.description, details: moonData };

  earth.getMesh().add(moonMesh);

  moonMesh.accumulatedTime = 0;
  moonMesh.tick = (delta) => {
    moonMesh.accumulatedTime += delta;
    moonMesh.position.x = Math.cos(moonMesh.accumulatedTime) * moonVisualDist;
    moonMesh.position.z = Math.sin(moonMesh.accumulatedTime) * moonVisualDist;
    moonMesh.rotation.y += delta;
  };
  engine.loop.updatables.push(moonMesh);

  // --- 4. UI & SYSTEMS ---
  engine.camera.position.set(0, 20, 150);
  engine.camera.lookAt(0, 0, 100);

  const hud = new HUD();
  const interactionManager = new InteractionManager(engine.camera, engine.scene);
  const infoPanel = new InfoPanel();

  // --- [UI SYSTEM UPDATE] ---

  // 1. Setup Minimap (Radar)
  // Kita gunakan 'allPlanets' yang sudah kita buat di atas
  const mapObjects = [...allPlanets];
  // mapObjects.push(sun); // (Opsional: Aktifkan jika ingin matahari terlihat di radar)

  const minimap = new Minimap(mapObjects);

  // Update minimap: Kirim Mesh Pesawat (untuk rotasi)
  engine.loop.updatables.push({
    tick: () => minimap.update(ship.getMesh())
  });

  // 2. Setup Wayfinder (GPS Navigation)
  // Gunakan allPlanets agar GPS menunjuk ke planet yang benar
  const wayfinder = new Wayfinder(engine.scene, ship.getMesh(), allPlanets);
  engine.loop.updatables.push(wayfinder);

  // --- [AKHIR UI SYSTEM] ---

  // Warning UI
  const warningDiv = document.createElement('div');
  warningDiv.style.position = 'absolute';
  warningDiv.style.top = '20%';
  warningDiv.style.width = '100%';
  warningDiv.style.textAlign = 'center';
  warningDiv.style.color = 'red';
  warningDiv.style.fontSize = '24px';
  warningDiv.style.fontFamily = 'Arial, sans-serif';
  warningDiv.style.fontWeight = 'bold';
  warningDiv.style.display = 'none';
  warningDiv.innerText = '⚠️ WARNING: LEAVING SOLAR SYSTEM ⚠️\nTurning back...';
  document.body.appendChild(warningDiv);

  engine.loop.updatables.push({
    tick: () => {
      if (ship.isOutOfBounds) {
        warningDiv.style.display = 'block';
        warningDiv.style.opacity = (Date.now() % 500 < 250) ? '1' : '0.5';
      } else {
        warningDiv.style.display = 'none';
      }
    }
  });

  engine.start();
}

main();