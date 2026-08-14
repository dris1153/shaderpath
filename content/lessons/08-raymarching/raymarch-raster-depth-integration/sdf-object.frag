precision highp float;

varying vec3 vWorldPosition;

// Three.js auto-injects viewMatrix/cameraPosition into fragment shaders, but
// NOT projectionMatrix (fragment-only, unlike the vertex stage) — declare it
// ourselves; Three still fills it in every render since it's now active.
uniform mat4 projectionMatrix;

uniform vec2 uResolution;
uniform sampler2D uMeshDepth;
uniform float uCameraNear;
uniform float uCameraFar;
uniform vec3 uBlobCenter;
uniform float uBlobPulse;
uniform float uNaive;      // 1.0 = ignore the mesh depth bound entirely
uniform float uWriteDepth; // 1.0 = write gl_FragDepthEXT from the raymarch hit

const int MAX_STEPS = 80;
const float MAX_DIST = 6.0;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// Polynomial smooth min (bài trước: sdf-boolean-ops-smooth-min).
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdBlob(vec3 p) {
  p -= uBlobCenter;
  float d1 = sdSphere(p, 0.82 + 0.07 * uBlobPulse);
  float d2 = sdSphere(p - vec3(0.55, 0.25, 0.05), 0.55);
  float d3 = sdSphere(p - vec3(-0.5, -0.3, 0.35), 0.5);
  float d = smin(d1, d2, 0.4);
  d = smin(d, d3, 0.4);
  return d;
}

vec3 blobNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    sdBlob(p + e.xyy) - sdBlob(p - e.xyy),
    sdBlob(p + e.yxy) - sdBlob(p - e.yxy),
    sdBlob(p + e.yyx) - sdBlob(p - e.yyx)
  ));
}

void main() {
  vec3 rayOrigin = cameraPosition;
  vec3 rayDir = normalize(vWorldPosition - cameraPosition);

  // Track1's depth(d) = f/(f-n) * (1 - n/d), inverted to recover the mesh's
  // linear view-space distance from the sampled (nonlinear) depth texture.
  vec2 screenUv = gl_FragCoord.xy / uResolution;
  float meshDepth = texture2D(uMeshDepth, screenUv).r;
  float linearEyeDepth =
    (uCameraNear * uCameraFar) /
    (uCameraFar - meshDepth * (uCameraFar - uCameraNear));

  // Relate "linear distance along the camera's view axis" to "distance along
  // THIS ray": t_bound = eyeDepth / (-rayDirView.z), since view-space z of a
  // point at parametric t along the ray is t * rayDirView.z.
  vec3 rayDirView = mat3(viewMatrix) * rayDir;
  float tBoundFromMesh = linearEyeDepth / max(-rayDirView.z, 1.0e-4);

  float tMax = (uNaive > 0.5) ? MAX_DIST : min(MAX_DIST, tBoundFromMesh);

  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < MAX_STEPS; i++) {
    if (t >= tMax) break;
    vec3 p = rayOrigin + rayDir * t;
    float d = sdBlob(p);
    float eps = 0.0015 * max(t, 1.0);
    if (d < eps) {
      hit = true;
      break;
    }
    t += d;
  }

  if (!hit) discard;

  vec3 hitPos = rayOrigin + rayDir * t;
  vec3 n = blobNormal(hitPos);
  float diff = max(dot(n, normalize(vec3(0.5, 0.8, 0.4))), 0.0);
  vec3 base = vec3(0.35, 0.55, 0.95);
  vec3 color = base * (0.25 + 0.75 * diff);
  gl_FragColor = vec4(color, 1.0);

  if (uWriteDepth > 0.5) {
    vec4 clip = projectionMatrix * viewMatrix * vec4(hitPos, 1.0);
    float ndcDepth = clip.z / clip.w;
    gl_FragDepthEXT = ndcDepth * 0.5 + 0.5;
  } else {
    // Explicitly keep the proxy SPHERE's own rasterized depth (gl_FragCoord.z)
    // instead of the true blob-hit depth — wrong on purpose: GLSL leaves
    // gl_FragDepth's value undefined on any path that skips assigning it once
    // ANY path assigns it, so we assign it explicitly here too (never rely on
    // the implicit default). This is the demo's "gl_FragDepth off" toggle.
    gl_FragDepthEXT = gl_FragCoord.z;
  }
}
