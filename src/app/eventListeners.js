import { app } from "./setup.js";

export function initEventListeners() {
  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "c") {
      app.cameraController.toggleFollowMode();
    }
  });

  window.addEventListener("resize", () => {
    app.camera.aspect = window.innerWidth / window.innerHeight;
    app.camera.updateProjectionMatrix();
    app.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
