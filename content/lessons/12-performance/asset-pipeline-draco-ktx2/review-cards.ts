import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "ktx2-transcodes-at-runtime",
    q: {
      vi: "Vì sao KTX2/Basis Universal chuyển mã (transcode) lúc chạy thay vì phát hành sẵn một định dạng nén GPU, và điều đó kéo theo lời gọi bắt buộc nào?",
      en: "Why does KTX2/Basis Universal transcode at runtime instead of shipping one GPU compressed format, and which mandatory call follows from that?",
    },
    a: {
      vi: "Không định dạng nén GPU nào chạy được mọi nơi: desktop dùng BC1/BC7, phần lớn GPU di động mới dùng ASTC, Android cũ dùng ETC2. Basis là định dạng trung gian được chuyển thẳng sang định dạng mà máy đó hỗ trợ. Vì vậy phải gọi `ktx2Loader.detectSupport(renderer)` trước khi load, để loader biết GPU nhận định dạng nào.",
      en: "No GPU compressed format runs everywhere: desktops use BC1/BC7, most modern mobile GPUs ASTC, older Android ETC2. Basis is an intermediate format converted directly into whatever the current device supports. That's why `ktx2Loader.detectSupport(renderer)` must run before loading — it tells the loader which format the GPU accepts.",
    },
  },
  {
    id: "uastc-for-normal-maps",
    q: {
      vi: "Normal map nên nén bằng ETC1S hay UASTC, vì sao?",
      en: "Should a normal map be compressed with ETC1S or UASTC, and why?",
    },
    a: {
      vi: "UASTC. ETC1S nén mạnh nhưng mất chi tiết tần số cao — ổn với base color, nhưng làm normal/roughness lổn nhổn thấy rõ. UASTC giữ chi tiết tốt hơn, đổi lại tỉ lệ nén thấp hơn — hợp với các map dữ liệu.",
      en: "UASTC. ETC1S compresses hard but loses high-frequency detail — fine for base color, visibly grainy on normal/roughness maps. UASTC keeps detail better at a lower compression ratio — the right fit for data maps.",
    },
  },
  {
    id: "draco-or-meshopt",
    q: {
      vi: "Chọn Draco hay meshopt để nén geometry — tiêu chí quyết định là gì?",
      en: "Draco or meshopt for geometry compression — what decides it?",
    },
    a: {
      vi: "Draco thường cho file nhỏ hơn nhưng giải nén chậm hơn, và phải tải thêm WASM decoder vài trăm KB. meshopt sắp xếp lại và lượng tử hoá dữ liệu cho gzip/brotli nén tốt, giải nén nhanh hơn rõ, kích thước gần tương đương. Ưu tiên Draco khi dung lượng tải một lần là nút cổ chai; ưu tiên meshopt khi app tải nhiều model liên tiếp và tổng thời gian decode quan trọng hơn.",
      en: "Draco usually yields smaller files but decodes slower, and needs an extra WASM decoder of a few hundred KB. meshopt reorders and quantizes data so gzip/brotli compress it well, decoding noticeably faster at near-comparable size. Favor Draco when one-time download size is the bottleneck; favor meshopt when an app loads many models back to back and cumulative decode time matters more.",
    },
  },
];
