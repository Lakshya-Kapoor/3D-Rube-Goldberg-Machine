import * as THREE from "three";
import BaseObject from "./BaseObject.js";

export default class SeeSaw extends BaseObject {
  constructor(seeSawDim = { width: 5, height: 0.1, depth: 1 }) {
    super();

    this.seeSawDim = seeSawDim;

    const seeSawGeo = new THREE.BoxGeometry(
      seeSawDim.width,
      seeSawDim.height,
      seeSawDim.depth
    );

    const seeSawMat = new THREE.MeshStandardMaterial({ color: 0x55ff55 });
    this.seeSawObj = new THREE.Mesh(seeSawGeo, seeSawMat);
    this.add(this.seeSawObj);

    const seeSawRailGeo = new THREE.BoxGeometry(
      seeSawDim.height,
      seeSawDim.depth / 2,
      seeSawDim.depth
    );
    this.seeSawRailObj = new THREE.Mesh(seeSawRailGeo, seeSawMat);
    this.seeSawRailObj.position.x = seeSawDim.width / 2 - seeSawDim.height / 2;
    this.seeSawRailObj.position.y = seeSawDim.depth / 4;
    this.seeSawObj.add(this.seeSawRailObj);

    // physics state
    this.angle = -Math.PI / 15;
    this.targetAngle = -this.angle;
    this.angularVelocity = 0;
    this.angularAcceleration = 5;

    this.rotating = false;

    this.collider = new THREE.Box3();
  }

  startRotation() {
    this.rotating = true;
  }

  physics(dt) {
    if (!this.rotating) return;

    // Check if target angle is reached
    if (this.angle >= this.targetAngle) {
      this.angle = this.targetAngle;
      this.angularVelocity = 0;
      return;
    }
    this.angularVelocity += this.angularAcceleration * dt;
    this.angle += this.angularVelocity * dt;

    // clamp to stop at target angle
    if (this.angle >= this.targetAngle) {
      this.angle = this.targetAngle;
      this.angularVelocity = 0;
    }
  }

  animate(dt) {
    this.rotation.z = this.angle;

    this.updateMatrixWorld(true);
    this.collider.setFromObject(this.seeSawObj);
  }
}
