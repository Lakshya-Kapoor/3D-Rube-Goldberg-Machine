import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import {
  placeBottomAt,
  placeLeftAt,
  placeNearAt,
} from "../utils/placeHelper.js";
import { MeshObject } from "./MeshObject.js";
import { ball2MC, inclinedPlaneMC } from "../utils/materialCoefficents.js";
import { assetManager } from "../utils/assetManager.js";

export default class InclinedPlane extends BaseObject {
  constructor() {
    super();

    this.xSlantLen = 20;
    this.zSlantLen = 10;
    this.planeWidth = 5;
    this.startHieght = 15;
    this.turnHeight = 7.5;
    this.endHeight = 0;
    this.sideWallWidth = 2;

    this.theta1 = Math.atan(
      (this.startHieght - this.turnHeight) / this.xSlantLen
    );
    this.theta2 = Math.atan(
      (this.turnHeight - this.endHeight) / this.zSlantLen
    );

    const xBoxGeo = new THREE.BoxGeometry(
      this.xSlantLen + this.planeWidth,
      this.turnHeight,
      this.planeWidth,
      32,
      32,
      32
    );

    const sideWall1 = new THREE.BoxGeometry(
      this.sideWallWidth,
      this.startHieght,
      this.planeWidth,
      8,
      8,
      8
    );
    const sideWall2 = new THREE.BoxGeometry(
      this.planeWidth,
      this.turnHeight + this.sideWallWidth,
      this.sideWallWidth,
      8,
      8,
      8
    );
    const sideWall3 = new THREE.BoxGeometry(
      this.sideWallWidth,
      this.turnHeight + this.sideWallWidth,
      this.planeWidth,
      8,
      8,
      8
    );

    const xWedgeGeo = assetManager.geometry.wedge.clone();
    xWedgeGeo.rotateX(-Math.PI / 2);
    xWedgeGeo.scale(
      this.xSlantLen,
      this.startHieght - this.turnHeight,
      this.planeWidth
    );
    xWedgeGeo.computeVertexNormals();

    const zWedgeGeo = assetManager.geometry.wedge.clone();
    zWedgeGeo.rotateZ(Math.PI / 2);
    zWedgeGeo.scale(
      this.planeWidth,
      this.turnHeight - this.endHeight,
      this.zSlantLen
    );
    zWedgeGeo.computeVertexNormals();

    this.zWedge = new MeshObject(zWedgeGeo, inclinedPlaneMC, "zWedge");

    this.xWedge = new MeshObject(xWedgeGeo, inclinedPlaneMC, "xWedge");

    this.xBox = new MeshObject(xBoxGeo, inclinedPlaneMC, "inclinedPlaneBox");

    this.sideWall1 = new MeshObject(
      sideWall1,
      inclinedPlaneMC,
      "inclinedPlanesideWall1"
    );
    this.sideWall2 = new MeshObject(
      sideWall2,
      inclinedPlaneMC,
      "inclinedPlanesideWall2"
    );
    this.sideWall3 = new MeshObject(
      sideWall3,
      inclinedPlaneMC,
      "inclinedPlanesideWall3"
    );

    placeBottomAt(this.xWedge, this.turnHeight / 2);
    placeLeftAt(this.xWedge, -(this.xSlantLen + this.planeWidth) / 2);

    placeBottomAt(this.zWedge, -this.turnHeight / 2);
    placeLeftAt(this.zWedge, (this.xSlantLen - this.planeWidth) / 2);
    placeNearAt(this.zWedge, this.planeWidth / 2);

    placeLeftAt(
      this.sideWall1,
      -(this.xSlantLen + this.planeWidth) / 2 - this.sideWallWidth
    );
    placeBottomAt(this.sideWall1, -(this.turnHeight / 2));

    placeLeftAt(this.sideWall2, (this.xSlantLen - this.planeWidth) / 2);
    placeNearAt(this.sideWall2, -this.planeWidth / 2 - this.sideWallWidth);
    placeBottomAt(this.sideWall2, -(this.turnHeight / 2));

    placeLeftAt(this.sideWall3, (this.xSlantLen + this.planeWidth) / 2);
    placeBottomAt(this.sideWall3, -(this.turnHeight / 2));

    this.add(
      this.xBox,
      this.zWedge,
      this.xWedge,
      this.sideWall1,
      this.sideWall2,
      this.sideWall3
    );

    const ballGeo = new THREE.SphereGeometry(1);
    this.ball = new MeshObject(ballGeo, ball2MC, "inclinedPlaneBall");

    this.ball.position.copy(this.sideWall1.position);
    this.ball.position.y +=
      this.startHieght / 2 + this.ball.geometry.parameters.radius;
    this.add(this.ball);

    this.animationPhase = 0;

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.gravity = 10.0;
    this.friction = 0.995;
    this.restitution = 0.7;
    this.rollingFactor = 5 / 7;

    this.ballRotationAxis = new THREE.Vector3();
    this.ballUp = new THREE.Vector3(0, 1, 0);
    this.ballAngularSpeed = 0;

    this.collider = new THREE.Box3();

    this.radius = this.ball.geometry.parameters.radius;
  }

