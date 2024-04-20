import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import fireworkVertexShader from './shaders/firework/vertex.glsl';
import fireworkFragmentShader from './shaders/firework/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: new THREE.Vector2(window.innerWidth * Math.min(window.devicePixelRatio, 2), window.innerHeight * Math.min(window.devicePixelRatio, 2)),
    pixelRatio: Math.min(window.devicePixelRatio, 2) // set pixel ratio to 2 for every device
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    sizes.resolution.set(window.innerWidth * Math.min(window.devicePixelRatio, 2), window.innerHeight * Math.min(window.devicePixelRatio, 2))

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1.5, 0, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Fireworks
 */
const textures = [
    textureLoader.load('/particles/1.png'),
    textureLoader.load('/particles/2.png'),
    textureLoader.load('/particles/3.png'),
    textureLoader.load('/particles/4.png'),
    textureLoader.load('/particles/5.png'),
    textureLoader.load('/particles/6.png'),
    textureLoader.load('/particles/7.png'),
    textureLoader.load('/particles/8.png')
]

const createFirework = (count, position, size, texture, radius) => {
    // Geometry
    const positionsArray = new Float32Array(count * 3); // x y z for each vertex and as such you multiply it by 3
    const sizesArray = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3; // the first three values of the array are the x y z of 1 single particle, and the same applies for the rest of the values of the array
    
        const spherical = new THREE.Spherical(
            radius * (0.75 + Math.random() * 0.25),
            Math.random() * Math.PI, // half a circle
            Math.random() * Math.PI * 2 // full circle
        );
        const position = new THREE.Vector3().setFromSpherical(spherical);

        positionsArray[i3    ] = position.x; // replaced the old positioning as to now render the particles inside a sphere and not inside a cuboid, as to resemble an explosion // x, - 0.5 positions the particle at the center
        positionsArray[i3 + 1] = position.y; // replaced the old positioning as to now render the particles inside a sphere and not inside a cuboid, as to resemble an explosion // y, - 0.5 positions the particle at the center
        positionsArray[i3 + 2] = position.z; // replaced the old positioning as to now render the particles inside a sphere and not inside a cuboid, as to resemble an explosion // z, - 0.5 positions the particle at the center

        sizesArray[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsArray, 3)); // the 3 parameter informs the GPU that it has to take 3 values per particle
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizesArray, 1)); // only 1 value per vertex this time

    // Material
    texture.flipY = false; // flips the heart which could be upside down

    const material = new THREE.ShaderMaterial({
        vertexShader: fireworkVertexShader,
        fragmentShader: fireworkFragmentShader,
        uniforms: {
            uSize: new THREE.Uniform(size),
            uResolution: new THREE.Uniform(sizes.resolution),
            uTexture: new THREE.Uniform(texture)
        },
        transparent: true,
        depthWrite: false, // fixes the background of textures occluding each other
        blending: THREE.AdditiveBlending // fixes light brightness
    });

    // Points
    const firework = new THREE.Points(geometry, material);
    firework.position.copy(position); // send the position to the fireworks, this will come in handy later for randomizing things
    scene.add(firework);
}

createFirework(
    100, // 100 particles 
    new THREE.Vector3(), // Position
    0.5, // Particle size
    textures[7],
    1 // radius
);

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()