// Minimal glTF 2.0 JSON: a 6-face cube, one flat color per face carried as a
// COLOR_0 vertex attribute, with the position/normal/color/index buffer
// embedded as a base64 data URI (no external .bin/.glb on disk). This is the
// exact structure GLTFLoader.parse() reads for a real .gltf file — only the
// transport (inline string vs. network fetch) differs.
// componentType 5126 = FLOAT, 5123 = UNSIGNED_SHORT.
// bufferView target 34962 = ARRAY_BUFFER, 34963 = ELEMENT_ARRAY_BUFFER.
export const EMBEDDED_COLOR_CUBE_GLTF: Record<string, unknown> = {
  asset: { version: "2.0", generator: "shaderpath-embedded-cube" },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0, name: "ColorCube" }],
  meshes: [
    {
      name: "CubeMesh",
      primitives: [
        {
          attributes: { POSITION: 0, NORMAL: 1, COLOR_0: 2 },
          indices: 3,
          material: 0,
        },
      ],
    },
  ],
  materials: [
    {
      name: "VertexColorMaterial",
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        metallicFactor: 0,
        roughnessFactor: 0.7,
      },
    },
  ],
  accessors: [
    {
      bufferView: 0,
      componentType: 5126,
      count: 24,
      type: "VEC3",
      min: [-0.5, -0.5, -0.5],
      max: [0.5, 0.5, 0.5],
    },
    { bufferView: 1, componentType: 5126, count: 24, type: "VEC3" },
    { bufferView: 2, componentType: 5126, count: 24, type: "VEC3" },
    { bufferView: 3, componentType: 5123, count: 36, type: "SCALAR" },
  ],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: 288, target: 34962 },
    { buffer: 0, byteOffset: 288, byteLength: 288, target: 34962 },
    { buffer: 0, byteOffset: 576, byteLength: 288, target: 34962 },
    { buffer: 0, byteOffset: 864, byteLength: 72, target: 34963 },
  ],
  buffers: [
    {
      byteLength: 936,
      uri:
        "data:application/octet-stream;base64," +
        "AAAAvwAAAL8AAAA/AAAAPwAAAL8AAAA/AAAAPwAAAD8AAAA/AAAAvwAAAD8AAAA/" +
        "AAAAPwAAAL8AAAC/AAAAvwAAAL8AAAC/AAAAvwAAAD8AAAC/AAAAPwAAAD8AAAC/" +
        "AAAAvwAAAD8AAAA/AAAAPwAAAD8AAAA/AAAAPwAAAD8AAAC/AAAAvwAAAD8AAAC/" +
        "AAAAvwAAAL8AAAC/AAAAPwAAAL8AAAC/AAAAPwAAAL8AAAA/AAAAvwAAAL8AAAA/" +
        "AAAAPwAAAL8AAAA/AAAAPwAAAL8AAAC/AAAAPwAAAD8AAAC/AAAAPwAAAD8AAAA/" +
        "AAAAvwAAAL8AAAC/AAAAvwAAAL8AAAA/AAAAvwAAAD8AAAA/AAAAvwAAAD8AAAC/" +
        "AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/" +
        "AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/" +
        "AAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAA" +
        "AAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAA" +
        "AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAA" +
        "AACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAA" +
        "AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAA" +
        "AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/" +
        "AAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAA" +
        "AACAPwAAAAAAAIA/AACAPwAAAAAAAIA/AACAPwAAAAAAAIA/AACAPwAAAAAAAIA/" +
        "AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/" +
        "AACAPwAAgD8AAAAAAACAPwAAgD8AAAAAAACAPwAAgD8AAAAAAACAPwAAgD8AAAAA" +
        "AAABAAIAAAACAAMABAAFAAYABAAGAAcACAAJAAoACAAKAAsADAANAA4ADAAOAA8A" +
        "EAARABIAEAASABMAFAAVABYAFAAWABcA",
    },
  ],
};
