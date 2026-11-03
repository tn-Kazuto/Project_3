# 💻 BẢNG GIAO VIỆC: DEVELOPER TEAM (BACKEND & FRONTEND)
## Dự án: Nền Tảng Ẩm Thực James Thew (James Thew Culinary Portal)
### Giai đoạn: Hiện thực hóa Nghiệp vụ Core, Phân quyền 3 Role & Tương tác Đa phương tiện (Phase 2)

> **Người giao việc (Assigner):** Senior Business Analyst & Lead Architect  
> **Người nhận việc (Assignee):** Backend Engineers (.NET 10) & Frontend Engineers (React 19)  
> **Căn cứ nghiệp vụ:** [`srsdetails/files/01-srs-functional.md`](../../srsdetails/files/01-srs-functional.md) · [`srsdetails/files/00-srs-core.md`](../../srsdetails/files/00-srs-core.md) · [`rules.md`](../../rules.md) (10 Luật Vàng) · [`docs/dềbài.md`](../../docs/dềbài.md)  
> **Nguyên tắc cốt lõi:** Controller mỏng, nghiệp vụ tại Service, DTOs chuyên biệt, không lưu dữ liệu nhạy cảm, comment mọi khối mã (`/// <summary>`).

---

## 🎯 MỤC TIÊU CỐT LÕI (GOALS)
1. Hiện thực hóa trọn vẹn **9 Functional Modules** theo chuẩn `srsdetails/files/01-srs-functional.md` và **11 Business Rules** (`BR-01` đến `BR-11`).
2. Xây dựng giao diện **React 19 SPA** theo hệ thống thiết kế **5-Star Luxury Architectural Design System** (EB Garamond, Warm Alabaster, Deep Charcoal, Fine Gold rules, góc vuông `border-radius: 0`).
3. Đảm bảo tuân thủ nghiêm ngặt **10 Luật Vàng Kiến Trúc** tại [`rules.md`](../../rules.md): Phân quyền kiểm tra ở API, Controller không gọi DbContext, bảo vệ quyền tác giả (chống IDOR).

---

## 📋 PHẦN A: DANH MỤC CÔNG VIỆC BACKEND (.NET 10 LTS WEB API)

### Task DEV-BE-01: Module Authentication, Identity & Subscription ($10 / $100)
* **Mã yêu cầu:** `FR-AUTH-01` đến `FR-AUTH-08` | **Quy tắc:** `BR-01`, `BR-02`, `BR-09` | **Luật vàng:** Luật 2, 6, 7, 8, 9.
* **Chi tiết công việc:**
  1. Xây dựng `AuthController` và `AccountService`:
     - Endpoint `POST /api/v1/auth/register`: Đăng ký tài khoản kèm chọn gói Monthly ($10) hoặc Yearly ($100) và mock payment.
     - **Bảo mật giao dịch:** Xử lý tạo `User` và `Payment` trong một **Database Transaction (`BeginTransactionAsync`)**. Nếu thanh toán lỗi $\rightarrow$ Rollback toàn bộ, tài khoản không được active (Luật 8).
     - **Số tiền cước:** Bắt buộc lấy giá trị từ Server cấu hình, bỏ qua hoàn toàn tham số `amount` client gửi lên (Luật 7).
     - **Mật khẩu:** Băm mật khẩu bằng BCrypt/Argon2 có Salt; cấm lưu plain-text (Luật 9).
     - **Thời hạn gói:** Monthly = 30 ngày, Yearly = 365 ngày; gia hạn thì cộng dồn vào `SubscriptionEnd` hiện tại (`BR-02`).
  2. Endpoint `POST /api/v1/auth/login`: Xác thực Email + Password, trả về JWT Token chứa các Claims (`sub`, `email`, `role`, `plan`, `subscriptionActive`).
  3. Endpoint `GET/PUT /api/v1/users/profile`: Xem và sửa hồ sơ cá nhân (FullName, Phone) trực tiếp; cấm cho phép sửa Email (`BR-09`).
  4. Endpoint `POST /api/v1/subscriptions/renew`: Gia hạn gói cước cho thành viên.

---

