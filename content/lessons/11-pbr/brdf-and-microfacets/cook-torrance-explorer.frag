precision highp float;

varying vec3 vNormal;
varying vec3 vWorldPosition;

// cameraPosition is Three's built-in uniform (see Track 6) -- do not redeclare it.

uniform float uRoughness;
uniform float uMetalness;
uniform vec3 uBaseColor;
uniform vec3 uLightDir; // normalized, points FROM surface TOWARD the light
uniform vec3 uLightColor;
uniform int uMode; // 0 = combined, 1 = D, 2 = G, 3 = F (each isolated as grayscale)

const float PI = 3.14159265359;

// D: GGX / Trowbridge-Reitz normal distribution (Walter et al. 2007).
// alpha = roughness^2 is Karis's (2013) perceptually-linear remap.
float distributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float ndoth = max(dot(N, H), 0.0);
  float denom = ndoth * ndoth * (a2 - 1.0) + 1.0;
  return a2 / (PI * denom * denom + 1e-7);
}

// G1: Schlick-GGX single-direction masking term.
float geometrySchlickGGX(float ndotx, float k) {
  return ndotx / (ndotx * (1.0 - k) + k);
}

// G: Smith's separable shadowing-masking -- one G1 per direction, multiplied.
// k here is the DIRECT-LIGHT remap (Karis 2013); IBL uses a different k.
float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  float ndotv = max(dot(N, V), 0.0);
  float ndotl = max(dot(N, L), 0.0);
  return geometrySchlickGGX(ndotv, k) * geometrySchlickGGX(ndotl, k);
}

// F: Schlick's approximation of Fresnel reflectance (full derivation next lesson).
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 L = normalize(uLightDir);
  vec3 H = normalize(V + L);

  float ndotv = max(dot(N, V), 0.0);
  float ndotl = max(dot(N, L), 0.0);

  // Dielectrics start at F0=0.04 (~4% reflectance, IOR~1.5); metals use
  // their own albedo as F0 (Karis 2013 / Filament metalness workflow).
  vec3 F0 = mix(vec3(0.04), uBaseColor, uMetalness);

  float D = distributionGGX(N, H, uRoughness);
  float G = geometrySmith(N, V, L, uRoughness);
  vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

  vec3 specular = (D * G * F) / (4.0 * ndotv * ndotl + 1e-4);

  // Metals have zero diffuse response; kd fades out as metalness -> 1.
  vec3 kd = (vec3(1.0) - F) * (1.0 - uMetalness);
  vec3 diffuse = kd * uBaseColor / PI;

  vec3 color = (diffuse + specular) * uLightColor * ndotl;

  if (uMode == 1) {
    // D can spike into the thousands at low roughness (see exercises) --
    // scaled down so the lobe shape stays visible instead of clipping white.
    color = vec3(D * 0.05);
  } else if (uMode == 2) {
    color = vec3(G);
  } else if (uMode == 3) {
    color = vec3(dot(F, vec3(0.2126, 0.7152, 0.0722))); // luma, grayscale F
  }

  gl_FragColor = vec4(color, 1.0);
}
