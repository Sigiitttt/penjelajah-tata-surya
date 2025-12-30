import { WORLD_BOUNDARY } from '../utils/Constants';

export class Minimap {
    constructor(planetList) {
        this.planets = planetList; 
        this.container = document.createElement('div');
        this.canvas = document.createElement('canvas');
        
        this.initStyle();
        
        this.ctx = this.canvas.getContext('2d');
        
        // Ukuran Map
        this.size = 200; 
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        
        // Scale diperkecil sedikit agar jangkauan radar lebih luas
        this.scale = (this.size / 2) / (WORLD_BOUNDARY * 1.5); 

        this.container.appendChild(this.canvas);
        document.body.appendChild(this.container);
    }

    initStyle() {
        this.container.style.position = 'absolute';
        this.container.style.top = '20px';
        this.container.style.left = '20px'; 
        this.container.style.width = '200px';
        this.container.style.height = '200px';
        this.container.style.backgroundColor = 'rgba(0, 15, 40, 0.85)'; 
        this.container.style.border = '2px solid #00ffff';
        this.container.style.borderRadius = '50%'; 
        this.container.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
        this.container.style.overflow = 'hidden';
        this.container.style.zIndex = '1000';
    }

    // Kita butuh posisi pesawat DAN rotasinya (mesh)
    update(shipMesh) {
        const ctx = this.ctx;
        const center = this.size / 2;

        const shipPos = shipMesh.position;
        // Ambil rotasi Y pesawat (arah hadap kiri/kanan)
        const shipRotY = shipMesh.rotation.y;

        // 1. Bersihkan Canvas
        ctx.clearRect(0, 0, this.size, this.size);

        // 2. Gambar Grid Radar (Lingkaran Statis)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(center, center, this.size * 0.25, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(center, center, this.size * 0.45, 0, Math.PI * 2); ctx.stroke();

        // 3. Gambar Indikator "Utara" (N) agar pemain tidak bingung arah
        // Utara (World -Z) akan berputar sesuai rotasi pesawat
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(shipRotY); // Putar canvas
        
        // Tulis "N" di sisi atas (yang merepresentasikan Utara Dunia)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("N", 0, -this.size * 0.4);
        ctx.restore();

        // 4. Gambar Planet (Relative terhadap Pesawat)
        this.planets.forEach(planet => {
            // A. Hitung Jarak Relatif (Jarak planet dari pesawat)
            const dx = planet.mesh.position.x - shipPos.x;
            const dz = planet.mesh.position.z - shipPos.z;

            // B. Rotasi Matematika (Memutar posisi planet berdasarkan arah hadap pesawat)
            // Rumus Rotasi 2D:
            // x' = x cos(θ) - y sin(θ)
            // y' = x sin(θ) + y cos(θ)
            // θ adalah rotasi pesawat. Karena radar berlawanan, kita pakai shipRotY.
            
            const rx = dx * Math.cos(shipRotY) - dz * Math.sin(shipRotY);
            const rz = dx * Math.sin(shipRotY) + dz * Math.cos(shipRotY);

            // C. Mapping ke Canvas
            // Perhatikan: Di layar, -Z adalah atas (negatif Y di canvas)
            const mapX = center + (rx * this.scale);
            const mapY = center + (rz * this.scale);

            // D. Gambar Titik Planet
            // Cek apakah titik masih di dalam radar (clipping)
            const distOnMap = Math.sqrt(Math.pow(mapX - center, 2) + Math.pow(mapY - center, 2));
            if (distOnMap < (this.size / 2) - 5) {
                let color = '#ffffff';
                const name = planet.data.name;
                if (name === 'The Sun') color = '#ffff00';
                else if (name === 'Earth') color = '#00aaff';
                else if (name === 'Mars') color = '#ff3300';
                else if (name === 'Jupiter') color = '#ffaa00';
                else color = '#aaaaaa';

                // Gambar Planet
                ctx.fillStyle = color;
                ctx.beginPath();
                // Matahari digambar lebih besar
                const radius = (name === 'The Sun') ? 4 : 2.5;
                ctx.arc(mapX, mapY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 5. Gambar Pesawat (Segitiga Diam di Tengah)
        // Karena peta yang berputar, pesawat selalu menghadap atas
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(center, center - 6); // Moncong (Atas)
        ctx.lineTo(center + 5, center + 5); // Kanan Bawah
        ctx.lineTo(center, center + 3);     // Pantat (Indented)
        ctx.lineTo(center - 5, center + 5); // Kiri Bawah
        ctx.closePath();
        ctx.fill();
        
        // Efek Glow Pesawat
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ff00';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}