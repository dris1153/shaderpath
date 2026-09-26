import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "incomplete-texture-is-black",
    q: {
      vi: "Upload một ảnh vào texture mới, không gọi `generateMipmap`, không đổi filter nào. Texture hiện ra màu gì, và vì sao?",
      en: "You upload an image into a new texture, never call `generateMipmap` and change no filters. What color does the texture show, and why?",
    },
    a: {
      vi: "Đen tuyền. `TEXTURE_MIN_FILTER` mặc định là `NEAREST_MIPMAP_LINEAR`, một chế độ cần mipmap; texture chỉ có level 0 nên bị coi là incomplete. Gọi `generateMipmap`, hoặc đặt min filter về `LINEAR`.",
      en: "Solid black. The default `TEXTURE_MIN_FILTER` is `NEAREST_MIPMAP_LINEAR`, a mode that needs mipmaps; with only level 0 the texture counts as incomplete. Call `generateMipmap`, or set the min filter to `LINEAR`.",
    },
  },
  {
    id: "wrap-repeat-vs-clamp",
    q: {
      vi: "Trên một quad, $u$ chạy từ 0 tới 3 còn $v$ giữ từ 0 tới 1. Với `REPEAT` và với `CLAMP_TO_EDGE`, ảnh trông khác nhau thế nào?",
      en: "Across a quad, $u$ runs from 0 to 3 while $v$ stays 0 to 1. How does the image differ between `REPEAT` and `CLAMP_TO_EDGE`?",
    },
    a: {
      vi: "`REPEAT` lặp ảnh 3 lần theo chiều ngang. `CLAMP_TO_EDGE` chỉ hiện ảnh một lần trong đoạn $u$ từ 0 tới 1, còn hai phần ba bên phải là cột pixel ở mép ảnh bị kéo dài ra.",
      en: "`REPEAT` tiles the image 3 times horizontally. `CLAMP_TO_EDGE` shows the image once for $u$ from 0 to 1, and the right two thirds are the image's edge column stretched out.",
    },
  },
];
