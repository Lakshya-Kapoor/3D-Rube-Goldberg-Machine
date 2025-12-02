import * as THREE from "three";

export class CameraController {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;

    this.defaultPosition = camera.position.clone();
    this.followMode = true;
    this.controls.enabled = false; // Disable orbit controls by default in follow mode
    this.focusPoint = new THREE.Vector3();
    this.offset = new THREE.Vector3(-50, 100, 100);
    this.lerpFactor = 0.05; // Smoothing factor (0-1, lower = smoother)
    this.targetPosition = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
  }

  setFocusPoint(point) {
    this.focusPoint.copy(point);
  }

  toggleFollowMode() {
    this.followMode = !this.followMode;
    this.controls.enabled = !this.followMode; // Disable orbit controls in follow mode

    // birds eye view when not following
    if (!this.followMode) {
      this.camera.position.set(-100, 100, 100);
    }
  }

  update() {
    if (!this.followMode) return;

    // Calculate target position
    this.targetPosition.copy(this.focusPoint).add(this.offset);

    // Smoothly interpolate camera position
    this.camera.position.lerp(this.targetPosition, this.lerpFactor);

    // Smoothly interpolate look-at target
    this.targetLookAt.lerp(this.focusPoint, this.lerpFactor);
    this.camera.lookAt(this.targetLookAt);
  }
}
