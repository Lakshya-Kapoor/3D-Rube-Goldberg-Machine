import * as THREE from "three";
import { globalUniforms } from "../app/setup.js";
import { VERTEX_SHADER } from "../shaders/vertexShaderSource.js";
import { FRAGMENT_SHADER } from "../shaders/fragmentShaderSource.js";

export class MeshObject extends THREE.Mesh {
  constructor(geometry, materialCoefficents, name) {
    geometry.computeVertexNormals();

    // Prepare uniforms without touching `this` yet
    const mcUniforms = THREE.UniformsUtils.clone(materialCoefficents);
    // const mergedUniforms = THREE.UniformsUtils.merge([globalUniforms, mcUniforms]);
    const mergedUniforms = {
      ...mcUniforms,
      lights: globalUniforms.lights,
      numLights: globalUniforms.numLights,
      textures: globalUniforms.textures,
      usePhong: globalUniforms.usePhong,
    };

    // Clone the provided ShaderMaterial to preserve render states/defines
    const shMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: mergedUniforms,
    });

    super(geometry, shMaterial);
    this.name = name;
    // Instance fields after super()
    this.vCount = geometry.attributes.position.count;

    // Keep a handy ref to the material uniforms (includes ka/kd/ks/etc.)
    this.MCUniforms = this.material.uniforms;

    // Optional convenience fields bound to the same uniform values
    this.ka = this.MCUniforms.ka.value;
    this.kd = this.MCUniforms.kd.value;
    this.ks = this.MCUniforms.ks.value;
    this.shininess = this.MCUniforms.shininess.value;
    this.useTexture = this.MCUniforms.useTexture.value;
    this.textureIndex = this.MCUniforms.textureIndex.value;
  }

  updateKs(newKs) {
    this.MCUniforms.ks.value.copy(newKs);
  }

  updateKd(newKd) {
    this.MCUniforms.kd.value.copy(newKd);
  }

  updateKa(newKa) {
    this.MCUniforms.ka.value.copy(newKa);
  }

  updateShininess(newShininess) {
    this.MCUniforms.shininess.value = newShininess;
  }
  getKs() {
    return this.MCUniforms.ks.value;
  }
  getKd() {
    return this.MCUniforms.kd.value;
  }
  getKa() {
    return this.MCUniforms.ka.value;
  }
  getShininess() {
    return this.MCUniforms.shininess.value;
  }
}
