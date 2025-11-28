import { assetManager } from "../utils/assetManager.js";

export async function setup() {
  await assetManager.load();
}
