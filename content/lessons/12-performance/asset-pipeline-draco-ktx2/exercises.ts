import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "draco-ratio-and-when-not-to-compress",
    kind: "concept",
    prompt: {
      vi: `Một model kiến trúc có phần hình học thô nặng $18\\text{MB}$ (float32, chưa nén). Dùng tỉ lệ nén Draco ước lượng $\\text{ratio} \\approx 0.9$ theo công thức $\\text{ratio} = 1 - \\text{size}_{\\text{compressed}} / \\text{size}_{\\text{raw}}$, tính dung lượng hình học sau khi nén.

Sau đó xét một tình huống khác: một icon nhỏ có phần hình học thô chỉ nặng $8\\text{KB}$, tải trên mạng broadband mất khoảng $3\\text{ms}$ (ước lượng), trong khi khởi tạo decoder Draco cộng thời gian giải mã tốn khoảng $15\\text{ms}$ (ước lượng, phần lớn là chi phí khởi tạo WASM một lần, gần như cố định bất kể file nhỏ hay lớn). Icon này có nên nén bằng Draco không — trả lời bằng đúng cơ chế so sánh \`network time\` với \`decode time\` đã học, không chỉ nói "không nên" suông.`,
      en: `An architectural model has raw geometry weighing $18\\text{MB}$ (float32, uncompressed). Using an estimated Draco compression ratio of $\\text{ratio} \\approx 0.9$ from $\\text{ratio} = 1 - \\text{size}_{\\text{compressed}} / \\text{size}_{\\text{raw}}$, compute the geometry size after compression.

Then consider a different case: a small icon whose raw geometry is only $8\\text{KB}$, taking about $3\\text{ms}$ (an estimate) to download on broadband, while spinning up the Draco decoder plus decode time costs about $15\\text{ms}$ (an estimate, mostly fixed one-time WASM init cost regardless of file size). Should this icon be Draco-compressed — answer using the exact \`network time\` vs. \`decode time\` mechanism covered in the lesson, not just a bare "no."`,
    },
    hints: [
      {
        vi: "size_compressed = size_raw * (1 - ratio) — thay số trực tiếp, đừng làm tròn vội.",
        en: "size_compressed = size_raw * (1 - ratio) — substitute directly, don't round early.",
      },
      {
        vi: "So sánh 3ms tải thô với 15ms decode: con số nào lớn hơn quyết định câu trả lời, không phải cảm tính về việc nén 'chắc luôn tốt hơn'.",
        en: "Compare the 3ms raw download against the 15ms decode: whichever is larger decides the answer, not a gut feeling that compression is 'always better'.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng dung lượng hình học sau nén (18MB × 0.1 = 1.8MB)",
        en: "I computed the post-compression geometry size correctly (18MB × 0.1 = 1.8MB)",
      },
      {
        vi: "Tôi kết luận đúng: KHÔNG nên nén icon, vì decode (~15ms) chậm hơn network time (~3ms)",
        en: "I reached the right conclusion: do NOT compress the icon, since decode (~15ms) is slower than network time (~3ms)",
      },
      {
        vi: "Tôi giải thích được lý do bằng đúng cơ chế đo trước khi tối ưu (network time vs decode time), không chỉ nói chung chung",
        en: "I explained the reasoning using the actual measure-first mechanism (network time vs. decode time), not a vague statement",
      },
    ],
    solutionNote: {
      vi: `$18\\text{MB} \\times (1 - 0.9) = 1.8\\text{MB}$ — dung lượng hình học sau khi nén Draco (ước lượng).

Icon nhỏ: network time (~3ms) < decode time (~15ms) → KHÔNG nên nén. Chi phí khởi tạo một lần của decoder WASM gần như cố định bất kể kích thước file, nên với một asset vốn đã rất nhỏ, thêm bước Draco lại LÀM TĂNG tổng thời gian đến khi dùng được — đúng quy tắc đo trước khi tối ưu: chỉ nén khi network time so với decode time chứng minh được một lợi ích thật sự, không bao giờ nén theo phản xạ.`,
      en: `$18\\text{MB} \\times (1 - 0.9) = 1.8\\text{MB}$ — geometry size after Draco compression (estimate).

Small icon: network time (~3ms) < decode time (~15ms) → do NOT compress. The WASM decoder's one-time init cost is roughly fixed regardless of file size, so for an asset that's already tiny, adding a Draco step INCREASES total time-to-usable — exactly the measure-first rule: compress only when network time vs. decode time proves a real win, never by reflex.`,
    },
  },
  {
    id: "wire-compressed-gltf-loader",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`createCompressedGltfLoader(renderer, dracoPath, basisPath)\` trả về một \`GLTFLoader\` đã đăng ký đầy đủ \`DRACOLoader\` và \`KTX2Loader\`, sẵn sàng nạp một file glTF dùng cả hai extension \`KHR_draco_mesh_compression\` và \`KHR_texture_basisu\`. Đúng thứ tự bắt buộc: \`detectSupport\` phải chạy trước khi loader trả về được dùng để load bất kỳ file nào.`,
      en: `Write a \`createCompressedGltfLoader(renderer, dracoPath, basisPath)\` function returning a \`GLTFLoader\` fully wired with a \`DRACOLoader\` and a \`KTX2Loader\`, ready to load a glTF file using both the \`KHR_draco_mesh_compression\` and \`KHR_texture_basisu\` extensions. Required order: \`detectSupport\` must run before the returned loader is used to load anything.`,
    },
    starterCode: `import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import type { WebGLRenderer } from "three";

function createCompressedGltfLoader(
  renderer: WebGLRenderer,
  dracoPath: string,
  basisPath: string,
): GLTFLoader {
  // TODO 1: create a DRACOLoader, setDecoderPath(dracoPath)
  // TODO 2: create a KTX2Loader, setTranscoderPath(basisPath), then detectSupport(renderer)
  // TODO 3: create a GLTFLoader, register both loaders above (setDRACOLoader/setKTX2Loader)
  // TODO 4: return the fully configured loader
  throw new Error("TODO");
}`,
    solutionCode: `function createCompressedGltfLoader(
  renderer: WebGLRenderer,
  dracoPath: string,
  basisPath: string,
): GLTFLoader {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(dracoPath);

  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath(basisPath);
  ktx2Loader.detectSupport(renderer); // must run before this loader loads anything

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.setKTX2Loader(ktx2Loader);
  return loader;
}`,
    hints: [
      {
        vi: "detectSupport nhận đúng tham số renderer -- thiếu nó, KTX2Loader ném lỗi 'Missing initialization' ngay khi gặp texture KTX2 đầu tiên trong file.",
        en: "detectSupport takes the renderer as its argument -- skip it and KTX2Loader throws 'Missing initialization' the moment it hits the file's first KTX2 texture.",
      },
      {
        vi: "GLTFLoader.setDRACOLoader/.setKTX2Loader đều trả về chính loader đó (chainable theo source GLTFLoader.js) -- có thể return trực tiếp kết quả gọi chuỗi thay vì tạo biến riêng.",
        en: "GLTFLoader.setDRACOLoader/.setKTX2Loader both return the loader itself (chainable, per GLTFLoader.js's source) -- you can return the chained call directly instead of a separate variable.",
      },
    ],
    checklist: [
      {
        vi: "DRACOLoader được gọi setDecoderPath đúng với tham số dracoPath truyền vào",
        en: "DRACOLoader has setDecoderPath called with the dracoPath argument passed in",
      },
      {
        vi: "KTX2Loader gọi setTranscoderPath rồi detectSupport(renderer) theo đúng thứ tự đó",
        en: "KTX2Loader calls setTranscoderPath then detectSupport(renderer) in that exact order",
      },
      {
        vi: "GLTFLoader trả về đã đăng ký cả setDRACOLoader và setKTX2Loader trước khi hàm return",
        en: "The returned GLTFLoader has both setDRACOLoader and setKTX2Loader registered before the function returns",
      },
    ],
  },
];
