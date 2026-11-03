# Tìm hiểu bài toán – Website công thức nấu ăn James Thew (eProject)

Tài liệu tóm tắt và phân tích yêu cầu từ file SRS của Aptech eProject.

## 1. Tổng quan bài toán

**Bối cảnh:** James Thew là đầu bếp nổi tiếng của một khách sạn 5 sao. Ông được nhà xuất bản mời viết sách công thức, được các nhà sản xuất mời tham gia show nấu ăn, và dạy các lớp nấu ăn cuối tuần với học phí thấp để thu hút đông người học.

**Nhu cầu:** Ông muốn có website riêng để đăng công thức nấu ăn và mẹo (tips), tiếp cận người dùng trên toàn thế giới, nhận phản hồi, và tổ chức các cuộc thi để tương tác với cộng đồng.

**Bản chất hệ thống:** Website chia sẻ công thức nấu ăn theo mô hình **thành viên trả phí (membership)**, có thêm **nội dung miễn phí**, **cuộc thi (contest)** và **phản hồi (feedback)**.

**Mục tiêu của eProject (theo SRS):** không dạy công cụ, mà cho sinh viên một tình huống thực tế để tự xây dựng ứng dụng hoàn chỉnh, nộp kèm tài liệu và mã nguồn đúng hạn.

## 2. Các đối tượng sử dụng (Actors)

| Vai trò | Mô tả | Điều kiện |
| --- | --- | --- |
| Khách (General user) | Người chưa đăng ký | Không cần đăng nhập |
| Thành viên (Member / User) | Người đã đăng ký và trả phí | Đăng nhập |
| Quản trị viên (Admin / James) | Chủ website | Đăng nhập tài khoản admin |

## 3. Yêu cầu chức năng theo vai trò

### 3.1. Khách (chưa đăng ký)

- Xem trang chủ (giới thiệu về James Thew, thông tin khách hàng).
- Đăng ký thành viên ở trang Login/Register.
- Xem và tìm kiếm **chỉ** các công thức và mẹo được đánh dấu *miễn phí*.
- Xem cuộc thi và tham gia bằng cách gửi mẹo hoặc công thức (kèm nguyên liệu và cách làm).
- Xem thông báo (người thắng cuộc thi).
- Gửi feedback cho công thức.
- Xem FAQ.

### 3.2. Thành viên (đã đăng nhập)

- Trang chủ và hồ sơ cá nhân (xem và sửa ngay trên trang).
- Truy cập **toàn bộ** công thức trên site; xem và tìm kiếm công thức, mẹo.
- Xem thông báo của chủ site.
- Gửi feedback cho công thức.
- Xem và tham gia cuộc thi.
- Gửi mẹo; gửi công thức kèm danh sách nguyên liệu và cách nấu.
- Xem các công thức và mẹo do mọi khách hàng gửi.
- Xem, sửa, xóa các công thức và mẹo do chính mình gửi.
- Xem FAQ.

### 3.3. Quản trị viên (James)

- Trang chủ và hồ sơ cá nhân (có thể sửa).
- Truy cập, xem và tìm kiếm toàn bộ công thức và mẹo.
- Xem toàn bộ feedback nhận được cho công thức.
- Tạo hoặc xóa cuộc thi.
- Xem các bài tham gia (công thức hoặc mẹo) của từng cuộc thi.
- Công bố người thắng cuộc ở trang Announcements.
- Đăng mẹo; đăng công thức kèm nguyên liệu và quy trình nấu.
- Đánh dấu mỗi công thức hoặc mẹo của mình là **miễn phí** hoặc **chỉ dành cho thành viên**.
- Xem, sửa, xóa các công thức và mẹo mình đã đăng.
- Xem FAQ.

## 4. Ma trận phân quyền

| Chức năng | Khách | Thành viên | Admin |
| --- | :-: | :-: | :-: |
| Xem trang chủ | ✔ | ✔ | ✔ |
| Đăng ký / đăng nhập | ✔ | ✔ | ✔ |
| Xem công thức và mẹo miễn phí | ✔ | ✔ | ✔ |
| Xem công thức và mẹo dành cho thành viên | ✘ | ✔ | ✔ |
| Tìm kiếm công thức và mẹo | Chỉ nội dung free | ✔ | ✔ |
| Gửi feedback cho công thức | ✔ | ✔ | Xem feedback |
| Tham gia cuộc thi | ✔ | ✔ | ✘ |
| Tạo / xóa cuộc thi | ✘ | ✘ | ✔ |
| Xem bài dự thi | ✘ | ✘ | ✔ |
| Công bố người thắng | ✘ | ✘ | ✔ |
| Xem thông báo | ✔ | ✔ | ✔ |
| Gửi / sửa / xóa công thức và mẹo của mình | ✘ | ✔ | ✔ |
| Đánh dấu free / member-only | ✘ | ✘ | ✔ |
| Hồ sơ cá nhân (xem, sửa) | ✘ | ✔ | ✔ |
| Xem FAQ | ✔ | ✔ | ✔ |

## 5. Quy tắc nghiệp vụ chính

1. **Đăng ký thành viên phải thanh toán**: gói tháng 10 USD, gói năm 100 USD.
2. Nội dung có hai mức truy cập: **Free** (ai cũng xem được, không cần đăng ký) và **Member-only**.
3. Chỉ admin quyết định nội dung do mình đăng là free hay member-only.
4. Cuộc thi do admin tạo; người dùng gửi **công thức** hoặc **mẹo** theo yêu cầu cuộc thi; admin xem xét và chọn bài tốt nhất để trao giải, sau đó công bố ở Announcements.
5. Một công thức bắt buộc gồm: tên, **danh sách nguyên liệu**, **các bước nấu**.
6. Feedback gắn với công thức; ngoài ra có mục Feedback chung về website ở menu chính.
7. FAQ gồm 7 câu hỏi cố định (xem mục 7).

