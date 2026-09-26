import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "weight-needs-play",
    q: {
      vi: "Crossfade bằng cách tăng `.weight` của action B từ 0 lên 1, nhưng object vẫn đi theo hoàn toàn action A. Thiếu gì?",
      en: "You crossfade by raising action B's `.weight` from 0 to 1, but the object still follows action A entirely. What is missing?",
    },
    a: {
      vi: "B chưa được `.play()`. Mixer chỉ trộn các action đang active; đổi `.weight` của một action chưa play không có tác dụng gì.",
      en: "B was never `.play()`-ed. The mixer only blends active actions; changing the `.weight` of an action that is not playing does nothing.",
    },
  },
  {
    id: "clamp-when-finished",
    q: {
      vi: "`action.setLoop(THREE.LoopOnce)` rồi `play()`. Khi clip chạy hết, object nhảy khỏi pose cuối. Nó nhảy về đâu, và cờ nào giữ pose cuối?",
      en: "After `action.setLoop(THREE.LoopOnce)` and `play()`, the object jumps away from the final pose when the clip ends. Where does it jump to, and which flag keeps the final pose?",
    },
    a: {
      vi: "Về pose gốc trước khi action chạy — không phải frame đầu của clip. Action kết thúc bị vô hiệu hoá (trọng số về 0), và mixer lấp phần trọng số thiếu bằng pose gốc đã lưu lúc action bắt đầu (khi không có action nào khác chạy trên cùng property). Đặt `action.clampWhenFinished = true` để nó dừng lại ở frame cuối.",
      en: "Back to the pose it had before the action ran — not the clip's first frame. A finished action is disabled (its weight drops to 0), and the mixer fills the missing weight with the original pose it saved when the action started (when no other action drives the same property). Set `action.clampWhenFinished = true` to hold the last frame.",
    },
  },
];
