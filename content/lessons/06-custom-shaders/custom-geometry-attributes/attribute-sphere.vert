precision highp float;

// Custom per-vertex data. Three has no idea these exist — they are declared
// exactly like any other vertex attribute (GLSL1-style; Three compiles this
// to whatever GLSL version the WebGL2 context actually needs).
attribute float aRandom;   // itemSize 1: one random scalar per vertex
attribute float aWeight;   // itemSize 1: a painted mask (here: a Y-based gradient)
attribute vec3 aRandomDir; // itemSize 3: one fixed random direction per vertex

uniform float uAmplitude;
uniform float uMode; // 0 = displace along normal, 1 = along aRandomDir

varying float vRandom;
varying float vWeight;
varying vec3 vNormal;

void main() {
  vRandom = aRandom;
  vWeight = aWeight;

  // aWeight gates WHERE the effect is strong, aRandom varies HOW MUCH per vertex.
  float amt = uAmplitude * aRandom * aWeight;
  vec3 dir = uMode < 0.5 ? normal : aRandomDir;
  vec3 displaced = position + dir * amt;

  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
