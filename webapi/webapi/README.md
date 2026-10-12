# 🚀 Enterprise Core Backend API (.NET 10)

Dự án Web API Backend xây dựng trên nền tảng **C# .NET 10** với kiến trúc đa tầng chuẩn công nghiệp:
- **Repository Pattern** & **Unit of Work**
- **Service Pattern** (Business Logic layer)
- **RESTful Controllers** & **Swagger / OpenAPI**
- **Bảo mật JWT**: **Access Token** & **Refresh Token** (Token Rotation trong `UserSessions`)
- **Tự động bắt ngoại lệ & Ghi log lỗi** vào bảng `ErrorLogs`
- **Ghi vết kiểm toán (Audit Trail)** vào bảng `AuditLogs`
- **Quản lý phiên đăng nhập & lịch sử** qua `UserSessions` và `LoginHistory`

---

## 🏛️ 1. Cấu trúc Thư mục Dự án

```text
CoreBackend/
├── Controllers/              # Tầng API Controllers (REST endpoints)
│   ├── AuthController.cs     # Đăng ký, đăng nhập, cấp lại token, hồ sơ cá nhân
│   ├── UsersController.cs    # Quản lý người dùng, phân quyền, khóa/mở khóa
│   ├── RolesController.cs    # Quản lý vai trò (Roles) và quyền (Permissions)
│   ├── CategoriesController.cs # Quản lý danh mục cha-con phân cấp
│   ├── StatusesController.cs   # Quản lý từ điển trạng thái nghiệp vụ
│   ├── SystemSettingsController.cs # Cấu hình tham số hệ thống động
│   ├── LocationsController.cs      # Tỉnh/Thành phố & Quận/Huyện
│   ├── NotificationsController.cs  # Thông báo người dùng & đánh dấu đã đọc
│   ├── AttachmentsController.cs    # Tải lên tệp đính kèm & lưu trữ
│   └── OperationsController.cs     # AuditLogs, ErrorLogs, LoginHistory, Sessions
├── Entities/                 # 17 Thực thể khớp 100% sơ đồ CoreDB
│   └── Entities.cs
├── Data/                     # EF Core DbContext & Data Seeding
│   ├── ApplicationDbContext.cs
│   └── DbInitializer.cs
├── Repositories/             # Repository Pattern & Unit of Work
│   ├── IGenericRepository.cs
│   ├── GenericRepository.cs
│   ├── IUnitOfWork.cs
│   └── UnitOfWork.cs
├── DTOs/                     # Data Transfer Objects & ApiResponse wrapper
│   ├── ApiResponse.cs
│   ├── AuthDtos.cs
│   ├── UserDtos.cs
│   ├── RoleDtos.cs
│   └── MasterDataDtos.cs
├── Services/                 # Business Logic Layer
│   ├── TokenService.cs       # Sinh Access Token & Refresh Token bảo mật
│   ├── AuthService.cs        # Logic xác thực, mã hóa BCrypt, kiểm tra khóa tài khoản
│   ├── UserService.cs        # Nghiệp vụ quản lý tài khoản & gán quyền
│   ├── RoleService.cs        # Nghiệp vụ vai trò & phân quyền chi tiết
│   └── MasterDataServices.cs # Danh mục, tỉnh/huyện, cài đặt, tệp, audit log
├── Middlewares/
│   └── GlobalExceptionMiddleware.cs # Bắt lỗi toàn cục, tự động lưu ErrorLogs
├── create_tables.sql         # Script SQL tạo sẵn 17 bảng nếu cần chạy SSMS
├── Dockerfile                # File đóng gói Docker container sẵn sàng deploy
├── docker-compose.yml        # Docker compose chạy cùng SQL Server
├── appsettings.json          # Cấu hình Connection String & JWT
└── Program.cs
```

---

## 🗄️ 2. Danh sách 17 Bảng CSDL (CoreDB)

