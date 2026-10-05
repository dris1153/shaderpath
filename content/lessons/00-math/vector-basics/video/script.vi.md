---
slug: vector-basics
title: Vector cơ bản
---

## scene: hook
Hai Inko, một game, cùng một mức tốc độ. | Bạn này giữ phím D và đi sang phải. Bạn kia giữ W và D, đi chéo.
Cùng một mức tốc độ, vậy sao bạn đi chéo lại đi xa hơn tới [41%](bốn mươi mốt phần trăm)? | Câu trả lời nằm ở vector. Mình cùng tìm hiểu vector từng bước một nhé.

## scene: what
Vector là một độ dời: đi bao xa, và theo hướng nào. Trên giấy, ta vẽ nó thành mũi tên: độ dài là độ lớn, đầu mũi tên chỉ hướng.
Trượt mũi tên đi bất cứ đâu, nó vẫn là cùng một vector, vì điểm bắt đầu không phải là một phần của nó.
Trong code, vector chỉ là các con số, x và y. | Đặt đuôi ở gốc toạ độ, mũi tên chạm đúng điểm x, y.
Cùng con số nhưng khác nghĩa: điểm là một chỗ cố định, còn vector là một độ dời.
Một trường hợp đặc biệt: vector 0 có độ dài bằng 0, và chẳng có hướng nào. Hãy nhớ kỹ nó, nó sẽ quay lại.

## scene: add
Cộng vector là đi lần lượt từng vector. | Inko đi theo a, rồi đi tiếp b từ chỗ a kết thúc.
Đặt nối đuôi nhau như vậy, tổng là mũi tên thẳng từ điểm đầu tới điểm cuối.
Đi b trước rồi a, vẫn tới đúng chỗ đó. | Hai đường đi tạo thành hình bình hành, và tổng là đường chéo của nó.
Còn tính bằng số thì chỉ cần cộng từng thành phần lại với nhau. Ở đây a là vector [(3, 1)](ba, một). Còn b là vector [(−2, 4)](âm hai, bốn). Cộng lại được vector [(1, 5)](một, năm).

## scene: subtract
Phép trừ trả lời một câu hỏi trong game: kẻ địch phải đi hướng nào để tới người chơi?
Câu trả lời là lấy [player − enemy](player trừ enemy). | Đó là vector từ kẻ địch tới người chơi, đuôi ở kẻ địch, mũi chạm người chơi.
Đi theo hướng đó, slime áp sát dần.
Nhưng nếu đảo thứ tự thành [enemy − player](enemy trừ player), mũi tên quay ngược lại. | Slime quay lưng bỏ chạy.
Code vẫn chạy, nên lỗi này im lặng. Luôn lấy vị trí mục tiêu trừ đi vị trí của chính mình.

## scene: scale
Nhân với một con số là co giãn vector: mọi thành phần đều được nhân với số đó.
Nhân hai thì kéo dài trên cùng đường thẳng. Nhân một nửa thì co lại. Còn số âm thì lật hẳn [180°](một trăm tám mươi độ).
Lấy vector [(4, −2)](bốn, âm hai). Nhân nó với [−1.5](âm một phẩy năm), được vector [(−6, 3)](âm sáu, ba): | dài gấp rưỡi, và quay ngược chiều.
Cộng, trừ và co giãn: ba hàm nhỏ xíu này là nền của hầu hết chuyển động đơn giản trong game.

## scene: length
Vector dài bao nhiêu? x và y là hai cạnh góc vuông của một tam giác vuông, nên định lý Pythagoras cho ngay đáp án: | [|v| = √(x² + y²)](độ dài bằng căn của x bình cộng y bình).
Với [(3, 4)](ba, bốn), đó là căn của chín cộng mười sáu, căn hai mươi lăm: năm. Trong [3D](ba đê), thêm z bình vào trong căn.
Mẹo nhỏ: muốn so hai độ dài, hãy so bình phương độ dài. | Kết quả y hệt mà khỏi phải khai căn, vốn là phép tính đắt hơn phép nhân, cả trên CPU lẫn GPU.

## scene: normalize
Normalize là chia vector cho chính độ dài của nó. | Kết quả là một vector đơn vị: cùng hướng, dài đúng bằng một, đầu mũi tên nằm trên đường tròn bán kính một.
Quay lại cuộc đua. Giữ W là cộng vector [(0, 1)](không, một). Giữ D là cộng vector [(1, 0)](một, không). Cộng lại thành vector [(1, 1)](một, một), | và độ dài của nó là [√2](căn hai), khoảng [1.41](một phẩy bốn một). Đó chính là con số bốn mươi mốt phần trăm. Chỉ cần normalize trước khi nhân tốc độ, là hai bạn đi xa bằng nhau.
Một cái bẫy: slime đứng đúng chỗ Inko, và [player − enemy](player trừ enemy) là vector 0.
Hàm normalize tự viết sẽ chia 0 cho 0, ra [NaN](nan), nghĩa là không phải một số. | [NaN](nan) lan qua mọi bước, và slime biến mất luôn, mà không hề báo lỗi.
Vậy nên hãy luôn kiểm tra độ dài trước khi chia, kể cả với input lúc không nhấn phím nào.

## scene: roles
Cùng một bộ số x, y, z có thể đóng tới ba vai khác nhau. Vị trí là một chỗ, đo từ gốc toạ độ.
Hướng thì chỉ nói về phía nào, thường dài bằng một, và không có vị trí: | dời một cái hộp, pháp tuyến mặt trên của nó vẫn y nguyên.
Vận tốc là hướng và tốc độ gộp lại: dài gấp đôi là nhanh gấp đôi.
Và đây là cốt lõi của vòng lặp game đơn giản nhất: mỗi khung hình, [position += velocity * dt](position cộng bằng velocity nhân d t). | Chỉ là phép cộng và phép co giãn, mang tên mới mà thôi.

## scene: recap
Tóm lại: vector là một độ dời, một mũi tên hay một bộ số. Cộng thì nối đuôi nhau, trừ để chỉ từ chỗ này tới chỗ kia,
co giãn để kéo dài hay lật chiều, Pythagoras cho độ dài, và normalize để giữ hướng thuần tuý.
Coi chừng các cái bẫy: tốc độ đi chéo, thứ tự phép trừ, và vector 0.
Giờ hãy mở demo Cộng vector trong bài học này, và thử thu mũi tên tổng về gần như bằng không. Hẹn gặp lại!
