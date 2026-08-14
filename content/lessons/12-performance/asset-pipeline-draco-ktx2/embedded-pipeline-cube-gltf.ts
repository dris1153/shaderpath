import * as THREE from "three";

// Built from a REAL THREE.BoxGeometry at module load -- no hand-typed binary
// bytes. Produces the exact accessor/bufferView shape GLTFLoader.parse()
// reads from a real .gltf file; only the transport (inline JSON vs. network
// fetch) differs, same technique as loading-gltf-draco-meshopt (Track 3).
// componentType 5126 = FLOAT, 5125 = UNSIGNED_INT.
// bufferView target 34962 = ARRAY_BUFFER, 34963 = ELEMENT_ARRAY_BUFFER.

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Manual base64 encode (loop, no spread) -- safe for buffers too large for
// String.fromCharCode(...bytes), which blows the call stack past ~100k args.
function toBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += BASE64_CHARS[b0 >> 2];
    out += BASE64_CHARS[((b0 & 0x03) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    out +=
      b1 === undefined
        ? "="
        : BASE64_CHARS[((b1 & 0x0f) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    out += b2 === undefined ? "=" : BASE64_CHARS[b2 & 0x3f];
  }
  return out;
}

interface EmbeddedCubeBuild {
  gltf: Record<string, unknown>;
  vertexCount: number;
  triangleCount: number;
}

function buildEmbeddedCubeGltf(): EmbeddedCubeBuild {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const positionAttr = geometry.attributes.position!;
  const normalAttr = geometry.attributes.normal!;
  const uvAttr = geometry.attributes.uv!;
  const position = positionAttr.array as Float32Array;
  const normal = normalAttr.array as Float32Array;
  const uv = uvAttr.array as Float32Array;
  const index = Uint32Array.from(geometry.index!.array);

  const vertexCount = positionAttr.count;
  const indexCount = index.length;

  const positionBytes = new Uint8Array(
    position.buffer,
    position.byteOffset,
    position.byteLength,
  );
  const normalBytes = new Uint8Array(
    normal.buffer,
    normal.byteOffset,
    normal.byteLength,
  );
  const uvBytes = new Uint8Array(uv.buffer, uv.byteOffset, uv.byteLength);
  const indexBytes = new Uint8Array(
    index.buffer,
    index.byteOffset,
    index.byteLength,
  );

  const combined = new Uint8Array(
    positionBytes.length + normalBytes.length + uvBytes.length + indexBytes.length,
  );
  let offset = 0;
  combined.set(positionBytes, offset);
  offset += positionBytes.length;
  const normalOffset = offset;
  combined.set(normalBytes, offset);
  offset += normalBytes.length;
  const uvOffset = offset;
  combined.set(uvBytes, offset);
  offset += uvBytes.length;
  const indexOffset = offset;
  combined.set(indexBytes, offset);

  const gltf: Record<string, unknown> = {
    asset: { version: "2.0", generator: "shaderpath-embedded-pipeline-cube" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "PipelineCube" }],
    meshes: [
      {
        name: "PipelineCubeMesh",
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
            indices: 3,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        name: "PipelineCubeMaterial",
        pbrMetallicRoughness: {
          baseColorFactor: [0.85, 0.55, 0.2, 1],
          metallicFactor: 0.1,
          roughnessFactor: 0.6,
        },
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: vertexCount,
        type: "VEC3",
        min: [-0.5, -0.5, -0.5],
        max: [0.5, 0.5, 0.5],
      },
      { bufferView: 1, componentType: 5126, count: vertexCount, type: "VEC3" },
      { bufferView: 2, componentType: 5126, count: vertexCount, type: "VEC2" },
      { bufferView: 3, componentType: 5125, count: indexCount, type: "SCALAR" },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positionBytes.length, target: 34962 },
      { buffer: 0, byteOffset: normalOffset, byteLength: normalBytes.length, target: 34962 },
      { buffer: 0, byteOffset: uvOffset, byteLength: uvBytes.length, target: 34962 },
      { buffer: 0, byteOffset: indexOffset, byteLength: indexBytes.length, target: 34963 },
    ],
    buffers: [
      {
        byteLength: combined.length,
        uri: "data:application/octet-stream;base64," + toBase64(combined),
      },
    ],
  };

  return { gltf, vertexCount, triangleCount: indexCount / 3 };
}

const built = buildEmbeddedCubeGltf();

export const EMBEDDED_PIPELINE_CUBE_GLTF = built.gltf;
export const EMBEDDED_PIPELINE_CUBE_VERTEX_COUNT = built.vertexCount;
export const EMBEDDED_PIPELINE_CUBE_TRIANGLE_COUNT = built.triangleCount;