| STT | Bảng | Mục đích thực tế |
|---|---|---|
| 1 | **Users** | Lưu tài khoản đăng nhập, mật khẩu mã hóa BCrypt, đếm số lần đăng nhập sai `FailedLogins`, cờ khóa `IsLocked`. |
| 2 | **UserProfiles** | Thông tin cá nhân (Họ tên, ngày sinh, giới tính, địa chỉ). |
| 3 | **Roles** | Danh sách vai trò người dùng (Admin, Manager, User...). |
| 4 | **Permissions** | Danh sách quyền chi tiết (`USER_VIEW`, `USER_CREATE`, `ROLE_MANAGE`, `SETTING_MANAGE`...). |
| 5 | **RolePermissions** | Bảng liên kết nhiều - nhiều giữa Role và Permission. |
| 6 | **UserRoles** | Bảng liên kết nhiều - nhiều giữa User và Role. |
| 7 | **UserSessions** | Quản lý phiên và lưu **Refresh Token**, IP, User-Agent, thời hạn hết hạn, cờ thu hồi `IsRevoked`. |
| 8 | **LoginHistory** | Lịch sử đăng nhập (thành công/thất bại, IP, thời gian). |
| 9 | **AuditLogs** | Ghi vết hành động người dùng (Action: CREATE/UPDATE/DELETE, Tên bảng, RecordId, Giá trị cũ & mới). |
| 10 | **ErrorLogs** | Tự động ghi lại các Exception xảy ra kèm StackTrace và User gây lỗi. |
| 11 | **Notifications** | Thông báo trong hệ thống cho người dùng (Tiêu đề, nội dung, cờ đã đọc). |
| 12 | **SystemSettings** | Cấu hình tham số hệ thống động dạng Key - Value không cần sửa code. |
| 13 | **Statuses** | Quản lý danh mục trạng thái nghiệp vụ theo nhóm (VD: `USER_STATUS`, `ORDER_STATUS`). |
| 14 | **Categories** | Danh mục phân cấp đa cấp (Hỗ trợ cha - con `ParentId`). |
| 15 | **Provinces** | Tỉnh / Thành phố. |
| 16 | **Districts** | Quận / Huyện (thuộc Tỉnh / Thành phố). |
| 17 | **Attachments** | Tệp tin đính kèm (Ảnh đại diện, tài liệu, hợp đồng) liên kết đa hình qua `EntityName` & `EntityId`. |

---

## 🔐 3. Cơ chế Bảo mật: Access Token & Refresh Token

1. **Đăng nhập (`POST /api/auth/login`)**:
   - Mật khẩu được kiểm tra qua **BCrypt**.
   - Nếu đăng nhập sai quá 5 lần, tài khoản tự động bị khóa (`IsLocked = true`).
   - Đăng nhập thành công trả về:
     - `accessToken`: JWT Token có hiệu lực trong 60 phút, chứa các claim User ID, Username, Email, Roles, Permissions.
     - `refreshToken`: Chuỗi mã hóa 64-byte an toàn lưu trữ trong bảng `UserSessions` với hạn 7 ngày.
2. **Cấp lại Token (`POST /api/auth/refresh-token`)**:
   - Client gửi `refreshToken`.
   - Hệ thống kiểm tra phiên trong bảng `UserSessions` (chưa bị thu hồi `IsRevoked == false` và chưa hết hạn `ExpiresAt > Now`).
   - Kỹ thuật **Token Rotation**: Huỷ token cũ và cấp mới cả cặp `accessToken` và `refreshToken` mới nhằm ngăn chặn rò rỉ token.
3. **Đăng xuất / Thu hồi Token (`POST /api/auth/revoke-token`)**:
   - Vô hiệu hóa phiên trong database.

---

