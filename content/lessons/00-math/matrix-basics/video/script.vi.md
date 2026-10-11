---
slug: matrix-basics
title: Ma trận cơ bản
outro: true
---

## scene: hook
Inko đang làm game, và con slime này cần đổi hai chỗ. | Kéo nó rộng gấp đôi, rồi xoay một phần tư vòng.
Kéo giãn trước rồi mới xoay, slime đứng cao lên. Xoay trước rồi mới kéo giãn, nó lại nằm bè ra.
Cùng hai bước, mà ra hai con slime khác nhau. | Mỗi bước là một ma trận. Hôm nay mình sẽ mở một ma trận ra xem, và hiểu vì sao thứ tự lại quan trọng đến vậy.

## scene: machine
Ma trận là một cỗ máy biến đổi không gian. Đưa vào một vector, nó trả ra một vector khác.
Chỉ một quy tắc dời mọi điểm của mặt phẳng cùng lúc, | và quy tắc đó rất nghiêm: đường thẳng vẫn thẳng, đường song song vẫn song song, và gốc toạ độ không bao giờ xê dịch. | Đó chính là nghĩa của chữ tuyến tính.
Bẻ cong các đường, như ống kính mắt cá, là hết tuyến tính: không ma trận nào làm được. | Trượt cả mặt phẳng đi, gốc toạ độ sẽ dời chỗ: ma trận [2x2](hai nhân hai) cũng không làm được, phải đợi tới bài sau.

## scene: columns
Vì lưới vẫn cách đều, nên chỉ hai mũi tên quyết định tất cả. [î](i mũ) là vector [(1, 0)](một, không). Còn [ĵ](j mũ) là vector [(0, 1)](không, một).
Biết hai mũi tên này đi về đâu, là biết toàn bộ phép biến đổi.
Ma trận [2x2](hai nhân hai) lưu đúng điều đó, trong các cột của nó. | Cột thứ nhất là chỗ [î](i mũ) rơi vào. Cột thứ hai là chỗ [ĵ](j mũ) rơi vào.
Ở đây, cột thứ nhất là vector [(2, 0)](hai, không). Vậy [î](i mũ) dài gấp đôi theo trục x. | Cột thứ hai là vector [(0, 1)](không, một). Vậy [ĵ](j mũ) đứng yên.
Đó là phép kéo giãn ngang, đọc ra mà chẳng cần nhân gì cả. Đọc theo cột, đừng theo hàng: đây là chỗ hay nhầm nhất.

## scene: multiply
Vậy ma trận dời một vector bất kỳ thế nào? Mọi vector vốn đã là một tổ hợp của [î](i mũ) và [ĵ](j mũ). | Vector [(3, 4)](ba, bốn) chính là ba [î](i mũ) cộng bốn [ĵ](j mũ).
Ma trận giữ nguyên các trọng số đó, và thay vào những mũi tên mới. Cột thứ nhất là vector [(2, 0)](hai, không). Lấy ba lần. Cột thứ hai là vector [(0, 1)](không, một). Lấy bốn lần.
Cộng lại được vector [(6, 4)](sáu, bốn). | Nhân hàng với cột cũng ra đúng kết quả này, nhưng đọc theo cột thì bạn thấy được vì sao.

## scene: rotate
Giờ mình tự dựng một ma trận xoay từ đầu. Xoay mặt phẳng một góc [θ](theta), ngược chiều kim đồng hồ.
[î](i mũ) bắt đầu trên đường tròn bán kính một, ở góc không. | Xoay đi [θ](theta), nó tới vector [(cos θ, sin θ)](cô sin theta, sin theta). Đó là cột một.
[ĵ](j mũ) bắt đầu ở [90°](chín mươi độ), nên nó dừng ở [90° + θ](chín mươi độ cộng theta). | Tức là vector [(−sin θ, cos θ)](âm sin theta, cô sin theta). Đó là cột hai.
Thử lại với [90°](chín mươi độ). [î](i mũ) quay lên thành vector [(0, 1)](không, một). [ĵ](j mũ) quay sang trái thành vector [(−1, 0)](âm một, không).
Lỡ quên dấu trừ đó, hai trục sẽ đổi chỗ cho nhau. | Hình bị lật như soi gương, và không phép xoay nào làm được vậy.

## scene: scale-shear
Ma trận scale còn đơn giản hơn. Hệ số scale theo trục x nằm ở cột thứ nhất, hệ số theo trục y nằm ở cột thứ hai, | và mỗi trục tự co giãn riêng, không dính tới trục kia.
Shear thì khác hẳn. [î](i mũ) vẫn đứng yên, còn [ĵ](j mũ) trượt sang một bên, thành vector [(k, 1)](ca, một). | Hình vuông nghiêng hẳn đi, nhưng cạnh đáy không hề nhúc nhích.
Trông giống một phép xoay nhẹ, nhưng thật ra không phải. Phép xoay giữ mọi cạnh dài đúng như cũ. | Còn cạnh bị shear thì dài ra, thành [√(k² + 1)](căn của ca bình cộng một).

## scene: order
Quay lại với hai con slime. Một chuỗi ma trận chạy từ phải sang trái: | ma trận nằm sát vector chạy trước. Nên kéo giãn trước rồi mới xoay, phải viết là [R * S * v](R nhân S nhân v).
Đọc từ trái sang phải như đọc một câu văn, là bạn hiểu ngược thứ tự.
Để ý [î](i mũ) nhé. [R * S](R nhân S) kéo giãn nó trước, thành vector [(2, 0)](hai, không). Rồi xoay nó, thành vector [(0, 2)](không, hai).
[S * R](S nhân R) xoay nó trước, thành vector [(0, 1)](không, một). Sau đó phép kéo giãn theo trục x chẳng chạm được vào nó.
Cùng hai ma trận, hai kết quả khác nhau, mà không có lỗi nào cả. | Hình bị kéo sai trục? Hãy kiểm tra thứ tự trước tiên.

## scene: recap
Tóm lại: ma trận dời cả mặt phẳng, mà vẫn giữ đường thẳng thẳng và gốc toạ độ đứng yên.
Các cột của nó là chỗ [î](i mũ) và [ĵ](j mũ) rơi vào, và khi nhân với một vector, nó trộn các cột đó lại.
Xoay, scale hay shear chỉ là những cột khác nhau, | và trong một chuỗi, ma trận sát vector chạy trước.
Ma trận [3x3](ba nhân ba) và [4x4](bốn nhân bốn) cũng theo đúng những luật này. Bài sau, thêm một chiều nữa sẽ cho ma trận dời được cả vị trí.
Giờ hãy mở demo ma trận [2x2](hai nhân hai) trong bài học này, chỉ kéo thanh b thôi, | và xem mũi tên nào di chuyển.
