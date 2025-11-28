import * as THREE from "three";
import BaseObject from "./BaseObject.js";

export default class Domino extends BaseObject {
  constructor(dominoDim = { width: 1, height: 2, depth: 0.25 }) {
    super();

    const dominoGeo = new THREE.BoxGeometry(
      dominoDim.width,
      dominoDim.height,
      dominoDim.depth
    );

    this.dominoDim = dominoDim;

    const dominoMat = new THREE.MeshStandardMaterial({ color: 0xffff55 });
    this.dominoObj = new THREE.Mesh(dominoGeo, dominoMat);
    this.dominoObj.position.y = dominoDim.height / 2;
    this.add(this.dominoObj);

    // --- physics state ---
    this.angle = Math.PI / 2;
    this.angularVelocity = 0;
    this.angularAcceleration = 5;
    this.minAngle = 0;
    this.falling = false;
    this.constrainedTo = null;
    this.offset = 0.1;

    this.collider = new THREE.Box3();
  }

  intersectsWith(domino) {
    return this.collider.intersectsBox(domino.collider);
  }

  constrainTo(domino) {
    this.constrainedTo = domino;
  }

  // call this to start falling
  tipOver() {
    this.falling = true;
  }

  physics(dt) {
    if (!this.falling) return;

    if (this.constrainedTo == null) {
      // integrate velocity
      this.angularVelocity += this.angularAcceleration * dt;

      // integrate angle
      this.angle -= this.angularVelocity * dt;

      // clamp at max rotation
      if (this.angle <= this.minAngle) {
        this.angle = this.minAngle;
        this.angularVelocity = 0;
        this.falling = false;
      }
    } else {
      const phi = this.constrainedTo.angle;
      this.angle =
        phi -
        Math.asin((1 / this.dominoDim.height) * Math.sin(Math.PI - phi)) +
        this.offset;
    }
  }

  animate(dt) {
    this.rotation.x = Math.PI / 2 - this.angle;
    this.updateMatrixWorld(true);
    this.collider.setFromObject(this.dominoObj);
  }
}
