import * as THREE from "three";
import { setup, app } from "./app/setup.js";
import { initEventListeners } from "./app/eventListeners.js";
import Pendulum from "./components/Pendulum.js";

import InclinedPlane from "./components/inclinedPlane.js";
import { MeshObject } from "./components/MeshObject.js";
import { roomMC } from "./utils/materialCoefficents.js";
import SeeSaw from "./components/SeeSaw.js";
import Domino from "./components/Domino.js";
import CatapultBall from "./components/CatapultBall.js";
import {
  placeBottomAt,
  placeLeftAt,
  placeNearAt,
} from "./utils/placeHelper.js";

await setup();
initEventListeners();

function roomInit() {
  const roomGeometry = new THREE.BoxGeometry(2, 2, 2);
  roomGeometry.scale(-200, 100, 250);
  const roomObj = new MeshObject(roomGeometry, roomMC, "room");
  return roomObj;
}

const { scene, cameraController, renderer, controls } = app;

const room = roomInit();
scene.add(room);

const pendulum = new Pendulum();
pendulum.scale.set(10, 10, 10);
placeBottomAt(pendulum, -100);
placeLeftAt(pendulum, -150);
placeNearAt(pendulum, -250);
room.add(pendulum);

// controls.target.copy(pendulum.position);
// camera.lookAt(pendulum.position);

const inclinedPlane = new InclinedPlane();
inclinedPlane.scale.multiplyScalar(7);
placeBottomAt(inclinedPlane, -100);
placeLeftAt(inclinedPlane, -77);
placeNearAt(inclinedPlane, -250);
room.add(inclinedPlane);

const dominos = [];
for (let i = 0; i < 10; i++) {
  const domino = new Domino();
  domino.scale.multiplyScalar(20);
  domino.position.set(0, 0, -75 + i * 20);
  placeBottomAt(domino, -100);
  placeLeftAt(domino, 84);
  scene.add(domino);
  dominos.push(domino);
}
const lastDomino = dominos[dominos.length - 1];

const seeSaw = new SeeSaw();
seeSaw.scale.multiplyScalar(20);
scene.add(seeSaw);
seeSaw.position.set(0, 0, -75 + (dominos.length + 1) * 20);
placeBottomAt(seeSaw, -100);
placeLeftAt(seeSaw, 84);

const catapultBall = new CatapultBall();
scene.add(catapultBall);
catapultBall.scale.multiplyScalar(20);
catapultBall.position.set(0, 0, -75 + (dominos.length + 1) * 20);
placeBottomAt(catapultBall, -100 + 5);
placeLeftAt(catapultBall, 165);

const clock = new THREE.Clock();

let trackObj = pendulum;
function animate() {
  const dt = clock.getDelta();

  pendulum.update(dt);
  inclinedPlane.update(dt);
  dominos.forEach((domino) => domino.update(dt));
  seeSaw.update(dt);
  catapultBall.update(dt);

  if (pendulum.intersectsWith(inclinedPlane)) {
    inclinedPlane.animationPhase = 1;
    trackObj = inclinedPlane;
  }

  if (inclinedPlane.intesectsWith(dominos[0])) {
    dominos[0].tipOver();
    inclinedPlane.animationPhase = 8;
    trackObj = dominos[0];
  }

  for (let i = 0; i < dominos.length - 1; i++) {
    if (dominos[i].falling && !dominos[i + 1].falling) {
      if (dominos[i].intersectsWithDomino(dominos[i + 1])) {
        dominos[i + 1].tipOver();
        dominos[i].constrainToDomino(dominos[i + 1]);
        trackObj = dominos[i + 1];
      }
    }
  }

  if (lastDomino.falling && !seeSaw.rotating) {
    if (lastDomino.intersectsWithSeeSaw(seeSaw)) {
      seeSaw.startRotation();
      catapultBall.launchBall();
      lastDomino.constrainToSeeSaw(seeSaw);
      trackObj = catapultBall;
    }
  }

  controls.update();
  cameraController.setFocusPoint(trackObj.getFocusPoint());
  cameraController.update();
  renderer.render(scene, cameraController.camera);
  requestAnimationFrame(animate);
}

animate();
