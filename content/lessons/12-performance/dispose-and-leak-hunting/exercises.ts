import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "orphaned-vram-arithmetic",
    kind: "concept",
    prompt: {
      vi: `Một component R3F build một \`THREE.CanvasTexture\` $256 \\times 256$ pixel, format RGBA8, gán vào \`material.map\`, dựng qua \`new THREE.Mesh(...)\` rồi gắn vào scene qua \`<primitive object={mesh} />\`. Khi unmount, code chỉ gọi \`material.dispose()\` — không đụng gì tới \`texture\`.

Không chạy code: tính số byte VRAM bị mồ côi sau **mỗi lần** mount/unmount như vậy, rồi tính tổng sau 20 chu kỳ (người dùng lướt qua 20 bài học có demo này trong một phiên). Sau đó giải thích: vì sao gọi thêm \`material.dispose()\` nhiều lần nữa cũng không giải phóng được số VRAM đó?`,
      en: `An R3F component builds a $256 \\times 256$ pixel RGBA8 \`THREE.CanvasTexture\`, assigns it to \`material.map\`, constructs the mesh with \`new THREE.Mesh(...)\`, and attaches it to the scene via \`<primitive object={mesh} />\`. On unmount, the code only calls \`material.dispose()\` — it never touches \`texture\`.

Without running code: compute how many bytes of VRAM go orphaned on **each** such mount/unmount, then the total after 20 cycles (a user browsing through 20 lessons with this demo in one session). Then explain: why would calling \`material.dispose()\` again, any number of times, never free that VRAM?`,
    },
    hints: [
      {
        vi: "Dung lượng texture RGBA8 không mipmap là width × height × 4 byte (4 = số byte mỗi texel: R, G, B, A mỗi kênh 1 byte).",
        en: "An RGBA8 texture with no mipmaps occupies width × height × 4 bytes (4 = bytes per texel: one byte each for R, G, B, A).",
      },
      {
        vi: "material.dispose() chỉ dispatch sự kiện 'dispose' của CHÍNH material — WebGLTextures không hề lắng nghe sự kiện đó, nó chỉ lắng nghe sự kiện 'dispose' của chính đối tượng Texture.",
        en: "material.dispose() only dispatches the MATERIAL's own 'dispose' event — WebGLTextures never listens for that; it only listens for the Texture object's own 'dispose' event.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng: mỗi chu kỳ mồ côi 256×256×4 = 262,144 byte (256 KiB); 20 chu kỳ = 5,242,880 byte (5 MiB)",
        en: "I correctly computed: each cycle orphans 256×256×4 = 262,144 bytes (256 KiB); 20 cycles = 5,242,880 bytes (5 MiB)",
      },
      {
        vi: "Tôi giải thích được vì sao material.dispose() không cascade xuống map — nó không lắng nghe sự kiện dispose của texture",
        en: "I can explain why material.dispose() doesn't cascade to its map — it never listens for the texture's own dispose event",
      },
      {
        vi: "Tôi nêu được cách sửa đúng: gọi texture.dispose() độc lập, tốt nhất qua useDisposable.register() ngay chỗ tạo texture",
        en: "I can state the correct fix: call texture.dispose() independently, ideally via useDisposable.register() right where the texture is created",
      },
    ],
    solutionNote: {
      vi: `Mỗi chu kỳ: \`256 * 256 * 4 = 262,144 byte = 256 KiB\` mồ côi (texture không bao giờ được dispose, chỉ material bị dispose). 20 chu kỳ: \`262,144 * 20 = 5,242,880 byte = 5 MiB\` — cộng dồn tuyến tính, không giảm dù gọi lại \`material.dispose()\` thêm bao nhiêu lần.

Lý do \`material.dispose()\` vô dụng ở đây: nó chỉ \`dispatchEvent({type: 'dispose'})\` trên CHÍNH nó. \`WebGLTextures\` (manager dọn texture bên trong \`WebGLRenderer\`) chỉ gắn listener lên sự kiện 'dispose' của từng \`Texture\` RIÊNG LẺ khi texture đó được render lần đầu — nó không hề biết, và không quan tâm, material nào đang tham chiếu texture đó. Texture chỉ được dọn khi CHÍNH \`texture.dispose()\` được gọi.`,
      en: `Each cycle: \`256 * 256 * 4 = 262,144 bytes = 256 KiB\` orphaned (the texture is never disposed, only the material is). 20 cycles: \`262,144 * 20 = 5,242,880 bytes = 5 MiB\` — accumulates linearly, and doesn't shrink no matter how many more times \`material.dispose()\` is called.

Why \`material.dispose()\` is useless here: it only \`dispatchEvent({type: 'dispose'})\` on ITSELF. \`WebGLTextures\` (the texture-cleanup manager inside \`WebGLRenderer\`) only attaches a listener to each individual \`Texture\`'s own 'dispose' event, the first time that texture gets rendered — it has no idea, and doesn't care, which material references that texture. A texture only gets cleaned up when \`texture.dispose()\` itself is called.`,
    },
  },
  {
    id: "fix-leaky-preview-panel",
    kind: "code",
    prompt: {
      vi: `Component \`LeakyPreviewPanel\` bên dưới build 4 thứ tự tay bằng \`new THREE.X()\` — \`geometry\`, một \`THREE.CanvasTexture\` (swatch màu vẽ bằng canvas 2D, không phải asset nhị phân), \`material\` gán texture đó vào \`map\`, và một \`THREE.WebGLRenderTarget\` dùng cho preview phụ — rồi gắn mesh vào scene qua \`<primitive>\`. Không có gì được dispose khi unmount. Sửa bằng \`useDisposable\` (\`lib/hooks/use-disposable.ts\`) để cả 4 object đều được dọn đúng lúc — không đổi hình dạng hiển thị.`,
      en: `The \`LeakyPreviewPanel\` component below hand-builds 4 things with \`new THREE.X()\` — \`geometry\`, a \`THREE.CanvasTexture\` (a color swatch drawn with 2D canvas, not a binary asset), a \`material\` with that texture assigned to \`map\`, and a \`THREE.WebGLRenderTarget\` used for a secondary preview — then attaches the mesh to the scene via \`<primitive>\`. Nothing gets disposed on unmount. Fix it with \`useDisposable\` (\`lib/hooks/use-disposable.ts\`) so all 4 objects are cleaned up at the right time — without changing what's rendered.`,
    },
    starterCode: `import { useMemo } from "react";
import * as THREE from "three";

function makeSwatchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

// BUG: geometry, texture, material, and the render target are all built
// with \`new\`, attached via <primitive>, and never disposed — every mount
// leaks all four permanently.
function LeakyPreviewPanel() {
  const mesh = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(1.5, 1.5);
    const texture = makeSwatchTexture();
    const material = new THREE.MeshBasicMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
  }, []);

  // Used by a secondary (off-screen) preview pass elsewhere in the real
  // component — kept here to show a render target ALSO needs disposal.
  const previewTarget = useMemo(
    () => new THREE.WebGLRenderTarget(256, 256),
    [],
  );

  // TODO: use useDisposable() to register geometry, texture, material, and
  // previewTarget so they're all disposed when LeakyPreviewPanel unmounts.

  return <primitive object={mesh} />;
}`,
    solutionCode: `import { useMemo } from "react";
import * as THREE from "three";
import { useDisposable } from "@/lib/hooks/use-disposable";

function makeSwatchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

function CleanPreviewPanel() {
  const disposables = useDisposable();

  const mesh = useMemo(() => {
    const geometry = disposables.register(new THREE.PlaneGeometry(1.5, 1.5));
    const texture = disposables.register(makeSwatchTexture());
    const material = disposables.register(
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    return new THREE.Mesh(geometry, material);
  }, [disposables]);

  const previewTarget = useMemo(
    () => disposables.register(new THREE.WebGLRenderTarget(256, 256)),
    [disposables],
  );
  void previewTarget; // used by the off-screen pass elsewhere in the real component

  return <primitive object={mesh} />;
}`,
    hints: [
      {
        vi: "register() không đổi kiểu hay hành vi runtime của object — gọi nó ngay tại chỗ new THREE.X() và dùng giá trị trả về y như trước, cho cả 4 object.",
        en: "register() doesn't change an object's type or runtime behavior — call it right at the new THREE.X() site and use the returned value exactly as before, for all 4 objects.",
      },
      {
        vi: "Texture là một object độc lập với material dù được gán vào material.map — nó cần register() riêng, không tự động đi theo khi material được register.",
        en: "The texture is an object independent from the material even though it's assigned to material.map — it needs its own register() call, it isn't automatically covered just because the material is registered.",
      },
    ],
    checklist: [
      {
        vi: "Cả 4 object (geometry, texture, material, previewTarget) đều được bọc qua disposables.register(...)",
        en: "All 4 objects (geometry, texture, material, previewTarget) are wrapped through disposables.register(...)",
      },
      {
        vi: "disposables nằm trong dependency array của cả hai useMemo liên quan",
        en: "disposables is included in the dependency array of both relevant useMemo calls",
      },
      {
        vi: "Component vẫn render đúng tấm plane màu xanh như trước khi sửa, chỉ khác ở việc dispose khi unmount",
        en: "The component still renders the same blue plane as before the fix, differing only in disposing on unmount",
      },
    ],
  },
];
