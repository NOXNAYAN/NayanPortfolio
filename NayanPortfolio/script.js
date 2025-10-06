import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- 1. PORTFOLIO MODAL LOGIC ---

const portfolioItems = document.querySelectorAll('.portfolio-item');
const modal = document.getElementById('portfolio-modal');
const modalTitle = document.getElementById('modal-title');
const modalRole = document.getElementById('modal-role');
const modalTools = document.getElementById('modal-tools');
const modalDesc = document.getElementById('modal-desc');
const closeButton = document.querySelector('.close-button');

portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        // Get data from data-* attributes
        const title = item.getAttribute('data-title');
        const role = item.getAttribute('data-role');
        const tools = item.getAttribute('data-tools');
        const desc = item.getAttribute('data-desc');

        // Populate modal
        modalTitle.textContent = title;
        modalRole.textContent = role;
        modalTools.textContent = tools;
        modalDesc.textContent = desc;
        
        // Show modal
        modal.style.display = 'block';
    });
});

// Close modal functionality
const closeModal = () => {
    modal.style.display = 'none';
};

closeButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        closeModal();
    }
});


// --- 2. THREE.JS 3D MODEL VIEWER LOGIC ---

const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById('model-canvas');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1f1f1f); // Match portfolio background

// Camera
const camera = new THREE.PerspectiveCamera(
    75, // Field of View
    canvasContainer.clientWidth / canvasContainer.clientHeight, // Aspect Ratio
    0.1, // Near clip plane
    1000 // Far clip plane
);
camera.position.set(0, 1, 3); // Position the camera

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace; // For correct colors

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7.5); // Position light from above and to the side
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Makes the rotation feel smoother
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.target.set(0, 0.5, 0); // Focus the camera on a point slightly above the origin

// GLTF Loader
const loader = new GLTFLoader();
loader.load(
    'assets/models/your-model.glb', // <-- IMPORTANT: REPLACE WITH YOUR MODEL PATH
    (gltf) => {
        const model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // Center model at the origin
        
        scene.add(model);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error happened while loading the model:', error);
        // Display an error message on the canvas if loading fails
        const errorMsg = document.createElement('div');
        errorMsg.innerText = "Failed to load 3D model. Please check the file path and console.";
        errorMsg.style.color = "red";
        errorMsg.style.position = "absolute";
        errorMsg.style.top = "50%";
        errorMsg.style.left = "50%";
        errorMsg.style.transform = "translate(-50%, -50%)";
        canvasContainer.appendChild(errorMsg);
    }
);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required for damping
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    // Update camera aspect ratio
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
});