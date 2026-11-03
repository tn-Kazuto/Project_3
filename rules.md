# PROJECT RULES & CODING STANDARDS (`rules.md`)

**Dự án:** Website Ẩm Thực James Thew (James Thew Culinary Portal)

**Nền tảng:** ASP.NET Core MVC (.NET 10.0 - `net10.0`) & SQL Server

**Tiêu chuẩn áp dụng:** Aptech eProject Customer Requirement Specification (SRS)

## 1. CÔNG NGHỆ & KIẾN TRÚC HỆ THỐNG (TECH STACK & ARCHITECTURE)

1. **Framework & Ngôn ngữ:**

   * Backend: **ASP.NET Core 10.0 MVC** (`TargetFramework: net10.0`, C# 14).

   * ORM & Database: **Entity Framework Core 10.0 (Code-First)** với **Microsoft SQL Server**.

   * Static Assets: Sử dụng `app.MapStaticAssets()` và `.WithStaticAssets()` chuẩn của .NET 10 (thay cho `app.UseStaticFiles()` cũ) để tối ưu nén và bộ nhớ đệm tài nguyên tĩnh.

   * Frontend: **Razor Views (`.cshtml`)**, HTML5, CSS3, **Bootstrap 5**, và JavaScript / jQuery (`jquery-validation-unobtrusive`).

   * Xác thực & Phân quyền: **ASP.NET Core Cookie Authentication** (hoặc ASP.NET Core Identity) kết hợp phân quyền theo Role (`Admin`, `Member`).

2. **Cấu trúc phân tầng (Layered MVC Structure):**

   * `Areas/Admin/`: Chứa toàn bộ Controllers và Views dành riêng cho chủ sở hữu website (**Mr. James Thew**). Bắt buộc gắn attribute `[Area("Admin")]` và `[Authorize(Roles = "Admin")]`.

   * `Controllers/` & `Views/`: Chứa luồng chức năng cho Khách vãng lai (`Guest`) và Thành viên trả phí (`Member`).

   * `Models/Entities/`: Chứa các class thực thể ánh xạ trực tiếp với bảng trong SQL Server.

   * `Models/ViewModels/`: Chứa các DTO/ViewModel phục vụ hiển thị và nhận dữ liệu từ Form. **TUYỆT ĐỐI KHÔNG** truyền trực tiếp Entity vào Form `POST` để tránh lỗi bảo mật Over-Posting.

   * `Data/`: Chứa `ApplicationDbContext` và `DbInitializer` (tự động Seed dữ liệu mẫu và tài khoản Admin khi chạy ứng dụng lần đầu).

## 2. QUY TẮC NGHIỆP VỤ CỐT LÕI (STRICT BUSINESS LOGIC RULES)

Mọi tính năng được viết ra bắt buộc phải tuân thủ 100% các quy tắc nghiệp vụ từ SRS dưới đây:

### Rule 1: Ma trận Phân quyền (3 Roles)

Hệ thống chỉ tồn tại 3 nhóm đối tượng sử dụng với quyền hạn tách biệt:

1. **`Admin` (Mr. James Thew):** Chủ sở hữu hệ thống, có toàn quyền quản trị nội dung, cuộc thi, thông báo và phản hồi.

2. **`Member` (Registered User):** Người dùng đã đăng ký tài khoản **VÀ** đã hoàn tất thanh toán gói cước còn hiệu lực.

3. **`Guest` (General User):** Người dùng chưa đăng nhập.

### Rule 2: Đăng ký Thành viên bắt buộc kèm Thanh toán (Registration & Subscription)

* Khách hàng **chỉ có thể hoàn tất đăng ký tài khoản** khi thực hiện thanh toán một trong hai gói cước cố định:

  * **Monthly Subscription:** \$10 USD (Hiệu lực 30 ngày).

  * **Yearly Subscription:** \$100 USD (Hiệu lực 365 ngày).

* **Xử lý kỹ thuật:** Quá trình lưu bản ghi `User` và bản ghi `Payment` trong `AccountController.Register` bắt buộc phải nằm trong một **Database Transaction (`BeginTransactionAsync`)**. Nếu thanh toán thất bại, không được tạo tài khoản `Member`.

### Rule 3: Quyền Truy cập Công thức (Recipes) & Mẹo (Tips)

* **Đối với `Guest` (Chưa đăng nhập):**

  * Chỉ được xem và tìm kiếm các Recipes và Tips có cờ `IsFree == true`.

  * Mọi câu truy vấn LINQ cho Guest bắt buộc có điều kiện `.Where(x => x.IsFree == true)`.

  * Nếu Guest truy cập trực tiếp qua URL vào một bài viết có `IsFree == false`, hệ thống phải chặn lại và chuyển hướng về trang `Login / Register` kèm thông báo yêu cầu đăng ký thành viên.

* **Đối với `Member` và `Admin`:**

  * Được xem và tìm kiếm **toàn bộ** Recipes và Tips trên website (bao gồm cả bài Free, bài Member-only của ông James và bài do các thành viên khác đăng tải).

### Rule 4: Quyền Đăng tải, Chỉnh sửa & Xóa Nội dung (Content Ownership)

* **Cấu trúc bắt buộc của Recipe:** Mọi form thêm/sửa Recipe bắt buộc phải có đủ 3 thành phần: Tên món (`Title`), Danh sách nguyên liệu (`Ingredients`), và Quy trình chế biến (`CookingProcedure`).

* **Quyền của `Admin` (Mr. James):**

  * Khi đăng hoặc sửa Recipe/Tip, Admin là **người duy nhất** có tùy chọn đánh dấu bài viết là **Free (`IsFree = true`)** hoặc **Members Only (`IsFree = false`)**.

  * Admin được quyền Xem, Cập nhật (Update) hoặc Xóa (Delete) các Recipes và Tips do chính ông đăng tải.

* **Quyền của `Member`:**

  * Được quyền gửi (Upload/Send) Recipes và Tips mới lên hệ thống.

  * Được xem bài đăng của tất cả khách hàng khác, nhưng **CHỈ ĐƯỢC SỬA HOẶC XÓA** các Recipes và Tips do chính mình gửi lên (`entity.AuthorId == currentUserId`). Nếu cố tình gọi POST/DELETE vào bài của người khác, trả về `403 ForbidResult`.

### Rule 5: Quy tắc Cuộc thi (Contests) & Chấm giải (Announcements)

* **Mở rộng quyền cho `Guest`:** Theo SRS, người dùng chưa đăng ký thành viên (`Guest`) **ĐƯỢC PHÉP** xem và gửi bài tham gia cuộc thi (nộp Recipe kèm nguyên liệu + cách nấu, hoặc nộp Tip).

* **Thiết kế bảng `ContestEntry`:**

  * Trường `UserId` phải cho phép `NULL` (`int? UserId`).

  * Nếu người nộp là `Guest`, bắt buộc validate và lưu `GuestName` cùng `GuestEmail` để ông James biết thông tin người dự thi khi chấm giải.

* **Quyền của `Admin` trong Cuộc thi:**

  * Chỉ `Admin` mới được tạo cuộc thi mới, xóa cuộc thi, xem danh sách toàn bộ bài dự thi (`View the posts`) và đăng thông báo người chiến thắng lên trang `Announcements`.

  * `Guest` và `Member` chỉ có quyền xem trang `Announcements`.

### Rule 6: Quy tắc Phản hồi (Feedback)

* Cả `Guest` và `Member` đều được phép gửi Feedback cho từng công thức nấu ăn hoặc cho website.

* Chỉ `Admin` mới có màn hình xem toàn bộ danh sách các Feedback đã nhận được.

### Rule 7: Quy tắc Trang Hồ sơ (User Profile)

* Cả `Admin` và `Member` khi vào trang **User Profile** đều phải thấy thông tin hồ sơ của mình và **có thể chỉnh sửa hồ sơ ngay trên cùng trang đó** (không tách sang trang chỉnh sửa riêng biệt nếu không cần thiết, ưu tiên dùng Form trực tiếp trên trang Profile).

### Rule 8: Quy tắc Trang Hỏi Đáp (FAQ's)

* Trang FAQ phải hiển thị đầy đủ và chính xác **7 câu hỏi cố định** trong tài liệu SRS (được nạp sẵn qua `DbInitializer`):

  1. *How to become the member of this site?*

  2. *Will there be any subscription charges?*

  3. *How to view the recipes and tips? Will there be any charges for that?*

  4. *I am not the registered member of the site. Can I participate in the contest held?*

  5. *How to upload or post the recipes and tips?*

  6. *How to post a feedback?*

  7. *I have posted a recipe or a tip with respect to the contest. How can I know who is the winner?*

## 3. QUY TẮC THANH ĐIỀU HƯỚNG ĐỘNG (DYNAMIC NAVIGATION MENU RULES)

File `Views/Shared/_Layout.cshtml` phải kiểm tra trạng thái đăng nhập và Role để hiển thị đúng các mục menu theo yêu cầu của SRS:

* **Menu khi chưa đăng nhập (`Guest`):**
  `Home Page` | `Free Recipes & Tips` | `Contests` | `Announcements` | `Feedback` | `FAQ's` | `Login / Register`

* **Menu khi đăng nhập là `Member`:**
  `Home Page` | `User Profile` | `Recipes & Tips (All)` | `My Submissions (Send/Manage Recipes & Tips)` | `Contests` | `Announcements` | `Feedback` | `FAQ's` | `Logout`

* **Menu khi đăng nhập là `Admin` (Mr. James):**
  `Home Page` | `User Profile` | `All Recipes & Tips` | `Manage My Recipes & Tips (Upload Free/Paid)` | `Manage Contests & Entries` | `Manage Announcements` | `View All Feedbacks` | `FAQ's` | `Logout`

## 4. TIÊU CHUẨN MÃ NGUỒN & BẢO MẬT (.NET 10 & C# 14 STANDARDS)

1. **Quy tắc C# 14 & .NET 10:**

   * Tận dụng **Primary Constructors** cho tất cả các Controllers và Services (VD: `public class RecipeController(ApplicationDbContext context) : Controller`).

   * Bật `Nullable` và `ImplicitUsings` trong file `.csproj` (`<TargetFramework>net10.0</TargetFramework>`).

   * Sử dụng Collection Expressions (`[]`) và `field` keyword của C# 14 khi cần thiết để code ngắn gọn, sạch sẽ.

2. **Quy tắc Chú thích Code (Mandatory Commenting - Bắt buộc từ SRS):**

   * Mọi Class, Controller, Service và Action Method bắt buộc phải có **XML Documentation Comment (`/// <summary>`)** giải thích rõ mục đích và luồng logic.

   * Các khối lệnh xử lý nghiệp vụ phức tạp (như kiểm tra hạn gói cước, lọc quyền xem bài Free/Paid, xử lý Transaction thanh toán) phải có inline comment giải thích.

3. **Quy tắc Đặt tên (Naming Conventions):**

   * Class, Method, Property, ViewModel, Namespace: Sử dụng `PascalCase` (VD: `RecipeController`, `CookingProcedure`, `ContestSubmissionViewModel`).

   * Biến cục bộ và tham số hàm: Sử dụng `camelCase` (VD: `recipeId`, `currentUserId`).

   * Phương thức bất đồng bộ (Async): Bắt buộc dùng `async/await` cho mọi thao tác Database của EF Core 10.

4. **Kiểm tra dữ liệu & Bảo mật (Validation & Security):**

   * Mọi `ViewModel` phải gắn đầy đủ Data Annotations (`[Required]`, `[StringLength]`, `[EmailAddress]`, `[Range]`) kèm thông báo lỗi rõ ràng.

   * Mọi Action `POST` trong Controller bắt buộc phải có `[HttpPost]` và `[ValidateAntiForgeryToken]`, đồng thời kiểm tra `if (!ModelState.IsValid) return View(model);`.

   * Mật khẩu người dùng bắt buộc phải được băm (Hash) bằng `PasswordHasher<User>` hoặc `BCrypt`, tuyệt đối không lưu plain-text trong Database.

## 5. QUY TRÌNH SAO LƯU & BÀN GIAO ĐỒ ÁN (BACKUP & DELIVERABLES RULES)

1. **Sao lưu hàng ngày (Daily Backup Rule):**

   * Cuối mỗi ngày làm việc, bắt buộc phải `git commit` & `git push` mã nguồn lên kho lưu trữ từ xa (GitHub/GitLab) và xuất file script/backup CSDL (`.bak` hoặc `.sql`) để phòng ngừa 3 rủi ro được nêu trong SRS: *Virus problem, System failure, File corrupt*.

2. **Định dạng Email Báo cáo Tiến độ (Status Mail Formatting):**

   * Khi gửi báo cáo cho đội ngũ eProjects, tiêu đề email bắt buộc phải bắt đầu bằng đúng 1 trong 3 tiền tố in hoa:

     * `STATUS: [Tên nhóm / Mã dự án]` (Gửi 2 lần trong suốt kỳ đồ án).

     * `DOUBT: [Vấn đề cần hỏi]`

     * `PROJECT SUBMISSION: [Nộp đồ án kèm Tài liệu 13 mục & Feedback Form]`

     # ARCHITECTURE RULES – PROJECT_3 (James Thew Recipes & Contests)

> Tài liệu quy tắc kiến trúc **bắt buộc** cho toàn bộ thành viên và công cụ AI hỗ trợ code.
> Từ khóa: **PHẢI** (bắt buộc) · **KHÔNG ĐƯỢC** (cấm) · **NÊN** (khuyến nghị, cần lý do nếu bỏ qua).
> Có thể sao chép nội dung thành `CLAUDE.md` / `.cursorrules` / `AGENTS.md` ở gốc repo để AI tự đọc.
> Tham chiếu: `01-SRS-Core` (BR-xx), `04-SRS-Security`, `07-ERD`, `08-Algorithms`.

---

## 0. TÓM TẮT 10 LUẬT VÀNG

1. Luồng phụ thuộc **một chiều**: Controller → Service → Repository → DbContext. Không đi ngược, không nhảy cóc.
2. **Controller mỏng**: chỉ nhận request, kiểm tra quyền, gọi Service, trả response. Không chứa logic nghiệp vụ, không đụng DbContext.
3. **Mọi quy tắc nghiệp vụ nằm ở Service** (gatekeeping, ownership, tính hạn gói, chọn người thắng).
4. **Quyền được kiểm tra ở API**. Ẩn nút trên React **không phải** bảo mật.
5. **Không bao giờ trả Entity ra ngoài API**, luôn dùng DTO.
6. **Danh tính lấy từ token**, không bao giờ từ body, query hay URL (`userId`, `role`, `author_id`).
7. **Số tiền, vai trò, hạn gói, cờ `is_free` do server quyết định**, bỏ qua mọi giá trị client gửi lên.
8. **Nhiều thao tác ghi = một transaction** (đặc biệt: đăng ký + thanh toán, chọn người thắng).
9. **Không lưu dữ liệu nhạy cảm**: mật khẩu chỉ lưu hash; không lưu số thẻ, CVV.
10. **Mọi khối code phải có comment** (yêu cầu chấm điểm của đề Aptech).

---

## 1. CÔNG NGHỆ CHỐT

| Tầng | Công nghệ | Ghi chú |
| :--- | :--- | :--- |
| Backend | ASP.NET Core Web API (.NET LTS) | REST + JSON |
| ORM | Entity Framework Core (Code First) | Migrations bắt buộc |
| CSDL | SQL Server | UTF-8/Unicode (`NVARCHAR`) |
| Xác thực | JWT hoặc Cookie Authentication | Xem mục 7 |
| Frontend | React SPA (Vite) + React Router | Hàm component + hooks |
| Gọi API | axios (một instance dùng chung) + TanStack Query | |
| Validate | FluentValidation (backend), thư viện form (frontend) | Server luôn là chốt chặn cuối |
| Test | xUnit/NUnit, Jest/Vitest | |
| Mapping | AutoMapper hoặc mapping thủ công | Chọn một, dùng nhất quán |

**KHÔNG ĐƯỢC** thêm framework/thư viện lớn mới nếu chưa thống nhất cả nhóm.

---

## 2. CẤU TRÚC THƯ MỤC & TRÁCH NHIỆM

```
Project_3/
├── docs/                    # SRS, ERD, Algorithms, GUI standards, báo cáo Aptech
├── plans/                   # Kế hoạch, task sheet, test cases
├── database/                # (nên có) script SQL tham khảo, docker-compose SQL Server
├── backend/
│   ├── Controllers/         # Chỉ HTTP: route, [Authorize], gọi Service
│   ├── Services/            # Logic nghiệp vụ + Interfaces/
│   ├── Repositories/        # Truy cập dữ liệu + Interfaces/
│   ├── Entities/            # Class ánh xạ bảng (10 bảng)
│   ├── DTOs/                # Request/Response, tách theo module
│   ├── Validators/          # (bổ sung) FluentValidation cho DTO
│   ├── Mappings/            # (bổ sung) Profile ánh xạ Entity ↔ DTO
│   ├── Data/                # ApplicationDbContext, Configurations/, DbInitializer, Migrations/
│   ├── Middlewares/         # Exception handler, request logging
│   ├── Common/              # (bổ sung) Exceptions, Constants, Enums, PagedResult, Extensions
│   └── Program.cs           # Đăng ký DI, auth, CORS, pipeline
├── frontend/src/
│   ├── api/                 # (bổ sung) axios instance + interceptor
│   ├── components/          # UI dùng chung (Navbar, Footer, RecipeCard, Badge…)
│   ├── layouts/             # (bổ sung) PublicLayout, MemberLayout, AdminLayout
│   ├── routes/              # (bổ sung) định nghĩa route, ProtectedRoute, RoleRoute
│   ├── pages/{public,member,admin}/
│   ├── context/             # AuthContext (+ Theme nếu thật sự cần)
│   ├── services/            # Hàm gọi API theo module (recipeService, authService…)
│   ├── hooks/               # Custom hooks (useAuth, useRecipes…)
│   ├── types/               # (bổ sung) kiểu dữ liệu TypeScript của DTO
│   └── utils/               # Hàm tiện ích, hằng số
└── tests/{backend.tests,frontend.tests}/
```

### Trách nhiệm từng lớp backend
| Lớp | ĐƯỢC làm | KHÔNG ĐƯỢC làm |
| :--- | :--- | :--- |
| **Controller** | Định tuyến, `[Authorize]`, đọc DTO, gọi Service, trả mã HTTP | Truy vấn DB, `new DbContext`, tính toán nghiệp vụ, `try/catch` lặp lại |
| **Service** | Quy tắc nghiệp vụ, kiểm tra quyền sở hữu/gói, điều phối nhiều Repository, mở transaction | Biết về `HttpContext`/`IActionResult`, trả Entity, nối chuỗi SQL |
| **Repository** | Truy vấn/ghi dữ liệu bằng EF Core, trả Entity hoặc projection | Chứa quy tắc nghiệp vụ, gọi Service khác, tự `SaveChanges` khi nằm trong transaction của Service |
| **Entity** | Mô tả bảng, quan hệ, thuộc tính | Chứa logic gọi dịch vụ ngoài, phụ thuộc DTO |
| **DTO** | Hình dạng dữ liệu vào/ra, annotation cơ bản | Chứa logic nghiệp vụ, tham chiếu Entity |

---

## 3. QUY TẮC PHỤ THUỘC GIỮA CÁC LỚP

```
Controllers ──► Services ──► Repositories ──► ApplicationDbContext ──► SQL Server
     │             │               │
     └──── DTOs ◄──┴── Entities ◄──┘
```

- **PHẢI** phụ thuộc vào **interface** (`IRecipeService`, `IRecipeRepository`), đăng ký ở DI, không `new` trực tiếp.
- Controller **chỉ** gọi Service, **KHÔNG ĐƯỢC** gọi Repository hay DbContext.
- Service **KHÔNG ĐƯỢC** gọi Controller; Repository **KHÔNG ĐƯỢC** gọi Service.
- Service gọi Service khác được nhưng **cấm vòng tròn** (A gọi B, B gọi A). Logic dùng chung tách ra Service thứ ba.
- Frontend **KHÔNG ĐƯỢC** import từ thư mục backend; hai bên chỉ giao tiếp qua HTTP API.
- Vòng đời DI: `DbContext`, Repository, Service → **Scoped**; cấu hình/dịch vụ không trạng thái → Singleton khi cần.

---

## 4. QUY TẮC DỮ LIỆU & EF CORE

1. Dùng **Code First + Migrations**; mọi thay đổi schema đi qua migration, **KHÔNG sửa DB bằng tay** rồi quên cập nhật code.
2. Cấu hình bảng bằng `IEntityTypeConfiguration<T>` trong `Data/Configurations/`, không nhồi hết vào `OnModelCreating`.
3. Tên bảng/cột theo `07-ERD`; quan hệ & `ON DELETE` đúng bảng ở mục 4 của file ERD (mặc định RESTRICT).
4. **Ràng buộc ở DB là chốt cuối**: UNIQUE (`username`, `email`, `transaction_ref`), CHECK, chỉ mục duy nhất có lọc `UX_OneWinnerPerContest`.
5. Truy vấn chỉ đọc **PHẢI** dùng `AsNoTracking()`.
6. **PHẢI** phân trang ở DB (`Skip/Take`), `size` tối đa 50. **KHÔNG ĐƯỢC** `ToList()` toàn bảng rồi lọc trong bộ nhớ.
7. Danh sách **PHẢI** chiếu (`Select`) sang DTO, không tải cột lớn (`ingredients`, `cooking_procedure`) khi không cần.
8. **KHÔNG ĐƯỢC** nối chuỗi SQL từ input. Nếu phải dùng SQL thô, chỉ qua tham số (`FromSqlInterpolated`).
9. Thời gian lưu **UTC**; tiền dùng `DECIMAL(10,2)`.
10. Mọi `async` method dùng `await` và truyền `CancellationToken`; **KHÔNG ĐƯỢC** `.Result`/`.Wait()`.
11. `DbInitializer` **PHẢI** idempotent (chạy nhiều lần không nhân đôi): seed 1 Admin, 4 Categories, đúng **7 FAQ**.
12. Chỉ Service mở **transaction** và gọi `SaveChanges` cuối thao tác (qua `IUnitOfWork` hoặc `DbContext` được inject). Repository không tự commit giữa chừng.

---

## 5. QUY TẮC NGHIỆP VỤ BẤT BIẾN (không được phá khi refactor)

| Mã | Quy tắc | Nơi thực thi |
| :--- | :--- | :--- |
| **R-01 Gatekeeping** | Guest và Member hết hạn chỉ thấy bản ghi `is_free = true`; áp dụng cho **danh sách, tìm kiếm, chi tiết**, lọc ngay trong truy vấn | `ContentAccessService` (một nơi duy nhất) |
| **R-02 Hạn gói** | Quyền Member = vai trò Member **và** `subscription_end >= UtcNow`, **đọc từ DB** mỗi lần, không tin claim trong token | `ContentAccessService` |
| **R-03 Ownership** | Sửa/xóa bài chỉ khi `author_id == userId` lấy từ token; Admin cũng chỉ sửa/xóa bài của chính mình | Service của Recipe/Tip |
| **R-04 Cờ `is_free`** | Chỉ Admin đặt/đổi; Member gửi lên thì **bỏ qua**; bài Member mặc định Members-only | Service + DTO tách riêng cho Member/Admin |
| **R-05 Đăng ký + thanh toán** | Thanh toán thành công mới tạo User; tạo `Users` + `Payments` trong **một transaction**; lỗi thì rollback + hoàn tiền mock | `AuthService`/`RegistrationService` |
| **R-06 Giá gói** | $10/30 ngày, $100/365 ngày, tra từ bảng giá trên server | `PaymentService` |
| **R-07 Idempotency** | Dùng `idempotencyKey` + UNIQUE `transaction_ref` để chống tạo trùng | `RegistrationService` |
| **R-08 Contest** | Chỉ nhận bài khi `ACTIVE` và trong `start_date`–`end_date`; loại RECIPE bắt buộc có Ingredients + Cooking Procedure | `ContestService` |
| **R-09 Guest được thi/góp ý** | `user_id` nullable; Guest bắt buộc có tên + email | `ContestService`, `FeedbackService` |
| **R-10 Người thắng** | Mỗi Contest tối đa 1 người thắng; chỉ chọn khi đã hết hạn; bài phải thuộc Contest; đổi người thắng cần xác nhận | `ContestService` (+ chỉ mục DB) |
| **R-11 Admin** | Tài khoản Admin chỉ được seed; **KHÔNG** có endpoint nào tạo Admin | `DbInitializer` |
| **R-12 FAQ** | Đúng 7 câu hỏi bắt buộc theo `display_order` | `DbInitializer` |

---

## 6. QUY TẮC API (REST)

### 6.1. Quy ước chung
- Route chữ thường, số nhiều, tiền tố `/api`: `/api/recipes`, `/api/contests/{id}/submissions`.
- Động từ HTTP: `GET` đọc · `POST` tạo · `PUT` cập nhật · `DELETE` xóa. **Cấm** dùng `GET` để thay đổi dữ liệu.
- Phiên bản hóa khi cần: `/api/v1/...`.
- Hành động không thuộc CRUD dùng sub-resource: `POST /api/contests/{id}/winner`.
- Danh sách trả `PagedResult<T>` (`items`, `total`, `page`, `size`).
- Ngày giờ ISO-8601 UTC.

### 6.2. Mức truy cập theo controller
| Controller | Endpoint chính | Quyền |
| :--- | :--- | :--- |
| `AuthController` | `POST register`, `POST login`, `POST logout` | Anonymous (logout cần đăng nhập) |
| `UserController` | `GET/PUT me`, `PUT me/password` | Member, Admin |
| `RecipeController` / `TipController` | `GET` list/search/detail | Anonymous (**có gatekeeping**) |
| | `POST`, `PUT {id}`, `DELETE {id}`, `GET mine` | Member, Admin (+ ownership) |
| | Đổi `is_free` | Chỉ Admin |
| `CategoryController` | `GET` | Anonymous |
| | Quản trị danh mục | Admin |
| `ContestController` | `GET` list/detail | Anonymous |
| | `POST {id}/submissions` | Anonymous (CAPTCHA + rate limit) |
| | `POST`, `DELETE`, `GET {id}/submissions`, `POST {id}/winner` | **Admin** |
| `AnnouncementController` | `GET` | Anonymous |
| | `POST`, `PUT`, `DELETE` | **Admin** |
| `FeedbackController` | `POST` | Anonymous (CAPTCHA + rate limit) |
| | `GET` toàn bộ, `DELETE` | **Admin** |
| `FaqController` | `GET` | Anonymous |

- **Mặc định từ chối**: bật `FallbackPolicy` yêu cầu đăng nhập, endpoint công khai **PHẢI** ghi rõ `[AllowAnonymous]`.
- Khu vực quản trị gắn `[Authorize(Roles = "Admin")]` ở **cấp controller/action**, **KHÔNG** dựa vào việc frontend ẩn menu.

### 6.3. Mã trạng thái & định dạng lỗi
| Tình huống | Mã | Ghi chú |
| :--- | :-: | :--- |
| Thành công / tạo mới / xóa không nội dung | 200 / 201 / 204 | |
| Dữ liệu sai | 400 | Kèm lỗi theo từng trường |
| Chưa đăng nhập | 401 | |
| Không đủ quyền / hết hạn gói / không phải chủ bài | 403 | Hết hạn gói dùng mã lỗi `SUBSCRIPTION_REQUIRED` |
| Không tồn tại | 404 | |
| Trùng dữ liệu / xung đột đồng thời | 409 | |
| Thanh toán thất bại | 402 (hoặc 400 với mã `PAYMENT_FAILED`) | Chọn một và dùng nhất quán |
| Quá nhiều request | 429 | |
| Lỗi hệ thống | 500 | **Không lộ stack trace** |

- Lỗi trả theo **ProblemDetails (RFC 7807)** kèm trường `code` (ví dụ `SUBSCRIPTION_REQUIRED`) để frontend xử lý theo mã, không theo chữ.
- Service **ném exception nghiệp vụ** (`NotFoundException`, `ConflictException`, `ForbiddenException`, `ValidationException`); **Exception Middleware** là nơi duy nhất ánh xạ sang mã HTTP. Controller **KHÔNG** tự `try/catch` để biến lỗi thành response.

### 6.4. DTO
- Tách DTO theo mục đích: `CreateRecipeDto`, `UpdateRecipeDto`, `RecipeListItemDto`, `RecipeDetailDto`, **và DTO riêng cho Admin** nếu có thêm trường (`is_free`).
- DTO của Member **KHÔNG ĐƯỢC** chứa `AuthorId`, `Role`, `IsFree`, `SubscriptionEnd`, `IsWinner`, số tiền.
- **KHÔNG ĐƯỢC** bind trực tiếp Entity từ request (chống mass assignment).
- Response **KHÔNG ĐƯỢC** chứa `PasswordHash`, email/điện thoại của người khác, `card_*`.

---

## 7. XÁC THỰC & PHÂN QUYỀN

1. Mật khẩu băm bằng `PasswordHasher` (PBKDF2) hoặc BCrypt/Argon2. **Cấm** MD5/SHA thuần.
2. **Quyết định mặc định:** token đặt trong **cookie `HttpOnly; Secure; SameSite`**. **KHÔNG** lưu token trong `localStorage`/`sessionStorage`.
   - Dùng cookie thì **PHẢI** bật chống CSRF cho request thay đổi dữ liệu (anti-forgery token hoặc `SameSite=Strict` + kiểm tra `Origin`).
   - Nếu nhóm chọn JWT qua header `Authorization`: access token ngắn hạn, lưu **trong bộ nhớ**, refresh qua cookie HttpOnly. Đổi quyết định thì **cập nhật mục này**.
3. Claims tối thiểu: `userId`, `role`. **Hạn gói không đặt làm nguồn sự thật trong token.**
4. Vai trò dùng enum/hằng số (`Roles.Admin`, `Roles.Member`), **không viết chuỗi "Admin" rải rác**.
5. Lấy `userId` qua một abstraction duy nhất (`ICurrentUser`), không đọc claim ở nhiều nơi.
6. CORS: chỉ cho phép origin của frontend đã khai báo, bật credentials khi dùng cookie; **cấm** `AllowAnyOrigin` kèm credentials.
7. Khóa tạm tài khoản sau 5 lần đăng nhập sai; thông báo đăng nhập thất bại chung chung.
8. Endpoint công khai nhận dữ liệu (đăng ký, feedback, bài dự thi) **PHẢI** có rate limiting; form Guest có CAPTCHA/honeypot.

---

## 8. BẢO MẬT BẮT BUỘC (tóm tắt từ 04-SRS-Security)

- Chỉ HTTPS ở môi trường chạy thật; bật HSTS; cookie `Secure`.
- Chuỗi kết nối, khóa bí mật nằm ở **User Secrets / biến môi trường**, **KHÔNG commit** vào Git. Có `.env.example` (không chứa giá trị thật).
- Không log mật khẩu, số thẻ, CVV, token.
- Upload ảnh: kiểm tra MIME + magic bytes, giới hạn dung lượng, đổi tên GUID, lưu qua `IFileStorageService`, không cho thực thi trong thư mục upload.
- Không cache công khai nội dung Members-only (`Cache-Control: private/no-store`); cache chung chỉ cho dữ liệu công khai.
- Trang lỗi production không lộ stack trace hay chi tiết hệ thống.
- Thêm security headers (CSP, `X-Content-Type-Options`, `frame-ancestors`, `Referrer-Policy`).

---

## 9. QUY TẮC FRONTEND (REACT)

1. **Cấm gọi `fetch`/`axios` trực tiếp trong component.** Mọi lời gọi API đi qua `services/` dùng **một axios instance** (`api/`) có interceptor xử lý 401/403.
2. Dữ liệu từ server dùng **TanStack Query** (hoặc hook riêng); component chỉ hiển thị.
3. **Route guard (`ProtectedRoute`/`RoleRoute`) chỉ phục vụ UX**; mọi quyền thật do API kiểm tra. Không được coi guard là bảo mật.
4. Xử lý lỗi **theo `code` của API** (ví dụ `SUBSCRIPTION_REQUIRED` → trang gia hạn), không so khớp chuỗi thông báo.
5. **Không** lưu token, mật khẩu, dữ liệu thẻ trong `localStorage`/state lâu dài; dữ liệu thẻ chỉ tồn tại trong form và không ghi log.
6. Validate form ở client để tiện dụng, **nhưng hiển thị cả lỗi server** theo từng trường.
7. **Không** chèn HTML thô từ người dùng (`dangerouslySetInnerHTML` bị cấm với nội dung do user nhập).
8. Cấu trúc trang theo vai trò: `pages/public`, `pages/member`, `pages/admin`; menu động theo vai trò từ `AuthContext`.
9. Component: một component một tệp, tên PascalCase; hook bắt đầu bằng `use`; hàm thuần ở `utils/`.
10. Dùng TypeScript (khuyến nghị): kiểu trong `types/` phản chiếu DTO backend.
11. Trạng thái giao diện bắt buộc có: đang tải (skeleton/spinner), rỗng, lỗi, thành công; nút gửi bị vô hiệu khi đang xử lý (chống gửi trùng).
12. Tuân thủ tiêu chuẩn trong `06-SRS-UI-UX` (responsive 360 px+, WCAG 2.1 AA, thành phần chuẩn).

---

## 10. QUY ƯỚC MÃ NGUỒN & COMMENT

| Hạng mục | Quy ước |
| :--- | :--- |
| Ngôn ngữ đặt tên | Tiếng Anh |
| Ngôn ngữ **comment** | Tiếng Việt (hoặc tiếng Anh, nhưng **một ngôn ngữ nhất quán** toàn dự án) |
| C# | `PascalCase` cho class/method/property; `_camelCase` cho field private; interface bắt đầu bằng `I`; hậu tố `Service`, `Repository`, `Controller`, `Dto` |
| Hàm async | Hậu tố `Async` |
| JavaScript/TS | `camelCase` biến/hàm, `PascalCase` component, `UPPER_SNAKE_CASE` hằng số |
| Cỡ hàm | Một hàm một việc; nên ≤ ~50 dòng |
| Số/chuỗi cứng | Đưa vào hằng số/enum/config (giá gói, tên vai trò, mã lỗi) |

**Comment bắt buộc (tiêu chí chấm của Aptech):**
- Mọi class, method public: XML doc `/// <summary>` (C#) hoặc JSDoc (JS/TS).
- Mọi khối logic không hiển nhiên (điều kiện gatekeeping, transaction, tính ngày) có comment giải thích **vì sao**, không chỉ **cái gì**.
- Mỗi tệp Service gắn tham chiếu quy tắc (`// Theo R-01, BR-04`).

---

## 11. KIỂM THỬ

| Phạm vi | Yêu cầu |
| :--- | :--- |
| **Bắt buộc có unit test** | `ContentAccessService` (gatekeeping), đăng ký + thanh toán (transaction, rollback), chọn người thắng, ownership, tính hạn gói/gia hạn |
| Dữ liệu test | Dùng DbContext in-memory/SQLite hoặc SQL Server test; không dùng DB thật của dev |
| Đặt tên test | `Method_Condition_ExpectedResult` (vd: `Search_GuestUser_ReturnsOnlyFreeRecipes`) |
| Bảng test | Dùng bảng T1…T8 trong `08-Algorithms` làm test case gốc |
| Phân quyền | Có test tích hợp cho ma trận Guest/Member/Admin (200/401/403) |
| Frontend | Test form (validate, lỗi server), guard điều hướng, hiển thị theo vai trò |
| Tiêu chí merge | Test mới/cũ đều qua; Service mục tiêu độ phủ ≥ 70% |

---

## 12. LOGGING, CẤU HÌNH, MÔI TRƯỜNG

- Ghi log có cấu trúc (Serilog hoặc `ILogger`); **bắt buộc** log: đăng ký, thanh toán, đăng nhập thất bại, 403, thao tác Admin (tạo/xóa Contest, chọn người thắng).
- Cấu hình theo môi trường: `appsettings.json` (mặc định, không bí mật), `appsettings.Development.json`, biến môi trường/Secrets cho dữ liệu nhạy cảm.
- Có **health check** (`/health`) cho ứng dụng và CSDL.
- Sao lưu CSDL **hàng ngày** (xem `03-SRS-NonFunctional`, mục Backup); script/hướng dẫn nằm ở `docs/` hoặc `database/`.

---

## 13. QUY TRÌNH LÀM VIỆC (GIT & REVIEW)

- Nhánh: `main` (ổn định) · `develop` (tích hợp) · `feature/<module>-<mô-tả>` · `fix/<mô-tả>`.
- **Cấm** commit trực tiếp vào `main`; mọi thay đổi qua Pull Request và có ít nhất 1 người review.
- Commit message dạng: `feat(recipe): add content gatekeeping`, `fix(auth): rollback on payment error`.
- Không commit: `bin/`, `obj/`, `node_modules/`, `.env`, secrets, file backup DB.
- Thay đổi schema = 1 migration riêng, mô tả rõ trong PR.

### Checklist trước khi tạo Pull Request
- [ ] Đúng chiều phụ thuộc, không có logic nghiệp vụ trong Controller.
- [ ] Không trả Entity; DTO không chứa trường nhạy cảm/được server quyết định.
- [ ] Endpoint mới có `[Authorize]`/`[AllowAnonymous]` rõ ràng và đúng ma trận quyền.
- [ ] Quy tắc R-01…R-12 không bị phá; test liên quan đã thêm/chạy xanh.
- [ ] Truy vấn có phân trang, `AsNoTracking`, chỉ lấy cột cần; không N+1.
- [ ] Không có bí mật trong code/log; không lưu dữ liệu thẻ.
- [ ] Mọi khối code mới có comment theo mục 10.
- [ ] Cập nhật tài liệu (`docs/`) nếu đổi hành vi hoặc kiến trúc.

---

## 14. ANTI-PATTERN CẦN TRÁNH (và cách đúng)

| ❌ Sai | ✅ Đúng |
| :--- | :--- |
| Controller chứa `_db.Recipes.Where(...)` | Controller gọi `IRecipeService`, Service gọi Repository |
| Lọc Members-only trong React (`if (!user) hide`) | Lọc `is_free` trong truy vấn ở server |
| `var userId = dto.AuthorId;` | `var userId = _currentUser.Id;` (từ token) |
| Nhận `amount`/`role`/`isFree` từ client | Server tra bảng giá, gán role, kiểm tra Admin mới đổi `isFree` |
| Tạo User rồi mới thanh toán, lỗi để lại User "mồ côi" | Thanh toán thành công + transaction `Users` & `Payments` |
| `catch (Exception) { }` nuốt lỗi | Ném exception nghiệp vụ, Exception Middleware xử lý và log |
| Trả `Recipe` entity (kèm navigation property, hash…) | Trả `RecipeDetailDto` |
| Lưu JWT trong `localStorage` | Cookie HttpOnly hoặc token trong bộ nhớ + refresh qua cookie |
| Tin `subscription_end` trong token | Đọc `subscription_end` từ DB mỗi lần kiểm tra |
| Cache công khai trang chi tiết Members-only | `Cache-Control: private/no-store` cho nội dung Members-only |
| Xóa Contest đã công bố kết quả | Chặn xóa (RESTRICT), chỉ cho xóa Contest chưa công bố |
| Dùng `string` "Admin" khắp nơi | Hằng số/enum `Roles` |

---

## 15. QUY TRÌNH THAY ĐỔI KIẾN TRÚC

1. Muốn đổi quy tắc trong file này → mở PR sửa **chính file này**, nêu lý do và tác động.
2. Quyết định lớn (đổi cơ chế xác thực, thêm thư viện, đổi cấu trúc thư mục) ghi lại ngắn gọn ở `docs/decisions.md` theo mẫu: *Bối cảnh → Quyết định → Hệ quả*.
3. Khi quy tắc trong file này mâu thuẫn với SRS hoặc đề bài Aptech, **ưu tiên đề bài và SRS**, đồng thời cập nhật file này.

---

## PHỤ LỤC – CÁC ĐIỂM CẦN NHÓM CHỐT (đánh dấu khi đã quyết)

- [ ] Cơ chế token: cookie HttpOnly (mặc định) hay JWT header
- [ ] Có dùng Generic Repository hay gọi DbContext trong Service (mặc định: giữ Repository theo cấu trúc hiện tại)
- [ ] Ngôn ngữ comment: tiếng Việt hay tiếng Anh
- [ ] Mã lỗi thanh toán thất bại: 402 hay 400 + `PAYMENT_FAILED`
- [ ] Bài của Member có cần Admin duyệt trước khi hiển thị không (đề không nói rõ)
- [ ] Contest: cho đóng sớm hay chỉ chọn người thắng khi hết hạn