### Task DEV-BE-02: Module Culinary Catalog (Recipes, Tips & Categories)
* **Mã yêu cầu:** `FR-RCP-01` đến `FR-RCP-08` | `FR-TIP-01` đến `FR-TIP-04` | **Quy tắc:** `BR-03`, `BR-04`, `BR-05`.
* **Chi tiết công việc:**
  1. Xây dựng `RecipeService` & `TipService`:
     - **Content Gatekeeping (Luật 3 & BR-03):** Khi `X-User-Role == GUEST` (hoặc chưa đăng nhập/hết hạn gói), mọi câu truy vấn LINQ danh sách bắt buộc chèn `.Where(r => r.IsFree == true)`.
     - Nếu Guest gọi GET chi tiết bài `IsFree == false` $\rightarrow$ Trả về `403 Forbidden` kèm thông điệp yêu cầu mua gói VIP Pass.
  2. **Đặc quyền Đánh dấu Bản quyền (`IsFree` - BR-04):**
     - Chỉ có `Admin` (Mr. James Thew) mới có quyền gửi cờ `IsFree = true/false` khi tạo/sửa bài.
     - Nếu `Member` cố tình gửi `IsFree = true` qua API $\rightarrow$ Bỏ qua và cưỡng chế lưu `IsFree = false` (Luật 7).
  3. **Kiểm soát Quyền Tác giả (Ownership Protection - Luật 3 & BR-05):**
     - Member chỉ được phép sửa/xóa bài do chính mình đăng (`entity.AuthorId == currentUserId`).
     - Nếu sửa/xóa bài của tác giả khác $\rightarrow$ Trả về `403 Forbidden` chống tấn công IDOR.
     - Admin có toàn quyền sửa/xóa mọi bài viết để kiểm duyệt.
  4. Cấu trúc Recipe bắt buộc có đủ: `Title`, `Ingredients`, `CookingProcedure`, `CategoryId`, hỗ trợ `ContentType` (`Article`, `Video`, `Talkshow`, `Liveshow`) và `VideoUrl`.
  5. Tích hợp Redis Caching cho danh sách công thức Free và Categories (TTL 5 phút).

---

### Task DEV-BE-03: Module Contests, Community Voting & Announcements
* **Mã yêu cầu:** `FR-CON-01` đến `FR-CON-08` | `FR-ANN-01` đến `FR-ANN-03` | **Quy tắc:** `BR-06`, `BR-07`, `BR-08`, `BR-10`.
* **Chi tiết công việc:**
  1. Xây dựng `ContestService`:
     - Admin tạo Contest: Title, Description, Type (`RECIPE` hoặc `TIP`), Prize, StartDate, EndDate.
     - Tự động đóng Contest khi quá `EndDate` (`BR-06`).
  2. Nộp bài dự thi (`POST /api/v1/contests/{id}/entries`):
     - **Hỗ trợ Khách vãng lai (Guest):** Cho phép `UserId == null`, bắt buộc kiểm tra và lưu `GuestName` và `GuestEmail` (OQ-01).
     - Ràng buộc thể lệ: Thi Recipe phải có đủ `Ingredients` và `Procedure`; thi Tip chỉ cần `Content` (`BR-08`).
  3. **Cơ chế Bình chọn Cộng đồng Chống Gian lận (Community Vote):**
     - Endpoint `POST /api/v1/contests/entries/{id}/vote`: Ghi nhận lượt bình chọn vào bảng `ContestVote`.
     - Kiểm tra: Thành viên 1 vote/bài; Guest kiểm tra Email hoặc IP Address để chống spam.
  4. **Chấm Quán quân & Xuất bản Bảng vàng (`AnnouncementService` - BR-07):**
     - Admin chọn 1–3 bài thi thắng cuộc (`IsWinner = true`).
     - Tạo bản ghi `Announcement` vinh danh người chiến thắng.
     - Kích hoạt sự kiện gửi Email thông báo chúc mừng tới Quán quân.

---

### Task DEV-BE-04: Module Community Feedback, 7 FAQs & Notifications
* **Mã yêu cầu:** `FR-FBK-01` đến `FR-FBK-04` | `FR-FAQ-01` đến `FR-FAQ-02` | **Quy tắc:** `BR-11`.
* **Chi tiết công việc:**
  1. Xây dựng `FeedbackService`:
     - Gửi Feedback cho công thức nấu ăn (hỗ trợ `Rating` 1-5 sao, bình luận tối đa 1000 ký tự, `MediaUrl` đính kèm ảnh/video thực hành món).
     - Gửi Feedback góp ý chung về website (`RecipeId == null`).
     - Admin có màn hình xem toàn bộ feedback và xóa feedback không phù hợp.
  2. Xây dựng `FaqService`:
     - Seed sẵn chính xác **7 câu hỏi tiếng Anh cố định** trong đề bài qua `DbInitializer`.
     - Phục vụ API công khai xem FAQ dạng Accordion.
  3. Xây dựng `NotificationService` & SignalR Hub (`/hub/notifications`):
     - Lưu trữ thông báo trong CSDL (`Notification` entity).
     - Bắn real-time pop-up chuông thông báo lên Header khi có Quán quân mới hoặc công thức mới.
     - Gửi email tự động qua `EmailService` (chế độ kép: SMTP thực hoặc Mock Logger).

