class EventBus {
    constructor() {
        this.events = {}; // Tempat menyimpan daftar pendengar
    }

    /**
     * Subscribe: Mendaftarkan fungsi untuk mendengarkan event tertentu.
     * @param {string} eventName - Nama event (misal: 'speedUpdate')
     * @param {function} callback - Fungsi yang dijalankan saat event terjadi
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * Publish/Emit: Mengirim sinyal event beserta datanya.
     * @param {string} eventName - Nama event yang ditembakkan
     * @param {any} data - Data yang dikirim (misal: angka kecepatan)
     */
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                callback(data);
            });
        }
    }

    /**
     * Unsubscribe: Berhenti mendengarkan (Untuk cleanup memori)
     */
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }
}

// Export sebagai instance (Singleton) agar state-nya dibagi ke seluruh aplikasi
export const bus = new EventBus();