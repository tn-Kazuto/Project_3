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

## 8. Quyết định Nghiệp vụ & Giải quyết Điểm mở (Senior BA Technical Decisions)

Dưới góc nhìn của Senior Business Analyst phối hợp cùng Solution Architect, toàn bộ 8 điểm mở từ SRS gốc đã được chuẩn hóa và giải quyết dứt điểm:

1. **Khách vãng lai (Guest) có được tham gia cuộc thi không?**  
   👉 **ĐÃ CHỐT: CÓ THAM GIA BÌNH ĐẲNG.**  
   Bảng thực thể `ContestEntry` được thiết kế trường `UserId` dạng Nullable (`int? UserId`). Khi khách vãng lai gửi bài dự thi, hệ thống bắt buộc kiểm tra và lưu trữ `GuestName` cùng `GuestEmail` để Chef James Thew liên hệ trao giải khi chấm thi.
2. **Cổng thanh toán & Quy chuẩn giao dịch ($10 / $100):**  
   👉 **ĐÃ CHỐT: CỔNG THANH TOÁN MÔ PHỎNG (MOCK PAYMENT GATEWAY) CHUẨN PCI-DSS.**  
   Khi đăng ký, người dùng bắt buộc chọn gói Monthly ($10/tháng - 30 ngày) hoặc Yearly ($100/năm - 365 ngày). Hệ thống xử lý qua Local Transaction (hoặc Saga Event), lưu lịch sử trong bảng `Payment` với `CardLast4`, trạng thái `Success`, tuyệt đối không lưu mã CVV hay số thẻ đầy đủ.
3. **Quản lý Vòng đời & Hết hạn gói Thành viên:**  
   👉 **ĐÃ CHỐT: TỰ ĐỘNG KIỂM TRA HẠN DÙNG (SUBSCRIPTION LIFECYCLE).**  
   Mỗi tài khoản lưu trường `SubscriptionExpiryDate`. Tại Middleware / API Gateway, nếu `DateTime.UtcNow > SubscriptionExpiryDate`, quyền hạn sẽ tự động bị hạ xuống `GUEST` cho đến khi người dùng thanh toán gia hạn.
4. **Phân quyền Công thức & Mẹo do Thành viên đóng góp:**  
   👉 **ĐÃ CHỐT: NỘI BỘ THÀNH VIÊN & KIỂM SOÁT QUYỀN SỞ HỮU (OWNERSHIP).**  
   Bài đăng của thành viên sẽ hiển thị cho toàn thể cộng đồng thành viên đã đăng nhập học hỏi. Tuy nhiên, theo Luật 4 (`rules.md`), thành viên **chỉ có quyền xem, sửa hoặc xóa bài viết do chính mình đăng** (`AuthorId == currentUserId`). Mọi hành vi sửa/xóa bài của người khác sẽ bị API từ chối bằng mã `403 Forbidden`.
5. **Đặc quyền Đánh dấu Free / Paid & Quyền Kiểm duyệt của Admin:**  
   👉 **ĐÃ CHỐT: DUY NHẤT ADMIN CÓ QUYỀN ĐÁNH DẤU `IsFree`.**  
   Admin (Mr. James Thew) là người duy nhất sở hữu cờ toggle `IsFree` khi đăng/sửa bài. Đồng thời Admin có quyền kiểm duyệt hoặc gỡ bỏ bất kỳ bài đăng nào vi phạm tiêu chuẩn cộng đồng.
6. **Cơ cấu Giải thưởng Cuộc thi:**  
   👉 **ĐÃ CHỐT: MÔ TẢ GIẢI THƯỞNG RÕ RÀNG TRONG `Contest`.**  
   Bổ sung trường thông tin giải thưởng cụ thể (học bổng lớp học cuối tuần của James Thew, bộ dao bếp 5 sao, sách có chữ ký tác giả).
7. **Xử lý 2 Luồng Phản hồi (Feedback) & Mở rộng Đa phương tiện:**  
   👉 **ĐÃ CHỐT: BẢNG `Feedback` HỢP NHẤT VỚI `RecipeId` NULLABLE.**  
   Nếu `RecipeId != null`: Phản hồi cho món ăn cụ thể, mở rộng hỗ trợ trường `MediaUrl` (ảnh/video thực hành của người dùng) và `Rating` (1-5 sao). Nếu `RecipeId == null`: Góp ý chung về trải nghiệm website.
