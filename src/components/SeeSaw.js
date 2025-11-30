import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { MeshObject } from "./MeshObject.js";
import { assetManager } from "../utils/assetManager.js";
import { prismMC, sampleMC, seesawMC } from "../utils/materialCoefficents.js";

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
      prismMC,
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
    this.plankObj = new MeshObject(plankGeo, seesawMC, "SeeSawPlank");
    this.seeSawPart.add(this.plankObj);
    this.plankObj.position.y = this.seeSawDim.wedge.height * 1.5;

    const seeSawRailGeo = new THREE.BoxGeometry(
      this.seeSawDim.plank.height,
      this.seeSawDim.plank.depth / 2,
      this.seeSawDim.plank.depth
    );
    this.seeSawRailObj = new MeshObject(seeSawRailGeo, seesawMC, "SeeSawRail");
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
    this._focusLocal = new THREE.Vector3();
    this._focusWorld = new THREE.Vector3();
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

  getFocusPoint () {
    // Calculate progress from 0 (initial angle) to 1 (target angle)
    const totalRotation = this.targetAngle - (-Math.PI / 12); // initial angle is -PI/12
    const currentProgress = (this.angle - (-Math.PI / 12)) / totalRotation;
    const t = THREE.MathUtils.clamp(currentProgress, 0, 1);

    // Interpolate x from left edge to right edge of the plank
    const leftX = -this.seeSawDim.plank.width / 2;
    const rightX = this.seeSawDim.plank.width / 2;
    const localX = THREE.MathUtils.lerp(leftX, rightX, t);

    // Set local position on the plank surface
    this._focusLocal.set(localX, this.seeSawDim.plank.height / 2, 0);

    // Convert to world coordinates via the plank
    this.plankObj.updateMatrixWorld(true);
    this._focusWorld.copy(this._focusLocal);
    this.plankObj.localToWorld(this._focusWorld);

    return this._focusWorld;
  }
}
