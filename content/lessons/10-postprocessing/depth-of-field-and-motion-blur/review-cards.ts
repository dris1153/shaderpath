import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "blending-frames-is-ghosting",
    q: {
      vi: "Một vật di chuyển nhiều pixel mỗi frame. Vì sao blend vài frame gần nhất lại cho ra ghosting chứ không phải motion blur?",
      en: "An object moves many pixels per frame. Why does blending the last few frames give ghosting rather than motion blur?",
    },
    a: {
      vi: "Mỗi frame là một ảnh sắc nét tại một thời điểm rời rạc; blend chúng cho ra vài bản sao rời nhau chồng lên nhau. Cảm biến thật tích luỹ ánh sáng LIÊN TỤC suốt lúc màn trập mở — muốn gần với điều đó thì tính vận tốc màn hình của từng pixel rồi lấy mẫu dọc theo vector đó.",
      en: "Each frame is a sharp snapshot at one discrete instant; blending them yields several distinct overlapping copies. A real sensor integrates light CONTINUOUSLY while the shutter is open — to approximate that, compute each pixel's screen-space velocity and gather samples along it.",
    },
  },
  {
    id: "bokeh-shape-from-samples",
    q: {
      vi: "Trong DOF hậu kỳ, điều gì quyết định highlight ngoài nét trông thành lục giác hay hình tròn?",
      en: "In post-process DOF, what decides whether out-of-focus highlights look hexagonal or round?",
    },
    a: {
      vi: "Mẫu lấy mẫu của bước gather, không phải mô phỏng quang học: xếp mẫu theo hình lục giác cho bokeh lục giác (như khẩu 6 lá), rải quanh vòng tròn cho bokeh tròn. `BokehShader` dùng 41 mẫu trên vài vòng tròn đồng tâm — xấp xỉ một đĩa mềm.",
      en: "The gather's sampling pattern, not simulated optics: samples laid out in a hexagon give hexagonal bokeh (like a 6-blade aperture), samples around a circle give round bokeh. `BokehShader` uses 41 samples on a few concentric rings — a soft disc approximation.",
    },
  },
  {
    id: "near-field-needs-hidden-pixels",
    q: {
      vi: "Một vật rất gần camera, bị nhoè mạnh, lẽ ra phải loang ra ngoài đường viền của nó, đè lên nền. Vì sao DOF một lớp như `BokehPass` không làm đúng được?",
      en: "An object very close to the camera, heavily blurred, should spread beyond its own silhouette over the background. Why can't single-layer DOF like `BokehPass` do this properly?",
    },
    a: {
      vi: "Ảnh nguồn chỉ có một lớp từ một camera: nó không hề chứa phần nền bị vật đó che. Thêm nữa, `BokehShader` chọn bán kính gather theo độ sâu của chính pixel đầu ra, nên pixel nền cạnh vật dùng bán kính nhỏ của nó và không bao giờ lấy được màu của vật — mép vật bị cắt cứng. Sửa đúng cần DOF nhiều lớp (tách tiền cảnh/hậu cảnh trước khi blur), đắt hơn.",
      en: "The source image is one layer from one camera: it never contains the background the object hides. On top of that, `BokehShader` sizes each gather by the output pixel's own depth, so a background pixel beside the object uses its own small radius and never picks up the object's color — the edge comes out hard-clipped. The real fix is layered DOF (split foreground from background before blurring), which costs more.",
    },
  },
];
