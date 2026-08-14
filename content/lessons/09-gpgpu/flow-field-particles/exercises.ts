import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "respawn-rate-and-staggering",
    kind: "concept",
    prompt: {
      vi: `Hệ có $N = 65536$ particle (texture $256\\times256$), mỗi particle có tuổi thọ cố định $T = 4.5$ giây trước khi tái sinh. Giả sử tuổi tái sinh phân bố đều theo thời gian (đúng như demo làm bằng cách gieo tuổi ban đầu ngẫu nhiên trong $[0, T)$).

(a) Tính tốc độ tái sinh trung bình (số particle/giây) của toàn hệ.

(b) Nếu KHÔNG so le tuổi ban đầu — mọi particle bắt đầu ở tuổi 0 — mô tả chính xác điều gì xảy ra ở các thời điểm $t = T,\\ 2T,\\ 3T,\\ \\dots$, và vì sao đó là một lỗi có thể NHÌN THẤY chứ không chỉ là chi tiết lý thuyết.`,
      en: `The system has $N = 65536$ particles (a $256\\times256$ texture), each with a fixed lifetime $T = 4.5$ seconds before respawning. Assume respawn moments are spread evenly over time (exactly what the demo achieves by seeding each particle's starting age randomly in $[0, T)$).

(a) Compute the system's average respawn rate (particles/second).

(b) If starting ages were NOT staggered — every particle began at age 0 — describe precisely what happens at $t = T,\\ 2T,\\ 3T,\\ \\dots$, and why that's a VISIBLE bug, not just a theoretical detail.`,
    },
    hints: [
      {
        vi: "Nếu tái sinh trải đều, mỗi particle đóng góp trung bình $1/T$ lần tái sinh mỗi giây — nhân với $N$ để ra tốc độ toàn hệ.",
        en: "If respawns are evenly spread, each particle contributes an average of $1/T$ respawns per second — multiply by $N$ for the whole system's rate.",
      },
      {
        vi: "Không so le nghĩa là hàm 'tuổi' của mọi particle là CÙNG một hàm của thời gian (age(t) = t mod T cho tất cả) — chúng chạm ngưỡng lifetime ở đúng cùng một khung hình.",
        en: "No staggering means every particle's 'age' is the SAME function of time (age(t) = t mod T for all of them) — they all cross the lifetime threshold on the exact same frame.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng tốc độ tái sinh trung bình $N/T \\approx 14{,}564$ particle/giây",
        en: "Correctly computed the average respawn rate $N/T \\approx 14{,}564$ particles/second",
      },
      {
        vi: "Giải thích được: không so le khiến cả 65.536 particle tái sinh ở ĐÚNG cùng một frame mỗi $T$ giây, thay vì trải đều theo thời gian",
        en: "Explained that without staggering, all 65,536 particles respawn on the EXACT same frame every $T$ seconds, instead of spreading out over time",
      },
      {
        vi: "Nhận ra đây là lỗi thấy được bằng mắt (một cú 'nháy' toàn màn hình định kỳ), không chỉ là một chi tiết cài đặt vô hại",
        en: "Recognized this as a visibly noticeable bug (a periodic whole-screen 'blink'), not a harmless implementation detail",
      },
    ],
    solutionCode: `// (a) Average respawn rate:
// each particle respawns once every T seconds on average
// -> rate per particle = 1 / T
// -> system rate = N / T = 65536 / 4.5 ~= 14,563.6 particles/second
//
// (b) Without staggering, age(t) = t mod T is IDENTICAL for every particle
// (they all started at age 0 at the same t=0). So the condition
// "age > uLifetime" becomes true for ALL 65536 texels on the exact same
// frame, at t = T, 2T, 3T, ... Every particle jumps to a new random
// position simultaneously -> the entire cloud visibly "blinks" or
// "resets" once every T seconds, a hard-to-miss artifact, instead of the
// smooth, continuous trickle of respawns the staggered version produces.`,
  },
  {
    id: "build-reference-attribute",
    kind: "code",
    prompt: {
      vi: `Viết một hàm TypeScript \`buildReferenceAttribute(size: number): THREE.BufferAttribute\` tạo attribute "state-uv" cho \`size * size\` particle: phần tử thứ $i$ (hàng $y = \\lfloor i / size \\rfloor$, cột $x = i \\bmod size$) phải trỏ đúng vào TÂM texel $(x, y)$ của texture trạng thái \`size×size\`, dùng công thức pixel→UV đã học ở Track 0 ($u=(x+0.5)/size$). itemSize phải là 2 (một cặp $u,v$ cho mỗi particle).`,
      en: `Write a TypeScript function \`buildReferenceAttribute(size: number): THREE.BufferAttribute\` that builds the "state-uv" attribute for \`size * size\` particles: element $i$ (row $y = \\lfloor i / size \\rfloor$, column $x = i \\bmod size$) must point at the exact CENTER of state texel $(x, y)$ in the \`size×size\` state texture, using the pixel→UV formula from Track 0 ($u=(x+0.5)/size$). itemSize must be 2 (one $u,v$ pair per particle).`,
    },
    starterCode: `import * as THREE from "three";

function buildReferenceAttribute(size: number): THREE.BufferAttribute {
  // TODO 1: allocate a Float32Array of the right length — 2 floats
  // (u, v) per particle, size * size particles total.
  const data = new Float32Array(0);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      // TODO 2: fill data[i * 2] and data[i * 2 + 1] with the pixel-center
      // UV of texel (x, y) — (x + 0.5) / size, (y + 0.5) / size.
    }
  }

  // TODO 3: wrap data in a BufferAttribute with itemSize 2
  return new THREE.BufferAttribute(new Float32Array(0), 2);
}`,
    solutionCode: `import * as THREE from "three";

function buildReferenceAttribute(size: number): THREE.BufferAttribute {
  const data = new Float32Array(size * size * 2);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      data[i * 2 + 0] = (x + 0.5) / size;
      data[i * 2 + 1] = (y + 0.5) / size;
    }
  }

  return new THREE.BufferAttribute(data, 2);
}`,
    hints: [
      {
        vi: "Độ dài mảng phải là `size * size * 2`, không phải `size * size` — mỗi particle cần HAI số thực ($u$ và $v$), giống hệt lý do `position` cần itemSize 3 chứ không phải 1.",
        en: "The array length must be `size * size * 2`, not `size * size` — each particle needs TWO floats ($u$ and $v$), the same reason `position` needs itemSize 3, not 1.",
      },
      {
        vi: "Đây chính là công thức pixel→UV của bài Cartesian & UV Space (Track 0): cộng 0.5 trước khi chia để trỏ đúng TÂM texel, không phải mép texel.",
        en: "This is exactly the pixel→UV formula from the Cartesian & UV Space lesson (Track 0): add 0.5 before dividing to land on the texel's CENTER, not its edge.",
      },
    ],
    checklist: [
      {
        vi: "Mảng dữ liệu có đúng `size * size * 2` phần tử",
        en: "The data array has exactly `size * size * 2` elements",
      },
      {
        vi: "Mỗi cặp $(u,v)$ dùng công thức $(x+0.5)/size$, $(y+0.5)/size$ — không bỏ số hạng 0.5",
        en: "Each $(u,v)$ pair uses $(x+0.5)/size$, $(y+0.5)/size$ — the 0.5 term is never dropped",
      },
      {
        vi: "BufferAttribute trả về có itemSize 2",
        en: "The returned BufferAttribute has itemSize 2",
      },
    ],
  },
];
