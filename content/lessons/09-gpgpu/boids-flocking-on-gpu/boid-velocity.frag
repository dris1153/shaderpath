uniform float uSeparationWeight;
uniform float uAlignmentWeight;
uniform float uCohesionWeight;
uniform float uPerceptionRadius;
uniform float uMaxSpeed;
uniform float uBounds;

// Matches the 64x64 state texture (4096 boids) wired up in demo.tsx — a
// literal here (not `resolution`, which is a vec2 #define) keeps the loop
// bound a plain constant, which every GLSL ES compiler accepts unrolled.
const float GRID = 64.0;
const float SEPARATION_RATIO = 0.4;
const float ALIGNMENT_RATIO = 0.7;
const float TURN_FORCE = 0.06;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;

  float sepRadius = uPerceptionRadius * SEPARATION_RATIO;
  float aliRadius = uPerceptionRadius * ALIGNMENT_RATIO;

  vec3 separation = vec3(0.0);
  vec3 avgVel = vec3(0.0);
  vec3 avgPos = vec3(0.0);
  float sepCount = 0.0;
  float aliCount = 0.0;
  float cohCount = 0.0;

  // O(N^2): every one of the 4096 boids scans all 4096 texels every frame —
  // ~16.8M texture reads/frame total. Affordable at this size (see theory);
  // the stride-sampling fix for larger N is discussed there, not wired in here.
  for (float y = 0.0; y < GRID; y += 1.0) {
    for (float x = 0.0; x < GRID; x += 1.0) {
      vec2 otherUv = (vec2(x, y) + 0.5) / GRID;
      vec3 otherPos = texture2D(texturePosition, otherUv).xyz;
      float dist = distance(pos, otherPos);
      // Distance, never UV equality, is what skips "self" — see mistake #2.
      if (dist < 0.0001 || dist > uPerceptionRadius) continue;

      if (dist < sepRadius) {
        separation += (pos - otherPos) / (dist * dist);
        sepCount += 1.0;
      }
      if (dist < aliRadius) {
        avgVel += texture2D(textureVelocity, otherUv).xyz;
        aliCount += 1.0;
      }
      avgPos += otherPos;
      cohCount += 1.0;
    }
  }

  vec3 newVel = vel;

  if (sepCount > 0.0) {
    newVel += normalize(separation) * uSeparationWeight * 0.08;
  }
  if (aliCount > 0.0) {
    avgVel /= aliCount;
    newVel += (avgVel - vel) * uAlignmentWeight * 0.06;
  }
  if (cohCount > 0.0) {
    avgPos /= cohCount;
    newVel += normalize(avgPos - pos) * uCohesionWeight * 0.04;
  }

  // Soft-turn container force: nudge back once a boid drifts past the
  // bounds instead of teleporting it (the wrap alternative — see theory).
  newVel.x += pos.x < -uBounds ? TURN_FORCE : (pos.x > uBounds ? -TURN_FORCE : 0.0);
  newVel.y += pos.y < -uBounds ? TURN_FORCE : (pos.y > uBounds ? -TURN_FORCE : 0.0);
  newVel.z += pos.z < -uBounds ? TURN_FORCE : (pos.z > uBounds ? -TURN_FORCE : 0.0);

  float speed = length(newVel);
  float minSpeed = uMaxSpeed * 0.4;
  if (speed > uMaxSpeed) {
    newVel = newVel / speed * uMaxSpeed;
  } else if (speed > 0.0001 && speed < minSpeed) {
    newVel = newVel / speed * minSpeed;
  }

  gl_FragColor = vec4(newVel, 1.0);
}
