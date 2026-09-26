import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "semi-lagrangian-trade",
    q: {
      vi: "Stable Fluids advect bằng cách truy ngược theo vận tốc rồi nội suy tại đó. Cách này mua được gì, và vì sao màu mực vẫn phai dần dù đã tắt dissipation (hệ số nhân bằng 1)?",
      en: "Stable Fluids advects by tracing backward along velocity and interpolating there. What does that buy, and why does the dye still fade with dissipation turned off (the multiplier at 1)?",
    },
    a: {
      vi: "Mỗi giá trị mới là phép nội suy — trung bình có trọng số — của các giá trị sẵn có, nên không gì vượt được giá trị lớn nhất hiện tại của trường: ổn định với MỌI $\\Delta t$, không nổ khi vượt điều kiện CFL như tích phân tiến. Cái giá là nội suy ở mỗi bước advect làm nhoè dần chi tiết (khuếch tán số học), nên trường vẫn phai: ổn định không có nghĩa là chính xác.",
      en: "Each new value is an interpolation — a weighted average — of existing values, so nothing can grow past the field's current maximum: stable for ANY $\\Delta t$, with no blow-up past the CFL limit the way forward integration has. The price is that interpolating at every advect step blurs detail away (numerical diffusion), so the field still fades: stable is not accurate.",
    },
  },
  {
    id: "why-web-fluids-are-grids",
    q: {
      vi: "Vì sao gần như mọi demo chất lỏng trên trình duyệt là Stable Fluids 2D trên lưới, không phải SPH?",
      en: "Why is almost every browser fluid demo 2D Stable Fluids on a grid, not SPH?",
    },
    a: {
      vi: "Trên lưới, hàng xóm của một ô chỉ là texel kế bên — đọc $O(1)$, không phải tìm hàng xóm. SPH phải tìm mọi cặp hạt trong bán kính, $O(N^2)$ nếu không có spatial hash. Và mọi bước của Stable Fluids (advect, splat, divergence, Jacobi, project) là một fragment pass toàn màn hình trên FBO — đúng nền ping-pong đã có.",
      en: "On a grid a cell's neighbors are just the adjacent texels — $O(1)$ reads, no neighbor search. SPH must find every particle pair within a radius, $O(N^2)$ without a spatial hash. And every Stable Fluids step (advect, splat, divergence, Jacobi, project) is a fullscreen fragment pass over FBOs — the ping-pong foundation already in place.",
    },
  },
  {
    id: "pbf-solves-positions",
    q: {
      vi: "Vì sao PBF vẫn ổn định ở những bước thời gian mà SPH dựa trên lực đã nổ tung?",
      en: "Why does PBF stay stable at timesteps where force-based SPH blows up?",
    },
    a: {
      vi: "SPH cần độ cứng $k$ cao để giữ chất lỏng đủ đặc, mà $k$ cao sinh ra lực cứng và dao động số. PBF viết mật độ thành một ràng buộc vị trí, $\\rho_i/\\rho_0 - 1 = 0$, rồi giải thẳng trên vị trí như constraint khoảng cách của vải — không tích phân lực cứng nào.",
      en: "SPH needs a high stiffness $k$ to keep the fluid dense enough, and a high $k$ means stiff forces and numerical oscillation. PBF writes density as a position constraint, $\\rho_i/\\rho_0 - 1 = 0$, and solves it directly on positions like the cloth's distance constraints — no stiff force to integrate.",
    },
  },
];