8. **Bảo mật & Mã hóa Danh tính:**  
   👉 **ĐÃ CHỐT: BĂM BCRYPT + JWT AUTHENTICATION + ROLE-BASED ACCESS CONTROL.**  
   Mật khẩu băm an toàn; xác thực qua JWT Bearer Token; danh tính người dùng luôn được trích xuất từ Token Claims ở phía Server (tuân thủ Luật 6 và Luật 9 của `rules.md`).

---

## 9. Phạm vi Sản phẩm Bàn giao (Aptech Deliverables)

* **Bộ Hồ sơ Báo cáo Dự án (13 Đề mục bắt buộc):** Certificate of Completion, Table of Contents, Problem Definition, Customer Requirement Specification, Project Plan, ERD Diagram (11 thực thể), Algorithms & Flowcharts, GUI Standards Document (Luxury Architectural 5 sao), Interface Design Document, Task Sheet (phân chia 4 thành viên), Project Review and Monitoring Report, Unit Testing Checklist (100% tỷ lệ pass), Final Checklist.
* **Chuẩn Lập trình & Tài liệu hóa:** Mọi khối mã bắt buộc có XML Documentation Comment (`/// <summary>`), giải thích rõ thuật toán nghiệp vụ, áp dụng Unit of Work và Repository Pattern.
* **Quy chuẩn Giao tiếp Email Tiến độ:** Gửi 02 email trạng thái (`STATUS:`), giải đáp thắc mắc (`DOUBT:`) và email nộp bài chính thức (`PROJECT SUBMISSION:`) kèm Feedback Form.
* **Chính sách Sao lưu Dữ liệu Phòng ngừa 3 Rủi ro:** Kỷ luật Commit/Push Git hàng ngày và backup cơ sở dữ liệu định kỳ để đối phó triệt để với *Virus problem, System failure, File corrupt*.

---

## 10. Hiện đại hóa Công nghệ (.NET 10 Microservices + Docker + React 19)

