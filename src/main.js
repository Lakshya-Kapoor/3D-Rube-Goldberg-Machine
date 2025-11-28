import * as THREE from "three";
import { setup, app } from "./app/setup.js";
import Pendulum from "./components/Pendulum.js";

await setup();

const { scene, camera, renderer, controls } = app;

const pendulum = new Pendulum();
scene.add(pendulum);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const clock = new THREE.Clock();
function animate() {
  const dt = clock.getDelta();

  pendulum.update(dt);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