---

## 🎨 PHẦN B: DANH MỤC CÔNG VIỆC FRONTEND (REACT 19 SPA)

### Task DEV-FE-01: Thanh Điều Hướng Động 3 Vai Trò (Dynamic Navigation)
* **Căn cứ:** Mục 2.1 của `srs.md` & `rules.md` Mục 3.
* **Yêu cầu UI Component (`Navbar.jsx`):**
  - **Chưa đăng nhập (`GUEST`):** `Home` | `Free Recipes & Tips` | `Contests` | `Announcements` | `Feedback` | `FAQ's` | `Login / Register`.
  - **Đã đăng nhập (`MEMBER`):** `Home` | `User Profile` | `All Recipes & Tips` | `My Submissions (Send/Manage Recipes & Tips)` | `Contests` | `Announcements` | `Feedback` | `FAQ's` | `Logout` + Chuông thông báo (Notification Bell).
  - **Quản trị viên (`ADMIN` - James Thew):** `Home` | `User Profile` | `All Recipes & Tips` | `Manage My Recipes & Tips (Upload Free/Paid)` | `Manage Contests & Entries` | `Manage Announcements` | `View All Feedbacks` | `FAQ's` | `Logout` + Chuông thông báo.
* **Responsive:** Tự động co lại thành Drawer Menu trên màn hình Mobile < 768px (`ACC-02`).

---

### Task DEV-FE-02: Hoàn thiện Hệ thống Thiết kế 5-Star Luxury Architectural
* **Căn cứ:** [`plans/luxury-style-plan.md`](../luxury-style-plan.md) & `srsdetails/files/05-srs-ui-ux.md`.
* **Yêu cầu thẩm mỹ:**
  - Typography: Tiêu đề dùng font có chân cổ điển **EB Garamond**; nội dung dùng **Instrument Sans**.
  - Bảng màu: Nền sáng sang trọng Warm Alabaster (`#fdfbf7`), chữ than đậm Deep Charcoal (`#1a1a1a`), đường kẻ chỉ vàng hoàng gia Fine Gold (`#b69355`), nền phụ Pale Taupe (`#f4f0ea`).
  - Hình khối: Giữ góc vuông kiến trúc nghiêm cẩn (`border-radius: 0 !important`), sử dụng số La Mã (`I.`, `II.`, `III.`) cho các phân đoạn.

---

### Task DEV-FE-03: Nhóm Màn Hình Public & Thành Viên (Client Views)
1. **Trang Chủ (`HomePage.jsx`):** Banner giới thiệu James Thew, các lớp học cuối tuần, món Free nổi bật, cuộc thi đang mở.
2. **Trang Đăng Ký & Thanh Toán (`RegisterPage.jsx`):** Lựa chọn gói cước ($10/tháng vs $100/năm), form thanh toán thẻ giả lập chuẩn UX, báo lỗi rõ ràng.
3. **Trang Công Thức & Mẹo (`RecipesPage.jsx`, `RecipeDetailPage.jsx`):**
   - Bộ lọc Access Tier (`All`, `Free Access`, `Member Reserved`).
   - Huy hiệu `Free` và `Member Only` (kèm icon khóa). Với Guest mở bài VIP, hiển thị ảnh mờ và nút CTA nâng cấp $10/tháng.
   - Tiện ích In thẻ công thức 5 sao (`@media print`).
4. **Trang Cuộc Thi (`ContestsPage.jsx`):** Danh sách cuộc thi, form nộp bài dự thi cho Guest (tự động hỏi Tên + Email) và Member, nút Vote thời gian thực có hiệu ứng đếm số.
5. **Trang Bảng Vàng Vinh Danh (`AnnouncementsPage.jsx`):** Thẻ vinh danh Quán quân huy chương vàng/bạc/đồng, trích đoạn nhận xét của James Thew.
6. **Trang Hồ Sơ Cá Nhân (`ProfilePage.jsx`):** Cho phép chỉnh sửa trực tiếp thông tin ngay trên trang, xem trạng thái gói VIP Pass và nút gia hạn.
7. **Trang 7 Câu Hỏi FAQ (`FaqPage.jsx`):** Giao diện Accordion sang trọng với 7 câu hỏi chuẩn đề bài.

