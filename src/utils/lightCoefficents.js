import * as THREE from "three";

export const sampleLC = {
  position: new THREE.Vector3(0, 80, 0),
  Ia: new THREE.Vector3(0.3, 0.3, 0.3),
  Id: new THREE.Vector3(1.0, 1.0, 1.0),
  Is: new THREE.Vector3(1.0, 1.0, 1.0),

  kc: 1.0,
  kl: 0,
  kq: 0,
  on: false,
  spotLight: false,
  direction: new THREE.Vector3(0, -1, 0),
  cutoff: Math.cos(12.5 * (Math.PI / 180)), // 12.5 degrees in radians
  outerCutoff: Math.cos(17.5 * (Math.PI / 180)), // 17.5 degrees in radians
};

export const pointLight1LC = {
  position: new THREE.Vector3(0, 80, 0),
  Ia: new THREE.Vector3(0.3, 0.3, 0.3),
  Id: new THREE.Vector3(0.5, 0.5, 0.5),
  Is: new THREE.Vector3(0.7, 0.7, 0.7),

  kc: 0.9,
  kl: 0,
  kq: 0,
  on: true,
  spotLight: false,
  direction: new THREE.Vector3(0, -1, 0),
  cutoff: Math.cos(12.5 * (Math.PI / 180)), // 12.5 degrees in radians
  outerCutoff: Math.cos(17.5 * (Math.PI / 180)), // 17.5 degrees in radians
};

export const spotLight1LC = {
  position: new THREE.Vector3(50, 80, 0),
  Ia: new THREE.Vector3(0.3, 0.3, 0.3),
  Id: new THREE.Vector3(1.0, 1.0, 1.0),
  Is: new THREE.Vector3(1.0, 1.0, 1.0),

  kc: 0.9,
  kl: 0,
  kq: 0,
  on: true,
  spotLight: true,
  direction: new THREE.Vector3(0, -1, 0),
  cutoff: Math.cos(10 * (Math.PI / 180)), // 12.5 degrees in radians
  outerCutoff: Math.cos(13.0 * (Math.PI / 180)), // 17.5 degrees in radians
};
export const spotLight2LC = {
  position: new THREE.Vector3(0, 80, 50),
  Ia: new THREE.Vector3(0.3, 0.3, 0.3),
  Id: new THREE.Vector3(1.0, 1.0, 1.0),
  Is: new THREE.Vector3(1.0, 1.0, 1.0),

  kc: 0.9,
  kl: 0,
  kq: 0,
  on: true,
  spotLight: true,
  direction: new THREE.Vector3(0, -1, 0),
  cutoff: Math.cos(10 * (Math.PI / 180)), // 12.5 degrees in radians
  outerCutoff: Math.cos(13.0 * (Math.PI / 180)), // 17.5 degrees in radians
};
export const spotLight3LC = {
  position: new THREE.Vector3(0, 80, 0),
  Ia: new THREE.Vector3(0.3, 0.3, 0.3),
  Id: new THREE.Vector3(1.0, 1.0, 1.0),
  Is: new THREE.Vector3(1.0, 1.0, 1.0),

  kc: 0.9,
  kl: 0,
  kq: 0,
  on: true,
  spotLight: true,
  direction: new THREE.Vector3(0, -1, 0),
  cutoff: Math.cos(10 * (Math.PI / 180)), // 12.5 degrees in radians
  outerCutoff: Math.cos(13.0 * (Math.PI / 180)), // 17.5 degrees in radians
};

export function cloneLightCoefficients(lc) {
  return {
    position: lc.position.clone(),
    Ia: lc.Ia.clone(),
    Id: lc.Id.clone(),
    Is: lc.Is.clone(),
    kc: lc.kc,
    kl: lc.kl,
    kq: lc.kq,
    on: lc.on,
    spotLight: lc.spotLight,
    direction: lc.direction.clone(),
    cutoff: lc.cutoff,
    outerCutoff: lc.outerCutoff,
  };
}
