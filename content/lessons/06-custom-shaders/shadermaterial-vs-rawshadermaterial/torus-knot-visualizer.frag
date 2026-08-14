precision highp float;

varying vec2 vUv;
varying vec3 vNormal;

// 0 = uv, 1 = normal, 2 = mix (uv + normal + fake light)
uniform int uMode;
uniform vec3 uLightDir;

void main() {
  vec3 uvColor = vec3(vUv, 0.5);
  vec3 normalColor = normalize(vNormal) * 0.5 + 0.5;

  vec3 color;
  if (uMode == 0) {
    color = uvColor;
  } else if (uMode == 1) {
    color = normalColor;
  } else {
    float diffuse = max(dot(normalize(vNormal), normalize(uLightDir)), 0.0);
    color = mix(uvColor, normalColor, 0.5) * (0.4 + 0.6 * diffuse);
  }

  gl_FragColor = vec4(color, 1.0);
}
