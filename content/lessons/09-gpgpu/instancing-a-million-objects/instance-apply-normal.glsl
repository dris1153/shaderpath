// Rotate the normal by the same basis applied to position below — skip
// this and lighting stays aligned to the un-rotated tetrahedron while the
// mesh visibly spins (see mistake #2).
objectNormal = instanceBasis * objectNormal;
