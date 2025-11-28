
import * as THREE from "three";
import BaseObject from "./BaseObject.js";
import { placeBottomAt, placeLeftAt, placeNearAt } from "../utils/placeHelper.js";
import {MeshObject} from "./MeshObject.js";
import { sampleMC } from "../utils/materialCoefficents.js";
import { assetManager } from "../utils/assetManager.js";

export default class InclinedPlane extends BaseObject {
  constructor () {
    super();

    this.xSlantLen = 10;
    this.zSlantLen = 10;
    this.planeWidth = 5;
    this.startHieght = 20;
    this.turnHeight = 10;
    this.endHeight = 0;
    this.sideWallWidth = 2;

    this.theta1 = Math.atan( (this.startHieght - this.turnHeight) / this.xSlantLen);
    this.theta2 = Math.atan( (this.turnHeight - this.endHeight) / this.zSlantLen);

    const xBoxGeo = new THREE.BoxGeometry(this.xSlantLen + this.planeWidth,this.turnHeight,this.planeWidth);

    const sideWall1 = new THREE.BoxGeometry(this.sideWallWidth,this.startHieght,this.planeWidth);
    const sideWall2 = new THREE.BoxGeometry(this.planeWidth,this.turnHeight + this.sideWallWidth,this.sideWallWidth);
    const sideWall3 = new THREE.BoxGeometry(this.sideWallWidth,this.turnHeight + this.sideWallWidth,this.planeWidth);

    const xWedgeGeo = assetManager.geometry.wedge.clone();
    xWedgeGeo.rotateX(-Math.PI/2);
    xWedgeGeo.scale(this.xSlantLen,this.startHieght - this.turnHeight,this.planeWidth);
    xWedgeGeo.computeVertexNormals();

    const zWedgeGeo = assetManager.geometry.wedge.clone();
    zWedgeGeo.rotateZ(Math.PI / 2);
    zWedgeGeo.scale(this.planeWidth,this.turnHeight - this.endHeight,this.zSlantLen);
    zWedgeGeo.computeVertexNormals();

    this.zWedge = new MeshObject(zWedgeGeo,sampleMC,"zWedge");

    this.xWedge = new MeshObject(xWedgeGeo,sampleMC,"xWedge");
  
    this.xBox = new MeshObject(xBoxGeo,sampleMC,"inclinedPlaneBox");

    this.sideWall1 = new MeshObject(sideWall1,sampleMC,"inclinedPlanesideWall1");
    this.sideWall2 = new MeshObject(sideWall2,sampleMC,"inclinedPlanesideWall2");
    this.sideWall3 = new MeshObject(sideWall3,sampleMC,"inclinedPlanesideWall3");

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

    this.position.set(0,0,0);

    this.ballRadius = 1;
    const ballGeo = new THREE.SphereGeometry(this.ballRadius);
    this.ball = new MeshObject(ballGeo,sampleMC,"inclinedPlaneBall");
    this.ball.position.copy(this.sideWall1.position);
    this.ball.position.y += this.startHieght/2 + this.ballRadius;
    this.add(this.ball);
    this.animationPhase = 1;
    this.ballSpeedVector = new THREE.Vector3(0,0,0);
  }
  checkAnimationPhase() {
    if (this.animationPhase === 1 && (this.ball.position.x >= this.sideWall1.position.x + this.sideWallWidth/2)) {
      this.ballSpeedVector.set(0,0,0);
      this.ball.position.x = this.sideWall1.position.x + this.sideWallWidth/2 + this.ballRadius * Math.sin(this.theta1);
      this.animationPhase = 2;
    } else if (this.animationPhase === 2 && this.ball.position.y <= this.xBox.position.y + this.turnHeight / 2 + this.ballRadius) {
      this.ballSpeedVector.set(this.ballSpeedVector.x,0,0);
      this.ball.position.x = this.xBox.position.x + (this.xSlantLen - this.planeWidth)/2 + this.ballRadius;
      this.ball.position.y = this.xBox.position.y + this.turnHeight/2  + this.ballRadius;
      this.animationPhase = 3;
    } else if (this.animationPhase === 3 && (this.ball.position.x >= this.sideWall3.position.x - this.sideWallWidth/2 - this.ballRadius)) {
      this.ballSpeedVector.set(-this.ballSpeedVector.x,0,0);
      this.animationPhase = 4;
    } else if (this.animationPhase === 4 && this.ball.position.x <=  this.zWedge.position.x) {
      this.ballSpeedVector.set(0,0,0);
      this.ball.position.y = this.xBox.position.y + this.turnHeight/2  + this.ballRadius;
      this.animationPhase = 5;
    } else if (this.animationPhase === 5 && (this.ball.position.z >= this.sideWall3.position.z + (this.planeWidth / 2) + this.ballRadius)) {
      this.ballSpeedVector.set(0,0,0);
      this.ball.position.z = this.sideWall3.position.z + (this.planeWidth / 2) + this.ballRadius * Math.sin(this.theta2);
      this.animationPhase = 6;
    }
    else if (this.animationPhase === 6 && this.ball.position.y <=  this.xBox.position.y - this.turnHeight / 2 + this.ballRadius) {
      this.ballSpeedVector.set(0,0,this.ballSpeedVector.z);
      this.ball.position.z = this.zWedge.position.z + this.zSlantLen/2 + this.ballRadius;
      this.ball.position.y = this.xBox.position.y - this.turnHeight / 2 + this.ballRadius;
      this.animationPhase = 7;
    }
  }
  physics(dt) {
    this.checkAnimationPhase();
    if (this.animationPhase === 1) {
      this.ballSpeedVector.x += 0.98 * dt;
    } else if (this.animationPhase === 2) {
      this.ballSpeedVector.x += 0.98 * dt * Math.cos(this.theta1);
      this.ballSpeedVector.y -= 0.98 * dt * Math.sin(this.theta1);
    } else if (this.animationPhase === 3) {
      this.ballSpeedVector.x -= 0.98 * dt;
    } else if (this.animationPhase === 4) {
      this.ballSpeedVector.x += 0.98 * dt;
    } else if (this.animationPhase === 5) {
      this.ballSpeedVector.z += 0.98 * dt;
    } else if (this.animationPhase === 6) {
      this.ballSpeedVector.z += 0.98 * dt * Math.cos(this.theta2);
      this.ballSpeedVector.y -= 0.98 * dt * Math.sin(this.theta2);
    }
  }
  animate(dt) {
    this.ball.position.addScaledVector(this.ballSpeedVector,dt);
  }
}

