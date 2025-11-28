import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { MeshObject } from "./MeshObject.js";
import { sampleMC } from "../utils/materialCoefficents.js";

export default class Pendulum extends BaseObject {
  constructor(stringDim = { length: 5, radius: 0.05 }, bob = { radius: 1 }) {
    super();

    this.length = stringDim.length + bob.radius * 2;
    this.angle = Math.PI / 4;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;
    this.decayFactor = 0.1;

    const stringGeo = new THREE.CylinderGeometry(
      stringDim.radius,
      stringDim.radius,
      stringDim.length
    );
    const stringMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    this.stringObj = new THREE.Mesh(stringGeo, stringMat);

    const bobGeo = new THREE.SphereGeometry(bob.radius);
    const bobMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.bobObj = new MeshObject(bobGeo, sampleMC, "PendulumBob");

    this.stringObj.position.y = -stringDim.length / 2;
    this.bobObj.position.y = -(stringDim.length + bob.radius);

    this.add(this.stringObj, this.bobObj);
  }

  physics(dt) {
    const g = 10;

    // Simple pendulum equation: θ'' = -(g/L) * sin(θ)
    this.angularAcceleration = -(g / this.length) * Math.sin(this.angle);

    // Integrate angular velocity
    this.angularVelocity += this.angularAcceleration * dt;

    // Apply damping (decay)
    this.angularVelocity *= 1 - this.decayFactor * dt;

    // Integrate angle
    this.angle += this.angularVelocity * dt;
  }

  animate(dt) {
    this.rotation.z = this.angle;
  }
}
