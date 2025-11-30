import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { MeshObject } from "./MeshObject.js";
import { ball3MC, sampleMC } from "../utils/materialCoefficents.js";

export default class CatapultBall extends BaseObject {
  constructor(ballDim = { radius: 0.5 }, floorY = -100) {
    super();

    this.ballDim = ballDim;
    this.floorY = floorY; // The y-level of the floor for collision

    const ballGeo = new THREE.SphereGeometry(ballDim.radius);
    this.ballObj = new MeshObject(ballGeo, ball3MC, "CatapultBall");
    this.add(this.ballObj);

    // physics state
    this.launched = false;

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.gravity = -40;
    this.friction = 0.3;
    this.bounceDecay = 0.8;

    this.bouncing = false;
    this.translating = false;
  }

  // Launch the ball with initial velocities
  launchBall(vx = -70, vy = 50) {
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

      // Use floorY instead of 0 for floor collision
      const floorLevel = this.floorY + this.ballDim.radius;
      if (this.position.y < floorLevel) {
        this.position.y = floorLevel;
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
