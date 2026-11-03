# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & ĐỊNH HƯỚNG TRIỂN KHAI
**Dự án:** Website Chia Sẻ Công Thức Nấu Ăn & Cộng Đồng Ẩm Thực James Thew (eProject)  
**Phiên bản:** 2.0 (Đã cập nhật theo nội dung Review của Giảng viên)  
**Công nghệ triển khai:** Backend ASP.NET Core $\rightarrow$ Frontend React $\rightarrow$ Database SQL Server  

---

## 1. Tổng quan bài toán & Mô hình Kênh nội dung (Đã cập nhật theo Review)

### 1.1. Bối cảnh & Nhân vật đại diện (Nhân vật A)
* **Nhân vật đại diện:** James Thew (Nhân vật A trên sơ đồ của thầy) là đầu bếp nổi tiếng của khách sạn 5 sao, thường xuyên viết sách ẩm thực, tham gia các chương trình truyền hình và mở các lớp dạy nấu ăn cuối tuần với chi phí thấp hướng tới **tệp khán giả đại chúng (Mass Audience)**.
* **Nhu cầu cốt lõi:** Xây dựng một **Website trung tâm** kết hợp với các **kênh tương tác mạng xã hội (Facebook)** và **hệ thống thông báo (Notification / Email)** để chia sẻ công thức nấu ăn đa định dạng, thu phí thành viên định kỳ (Subscription) và tổ chức các sự kiện/cuộc thi tương tác với cộng đồng toàn cầu.

### 1.2. Cấu trúc Sơ đồ Hệ sinh thái (Theo Bảng trắng của Giảng viên)
1. **Đối tượng & Kênh tiếp cận đầu phễu:**
   * Thương hiệu cá nhân của Đầu bếp James Thew thu hút tệp khán giả đại chúng.
   * Hệ thống giữ chân và kéo người dùng quay lại web: **Notification (Thông báo trên web)** và **Email tự động**.
2. **Nền tảng trung tâm & Mô hình doanh thu:**
   * **Kênh chính:** Website James Thew.
   * **Mô hình thu phí (Subscription - Sub):** Đăng ký thành viên định kỳ với mức phí **$10\text{ USD}$/tháng** (theo trọng tâm trên bảng của thầy) và tùy chọn **$100\text{ USD}$/năm** (theo SRS gốc).
3. **Nội dung triển khai (Chia sẻ công thức & Chương trình ẩm thực):**
   * **Bài viết (Articles):** Công thức nấu ăn (tên món, nguyên liệu, các bước nấu) và Mẹo vặt (Tips).
   * **Video:** Video hướng dẫn chi tiết cách chế biến món ăn.
   * **Talk (Talkshow):** Các buổi trò chuyện, chia sẻ chuyện nghề và kiến thức ẩm thực.
   * **Live show:** Phát trực tiếp quá trình nấu ăn và giao lưu hỏi đáp với học viên/thành viên.
   * **Event (Sự kiện / Cuộc thi - Contest):** Các sự kiện ẩm thực và cuộc thi nấu ăn cho cộng đồng tham gia.
4. **Hoạt động tương tác Cộng đồng & Mạng xã hội (Facebook Integration):**
   * **Comment (Bình luận / Feedback):** Bình luận đánh giá món ăn kèm theo **Ảnh và Video** kết quả thực hành món ăn của người dùng.
   * **Share (Chia sẻ):** Chia sẻ công thức, sự kiện hoặc bài dự thi lên Facebook.
   * **Vote (Bình chọn):** Khán giả tham gia bình chọn cho các công thức yêu thích hoặc các bài dự thi trong mục Event/Contest.

---

## 2. Các đối tượng sử dụng hệ thống (Actors)

