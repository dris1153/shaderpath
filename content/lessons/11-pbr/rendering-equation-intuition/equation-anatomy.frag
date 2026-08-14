precision highp float;

#define MAX_LIGHTS 32

varying vec3 vNormal;
varying vec3 vWorldPosition;

// cameraPosition is Three's built-in uniform (see Track 6) -- do not redeclare it.

uniform int uMode; // 0 = Le only, 1 = diffuse integral approx, 2 = specular lobe, 3 = combined
uniform int uLightCount;
uniform vec3 uLightDir[MAX_LIGHTS]; // Fibonacci-hemisphere samples, computed in JS
uniform vec3 uSkyColor;
uniform vec3 uBaseColor;
uniform vec3 uEmissiveColor;
uniform vec3 uKeyLightDir;
uniform float uShininess;

void main() {
  vec3 N = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);

  // Le(x, wo): emission, independent of any incoming light.
  vec3 emission = uEmissiveColor;

  // Discrete Riemann-sum approximation of integral_Omega fr * Li * (n.wi) dwi:
  // uLightCount samples spread over the hemisphere, each weighted 1/N so the
  // TOTAL energy stays roughly constant as N grows -- only smoothness improves,
  // exactly the Monte-Carlo-style convergence the theory lesson describes.
  vec3 diffuse = vec3(0.0);
  float weight = 1.0 / float(uLightCount);
  for (int i = 0; i < MAX_LIGHTS; i++) {
    if (i >= uLightCount) break;
    float ndotl = max(dot(N, uLightDir[i]), 0.0); // Lambert's cosine term
    diffuse += uBaseColor * uSkyColor * ndotl * weight;
  }

  // fr's specular lobe in isolation: one fixed key light, Blinn-Phong highlight
  // (an ad-hoc lobe standing in for a real Cook-Torrance fr -- next lesson).
  vec3 H = normalize(uKeyLightDir + viewDir);
  float specAmt = pow(max(dot(N, H), 0.0), uShininess);
  vec3 specular = vec3(1.0) * specAmt * max(dot(N, uKeyLightDir), 0.0);

  vec3 color;
  if (uMode == 0) {
    color = emission;
  } else if (uMode == 1) {
    color = diffuse;
  } else if (uMode == 2) {
    color = specular;
  } else {
    color = emission * 0.15 + diffuse + specular;
  }

  gl_FragColor = vec4(color, 1.0);
}
