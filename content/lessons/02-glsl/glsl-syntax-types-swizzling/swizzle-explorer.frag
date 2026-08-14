precision highp float;

varying vec2 vUv;
uniform float uMode; // 0=xyz 1=xyx 2=yxy 3=bgr

void main() {
  // vec3() constructor + a swizzle write (l-value): base.xy = vUv
  vec3 base = vec3(0.0);
  base.xy = vUv;
  base.z = 0.5;

  vec3 color;
  if (uMode < 0.5) {
    color = base.xyz; // identity read
  } else if (uMode < 1.5) {
    color = base.xyx; // repeat: x duplicated into the blue slot
  } else if (uMode < 2.5) {
    color = base.yxy; // permute: swap x/y, then repeat y into blue
  } else {
    color = base.bgr; // same 3 slots, rgba alias, reversed order
  }

  gl_FragColor = vec4(color, 1.0);
}
