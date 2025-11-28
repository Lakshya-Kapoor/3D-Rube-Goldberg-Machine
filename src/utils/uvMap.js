import * as THREE from "three";

class UVMap {
  applyCylindricalMapping(geometry) {
    geometry.computeBoundingBox();

    const bbox = geometry.boundingBox;
    const minY = bbox.min.y;
    const maxY = bbox.max.y;
    const height = maxY - minY;

    const pos = geometry.attributes.position;
    const uvs = new Float32Array(pos.count * 2);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      const theta = Math.atan2(z, x);
      const u = (theta + Math.PI) / (2 * Math.PI);

      const v = (y - minY) / height;

      uvs[2 * i + 0] = u;
      uvs[2 * i + 1] = v;
    }

    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.attributes.uv.needsUpdate = true;
  }

  applySphericalMapping(geometry) {
    geometry.computeBoundingBox();

    const bbox = geometry.boundingBox;
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    const pos = geometry.attributes.position;
    const uvs = new Float32Array(pos.count * 2);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) - center.x;
      const y = pos.getY(i) - center.y;
      const z = pos.getZ(i) - center.z;

      const r = Math.sqrt(x * x + y * y + z * z);
      const nx = x / r;
      const ny = y / r;
      const nz = z / r;

      const u = 0.5 + Math.atan2(nx, nz) / (2 * Math.PI);
      const v = 0.5 - Math.asin(ny) / Math.PI;

      uvs[2 * i + 0] = u;
      uvs[2 * i + 1] = v;
    }

    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.attributes.uv.needsUpdate = true;
  }
}

export const uvMap = new UVMap();
