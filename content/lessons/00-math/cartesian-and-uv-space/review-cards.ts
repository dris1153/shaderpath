import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "uv-to-ndc-scale",
    q: {
      vi: "Chuyển toạ độ $u \\in [0, 1]$ sang NDC, một bạn viết $x_{ndc} = u - 0.5$. Hình vẽ ra sai thế nào, và công thức đúng là gì?",
      en: "Converting $u \\in [0, 1]$ to NDC, someone writes $x_{ndc} = u - 0.5$. How does the drawing go wrong, and what is the right formula?",
    },
    a: {
      vi: "Hình chỉ chiếm nửa giữa màn hình theo chiều ngang: $u - 0.5$ chỉ dời đoạn $[0, 1]$ về $[-0.5, 0.5]$, trong khi NDC rộng gấp đôi, từ $-1$ tới $1$. Phải giãn gấp đôi rồi mới dời: $x_{ndc} = 2u - 1$.",
      en: "It fills only the middle half of the screen horizontally: $u - 0.5$ only shifts $[0, 1]$ to $[-0.5, 0.5]$, while NDC is twice as wide, from $-1$ to $1$. Stretch by two, then shift: $x_{ndc} = 2u - 1$.",
    },
  },
  {
    id: "image-rows-vs-texture-v",
    q: {
      vi: "Upload thẳng một ảnh PNG vào texture WebGL, không bật cờ nào, rồi vẽ lên quad có UV chuẩn. Ảnh hiện ra thế nào, và vì sao?",
      en: "You upload a PNG straight into a WebGL texture with no flags set and draw it on a quad with standard UVs. How does it appear, and why?",
    },
    a: {
      vi: "Lộn ngược theo chiều dọc. Ảnh lưu hàng pixel đầu tiên ở trên cùng, còn texture WebGL coi $v = 0$ là đáy — nên hàng trên của ảnh rơi xuống dưới. Sửa bằng `UNPACK_FLIP_Y_WEBGL`; three.js làm việc này mặc định cho ảnh thường qua `texture.flipY`.",
      en: "Flipped vertically. An image stores its first pixel row at the top, but a WebGL texture treats $v = 0$ as the bottom — so the image's top row lands at the bottom. Fix it with `UNPACK_FLIP_Y_WEBGL`; three.js does it by default for ordinary images through `texture.flipY`.",
    },
  },
  {
    id: "blender-z-up",
    q: {
      vi: "Nhân vật đứng thẳng trong Blender (Z-up) được đưa vào three.js (Y-up) qua một đường không đổi trục nào. Nó nằm thế nào, và vì sao?",
      en: "A character standing upright in Blender (Z-up) is brought into three.js (Y-up) through a path that converts no axes. How does it lie, and why?",
    },
    a: {
      vi: "Nằm dọc theo trục $z$, đầu chỉ về phía người xem: trục “lên” của Blender là $z$, mà trong three.js $+z$ là hướng từ màn hình ra ngoài. File glTF xuất từ Blender thường không bị vậy, vì bộ export tự xoay −90° quanh trục $x$.",
      en: "Along the $z$ axis, head toward the viewer: Blender's “up” is $z$, and in three.js $+z$ points out of the screen. glTF files exported from Blender usually avoid this, because the exporter rotates by −90° about $x$.",
    },
  },
];