Mặc dù tài liệu đề bài gốc của Aptech liệt kê các công nghệ cổ điển (Pentium 166, Windows 98, Java JSP/Servlets, SQL Server 2000), toàn bộ hệ sinh thái dự án đã được hiện đại hóa toàn diện:
* **Frontend:** **React 19 SPA** (Vite 8, React Router v7, Lucide Icons, Bootstrap 5.3 Luxury Culinary Design System).
* **Backend:** **ASP.NET Core Web API (.NET 10 LTS - `net10.0`, C# 14)** với kiến trúc **Microservices** phân rã 7 dịch vụ độc lập: Identity, Subscription, Catalog, Contest, Community, Media, Notification.
* **Cổng Biên (API Gateway):** YARP (Yet Another Reverse Proxy) định tuyến, giải mã Token và thực thi Content Gatekeeping.
* **Containerization:** **Docker & Docker Compose** đóng gói toàn bộ các service backend, SQL Server 2022, Redis Cache, RabbitMQ Message Bus và Frontend Nginx, sẵn sàng khởi chạy đồng bộ bằng 1 lệnh duy nhất.

---

## 11. Tóm tắt Định hướng Cốt lõi (Executive Summary)

Dự án James Thew Culinary Portal là nền tảng ẩm thực cao cấp đa dịch vụ, giải quyết trọn vẹn bài toán kinh doanh của Chef James Thew: kết hợp hài hòa giữa việc truyền bá văn hóa ẩm thực đại chúng (nội dung Free, cuộc thi cho cả Guest) và tạo lập nguồn doanh thu bền vững từ cộng đồng VIP ($10/tháng, $100/năm). Với kiến trúc **.NET 10 Microservices đóng gói Docker**, kết hợp giao diện **React 19 5 sao**, hệ thống đạt độ sẵn sàng cao, hiệu năng vượt trội và đáp ứng xuất sắc mọi tiêu chí chấm điểm khắt khe nhất của đồ án Aptech eProject.

ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & ĐỊNH HƯỚNG TRIỂN KHAIDự án: Website Chia Sẻ Công Thức Nấu Ăn & Cộng Đồng Ẩm Thực James Thew (eProject)Phiên bản: 2.0 (Đã cập nhật theo nội dung Review của Giảng viên)Công nghệ triển khai: Backend ASP.NET Core $$\rightarrow$$ Frontend React $$\rightarrow$$ Database SQL Server1. Tổng quan bài toán & Mô hình Kênh nội dung (Đã cập nhật theo Review)1.1. Bối cảnh & Nhân vật đại diện (Nhân vật A)Nhân vật đại diện: James Thew (Nhân vật A trên sơ đồ của thầy) là đầu bếp nổi tiếng của khách sạn 5 sao, thường xuyên viết sách ẩm thực, tham gia các chương trình truyền hình và mở các lớp dạy nấu ăn cuối tuần với chi phí thấp hướng tới tệp khán giả đại chúng (Mass Audience).Nhu cầu cốt lõi: Xây dựng một Website trung tâm kết hợp với các kênh tương tác mạng xã hội (Facebook) và hệ thống thông báo (Notification / Email) để chia sẻ công thức nấu ăn đa định dạng, thu phí thành viên định kỳ (Subscription) và tổ chức các sự kiện/cuộc thi tương tác với cộng đồng toàn cầu.1.2. Cấu trúc Sơ đồ Hệ sinh thái (Theo Bảng trắng của Giảng viên)Đối tượng & Kênh tiếp cận đầu phễu:Thương hiệu cá nhân của Đầu bếp James Thew thu hút tệp khán giả đại chúng.Hệ thống giữ chân và kéo người dùng quay lại web: Notification (Thông báo trên web) và Email tự động.Nền tảng trung tâm & Mô hình doanh thu:Kênh chính: Website James Thew.Mô hình thu phí (Subscription - Sub): Đăng ký thành viên định kỳ với mức phí $$10\text{ USD}$$/tháng (theo trọng tâm trên bảng của thầy) và tùy chọn $$100\text{ USD}$$/năm (theo SRS gốc).Nội dung triển khai (Chia sẻ công thức & Chương trình ẩm thực):Bài viết (Articles): Công thức nấu ăn (tên món, nguyên liệu, các bước nấu) và Mẹo vặt (Tips).Video: Video hướng dẫn chi tiết cách chế biến món ăn.Talk (Talkshow): Các buổi trò chuyện, chia sẻ chuyện nghề và kiến thức ẩm thực.Live show: Phát trực tiếp quá trình nấu ăn và giao lưu hỏi đáp với học viên/thành viên.Event (Sự kiện / Cuộc thi - Contest): Các sự kiện ẩm thực và cuộc thi nấu ăn cho cộng đồng tham gia.Hoạt động tương tác Cộng đồng & Mạng xã hội (Facebook Integration):Comment (Bình luận / Feedback): Bình luận đánh giá món ăn kèm theo Ảnh và Video kết quả thực hành món ăn của người dùng.Share (Chia sẻ): Chia sẻ công thức, sự kiện hoặc bài dự thi lên Facebook.Vote (Bình chọn): Khán giả tham gia bình chọn cho các công thức yêu thích hoặc các bài dự thi trong mục Event/Contest.2. Các đối tượng sử dụng hệ thống (Actors)Vai tròMô tả chi tiếtĐiều kiện truy cậpKhách (General User / Guest)Người dùng đại chúng chưa đăng ký hoặc chưa trả phí thành viên.Không cần đăng nhập (hoặc tài khoản chưa mua gói Sub).Thành viên (Member / Subscriber)Người dùng đã đăng ký tài khoản và thanh toán gói Subscription ($$10\text{ USD}$$/tháng hoặc $$100\text{ USD}$$/năm).Đăng nhập tài khoản còn hạn Subscription.Quản trị viên (Admin / James Thew)Chủ sở hữu website (Đầu bếp James Thew) quản lý toàn bộ nội dung, sự kiện và thành viên.Đăng nhập bằng tài khoản Admin.3. Yêu cầu chức năng theo vai trò (Bản gốc SRS + Nâng cấp)3.1. Khách (General User)Trang chủ & Thông tin: Xem trang chủ giới thiệu về đầu bếp James Thew, lịch phát sóng Talkshow/Live show, danh sách Event và thông tin khách hàng.Đăng ký & Thanh toán: Đăng ký tài khoản thành viên và thanh toán gói Subscription tại trang Login/Register.Xem & Tìm kiếm nội dung: Chỉ xem và tìm kiếm được các công thức (Bài viết, Video) và mẹo (Tips) được đánh dấu Miễn phí (Free).Tương tác & Mạng xã hội (Nâng cấp):Gửi Feedback / Comment (có thể đính kèm ảnh/video món ăn đã làm thử) cho công thức và gửi góp ý chung cho website.Thực hiện Share bài viết lên Facebook và bấm Vote (Bình chọn) cho các bài dự thi.Sự kiện & Cuộc thi (Event / Contest): Xem thông tin sự kiện/cuộc thi và tham gia bằng cách gửi mẹo hoặc công thức (kèm nguyên liệu, cách làm, ảnh/video).Thông báo & Giải đáp: Xem trang công bố người thắng cuộc (Announcements), đăng ký nhận Email thông báo và xem trang FAQ.3.2. Thành viên trả phí (Member / Subscriber)Hồ sơ & Gói cước: Xem và chỉnh sửa hồ sơ cá nhân ngay trên trang; theo dõi thời hạn gói Subscription ($$10\text{ USD}$$/tháng hoặc $$100\text{ USD}$$/năm) và lịch sử thanh toán.Truy cập đặc quyền (Full Access):Xem và tìm kiếm toàn bộ công thức (Bài viết, Video), mẹo vặt trên hệ thống (bao gồm cả nội dung Member-only).Tham gia xem các buổi Talkshow và Live show độc quyền của James Thew.Đóng góp & Quản lý nội dung cá nhân:Gửi mẹo vặt; gửi công thức mới kèm danh sách nguyên liệu, các bước nấu, hình ảnh và link video.Xem toàn bộ công thức và mẹo do mọi khách hàng khác đóng góp.Tự xem, sửa, xóa các công thức và mẹo do chính mình đã đăng.Tương tác, Dự thi & Nhận thông báo:Đầy đủ quyền dự thi Contest, gửi Comment (kèm ảnh/video), Share Facebook và Vote bài dự thi.Nhận Notification trên web và Email tự động khi James Thew đăng bài mới, mở Live show/Talkshow hoặc công bố kết quả cuộc thi.3.3. Quản trị viên (Admin / James Thew)Quản lý Hồ sơ & Hệ thống: Xem, sửa hồ sơ cá nhân và theo dõi thống kê gói Subscription của thành viên.Quản trị Nội dung Đa phương tiện (Bài viết, Video, Talkshow, Live show):Đăng, xem, sửa, xóa mẹo vặt và công thức (bắt buộc gồm tên, nguyên liệu, quy trình nấu; mở rộng thêm Video hướng dẫn).Tạo lịch và đăng tải nội dung Talkshow và Live show.Đặc quyền phân loại: Đánh dấu mỗi nội dung mình đăng là Free (Miễn phí) hay Member-only (Chỉ dành cho thành viên trả phí).Kiểm duyệt hoặc xóa các bài đăng/bình luận vi phạm tiêu chuẩn cộng đồng từ phía người dùng.Quản trị Sự kiện / Cuộc thi (Event / Contest) & Thông báo:Tạo, cập nhật hoặc xóa cuộc thi/sự kiện.Xem danh sách toàn bộ bài dự thi của từng cuộc thi cùng số lượt Vote từ cộng đồng.Chấm chọn bài thắng giải và công bố người chiến thắng lên trang Announcements (đồng thời kích hoạt hệ thống đẩy Notification và gửi Email thông báo).Quản lý Phản hồi (Feedback): Xem toàn bộ Feedback/Comment (kèm ảnh/video) của từng công thức và Feedback góp ý chung về website.4. Ma trận phân quyền (Cập nhật đầy đủ tính năng)Chức năng hệ thốngKhách (Guest)Thành viên (Member)Quản trị viên (Admin)Xem trang chủ, lịch sự kiện & FAQCóCóCóĐăng ký / Đăng nhập / Mua gói Sub ($$10\text{ USD}$$ - $$100\text{ USD}$$)CóCóCóXem & Tìm kiếm bài viết, video, mẹo Miễn phí (Free)CóCóCóXem & Tìm kiếm nội dung Member-only (Bài viết, Video, Talk, Live)KhôngCóCóGửi Comment / Feedback (kèm Ảnh, Video) & Share FacebookCóCóQuản lý & XemTham gia cuộc thi (Contest) & Vote (Bình chọn) bài dự thiCóCóKhông (Chấm giải)Tạo / Xóa cuộc thi, Xem chi tiết bài dự thi & Công bố người thắngKhôngKhôngCóXem trang Thông báo (Announcements) & Nhận Email/NotificationCóCóCóĐăng / Sửa / Xóa công thức và mẹo của chính mìnhKhôngCóCóĐánh dấu nội dung là Free hoặc Member-onlyKhôngKhôngCóXem và sửa Hồ sơ cá nhân ngay trên trangKhôngCóCó5. Quy tắc nghiệp vụ cốt lõi (Business Rules)Quy tắc Thu phí Thành viên (Subscription):Hệ thống cung cấp 2 gói cước: Gói tháng ($$10\text{ USD}$$/tháng - trọng tâm thu hút người dùng đại chúng) và Gói năm ($$100\text{ USD}$$/năm - tiết kiệm chi phí).Khi đăng nhập, hệ thống tự động đối chiếu ExpirationDate (ngày hết hạn) với thời gian thực của máy chủ. Nếu hết hạn, tài khoản vẫn đăng nhập được nhưng quyền xem nội dung tự động hạ về mức Free cho đến khi gia hạn.Quy tắc Phân vùng Nội dung (Access Level):Chỉ có 2 mức truy cập: Free và Member-only.Chỉ một mình Admin (James Thew) được quyền chọn mức Free hoặc Member-only cho bài đăng của mình.Mọi công thức và mẹo do Thành viên đóng góp (ngoài cuộc thi) sẽ mặc định gán mức Member-only để phục vụ cộng đồng thành viên trả phí.Quy tắc Cấu trúc Công thức & Đa phương tiện:Một công thức nấu ăn bắt buộc phải có đủ 3 thành phần: Tên món ăn, Danh sách nguyên liệu, và Các bước chế biến.Hỗ trợ đính kèm đường dẫn Video hướng dẫn (YouTube/Vimeo hoặc file tải lên) và phân loại chương trình (Bài viết, Video, Talkshow, Live show).Quy tắc Cuộc thi (Contest), Bình chọn (Vote) & Thông báo:Cả Khách và Thành viên đều được gửi bài dự thi và tham gia Vote cho các bài dự thi.Lượt Vote từ cộng đồng (trên web / chia sẻ qua Facebook) là chỉ số tham khảo quan trọng để Admin đánh giá và đưa ra quyết định chọn người thắng cuộc cuối cùng.Khi Admin công bố người thắng ở trang Announcements hoặc đăng nội dung/sự kiện mới, hệ thống tự động tạo Notification trên web và gửi Email đến danh sách người dùng đăng ký.6. Thiết kế Cơ sở dữ liệu (ERD - 11 Thực thể nâng cấp trên SQL Server)Để đáp ứng đầy đủ 10 bảng gợi ý trong SRS gốc và tích hợp các tính năng nâng cấp của giảng viên (Video, Talk/Live, Vote, Media Feedback, Notification/Email), cơ sở dữ liệu bao gồm các thực thể sau:STTTên Thực thể (Bảng)Thuộc tính chính (Cột dữ liệu gợi ý)Ghi chú nâng cấp so với SRS gốc1UserId, FullName, Email, PasswordHash, Role (Admin/Member), AvatarUrl, IsEmailVerified, CreatedAtLưu PasswordHash để bảo mật; dùng Email để gửi thông báo tự động.2SubscriptionId, UserId, PlanType (Monthly/Yearly), Amount ($10\text{ USD}$/$100\text{ USD}$), StartDate, EndDate, PaymentStatus, TransactionCodeKiểm tra EndDate mỗi lần đăng nhập để kích hoạt quyền Member.3CategoryId, Name (Nước ép, Món mặn, Món chay, Món Ý...), DescriptionPhân loại danh mục món ăn.4RecipeId, Title, Description, Ingredients, CookingSteps, CategoryId, AccessLevel (Free/Member), ContentType (Article/Video/Talkshow/Liveshow), VideoUrl, ThumbnailUrl, ShareCount, AuthorId, CreatedAtBổ sung ContentType, VideoUrl và ShareCount theo mô hình kênh nội dung của thầy.5TipId, Title, Content, VideoUrl, AccessLevel (Free/Member), AuthorId, CreatedAtCho phép đính kèm video ngắn minh họa mẹo nấu ăn.6FeedbackId, RecipeId (nullable), UserId (nullable), SenderName, SenderEmail, Content, MediaUrl (Ảnh/Video đính kèm), Rating, CreatedAtRecipeId = NULL là góp ý chung; bổ sung MediaUrl để bình luận kèm ảnh/video món ăn.7ContestId, Title, Description, ContestType (Recipe/Tip/Event), StartDate, EndDate, Prize, Status (Open/Closed)Quản lý các cuộc thi và sự kiện (Event) tương tác cộng đồng.8ContestEntryId, ContestId, UserId (nullable), GuestName, GuestEmail, RecipeId (nullable), TipId (nullable), VoteCount, SubmittedAtBổ sung GuestName/GuestEmail cho khách dự thi và VoteCount lưu tổng lượt bình chọn.9ContestVote (Mới)Id, ContestEntryId, UserId (nullable), VoterIpOrEmail, VotedAtBảng phụ chống gian lận bình chọn (mỗi người chỉ được Vote 1 lần cho 1 bài dự thi).10AnnouncementId, ContestId (nullable), WinningEntryId (nullable), Title, Content, IsEmailSent, PublishedAtCông bố người thắng cuộc và kích hoạt gửi Notification / Email hàng loạt.11FAQ & NotificationFAQ: Id, Question, Answer, DisplayOrderNotification: Id, UserId, Title, Message, IsRead, CreatedAtLưu 7 câu hỏi FAQ cố định và danh sách thông báo đẩy trên giao diện người dùng.7. Giải quyết các điểm mở trong SRS (Phương án Kỹ thuật)Khách chưa đăng ký lấy thông tin đâu để trao giải khi dự thi?Giải pháp: Mở quyền cho Khách dự thi đúng theo ma trận phân quyền. Trong bảng ContestEntry, khóa ngoại UserId cho phép NULL, nhưng bắt buộc Khách phải điền GuestName và GuestEmail trên form nộp bài. Khi bài dự thi thắng giải, hệ thống gửi Email thông báo trực tiếp tới GuestEmail này.Thiết kế khóa ngoại cho bảng ContestEntry và Feedback:Bảng Feedback: Dùng chung 1 bảng duy nhất. Nếu RecipeId có giá trị $\rightarrow$ hiển thị ở phần bình luận (Comment) dưới công thức đó. Nếu RecipeId IS NULL $\rightarrow$ đưa vào hòm thư góp ý chung của website cho Admin xem.Bảng ContestEntry: Chứa cả 2 cột RecipeId và TipId (cả hai đều cho phép NULL), đi kèm ràng buộc CHECK trong SQL Server: (RecipeId IS NOT NULL AND TipId IS NULL) OR (RecipeId IS NULL AND TipId IS NOT NULL) để đảm bảo mỗi bài dự thi trỏ chính xác tới 1 Công thức hoặc 1 Mẹo.Tích hợp Facebook (Comment, Ảnh/Video, Share, Vote) trong phạm vi đồ án:Share: Tích hợp nút Share sử dụng Facebook Share Dialog (https://www.facebook.com/sharer/sharer.php?u=...) kèm thẻ Open Graph meta tags để hiển thị đẹp mắt ảnh và tiêu đề món ăn khi chia sẻ lên Facebook.Comment kèm Ảnh/Video & Vote: Xây dựng trực tiếp trên giao diện React lưu vào bảng Feedback (cột MediaUrl) và ContestVote để Admin dễ dàng kiểm soát dữ liệu trên SQL Server, hoặc tùy chọn nhúng thêm Facebook Comments Plugin dưới mỗi bài viết.Hệ thống Notification & Email tự động:Sử dụng dịch vụ SmtpClient / MailKit trong ASP.NET Core để gửi email tự động khi đăng ký thành công, khi sắp hết hạn gói Subscription ($10\text{ USD}$/tháng), hoặc khi có thông báo người thắng cuộc thi mới.8. Kiến trúc Công nghệ & Phân chia Product Backlog (4 Thành viên)Backend: ASP.NET Core Web API (C#), Entity Framework Core, xác thực JWT (JSON Web Token) + BCrypt băm mật khẩu, tích hợp gửi mail SMTP.Frontend: ReactJS (Vite), TailwindCSS / Bootstrap, Axios gọi API, React Router phân quyền theo Role.Database: Microsoft SQL Server.Bảng phân chia công việc (Task Sheet cho 4 thành viên)Thành viênPhân hệ phụ tráchCông việc Backend (ASP.NET Core)Công việc Frontend (React)Tài liệu Báo cáo (Project Report)Thành viên 1 (Nhóm trưởng)Tài khoản, Subscription ($10\text{ USD}$/$100\text{ USD}$) & Email/Notification- Thiết kế bảng User, Subscription, Notification.- API Đăng ký, Đăng nhập (JWT), băm mật khẩu.- API Thanh toán giả lập (Fake Payment) & Middleware kiểm tra hạn gói Sub.- Dịch vụ gửi Email & Notification tự động.- Trang Login / Register.- Giao diện chọn gói Sub ($10\text{ USD}$/tháng, $100\text{ USD}$/năm) & cổng thanh toán.- Trang sửa Hồ sơ cá nhân trực tiếp (Inline Edit).- Chuông hiển thị Notification trên thanh Header.- Định nghĩa bài toán & Đặc tả SRS.- Kế hoạch dự án & Bảng phân công (Task Sheet).- Phụ trách gửi 2 Email trạng thái (STATUS:).Thành viên 2Công thức, Mẹo, Video & Talkshow/Liveshow- Thiết kế bảng Category, Recipe, Tip.- API CRUD Công thức, Mẹo, Video, Talkshow/Liveshow.- Logic phân quyền: Chỉ Admin gắn nhãn Free/Member-only; lọc kết quả tìm kiếm theo đúng vai trò.- Danh sách & Bộ lọc tìm kiếm Công thức, Mẹo, Video, Talkshow/Liveshow.- Trang chi tiết món ăn (trình phát Video, nguyên liệu, cách nấu).- Trang quản lý bài đăng cho Thành viên và Admin.- Thiết kế Sơ đồ thực thể liên kết (ERD).- Tài liệu giải thích Thuật toán (Algorithm / Flowchart) cho các luồng chính.Thành viên 3Sự kiện / Cuộc thi (Contest), Bình chọn (Vote) & Giải thưởng- Thiết kế bảng Contest, ContestEntry, ContestVote, Announcement.- API Tạo/Xóa cuộc thi, nộp bài dự thi (cho cả Khách và Thành viên).- API xử lý lượt Vote và công bố người thắng giải.- Trang danh sách Sự kiện / Cuộc thi & Form gửi bài dự thi.- Nút Vote (Bình chọn) thời gian thực trên các bài dự thi.- Màn hình Admin chấm giải & Trang Announcements.- Tài liệu Chuẩn giao diện (GUI Standards).- Tài liệu Thiết kế giao diện (UI/Wireframe Design).Thành viên 4Tương tác Mạng xã hội (FB Share, Media Comment), Trang chủ & FAQ- Thiết kế bảng Feedback (hỗ trợ đính kèm Ảnh/Video) và FAQ.- API gửi Comment theo món ăn (kèm upload ảnh/video) và góp ý chung.- API quản lý FAQ và thống kê lượt Share.- Trang chủ giới thiệu James Thew & lịch sự kiện.- Khu vực Bình luận (hiển thị Ảnh/Video thực hành của người dùng) & Nút Share Facebook.- Trang 7 câu hỏi FAQ & Form Feedback chung.- Mục lục, Chứng nhận hoàn thành.- Báo cáo Review, Checklist Unit Test, Checklist cuối cùng & Form Feedback nộp bài.9. Nội dung 7 câu hỏi cố định tại trang FAQ (Đã đồng bộ quy tắc mới)Làm thế nào để trở thành thành viên của website James Thew?Trả lời: Bạn chỉ cần truy cập trang Đăng ký (Register), điền thông tin cá nhân, chọn gói thành viên theo tháng hoặc theo năm và hoàn tất bước thanh toán trực tuyến để kích hoạt tài khoản ngay lập tức.Có mất phí đăng ký thành viên không?Trả lời: Có. Website áp dụng mô hình thành viên trả phí (Subscription) với hai mức giá linh hoạt: $10\text{ USD}$/tháng hoặc gói tiết kiệm $100\text{ USD}$/năm.Xem công thức, video nấu ăn và mẹo vặt như thế nào? Có mất phí không?Trả lời: Khách truy cập tự do được xem miễn phí toàn bộ các bài viết, video và mẹo có gắn nhãn Free. Để mở khóa toàn bộ kho công thức độc quyền (Member-only), xem các buổi Talkshow, Live show và bài đóng góp từ cộng đồng, bạn cần đăng nhập bằng tài khoản Thành viên còn hạn.Tôi chưa phải là thành viên trả phí, tôi có tham gia cuộc thi (Contest) và bình chọn (Vote) được không?Trả lời: Hoàn toàn được! Mọi khán giả đại chúng đều có thể tham gia gửi công thức/mẹo dự thi (chỉ cần điền Họ tên và Email liên hệ khi nộp bài) cũng như tham gia bình chọn (Vote) và chia sẻ bài dự thi lên Facebook.Làm thế nào để đăng công thức và mẹo nấu ăn của tôi lên website?Trả lời: Sau khi đăng nhập với tư cách Thành viên, bạn vào mục "Quản lý bài viết cá nhân", chọn "Đăng công thức/mẹo mới" và điền đầy đủ Tên món, Danh sách nguyên liệu, Các bước nấu (kèm ảnh hoặc link video nếu có). Bạn có thể tự chỉnh sửa hoặc xóa bài của mình bất cứ lúc nào.Làm sao để gửi phản hồi (Feedback), bình luận hình ảnh món ăn hoặc chia sẻ lên mạng xã hội?Trả lời: Dưới mỗi công thức đều có khu vực Bình luận cho phép bạn gửi đánh giá kèm hình ảnh/video món ăn bạn đã làm thử, cùng nút Share để chia sẻ trực tiếp lên Facebook. Nếu muốn góp ý chung cho website, bạn hãy chọn mục Feedback trên thanh menu chính.Tôi đã gửi bài dự thi, làm sao để biết ai là người chiến thắng?Trả lời: Kết quả cuộc thi được đầu bếp James Thew đánh giá dựa trên chất lượng chuyên môn kết hợp với lượt bình chọn (Vote) từ cộng đồng. Người thắng giải sẽ được công bố công khai tại trang Announcements trên website, đồng thời hệ thống sẽ gửi Notification và Email thông báo trực tiếp đến bạn.10. Phạm vi sản phẩm bàn giao & Quy chuẩn nộp bài (Deliverables)Hồ sơ báo cáo (Project Report): Chứng nhận hoàn thành, Mục lục, Định nghĩa bài toán, Đặc tả yêu cầu khách hàng (SRS này), Kế hoạch dự án, Sơ đồ E-R (ERD), Thuật toán, Tài liệu chuẩn GUI, Tài liệu thiết kế giao diện, Bảng công việc (Task Sheet), Báo cáo Review & Giám sát, Checklist Unit Test, Checklist cuối cùng.Quy chuẩn mã nguồn (Coding Standards): Mỗi khối mã trong ASP.NET và React phải có chú thích (comment) rõ ràng giải thích logic chương trình; thiết lập cơ chế sao lưu cơ sở dữ liệu hằng ngày.Quy tắc liên lạc & Nộp bài qua Email:Gửi 2 email báo cáo trạng thái (cách nhau khoảng 10 ngày; hoặc ngày thứ 7–10 và trước khi kết thúc 3 ngày đối với dự án dưới 30 ngày) kèm tài liệu review.Tiêu đề email bắt buộc bắt đầu bằng tiền tố: STATUS:, DOUBT: hoặc PROJECT SUBMISSION:.