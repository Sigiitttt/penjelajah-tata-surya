export class InputHandler {
    constructor() {
        this.keys = {}; // Menyimpan status tombol (Pressed = true/false)

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    // Fungsi cek apakah tombol tertentu sedang ditekan
    isDown(code) {
        return this.keys[code] === true;
    }
}