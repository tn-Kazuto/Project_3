# SRS 00 – Core: James Thew Recipe & Contest Website

| Thuộc tính | Giá trị |
|---|---|
| Dự án | Project_3 – Aptech eProject "James Thew" |
| Phiên bản | 1.0 (Draft for review) |
| Vai trò tác giả | Senior Business Analyst |
| Tài liệu liên quan | 01-functional, 02-non-functional, 03-security, 04-performance, 05-ui-ux, 06-test-case-checklist |

## 1. Giới thiệu

### 1.1 Mục đích
Đặc tả yêu cầu cho website của đầu bếp James Thew: chia sẻ công thức/mẹo nấu ăn, bán thành viên (membership), tổ chức cuộc thi công thức/mẹo và công bố người thắng cuộc.

### 1.2 Phạm vi
**Trong phạm vi (In scope)**
- Trang công khai: Home, Free Recipes, Contests, Announcements, Feedback, FAQ, Login/Register.
- Khu vực thành viên (Member) và quản trị (Admin/Owner).
- Quản lý công thức, mẹo, cuộc thi, bài dự thi, thông báo, phản hồi, FAQ, gói thành viên.
- Thanh toán gói Monthly ($10) / Yearly ($100).

**Ngoài phạm vi (Out of scope – v1.0)**
- Ứng dụng mobile native, livestream/video, quản lý lớp học offline.
- Đa ngôn ngữ (chỉ tiếng Anh cho giao diện; có thể mở rộng).
- Tích hợp mạng xã hội, hệ thống bình luận lồng nhau.

### 1.3 Thuật ngữ
| Thuật ngữ | Định nghĩa |
|---|---|
| Guest | Người truy cập chưa đăng nhập |
| Member | Người dùng đã đăng ký và có gói thành viên còn hiệu lực |
| Admin / Owner | James Thew – quản trị toàn bộ nội dung |
| Free content | Recipe/Tip do Admin đánh dấu `Free` – Guest xem được |
| Members-only | Recipe/Tip chỉ Member/Admin xem được |
| Submission | Bài dự thi (recipe hoặc tip) gửi cho một Contest |
| Subscription | Gói thành viên Monthly hoặc Yearly |

## 2. Các tác nhân (Actors)

| Actor | Mô tả | Quyền chính |
|---|---|---|
| Guest | Chưa đăng nhập | Xem nội dung Free, gửi feedback, xem FAQ/Announcements, đăng ký, tham gia contest (xem OQ-01) |
| Member | Đã đăng nhập, gói còn hạn | Toàn bộ recipe/tip, gửi recipe/tip, feedback, tham gia contest, sửa profile |
| Admin | James Thew | CRUD recipe/tip, tạo/xóa contest, xem bài dự thi, công bố thắng cuộc, xem feedback, quản lý FAQ |

## 3. Quyết định thiết kế & Giả định

| ID | Giả định / Quyết định |
|---|---|
| A-01 | Thanh toán dùng cổng **sandbox/giả lập** trong phạm vi eProject; kiến trúc cho phép thay bằng cổng thật (Stripe/PayPal). |
| A-02 | Member hết hạn gói → chuyển về quyền Guest-with-account (chỉ xem Free), vẫn đăng nhập được để gia hạn. |
| A-03 | Chỉ có **một** Admin (seed bởi `DbInitializer`). |
| A-04 | Recipe/Tip Member gửi ngoài contest hiển thị cho Member khác ngay sau khi đăng; Admin có quyền gỡ nếu vi phạm. |
| A-05 | "Price" trong brief được hiểu là **Prize** (giải thưởng). |
| A-06 | Tiền tệ USD; giá gói cấu hình được, mặc định $10 / $100. |

## 4. Quyết định Thống nhất Điểm mở (Resolved Open Questions - Senior BA Consensus)

Dưới sự thống nhất giữa Senior BA, Solution Architect và căn cứ nguyên bản `docs/dềbài.md`, toàn bộ 8 điểm mở đã được quyết định dứt điểm:

