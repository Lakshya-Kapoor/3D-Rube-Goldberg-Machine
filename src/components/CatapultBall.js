import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { MeshObject } from "./MeshObject.js";
import { sampleMC } from "../utils/materialCoefficents.js";

export default class CatapultBall extends BaseObject {
  constructor(
    ballDim = { radius: 0.5 },
    roomBounds = { minX: -200, maxX: 200, floorY: -100 }
  ) {
    super();

    this.ballDim = ballDim;
    this.roomBounds = roomBounds; // Wall and floor boundaries

    const ballGeo = new THREE.SphereGeometry(ballDim.radius);
    this.ballObj = new MeshObject(ballGeo, sampleMC, "CatapultBall");
    this.add(this.ballObj);

    // physics state
    this.launched = false;

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.gravity = -100;
    this.friction = 1.8;
    this.bounceDecay = 0.8;

    this.bouncing = false;
    this.translating = false;
  }

  // Launch the ball with initial velocities
  launchBall(vx = -50, vy = 100) {
    this.velocity.set(vx, vy, 0);
    this.translating = true;
    this.bouncing = true;
    this.launched = true;
  }

  getFocusPoint() {
    this.ballObj.updateWorldMatrix(true);

    const worldPos = new THREE.Vector3();
    this.ballObj.getWorldPosition(worldPos);

    return worldPos;
  }

  physics(dt) {
    if (!this.launched) return;

    // Get the world-space bounding box of the ball mesh to account for any scaling
    const bbox = new THREE.Box3().setFromObject(this.ballObj);
    const worldRadius = (bbox.max.y - bbox.min.y) / 2;

    if (this.bouncing) {
      this.velocity.y += this.gravity * dt;
      this.position.y += this.velocity.y * dt;

      // Floor collision
      if (this.position.y < this.roomBounds.floorY + worldRadius) {
        // snap position to surface
        this.position.y = this.roomBounds.floorY + worldRadius;

        // bounce velocity
        this.velocity.y = -this.velocity.y * this.bounceDecay;

        // stop bouncing for very small bounces
        if (Math.abs(this.velocity.y) < 0.1) {
          this.bouncing = false;
        }
      }
    }

    if (this.translating) {
      this.velocity.x -= Math.sign(this.velocity.x) * this.friction * dt;
      if (Math.abs(this.velocity.x) < 0.1) {
        this.velocity.x = 0;
        this.translating = false;
      }

      this.position.x += this.velocity.x * dt;

      // Left wall collision
      if (this.position.x < this.roomBounds.minX + worldRadius) {
        this.position.x = this.roomBounds.minX + worldRadius;
        this.velocity.x = -this.velocity.x * this.bounceDecay;
      }
      // Right wall collision
      if (this.position.x > this.roomBounds.maxX - worldRadius) {
        this.position.x = this.roomBounds.maxX - worldRadius;
        this.velocity.x = -this.velocity.x * this.bounceDecay;
      }
    }
  }

  animate(dt) {}
}
