import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "disposing-a-shared-geometry",
    q: {
      vi: "Hai mesh dùng chung một geometry. Khi mesh A unmount, bạn gọi `geometry.dispose()`. VRAM có được giải phóng không, và vì sao?",
      en: "Two meshes share one geometry. When mesh A unmounts, you call `geometry.dispose()`. Is the VRAM freed, and why?",
    },
    a: {
      vi: "Không như bạn tưởng: mesh B vẫn vẽ geometry đó, nên ở lần vẽ kế renderer lặng lẽ upload lại từ mảng CPU — lệnh dispose bị vô hiệu và tốn thêm một lần upload. Tài nguyên dùng chung thì để nơi tạo ra nó quản lý vòng đời (với geometry khai báo bằng JSX bên trong consumer, đặt `dispose={null}` để R3F không tự dispose).",
      en: "Not the way you think: mesh B still draws that geometry, so on the next draw the renderer quietly re-uploads it from the CPU arrays — the dispose is undone and costs an extra upload. Let whoever created a shared resource own its lifetime (for a geometry declared as a JSX child of a consumer, set `dispose={null}` so R3F leaves it alone).",
    },
  },
  {
    id: "lose-context-in-cleanup",
    q: {
      vi: "Cleanup của canvas gọi `gl.forceContextLoss()` để “dọn sạch”. Dưới Strict Mode, sau khi remount canvas trắng trơn. Vì sao?",
      en: "A canvas cleanup calls `gl.forceContextLoss()` to “clean up”. Under Strict Mode the canvas is blank after the remount. Why?",
    },
    a: {
      vi: "Strict Mode unmount rồi mount lại trên đúng canvas element đó, và một context đã mất không tự phục hồi. Hãy dispose từng geometry/material/texture tự tạo, và để việc giải phóng context cho lúc canvas thật sự rời khỏi DOM — R3F tự lo bước đó.",
      en: "Strict Mode unmounts and remounts onto the very same canvas element, and a lost context does not come back by itself. Dispose each geometry/material/texture you created, and leave releasing the context to the moment the canvas actually leaves the DOM — R3F handles that step itself.",
    },
  },
];