  getCurrentSurface() {
    const radius = this.radius;
    const ballPos = this.ball.position;

    const xWedgeStartX = this.sideWall1.position.x + this.sideWallWidth / 2;
    const xWedgeEndX =
      this.xBox.position.x + (this.xSlantLen - this.planeWidth) / 2;

    const platformStartX = xWedgeEndX;

    const zWedgeStartZ = this.sideWall3.position.z + this.planeWidth / 2;
    const zWedgeEndZ = this.zWedge.position.z + this.zSlantLen / 2;

    const platformY = this.xBox.position.y + this.turnHeight / 2 + radius;

    if (ballPos.x < xWedgeStartX) {
      return {
        type: "start_flat",
        theta: 0,
        normal: new THREE.Vector3(0, 1, 0),
      };
    }

    if (
      ballPos.x >= xWedgeStartX &&
      ballPos.x < platformStartX &&
      ballPos.y > platformY + 0.1
    ) {
      return {
        type: "x_wedge",
        theta: this.theta1,
        normal: new THREE.Vector3(
          -Math.sin(this.theta1),
          Math.cos(this.theta1),
          0
        ),
        direction: new THREE.Vector3(1, 0, 0),
      };
    }

    if (
      ballPos.y >= platformY - 0.1 &&
      ballPos.y <= platformY + 0.1 &&
      ballPos.z < zWedgeStartZ
    ) {
      return { type: "platform", theta: 0, normal: new THREE.Vector3(0, 1, 0) };
    }

    if (ballPos.z >= zWedgeStartZ && ballPos.z < zWedgeEndZ) {
      return {
        type: "z_wedge",
        theta: this.theta2,
        normal: new THREE.Vector3(
          0,
          Math.cos(this.theta2),
          -Math.sin(this.theta2)
        ),
        direction: new THREE.Vector3(0, 0, 1),
      };
    }

    if (ballPos.z >= zWedgeEndZ) {
      return { type: "ground", theta: 0, normal: new THREE.Vector3(0, 1, 0) };
    }

    return { type: "platform", theta: 0, normal: new THREE.Vector3(0, 1, 0) };
  }

  constrainToSurface() {
    const radius = this.radius;
    const ballPos = this.ball.position;

    const xWedgeStartX = this.sideWall1.position.x + this.sideWallWidth / 2;
    const xWedgeEndX =
      this.xBox.position.x + (this.xSlantLen - this.planeWidth) / 2;

    const platformY = this.xBox.position.y + this.turnHeight / 2 + radius;
    const groundY = this.xBox.position.y - this.turnHeight / 2 + radius;

    const zWedgeStartZ = this.sideWall3.position.z + this.planeWidth / 2;

    const surface = this.getCurrentSurface();

    if (surface.type === "start_flat") {
      const startY = this.sideWall1.position.y + this.startHieght / 2 + radius;
      ballPos.y = startY;
    } else if (surface.type === "x_wedge") {
      const distFromStart = ballPos.x - xWedgeStartX;
      const heightDrop = distFromStart * Math.tan(this.theta1);
      const startY =
        this.xBox.position.y +
        this.turnHeight / 2 +
        (this.startHieght - this.turnHeight) +
        radius;
      ballPos.y = startY - heightDrop;

      if (ballPos.y < platformY) {
        ballPos.y = platformY;
        ballPos.x = xWedgeEndX + radius;
      }
    } else if (surface.type === "platform") {
      ballPos.y = platformY;
    } else if (surface.type === "z_wedge") {
      const distFromStart = ballPos.z - zWedgeStartZ;
      const heightDrop = distFromStart * Math.tan(this.theta2);
      const expectedY = platformY - heightDrop;

      if (expectedY < groundY) {
        ballPos.y = groundY;
        const totalSpeed = Math.sqrt(
          this.velocity.z ** 2 + this.velocity.y ** 2
        );
        this.velocity.z = totalSpeed;
        this.velocity.y = 0;
      } else {
        ballPos.y = expectedY;
      }
    } else if (surface.type === "ground") {
      ballPos.y = groundY;
    }
  }

