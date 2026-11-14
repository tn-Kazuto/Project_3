# 🍳 James Thew - Culinary Website & Cooking Contests Platform

> **eProject Sem 3 - Modern Full-Stack Culinary Web & Microservices Platform**  
> Built strictly according to the **[Project Topic Charter (topic.md)](./topic.md)**, **[Software Requirements Specification (srs.md)](./srs.md)**, and **[Spec-Driven Architecture Standards (rules.md)](./rules.md)**.

[![Backend Tests](https://img.shields.io/badge/.NET%2010%20xUnit%20Tests-65%2F65%20PASS-brightgreen)](#)
[![Frontend Tests](https://img.shields.io/badge/Vitest%20Component%20Tests-98%2F98%20PASS-brightgreen)](#)
[![Frontend CI](https://img.shields.io/badge/GitHub%20Actions%20CI-Passing-brightgreen?logo=github)](#)
[![Total Test Coverage](https://img.shields.io/badge/Total%20Automated%20Tests-163%2F163%20PASS%20100%25-success)](#)
[![Architecture](https://img.shields.io/badge/Architecture-.NET%2010%20Microservices%20%7C%20Docker-blue)](#)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208-61dafb)](#)
[![Design System](https://img.shields.io/badge/Design%20System-5--Star%20Luxury%20Architectural-gold)](#)

---

## 📖 1. Giới Thiệu Dự Án (Project Overview)

Website được xây dựng cho **Mr. James Thew** – Bếp trưởng điều hành (Executive Chef) tại khách sạn 5 sao danh tiếng, tác giả của nhiều cuốn sách dạy nấu ăn bán chạy hàng đầu (các chủ đề: *Juices*, *Vegetarian*, *Non-Vegetarian*, *Italian*), đồng thời là người dẫn chương trình các gameshow ẩm thực và các lớp học nấu ăn thực tế vào cuối tuần cho cộng đồng đại chúng (*Mass Audience*).

Nền tảng đáp ứng trọn vẹn 3 nhóm đối tượng theo SRS và Đề tài Aptech:
1. **Admin (Mr. James Thew):** Quản trị toàn bộ hệ sinh thái, xuất bản công thức/mẹo ẩm thực độc quyền, điều chỉnh nhãn Free vs Members-Only, tổ chức và chấm giải các cuộc thi nấu ăn (`Contests`), công bố người thắng cuộc (`Announcements`), theo dõi góp ý (`Feedbacks`), phát sóng Talkshow/Liveshow.
2. **Registered Member (Thành viên trả phí):** Người dùng đăng ký bắt buộc chọn gói thuê bao (**$10/tháng** hoặc **$100/năm**) kèm thanh toán trực tuyến mô phỏng chuẩn PCI-DSS. Được toàn quyền truy cập 100% công thức, mẹo cao cấp và video bài giảng, đăng tải và quản lý công thức cá nhân, nộp bài dự thi cuộc thi ẩm thực, bình chọn và gửi đánh giá kèm ảnh/video thực hành.
3. **General User / Guest (Khách vãng lai):** Được xem các công thức & mẹo ẩm thực miễn phí (`IsFree = true`). Được tự do tham gia các cuộc thi nấu ăn (`Contests`) mà **không cần tạo tài khoản** (hệ thống tự động lưu Họ tên và Email để liên hệ trao giải), bình chọn và gửi phản hồi.

---

## 🛠️ 2. Kiến Trúc & Công Nghệ (Technology Stack)

### **Backend (.NET 10 Microservices & Web API)**
- **Framework:** ASP.NET Core Web API (.NET 10 LTS - `net10.0`, C# 14)
- **Kiến trúc:** Microservices phân tách 7 Domain Services (Identity, Subscription, Catalog, Contest, Community, Media, Notification) điều phối qua API Gateway (YARP).
- **ORM & Database:** Entity Framework Core 10.0.14 (Code-First) + Microsoft SQL Server 2022 + Redis In-Memory Cache (tối ưu hóa tải đọc $P_{99} < 100\text{ ms}$).
- **Messaging Backbone:** RabbitMQ / Kafka điều phối Choreography Saga (Transactional Outbox Pattern).
- **Security & Auth:** JWT Bearer Authentication, BCrypt Password Hashing, Claim-based Role Authorization.
- **Automated Testing:** xUnit, `Microsoft.AspNetCore.Mvc.Testing`, `Microsoft.EntityFrameworkCore.InMemory` (65/65 tests pass 100%).

### **Frontend (React 19 SPA)**
- **Framework:** React 19 + Vite 8
- **Routing:** React Router Dom v7 (với `ProtectedRoute` hỗ trợ phân quyền `ADMIN` và `MEMBER`, route riêng biệt `/tips`)
- **UI Framework & Styling:** 5-Star Luxury Architectural Design System (EB Garamond, Warm Alabaster `#fdfbf7`, Deep Charcoal `#1a1a1a`, Fine Gold rules `#b69355`).
- **Iconography:** Lucide React
- **API Client:** Axios (với JWT Interceptor đính kèm Token tự động)
- **Automated Testing:** Vitest 5, `@testing-library/react`, `@testing-library/dom`, `jsdom` (98/98 tests pass trên 23 test suites 100%).

### **Containerization & Hạ tầng (Docker & Docker Compose)**
- Multi-stage Dockerfile tối ưu hóa cho .NET 10 (`aspnet:10.0-alpine`) và React 19 (`nginx:alpine`).
- Điều phối toàn bộ hệ thống bằng Docker Compose qua mạng ảo `jamesthew-internal-net`.

---

## 🗄️ 3. Mô Hình Thực Thể Cơ Sở Dữ Liệu (11 Cốt Lõi)

1. `User`: Tài khoản người dùng (UserId, Username, PasswordHash, FullName, Email, Phone, Role [ADMIN/MEMBER], SubscriptionPlan [MONTHLY/ANNUAL], SubscriptionStart, SubscriptionEnd, IsSubscriptionActive).
2. `Payment`: Lịch sử giao dịch thanh toán thuê bao (PaymentId, UserId, Amount [$10 hoặc $100], PlanType, CardLast4, Status, PaidAt).
3. `Category`: Danh mục ẩm thực (CategoryId, CategoryName [Juices, Vegetarian, Non-Vegetarian, Italian], Description).
4. `Recipe`: Công thức món ăn đa phương tiện (RecipeId, AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, ContentType [Article/Video/Talk/Live], VideoUrl, IsFree, CreatedAt).
5. `Tip`: Mẹo làm bếp (TipId, AuthorId, CategoryId, Title, Content, VideoUrl, IsFree, CreatedAt).
6. `Contest`: Cuộc thi ẩm thực (ContestId, Title, Description, ContestType [RECIPE/TIP], StartDate, EndDate, IsActive, CreatedBy).
7. `ContestEntry`: Bài dự thi (EntryId, ContestId, UserId [null nếu là Guest], GuestName, GuestEmail, Title, Ingredients, CookingProcedure, TipContent, SubmittedAt, VoteCount, IsWinner).
8. `ContestVote`: Lượt bình chọn cộng đồng chống gian lận (VoteId, ContestEntryId, UserId [null nếu Guest], GuestEmail, IpAddress, VotedAt).
9. `Announcement`: Thông báo kết quả và vinh danh quán quân (AnnouncementId, ContestId, WinnerEntryId, Title, Content, PublishedAt, AuthorId).
10. `Feedback`: Đánh giá món ăn & Góp ý website (FeedbackId, RecipeId [null nếu góp ý chung], UserId [null nếu là Guest], SenderName, SenderEmail, Comment, MediaUrl, Rating, CreatedAt).
11. `Faq`: Danh sách 7 câu hỏi thường gặp cố định theo đúng SRS và Đề tài Aptech (FaqId, Question, Answer, DisplayOrder).

---

## 🔑 4. Tài Khoản Mặc Định & Dữ Liệu Khởi Tạo (Seeded Data)

Khi backend khởi động lần đầu, `DbInitializer.cs` sẽ tự động seed dữ liệu mẫu:

| Loại tài khoản | Username | Mật khẩu | Quyền (Role) | Gói cước |
|---|---|---|---|---|
| **Admin (Mr. James Thew)** | `james` hoặc `james@jamesthew.com` | `Admin@123456` | `ADMIN` | Vĩnh viễn (Chef Executive) |
| **Thành viên mẫu 1** | `member_monthly` | `Member@123` | `MEMBER` | Monthly ($10/tháng) |
| **Thành viên mẫu 2** | `member_annual` | `Member@123` | `MEMBER` | Annual ($100/năm) |

- **4 Danh mục chuẩn:** `Juices`, `Vegetarian`, `Non-Vegetarian`, `Italian`.
- **7 Câu hỏi FAQ bắt buộc:** Đã seed chính xác 100% từng câu hỏi & trả lời theo quy định của đề tài Aptech.

---

## 🚀 5. Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Cách 1: Khởi chạy Nhanh bằng Docker Compose (Khuyến nghị)
Chạy toàn bộ hệ sinh thái (Backend .NET, Frontend React, SQL Server, Redis, RabbitMQ) chỉ với 1 câu lệnh duy nhất:
```powershell
docker compose up --build
```
- Frontend Web App: `http://localhost:3000`
- API Gateway / Swagger: `http://localhost:8000`

---

### Cách 2: Chạy Thủ Công Từng Phần (Local Development)

#### **Yêu cầu hệ thống:**
- .NET 10 SDK trở lên
- Node.js 18+ & npm
- SQL Server LocalDB hoặc SQL Server Standard/Developer Edition

#### **Bước 1: Chạy Backend**
```powershell
cd e:\project\Project_3\backend
dotnet restore
dotnet run
```
- Backend API sẽ khởi chạy tại: `http://localhost:5000` (hoặc `https://localhost:5001`)
- Swagger UI tài liệu API: `http://localhost:5000/swagger`

#### **Bước 2: Chạy Frontend**
```powershell
cd e:\project\Project_3\frontend
npm install
npm run dev
```
- Frontend ứng dụng web sẽ khởi chạy tại: `http://localhost:5173`

---

## 🧪 6. Kiểm Thử Tự Động Toàn Diện (Automated Testing - 163 Tests 100% PASS)

Dự án tuân thủ nghiêm ngặt phương pháp **Spec-Driven Development** và **10 Luật Vàng (`rules.md`)** với **163/163 Test Cases vượt qua thành công (100% Pass Rate)**:

### **Kiểm thử Backend (xUnit): 65/65 Tests PASS ✓**
```powershell
dotnet test tests/backend.tests/backend.tests.csproj
```
- **Authentication & Subscription:** Đăng ký gói $10/$100 kèm thanh toán mock nguyên tử, Gia hạn gói (`subscription/renew`), Đăng nhập, Profile, Đổi mật khẩu.
- **Culinary Content & Gatekeeping:** Quản lý công thức/mẹo đa phương tiện (`ContentType`, `VideoUrl`), Content Gatekeeping (`IsFree`), Lọc theo `isFreeOnly`, Phân quyền tác giả (`AuthorId == currentUserId`).
- **Phân trang Kiến trúc & Giới hạn Tải (PERF-09 & TC-RCP-08):** Hỗ trợ `PagedResult<T>`, chặn trần cứng tối đa 50 phần tử trên mỗi trang (`PaginationTests.cs`).
- **Contests, Voting & Announcements:** Cuộc thi ẩm thực, Bài dự thi của Guest & Member, Hệ thống bình chọn cộng đồng chống spam vote (`ContestVote`), Chấm giải Winner, Tự động xuất bản Announcement vinh danh.
- **Feedbacks & FAQ Engine:** Góp ý món ăn kèm ảnh/video thực hành (`MediaUrl`), Đánh giá sao (1-5 sao), Góp ý website, Quản lý feedback cho Admin, 7 câu hỏi FAQ chuẩn đề bài Aptech.
- **Upgrades & In-App Notification Center:** Kiểm thử chuông thông báo Header và dịch vụ Email tự động.

### **Kiểm thử Frontend (Vitest): 98/98 Tests PASS trên 23 Test Suites ✓**
```powershell
cd frontend
npm test
```
- **Hệ thống Kiểm thử Chức năng Nâng cao (Functional Phases F1 - F5):** Profile VIP Member Pass, Modal gia hạn/nâng cấp gói cước, Bộ lọc Access Tier & Content Type, Tiện ích Print Culinary Card chuẩn `@media print`, Form nộp bài thi cho Guest/Member, Cổng chấm giải Quán quân, Bảng vàng Quán quân (Hall of Fame), Bảng điều hành Executive Atelier Intelligence.
- **Tips & Phân trang Kiến trúc (TipsAndPaginationPhase):** Điều hướng `/tips`, Modal kỹ thuật Masterclass video demo, Bộ điều khiển phân trang kiến trúc (Previous, Next, Current Page indicator).
- **Hệ thống Kiểm thử Thiết kế Kiến trúc Sang trọng (Luxury Phases L1 - L8):** Kiểm tra toàn diện chuẩn thiết kế Luxury Architectural 5 sao (EB Garamond, góc vuông `border-radius: 0`, Fine Gold rules `#b69355`).
- **Hệ thống Kiểm thử Tương tác MXH & Cuộc thi:** Bình chọn bài thi thời gian thực, Nút chia sẻ Facebook (Open Graph dialog), Thư viện bình luận kèm ảnh/video thành phẩm.

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
| `GET` | `/api/recipes` | Anonymous | Lấy danh sách công thức (Guest chỉ thấy `IsFree=true`, chặn trần 50 bản ghi) |
| `GET` | `/api/recipes/paged` | Anonymous | Phân trang công thức chuẩn PERF-09 (`page`, `pageSize` max 50) |
| `GET` | `/api/recipes/{id}` | Anonymous / Auth | Xem chi tiết công thức (Kiểm tra quyền nếu bài trả phí) |
| `POST` | `/api/recipes` | Member / Admin | Tạo mới công thức món ăn |
| `PUT` | `/api/recipes/{id}` | Author / Admin | Cập nhật công thức; Admin có quyền chỉnh `IsFree` |
| `DELETE` | `/api/recipes/{id}` | Author / Admin | Xóa công thức món ăn |
| `GET` | `/api/tips` | Anonymous | Lấy danh sách mẹo làm bếp (Chặn trần 50 bản ghi) |
| `GET` | `/api/tips/paged` | Anonymous | Phân trang mẹo làm bếp chuẩn PERF-09 (`page`, `pageSize` max 50) |
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

## 📁 8. Cấu Trúc Thư Mục Dự Án Chuẩn SOLID & Enterprise Architecture

`	ext
Project_3/
├── backend/                       # ASP.NET Core 10 Web API & Microservices Core
│   ├── Controllers/               # 10 API Controllers đầy đủ XML Documentation
│   ├── Data/                      # ApplicationDbContext & DbInitializer (Seeding 11 Entities)
│   ├── DTOs/                      # Data Transfer Objects & Validation Attributes
│   ├── Entities/                  # 12 Domain Entities theo chuẩn SRP (Tách riêng từng class)
│   ├── Middlewares/               # Global Exception & Gatekeeping Middleware
│   ├── Repositories/              # GenericRepository & UnitOfWork (Interfaces/ riêng biệt - DIP)
│   │   └── Interfaces/            # IGenericRepository & IUnitOfWork contracts
│   ├── Services/                  # Business Logic Layer (Interfaces/ riêng biệt - ISP/DIP)
│   │   ├── Interfaces/            # 12 Service Contracts
│   │   └── EventBus/              # InMemoryMessageBus & RabbitMQ Integration Events
│   └── Program.cs                 # Configuration, JWT Bearer, Swagger & DI Setup
│
├── gateway/                       # YARP API Reverse Gateway (Port 8000)
│   ├── appsettings.json           # Reverse Proxy Route Config & Cluster Rules
│   └── Program.cs                 # YARP Middleware & Header Forwarding
│
├── shared/                        # Shared Class Libraries & DTOs
│   └── JamesThew.Shared.Contracts/# Domain Contracts, Integration Events, Common DTOs (PagedResult)
│
├── database/                      # Database Initialization & Seed Scripts
│   └── seed-data.sql              # Raw SQL Seed Data cho SQL Server / Docker
│
├── frontend/                      # React 19 + Vite 8 SPA
│   ├── src/
│   │   ├── components/            # Layout, Navbar (Dynamic Menu 3 Roles), NotificationBell, Footer
│   │   ├── context/               # AuthContext (Login, Register, Subscription, JWT Token)
│   │   ├── pages/
│   │   │   ├── auth/              # LoginPage, RegisterPage (Plan selection + Mock Payment)
│   │   │   ├── member/            # MyRecipesPage, ProfilePage (Direct Edit)
│   │   │   ├── admin/             # AdminDashboardPage (Recipes, Tips, Contests, Announcements, Feedbacks)
│   │   │   └── public/            # HomePage, RecipesPage (Recipes & Tips + Pagination), RecipeDetailPage, ContestsPage, AnnouncementsPage, FeedbackPage, FaqPage, NotFoundPage
│   │   ├── services/              # Axios API Client & Modules (Paged Endpoints)
│   │   ├── styles/                # 5-Star Luxury Architectural Theme
│   │   └── __tests__/             # 23 Test Suites (98 Vitest Tests PASS 100%)
│   ├── Dockerfile                 # Multi-stage Dockerfile cho Frontend (Node Build + Nginx Alpine)
│   └── nginx.conf                 # Cấu hình Nginx Reverse Proxy & Client Routing
│
├── tests/
│   ├── backend.tests/             # 65 xUnit Integration Tests (.NET 10 LTS - 100% PASS)
│   └── load-tests/                # k6 Load, Stress & Spike Performance Test Scripts
│
├── docs/                          # Hồ sơ Tài Liệu Dự Án & Báo Cáo Aptech
│   ├── APTECH_PROJECT_REPORT_DOSSIER.md # 13 Đề mục Báo cáo Toàn diện eProject Aptech
│   ├── whiteboard-review.md       # Tổng hợp yêu cầu SRS & nâng cấp hệ thống
│   ├── problem-analysis.md        # Phân tích bài toán kinh doanh chi tiết
│   └── đềbài.md                   # Đề bài gốc Aptech
│
├── srsdetails/                    # Bộ Đặc Tả Chi Tiết Phân Hệ (00-Core, 01-Functional, 02-NFR, 03-Security, 04-Perf, 05-UIUX, 06-TestCases)
│   └── files/                     # 7 Chuyên đề đặc tả chuẩn IEEE 830 và ma trận truy vết
│
├── plans/                         # Kế hoạch phát triển & Nâng cấp hệ thống
│   ├── tasks/                     # Bảng phân công công việc chi tiết theo vai trò (DevOps, Dev, QA)
│   │   ├── 01-devops-architect-tasks.md # Nhiệm vụ Hạ tầng Docker, YARP Gateway, Message Bus
│   │   ├── 02-developer-tasks.md        # Nhiệm vụ Backend .NET 10 & Frontend React 19
│   │   ├── 03-tester-qa-tasks.md        # Nhiệm vụ Kiểm thử Tự động, k6, STRIDE, UAT
│   │   └── README.md                    # Ma trận điều phối công việc tổng thể & Definition of Done
│   ├── master-plan.md             # Kế hoạch phát triển ban đầu
│   ├── master-upgrade-plan-v2.md  # Kế hoạch nâng cấp v2.0 (Video, Live show, Vote, Notification)
│   └── microservices-architecture-plan.md # Kế hoạch chuyển đổi kiến trúc Vi Dịch Vụ
│
├── topic.md                       # Bản Đặc Tả Đề Tài & Bài Toán Kinh Doanh Chuẩn Aptech (Senior BA)
├── srs.md                         # Đặc tả yêu cầu phần mềm chuẩn & Microservices Extension
├── rules.md                       # Tiêu chuẩn chất lượng, 10 Luật vàng & Docker Standards
└── README.md                      # Tài liệu tổng quan dự án
`

---
*© 2026 Chef James Thew Culinary Excellence Platform. All Rights Reserved.*
