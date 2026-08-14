import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "vram-cost-of-a-texture-set",
    kind: "concept",
    prompt: {
      vi: `Một material dùng bốn texture màu RGBA8, mỗi cái $1024 \\times 1024$, tất cả đều bật mipmap: \`map\`, \`emissiveMap\`, \`roughnessMap\`, \`normalMap\`. File nguồn trên đĩa của cả bốn cộng lại chỉ 1.8MB (đã nén JPG/PNG).

Tính tổng VRAM ước lượng (RGBA8, có mip chain ×4/3) của cả bốn texture sau khi upload lên GPU. So sánh con số đó với 1.8MB trên đĩa, rồi giải thích bằng đúng một câu vì sao hai con số lệch nhau xa đến vậy.`,
      en: `A material uses four RGBA8 color textures, each $1024 \\times 1024$, all with mipmaps enabled: \`map\`, \`emissiveMap\`, \`roughnessMap\`, \`normalMap\`. The four source files together total only 1.8MB on disk (JPG/PNG compressed).

Compute the estimated total VRAM (RGBA8, with the ×4/3 mip chain) for all four textures once uploaded to the GPU. Compare that number to the 1.8MB on disk, then explain in exactly one sentence why the two numbers diverge so much.`,
    },
    hints: [
      {
        vi: "Một texture $1024^2$ RGBA8 base level = $1024 \\times 1024 \\times 4$ byte. Nhân với 4/3 cho mip chain, rồi nhân 4 vì có bốn texture.",
        en: "One $1024^2$ RGBA8 base level = $1024 \\times 1024 \\times 4$ bytes. Multiply by 4/3 for the mip chain, then by 4 for the four textures.",
      },
      {
        vi: "Dung lượng file trên đĩa là dữ liệu NÉN; VRAM là dữ liệu đã GIẢI MÃ — hai đại lượng không có quan hệ tỉ lệ trực tiếp nào.",
        en: "The on-disk file size is COMPRESSED data; VRAM holds DECODED data — the two quantities have no direct proportional relationship.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng một texture: 1024×1024×4 × 4/3 ≈ 5.6MB",
        en: "Correctly computes one texture: 1024×1024×4 × 4/3 ≈ 5.6MB",
      },
      {
        vi: "Nhân đúng cho bốn texture: tổng ≈ 22.4MB",
        en: "Correctly multiplies for four textures: total ≈ 22.4MB",
      },
      {
        vi: "Giải thích được VRAM là dữ liệu giải mã còn dung lượng đĩa là dữ liệu nén — không liên quan trực tiếp",
        en: "Explains that VRAM holds decoded data while disk size is compressed data — the two aren't directly related",
      },
    ],
    solutionNote: {
      vi: `Một texture: 1024 × 1024 × 4 byte = 4,194,304 byte (base level). Có mip chain: 4,194,304 × 4/3 ≈ 5,592,405 byte ≈ 5.6MB. Bốn texture cùng cấu hình: 5.6MB × 4 ≈ 22.4MB VRAM.

So với 1.8MB trên đĩa: gấp hơn 12 lần. Lý do trong một câu: dung lượng đĩa là dữ liệu JPG/PNG đã NÉN, còn VRAM luôn lưu ảnh đã GIẢI MÃ hoàn toàn cộng mip chain — hai con số đo hai giai đoạn khác nhau của cùng một texture, không tỉ lệ thuận với nhau.`,
      en: `One texture: 1024 × 1024 × 4 bytes = 4,194,304 bytes (base level). With the mip chain: 4,194,304 × 4/3 ≈ 5,592,405 bytes ≈ 5.6MB. Four textures at the same size: 5.6MB × 4 ≈ 22.4MB VRAM.

Compared to the 1.8MB on disk: more than 12x larger. The reason in one sentence: the on-disk size is COMPRESSED JPG/PNG data, while VRAM always holds the fully DECODED image plus its mip chain — the two numbers measure two different stages of the same texture, with no direct proportional relationship.`,
    },
  },
  {
    id: "configure-tiling-road-texture",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`makeRoadTexture\` nhận một \`THREE.CanvasTexture\` đã vẽ sẵn một hoạ tiết vạch đường, cấu hình nó để: lặp lại 30 lần dọc theo hướng $v$ (mặt đường trải dài) nhưng chỉ 1 lần theo $u$ (bề ngang không lặp), dùng lọc mipmap đầy đủ, và bật anisotropy ở mức tối đa mà GPU hiện tại hỗ trợ (không hard-code số 16).`,
      en: `Write a \`makeRoadTexture\` function that takes an already-drawn \`THREE.CanvasTexture\` of a road-marking pattern and configures it to: repeat 30 times along $v$ (the road stretching into the distance) but only once along $u$ (no repeat across the width), use full mipmap filtering, and enable anisotropy at whatever maximum the current GPU actually supports (don't hard-code 16).`,
    },
    starterCode: `function makeRoadTexture(
  texture: THREE.CanvasTexture,
  renderer: THREE.WebGLRenderer,
): THREE.CanvasTexture {
  // TODO: wrapS = ClampToEdge (no horizontal repeat), wrapT = Repeat (vertical repeat)
  // TODO: texture.repeat.set(u, v) — 1 along u, 30 along v
  // TODO: minFilter/magFilter for full trilinear mipmap filtering
  // TODO: anisotropy = the max the GPU supports, read from renderer.capabilities
  // TODO: needsUpdate = true to apply every change above
  return texture;
}`,
    solutionCode: `function makeRoadTexture(
  texture: THREE.CanvasTexture,
  renderer: THREE.WebGLRenderer,
): THREE.CanvasTexture {
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 30);

  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;

  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  texture.needsUpdate = true;
  return texture;
}`,
    hints: [
      {
        vi: "Wrap mode có thể khác nhau cho từng trục — wrapS (u) và wrapT (v) không bắt buộc phải giống nhau.",
        en: "Wrap mode can differ per axis — wrapS (u) and wrapT (v) don't have to match.",
      },
      {
        vi: "Đừng hard-code 16 — dùng renderer.capabilities.getMaxAnisotropy() để lấy đúng giới hạn phần cứng máy đang chạy.",
        en: "Don't hard-code 16 — use renderer.capabilities.getMaxAnisotropy() to read the actual hardware limit of the running machine.",
      },
    ],
    checklist: [
      {
        vi: "wrapT = RepeatWrapping với repeat.y = 30, wrapS = ClampToEdgeWrapping với repeat.x = 1",
        en: "wrapT = RepeatWrapping with repeat.y = 30, wrapS = ClampToEdgeWrapping with repeat.x = 1",
      },
      {
        vi: "minFilter dùng LinearMipmapLinearFilter và generateMipmaps = true",
        en: "minFilter uses LinearMipmapLinearFilter and generateMipmaps = true",
      },
      {
        vi: "anisotropy đọc từ renderer.capabilities.getMaxAnisotropy(), không hard-code",
        en: "anisotropy is read from renderer.capabilities.getMaxAnisotropy(), not hard-coded",
      },
    ],
  },
];