| ID | Vấn đề Đề xuất | Quyết định Nghiệp vụ Thống nhất (Final Decision) | Căn cứ Đối chiếu |
|---|---|---|---|
| **OQ-01** | Guest có được tham gia cuộc thi nấu ăn không? | **CHỐT: CÓ.** Khách vãng lai được nộp bài dự thi (Recipe/Tip) bình đẳng với Member mà không cần tài khoản. Bảng `ContestEntry` lưu trường `UserId` nullable, kèm `GuestName` và `GuestEmail` để trao giải. | Khớp Mục 6 và Câu hỏi FAQ số 4 của `docs/dềbài.md`. |
| **OQ-02** | Có kiểm duyệt (moderation) bài Member đăng trước khi hiển thị không? | **CHỐT: HIỂN THỊ NGAY (Post-moderation).** Bài viết của Member xuất hiện ngay cho các thành viên khác học tập; Admin có toàn quyền kiểm duyệt và gỡ bỏ nếu vi phạm tiêu chuẩn 5 sao. | Khớp BR-04 và SRS v2.0. |
| **OQ-03** | Giới hạn số bài gửi cho một cuộc thi? | **CHỐT: TỐI ĐA 3 BÀI/NGƯỜI DÙNG.** Đồng thời kích hoạt cơ chế bình chọn cộng đồng (**Community Vote**) có kiểm tra chống spam IP/Email. | Nâng cấp SRS v2.0 (`ContestVote`). |
| **OQ-04** | Tiêu chí chấm và số lượng Quán quân? | **CHỐT: ADMIN CHỌN 1–3 NGƯỜI THẮNG.** Admin tham khảo lượt Vote từ cộng đồng để chấm giải, sau đó công bố lên trang `Announcements` và hệ thống tự động bắn Email. | Khớp Mục 3 và Mục 4 của `docs/dềbài.md`. |
| **OQ-05** | Phản hồi của Guest: có cần Email không? | **CHỐT: CẦN NAME VÀ EMAIL.** Bắt buộc nhập Tên và Email để xác minh và phản hồi; hỗ trợ đính kèm `MediaUrl` (ảnh/video thực hành món ăn) và chấm điểm `Rating` 1-5 sao. | Khớp Module FBK và Rule 6 (`rules.md`). |
| **OQ-06** | Hoàn tiền và gia hạn gói thành viên? | **CHỐT: KHÔNG HOÀN TIỀN.** Khi hết hạn, tài khoản tự động hạ cấp về trạng thái `GUEST` (chỉ xem bài Free); thành viên có thể bấm gia hạn ($10/$100) ngay trên trang Profile. | Khớp BR-02 và A-02. |
| **OQ-07** | Xem công thức và mẹo của các khách hàng khác? | **CHỐT: CHỈ DÀNH CHO MEMBER VÀ ADMIN.** Khách vãng lai chỉ được xem bài có nhãn `IsFree = true`. Thành viên được xem toàn bộ bài đóng góp của nhau. | Khớp Rule 3 và BR-03. |
| **OQ-08** | Danh sách 7 câu hỏi FAQ có cố định không? | **CHỐT: 7 CÂU HỎI TIẾNG ANH BẮT BUỘC THEO ĐỀ BÀI.** Được nạp sẵn cố định qua `DbInitializer` khi khởi chạy hệ thống; Admin có quyền bổ sung thêm. | Khớp Mục 7 của `docs/dềbài.md` và Rule 8. |

## 5. Kiến trúc tổng quan

```
React SPA (public / member / admin pages, context, services, hooks)
        │  HTTPS / JSON (JWT Bearer)
ASP.NET Core Web API
  Controllers → Services → Repositories → EF Core → SQL Server
  DTOs · Entities · Middlewares (exception, logging, rate limit) · DbInitializer
```

Cấu trúc thư mục: `backend/` · `frontend/` · `plans/` · `tests/backend.tests` (xUnit/NUnit) · `tests/frontend.tests` (Jest/Vitest).

## 6. Mô hình dữ liệu (10 bảng)

| # | Entity | Trường chính | Quan hệ |
|---|---|---|---|
| 1 | User | Id, FullName, Email (unique), PasswordHash, Role (Admin/Member), Phone, Bio, AvatarUrl, IsActive, CreatedAt | 1–N Subscription, Recipe, Tip, Feedback, Submission |
| 2 | Subscription | Id, UserId, Plan (Monthly/Yearly), Amount, StartDate, EndDate, PaymentRef, Status (Pending/Active/Expired/Failed) | N–1 User |
| 3 | Category | Id, Name (Juices, Vegetarian, Non-veg, Italian…), Description | 1–N Recipe |
| 4 | Recipe | Id, Title, Description, Ingredients, Procedure, ImageUrl, CategoryId, AuthorId, IsFree, Status, CreatedAt, UpdatedAt | N–1 Category, User; 1–N Feedback |
| 5 | Tip | Id, Title, Content, AuthorId, IsFree, CreatedAt, UpdatedAt | N–1 User |
| 6 | Contest | Id, Title, Description, Type (Recipe/Tip), Prize, StartDate, EndDate, Status (Open/Closed/Announced), CreatedBy | 1–N Submission |
| 7 | ContestSubmission | Id, ContestId, UserId (nullable cho Guest), GuestName, GuestEmail, Title, Content, Ingredients, Procedure, IsWinner, Rank, AdminComment, CreatedAt | N–1 Contest |
| 8 | Announcement | Id, ContestId, Title, Content, WinnerSubmissionIds, PublishedAt | N–1 Contest |
| 9 | Feedback | Id, RecipeId (nullable), UserId (nullable), Name, Email, Rating (1–5), Message, CreatedAt | N–1 Recipe |
| 10 | Faq | Id, Question, Answer, DisplayOrder | – |

Seed bởi `DbInitializer`: 1 Admin, danh mục mặc định, 7 FAQ.

## 7. Quy tắc nghiệp vụ (Business Rules)

| ID | Quy tắc |
|---|---|
| BR-01 | Đăng ký tài khoản chỉ hoàn tất (Active) khi thanh toán gói thành công. |
| BR-02 | Gói Monthly = 30 ngày, Yearly = 365 ngày, tính từ ngày thanh toán thành công; gia hạn cộng dồn vào EndDate hiện tại. |
| BR-03 | Guest chỉ xem Recipe/Tip có `IsFree = true`. |
| BR-04 | Chỉ Admin được đặt `IsFree` cho nội dung của mình; nội dung do Member gửi mặc định `Members-only`. |
| BR-05 | Chỉ chủ sở hữu (hoặc Admin) được sửa/xóa recipe/tip của mình. |
| BR-06 | Contest chỉ nhận bài khi `Status = Open` và trong khoảng StartDate–EndDate. |
| BR-07 | Contest chỉ chuyển `Announced` khi Admin đã chọn người thắng; sau đó không nhận bài và không sửa người thắng (trừ khi hủy công bố). |
| BR-08 | Loại bài dự thi phải khớp `Contest.Type` (Recipe cần Ingredients + Procedure; Tip chỉ cần Content). |
| BR-09 | Email là duy nhất; không phân biệt hoa thường. |
| BR-10 | Xóa Contest đã có Submission → xóa mềm (soft delete), giữ lịch sử Announcement. |
| BR-11 | Rating feedback từ 1–5, nội dung tối đa 1000 ký tự. |
