// instanceMatrix (multiplied in further down, in #include <project_vertex>)
// is set to identity for every instance in demo.tsx — position comes from
// here instead, sampled from the compute texture by this instance's UV.
transformed = instanceBasis * transformed;
transformed += instancePos;
