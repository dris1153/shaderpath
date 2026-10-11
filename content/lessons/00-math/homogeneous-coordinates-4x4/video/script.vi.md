---
slug: homogeneous-coordinates-4x4
title: Toạ độ đồng nhất
outro: true
---

## scene: hook
Lần trước, ma trận kéo giãn, xoay và shear được cả mặt phẳng. | Giờ thử việc đơn giản nhất trong mọi game: dời con slime này sang phải năm bước.
Ma trận đẩy mạnh, mà con slime vẫn không hề nhúc nhích. | Ma trận nào nhân với vector không cũng ra vector không, nên gốc toạ độ luôn đứng yên.
Nhưng dời mọi điểm thêm một vector t thì gốc phải tới t. | Nên không ma trận [3x3](ba nhân ba) nào dời được một vật 3D, đặt số vào đâu cũng vậy. Cách sửa chỉ là thêm một con số.

## scene: extra
Cho mỗi điểm thêm con số thứ tư, w, và đặt nó bằng một. | Vậy x, y, z thành x, y, z, một. Cách viết đó gọi là toạ độ đồng nhất.
Ma trận lớn lên thành [4x4](bốn nhân bốn). Xoay và scale nằm trong khối [3x3](ba nhân ba) ở góc trên bên trái. | Cột cuối cùng chứa phép dời, t. Hàng cuối là không, không, không, một.
Nhân giống hệt như bài trước: trộn các cột lại, với trọng số chính là các số của điểm. | Cột cuối có trọng số là w, nên khi w bằng một, t được cộng thẳng vào kết quả.
Giả sử t là vector [(5, −2, 0)](năm, âm hai, không). Lấy điểm [(1, 1, 1)](một, một, một). Sau phép nhân, nó tới [(6, −1, 1)](sáu, âm một, một).
Giờ thì dời, xoay và scale đều là cùng một việc: phép nhân ma trận.

## scene: lift
Vì sao thêm một con số lại được? Ta không vẽ được bốn chiều, | nên hãy xem cùng mẹo đó ở thấp hơn một chiều.
Một thế giới 2D có thêm số thứ ba, w, và nằm trên mặt phẳng ở độ cao một.
Ma trận [3x3](ba nhân ba) có t ở cột cuối sẽ shear không gian: | mặt phẳng ở độ cao một trượt đi một đoạn t, còn sàn ở độ cao không thì đứng yên hoàn toàn.
Vậy bên trong mặt phẳng, cả thế giới đã dời đi. Một ma trận bình thường đã tạo ra phép dời.

## scene: switch
Cái sàn đứng yên đó là món quà thứ hai của w. w bằng một đánh dấu một điểm, và nó bị dời. | w bằng không đánh dấu một hướng: phép dời bị nhân với không, nên biến mất.
Thử chính ma trận đó với vector [(1, 1, 1, 0)](một, một, một, không). Kết quả vẫn y nguyên, không đổi.
Con slime trượt đi khắp bản đồ, | nhưng vận tốc và hướng nhìn của nó vẫn giữ nguyên như cũ.
Quên số không ở vận tốc, là nó sẽ bị dời đi như một điểm. | Slime càng đi xa, nó càng chỉ sai hướng, mà chẳng có gì báo lỗi cả.

## scene: normals
Pháp tuyến cũng là hướng, nhưng còn một cái bẫy nữa. Kéo quả bóng rộng gấp đôi, | rồi biến đổi pháp tuyến bằng chính ma trận đó: chúng nghiêng theo chiều kéo, và không còn vuông góc với bề mặt. Thế là ánh sáng sẽ tính sai.
Với pháp tuyến, hãy dùng nghịch đảo chuyển vị của khối [3x3](ba nhân ba). | Nếu chỉ có xoay, hoặc scale đều mọi trục, bạn sẽ không bao giờ thấy lỗi này.

## scene: trs
Để dựng model matrix cho một vật thể, | hãy đặt phép xoay và scale vào góc đó, rồi nhân lại: [T * R * S](T nhân R nhân S).
Đọc từ phải sang trái: scale tại chỗ trước, xoay quanh tâm của chính nó, rồi mới dời nó ra thế giới.
Đổi thành [R * T](R nhân T), phép dời sẽ chạy trước. | Rồi phép xoay quay cả con slime quanh gốc thế giới: nó bay vòng tròn thay vì tự xoay tại chỗ.

## scene: divide
Còn một việc cuối nằm trong w. Dời, xoay và scale không bao giờ đổi nó: điểm luôn giữ số một, còn hướng luôn giữ số không.
Ma trận chiếu, mà ta sẽ học ở bài sau, ghi vào một w mới: chính là độ sâu của điểm phía trước camera. | Rồi GPU tự động chia x, y và z cho w.
Một điểm có x bằng hai và w bằng năm sẽ ở vị trí [0.4](không phẩy bốn). | Xa gấp đôi, w bằng mười, nó ở [0.2](không phẩy hai): cách tâm chỉ còn một nửa.
Vật ở xa trông nhỏ hơn, và đó chỉ là một phép chia.

## scene: recap
Tóm lại: ma trận luôn giữ nguyên gốc toạ độ, nên muốn dời thì phải thêm con số thứ tư, w. | Ma trận [4x4](bốn nhân bốn) giữ xoay và scale ở góc, và phép dời ở cột cuối.
w bằng một là điểm, và nó bị dời. w bằng không là hướng, và nó đứng yên. Pháp tuyến thì dùng nghịch đảo chuyển vị.
Dựng model theo [T * R * S](T nhân R nhân S), và phép chia cho w làm vật ở xa nhỏ lại. Bài sau: model, view và projection.
Giờ hãy mở demo trong bài học này, kéo phép dời hết cỡ, | và xem hai mũi tên màu xanh vẫn đứng yên.