| Vai trò | Mô tả chi tiết | Điều kiện truy cập |
| :--- | :--- | :--- |
| **Khách (General User / Guest)** | Người dùng đại chúng chưa đăng ký hoặc chưa trả phí thành viên. | Không cần đăng nhập (hoặc tài khoản chưa mua gói Sub). |
| **Thành viên (Member / Subscriber)** | Người dùng đã đăng ký tài khoản và thanh toán gói Subscription ($10\text{ USD}$/tháng hoặc $100\text{ USD}$/năm). | Đăng nhập tài khoản còn hạn Subscription. |
| **Quản trị viên (Admin / James Thew)** | Chủ sở hữu website (Đầu bếp James Thew) quản lý toàn bộ nội dung, sự kiện và thành viên. | Đăng nhập bằng tài khoản Admin. |

---

## 3. Yêu cầu chức năng theo vai trò (Bản gốc SRS + Nâng cấp)

### 3.1. Khách (General User)
* **Trang chủ & Thông tin:** Xem trang chủ giới thiệu về đầu bếp James Thew, lịch phát sóng Talkshow/Live show, danh sách Event và thông tin khách hàng.
* **Đăng ký & Thanh toán:** Đăng ký tài khoản thành viên và thanh toán gói Subscription tại trang Login/Register.
* **Xem & Tìm kiếm nội dung:** Chỉ xem và tìm kiếm được các công thức (Bài viết, Video) và mẹo (Tips) được đánh dấu **Miễn phí (Free)**.
* **Tương tác & Mạng xã hội (Nâng cấp):**
  * Gửi Feedback / Comment (có thể đính kèm ảnh/video món ăn đã làm thử) cho công thức và gửi góp ý chung cho website.
  * Thực hiện **Share** bài viết lên Facebook và bấm **Vote (Bình chọn)** cho các bài dự thi.
* **Sự kiện & Cuộc thi (Event / Contest):** Xem thông tin sự kiện/cuộc thi và tham gia bằng cách gửi mẹo hoặc công thức (kèm nguyên liệu, cách làm, ảnh/video).
* **Thông báo & Giải đáp:** Xem trang công bố người thắng cuộc (Announcements), đăng ký nhận Email thông báo và xem trang FAQ.

### 3.2. Thành viên trả phí (Member / Subscriber)
* **Hồ sơ & Gói cước:** Xem và chỉnh sửa hồ sơ cá nhân ngay trên trang; theo dõi thời hạn gói Subscription ($10\text{ USD}$/tháng hoặc $100\text{ USD}$/năm) và lịch sử thanh toán.
* **Truy cập đặc quyền (Full Access):**
  * Xem và tìm kiếm **toàn bộ** công thức (Bài viết, Video), mẹo vặt trên hệ thống (bao gồm cả nội dung **Member-only**).
  * Tham gia xem các buổi **Talkshow** và **Live show** độc quyền của James Thew.
* **Đóng góp & Quản lý nội dung cá nhân:**
  * Gửi mẹo vặt; gửi công thức mới kèm danh sách nguyên liệu, các bước nấu, hình ảnh và link video.
  * Xem toàn bộ công thức và mẹo do mọi khách hàng khác đóng góp.
  * Tự xem, sửa, xóa các công thức và mẹo do chính mình đã đăng.
* **Tương tác, Dự thi & Nhận thông báo:**
  * Đầy đủ quyền dự thi Contest, gửi Comment (kèm ảnh/video), Share Facebook và Vote bài dự thi.
  * Nhận **Notification trên web** và **Email tự động** khi James Thew đăng bài mới, mở Live show/Talkshow hoặc công bố kết quả cuộc thi.

### 3.3. Quản trị viên (Admin / James Thew)
* **Quản lý Hồ sơ & Hệ thống:** Xem, sửa hồ sơ cá nhân và theo dõi thống kê gói Subscription của thành viên.
* **Quản trị Nội dung Đa phương tiện (Bài viết, Video, Talkshow, Live show):**
  * Đăng, xem, sửa, xóa mẹo vặt và công thức (bắt buộc gồm tên, nguyên liệu, quy trình nấu; mở rộng thêm Video hướng dẫn).
  * Tạo lịch và đăng tải nội dung **Talkshow** và **Live show**.
  * **Đặc quyền phân loại:** Đánh dấu mỗi nội dung mình đăng là **Free (Miễn phí)** hay **Member-only (Chỉ dành cho thành viên trả phí)**.
  * Kiểm duyệt hoặc xóa các bài đăng/bình luận vi phạm tiêu chuẩn cộng đồng từ phía người dùng.
