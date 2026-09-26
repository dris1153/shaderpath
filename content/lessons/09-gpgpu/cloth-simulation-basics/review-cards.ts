import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "jacobi-needs-more-passes",
    q: {
      vi: "Vì sao vải GPU của bài này (solver Jacobi) cần nhiều vòng giải constraint hơn solver Gauss-Seidel trên CPU để cứng như nhau?",
      en: "Why does this lesson's GPU cloth (a Jacobi solver) need more constraint iterations than a CPU Gauss-Seidel solver to reach the same stiffness?",
    },
    a: {
      vi: "Trong một pass, mọi invocation đọc cùng một texture input không đổi — không cái nào thấy được hiệu chỉnh hàng xóm vừa tính. Mỗi pass chỉ lan hiệu chỉnh đi đúng một texel. Gauss-Seidel xử lý tuần tự nên mỗi constraint thấy ngay kết quả vừa sửa của constraint trước, hội tụ nhanh hơn.",
      en: "Within one pass every invocation reads the same unchanged input texture — none sees a neighbor's just-computed correction. Each pass spreads a correction by exactly one texel. Gauss-Seidel runs sequentially, so each constraint sees the one just corrected before it and converges faster.",
    },
  },
  {
    id: "bend-constraints-stop-creasing",
    q: {
      vi: "Vải có constraint structural + shear giữ đúng độ dài cạnh nhưng gập thành nếp sắc như giấy. Thiếu gì, và nó nối những điểm nào?",
      en: "Cloth with structural and shear constraints keeps its edge lengths but folds into sharp creases like paper. What is missing, and which points does it link?",
    },
    a: {
      vi: "Constraint bend: nối những điểm cách nhau HAI bước lưới (bỏ qua điểm ở giữa). Nó chống gập, để vải rủ mềm thay vì gấp khúc. Structural (4 hàng xóm trực tiếp) giữ độ dài, shear (4 đường chéo) chống xô lệch thành hình bình hành — không cái nào chống gập.",
      en: "Bend constraints: they link points TWO grid steps apart (skipping the one between). They resist folding, so the cloth drapes softly instead of creasing. Structural (4 direct neighbors) holds length and shear (4 diagonals) resists skewing — neither resists folding.",
    },
  },
  {
    id: "wind-along-the-normal",
    q: {
      vi: "Cộng một vector gió hằng vào gia tốc của mọi điểm vải chỉ khiến tấm vải nghiêng đi rồi treo im, như thể trọng lực bị nghiêng. Điều gì làm nó gợn sóng?",
      en: "Adding one constant wind vector to every cloth point's acceleration only makes the sheet lean over and hang still, as if gravity were tilted. What makes it ripple?",
    },
    a: {
      vi: "Chiếu gió lên pháp tuyến tại từng điểm, $\\hat n (\\hat n \\cdot \\vec w)$: lực phụ thuộc cách từng mảng vải hướng về phía gió, nên khác nhau dọc các nếp gấp. Thêm một tín hiệu gió giật đổi theo không gian và thời gian thì vải gợn liên tục thay vì đứng yên ở một tư thế nghiêng.",
      en: "Project the wind onto each point's normal, $\\hat n (\\hat n \\cdot \\vec w)$: the force depends on how each patch faces the wind, so it varies along the folds. Add a gust signal that varies over space and time, and the cloth keeps rippling instead of settling into one tilted pose.",
    },
  },
];
