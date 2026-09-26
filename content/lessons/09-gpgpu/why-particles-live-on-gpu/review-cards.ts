import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "readback-stalls-the-pipeline",
    q: {
      vi: "Particle đã chạy hoàn toàn trên GPU, nhưng gameplay cần biết particle #512 đang ở đâu nên mỗi frame bạn gọi `gl.readPixels`. Vì sao đó là ý tồi?",
      en: "Your particles now run entirely on the GPU, but gameplay needs to know where particle #512 is, so every frame you call `gl.readPixels`. Why is that a bad idea?",
    },
    a: {
      vi: "`readPixels` buộc CPU đứng chờ GPU làm xong mọi việc đang xếp hàng rồi mới trả dữ liệu — CPU và GPU bị đồng bộ cưỡng bức mỗi frame, kéo main thread quay lại đúng con đường mỗi frame mà việc dời particle lên GPU vừa giải phóng. State nên ở yên trên GPU; phần gameplay cần gì thì tính theo cách khác, hoặc đọc hiếm hơn.",
      en: "`readPixels` makes the CPU wait until the GPU has finished all queued work before it returns — a forced CPU–GPU sync every frame, putting the main thread back in the per-frame path the move to the GPU had just freed. Keep state on the GPU; get what gameplay needs some other way, or read far less often.",
    },
  },
  {
    id: "texture-as-array",
    q: {
      vi: "Một position texture 256×256 chứa bao nhiêu particle, và mỗi bước cập nhật thì thứ gì chạy một lần cho mỗi particle?",
      en: "How many particles does a 256×256 position texture hold, and what runs once per particle on each update step?",
    },
    a: {
      vi: "65.536 — mỗi texel là một particle, RGBA là $(x, y, z)$ cộng một giá trị dư. Fragment shader chạy một lần cho mỗi texel khi vẽ một hình phủ kín render target, song song như một `map` trên mảng: đọc state cũ, ghi state mới vào texture đích.",
      en: "65,536 — each texel is one particle, its RGBA holding $(x, y, z)$ plus a spare value. The fragment shader runs once per texel when a target-filling quad is drawn, in parallel like a `map` over an array: read the old state, write the new state into the destination texture.",
    },
  },
];
