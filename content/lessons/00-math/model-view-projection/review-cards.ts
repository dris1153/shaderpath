import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "view-rotation-transpose",
    q: {
      vi: "Camera quay 30° sang trái quanh trục $y$. Trong view space cả thế giới quay thế nào, và phần xoay của view matrix lấy từ ma trận xoay $R$ của camera bằng phép rẻ nhất nào?",
      en: "The camera turns 30° left about $y$. How does the whole world turn in view space, and what is the cheapest way to get the view matrix's rotation from the camera's rotation $R$?",
    },
    a: {
      vi: "Quay 30° sang phải — ngược chiều camera, vì view matrix là $C^{-1}$: camera coi mình đứng yên ở gốc. Và vì $R$ trực chuẩn nên $R^{-1} = R^\\top$ — chỉ cần chuyển vị, không phải tính nghịch đảo.",
      en: "30° to the right — opposite to the camera, because the view matrix is $C^{-1}$: the camera sees itself standing still at the origin. And since $R$ is orthonormal, $R^{-1} = R^\\top$ — a transpose, not a full inverse.",
    },
  },
  {
    id: "divide-makes-perspective",
    q: {
      vi: "Vật ở xa hiện nhỏ hơn. Trong chuỗi $P V M$ rồi tới NDC, bước nào thực sự làm việc đó, và nó làm thế nào?",
      en: "Far objects look smaller. In the chain $P V M$ and on to NDC, which step actually does that, and how?",
    },
    a: {
      vi: "Phép chia cho $w$. $P$ chép độ sâu phía trước camera, $-z_{view}$, vào $w$; GPU sau đó chia $x$, $y$ cho $w$. Vật càng xa thì $w$ càng lớn nên $x/w$, $y/w$ càng nhỏ. Bản thân ma trận chỉ tuyến tính, không tự co theo khoảng cách được.",
      en: "The divide by $w$. $P$ copies the depth in front of the camera, $-z_{view}$, into $w$; the GPU then divides $x$ and $y$ by $w$. The farther away, the larger $w$, so the smaller $x/w$ and $y/w$. A matrix alone is linear and cannot shrink things with distance.",
    },
  },
];
