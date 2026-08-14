// Injected right after #include <begin_vertex>, which just declared
// `vec3 transformed = vec3( position );` — twist it in place before the
// later chunks (displacement map, projection) consume it.
float twistAngle = uTwist * transformed.y;
float twistCos = cos(twistAngle);
float twistSin = sin(twistAngle);
transformed.xz = mat2(twistCos, -twistSin, twistSin, twistCos) * transformed.xz;
vBand = transformed.y;
