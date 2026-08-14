// Per-instance UV into the compute state textures — set once at mesh
// setup, one value per instance (see demo.tsx: InstancedBufferAttribute).
attribute vec2 aInstanceUv;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float uOrient;

// Builds an orthonormal basis with +Y aligned to `dir` — rotates the local
// tetrahedron so its "up" axis points along its own GPU-computed velocity.
mat3 basisFromVelocity(vec3 dir) {
  vec3 up = normalize(dir);
  vec3 ref = abs(up.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 right = normalize(cross(ref, up));
  vec3 fwd = cross(up, right);
  return mat3(right, up, fwd);
}
