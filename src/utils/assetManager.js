import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { TextureLoader, LoadingManager } from "three";

class AssetManager {
  GEOMETRY_DIR = "./assets/models";
  TEXTURE_DIR = "./assets/textures";

  constructor() {
    this._model_names = ["wedge", "prism"];
    this._texture_names = [
      "wall",
      "pendulum",
      "ball1",
      "ball2",
      "inclinedPlane",
      "domino",
      "seesaw",
      "ball3",
      "prism",
    ];

    this.geometry = {};
    this.texture = {};

    // Create loading manager for tracking progress
    this._loadingManager = new LoadingManager();
    this._plyLoader = new PLYLoader(this._loadingManager);
    this._textureLoader = new TextureLoader(this._loadingManager);

    // Loading UI elements
    this._loadingScreen = null;
    this._loadingProgress = null;

    this._setupLoadingUI();
    this._setupLoadingManager();
  }

  _setupLoadingUI() {
    this._loadingScreen = document.getElementById("loading-screen");
    this._loadingProgress = document.querySelector(".loading-progress");
  }

  _setupLoadingManager() {
    this._loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      if (this._loadingProgress) {
        this._loadingProgress.textContent = `${Math.round(progress)}%`;
      }
    };

    this._loadingManager.onLoad = () => {
      this._hideLoadingScreen();
    };
  }

  _hideLoadingScreen() {
    if (this._loadingScreen) {
      this._loadingScreen.classList.add("fade-out");
      setTimeout(() => {
        this._loadingScreen.classList.add("hidden");
      }, 500);
    }
  }

  geometryPath(name) {
    return `${this.GEOMETRY_DIR}/${name}.ply`;
  }

  async loadGeometry() {
    const loadPromises = this._model_names.map(async (name) => {
      const path = this.geometryPath(name);
      const geometry = await this._plyLoader.loadAsync(path);
      this.geometry[name] = geometry;
    });

    await Promise.all(loadPromises);
  }

  texturePath(name) {
    return `${this.TEXTURE_DIR}/${name}.jpg`;
  }

  async loadTexture() {
    const loadPromises = this._texture_names.map(async (name) => {
      const path = this.texturePath(name);
      const texture = await this._textureLoader.loadAsync(path);
      this.texture[name] = texture;
    });

    await Promise.all(loadPromises);
  }

  async load() {
    await Promise.all([this.loadGeometry(), this.loadTexture()]);
  }
}

export const assetManager = new AssetManager();
