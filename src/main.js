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


async function main() {
  const engine = new Engine('app');

  // 1. LOAD TEXTURES (Tunggu sampai selesai / Await)
  console.log("Loading textures...");

  // --- Load Tekstur Spesial (Matahari, Bumi, Bulan) ---
  const sunTex = await engine.assets.loadTexture('sun', '/textures/sun.jpg');
  const earthTex = await engine.assets.loadTexture('earth', '/textures/earth_day.jpg');
  const earthNormal = await engine.assets.loadTexture('earthNorm', '/textures/earth_normal.jpg');
  const earthCloud = await engine.assets.loadTexture('earthCloud', '/textures/earth_clouds.jpg'); // [PENTING]
  const moonTex = await engine.assets.loadTexture('moon', '/textures/moon.jpg');

  // --- [BARU] Load Tekstur Planet Lainnya ---
  // Pastikan Anda sudah punya file jpg-nya di folder public/textures/
  const planetNames = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const textures = {};
  
  for (const name of planetNames) {
      // Kita load satu per satu
      textures[name] = await engine.assets.loadTexture(name, `/textures/${name}.jpg`);
  }
  
  console.log("All Textures loaded!");

  // 2. Setup Dasar
  const stars = new StarField();
  engine.scene.add(stars.getMesh());

  // Ambient light redup biar kontras matahari terasa
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
  engine.scene.add(ambientLight);

  // Setup Waktu
  const timeController = new TimeController();
  engine.loop.setTimeController(timeController);

  // --- PEMBUATAN OBJEK DENGAN TEKSTUR ---

  // A. MATAHARI (Pakai Class Sun Baru)
  const sun = new Sun(planetData.sun, sunTex);
  engine.scene.add(sun.getMesh());
  engine.loop.updatables.push(sun);

  // B. BUMI (Pakai Texture, Normal Map, DAN AWAN) - KODE LAMA TETAP ADA
  const earth = new Planet(planetData.earth, {
    map: earthTex,
    normal: earthNormal,
    cloud: earthCloud 
  });
  engine.scene.add(earth.getMesh());
  engine.loop.updatables.push(earth);

  // C. Orbit Bumi
  const earthOrbit = new OrbitVisualizer(planetData.earth, 0x444444);
  engine.scene.add(earthOrbit.getMesh());

  // --- [BARU] D. PLANET LAINNYA (LOOPING) ---
  // Kode ini akan membuat Mercury s/d Neptune secara otomatis
  planetNames.forEach(name => {
      const data = planetData[name];
      // Hanya buat jika datanya ada di JSON
      if (data) {
          // Buat Planet
          const planet = new Planet(data, {
              map: textures[name] // Pakai tekstur yang diload di atas
          });
          engine.scene.add(planet.getMesh());
          engine.loop.updatables.push(planet);

          // Buat Orbit Visualizer untuk planet ini
          const orbit = new OrbitVisualizer(data, 0x333333); // Warna abu gelap
          engine.scene.add(orbit.getMesh());
      }
  });


  // [PERBAIKAN PENTING DI SINI]
  // Kirim engine.scene agar fitur Exhaust (Jejak Mesin) bisa jalan
  const ship = new Ship(engine.scene);
  engine.scene.add(ship.getMesh());
  engine.loop.updatables.push(ship);

  const shipHelper = new THREE.BoxHelper(ship.getMesh(), 0x00ff00); // Kotak Hijau Terang
  engine.scene.add(shipHelper);

  // Agar kotaknya ikut bergerak sama pesawat
  shipHelper.tick = () => shipHelper.update();
  engine.loop.updatables.push(shipHelper);

  const chaseCam = new ChaseCamera(engine.camera, ship.getMesh());
  engine.loop.updatables.push(chaseCam); // Masukkan ke loop agar posisi dihitung terus

  // 2. Buat Mode Manager
  const modeManager = new ModeManager(engine, chaseCam);
  // Kita perlu update modeManager juga setiap frame untuk cek tombol 'C'
  engine.loop.updatables.push({ tick: () => modeManager.tick() });

  // (Opsional) PointLight kecil di ekor pesawat biar keren
  const shipLight = new THREE.PointLight(0x00ffff, 1, 10);
  ship.getMesh().add(shipLight);
  shipLight.position.set(0, 0, 1);

  // E. BULAN (Attach ke Bumi)
  const moonData = planetData.moon;
  const moonVisualDist = moonData.distanceFromSunKm * KM_TO_UNIT * 50;

  // Bulan Mesh Manual
  const moonGeo = new THREE.SphereGeometry(moonData.radiusKm * KM_TO_UNIT * 100, 32, 32);
  const moonMat = new THREE.MeshStandardMaterial({
    map: moonTex,
    roughness: 0.9
  });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  
  // Agar Bulan bisa diklik Raycaster (Tambahkan userData)
  moonMesh.userData = { type: 'MOON', name: 'The Moon', description: moonData.description, details: moonData };

  earth.getMesh().add(moonMesh);

  // Logic Orbit Bulan
  moonMesh.accumulatedTime = 0;
  moonMesh.tick = (delta) => {
    moonMesh.accumulatedTime += delta;
    moonMesh.position.x = Math.cos(moonMesh.accumulatedTime) * moonVisualDist;
    moonMesh.position.z = Math.sin(moonMesh.accumulatedTime) * moonVisualDist;
    moonMesh.rotation.y += delta;
  };
  engine.loop.updatables.push(moonMesh);

  // Posisi awal kamera (Debugging agar dekat pesawat saat mulai)
  engine.camera.position.set(0, 20, 150);
  engine.camera.lookAt(0, 0, 100);

  const hud = new HUD();

  // UI WARNING (Invisible Wall)
  const warningDiv = document.createElement('div');
  warningDiv.style.position = 'absolute';
  warningDiv.style.top = '20%';
  warningDiv.style.width = '100%';
  warningDiv.style.textAlign = 'center';
  warningDiv.style.color = 'red';
  warningDiv.style.fontSize = '24px';
  warningDiv.style.fontFamily = 'Arial, sans-serif';
  warningDiv.style.fontWeight = 'bold';
  warningDiv.style.display = 'none'; // Sembunyi dulu
  warningDiv.innerText = '⚠️ WARNING: LEAVING SOLAR SYSTEM ⚠️\nTurning back...';
  document.body.appendChild(warningDiv);

  const interactionManager = new InteractionManager(engine.camera, engine.scene);

  // 2. Setup Info Panel UI
  const infoPanel = new InfoPanel();

  // Update Loop UI
  engine.loop.updatables.push({
    tick: () => {
      if (ship.isOutOfBounds) {
        warningDiv.style.display = 'block';
        // Efek kedip
        warningDiv.style.opacity = (Date.now() % 500 < 250) ? '1' : '0.5';
      } else {
        warningDiv.style.display = 'none';
      }
    }
  });

  engine.start();
}

main();