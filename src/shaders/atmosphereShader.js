// Vertex Shader: Mengatur bentuk & posisi titik
export const vertexShader = `
varying vec3 vNormal;

void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader: Mengatur warna & transparansi (Fresnel Effect)
export const fragmentShader = `
varying vec3 vNormal;

void main() {
    // Hitung intensitas berdasarkan sudut pandang kamera (Fresnel)
    // Semakin ke pinggir bola, semakin terang (0.0 -> 1.0)
    float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
    
    // Warna Atmosfer (Biru Muda: R=0.3, G=0.6, B=1.0)
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
}
`;