* **Quản trị Sự kiện / Cuộc thi (Event / Contest) & Thông báo:**
  * Tạo, cập nhật hoặc xóa cuộc thi/sự kiện.
  * Xem danh sách toàn bộ bài dự thi của từng cuộc thi cùng số lượt **Vote** từ cộng đồng.
  * Chấm chọn bài thắng giải và công bố người chiến thắng lên trang **Announcements** (đồng thời kích hoạt hệ thống đẩy Notification và gửi Email thông báo).
* **Quản lý Phản hồi (Feedback):** Xem toàn bộ Feedback/Comment (kèm ảnh/video) của từng công thức và Feedback góp ý chung về website.

---

## 4. Ma trận phân quyền (Cập nhật đầy đủ tính năng)

| Chức năng hệ thống | Khách (Guest) | Thành viên (Member) | Quản trị viên (Admin) |
| :--- | :---: | :---: | :---: |
| Xem trang chủ, lịch sự kiện & FAQ | Có | Có | Có |
| Đăng ký / Đăng nhập / Mua gói Sub ($10\text{ USD}$ - $100\text{ USD}$) | Có | Có | Có |
| Xem & Tìm kiếm bài viết, video, mẹo **Miễn phí (Free)** | Có | Có | Có |
| Xem & Tìm kiếm nội dung **Member-only** (Bài viết, Video, Talk, Live) | Không | Có | Có |
| Gửi Comment / Feedback (kèm Ảnh, Video) & Share Facebook | Có | Có | Quản lý & Xem |
| Tham gia cuộc thi (Contest) & Vote (Bình chọn) bài dự thi | Có | Có | Không (Chấm giải) |
| Tạo / Xóa cuộc thi, Xem chi tiết bài dự thi & Công bố người thắng | Không | Không | Có |
| Xem trang Thông báo (Announcements) & Nhận Email/Notification | Có | Có | Có |
| Đăng / Sửa / Xóa công thức và mẹo của chính mình | Không | Có | Có |
| Đánh dấu nội dung là **Free** hoặc **Member-only** | Không | Không | Có |
| Xem và sửa Hồ sơ cá nhân ngay trên trang | Không | Có | Có |

---

## 5. Quy tắc nghiệp vụ cốt lõi (Business Rules)

1. **Quy tắc Thu phí Thành viên (Subscription):**
   * Hệ thống cung cấp 2 gói cước: Gói tháng (**$10\text{ USD}$/tháng** - trọng tâm thu hút người dùng đại chúng) và Gói năm (**$100\text{ USD}$/năm** - tiết kiệm chi phí).
   * Khi đăng nhập, hệ thống tự động đối chiếu `ExpirationDate` (ngày hết hạn) với thời gian thực của máy chủ. Nếu hết hạn, tài khoản vẫn đăng nhập được nhưng quyền xem nội dung tự động hạ về mức **Free** cho đến khi gia hạn.
2. **Quy tắc Phân vùng Nội dung (Access Level):**
   * Chỉ có 2 mức truy cập: `Free` và `Member-only`.
   * Chỉ một mình Admin (James Thew) được quyền chọn mức `Free` hoặc `Member-only` cho bài đăng của mình.
   * Mọi công thức và mẹo do Thành viên đóng góp (ngoài cuộc thi) sẽ mặc định gán mức `Member-only` để phục vụ cộng đồng thành viên trả phí.
3. **Quy tắc Cấu trúc Công thức & Đa phương tiện:**
   * Một công thức nấu ăn bắt buộc phải có đủ 3 thành phần: **Tên món ăn**, **Danh sách nguyên liệu**, và **Các bước chế biến**.
   * Hỗ trợ đính kèm đường dẫn **Video hướng dẫn** (YouTube/Vimeo hoặc file tải lên) và phân loại chương trình (**Bài viết**, **Video**, **Talkshow**, **Live show**).
