// Real excerpts from three@0.185.1 (github tag r185), trimmed for width.
// Kept as string constants per the vanilla-Three demo convention -- shown
// beside the live scene that demonstrates the exact behavior below.

export interface SourceSnippet {
  id: "attach" | "culling" | "order" | "state";
  label: { vi: string; en: string };
  file: string;
  url: string;
  code: string;
}

export const SOURCE_SNIPPETS: SourceSnippet[] = [
  {
    id: "attach",
    label: { vi: "Object3D.attach()", en: "Object3D.attach()" },
    file: "src/core/Object3D.js#L874-L908",
    url: "https://github.com/mrdoob/three.js/blob/r185/src/core/Object3D.js#L874-L908",
    code: `attach( object ) {
  // adds object as a child of this, while keeping its world transform
  this.updateWorldMatrix( true, false );
  _m1.copy( this.matrixWorld ).invert();

  if ( object.parent !== null ) {
    object.parent.updateWorldMatrix( true, false );
    _m1.multiply( object.parent.matrixWorld );
  }

  object.applyMatrix4( _m1 ); // rewrites position/quaternion/scale
  object.removeFromParent();
  object.parent = this;
  this.children.push( object );

  object.updateWorldMatrix( false, true );
  return this;
}`,
  },
  {
    id: "culling",
    label: { vi: "Frustum culling trong render()", en: "Frustum culling in render()" },
    file: "src/renderers/WebGLRenderer.js#L1658-1659, #L1883-1885",
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/WebGLRenderer.js#L1658-L1659",
    code: `_projScreenMatrix.multiplyMatrices(
  camera.projectionMatrix,
  camera.matrixWorldInverse,
);
_frustum.setFromProjectionMatrix( _projScreenMatrix, ... );

// later, once per Mesh while walking the scene graph:
if ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) {
  // only reachable here does the object enter the render list
  currentRenderList.push( object, geometry, material, groupOrder, ... );
}`,
  },
  {
    id: "order",
    label: { vi: "Sort render list: opaque vs transparent", en: "Render list sort: opaque vs transparent" },
    file: "src/renderers/webgl/WebGLRenderLists.js#L1-51",
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/webgl/WebGLRenderLists.js#L1-L51",
    code: `function painterSortStable( a, b ) {
  // ...
  if ( a.z !== b.z ) return a.z - b.z;  // ascending: near -> far
  return a.id - b.id;
}

function reversePainterSortStable( a, b ) {
  // ...
  if ( a.z !== b.z ) return b.z - a.z;  // descending: far -> near
  return a.id - b.id;
}

// render(): currentRenderList.sort( _opaqueSort, _transparentSort, ... )
// opaque uses painterSortStable, transparent uses reversePainterSortStable`,
  },
  {
    id: "state",
    label: { vi: "WebGLState: cache gl.enable/disable", en: "WebGLState: caching gl.enable/disable" },
    file: "src/renderers/webgl/WebGLState.js#L461-481",
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/webgl/WebGLState.js#L461-L481",
    code: `let enabledCapabilities = {};

function enable( id ) {
  if ( enabledCapabilities[ id ] !== true ) {
    gl.enable( id );          // the real WebGL call from Track 1
    enabledCapabilities[ id ] = true;
  }
  // else: no-op -- already enabled, skip the driver call entirely
}

function disable( id ) {
  if ( enabledCapabilities[ id ] !== false ) {
    gl.disable( id );
    enabledCapabilities[ id ] = false;
  }
}`,
  },
];
