import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { setup } from "./app/setup.js";
import { uvMap } from "./utils/uvMap.js";
import { assetManager } from "./utils/assetManager.js";
import Pendulum from "./objects/Pendulum.js";
import Domino from "./objects/Domino.js";
import SeeSaw from "./objects/SeeSaw.js";
import CatapultBall from "./objects/CatapultBall.js";

await setup();

// Get canvas element
const canvas = document.getElementById("main-canvas");

// Create scene
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-5, 5, 10);

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

// dominos
const dominos = [];
for (let i = 0; i < 5; i++) {
  const domino = new Domino();
  domino.position.set(0, 0, i);
  scene.add(domino);
  dominos.push(domino);
}
const lastDomino = dominos[dominos.length - 1];
dominos[0].tipOver();

// see-saw
const seeSaw = new SeeSaw();
scene.add(seeSaw);
seeSaw.position.set(2, 0.5, dominos.length + 1);

// Catapult ball
const catapultBall = new CatapultBall();
catapultBall.position.set(4, 0.6, dominos.length + 1);
scene.add(catapultBall);

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
  seeSaw.update(dt);
  catapultBall.update(dt);

  for (let i = 0; i < dominos.length - 1; i++) {
    if (dominos[i].falling && !dominos[i + 1].falling) {
      if (dominos[i].intersectsWithDomino(dominos[i + 1])) {
        dominos[i + 1].tipOver();
        dominos[i].constrainToDomino(dominos[i + 1]);
      }
    }
  }

  if (lastDomino.falling && !seeSaw.rotating) {
    if (lastDomino.intersectsWithSeeSaw(seeSaw)) {
      seeSaw.startRotation();
      catapultBall.launchBall();
      lastDomino.constrainToSeeSaw(seeSaw);
    }
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