4. **Quy tắc Cuộc thi (Contest), Bình chọn (Vote) & Thông báo:**
   * Cả Khách và Thành viên đều được gửi bài dự thi và tham gia **Vote** cho các bài dự thi.
   * Lượt Vote từ cộng đồng (trên web / chia sẻ qua Facebook) là chỉ số tham khảo quan trọng để Admin đánh giá và đưa ra quyết định chọn người thắng cuộc cuối cùng.
   * Khi Admin công bố người thắng ở trang Announcements hoặc đăng nội dung/sự kiện mới, hệ thống tự động tạo **Notification** trên web và gửi **Email** đến danh sách người dùng đăng ký.

---

## 6. Thiết kế Cơ sở dữ liệu (ERD - 11 Thực thể nâng cấp trên SQL Server)

Để đáp ứng đầy đủ 10 bảng gợi ý trong SRS gốc và tích hợp các tính năng nâng cấp của giảng viên (Video, Talk/Live, Vote, Media Feedback, Notification/Email), cơ sở dữ liệu bao gồm các thực thể sau:

| STT | Tên Thực thể (Bảng) | Thuộc tính chính (Cột dữ liệu gợi ý) | Ghi chú nâng cấp so với SRS gốc |
| :---: | :--- | :--- | :--- |
| 1 | **User** | `Id`, `FullName`, `Email`, `PasswordHash`, `Role` (Admin/Member), `AvatarUrl`, `IsEmailVerified`, `CreatedAt` | Lưu `PasswordHash` để bảo mật; dùng `Email` để gửi thông báo tự động. |
| 2 | **Subscription** | `Id`, `UserId`, `PlanType` (Monthly/Yearly), `Amount` ($10\text{ USD}$/$100\text{ USD}$), `StartDate`, `EndDate`, `PaymentStatus`, `TransactionCode` | Kiểm tra `EndDate` mỗi lần đăng nhập để kích hoạt quyền Member. |
| 3 | **Category** | `Id`, `Name` (Nước ép, Món mặn, Món chay, Món Ý...), `Description` | Phân loại danh mục món ăn. |
| 4 | **Recipe** | `Id`, `Title`, `Description`, `Ingredients`, `CookingSteps`, `CategoryId`, `AccessLevel` (Free/Member), `ContentType` (Article/Video/Talkshow/Liveshow), `VideoUrl`, `ThumbnailUrl`, `ShareCount`, `AuthorId`, `CreatedAt` | Bổ sung `ContentType`, `VideoUrl` và `ShareCount` theo mô hình kênh nội dung của thầy. |
| 5 | **Tip** | `Id`, `Title`, `Content`, `VideoUrl`, `AccessLevel` (Free/Member), `AuthorId`, `CreatedAt` | Cho phép đính kèm video ngắn minh họa mẹo nấu ăn. |
| 6 | **Feedback** | `Id`, `RecipeId` (nullable), `UserId` (nullable), `SenderName`, `SenderEmail`, `Content`, `MediaUrl` (Ảnh/Video đính kèm), `Rating`, `CreatedAt` | `RecipeId = NULL` là góp ý chung; bổ sung `MediaUrl` để bình luận kèm ảnh/video món ăn. |
| 7 | **Contest** | `Id`, `Title`, `Description`, `ContestType` (Recipe/Tip/Event), `StartDate`, `EndDate`, `Prize`, `Status` (Open/Closed) | Quản lý các cuộc thi và sự kiện (Event) tương tác cộng đồng. |
| 8 | **ContestEntry** | `Id`, `ContestId`, `UserId` (nullable), `GuestName`, `GuestEmail`, `RecipeId` (nullable), `TipId` (nullable), `VoteCount`, `SubmittedAt` | Bổ sung `GuestName`/`GuestEmail` cho khách dự thi và `VoteCount` lưu tổng lượt bình chọn. |
| 9 | **ContestVote** *(Mới)* | `Id`, `ContestEntryId`, `UserId` (nullable), `VoterIpOrEmail`, `VotedAt` | Bảng phụ chống gian lận bình chọn (mỗi người chỉ được Vote 1 lần cho 1 bài dự thi). |
| 10 | **Announcement** | `Id`, `ContestId` (nullable), `WinningEntryId` (nullable), `Title`, `Content`, `IsEmailSent`, `PublishedAt` | Công bố người thắng cuộc và kích hoạt gửi Notification / Email hàng loạt. |
| 11 | **FAQ & Notification** | **FAQ:** `Id`, `Question`, `Answer`, `DisplayOrder`<br>**Notification:** `Id`, `UserId`, `Title`, `Message`, `IsRead`, `CreatedAt` | Lưu 7 câu hỏi FAQ cố định và danh sách thông báo đẩy trên giao diện người dùng. |

