import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { setup } from "./app/setup.js";
import { uvMap } from "./utils/uvMap.js";
import { assetManager } from "./utils/assetManager.js";
import Pendulum from "./objects/Pendulum.js";
import Domino from "./objects/Domino.js";

await setup();

// Get canvas element
const canvas = document.getElementById("main-canvas");

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-10, 5, 2);

// Create renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Add axis helper
const axisHelper = new THREE.AxesHelper(5);
scene.add(axisHelper);

// pendulum
const pendulum = new Pendulum();
scene.add(pendulum);

// domino
/** @type {Domino[]} */
const dominos = [];
for (let i = 0; i < 5; i++) {
  const domino = new Domino();
  domino.position.set(0, 0, i);
  scene.add(domino);
  dominos.push(domino);
}
dominos[0].tipOver();

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

// Animation loop
function animate() {
  const dt = clock.getDelta();

  pendulum.update(dt);
  dominos.forEach((domino) => domino.update(dt));

  for (let i = 0; i < dominos.length - 1; i++) {
    if (dominos[i].falling && !dominos[i + 1].falling) {
      if (dominos[i].intersectsWith(dominos[i + 1])) {
        dominos[i + 1].tipOver();
        dominos[i].constrainTo(dominos[i + 1]);
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
