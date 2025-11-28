import * as THREE from "three";

export default class BaseObject extends THREE.Object3D {
  constructor() {
    super();
  }

  physics(dt) {}
  animate(dt) {}

  update(dt) {
    this.physics(dt);
    this.animate(dt);
  }
}
