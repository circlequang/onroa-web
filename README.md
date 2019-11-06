# onroa-web
1. Giới thiệu
Khám phá các địa điểm quanh bạn chỉ bằng một cái vuốt nhẹ trên điện thoại, hệ thống địa điểm phong phú có thể tìm kiếm dể dàng nhờ việc tích hợp các google maps. Nhờ đó Onroa cung cấp cho bạn một cái nhìn tổng quan về thế giới xung quanh bạn thông qua chiếc smartphone.

Bạn vừa đặt chân đến một địa phương không mấy quen thuộc và cần tìm các điểm du lịch quan đây, bạn chán quán cơm này và muốn tìm một quán khác gần đó, bạn cần biết các quán cafe ở một nơi nào đó để họp mặt bạn bè . . . Onroa là câu trả lời tốt nhất cho các vấn đề trên.

URL tham khảo: https://apkpure.com/vn/onroa-ba%CC%89n-%C4%91%C3%B4%CC%80-%C4%91i%CC%A3a-%C4%91i%C3%AA%CC%89m/onroa.mobile.onroaapp

Là một người thích khám phá, du lịch, la cà hàng quán thì Onroa cũng cấp tính năng Check-in và lưu lại các thông tin này vào Bản Đồ Cá Nhân của bạn. Bạn Có thể khoe thành tích của mình với người khác dựa trên các bản đồ cá nhân này.

2. Các chức năng chính:
- Tìm địa điểm xung quanh bạn hoặc trong một phạm vi nào đó dựa trên bản đồ.
- Cung cấp phong phú các địa điểm hấp dẫn như nhà hàng, quán ăn, quán cafe, bar-club, điểm du lịch, trung tâm mua sắm ...
- Xây dựng bản đồ cá nhân
- Check-in tại các địa điểm đã đi qua
- Dữ liệu cực lớn, độ phủ cao với khách các tỉnh thành của Việt Nam
- Tạo địa điểm mới hoặc bình luận - đánh giá về địa điểm này
- Tính năng tìm kiếm tiện lợi thông qua kết hợp giữa bản đồ và hệ thống dữ liệu của Onroa.

3. Cài đặt
- Mongodb 3.2 trở lên
- Vào git sau, lấy Database về và import vào DB: https://github.com/circlequang/onroa-database
- Phần dữ liệu lưu địa điểm là collection Points, mình chia làm 2 file. 1 file kích thức nhỏ chứa ít data. File còn lại chứa nhiều data hơn. có thể dùng triển khai thực tế.
- Hình ảnh để trong file image, rất lớn. Khi cấu hình nên để vào sub domain hoặc CDN để load cho nhanh. Hiện tại đang đặt trong sub-domain cdn2.onroa.com.
  Các bạn khi dùng nhớ chỉnh lại url của phần hình ảnh.
- Hệ thống hỗ trợ lấy Bình Luận về địa điểm đó trên Google, để dùng chức năng này bạn phải tạo Google API Key. Sau đó thay thế Key này vào file /assets/js/controller.js dòng số 633và 659
