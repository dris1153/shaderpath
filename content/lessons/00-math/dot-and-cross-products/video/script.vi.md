---
slug: dot-and-cross-products
title: Dot, Cross & Normalize
outro: true
---

## scene: hook
Slime lính gác đang canh hành lang. Nó thấy mọi thứ trong vùng hình nón này. | Inko rón rén đi sau lưng nó, rồi bước ra trước mặt. Bị phát hiện!
Nhưng sao code của lính gác biết Inko ở phía trước, chứ không phải phía sau? | Chỉ một phép tính nhỏ: dot product. Rồi tới người bạn [3D](ba đê) của nó, cross product.

## scene: multiply-add
Dot product nhận vào hai vector và trả về một con số, không phải vector. Nhân từng cặp thành phần tương ứng, rồi cộng lại.
Cho a là vector [(3, 1)](ba, một). Còn b là vector [(2, 2)](hai, hai). Ba nhân hai là sáu, một nhân hai là hai, và sáu cộng hai là tám.
Trong [3D](ba đê), thêm một số hạng nữa: z nhân z. Ba phép nhân và hai phép cộng, hàm chỉ có vậy thôi. | Thứ tự cũng không quan trọng: [a·b](a dot b) bằng [b·a](b dot a).

## scene: angle
Vậy con số tám đó nghĩa là gì? Cùng con số ấy còn có công thức thứ hai: | [|a| |b| cos θ](độ dài a, nhân độ dài b, nhân cô sin theta), với theta là góc giữa hai vector.
Normalize cả hai trước, thì hai độ dài đều bằng một, | nên dot product chính là cô sin của góc.
Giờ xoay b quanh a. Cùng hướng thì dot dương. Ở chín mươi độ thì đúng bằng không: vuông góc. Quá chín mươi độ, nó thành âm.
Phía trước, bên cạnh hay phía sau: chỉ cần đọc dấu. Không cần tính góc, cũng chẳng cần hàm arccos.

## scene: vision
Quay lại với lính gác. Nó nhìn theo một hướng, gọi là f. Mũi tên tới Inko là [player − guard](player trừ guard), lấy thẳng từ bài hai.
Normalize cả hai, và dot của chúng là cô sin của góc giữa hướng lính gác nhìn và chỗ Inko đứng.
Vùng nhìn rộng sáu mươi độ, mỗi bên ba mươi độ. | Vậy Inko bị thấy khi dot lớn hơn [cos 30°](cô sin ba mươi độ), khoảng [0.87](không phẩy tám bảy).
Và đây là cái bẫy: bỏ qua normalize, thì Inko ở thật xa cho dot rất lớn, nên bị thấy dù đứng ngoài vùng nhìn, | còn Inko ở gần, ngay trước mặt, lại không tính. Normalize trước, để chỉ còn góc là quan trọng.

## scene: projection
Dot còn một ý nghĩa nữa. Từ đầu mũi tên a, thả một đường thẳng xuống hướng của b. | Điểm rơi cách gốc bao xa, đó là bóng của a: [a·b̂](a dot b mũ), với b đã normalize.
Trong game, lấy vận tốc của Inko dot với hướng về phía lính gác, là ra Inko đang áp sát nhanh cỡ nào. Âm nghĩa là đang đi xa dần.
Kéo b dài ra, cái bóng vẫn đứng yên: chỉ hướng của b là quan trọng.

## scene: cross
Giờ bước sang [3D](ba đê). Cross product nhận vào hai vector và trả về một vector, vuông góc với cả hai.
Nhưng có tới hai hướng cùng vuông góc với cả hai: lên và xuống. | Quy tắc bàn tay phải chọn ra một: cong các ngón tay phải từ a về phía b, thì ngón cái chỉ theo [a×b](a cross b).
Một phép thử kinh điển: x cross y ra z. Đảo thứ tự, kết quả lật ngược: | [b×a](b cross a) bằng trừ [a×b](a cross b). Khác với dot product, ở đây thứ tự là quan trọng.

## scene: normal
Đồ hoạ dùng nó ở đâu? Tam giác nào cũng cần một pháp tuyến: hướng mà mặt của nó quay về.
Lấy ba đỉnh A, B và C. Dựng hai cạnh từ A, [B − A](B trừ A) và [C − A](C trừ A). Cross hai cạnh đó, rồi normalize: đó là pháp tuyến.
Thêm nữa: độ dài của cross product là diện tích hình bình hành do hai cạnh tạo thành, | và tam giác là một nửa của nó. Hai cạnh song song thì ra không, và normalize vector không là cái bẫy [NaN](nan) ở bài hai.
Thứ tự đỉnh cũng quan trọng. Trong WebGL và three.js, các đỉnh đi ngược chiều kim đồng hồ, nhìn từ camera, tạo nên mặt trước. | Đổi chỗ hai đỉnh, pháp tuyến sẽ quay vào trong mesh.

## scene: light
Giờ cả hai phép nhân cùng làm việc. Đây là một quả bóng và một ngọn đèn. Tại mỗi điểm, lấy pháp tuyến N, và hướng về phía đèn L, cả hai đã normalize.
Độ sáng là [max(0, N·L)](max của không và N dot L). Quay thẳng về đèn: bằng một, sáng nhất. Nằm nghiêng ngang: bằng không. Quay đi chỗ khác, dot thành âm, | và max kẹp nó về không, vì ánh sáng không thể âm.
Cũng phép kiểm tra dấu ấy, nhưng so với camera thay vì đèn, | giúp GPU bỏ qua các tam giác quay lưng lại. Đó là backface culling.

## scene: recap
Tóm lại: dot product nhân rồi cộng, cho ra một con số. Dấu của nó cho biết phía trước, bên cạnh hay phía sau, | và với vector đơn vị, nó chính là cô sin của góc.
Cross product cho ra một vector vuông góc với cả hai, và thứ tự quyết định nó chỉ về phía nào.
Hai cạnh, cross, normalize: pháp tuyến của tam giác. Pháp tuyến dot hướng đèn: bề mặt được chiếu sáng.
Giờ hãy mở demo Dot product và phép chiếu trong bài này, kéo dài b, | rồi xem cái bóng đứng yên trong khi [a·b](a dot b) cứ tăng.