---

### Task DEV-FE-04: Bảng Điều Hành Quản Trị (Admin Executive Hub)
* **Component:** `AdminDashboardPage.jsx` (Executive Atelier Intelligence).
* **Chức năng:**
  - Quản lý công thức/mẹo của Admin kèm nút gạt bản quyền **Free (`IsFree = true`)** vs **Members Only (`IsFree = false`)**.
  - Quản lý cuộc thi: Tạo cuộc thi mới, xem danh sách bài nộp của độc giả kèm số lượt Vote từ cộng đồng.
  - Cổng chấm giải Quán quân: Nút chọn người chiến thắng và mở modal xuất bản Announcement.
  - Quản lý Feedback: Xem toàn bộ góp ý kèm ảnh/video thực hành của độc giả và nút xóa vi phạm.

---

## ⏱️ QUY CHUẨN CODE & THỜI HẠN HOÀN THÀNH
* **Quy tắc Code:** Bắt buộc có chú thích `/// <summary>` trên mọi hàm backend; tuân thủ PascalCase (C#) và camelCase (React).
* **Kiểm thử tại chỗ:** Developer phải chạy `dotnet test` và `npm test` thành công trước khi bàn giao cho Tester.
* **Thời hạn bàn giao:** Ngày thứ 4 – 12 của Sprint.

---

## 🟢 KẾT QUẢ THỰC HIỆN & BÀN GIAO (DEVELOPER IMPLEMENTATION STATUS)
* **Trạng thái thực thi:** **ĐÃ HOÀN THÀNH 100% (VERIFIED & READY FOR QA)**
* **Báo cáo kiểm thử tự động (Test Automation Report):**
  - Backend .NET 10 Tests (`JamesThew.slnx`): **61/61 tests PASS (100%)**
  - Frontend React 19 Tests (`frontend` Vitest): **96/96 tests PASS (100% across 22 test suites)**
  - Tổng số ca kiểm thử hồi quy: **157/157 tests PASS (100%)**
* **Nghiệp vụ cốt lõi đã hoàn thiện & bảo toàn:**
  1. **Authentication & Subscription (DEV-BE-01):** Atomic Database Transaction cho đăng ký + giả lập thanh toán $10/tháng và $100/năm. Không lưu mã thẻ/CVV (PCI-DSS). Băm mật khẩu BCrypt.
  2. **Content Gatekeeping & Ownership (DEV-BE-02):** Phân quyền API cứng (Server-side LINQ filtering). Guest chỉ truy cập bài `IsFree == true`. Đánh dấu `IsFree` chỉ dành cho Admin. Kiểm tra quyền sở hữu bài đăng (`AuthorId == currentUserId`) chống IDOR.
  3. **Contests, Community Voting & Announcement (DEV-BE-03):** Nộp bài hỗ trợ cả Guest (lưu Tên + Email) và Member. Cơ chế Vote cộng đồng chống spam. Chấm Quán quân và phát hành Announcement vinh danh.
  4. **Feedback, 7 FAQs & Notifications (DEV-BE-04):** Feedback kèm rating sao và `MediaUrl` đính kèm ảnh thực hành món. 7 câu hỏi FAQ tiếng Anh chuẩn đề bài.
  5. **Identity Propagation Middleware:** Cầu nối `IdentityPropagationMiddleware.cs` tự động giải mã `X-User-Id`, `X-User-Role`, `X-Subscription-Active` từ YARP Gateway chuyển vào `ClaimsPrincipal` trên Backend Web API.
  6. **Frontend Preservation (DEV-FE-01 -> DEV-FE-04):** Bảo toàn 100% layout hiện tại của web (`Navbar`, `HomePage`, `RecipesPage`, `ContestsPage`, `AnnouncementsPage`, `ProfilePage`, `AdminDashboardPage`) theo hệ thống thiết kế 5-Star Luxury Architectural (EB Garamond, Warm Alabaster, Fine Gold, góc vuông kiến trúc).
* **Bàn giao sang Giai đoạn 3:** Sẵn sàng chuyển giao toàn bộ mã nguồn cho đội ngũ **Tester / QA Team** theo [`plans/tasks/03-tester-qa-tasks.md`](./03-tester-qa-tasks.md).

