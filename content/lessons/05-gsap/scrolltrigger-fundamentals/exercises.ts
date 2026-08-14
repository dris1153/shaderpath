import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "diagnose-scroller-mismatch",
    kind: "concept",
    prompt: {
      vi: `Bạn đặt một \`ScrollTrigger\` bên trong một demo card có div cuộn riêng (\`overflow-y: auto\`), nhưng quên truyền option \`scroller\` — config chỉ có \`trigger\`, \`start\`, \`end\`, \`scrub\`. Trang bên ngoài (nơi chứa demo card) vẫn cuộn bình thường bằng \`window\`. Không chạy code, hãy dự đoán: (a) mặc định ScrollTrigger lắng nghe sự kiện cuộn của \`window\` hay của div bên trong; (b) khi người dùng chỉ cuộn bên trong div đó mà không cuộn trang ngoài, animation có cập nhật đúng lúc không; (c) sửa bằng cách nào.

Giải thích ngắn gọn cơ chế đằng sau mỗi câu trả lời.`,
      en: `You place a \`ScrollTrigger\` inside a demo card that has its own scrolling div (\`overflow-y: auto\`), but forget to pass the \`scroller\` option — the config only has \`trigger\`, \`start\`, \`end\`, \`scrub\`. The outer page (holding the demo card) still scrolls normally via \`window\`. Without running the code, predict: (a) does ScrollTrigger default to listening to \`window\`'s scroll or the inner div's; (b) when the user only scrolls inside that div without scrolling the outer page, does the animation update correctly; (c) how do you fix it.

Briefly explain the mechanism behind each answer.`,
    },
    hints: [
      {
        vi: "ScrollTrigger mặc định dùng window làm scroller trừ khi bạn tự truyền option scroller trỏ tới phần tử cuộn thật.",
        en: "ScrollTrigger defaults to window as its scroller unless you explicitly pass a scroller option pointing at the real scrolling element.",
      },
      {
        vi: "start/end được tính từ getBoundingClientRect của trigger SO VỚI scroller đang cấu hình — sai scroller nghĩa là toàn bộ phép tính vị trí sai ngay từ khi tạo, không phải lỗi phát sinh lúc chạy.",
        en: "start/end are computed from the trigger's getBoundingClientRect RELATIVE TO whichever scroller is configured — the wrong scroller means the whole position calculation is wrong from creation time, not a bug that appears later at runtime.",
      },
    ],
    checklist: [
      {
        vi: "Tôi biết ScrollTrigger mặc định lắng nghe window, không tự suy ra div cuộn lồng bên trong",
        en: "I know ScrollTrigger defaults to listening to window, it never infers a nested scrolling div on its own",
      },
      {
        vi: "Tôi biết animation sẽ không cập nhật khi cuộn trong div nếu thiếu scroller, vì không có listener nào gắn đúng vào phần tử đó",
        en: "I know the animation won't update while scrolling inside the div if scroller is missing, since no listener is attached to that actual element",
      },
    ],
    solutionCode: `// (a) Mặc định, ScrollTrigger lắng nghe sự kiện cuộn của window — nó
//     KHÔNG tự dò tìm div overflow-y:auto lồng bên trong.
// (b) KHÔNG. Vì listener gắn vào window, cuộn bên trong div không sinh ra
//     sự kiện scroll nào trên window, nên progress/trigger-state không bao
//     giờ được tính lại — animation đứng yên cho tới khi trang ngoài
//     tình cờ cuộn.
// (c) Truyền scroller trỏ đúng vào phần tử cuộn thật:
ScrollTrigger.create({
  trigger,
  scroller: scrollerDiv, // phần tử có overflow-y: auto thật sự đang cuộn
  start: "top 80%",
  end: "bottom 20%",
  scrub: true,
});`,
  },
  {
    id: "fix-toggle-actions-length",
    kind: "code",
    prompt: {
      vi: `Đoạn code dưới cấu hình một tween fade-in cho một section, muốn hiện khi cuộn tới và ẩn lại khi cuộn qua — rồi lặp lại đối xứng khi cuộn ngược lên. \`toggleActions\` hiện chỉ có 2 từ khoá thay vì đúng 4, khiến 2 vị trí còn lại tự rơi về \`"none"\`. Sửa \`toggleActions\` cho đủ cả 4 sự kiện \`onEnter/onLeave/onEnterBack/onLeaveBack\` để hiệu ứng đối xứng cả hai chiều cuộn.`,
      en: `The code below configures a fade-in tween for a section that should appear on scroll-in and disappear on scroll-past — then repeat symmetrically when scrolling back up. \`toggleActions\` currently has only 2 keywords instead of exactly 4, so the remaining 2 positions silently fall back to \`"none"\`. Fix \`toggleActions\` to cover all 4 events \`onEnter/onLeave/onEnterBack/onLeaveBack\` so the effect is symmetric in both scroll directions.`,
    },
    starterCode: `gsap.to(box, {
  autoAlpha: 1,
  y: 0,
  duration: 0.5,
  ease: "power2.out",
  paused: true,
  scrollTrigger: {
    trigger: box,
    scroller: scrollerDiv,
    start: "top 80%",
    end: "bottom 20%",
    // BUG: chỉ 2 từ khoá — onEnterBack và onLeaveBack tự rơi về "none",
    // nên section không bao giờ ẩn lại khi cuộn ngược lên
    toggleActions: "play none",
  },
});`,
    solutionCode: `gsap.to(box, {
  autoAlpha: 1,
  y: 0,
  duration: 0.5,
  ease: "power2.out",
  paused: true,
  scrollTrigger: {
    trigger: box,
    scroller: scrollerDiv,
    start: "top 80%",
    end: "bottom 20%",
    // 4 từ khoá đúng thứ tự onEnter/onLeave/onEnterBack/onLeaveBack
    toggleActions: "play reverse play reverse",
  },
});`,
    hints: [
      {
        vi: "toggleActions luôn đúng 4 từ khoá theo thứ tự onEnter, onLeave, onEnterBack, onLeaveBack — thiếu từ khoá ở cuối tự rơi về none chứ không phải play.",
        en: "toggleActions is always exactly 4 keywords in order onEnter, onLeave, onEnterBack, onLeaveBack — missing trailing keywords silently fall back to none, not play.",
      },
      {
        vi: "reverse chạy tween ngược từ vị trí hiện tại, đúng bằng phép đảo của những gì play vừa làm — đặt play/reverse cho cặp enter/leave rồi lặp lại cho cặp back là cách tạo hiệu ứng đối xứng.",
        en: "reverse plays the tween backward from its current position, exactly undoing whatever play just did — pairing play/reverse on the enter/leave pair, then repeating on the back pair, is what makes the effect symmetric.",
      },
    ],
    checklist: [
      {
        vi: "toggleActions có đúng 4 từ khoá, đúng thứ tự onEnter/onLeave/onEnterBack/onLeaveBack",
        en: "toggleActions has exactly 4 keywords in the correct onEnter/onLeave/onEnterBack/onLeaveBack order",
      },
      {
        vi: "onLeave và onLeaveBack đều dùng reverse để section ẩn lại đối xứng ở cả hai chiều cuộn",
        en: "onLeave and onLeaveBack both use reverse so the section hides symmetrically in both scroll directions",
      },
      {
        vi: "Trạng thái ban đầu của box vẫn do paused: true kiểm soát, toggleActions chỉ play/reverse chứ không tự đặt lại state",
        en: "box's initial state is still controlled by paused: true — toggleActions only plays/reverses it, it never resets that state on its own",
      },
    ],
  },
];
