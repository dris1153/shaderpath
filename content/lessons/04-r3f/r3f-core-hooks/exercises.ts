import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "delta-correct-rotation-speed",
    kind: "concept",
    prompt: {
      vi: `Một component gọi \`mesh.rotation.y += 2 * delta\` bên trong \`useFrame\`. Trên màn hình 60Hz, \`delta\` xấp xỉ $0.01667s$; trên màn hình 144Hz, \`delta\` xấp xỉ $0.00694s$.

Tính lượng góc quay được cộng thêm mỗi lần callback chạy ở hai loại màn hình đó. Sau đó nhân với số lần callback chạy mỗi giây (đúng bằng tần số màn hình) để suy ra tốc độ quay thực (rad/giây) ở mỗi màn hình, và giải thích: điều gì xảy ra nếu bỏ hẳn \`delta\` khỏi công thức, chỉ viết \`mesh.rotation.y += 2\`?`,
      en: `A component calls \`mesh.rotation.y += 2 * delta\` inside \`useFrame\`. On a 60Hz display, \`delta\` is roughly $0.01667s$; on a 144Hz display, \`delta\` is roughly $0.00694s$.

Compute how much rotation gets added per callback invocation on each display. Then multiply by the number of times the callback runs per second (exactly the display's refresh rate) to get the real rotation speed (rad/second) on each display, and explain: what happens if \`delta\` is dropped from the formula entirely, leaving just \`mesh.rotation.y += 2\`?`,
    },
    hints: [
      {
        vi: `Nhân trực tiếp: $2 \\times 0.01667$ và $2 \\times 0.00694$ cho ra hai con số khác nhau mỗi lần gọi — nhưng hãy nhân tiếp với số lần gọi mỗi giây (60 và 144) rồi so sánh kết quả cuối.`,
        en: `Multiply directly: $2 \\times 0.01667$ and $2 \\times 0.00694$ give two different per-call numbers — but multiply again by the calls-per-second count (60 and 144) and compare the final result.`,
      },
      {
        vi: `Bỏ \`delta\` nghĩa là cộng đúng 2 rad mỗi LẦN GỌI callback, không phải mỗi giây — số lần gọi mỗi giây bằng đúng framerate của máy, nên tốc độ quay tỉ lệ thuận với framerate.`,
        en: `Dropping \`delta\` means adding exactly 2 radians per CALL, not per second — the number of calls per second equals the machine's framerate, so rotation speed becomes directly proportional to framerate.`,
      },
    ],
    checklist: [
      {
        vi: `Tôi tính đúng góc cộng mỗi lần gọi: khoảng $0.0333$ rad ở 60Hz, khoảng $0.01389$ rad ở 144Hz`,
        en: `I computed the per-call rotation correctly: about $0.0333$ rad at 60Hz, about $0.01389$ rad at 144Hz`,
      },
      {
        vi: `Tôi nhân với framerate và thấy cả hai màn hình ra cùng $2$ rad/giây — đúng bằng hệ số tốc độ đã đặt trong công thức`,
        en: `I multiplied by the framerate and got the same $2$ rad/second on both displays — exactly the speed factor written in the formula`,
      },
      {
        vi: `Tôi giải thích được vì sao bỏ \`delta\` làm màn hình 144Hz quay nhanh gấp $144/60 = 2.4$ lần màn hình 60Hz`,
        en: `I can explain why dropping \`delta\` makes a 144Hz display spin $144/60 = 2.4$ times faster than a 60Hz display`,
      },
    ],
    solutionNote: {
      vi: `Ở màn hình 60Hz: $2 \\times 0.01667 \\approx 0.0333$ rad mỗi lần gọi, nhân với 60 lần gọi/giây ra đúng $2$ rad/giây. Ở màn hình 144Hz: $2 \\times 0.00694 \\approx 0.01389$ rad mỗi lần gọi, nhân với 144 lần gọi/giây cũng ra đúng $2$ rad/giây.

Tốc độ quay thực (rad/giây) giống hệt nhau ở cả hai màn hình, vì delta bù đúng phần chênh lệch framerate: delta nhỏ hơn ở màn hình nhanh hơn, nhưng callback lại chạy nhiều lần hơn đúng theo tỉ lệ nghịch.

Nếu bỏ delta, mỗi lần gọi cộng đúng 2 rad, mà số lần gọi mỗi giây bằng đúng framerate của máy — nên tốc độ quay (rad/giây) tỉ lệ thuận với framerate. Màn hình 144Hz khi đó sẽ quay nhanh gấp $144/60 = 2.4$ lần màn hình 60Hz, và animation không còn nhất quán giữa các máy.`,
      en: `On a 60Hz display: $2 \\times 0.01667 \\approx 0.0333$ rad per call, times 60 calls/second, gives exactly $2$ rad/second. On a 144Hz display: $2 \\times 0.00694 \\approx 0.01389$ rad per call, times 144 calls/second, also gives exactly $2$ rad/second.

The real rotation speed (rad/second) is identical on both displays, because delta exactly compensates for the framerate difference: delta is smaller on the faster display, but the callback runs proportionally more often.

If delta is dropped, each call adds exactly 2 radians, and the number of calls per second equals the machine's framerate — so rotation speed (rad/second) becomes directly proportional to framerate. A 144Hz display would then spin $144/60 = 2.4$ times faster than a 60Hz one, and the animation would no longer be consistent across machines.`,
    },
  },
  {
    id: "orbiting-light-ref-mutation",
    kind: "code",
    prompt: {
      vi: `Viết component \`OrbitingLight\` dùng \`useFrame\` để di chuyển một \`pointLight\` quay tròn quanh gốc toạ độ trên mặt phẳng XZ, bán kính \`radius\`, tốc độ góc \`speed\` (rad/giây). Bắt buộc dùng \`delta\` cho chuyển động và mutate ref trực tiếp — KHÔNG được gọi \`useState\`/\`setState\` nào bên trong \`useFrame\`.`,
      en: `Write an \`OrbitingLight\` component that uses \`useFrame\` to move a \`pointLight\` in a circle around the origin on the XZ plane, with radius \`radius\` and angular speed \`speed\` (rad/second). Motion must use \`delta\`, mutating a ref directly — NO \`useState\`/\`setState\` calls anywhere inside \`useFrame\`.`,
    },
    starterCode: `import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { PointLight } from "three";

function OrbitingLight({ radius, speed }: { radius: number; speed: number }) {
  const lightRef = useRef<PointLight>(null);
  const angleRef = useRef(0);

  useFrame((state, delta) => {
    // TODO 1: return early if lightRef.current isn't attached yet
    // TODO 2: accumulate angleRef.current by speed * delta
    // TODO 3: assign light.position.x/z = cos/sin(angle) * radius directly -- no setState
  });

  return <pointLight ref={lightRef} intensity={2} position={[radius, 2, 0]} />;
}`,
    solutionCode: `import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { PointLight } from "three";

function OrbitingLight({ radius, speed }: { radius: number; speed: number }) {
  const lightRef = useRef<PointLight>(null);
  const angleRef = useRef(0);

  useFrame((state, delta) => {
    const light = lightRef.current;
    if (!light) return; // component may not have mounted the mesh yet

    angleRef.current += speed * delta; // delta-correct: same rad/s at any framerate
    light.position.x = Math.cos(angleRef.current) * radius;
    light.position.z = Math.sin(angleRef.current) * radius;
  });

  return <pointLight ref={lightRef} intensity={2} position={[radius, 2, 0]} />;
}`,
    hints: [
      {
        vi: `Luôn guard \`ref.current\` đầu callback trước khi đọc/ghi property của nó — component có thể chưa mount hoặc đã unmount ngay giữa animation.`,
        en: `Always guard \`ref.current\` at the top of the callback before reading/writing its properties — the component may not be mounted yet, or may unmount mid-animation.`,
      },
      {
        vi: `\`angleRef\` phải là một \`useRef\`, không phải biến thường khai báo trong thân component — biến thường bị reset về giá trị ban đầu ở mỗi lần re-render.`,
        en: `\`angleRef\` must be a \`useRef\`, not a plain variable declared in the component body — a plain variable resets to its initial value on every re-render.`,
      },
    ],
    checklist: [
      {
        vi: `Không có \`useState\`/\`setState\` nào trong toàn bộ component`,
        en: `No \`useState\`/\`setState\` anywhere in the component`,
      },
      {
        vi: `Góc quay được cộng dồn bằng \`speed * delta\`, không phải một hằng số cố định mỗi frame`,
        en: `The angle accumulates using \`speed * delta\`, not a fixed constant added every frame`,
      },
      {
        vi: `\`lightRef.current\` được kiểm tra null trước khi đọc hoặc ghi property của nó`,
        en: `\`lightRef.current\` is null-checked before its properties are read or written`,
      },
    ],
  },
];
