# 🍳 James Thew - Culinary Website & Cooking Contests Platform

> **eProject Sem 3 - Modern Full-Stack Culinary Web Application**  
> Built strictly according to the **[Software Requirements Specification (srs.md)](./srs.md)** and **[Spec-Driven Development Standards (rules.md)](./rules.md)**.

[![Backend Tests](https://img.shields.io/badge/.NET%2010%20xUnit%20Tests-45%2F45%20PASS-brightgreen)](#)
[![Frontend Tests](https://img.shields.io/badge/Vitest%20Component%20Tests-84%2F84%20PASS-brightgreen)](#)
[![Total Test Coverage](https://img.shields.io/badge/Total%20Automated%20Tests-129%2F129%20PASS%20100%25-success)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-ASP.NET%20Core%2010%20%7C%20React%2019%20%7C%20SQL%20Server-blue)](#)
[![Design System](https://img.shields.io/badge/Design%20System-5--Star%20Luxury%20Architectural-gold)](#)

---

## 📖 1. Giới Thiệu Dự Án (Project Overview)

Website được xây dựng cho **Mr. James Thew** – Bếp trưởng điều hành (Executive Chef) tại khách sạn 5 sao danh tiếng, tác giả của nhiều cuốn sách dạy nấu ăn bán chạy hàng đầu (các chủ đề: *Juices*, *Vegetarian*, *Non-Vegetarian*, *Italian*), đồng thời là người dẫn chương trình các gameshow ẩm thực và các lớp học nấu ăn thực tế vào cuối tuần.

Nền tảng đáp ứng trọn vẹn 3 nhóm đối tượng theo SRS:
1. **Admin (Mr. James Thew):** Quản trị toàn bộ hệ thống, xuất bản công thức/mẹo ẩm thực độc quyền, điều chỉnh nhãn Free vs Members-Only, tổ chức và chấm giải các cuộc thi nấu ăn (`Contests`), công bố người thắng cuộc (`Announcements`), theo dõi góp ý (`Feedbacks`).
2. **Registered Member (Thành viên trả phí):** Người dùng đăng ký bắt buộc chọn gói thuê bao (**$10/tháng** hoặc **$100/năm**) và mô phỏng thanh toán trực tuyến. Được toàn quyền truy cập 100% công thức và mẹo cao cấp, đăng tải và quản lý công thức cá nhân, nộp bài dự thi cuộc thi ẩm thực, và gửi đánh giá.
3. **General User / Guest (Khách vãng lai):** Được xem các công thức & mẹo ẩm thực miễn phí (`IsFree = true`). Được tự do tham gia các cuộc thi nấu ăn (`Contests`) mà **không cần tạo tài khoản** (hệ thống tự động lưu Họ tên và Email để liên hệ trao giải).

---

## 🛠️ 2. Kiến Trúc & Công Nghệ (Technology Stack)

### **Backend (.NET 10 Web API)**
- **Framework:** ASP.NET Core Web API (.NET 10 LTS - `net10.0`)
- **ORM:** Entity Framework Core 10.0.14 (Code-First)
- **Database:** Microsoft SQL Server (Hỗ trợ In-Memory Database cho Integration Tests)
- **Security & Auth:** JWT Bearer Authentication, BCrypt Password Hashing, Claim-based Role Authorization
- **Design Pattern:** Repository Pattern, Generic Repository, Unit of Work (với Relational Database Transaction Support)
- **API Documentation:** Swagger / OpenAPI (Swashbuckle 10)
- **Automated Testing:** xUnit, `Microsoft.AspNetCore.Mvc.Testing`, `Microsoft.EntityFrameworkCore.InMemory`

### **Frontend (React 19 SPA)**
- **Framework:** React 19 + Vite 8
- **Routing:** React Router Dom v7 (với `ProtectedRoute` hỗ trợ phân quyền `ADMIN` và `MEMBER`)
- **UI Framework & Styling:** Bootstrap 5.3 + Custom Culinary Theme CSS
- **Iconography:** Lucide React
- **API Client:** Axios (với JWT Interceptor đính kèm Token tự động)
- **Automated Testing:** Vitest 5, `@testing-library/react`, `@testing-library/dom`, `jsdom`

---

## 🗄️ 3. Mô Hình Thực Thể Cơ Sở Dữ Liệu (10 Entities)

1. `User`: Tài khoản người dùng (UserId, Username, PasswordHash, FullName, Email, Phone, Role [ADMIN/MEMBER], SubscriptionPlan [MONTHLY/ANNUAL], SubscriptionStart, SubscriptionEnd, IsSubscriptionActive).
2. `Payment`: Lịch sử giao dịch thanh toán thuê bao (PaymentId, UserId, Amount [$10 hoặc $100], PlanType, CardLast4, Status, PaidAt).
3. `Category`: Danh mục ẩm thực (CategoryId, CategoryName [Juices, Vegetarian, Non-Vegetarian, Italian], Description).
4. `Recipe`: Công thức món ăn (RecipeId, AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, CreatedAt).
5. `Tip`: Mẹo làm bếp (TipId, AuthorId, CategoryId, Title, Content, IsFree, CreatedAt).
6. `Contest`: Cuộc thi ẩm thực (ContestId, Title, Description, ContestType [RECIPE/TIP], StartDate, EndDate, IsActive, CreatedBy).
7. `ContestEntry`: Bài dự thi (EntryId, ContestId, UserId [null nếu là Guest], GuestName, GuestEmail, Title, Ingredients, CookingProcedure, TipContent, SubmittedAt, IsWinner).
8. `Announcement`: Thông báo kết quả và tin tức (AnnouncementId, ContestId, WinnerEntryId, Title, Content, PublishedAt, AuthorId).
9. `Feedback`: Đánh giá món ăn & Góp ý website (FeedbackId, RecipeId [null nếu góp ý chung], UserId [null nếu là Guest], SenderName, SenderEmail, Comment, CreatedAt).
10. `Faq`: Danh sách 7 câu hỏi thường gặp cố định theo đúng SRS (FaqId, Question, Answer, DisplayOrder).

---

## 🔑 4. Tài Khoản Mặc Định & Dữ Liệu Khởi Tạo (Seeded Data)

Khi backend khởi động lần đầu, `DbInitializer.cs` sẽ tự động seed dữ liệu mẫu:

| Loại tài khoản | Username | Mật khẩu | Quyền (Role) | Gói cước |
|---|---|---|---|---|
| **Admin (Mr. James Thew)** | `james` hoặc `james@jamesthew.com` | `Admin@123456` | `ADMIN` | Vĩnh viễn (Chef Executive) |
| **Thành viên mẫu 1** | `member_monthly` | `Member@123` | `MEMBER` | Monthly ($10/tháng) |
| **Thành viên mẫu 2** | `member_annual` | `Member@123` | `MEMBER` | Annual ($100/năm) |

- **4 Danh mục chuẩn:** `Juices`, `Vegetarian`, `Non-Vegetarian`, `Italian`.
- **7 Câu hỏi FAQ bắt buộc:** Đã seed chính xác từng câu hỏi & trả lời theo quy định SRS Section 2.2.B.2.

---

## 🚀 5. Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### **Yêu cầu hệ thống:**
- .NET 10 SDK trở lên
- Node.js 18+ & npm
- SQL Server LocalDB hoặc SQL Server Standard/Developer Edition

### **Bước 1: Chạy Backend**
```powershell
cd e:\project\Project_3\backend
dotnet restore
dotnet run
```
- Backend API sẽ khởi chạy tại: `http://localhost:5000` (hoặc `https://localhost:5001`)
- Swagger UI tài liệu API: `http://localhost:5000/swagger`

### **Bước 2: Chạy Frontend**
```powershell
cd e:\project\Project_3\frontend
npm install
npm run dev
```
- Frontend ứng dụng web sẽ khởi chạy tại: `http://localhost:5173`

---

## 🧪 6. Kiểm Thử Tự Động Toàn Diện (Automated Testing - 129 Tests 100% PASS)

Dự án tuân thủ nghiêm ngặt phương pháp **Spec-Driven Development** và **Test-Driven Development (TDD)** với **129/129 Test Cases vượt qua thành công (100% Pass Rate)**:

### **Kiểm thử Backend (xUnit): 45/45 Tests PASS ✓**
```powershell
dotnet test tests/backend.tests/backend.tests.csproj
```
- `Phase1Tests.cs` (13 tests): Đăng ký gói $10/$100 kèm thanh toán mock, Gia hạn gói (`subscription/renew`), Đăng nhập, Profile, Đổi mật khẩu.
- `Phase2Tests.cs` (13 tests): Quản lý công thức & mẹo bếp, Content Gatekeeping (`IsFree`), Lọc theo `isFreeOnly`, Phân quyền tác giả.
- `Phase3Tests.cs` (12 tests): Cuộc thi ẩm thực, Bài dự thi của Guest & Member, Chấm giải Winner, Tự động xuất bản Announcement vinh danh.
- `Phase4Tests.cs` (7 tests): Góp ý món ăn, Góp ý website, Xóa feedback cho Admin (`DELETE /api/feedbacks/{id}`), 7 câu hỏi FAQ chuẩn SRS.

### **Kiểm thử Frontend (Vitest): 84/84 Tests PASS trên 18 Test Files ✓**
```powershell
cd frontend
npm test -- --run
```
- **Hệ thống Kiểm thử Chức năng Nâng cao (Functional Phases F1 - F5):**
  - `FunctionalPhaseF1.test.jsx` (4 tests): Profile VIP Member Pass, Modal gia hạn/nâng cấp gói cước (`RenewSubscription`).
  - `FunctionalPhaseF2.test.jsx` (4 tests): Bộ lọc Access Tier (`All`, `Free Access`, `Member Reserved`), Tiện ích Print Culinary Card chuẩn `@media print`.
  - `FunctionalPhaseF3.test.jsx` (4 tests): Form nộp bài thi cho Guest (tự động yêu cầu tên/email) và Member, Cổng chấm giải Quán quân.
  - `FunctionalPhaseF4.test.jsx` (4 tests): Bảng vàng Quán quân (Hall of Fame), Form feedback website, Phản hồi inline dưới công thức, Quản trị xóa feedback.
  - `FunctionalPhaseF5.test.jsx` (3 tests): Bảng điều hành Executive Atelier Intelligence & Architecture Metrics, Quick Action modals, điều hướng 6 tab quản trị.
- **Hệ thống Kiểm thử Thiết kế Kiến trúc Sang trọng (Luxury Phases L1 - L8):**
  - `LuxuryPhase1.test.jsx` đến `LuxuryPhase8.test.jsx` (28 tests): Kiểm tra toàn diện chuẩn thiết kế Luxury Architectural (EB Garamond, Instrument Sans, square corners `border-radius: 0`, Warm Alabaster `#fdfbf7`, Deep Charcoal `#1a1a1a`, Pale Taupe `#f4f0ea`, Fine Gold rules `#b69355`).
- **Hệ thống Kiểm thử Nghiệp vụ Cốt lõi (Phases 5 - 9):**
  - `Phase5.test.jsx` đến `Phase9.test.jsx` (35 tests): Menu 3 Role động (SRS 2.1), Real-time search/filter, Content Gatekeeping, Client validation, Responsive design, 404 page.

---

## 📡 7. Danh Mục API Endpoints Chính

| Phương thức | Đường dẫn API | Quyền hạn | Mô tả |
|---|---|---|---|
| `POST` | `/api/auth/register` | Anonymous | Đăng ký tài khoản kèm chọn gói $10/$100 và mock payment |
| `POST` | `/api/auth/login` | Anonymous | Đăng nhập hệ thống, nhận JWT Token |
| `GET` | `/api/auth/me` | Authenticated | Lấy thông tin tài khoản hiện tại |
| `GET` | `/api/users/profile` | Authenticated | Xem chi tiết hồ sơ thành viên và thông tin gói cước |
| `PUT` | `/api/users/profile` | Authenticated | Cập nhật họ tên và số điện thoại |
| `POST` | `/api/users/change-password` | Authenticated | Đổi mật khẩu tài khoản |
| `GET` | `/api/recipes` | Anonymous | Lấy danh sách công thức (Guest chỉ thấy `IsFree=true`) |
| `GET` | `/api/recipes/{id}` | Anonymous / Auth | Xem chi tiết công thức (Kiểm tra quyền nếu bài trả phí) |
| `POST` | `/api/recipes` | Member / Admin | Tạo mới công thức món ăn |
| `PUT` | `/api/recipes/{id}` | Author / Admin | Cập nhật công thức; Admin có quyền chỉnh `IsFree` |
| `DELETE` | `/api/recipes/{id}` | Author / Admin | Xóa công thức món ăn |
| `GET` | `/api/tips` | Anonymous | Lấy danh sách mẹo làm bếp |
| `GET` | `/api/contests` | Anonymous | Danh sách cuộc thi ẩm thực |
| `POST` | `/api/contests` | Admin | Khởi tạo cuộc thi nấu ăn mới |
| `POST` | `/api/contests/{id}/entries` | Anonymous / Member | Nộp bài dự thi (Hỗ trợ cả Guest và Member) |
| `GET` | `/api/contests/{id}/entries` | Admin | Xem toàn bộ bài nộp của cuộc thi |
| `PUT` | `/api/contests/entries/{id}/winner` | Admin | Chọn bài thi đoạt giải chiến thắng |
| `GET` | `/api/announcements` | Anonymous | Xem danh sách thông báo người chiến thắng |
| `POST` | `/api/announcements` | Admin | Xuất bản thông báo chính thức |
| `POST` | `/api/feedbacks` | Anonymous / Member | Gửi đánh giá cho món ăn hoặc góp ý chung website |
| `GET` | `/api/feedbacks` | Admin | Xem toàn bộ phản hồi từ khách và thành viên |
| `GET` | `/api/faqs` | Anonymous | Xem 7 câu hỏi thường gặp chuẩn SRS |

---

## 📁 8. Cấu Trúc Thư Mục Dự Án (Directory Structure)

```text
Project_3/
├── backend/                       # ASP.NET Core 10 Web API
│   ├── Controllers/               # 9 API Controllers đầy đủ XML Documentation
│   ├── Data/                      # ApplicationDbContext & DbInitializer (Seeding)
│   ├── DTOs/                      # Data Transfer Objects & Validation Attributes
│   ├── Entities/                  # 10 Domain Entities
│   ├── Middlewares/               # Global Exception Middleware
│   ├── Repositories/              # GenericRepository & UnitOfWork
│   ├── Services/                  # Business Logic Layer (Auth, Recipe, Tip, Contest...)
│   └── Program.cs                 # Configuration, JWT Bearer, Swagger setup
│
├── frontend/                      # React 19 + Vite SPA
│   ├── src/
│   │   ├── components/            # Layout, Navbar (Dynamic Menu), Footer, ProtectedRoute
│   │   ├── context/               # AuthContext (Login, Register, Subscription, Token)
│   │   ├── pages/
│   │   │   ├── auth/              # LoginPage, RegisterPage (Plan selection + Mock Payment)
│   │   │   ├── member/            # MyRecipesPage, ProfilePage
│   │   │   ├── admin/             # AdminDashboardPage (Recipes, Tips, Contests, Announcements, Feedbacks)
│   │   │   └── public/            # HomePage, RecipesPage, RecipeDetailPage, ContestsPage, AnnouncementsPage, FeedbackPage, FaqPage, NotFoundPage
│   │   ├── services/              # Axios API Client & Modules
│   │   ├── styles/                # custom.css Theme
│   │   └── __tests__/             # 5 Test Suites (Phase 5, 6, 7, 8, 9 - 35 Vitest Tests)
│
├── tests/
│   └── backend.tests/             # 40 xUnit Integration Tests (.NET 10)
│
├── plans/
│   └── master-plan.md             # Kế hoạch chi tiết 9 Phase & Bảng theo dõi tiến độ
│
├── rules.md                       # Tiêu chuẩn chất lượng & quy trình phát triển
├── srs.md                         # Đặc tả yêu cầu phần mềm chuẩn của dự án
└── README.md                      # Tài liệu tổng quan dự án
```

---
*© 2026 Chef James Thew Culinary Excellence Platform. All Rights Reserved.*
