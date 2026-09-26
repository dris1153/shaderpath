import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "ktx2-detect-support",
    q: {
      vi: "`KTX2Loader.load()` với một file `.ktx2` hoàn toàn hợp lệ vẫn lỗi. Thiếu bước nào, và vì sao cần nó?",
      en: "`KTX2Loader.load()` fails on a perfectly valid `.ktx2` file. Which step is missing, and why is it needed?",
    },
    a: {
      vi: "`ktx2Loader.detectSupport(renderer)` trước khi load. Loader phải biết GPU của thiết bị hỗ trợ định dạng nén nào để transcode dữ liệu Basis về đúng định dạng đích đó.",
      en: "`ktx2Loader.detectSupport(renderer)` before loading. The loader has to know which compressed formats the device's GPU supports, so it can transcode the Basis data into the right target format.",
    },
  },
  {
    id: "anisotropy-for-grazing-angles",
    q: {
      vi: "Sàn nhà nhìn xiên ở góc thấp vẫn nhoè dù đã có mipmap. Bật `texture.anisotropy` sửa bằng cách nào?",
      en: "A floor seen at a grazing angle is still blurry despite mipmaps. How does raising `texture.anisotropy` fix it?",
    },
    a: {
      vi: "Ở góc xiên, mỗi pixel phủ một vùng texel dài theo một chiều; mipmap chọn level theo chiều thu nhỏ nhiều nhất nên làm nhoè cả chiều còn lại. Anisotropy lấy thêm vài mẫu dọc theo chiều dài đó từ các mip level sẵn có — không tốn thêm VRAM, chỉ thêm vài lần đọc texture.",
      en: "At a grazing angle each pixel covers a region of texels stretched in one direction; mipmapping picks the level for the most-shrunk direction and so blurs the other one too. Anisotropy takes a few extra samples along the stretch from the existing mip levels — no extra VRAM, just a few more texture reads.",
    },
  },
];
