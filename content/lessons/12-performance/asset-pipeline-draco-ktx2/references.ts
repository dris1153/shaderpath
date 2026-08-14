import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gltf-transform-cli-docs",
    type: "article",
    title: "glTF Transform — CLI Documentation",
    authors: ["Don McCurdy"],
    url: "https://gltf-transform.dev/cli",
    note: {
      vi: "Nguồn cho các lệnh CLI thật dùng trong bài (`optimize --compress draco --texture-compress ktx2`, `uastc`, `etc1s`) — tra cứu flag mới nhất khi phiên bản gltf-transform đổi.",
      en: "The source for the real CLI commands used in this lesson (`optimize --compress draco --texture-compress ktx2`, `uastc`, `etc1s`) — check here for the latest flags whenever gltf-transform's version changes.",
    },
  },
  {
    id: "gltf-transform-github-repo",
    type: "repo",
    title: "glTF-Transform",
    authors: ["Don McCurdy"],
    url: "https://github.com/donmccurdy/glTF-Transform",
    note: {
      vi: "Repo gốc — nguồn cho script lập trình (`NodeIO`, `document.transform`) và cho chi tiết vì sao nén KTX2 lập trình hiện chỉ tồn tại trong gói CLI (issue #675), không phải trong `@gltf-transform/functions` công khai.",
      en: "The source repo — the reference for the scripting example (`NodeIO`, `document.transform`) and for why programmatic KTX2 compression currently only lives in the CLI package (issue #675), not in the public `@gltf-transform/functions`.",
    },
  },
  {
    id: "khronos-khr-draco-mesh-compression",
    type: "spec",
    title: "KHR_draco_mesh_compression — glTF Extension",
    authors: ["Khronos Group"],
    url: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_draco_mesh_compression",
    note: {
      vi: "Đặc tả chuẩn của extension mà DRACOLoader/GLTFLoader đọc lúc parse — nguồn gốc không phải diễn giải lại cho cách bufferView trỏ tới dữ liệu Draco đã nén.",
      en: "The authoritative extension spec that DRACOLoader/GLTFLoader read while parsing — the original (not paraphrased) source for how a bufferView points at compressed Draco data.",
    },
  },
  {
    id: "khronos-khr-texture-basisu",
    type: "spec",
    title: "KHR_texture_basisu — glTF Extension",
    authors: ["Khronos Group"],
    url: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_texture_basisu",
    note: {
      vi: "Đặc tả chuẩn cho việc dùng ảnh KTX2/Basis Universal làm texture trong glTF — nguồn cho khẳng định 'transcode sang định dạng GPU-native theo thiết bị' trong bài.",
      en: "The authoritative spec for using KTX2/Basis Universal images as glTF textures — the source for this lesson's claim that KTX2Loader transcodes to a device-native GPU format.",
    },
  },
  {
    id: "google-draco-repo",
    type: "repo",
    title: "Draco: 3D Data Compression",
    authors: ["Google"],
    url: "https://github.com/google/draco",
    note: {
      vi: "README của Draco — nguồn cho con số nén hình học >90% và cơ chế lượng tử hoá + entropy coding trích dẫn trong bài.",
      en: "The Draco library's README — the source for the >90% geometry compression figure and the quantization + entropy-coding mechanism cited in this lesson.",
    },
  },
];
