import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "gradient-noise-zero-at-lattice",
    q: {
      vi: "Bạn lấy mẫu gradient noise đúng tại một điểm lưới nguyên. Giá trị ra là bao nhiêu, và vì sao gradient ngẫu nhiên lưu ở đó không ảnh hưởng?",
      en: "You sample gradient noise exactly at an integer grid point. What value comes out, and why doesn't the random gradient stored there matter?",
    },
    a: {
      vi: "Đúng bằng 0. Tại đó, vector offset từ góc ấy tới điểm lấy mẫu là $(0, 0)$, và dot product với vector không luôn bằng 0 bất kể gradient là gì; ba góc còn lại có trọng số 0 tại điểm này. Value noise thì ngược lại, trả về đúng giá trị hash thô ở đó.",
      en: "Exactly 0. There, the offset from that corner to the sample point is $(0, 0)$, and a dot product with a zero vector is 0 whatever the gradient; the other three corners get zero weight at that point. Value noise, by contrast, returns the raw hash there.",
    },
  },
  {
    id: "shared-corners-make-shapes",
    q: {
      vi: "Thay `hash21(floor(uv * 8.0))` bằng value noise trên cùng lưới 8×8, các ô vuông tô phẳng biến thành những đốm mềm, dù cả hai đều hash trên cùng lưới. Độ mượt đến từ đâu?",
      en: "Replacing `hash21(floor(uv * 8.0))` with value noise on the same 8×8 grid turns flat-colored squares into soft blobs, though both hash the same grid. Where does the smoothness come from?",
    },
    a: {
      vi: "Pixel không còn nhận nguyên một giá trị hash của ô: nó trộn bốn giá trị hash ở góc theo vị trí của nó trong ô, và hai ô cạnh nhau dùng chung hai góc. Nên giá trị đổi liên tục trong ô và qua biên ô — tương quan giữa các điểm lân cận, được đưa trở lại có chủ đích.",
      en: "A pixel no longer takes its cell's single hash: it blends the four corner hashes by its position inside the cell, and neighboring cells share two corners. So the value changes continuously across a cell and across its border — correlation between neighbors, brought back on purpose.",
    },
  },
];
