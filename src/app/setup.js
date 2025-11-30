import * as THREE from "three";
import { assetManager } from "../utils/assetManager.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  pointLight1LC,
  spotLight1LC,
  spotLight2LC,
  cloneLightCoefficients,
} from "../utils/lightCoefficents.js";
import { CameraController } from "./CameraController.js";

export const globalUniforms = {
  lights: { value: [] },
  numLights: { value: 0 },
  textures: { value: [] },
  usePhong: { value: 0 },
};

export const app = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  cameraController: null,
};

export async function setup() {
  await assetManager.load();

  const canvas = document.getElementById("main-canvas");
  app.scene = new THREE.Scene();
  app.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  app.camera.position.set(-2000, 1000, 2000);

  app.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  app.renderer.setSize(window.innerWidth, window.innerHeight);
  app.renderer.setPixelRatio(window.devicePixelRatio);

  // Populate the textures array - indices match textureIndex in materialCoefficents
  globalUniforms.textures.value = [
    assetManager.texture.wall,
    assetManager.texture.pendulum,
    assetManager.texture.ball1,
    assetManager.texture.ball2,
    assetManager.texture.inclinedPlane,
    assetManager.texture.domino,
    assetManager.texture.seesaw,
    assetManager.texture.ball3,
    assetManager.texture.prism,
  ];

  globalUniforms.lights.value = [
    cloneLightCoefficients(pointLight1LC),
    cloneLightCoefficients(spotLight1LC),
    cloneLightCoefficients(spotLight2LC),
  ];
  globalUniforms.numLights.value = 3;
  globalUniforms.usePhong.value = 1;

  app.controls = new OrbitControls(app.camera, app.renderer.domElement);
  app.controls.minDistance = 1;
  app.controls.maxDistance = 100;

  app.cameraController = new CameraController(app.camera, app.controls);
}