## 6. Các thực thể dữ liệu gợi ý (cho ERD)

| Thực thể | Thuộc tính chính (gợi ý) |
| --- | --- |
| User | id, họ tên, email, mật khẩu, vai trò (admin / member), ngày đăng ký |
| Subscription | id, user, gói (tháng / năm), số tiền, ngày bắt đầu, ngày hết hạn, trạng thái thanh toán |
| Recipe | id, tiêu đề, mô tả, nguyên liệu, cách nấu, danh mục, mức truy cập (free / member), tác giả, ngày đăng |
| Tip | id, tiêu đề, nội dung, mức truy cập, tác giả, ngày đăng |
| Category | id, tên (nước ép, mặn, chay, món Ý…) |
| Feedback | id, recipe (hoặc null nếu là feedback chung), người gửi, nội dung, ngày gửi |
| Contest | id, tiêu đề, mô tả, loại bài (công thức / mẹo), thời hạn, giải thưởng, trạng thái |
| ContestEntry | id, contest, người gửi, recipe hoặc tip, ngày gửi |
| Announcement | id, contest, bài thắng, nội dung, ngày công bố |
| FAQ | id, câu hỏi, câu trả lời |

**Quan hệ chính:** một User có nhiều Recipe, Tip, Feedback và Subscription; một Contest có nhiều ContestEntry; một ContestEntry trỏ tới một Recipe hoặc Tip; một Contest có một Announcement.

## 7. Nội dung trang FAQ

1. Làm thế nào để trở thành thành viên?
2. Có phí đăng ký không?
3. Xem công thức và mẹo như thế nào? Có mất phí không?
4. Tôi chưa là thành viên, có tham gia cuộc thi được không?
5. Đăng công thức và mẹo như thế nào?
6. Gửi feedback như thế nào?
7. Tôi đã gửi bài dự thi, làm sao biết ai thắng?

## 8. Điểm chưa rõ / mâu thuẫn trong SRS cần quyết định

- **Khách có được tham gia cuộc thi không?** Mục menu dành cho khách nói *có*, nhưng FAQ lại hỏi câu này (và phần đăng ký nói thành viên phải trả phí). Cần chốt một cách hiểu rõ ràng và ghi vào FAQ.
- **Thanh toán:** SRS không nêu cổng thanh toán. Với bài tập, có thể mô phỏng (fake payment) và lưu lịch sử giao dịch.
- **Hết hạn thành viên:** không nói gì về gia hạn hay chuyện xảy ra khi gói hết hạn; nên có ngày hết hạn và kiểm tra khi đăng nhập.
- **Thành viên gửi công thức và mẹo (ngoài cuộc thi):** bài của thành viên có cần admin duyệt trước khi hiển thị không? Có mức free / member-only không?
- **Admin xóa bài của thành viên:** SRS chỉ nói admin quản lý bài của mình.
- **Giải thưởng:** không nêu hình thức; nên là trường văn bản trong Contest.
- **Hai loại feedback:** feedback cho công thức và feedback chung về website; cần tách rõ hoặc dùng chung một bảng.
- **Mật khẩu và bảo mật:** SRS không đề cập; nên băm mật khẩu và kiểm tra quyền ở phía server.

## 9. Phạm vi sản phẩm bàn giao

**Báo cáo dự án (project report) gồm:** chứng nhận hoàn thành; mục lục; định nghĩa bài toán; đặc tả yêu cầu khách hàng; kế hoạch dự án; sơ đồ E-R; thuật toán; tài liệu chuẩn GUI; tài liệu thiết kế giao diện; bảng công việc (task sheet); báo cáo review và giám sát; checklist unit test; checklist cuối cùng.

**Chuẩn lập trình:** mỗi khối mã phải có chú thích; giải thích logic chương trình; có tài liệu đầy đủ; sao lưu dữ liệu hằng ngày.

**Nộp bài và liên lạc:**

- Gửi **2 email trạng thái** (cách nhau khoảng 10 ngày; nếu dự án dưới 30 ngày thì gửi lần 1 trong khoảng ngày 7–10 và lần 2 trước ngày kết thúc 3 ngày), kèm tài liệu review.
- Gửi thắc mắc bất kỳ lúc nào.
- Khi nộp bài, gửi kèm form feedback cùng tài liệu bản mềm.
- Tiêu đề email bắt đầu bằng **STATUS:**, **DOUBT:** hoặc **PROJECT SUBMISSION:**.

## 10. Công nghệ theo SRS

SRS ghi các công cụ thuộc thế hệ cũ (có thể dùng một hoặc kết hợp): HTML/JavaScript, Java (JSP / Servlets, EJB / Struts, JDBC) hoặc .NET / J2EE, cơ sở dữ liệu SQL Server / Oracle / MS Access. Phần cứng tối thiểu nêu trong SRS (Pentium 166, 64 MB RAM, Windows 98) đã lỗi thời nên chỉ cần hiểu là yêu cầu tối thiểu; khi triển khai có thể chọn công nghệ hiện đại tương đương theo hướng dẫn của giảng viên.

## 11. Tóm tắt trong một đoạn

Đây là hệ thống web chia sẻ công thức nấu ăn có ba vai trò (khách, thành viên trả phí, admin). Nội dung chia hai mức free và member-only; thành viên đăng ký theo gói tháng hoặc năm; admin đăng nội dung, tạo cuộc thi, chấm bài và công bố người thắng; mọi người gửi feedback và đọc FAQ. Trọng tâm của đồ án gồm phân quyền theo vai trò, quản lý công thức và mẹo, luồng cuộc thi, và bộ tài liệu đầy đủ kèm mã nguồn có chú thích.
