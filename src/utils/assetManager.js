import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { TextureLoader } from "three";

class AssetManager {
  GEOMETRY_DIR = "./assets/models";
  TEXTURE_DIR = "./assets/textures";

  constructor() {
    this._model_names = ["prism"];
    this._texture_names = ["stand", "wood"];
    this.geometry = {};
    this.texture = {};
    this._plyLoader = new PLYLoader();
    this._textureLoader = new TextureLoader();
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
