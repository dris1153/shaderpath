precision highp float;

varying vec2 vDir;
varying float vSpeedT;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  c.y = -c.y; // gl_PointCoord's v grows downward; flip so +y means "up" like vDir

  // Rotate the SAMPLE point by -angle instead of rotating the shape by
  // +angle — cheaper, and avoids ever building a rotated geometry buffer.
  float angle = atan(vDir.x, vDir.y); // angle from +Y to vDir (atan2 with swapped args)
  float ca = cos(-angle);
  float sa = sin(-angle);
  vec2 rc = vec2(ca * c.x - sa * c.y, sa * c.x + ca * c.y);

  // Arrow/cone silhouette pointing toward local +Y: wide base at rc.y=-0.5,
  // tapering to a point at rc.y=0.5.
  float halfWidth = (0.5 - rc.y) * 0.55;
  float edgeDist = abs(rc.x) - halfWidth;
  float body = 1.0 - smoothstep(0.0, 0.04, edgeDist);
  float bounds = step(-0.5, rc.y) * step(rc.y, 0.5);
  float alpha = body * bounds;
  if (alpha < 0.05) discard;

  vec3 slow = vec3(0.35, 0.55, 0.95);
  vec3 fast = vec3(1.0, 0.65, 0.25);
  vec3 color = mix(slow, fast, vSpeedT);

  gl_FragColor = vec4(color, alpha);
}
