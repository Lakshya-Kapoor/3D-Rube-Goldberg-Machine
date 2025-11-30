import { app } from "./setup.js";
import { globalUniforms } from "./setup.js";

export function initEventListeners() {
  const btnSpotLight = document.getElementById("spotLight-btn");
  const btnPointLight = document.getElementById("pointLight-btn");
  const btnMovingSpotLight = document.getElementById("movingSpotLight-btn");

  const setLightActive = (btn, isOn) => {
    btn.classList.toggle("active", isOn);
  };

  btnSpotLight.addEventListener("click", () => {
    const i = 1;
    const newState = !globalUniforms.lights.value[i].on;
    globalUniforms.lights.value[i].on = newState;
    setLightActive(btnSpotLight, newState);
  });

  btnPointLight.addEventListener("click", () => {
    const i = 0;
    const newState = !globalUniforms.lights.value[i].on;
    globalUniforms.lights.value[i].on = newState;
    setLightActive(btnPointLight, newState);
  });

  btnMovingSpotLight.addEventListener("click", () => {
    const i = 2;
    const newState = !globalUniforms.lights.value[i].on;
    globalUniforms.lights.value[i].on = newState;
    setLightActive(btnMovingSpotLight, newState);
  });

  setLightActive(btnPointLight, globalUniforms.lights.value[0].on);
  setLightActive(btnSpotLight, globalUniforms.lights.value[1].on);
  setLightActive(btnMovingSpotLight, globalUniforms.lights.value[2].on);

  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "c") {
      app.cameraController.toggleFollowMode();
    }
  });
}
