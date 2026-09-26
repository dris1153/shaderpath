import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "gradient-velocity-clumps",
    q: {
      vi: "Các hạt trôi theo $\\nabla\\psi$ của một trường FBM trông ổn vài giây, rồi dồn về vài chỗ trong khi vùng khác trống trơn. Vì sao?",
      en: "Particles advected by $\\nabla\\psi$ of an FBM field look fine for a few seconds, then gather in a few spots while other areas empty out. Why?",
    },
    a: {
      vi: "Gradient luôn chỉ về phía cực đại cục bộ của $\\psi$ và xa khỏi cực tiểu, nên dòng chảy hội tụ về các cực đại và hạt dồn cục ở đó — trường bị nén. Xoay gradient 90° cho một trường tiếp tuyến với đường đồng mức của $\\psi$, không bao giờ hướng về một cực trị.",
      en: "The gradient always points toward local maxima of $\\psi$ and away from minima, so the flow converges on the maxima and particles pile up there — the field compresses. Rotating the gradient 90° gives a field tangent to the level curves of $\\psi$, which never heads toward an extremum.",
    },
  },
  {
    id: "obstacle-through-potential",
    q: {
      vi: "Để khói curl-noise 2D trượt quanh vật cản, bạn giảm vận tốc $F$ gần vật cản hay giảm trường tiềm năng $\\psi$? Vì sao?",
      en: "To make 2D curl-noise smoke slide around an obstacle, do you scale down the velocity $F$ near it or the potential $\\psi$? Why?",
    },
    a: {
      vi: "Giảm trường tiềm năng. Dòng chảy luôn tiếp tuyến với đường đồng mức của $\\psi$; ép $\\psi$ thành hằng số dọc biên vật cản thì biên trở thành một đường đồng mức, nên dòng chạy dọc theo nó thay vì xuyên qua — không cần kiểm tra va chạm.",
      en: "The potential. The flow is always tangent to the level curves of $\\psi$; force $\\psi$ to a constant along the obstacle's boundary and the boundary becomes a level curve, so the flow runs along it instead of through it — no collision check needed.",
    },
  },
];
