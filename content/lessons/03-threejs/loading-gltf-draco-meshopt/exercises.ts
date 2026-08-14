import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "draco-vs-meshopt-tradeoff",
    kind: "concept",
    prompt: {
      vi: `Một dự án catalog nội thất cần nạp khoảng 40 model GLTF khác nhau khi người dùng lướt qua danh sách sản phẩm — model đổi gần như liên tục theo thao tác cuộn. Một dự án khác chỉ tải DUY NHẤT một model kiến trúc rất nặng, đúng một lần khi vào trang, và ưu tiên kích thước file tải về nhỏ nhất có thể trên mạng di động chậm.

Với mỗi tình huống, chọn Draco hay meshopt hợp lý hơn, và giải thích bằng đúng cơ chế đánh đổi giữa hai kỹ thuật — không chỉ nói "cái nào nén tốt hơn". Nhắc tới \`setDRACOLoader\` hoặc \`setMeshoptDecoder\` trong câu trả lời.`,
      en: `A furniture catalog app needs to load around 40 different GLTF models as the user scrolls through a product list — models swap almost continuously. A different project loads exactly ONE very heavy architectural model, exactly once on page entry, and prioritizes the smallest possible download on a slow mobile connection.

For each scenario, pick Draco or meshopt, and justify it with the actual mechanism behind the trade-off — not just "which one compresses better." Mention \`setDRACOLoader\` or \`setMeshoptDecoder\` in your answer.`,
    },
    hints: [
      {
        vi: "Draco đổi kích thước file nhỏ hơn lấy chi phí decode CPU cao hơn qua WASM; meshopt đổi kích thước gần bằng lấy tốc độ decode nhanh hơn nhiều.",
        en: "Draco trades a smaller file for a heavier WASM CPU decode; meshopt trades near-equal size for a much faster decode.",
      },
      {
        vi: "Nghĩ về đại lượng nào là bottleneck thật trong mỗi tình huống: băng thông mạng một lần duy nhất, hay tổng CPU decode cộng dồn qua nhiều lần load liên tiếp.",
        en: "Think about which quantity is the real bottleneck in each case: a single one-time network transfer, or cumulative decode CPU across many back-to-back loads.",
      },
    ],
    checklist: [
      {
        vi: "Tôi chọn đúng kỹ thuật cho tình huống catalog cuộn liên tục (meshopt, vì decode nhanh quan trọng hơn khi model đổi liên tục)",
        en: "I picked the right technique for the continuously-scrolling catalog (meshopt, since fast decode matters more when models keep swapping)",
      },
      {
        vi: "Tôi chọn đúng kỹ thuật cho tình huống model kiến trúc tải một lần (Draco, vì kích thước file là bottleneck chính)",
        en: "I picked the right technique for the once-loaded architectural model (Draco, since file size is the main bottleneck)",
      },
      {
        vi: "Tôi giải thích được đúng cơ chế đánh đổi (kích thước file vs tốc độ decode), không chỉ nói chung chung",
        en: "I explained the actual trade-off mechanism (file size vs. decode speed), not just a vague preference",
      },
    ],
    solutionNote: {
      vi: `Catalog cuộn liên tục 40 model → chọn meshopt (\`loader.setMeshoptDecoder(MeshoptDecoder)\`). Bottleneck là tổng thời gian decode cộng dồn mỗi lần model mới xuất hiện, không phải băng thông một lần — meshopt decode nhanh hơn Draco đáng kể (theo benchmark của meshoptimizer, ước lượng) nên giữ UI mượt khi cuộn.

Model kiến trúc nặng, tải một lần trên mạng di động chậm → chọn Draco (\`dracoLoader.setDecoderPath("/draco/")\` rồi \`loader.setDRACOLoader(dracoLoader)\`). Bottleneck là băng thông tải về đúng một lần — Draco thường nén hình học nhỏ hơn (nguồn: Draco README), và chi phí decode WASM một lần chấp nhận được vì chỉ xảy ra đúng 1 lần trong đời trang.`,
      en: `For the continuously-scrolling 40-model catalog → pick meshopt (\`loader.setMeshoptDecoder(MeshoptDecoder)\`). The bottleneck is the cumulative decode time each time a new model appears, not a one-time bandwidth cost — meshopt decodes noticeably faster than Draco (per meshoptimizer's own benchmarks, roughly), keeping the UI smooth while scrolling.

For the heavy architectural model loaded once on a slow mobile connection → pick Draco (\`dracoLoader.setDecoderPath("/draco/")\` then \`loader.setDRACOLoader(dracoLoader)\`). The bottleneck is the one-time download bandwidth — Draco typically compresses geometry smaller (source: the Draco README), and the one-time WASM decode cost is acceptable since it happens exactly once in the page's lifetime.`,
    },
  },
  {
    id: "dispose-gltf-hierarchy",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`disposeHierarchy(root)\` nhận vào gốc của một hierarchy Three.js đã nạp từ GLTF (ví dụ \`gltf.scene\`) và giải phóng đúng mọi geometry, material và texture bên trong — không bỏ sót texture nào, kể cả những texture gắn trên thuộc tính material bạn không đoán trước tên (\`map\`, \`normalMap\`, \`roughnessMap\`, ...). Dùng \`object3D.traverse\` để duyệt.`,
      en: `Write a \`disposeHierarchy(root)\` function that takes the root of a Three.js hierarchy loaded from GLTF (e.g. \`gltf.scene\`) and correctly releases every geometry, material and texture inside it — without missing any texture, including ones attached under material properties you can't predict by name (\`map\`, \`normalMap\`, \`roughnessMap\`, ...). Use \`object3D.traverse\` to walk it.`,
    },
    starterCode: `function disposeHierarchy(root: THREE.Object3D) {
  root.traverse((obj) => {
    // TODO 1: skip if obj isn't a Mesh
    // TODO 2: obj.geometry.dispose()
    // TODO 3: material can be an array -- normalize to an array before iterating
    // TODO 4: for each material, scan EVERY property to find textures (isTexture)
    //         and dispose them, then dispose the material itself
  });
}`,
    solutionCode: `function disposeHierarchy(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    obj.geometry.dispose();

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of materials) {
      for (const key of Object.keys(material)) {
        const value = (material as unknown as Record<string, unknown>)[key];
        if (value && typeof value === "object" && "isTexture" in value) {
          (value as THREE.Texture).dispose();
        }
      }
      material.dispose();
    }
  });
}`,
    hints: [
      {
        vi: "obj.material có thể là một material đơn hoặc một mảng (multi-material mesh) — luôn chuẩn hoá về mảng bằng Array.isArray trước khi lặp.",
        en: "obj.material can be a single material or an array (multi-material mesh) — always normalize to an array with Array.isArray before iterating.",
      },
      {
        vi: "Đừng liệt kê tên thuộc tính texture thủ công (map, normalMap, ...) — quét Object.keys(material) và kiểm tra value.isTexture để không bỏ sót loại map nào.",
        en: "Don't hand-list texture property names (map, normalMap, ...) — scan Object.keys(material) and check value.isTexture so no map type gets missed.",
      },
    ],
    checklist: [
      {
        vi: "Hàm dispose geometry của mọi Mesh trong hierarchy, kể cả mesh lồng sâu trong nhiều Group",
        en: "The function disposes the geometry of every Mesh in the hierarchy, including ones nested deep in several Groups",
      },
      {
        vi: "Hàm xử lý đúng cả trường hợp material là mảng lẫn material đơn",
        en: "The function correctly handles both an array of materials and a single material",
      },
      {
        vi: "Hàm dispose mọi texture gắn trên material bằng cách quét property thay vì liệt kê tên cố định",
        en: "The function disposes every texture attached to a material by scanning properties instead of a fixed name list",
      },
    ],
  },
];
