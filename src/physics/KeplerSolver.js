export class KeplerSolver {
    /**
     * Menghitung posisi X dan Z berdasarkan waktu.
     * @param {number} a - Semi-Major Axis (Jarak rata-rata dalam unit game)
     * @param {number} e - Eccentricity (Kelonjongan, 0 = Lingkaran, 0.1 - 0.9 = Elips)
     * @param {number} period - Lama waktu satu kali orbit (dalam detik game)
     * @param {number} time - Waktu saat ini (cumulative time)
     * @returns {Object} { x, z }
     */
    static solve(a, e, period, time) {
        // 1. Hitung Sudut saat ini (Mean Anomaly)
        // Rumus: (2 * PI * time) / period
        // Semakin besar time, sudut semakin bertambah (berputar)
        const angle = (2 * Math.PI * time) / period;

        // 2. Hitung Sumbu Pendek (Semi-Minor Axis / b)
        // Elips punya sumbu panjang (a) dan sumbu pendek (b).
        // Rumus: b = a * akar(1 - e^2)
        const b = a * Math.sqrt(1 - (e * e));

        // 3. Hitung Posisi (Parametric Equation of Ellipse)
        // Kita pakai Math.cos untuk X dan Math.sin untuk Z (karena Y itu atas-bawah)
        // Ini membuat objek bergerak melingkar/elips
        const x = a * Math.cos(angle);
        const z = b * Math.sin(angle);

        // 4. Geser titik pusat (Fokus)
        // Matahari tidak di tengah persis elips, tapi di salah satu titik fokus.
        // Kita geser orbitnya sebesar: a * e
        const x_offset = x - (a * e);

        return { x: x_offset, z: z };
    }
}