---

## 7. Giải quyết các điểm mở trong SRS (Phương án Kỹ thuật)

1. **Khách chưa đăng ký lấy thông tin đâu để trao giải khi dự thi?**
   * **Giải pháp:** Mở quyền cho Khách dự thi đúng theo ma trận phân quyền. Trong bảng `ContestEntry`, khóa ngoại `UserId` cho phép `NULL`, nhưng bắt buộc Khách phải điền `GuestName` và `GuestEmail` trên form nộp bài. Khi bài dự thi thắng giải, hệ thống gửi Email thông báo trực tiếp tới `GuestEmail` này.
2. **Thiết kế khóa ngoại cho bảng `ContestEntry` và `Feedback`:**
   * **Bảng `Feedback`:** Dùng chung 1 bảng duy nhất. Nếu `RecipeId` có giá trị $\rightarrow$ hiển thị ở phần bình luận (Comment) dưới công thức đó. Nếu `RecipeId IS NULL` $\rightarrow$ đưa vào hòm thư góp ý chung của website cho Admin xem.
   * **Bảng `ContestEntry`:** Chứa cả 2 cột `RecipeId` và `TipId` (cả hai đều cho phép `NULL`), đi kèm ràng buộc `CHECK` trong SQL Server: `(RecipeId IS NOT NULL AND TipId IS NULL) OR (RecipeId IS NULL AND TipId IS NOT NULL)` để đảm bảo mỗi bài dự thi trỏ chính xác tới 1 Công thức hoặc 1 Mẹo.
3. **Tích hợp Facebook (Comment, Ảnh/Video, Share, Vote) trong phạm vi đồ án:**
   * **Share:** Tích hợp nút Share sử dụng Facebook Share Dialog (`https://www.facebook.com/sharer/sharer.php?u=...`) kèm thẻ Open Graph meta tags để hiển thị đẹp mắt ảnh và tiêu đề món ăn khi chia sẻ lên Facebook.
   * **Comment kèm Ảnh/Video & Vote:** Xây dựng trực tiếp trên giao diện React lưu vào bảng `Feedback` (cột `MediaUrl`) và `ContestVote` để Admin dễ dàng kiểm soát dữ liệu trên SQL Server, hoặc tùy chọn nhúng thêm Facebook Comments Plugin dưới mỗi bài viết.
4. **Hệ thống Notification & Email tự động:**
   * Sử dụng dịch vụ `SmtpClient` / `MailKit` trong ASP.NET Core để gửi email tự động khi đăng ký thành công, khi sắp hết hạn gói Subscription ($10\text{ USD}$/tháng), hoặc khi có thông báo người thắng cuộc thi mới.

---

## 8. Kiến trúc Công nghệ & Phân chia Product Backlog (4 Thành viên)

