import * as THREE from "three";
import { setup, app } from "./app/setup.js";
import Pendulum from "./components/Pendulum.js";

import InclinedPlane from "./components/inclinedPlane.js";
import { MeshObject } from "./components/MeshObject.js";
import { roomMC } from "./utils/materialCoefficents.js";
import SeeSaw from "./components/SeeSaw.js";
import Domino from "./components/Domino.js";
import CatapultBall from "./components/CatapultBall.js";


await setup();
function roomInit() {
  const roomGeometry = new THREE.BoxGeometry(2, 2, 2);
  roomGeometry.scale(-100, 100, 100);
  const roomObj = new MeshObject(roomGeometry, roomMC, "room");
  return roomObj;
}

const { scene, camera, renderer, controls } = app;



const dominos = [];
for (let i = 0; i < 10; i++) {
  const domino = new Domino();
  domino.position.set(0, 0, i);
  scene.add(domino);
  dominos.push(domino);
}
const lastDomino = dominos[dominos.length - 1];
dominos[0].tipOver();

const seeSaw = new SeeSaw();
scene.add(seeSaw);
seeSaw.position.set(2, 0.5, dominos.length + 1);

const catapultBall = new CatapultBall();
scene.add(catapultBall);
catapultBall.position.set(4, 0.6, dominos.length + 1);

const inclinedPlane = new InclinedPlane();
scene.add(inclinedPlane);

// inclinedPlane.position.set(0, -30, 0);
const room = roomInit();
scene.add(room);

const clock = new THREE.Clock();
function animate() {
  const dt = clock.getDelta();


  // pendulum.update(dt);
  dominos.forEach((domino) => domino.update(dt));
  seeSaw.update(dt);
  catapultBall.update(dt);
    inclinedPlane.update(dt);

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
