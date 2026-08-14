// One texture fetch per vertex for position, one for velocity — this, not
// a CPU loop, is what places every one of the N instances every frame.
vec3 instancePos = texture2D(texturePosition, aInstanceUv).xyz;
vec3 instanceVel = texture2D(textureVelocity, aInstanceUv).xyz;
mat3 instanceBasis = (uOrient > 0.5 && length(instanceVel) > 0.0001)
  ? basisFromVelocity(instanceVel)
  : mat3(1.0);
