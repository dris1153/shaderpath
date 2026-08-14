precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uJitter;
uniform float uMode;    // 0 = F1, 1 = F2-F1 border, 2 = cell-id colors, 3 = smooth
uniform float uMetric;  // 0 = Euclidean, 1 = Manhattan, 2 = Chebyshev
uniform float uAnimate; // 0/1

const float SCALE = 6.0;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

float metricDist(vec2 r) {
  if (uMetric < 0.5) return length(r);            // Euclidean: round cells
  if (uMetric < 1.5) return abs(r.x) + abs(r.y);   // Manhattan: diamond cells
  return max(abs(r.x), abs(r.y));                  // Chebyshev: square cells
}

// The feature point owned by one grid cell. uAnimate makes each point orbit
// its cell on an independent phase, driven by its own hash instead of a
// shared clock offset.
vec2 featurePoint(vec2 cell) {
  vec2 h = hash2(cell);
  if (uAnimate > 0.5) {
    h = 0.5 + 0.5 * sin(uTime + 6.2831853 * h);
  }
  return h;
}

// Scans the full 3x3 neighborhood (not just the current cell — see theory)
// and returns F1 (nearest), F2 (second-nearest) and the winning cell's id.
void voronoi(vec2 p, out float f1, out float f2, out vec2 f1Cell) {
  vec2 cell = floor(p);
  vec2 f = fract(p);

  f1 = 8.0;
  f2 = 8.0;
  f1Cell = cell;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 b = vec2(float(i), float(j));
      vec2 h = featurePoint(cell + b);
      vec2 r = b + h * uJitter - f;
      float d = metricDist(r);
      if (d < f1) {
        f2 = f1;
        f1 = d;
        f1Cell = cell + b;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }
}

// Quilez's smooth voronoi: replace the hard min with a log-sum-exp soft-min,
// removing the derivative discontinuity that sits at every F1==F2 border.
float smoothVoronoi(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float res = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 b = vec2(float(i), float(j));
      vec2 h = featurePoint(cell + b);
      vec2 r = b + h * uJitter - f;
      res += exp(-24.0 * metricDist(r));
    }
  }
  return -log(res) / 24.0;
}

void main() {
  vec2 p = vUv * SCALE;
  vec3 color;

  if (uMode < 0.5) {
    // F1: raw distance to the nearest feature point, as grayscale.
    float f1, f2;
    vec2 id;
    voronoi(p, f1, f2, id);
    color = vec3(f1);
  } else if (uMode < 1.5) {
    // F2 - F1 collapses to ~0 exactly on the boundary between two cells —
    // thresholding it draws thick, organic borders "for free".
    float f1, f2;
    vec2 id;
    voronoi(p, f1, f2, id);
    float border = 1.0 - smoothstep(0.0, 0.08, f2 - f1);
    color = mix(vec3(0.92, 0.88, 0.78), vec3(0.08, 0.06, 0.05), border);
  } else if (uMode < 2.5) {
    // Cell-ID: hash the WINNING CELL'S integer coordinate (not the pixel)
    // into a color, so every pixel that lost to the same point shares it.
    float f1, f2;
    vec2 id;
    voronoi(p, f1, f2, id);
    vec3 idColor = vec3(hash2(id), hash2(id + 11.3).x);
    color = idColor * (1.0 - 0.35 * f1);
  } else {
    float d = smoothVoronoi(p);
    color = vec3(0.15, 0.35, 0.55) + d * vec3(0.8, 0.55, 0.25);
  }

  gl_FragColor = vec4(color, 1.0);
}
