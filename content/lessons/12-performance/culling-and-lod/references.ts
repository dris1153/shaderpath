import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-source-frustum",
    type: "repo",
    title: "three.js — src/math/Frustum.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/math/Frustum.js",
    note: {
      vi: "intersectsObject() thật: boundingSphere copy + applyMatrix4 rồi so với 6 mặt phẳng — nguồn cho toàn bộ phần cơ chế frustum culling của bài này.",
      en: "The real intersectsObject(): copy the boundingSphere + applyMatrix4, then compare against 6 planes — the source for this lesson's frustum-culling mechanism section.",
    },
  },
  {
    id: "threejs-source-webglrenderer-projectobject",
    type: "repo",
    title: "three.js — src/renderers/WebGLRenderer.js, projectObject() (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/renderers/WebGLRenderer.js#L1831",
    note: {
      vi: "projectObject() thật: object.visible sớm return, isLOD gọi lod.update(camera) tự động, isGroup không tự test frustum — nguồn cho phần 'Group không tự cull' và cơ chế cập nhật LOD.",
      en: "The real projectObject(): the early object.visible return, isLOD calling lod.update(camera) automatically, isGroup never being frustum-tested itself — the source for the 'Group doesn't self-cull' section and the LOD update mechanism.",
    },
  },
  {
    id: "threejs-source-instancedmesh-bounds",
    type: "repo",
    title: "three.js — src/objects/InstancedMesh.js, computeBoundingSphere() (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/src/objects/InstancedMesh.js",
    note: {
      vi: "Chứng minh trực tiếp claim 'một bounding sphere cho tất cả instance': vòng lặp union từng instance sphere vào một sphere duy nhất.",
      en: "Directly proves the 'one bounding sphere for all instances' claim: the loop that unions each instance sphere into a single combined sphere.",
    },
  },
  {
    id: "threejs-docs-lod",
    type: "article",
    title: "Three.js Docs — LOD",
    url: "https://threejs.org/docs/#api/en/objects/LOD",
    note: {
      vi: "Tài liệu chính thức của addLevel/getObjectForDistance/autoUpdate — đối chiếu với source để phân biệt API bề mặt và cơ chế cập nhật thật mỗi frame.",
      en: "Official docs for addLevel/getObjectForDistance/autoUpdate — cross-reference against the source to separate the surface API from the real per-frame update mechanism.",
    },
  },
  {
    id: "mdn-webgl2-occlusion-query",
    type: "article",
    title: "MDN — WebGL2RenderingContext: beginQuery() method",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/beginQuery",
    note: {
      vi: "Nguồn cho phần occlusion query GPU: ANY_SAMPLES_PASSED_CONSERVATIVE, và bản chất bất đồng bộ của getQueryParameter/QUERY_RESULT_AVAILABLE mà bài này nêu.",
      en: "The source for the GPU occlusion query section: ANY_SAMPLES_PASSED_CONSERVATIVE, and the asynchronous nature of getQueryParameter/QUERY_RESULT_AVAILABLE this lesson describes.",
    },
  },
];