* **Backend:** ASP.NET Core Web API (C#), Entity Framework Core, xác thực JWT (JSON Web Token) + BCrypt băm mật khẩu, tích hợp gửi mail SMTP.
* **Frontend:** ReactJS (Vite), TailwindCSS / Bootstrap, Axios gọi API, React Router phân quyền theo Role.
* **Database:** Microsoft SQL Server.

### Bảng phân chia công việc (Task Sheet cho 4 thành viên)

| Thành viên | Phân hệ phụ trách | Công việc Backend (ASP.NET Core) | Công việc Frontend (React) | Tài liệu Báo cáo (Project Report) |
| :--- | :--- | :--- | :--- | :--- |
| **Thành viên 1** *(Nhóm trưởng)* | **Tài khoản, Subscription ($10\text{ USD}$/$100\text{ USD}$) & Email/Notification** | - Thiết kế bảng `User`, `Subscription`, `Notification`.<br>- API Đăng ký, Đăng nhập (JWT), băm mật khẩu.<br>- API Thanh toán giả lập (Fake Payment) & Middleware kiểm tra hạn gói Sub.<br>- Dịch vụ gửi Email & Notification tự động. | - Trang Login / Register.<br>- Giao diện chọn gói Sub ($10\text{ USD}$/tháng, $100\text{ USD}$/năm) & cổng thanh toán.<br>- Trang sửa Hồ sơ cá nhân trực tiếp (Inline Edit).<br>- Chuông hiển thị Notification trên thanh Header. | - Định nghĩa bài toán & Đặc tả SRS.<br>- Kế hoạch dự án & Bảng phân công (Task Sheet).<br>- Phụ trách gửi 2 Email trạng thái (`STATUS:`). |
| **Thành viên 2** | **Công thức, Mẹo, Video & Talkshow/Liveshow** | - Thiết kế bảng `Category`, `Recipe`, `Tip`.<br>- API CRUD Công thức, Mẹo, Video, Talkshow/Liveshow.<br>- Logic phân quyền: Chỉ Admin gắn nhãn `Free`/`Member-only`; lọc kết quả tìm kiếm theo đúng vai trò. | - Danh sách & Bộ lọc tìm kiếm Công thức, Mẹo, Video, Talkshow/Liveshow.<br>- Trang chi tiết món ăn (trình phát Video, nguyên liệu, cách nấu).<br>- Trang quản lý bài đăng cho Thành viên và Admin. | - Thiết kế Sơ đồ thực thể liên kết (ERD).<br>- Tài liệu giải thích Thuật toán (Algorithm / Flowchart) cho các luồng chính. |
| **Thành viên 3** | **Sự kiện / Cuộc thi (Contest), Bình chọn (Vote) & Giải thưởng** | - Thiết kế bảng `Contest`, `ContestEntry`, `ContestVote`, `Announcement`.<br>- API Tạo/Xóa cuộc thi, nộp bài dự thi (cho cả Khách và Thành viên).<br>- API xử lý lượt **Vote** và công bố người thắng giải. | - Trang danh sách Sự kiện / Cuộc thi & Form gửi bài dự thi.<br>- Nút **Vote (Bình chọn)** thời gian thực trên các bài dự thi.<br>- Màn hình Admin chấm giải & Trang **Announcements**. | - Tài liệu Chuẩn giao diện (GUI Standards).<br>- Tài liệu Thiết kế giao diện (UI/Wireframe Design). |
| **Thành viên 4** | **Tương tác Mạng xã hội (FB Share, Media Comment), Trang chủ & FAQ** | - Thiết kế bảng `Feedback` (hỗ trợ đính kèm Ảnh/Video) và `FAQ`.<br>- API gửi Comment theo món ăn (kèm upload ảnh/video) và góp ý chung.<br>- API quản lý FAQ và thống kê lượt Share. | - Trang chủ giới thiệu James Thew & lịch sự kiện.<br>- Khu vực Bình luận (hiển thị Ảnh/Video thực hành của người dùng) & Nút **Share Facebook**.<br>- Trang 7 câu hỏi FAQ & Form Feedback chung. | - Mục lục, Chứng nhận hoàn thành.<br>- Báo cáo Review, Checklist Unit Test, Checklist cuối cùng & Form Feedback nộp bài. |

---

## 9. Nội dung 7 câu hỏi cố định tại trang FAQ (Đã đồng bộ quy tắc mới)

1. **Làm thế nào để trở thành thành viên của website James Thew?**  
   *Trả lời:* Bạn chỉ cần truy cập trang Đăng ký (Register), điền thông tin cá nhân, chọn gói thành viên theo tháng hoặc theo năm và hoàn tất bước thanh toán trực tuyến để kích hoạt tài khoản ngay lập tức.
2. **Có mất phí đăng ký thành viên không?**  
   *Trả lời:* Có. Website áp dụng mô hình thành viên trả phí (Subscription) với hai mức giá linh hoạt: **$10\text{ USD}$/tháng** hoặc gói tiết kiệm **$100\text{ USD}$/năm**.
3. **Xem công thức, video nấu ăn và mẹo vặt như thế nào? Có mất phí không?**  
   *Trả lời:* Khách truy cập tự do được xem miễn phí toàn bộ các bài viết, video và mẹo có gắn nhãn **Free**. Để mở khóa toàn bộ kho công thức độc quyền (**Member-only**), xem các buổi **Talkshow**, **Live show** và bài đóng góp từ cộng đồng, bạn cần đăng nhập bằng tài khoản Thành viên còn hạn.
4. **Tôi chưa phải là thành viên trả phí, tôi có tham gia cuộc thi (Contest) và bình chọn (Vote) được không?**  
   *Trả lời:* Hoàn toàn được! Mọi khán giả đại chúng đều có thể tham gia gửi công thức/mẹo dự thi (chỉ cần điền Họ tên và Email liên hệ khi nộp bài) cũng như tham gia bình chọn (Vote) và chia sẻ bài dự thi lên Facebook.
5. **Làm thế nào để đăng công thức và mẹo nấu ăn của tôi lên website?**  
   *Trả lời:* Sau khi đăng nhập với tư cách Thành viên, bạn vào mục "Quản lý bài viết cá nhân", chọn "Đăng công thức/mẹo mới" và điền đầy đủ Tên món, Danh sách nguyên liệu, Các bước nấu (kèm ảnh hoặc link video nếu có). Bạn có thể tự chỉnh sửa hoặc xóa bài của mình bất cứ lúc nào.
6. **Làm sao để gửi phản hồi (Feedback), bình luận hình ảnh món ăn hoặc chia sẻ lên mạng xã hội?**  
   *Trả lời:* Dưới mỗi công thức đều có khu vực Bình luận cho phép bạn gửi đánh giá kèm hình ảnh/video món ăn bạn đã làm thử, cùng nút **Share** để chia sẻ trực tiếp lên Facebook. Nếu muốn góp ý chung cho website, bạn hãy chọn mục **Feedback** trên thanh menu chính.
7. **Tôi đã gửi bài dự thi, làm sao để biết ai là người chiến thắng?**  
   *Trả lời:* Kết quả cuộc thi được đầu bếp James Thew đánh giá dựa trên chất lượng chuyên môn kết hợp với lượt bình chọn (Vote) từ cộng đồng. Người thắng giải sẽ được công bố công khai tại trang **Announcements** trên website, đồng thời hệ thống sẽ gửi **Notification** và **Email** thông báo trực tiếp đến bạn.

---

## 10. Phạm vi sản phẩm bàn giao & Quy chuẩn nộp bài (Deliverables)

* **Hồ sơ báo cáo (Project Report):** Chứng nhận hoàn thành, Mục lục, Định nghĩa bài toán, Đặc tả yêu cầu khách hàng (SRS này), Kế hoạch dự án, Sơ đồ E-R (ERD), Thuật toán, Tài liệu chuẩn GUI, Tài liệu thiết kế giao diện, Bảng công việc (Task Sheet), Báo cáo Review & Giám sát, Checklist Unit Test, Checklist cuối cùng.
* **Quy chuẩn mã nguồn (Coding Standards):** Mỗi khối mã trong ASP.NET và React phải có chú thích (comment) rõ ràng giải thích logic chương trình; thiết lập cơ chế sao lưu cơ sở dữ liệu hằng ngày.
* **Quy tắc liên lạc & Nộp bài qua Email:**
  * Gửi 2 email báo cáo trạng thái (cách nhau khoảng 10 ngày; hoặc ngày thứ 7–10 và trước khi kết thúc 3 ngày đối với dự án dưới 30 ngày) kèm tài liệu review.
  * Tiêu đề email bắt buộc bắt đầu bằng tiền tố: `STATUS:`, `DOUBT:` hoặc `PROJECT SUBMISSION:`.