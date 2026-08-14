// Injected right after #include <color_fragment>, once diffuseColor already
// carries the material's own color/map/vertex-color — mix in a band on top.
float band = sin(vBand * 6.0) * 0.5 + 0.5;
vec3 bandColor = mix(vec3(0.15, 0.55, 0.9), vec3(0.95, 0.35, 0.15), band);
diffuseColor.rgb = mix(diffuseColor.rgb, bandColor, 0.55);
