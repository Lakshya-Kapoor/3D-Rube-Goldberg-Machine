import * as THREE from "three";

export function placeBottomAt(mesh, targetY = 0) {
  const bbox = new THREE.Box3().setFromObject(mesh);
  const minY = bbox.min.y;

  mesh.position.y += targetY - minY;
}

export function placeLeftAt(mesh, targetX = 0) {
  const bbox = new THREE.Box3().setFromObject(mesh);
  const minX = bbox.min.x;

  mesh.position.x += targetX - minX;
}

export function placeNearAt(mesh, targetZ = 0) {
  const bbox = new THREE.Box3().setFromObject(mesh);
  const minZ = bbox.min.z;

  mesh.position.z += targetZ - minZ;
}

