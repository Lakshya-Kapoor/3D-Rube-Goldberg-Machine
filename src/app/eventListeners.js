import { app } from "./setup.js";

export function initEventListeners() {
  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "c") {
      app.cameraController.toggleFollowMode();
    }
  });
}
