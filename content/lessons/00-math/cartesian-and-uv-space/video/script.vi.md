---
slug: cartesian-and-uv-space
title: Hệ toạ độ Descartes và UV space
---

## scene: hook
Chào bạn, mình là Inko! Nhìn thật kỹ màn hình nào cũng thấy một lưới ô vuông nhỏ xíu: pixel.
Để tô màu, shader phải biết mỗi pixel nằm ở đâu. Nên pixel nào cũng cần một địa chỉ.
Hôm nay ta làm quen ba cách đồ hoạ ghi địa chỉ đó: | toạ độ pixel, [UV](U V), và [NDC](N D C).

## scene: axes
Bắt đầu với một đường số: một trục, một con số.
Thêm trục thứ hai vuông góc, chọn gốc toạ độ ở chỗ hai trục cắt nhau, và mỗi điểm thành một cặp số x và y. | Đi x bước sang ngang, rồi y bước lên trên.
Thêm trục thứ ba, z, vuông góc với cả hai, là ta có [3D](ba đê).
Không gì bắt các trục phải vuông góc và chia đều, | nhưng mọi công cụ đồ hoạ đều ngầm giả định như vậy.

## scene: conventions
Trục nào hướng lên? Trong [three.js](Three J S) và định dạng [glTF](G L T F), trục y hướng lên.
Blender thì dùng z hướng lên. | Đưa một nhân vật từ Blender sang [three.js](Three J S) mà không chuyển đổi, nó sẽ nằm dọc theo trục z, đầu hướng về phía bạn.
Câu hỏi thứ hai là hệ thuận tay nào. Với hệ thuận tay phải, cuộn các ngón của bàn tay phải từ x sang y, ngón cái sẽ chỉ theo trục z.
[Three.js](Three J S) thuận tay phải; DirectX và Unity theo truyền thống thuận tay trái. | Nhầm hai hệ, mô hình sẽ bị soi gương, thậm chí lộn mặt.
Ngay cả màn hình phẳng cũng khác nhau: toán học cho y hướng lên, | còn canvas [2D](hai đê) bắt đầu từ góc trên bên trái và đếm y đi xuống.

## scene: uv
Giờ tới texture. Một texture có thể rộng mười sáu pixel, hoặc hơn tám nghìn. Không gian [UV](U V) bỏ qua chuyện đó.
Một góc là [(0, 0)](không, không), góc đối diện là [(1, 1)](một, một), dù ảnh lớn cỡ nào. | u chạy theo chiều ngang, v chạy lên hoặc xuống.
Vì vậy shader lấy mẫu bằng [UV](U V) mà không cần biết số pixel. | Thay texture lớn hơn, không một dòng code shader nào phải đổi.
Có một điểm cần nhớ: ảnh đặt v bằng không ở trên cùng, còn texture WebGL cổ điển đặt nó ở dưới cùng. | Chỉ v khác nhau, nên texture bị lật sai sẽ lộn theo chiều dọc, chứ không bao giờ lật trái phải.

## scene: pixel-to-uv
Vậy pixel tìm [UV](U V) của mình thế nào? Lấy một màn hình tí hon, rộng bốn pixel, cao hai pixel.
Pixel không phải một điểm, mà là một ô vuông nhỏ, và chỉ số của nó đánh dấu cạnh ô, không phải tâm.
Tâm nằm lệch vào trong nửa pixel. Vậy: cộng thêm một nửa, rồi chia cho chiều rộng.
[u = (x + 0.5) / W](u bằng x cộng một nửa, chia cho W). | v cũng vậy, nhưng chia cho chiều cao.
Inko có tám xúc tu, nên mỗi xúc tu nhận một pixel, và tất cả cùng chạy một công thức nhỏ cùng lúc.
Đó chính là cách GPU làm việc: một chương trình nhỏ, chạy cho mọi pixel, song song.
Trong shader, [gl_FragCoord](G L Frag Coord) đã nằm sẵn ở tâm pixel và bắt đầu từ góc dưới bên trái, | nên ở đó bạn chỉ cần chia cho độ phân giải.

## scene: ndc
[UV](U V) chạy từ [0](không) đến [1](một). Rất hợp cho texture, nhưng với hướng thì ta muốn một khoảng lấy số không làm tâm: | [−1](âm một) đến [1](một). WebGL gọi nó là [NDC](N D C), toạ độ thiết bị chuẩn hoá.
Giờ chỉ riêng dấu cũng cho biết bên trái hay bên phải.
Để đổi sang, giãn gấp đôi rồi dời đi một: [x = 2u − 1](x bằng hai u trừ một).
Chỉ trừ đi một nửa là chưa đủ. Hình vẽ sẽ chỉ phủ nửa giữa màn hình.
Còn [y = 1 − 2v](y bằng một trừ hai v), vì trong ảnh v tăng dần xuống dưới, còn [NDC](N D C) tăng dần lên trên.

## scene: recap
Tóm lại: toạ độ pixel đếm ô vuông từ góc trên bên trái. | [UV](U V) nén mọi kích thước về khoảng [0](không) đến [1](một), đo tại tâm pixel. | [NDC](N D C) giãn khoảng đó thành [−1](âm một) đến [1](một), lấy giữa màn hình làm tâm.
Cẩn thận hai lỗi kinh điển: quên nửa pixel, và quên lật y.
Giờ hãy mở demo [Khám phá UV space](Khám phá U V space) trong bài học này, và xem góc nào chuyển sang màu vàng. Hẹn gặp lại bạn ở bài sau!