  handleWallCollisions() {
    const radius = this.radius;
    const ballPos = this.ball.position;

    const leftWallX =
      this.sideWall1.position.x + this.sideWallWidth / 2 + radius;
    if (ballPos.x < leftWallX && this.velocity.x < 0) {
      ballPos.x = leftWallX;
      this.velocity.x *= -this.restitution;
    }

    const rightWallX =
      this.sideWall3.position.x - this.sideWallWidth / 2 - radius;
    const platformY = this.xBox.position.y + this.turnHeight / 2 + radius;
    if (
      ballPos.x > rightWallX &&
      this.velocity.x > 0 &&
      Math.abs(ballPos.y - platformY) < 1
    ) {
      ballPos.x = rightWallX;
      const incomingSpeed = Math.abs(this.velocity.x);
      this.velocity.x = -incomingSpeed * 0.25 * this.restitution;
      this.velocity.z = incomingSpeed * 0.7 * this.restitution;
    }

    const backWallZ =
      this.sideWall2.position.z + this.sideWallWidth / 2 + radius;
    const zWedgeStartX =
      this.xBox.position.x +
      (this.xSlantLen - this.planeWidth) / 2 -
      this.planeWidth / 2;
    if (
      ballPos.z < backWallZ &&
      this.velocity.z < 0 &&
      ballPos.x > zWedgeStartX
    ) {
      ballPos.z = backWallZ;
      this.velocity.z *= -this.restitution;
    }
  }

  intesectsWith(other) {
    return this.collider.intersectsBox(other.collider);
  }

  rotateBall(dt) {
    const speed = this.velocity.length();
    if (speed <= 0.001) {
      this.ballAngularSpeed = 0;
      return;
    }
    this.ballAngularSpeed = speed / this.radius;

    if (Math.abs(this.velocity.x) > Math.abs(this.velocity.z)) {
      this.ballRotationAxis.set(0, 0, -Math.sign(this.velocity.x));
    } else {
      this.ballRotationAxis.set(Math.sign(this.velocity.z), 0, 0);
    }
  }

  getFocusPoint() {
    this.ball.updateWorldMatrix(true);

    const worldPos = new THREE.Vector3();
    this.ball.getWorldPosition(worldPos);

    return worldPos;
  }

  physics(dt) {
    if (this.animationPhase === 0) {
      return;
    }

    if (this.animationPhase === 8) {
      this.velocity.z = -Math.abs(this.velocity.z) * this.restitution;
      this.velocity.x = 0;
      this.velocity.y = 0;

      const speed = Math.abs(this.velocity.z);
      if (speed > 0.05) {
        this.velocity.z *= this.friction;
      } else {
        this.velocity.set(0, 0, 0);
      }

      this.rotateBall(dt);
      this.ball.rotateOnWorldAxis(
        this.ballRotationAxis,
        this.ballAngularSpeed * dt
      );
      return;
    }

    const surface = this.getCurrentSurface();

    if (surface.type === "start_flat") {
      this.velocity.x += this.gravity * 0.1 * dt;

      this.velocity.x *= this.friction;
    } else if (surface.type === "x_wedge") {
      const accel = this.gravity * Math.sin(this.theta1) * this.rollingFactor;

      this.velocity.x += accel * Math.cos(this.theta1) * dt;
      this.velocity.y -= accel * Math.sin(this.theta1) * dt;

      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
    } else if (surface.type === "platform") {
      this.velocity.y = 0;

      this.velocity.x *= this.friction;
      this.velocity.z *= this.friction;
    } else if (surface.type === "z_wedge") {
      const accel = this.gravity * Math.sin(this.theta2) * this.rollingFactor;

      this.velocity.z += accel * Math.cos(this.theta2) * dt;
      this.velocity.y -= accel * Math.sin(this.theta2) * dt;

      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
      this.velocity.z *= this.friction;
    } else if (surface.type === "ground") {
      this.velocity.y = 0;

      this.velocity.x *= this.friction;
      this.velocity.z *= this.friction;
    }

    this.handleWallCollisions();

    this.constrainToSurface();

    this.rotateBall(dt);
    this.ball.rotateOnWorldAxis(
      this.ballRotationAxis,
      this.ballAngularSpeed * dt
    );
  }

  animate(dt) {
    this.ball.position.addScaledVector(this.velocity, dt);

    this.updateMatrixWorld(true);
    this.collider.setFromObject(this.ball);
  }
}
