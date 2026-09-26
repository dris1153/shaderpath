import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "ssr-false-lives-in-a-client-file",
    q: {
      vi: "Trong App Router, muốn tắt SSR cho canvas bằng `next/dynamic(..., { ssr: false })`: gọi nó ở đâu, và vì sao không gọi thẳng trong page?",
      en: "In the App Router, to disable SSR for a canvas with `next/dynamic(..., { ssr: false })`: where do you call it, and why not directly in the page?",
    },
    a: {
      vi: "Trong một file `\"use client\"`. Page mặc định là Server Component, mà `ssr: false` không được hỗ trợ trong Server Component — Next báo lỗi. Tạo một Client Component bọc canvas rồi gọi `dynamic` bên trong nó; chữ và nội dung SEO vẫn ở Server Component để có ngay trong HTML đầu tiên.",
      en: "Inside a `\"use client\"` file. A page is a Server Component by default, and `ssr: false` isn't supported in Server Components — Next raises an error. Make a Client Component wrapping the canvas and call `dynamic` inside it; text and SEO content stay in a Server Component so they ship in the very first HTML.",
    },
  },
  {
    id: "mounted-gate-or-suppress-warning",
    q: {
      vi: "Nội dung khác nhau giữa server và client: khi nào dùng cờ `mounted` (bật trong `useEffect`), khi nào dùng `suppressHydrationWarning`?",
      en: "Content differs between server and client: when do you use a `mounted` flag (set in `useEffect`), and when `suppressHydrationWarning`?",
    },
    a: {
      vi: "Cờ `mounted` khi chờ được một frame: render đầu trên client khớp y hệt server, nội dung phụ thuộc client chỉ hiện sau khi effect chạy. `suppressHydrationWarning` chỉ bảo React chấp nhận DOM hiện có cho đúng một phần tử — hợp lý khi DOM đã được đặt đúng giá trị từ nguồn khác (script inline chạy trước khi React hydrate), không phải để che một mismatch chưa hiểu.",
      en: "The `mounted` flag when you can afford a frame: the client's first render matches the server exactly and client-dependent content only appears after the effect runs. `suppressHydrationWarning` just tells React to accept the existing DOM for one element — fair when the DOM already got the right value from another source (an inline script that runs before hydration), not to paper over a mismatch you don't understand.",
    },
  },
  {
    id: "reserve-canvas-space",
    q: {
      vi: "Vì sao chỗ của một canvas sắp mount phải được giữ trước, và nền tảng này làm việc đó thế nào?",
      en: "Why must the space for a canvas that's about to mount be reserved in advance, and how does this platform do it?",
    },
    a: {
      vi: "Không giữ chỗ thì nội dung phía dưới bị đẩy xuống lúc `<Canvas>` xuất hiện — layout shift ngay trước mắt người dùng. `components/viz/demo.tsx` bọc mỗi demo trong `<AspectRatio>` (kích thước cố định ngay từ HTML của server) với `<Suspense fallback={<Skeleton />}>` bên trong, nên khi canvas mount chiều cao không đổi.",
      en: "Without it, content below jumps down the moment `<Canvas>` appears — a layout shift right in front of the user. `components/viz/demo.tsx` wraps every demo in `<AspectRatio>` (a fixed size straight from the server HTML) with `<Suspense fallback={<Skeleton />}>` inside, so the height doesn't change when the canvas mounts.",
    },
  },
];
