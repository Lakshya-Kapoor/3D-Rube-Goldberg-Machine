import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { MeshObject } from "./MeshObject.js";
import { sampleMC,dominoMC } from "../utils/materialCoefficents.js";

export default class Domino extends BaseObject {
  constructor() {
    super();

    this.dominoDim = { width: 1, height: 2, depth: 0.25 };

    const dominoGeo = new THREE.BoxGeometry(
      this.dominoDim.width,
      this.dominoDim.height,
      this.dominoDim.depth
    );

    this.dominoObj = new MeshObject(dominoGeo, dominoMC, "Domino");
    this.dominoObj.position.y = this.dominoDim.height / 2;
    this.dominoObj.position.z = -this.dominoDim.depth / 2;
    this.add(this.dominoObj);

    // Small collision point at the top of the domino for seesaw collision
    const tipGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const tipMat = new THREE.MeshBasicMaterial({ visible: false });
    this.tipObj = new THREE.Mesh(tipGeo, tipMat);
    this.tipObj.position.y = this.dominoDim.height;
    this.tipObj.position.z = -this.dominoDim.depth / 2;
    this.add(this.tipObj);

    // physics state
    this.angle = Math.PI / 2;
    this.angularVelocity = 0;
    this.angularAcceleration = 3;
    this.minAngle = 0;

    this.falling = false;
    this.constrainedToDomino = null;
    this.constrainedToSeeSaw = null;
    this.offset = 0.1;

    this.collider = new THREE.Box3();
    this.tipCollider = new THREE.Box3();
  }

  intersectsWithDomino(object) {
    return this.collider.intersectsBox(object.collider);
  }

  intersectsWithSeeSaw(seeSaw) {
    return this.tipCollider.intersectsBox(seeSaw.collider);
  }

  constrainToDomino(domino) {
    this.constrainedToDomino = domino;
  }

  constrainToSeeSaw(seeSaw) {
    this.constrainedToSeeSaw = seeSaw;
  }

  // call this to start falling
  tipOver() {
    this.falling = true;
  }

  getFocusPoint() {
    this.tipObj.updateWorldMatrix(true);

    const worldPos = new THREE.Vector3();
    this.tipObj.getWorldPosition(worldPos);

    return worldPos;
  }

  physics(dt) {
    if (!this.falling) return;

    if (this.constrainedToDomino == null && this.constrainedToSeeSaw == null) {
      this.angularVelocity += this.angularAcceleration * dt;
      this.angle -= this.angularVelocity * dt;

      // clamp at max rotation
      if (this.angle <= this.minAngle) {
        this.angle = this.minAngle;
        this.angularVelocity = 0;
        this.falling = false;
      }
    } else if (this.constrainedToDomino != null) {
      const phi = this.constrainedToDomino.angle;
      this.angle =
        phi -
        Math.asin((1 / this.dominoDim.height) * Math.sin(Math.PI - phi)) +
        this.offset;
    } else if (this.constrainedToSeeSaw != null) {
      if (this.initialConstraintAngle === undefined) {
        this.initialConstraintAngle = this.angle;
        this.initialSeeSawAngle = this.constrainedToSeeSaw.angle;
      }

      const seeSawDelta =
        this.constrainedToSeeSaw.angle - this.initialSeeSawAngle;
      this.angle = this.initialConstraintAngle - seeSawDelta;

      // Clamp to min angle
      if (this.angle <= this.minAngle) {
        this.angle = this.minAngle;
      }
    }
  }

  animate(dt) {
    this.rotation.x = Math.PI / 2 - this.angle;
    this.updateMatrixWorld(true);
    this.collider.setFromObject(this.dominoObj);
    this.tipCollider.setFromObject(this.tipObj);
  }
}
