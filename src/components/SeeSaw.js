import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { MeshObject } from "./MeshObject.js";
import { assetManager } from "../utils/assetManager.js";
import { sampleMC } from "../utils/materialCoefficents.js";

export default class SeeSaw extends BaseObject {
  constructor() {
    super();

    this.seeSawDim = {
      plank: { width: 5, height: 0.1, depth: 1 },
      wedge: { width: 0.5, height: 0.5, depth: 0.45 },
    };

    // STATIC PART
    this.wedge = new MeshObject(
      assetManager.geometry.prism,
      sampleMC,
      "SeeSawWedge"
    );
    this.wedge.scale.set(
      this.seeSawDim.wedge.width,
      this.seeSawDim.wedge.height,
      this.seeSawDim.wedge.depth
    );
    this.wedge.position.y = this.seeSawDim.wedge.height / 2;
    this.add(this.wedge);

    // ROTATING PART
    this.seeSawPart = new THREE.Group();

    const plankGeo = new THREE.BoxGeometry(
      this.seeSawDim.plank.width,
      this.seeSawDim.plank.height,
      this.seeSawDim.plank.depth
    );
    this.plankObj = new MeshObject(plankGeo, sampleMC, "SeeSawPlank");
    this.seeSawPart.add(this.plankObj);
    this.plankObj.position.y = this.seeSawDim.wedge.height * 1.5;

    const seeSawRailGeo = new THREE.BoxGeometry(
      this.seeSawDim.plank.height,
      this.seeSawDim.plank.depth / 2,
      this.seeSawDim.plank.depth
    );
    this.seeSawRailObj = new MeshObject(seeSawRailGeo, sampleMC, "SeeSawRail");
    this.plankObj.add(this.seeSawRailObj);
    this.seeSawRailObj.position.x =
      this.seeSawDim.plank.width / 2 - this.seeSawDim.plank.height / 2;
    this.seeSawRailObj.position.y = this.seeSawDim.plank.depth / 4;

    this.add(this.seeSawPart);

    // physics state
    this.angle = -Math.PI / 12;
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
    this.seeSawPart.rotation.z = this.angle;

    this.updateMatrixWorld(true);
    this.collider.setFromObject(this.seeSawPart);
  }
}
