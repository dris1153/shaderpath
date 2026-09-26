import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "global-chunk-override-leaks",
    q: {
      vi: "Một demo ghi đè `THREE.ShaderChunk.fog_fragment` toàn cục rồi quên khôi phục. Bug gì xuất hiện, và vì sao khó tái hiện?",
      en: "A demo overrides `THREE.ShaderChunk.fog_fragment` globally and forgets to restore it. What bug appears, and why is it hard to reproduce?",
    },
    a: {
      vi: "Material biên dịch sau đó trên cùng trang — kể cả component không liên quan — có thể nhận chunk đã bị sửa, và program đã biên dịch với chunk sửa vẫn được dùng lại ngay cả sau khi khôi phục. Ai bị ảnh hưởng tuỳ thứ tự biên dịch, nên bug lúc có lúc không. Khôi phục trong cleanup, hoặc sửa theo từng material bằng `onBeforeCompile`.",
      en: "Materials compiled afterwards on the same page — unrelated components included — can pick up the modified chunk, and programs compiled with it keep being reused even after the restore. Who is affected depends on compile order, so the bug comes and goes. Restore it in the cleanup, or patch per material with `onBeforeCompile`.",
    },
  },
  {
    id: "chunk-names-are-versioned",
    q: {
      vi: "Một tutorial cũ bảo replace `#include <output_fragment>`, nhưng code của bạn chạy mà không có tác dụng gì. Vì sao, và kiểm tra ở đâu?",
      en: "An old tutorial says to replace `#include <output_fragment>`, but your code runs with no effect at all. Why, and where do you check?",
    },
    a: {
      vi: "Chunk đó không tồn tại trong `three@0.185.1` — chunk ghi màu cuối ở bản này tên là `opaque_fragment`. Chuỗi tìm không khớp thì `replace` lặng lẽ không làm gì. Đối chiếu tên chunk với thư mục `ShaderChunk/` trong `node_modules/three` đang cài.",
      en: "That chunk does not exist in `three@0.185.1` — the chunk writing the final color here is `opaque_fragment`. A search string that matches nothing makes `replace` silently do nothing. Check chunk names against the `ShaderChunk/` folder of the installed `node_modules/three`.",
    },
  },
];