## 📋 4. Danh mục API Endpoints

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/register`: Đăng ký tài khoản mới
- `POST /api/auth/login`: Đăng nhập, nhận Access Token & Refresh Token
- `POST /api/auth/refresh-token`: Đổi Refresh Token lấy Access Token mới
- `POST /api/auth/revoke-token`: Đăng xuất / Hủy token
- `POST /api/auth/change-password`: Đổi mật khẩu
- `GET /api/auth/me`: Lấy thông tin cá nhân hiện tại
- `PUT /api/auth/me`: Cập nhật hồ sơ cá nhân

### 👤 Quản lý người dùng (`/api/users`)
- `GET /api/users`: Danh sách người dùng (Tìm kiếm & Phân trang) - *Role: Admin*
- `GET /api/users/{id}`: Xem chi tiết
- `POST /api/users`: Thêm người dùng mới - *Role: Admin*
- `PUT /api/users/{id}`: Cập nhật thông tin - *Role: Admin*
- `PATCH /api/users/{id}/status`: Bật/tắt trạng thái hoạt động - *Role: Admin*
- `PATCH /api/users/{id}/lock`: Khóa/Mở khóa tài khoản - *Role: Admin*
- `POST /api/users/{id}/roles`: Gán vai trò cho người dùng - *Role: Admin*
- `DELETE /api/users/{id}`: Xóa tài khoản - *Role: Admin*

### 🛡️ Vai trò & Phân quyền (`/api/roles`, `/api/permissions`)
- `GET /api/roles`: Xem tất cả vai trò & quyền tương ứng
- `POST /api/roles`: Tạo vai trò mới
- `POST /api/roles/{id}/permissions`: Gán quyền cho vai trò
- `GET /api/permissions`: Danh sách tất cả quyền trong hệ thống

### 📂 Danh mục, Trạng thái & Cài đặt hệ thống
- `/api/categories`: CRUD danh mục cây phân cấp
- `/api/statuses`: Tra cứu danh mục trạng thái nghiệp vụ theo `groupCode`
- `/api/systemsettings`: Quản lý tham số cấu hình hệ thống
- `/api/locations/provinces`, `/api/locations/districts`: Quản lý địa giới hành chính

### 🔔 Thông báo & Tệp đính kèm
- `/api/notifications`: Xem thông báo người dùng, đánh dấu đã đọc
- `/api/attachments/upload`: Upload file (multipart/form-data)
- `/api/attachments/{id}`: Tra cứu và tải file

### 📊 Giám sát & Ghi log vận hành
- `GET /api/audit-logs`: Lịch sử thay đổi dữ liệu (Audit Trail)
- `GET /api/error-logs`: Nhật ký lỗi hệ thống
- `GET /api/login-histories`: Lịch sử đăng nhập
- `GET /api/sessions/my`: Xem các phiên đăng nhập đang hoạt động

---

## ⚡ 5. Tài khoản Đăng nhập Khởi tạo (Default Seed Data)

Khi khởi động ứng dụng lần đầu, `DbInitializer` sẽ tự động tạo dữ liệu mẫu:
- **Tài khoản Quản trị viên (Admin)**:
  - **Username**: `admin`
  - **Password**: `Admin@123456`
  - **Role**: `Admin` (Có đầy đủ tất cả các quyền Permissions)

---

## 🛠️ 6. Hướng dẫn Chạy ứng dụng

### Chạy trực tiếp trên máy:
1. Đảm bảo SQL Server đang chạy và cấu hình lại chuỗi kết nối trong [appsettings.json](file:///c:/Users/admin/OneDrive/Desktop/Project3/CoreBackend/appsettings.json):
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=CoreDB;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```
2. Mở terminal tại thư mục `CoreBackend` và gõ:
   ```bash
   dotnet run
   ```
3. Truy cập Swagger UI ngay tại:
   `https://localhost:5001/` hoặc `http://localhost:5000/`

### Chạy bằng Docker Compose (Đầy đủ cả SQL Server + API):
```bash
docker-compose up --build
```
Truy cập Swagger tại: `http://localhost:8080`

---

## 🎓 7. Gợi ý Đề tài Đồ án Phát triển từ CoreDB này

Cơ sở dữ liệu và mã nguồn này đã giải quyết **toàn bộ 80% phần khung sườn cốt lõi** (Security, RBAC, Master Data, Logging, File Storage) mà bất kỳ đồ án CNTT thực tế nào cũng yêu cầu. Bạn chỉ cần bổ sung 1 - 2 bảng nghiệp vụ chuyên biệt để tạo thành đồ án hoàn chỉnh:

1. **Hệ thống Quản lý Doanh nghiệp / Nhân sự (HRM & ERP Core)**:
   - Thêm bảng: `Employees`, `Departments`, `LeaveRequests` (xin nghỉ phép), `Attendance`.
2. **Hệ thống Sàn Thương mại Điện tử B2C / B2B**:
   - Tận dụng `Categories`, `Attachments`, `Statuses`, `Provinces/Districts`.
   - Thêm bảng: `Products`, `Orders`, `OrderDetails`, `Payments`.
3. **Nền tảng Học trực tuyến & Khảo thí (LMS Core)**:
   - Thêm bảng: `Courses`, `Lessons`, `Quizzes`, `Enrollments`.
4. **Hệ thống Đặt lịch Khám bệnh / Dịch vụ Trực tuyến (Booking & Healthcare System)**:
   - Thêm bảng: `Doctors/Services`, `Appointments`, `MedicalRecords`.
