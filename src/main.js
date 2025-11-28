import * as THREE from "three";
import { setup, app } from "./app/setup.js";
import Pendulum from "./components/Pendulum.js";
import InclinedPlane from "./components/inclinedPlane.js";
import { MeshObject } from "./components/MeshObject.js";
import { roomMC } from "./utils/materialCoefficents.js";

await setup();
function roomInit() {
  const roomGeometry = new THREE.BoxGeometry(2, 2, 2);
  roomGeometry.scale(-100, 100, 100);
  const roomObj = new MeshObject(roomGeometry, roomMC, "room");
  return roomObj;
}

const { scene, camera, renderer, controls } = app;

const pendulum = new Pendulum();
scene.add(pendulum);

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(5, 5, 5);
// scene.add(directionalLight);

const inclinedPlane = new InclinedPlane();
scene.add(inclinedPlane);

// inclinedPlane.position.set(0, -30, 0);
const room = roomInit();
scene.add(room);


const clock = new THREE.Clock();
function animate() {
  const dt = clock.getDelta();

  pendulum.update(dt);
  inclinedPlane.update(dt);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
