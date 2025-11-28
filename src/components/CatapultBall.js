import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { MeshObject } from "./MeshObject.js";
import { sampleMC } from "../utils/materialCoefficents.js";

export default class CatapultBall extends BaseObject {
  constructor(ballDim = { radius: 0.5 }) {
    super();

    this.ballDim = ballDim;

    const ballGeo = new THREE.SphereGeometry(ballDim.radius);
    this.ballObj = new MeshObject(ballGeo, sampleMC, "CatapultBall");
    this.add(this.ballObj);

    // physics state
    this.launched = false;

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.gravity = -10;
    this.friction = 0.3;
    this.bounceDecay = 0.8;

    this.bouncing = false;
    this.translating = false;
  }

  // Launch the ball with initial velocities
  launchBall(vx = -3, vy = 10) {
    this.velocity.set(vx, vy, 0);
    this.translating = true;
    this.bouncing = true;
    this.launched = true;
  }

  physics(dt) {
    if (!this.launched) return;

    if (this.bouncing) {
      this.velocity.y += this.gravity * dt;
      this.position.y += this.velocity.y * dt;

      if (this.position.y < this.ballDim.radius) {
        this.position.y = this.ballDim.radius;
        this.velocity.y = -this.velocity.y * this.bounceDecay;

        if (Math.abs(this.velocity.y) < 0.1) {
          this.bouncing = false;
        }
      }
    }

    if (this.translating) {
      this.velocity.x -= Math.sign(this.velocity.x) * this.friction * dt;
      if (Math.abs(this.velocity.x) < 0.01) {
        this.velocity.x = 0;
        this.translating = false;
      }

      this.position.x += this.velocity.x * dt;
      this.position.z += this.velocity.z * dt;
    }
  }

  animate(dt) {}
}
