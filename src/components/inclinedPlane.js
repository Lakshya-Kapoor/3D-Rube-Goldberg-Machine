
import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { placeBottomAt, placeLeftAt, placeNearAt } from "../utils/placeHelper.js";
import {MeshObject} from "./MeshObject.js";
import { ball2MC, inclinedPlaneMC, sampleMC } from "../utils/materialCoefficents.js";
import { assetManager } from "../utils/assetManager.js";

export default class InclinedPlane extends BaseObject {
  constructor () {
    super();

    this.xSlantLen = 20;
    this.zSlantLen = 10;
    this.planeWidth = 5;
    this.startHieght = 15;
    this.turnHeight = 7.5;
    this.endHeight = 0;
    this.sideWallWidth = 2;

    this.theta1 = Math.atan( (this.startHieght - this.turnHeight) / this.xSlantLen);
    this.theta2 = Math.atan( (this.turnHeight - this.endHeight) / this.zSlantLen);

    const xBoxGeo = new THREE.BoxGeometry(this.xSlantLen + this.planeWidth,this.turnHeight,this.planeWidth,32,32,32);

    const sideWall1 = new THREE.BoxGeometry(this.sideWallWidth,this.startHieght,this.planeWidth,8,8,8);
    const sideWall2 = new THREE.BoxGeometry(this.planeWidth,this.turnHeight + this.sideWallWidth,this.sideWallWidth,8,8,8);
    const sideWall3 = new THREE.BoxGeometry(this.sideWallWidth,this.turnHeight + this.sideWallWidth,this.planeWidth,8,8,8);

    const xWedgeGeo = assetManager.geometry.wedge.clone();
    xWedgeGeo.rotateX(-Math.PI/2);
    xWedgeGeo.scale(this.xSlantLen,this.startHieght - this.turnHeight,this.planeWidth);
    xWedgeGeo.computeVertexNormals();

    const zWedgeGeo = assetManager.geometry.wedge.clone();
    zWedgeGeo.rotateZ(Math.PI / 2);
    zWedgeGeo.scale(this.planeWidth,this.turnHeight - this.endHeight,this.zSlantLen);
    zWedgeGeo.computeVertexNormals();

    this.zWedge = new MeshObject(zWedgeGeo,inclinedPlaneMC,"zWedge");

    this.xWedge = new MeshObject(xWedgeGeo,inclinedPlaneMC,"xWedge");
  
    this.xBox = new MeshObject(xBoxGeo,inclinedPlaneMC,"inclinedPlaneBox");

    this.sideWall1 = new MeshObject(sideWall1,inclinedPlaneMC,"inclinedPlanesideWall1");
    this.sideWall2 = new MeshObject(sideWall2,inclinedPlaneMC,"inclinedPlanesideWall2");
    this.sideWall3 = new MeshObject(sideWall3,inclinedPlaneMC,"inclinedPlanesideWall3");

    placeBottomAt(this.xWedge,this.turnHeight/2);
    placeLeftAt(this.xWedge,-(this.xSlantLen + this.planeWidth)/2);

    placeBottomAt(this.zWedge,-this.turnHeight/2)
    placeLeftAt(this.zWedge,(this.xSlantLen - this.planeWidth)/2)
    placeNearAt(this.zWedge,this.planeWidth/2);

    placeLeftAt(this.sideWall1,-(this.xSlantLen + this.planeWidth)/2 - this.sideWallWidth);
    placeBottomAt(this.sideWall1,-(this.turnHeight/2));

    placeLeftAt(this.sideWall2,(this.xSlantLen - this.planeWidth)/2);
    placeNearAt(this.sideWall2,-this.planeWidth/2 - this.sideWallWidth);
    placeBottomAt(this.sideWall2,-(this.turnHeight/2));

    placeLeftAt(this.sideWall3,(this.xSlantLen + this.planeWidth)/2);
    placeBottomAt(this.sideWall3,-(this.turnHeight/2));

    this.add(this.xBox,this.zWedge,this.xWedge,this.sideWall1,this.sideWall2,this.sideWall3);

    const ballGeo = new THREE.SphereGeometry(1);
    this.ball = new MeshObject(ballGeo,ball2MC,"inclinedPlaneBall");

    this.ball.position.copy(this.sideWall1.position);
    this.ball.position.y += this.startHieght/2 + this.ball.geometry.parameters.radius;
    this.add(this.ball);
    this.animationPhase = 0;
    this.ballTranslateVector = new THREE.Vector3(0,0,0);

    this.ballRotationAxis = new THREE.Vector3();
    this.ballUp = new THREE.Vector3(0,1,0);
    this.ballAngularSpeed = 0;

    this.collider = new THREE.Box3();
  }
  checkAnimationPhase() {
    const radius = this.ball.geometry.parameters.radius;
    if (this.animationPhase === 1 && (this.ball.position.x >= this.sideWall1.position.x + this.sideWallWidth/2)) {
      this.ballTranslateVector.set(0,0,0);
      this.ball.position.x = this.sideWall1.position.x + this.sideWallWidth/2 + radius * Math.sin(this.theta1);
      this.animationPhase = 2;
    } else if (this.animationPhase === 2 && this.ball.position.y <= this.xBox.position.y + this.turnHeight / 2 + radius) {
      this.ballTranslateVector.set(this.ballTranslateVector.x,0,0);
      this.ball.position.x = this.xBox.position.x + (this.xSlantLen - this.planeWidth)/2 + radius;
      this.ball.position.y = this.xBox.position.y + this.turnHeight/2  + radius;
      this.animationPhase = 3;
    } else if (this.animationPhase === 3 && (this.ball.position.x >= this.sideWall3.position.x - this.sideWallWidth/2 - radius)) {
      this.ballTranslateVector.set(-this.ballTranslateVector.x,0,0);
      this.animationPhase = 4;
    } else if (this.animationPhase === 4 && this.ball.position.x <=  this.zWedge.position.x) {
      this.ballTranslateVector.set(0,0,0);
      this.ball.position.y = this.xBox.position.y + this.turnHeight/2  + radius;
      this.animationPhase = 5;
    } else if (this.animationPhase === 5 && (this.ball.position.z >= this.sideWall3.position.z + (this.planeWidth / 2) + radius)) {
      this.ballTranslateVector.set(0,0,0);
      this.ball.position.z = this.sideWall3.position.z + (this.planeWidth / 2) + radius * Math.sin(this.theta2);
      this.animationPhase = 6;
    } else if (this.animationPhase === 6 && this.ball.position.y <=  this.xBox.position.y - this.turnHeight / 2 + radius) {
      this.ballTranslateVector.set(0,0,this.ballTranslateVector.z);
      this.ball.position.z = this.zWedge.position.z + this.zSlantLen/2 + radius;
      this.ball.position.y = this.xBox.position.y - this.turnHeight / 2 + radius;
      this.animationPhase = 7;
    }
  }
  intesectsWith(other) {
    return this.collider.intersectsBox(other.collider);
  }
  rotateBall(dt) {
    const speed = this.ballTranslateVector.length();
    if (speed <= 0.001) return;
    this.ballAngularSpeed = speed / this.ball.geometry.parameters.radius;
    if (Math.abs(this.ballTranslateVector.x) > Math.abs(this.ballTranslateVector.z)) {
      this.ballRotationAxis.set(0,0,-Math.sign(this.ballTranslateVector.x));
    } else {
      this.ballRotationAxis.set(Math.sign(this.ballTranslateVector.z),0,0);
    }

  }
  physics(dt) {
    this.checkAnimationPhase();
    if (this.animationPhase === 1) {
      this.ballTranslateVector.x += 0.98 * dt;
    } else if (this.animationPhase === 2) {
      this.ballTranslateVector.x += 0.98 * dt * Math.cos(this.theta1);
      this.ballTranslateVector.y -= 0.98 * dt * Math.sin(this.theta1);
    } else if (this.animationPhase === 3) {
      this.ballTranslateVector.x -= 0.98 * dt;
    } else if (this.animationPhase === 4) {
      this.ballTranslateVector.x += 0.98 * dt;
    } else if (this.animationPhase === 5) {
      this.ballTranslateVector.z += 0.98 * dt;
    } else if (this.animationPhase === 6) {
      this.ballTranslateVector.z += 0.98 * dt * Math.cos(this.theta2);
      this.ballTranslateVector.y -= 0.98 * dt * Math.sin(this.theta2);
    } else if (this.animationPhase === 8) {
      this.ballTranslateVector.set(0,0,0);
    }
    this.ball.rotateOnWorldAxis(this.ballRotationAxis,  this.ballAngularSpeed* dt);
  }

  animate(dt) {
    this.ball.position.addScaledVector(this.ballTranslateVector,dt);
    this.updateMatrixWorld(true);
    this.collider.setFromObject(this.ball);
  }

  getFocusPoint () {
    const _worldPos = new THREE.Vector3();
    this.ball.getWorldPosition(_worldPos);
    return _worldPos;
  }
}

