import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { MeshObject } from "./MeshObject.js";
import { ball1MC, sampleMC } from "../utils/materialCoefficents.js";
import { pendulumMC } from "../utils/materialCoefficents.js";
export default class Pendulum extends BaseObject {
  constructor() {
    super();

    const stringDim = { length: 5, radius: 0.05 };
    const bob = { radius: 1 };
    const stand = {
      base: { width: 3, height: 0.3, depth: 3 },
      verticalPole: { radius: 0.15, height: 15 },
      horizontalArm: { radius: 0.1, length: 2 },
    };

    this.length = stringDim.length + bob.radius * 2;

    // STATIC PART
    const baseGeo = new THREE.BoxGeometry(
      stand.base.width,
      stand.base.height,
      stand.base.depth,
      4,4,4
    );
    this.base = new MeshObject(baseGeo, pendulumMC, "PendulumBase");
    this.base.position.y = stand.base.height / 2;

    const verticalPoleGeo = new THREE.CylinderGeometry(
      stand.verticalPole.radius,
      stand.verticalPole.radius,
      stand.verticalPole.height
    );
    this.verticalPole = new MeshObject(
      verticalPoleGeo,
      pendulumMC,
      "PendulumVerticalPole"
    );
    this.verticalPole.position.y =
      stand.base.height + stand.verticalPole.height / 2;

    const horizontalArmGeo = new THREE.CylinderGeometry(
      stand.horizontalArm.radius,
      stand.horizontalArm.radius,
      stand.horizontalArm.length
    );
    this.horizontalArm = new MeshObject(
      horizontalArmGeo,
      pendulumMC,
      "PendulumHorizontalArm"
    );
    this.horizontalArm.rotation.x = Math.PI / 2;
    this.horizontalArm.position.y =
      stand.base.height +
      stand.verticalPole.height -
      stand.horizontalArm.radius;
    this.horizontalArm.position.z = stand.horizontalArm.length / 2;

    this.add(this.base, this.verticalPole, this.horizontalArm);

    // SWINGING PART
    this.swingingPart = new THREE.Group();

    const stringGeo = new THREE.CylinderGeometry(
      stringDim.radius,
      stringDim.radius,
      stringDim.length
    );
    this.stringObj = new MeshObject(stringGeo, pendulumMC, "PendulumString");

    const bobGeo = new THREE.SphereGeometry(bob.radius);
    this.bobObj = new MeshObject(bobGeo, ball1MC, "PendulumBob");

    this.stringObj.position.y = -stringDim.length / 2;
    this.bobObj.position.y = -(stringDim.length + bob.radius);

    this.swingingPart.add(this.stringObj, this.bobObj);

    // Position the swinging part at the end of the horizontal arm
    this.swingingPart.position.y =
      stand.base.height +
      stand.verticalPole.height -
      stand.horizontalArm.radius;
    this.swingingPart.position.z =
      stand.horizontalArm.length - stand.horizontalArm.radius;

    this.add(this.swingingPart);

    // physics state
    this.angle = -Math.PI / 2;
    this.gravity = 10;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;
    this.decayFactor = 0.1;
    this.finished = false;

    this.collider = new THREE.Box3();
  }

  intersectsWith(other) {
    return this.collider.intersectsBox(other.collider);
  }

  physics(dt) {
    if (this.finished) return;

    // Simple pendulum equation: θ' = -(g/L) * sin(θ)
    this.angularAcceleration =
      -(this.gravity / this.length) * Math.sin(this.angle);
    this.angularVelocity += this.angularAcceleration * dt;
    this.angularVelocity *= 1 - this.decayFactor * dt;
    this.angle += this.angularVelocity * dt;

    // Check if pendulum has essentially stopped
    if (
      Math.abs(this.angularVelocity) < 0.001 &&
      Math.abs(this.angle) < 0.001
    ) {
      this.finished = true;
      this.angle = 0;
      this.angularVelocity = 0;
    }
  }

  animate(dt) {
    this.swingingPart.rotation.z = this.angle;
    this.updateMatrixWorld(true);
    this.collider.setFromObject(this.bobObj);
  }
}
