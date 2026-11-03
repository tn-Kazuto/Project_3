# 🛠️ BẢNG GIAO VIỆC: DEVOPS & SYSTEMS ARCHITECT
## Dự án: Nền Tảng Ẩm Thực James Thew (James Thew Culinary Portal)
### Giai đoạn: Khởi tạo Nền tảng Hạ tầng, Containerization & API Gateway (Phase 1)

> **Người giao việc (Assigner):** Senior Business Analyst & Lead Architect  
> **Người nhận việc (Assignee):** DevOps Engineer & Systems Architect  
> **Căn cứ kỹ thuật:** [`rules.md`](../../rules.md) (Mục 1 & 1.1) · [`srsdetails/files/04-srs-performance.md`](../../srsdetails/files/04-srs-performance.md) · [`plans/microservices-architecture-plan.md`](../microservices-architecture-plan.md)  
> **Nguyên tắc bất biến:** Hạ tầng phải sẵn sàng trước để Developers và Testers triển khai mã nguồn trên môi trường tiêu chuẩn.

---

## 🎯 MỤC TIÊU CỐT LÕI (GOALS)
1. Xây dựng môi trường **Docker Compose** hoàn chỉnh, sẵn sàng khởi chạy toàn bộ hệ sinh thái chỉ với lệnh `docker compose up --build`.
2. Thiết lập **API Gateway (YARP)** làm điểm tiếp nhận duy nhất (Port `8000`), giải mã JWT token, truyền header claims nội bộ và thực thi Content Gatekeeping (Rule 3).
3. Đóng gói bảo mật các Microservices .NET 10 LTS bằng **Multi-stage Dockerfile** tối ưu (chạy non-root user `USER app`, image base Alpine/Chiseled < 120MB).
4. Thiết lập hệ thống cơ sở dữ liệu (SQL Server 2022), Redis In-Memory Cache và RabbitMQ Message Bus độc lập, gắn Named Volumes bền vững.

---

## 📋 DANH MỤC CÔNG VIỆC CHI TIẾT (WORK BREAKDOWN STRUCTURE)

### Task DVO-01: Xây dựng Cấu hình Docker Compose Hợp nhất (`docker-compose.yml`) — 🟢 **HOÀN THÀNH 100%**
* **Mô tả:** Thiết lập file `docker-compose.yml` tại thư mục gốc điều phối toàn bộ cụm container trong mạng nội bộ cô lập.
* **Quy chuẩn kỹ thuật (`rules.md` Mục 1.1):**
  - Mạng ảo: `networks: jamesthew-internal-net` (driver: bridge).
  - Cổng mở ra ngoài Host OS:
    - `gateway`: Port `8000:8000` (API Gateway Ingress duy nhất).
    - `frontend`: Port `3000:80` (React 19 SPA phục vụ qua Nginx).
  - Các service nội bộ (Ports 5001 - 5007), SQL Server (`1433`), Redis (`6379`), RabbitMQ (`5672`) **tuyệt đối không mở port ra host**, chỉ giao tiếp nội bộ qua Docker DNS.
  - Named Volumes:
    - `sqlserver_data:/var/opt/mssql/data`
    - `redis_data:/data`
    - `rabbitmq_data:/var/lib/rabbitmq`
* **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - Khởi chạy lệnh `docker compose up -d` thành công không xung đột cổng.
  - Dữ liệu trong SQL Server và Redis vẫn toàn vẹn sau khi chạy `docker compose down` rồi `docker compose up`.

---

### Task DVO-02: Thiết lập Multi-Stage Dockerfile cho Backend & Frontend — 🟢 **HOÀN THÀNH 100%**
* **Mô tả:** Viết Dockerfile chuẩn production cho các service .NET 10 Web API và Frontend React 19.
* **Chi tiết kỹ thuật:**
  1. **Dockerfile Backend (.NET 10 LTS):**
     - *Stage 1 (Build):* Image `mcr.microsoft.com/dotnet/sdk:10.0-alpine`, thực hiện `dotnet restore` và `dotnet publish -c Release -o /app/publish`.
     - *Stage 2 (Runtime):* Image `mcr.microsoft.com/dotnet/aspnet:10.0-alpine`.
     - *Bảo mật:* Bắt buộc khai báo `USER app` (non-root), loại bỏ công cụ debugging.
  2. **Dockerfile Frontend (React 19 SPA):**
     - *Stage 1 (Build):* Image `node:20-alpine`, chạy `npm install` và `npm run build`.
     - *Stage 2 (Serve):* Image `nginx:alpine`, copy bundle sang `/usr/share/nginx/html`.
     - *Cấu hình Nginx (`nginx.conf`):* Hỗ trợ SPA routing (`try_files $uri $uri/ /index.html;`), bật nén Gzip cho CSS/JS/SVG, cấu hình HTTP Security Headers.
* **Tiêu chí nghiệm thu:**
  - Kích thước image backend < 130MB.
  - Frontend SPA load mượt mà, reload trang tại các URL `/recipes/1` hoặc `/member/profile` không bị lỗi 404 Nginx.

---

### Task ARC-01: Triển khai API Gateway (YARP - Yet Another Reverse Proxy) — 🟢 **HOÀN THÀNH 100%**
* **Mô tả:** Thiết lập gateway project `JamesThew.Gateway` trên nền .NET 10 LTS đóng vai trò Ingress Controller.
* **Trách nhiệm kỹ thuật:**
  1. **Routing Rules:**
     - `/api/v1/auth/**` & `/api/v1/users/**` $\rightarrow$ `service-identity:5001`
     - `/api/v1/subscriptions/**` & `/api/v1/payments/**` $\rightarrow$ `service-subscription:5002`
     - `/api/v1/recipes/**`, `/api/v1/tips/**`, `/api/v1/categories/**`, `/api/v1/faqs/**` $\rightarrow$ `service-catalog:5003`
     - `/api/v1/contests/**` $\rightarrow$ `service-contest:5004`
     - `/api/v1/feedbacks/**` $\rightarrow$ `service-community:5005`
     - `/api/v1/media/**` $\rightarrow$ `service-media:5006`
     - `/api/v1/notifications/**` & `/hub/notifications` $\rightarrow$ `service-notification:5007` (Hỗ trợ WebSocket proxy cho SignalR)
  2. **Token Introspection & Header Injection:**
     - Giải mã JWT Bearer token tại Gateway.
     - Trích xuất và forward headers: `X-User-Id`, `X-User-Role` (`ADMIN` / `MEMBER` / `GUEST`), `X-Subscription-Active`.
  3. **Content Gatekeeping Enforcement (Rule 3):**
     - Nếu request xem bài Members-only từ Guest $\rightarrow$ Chặn ngay tại Gateway, trả về `403 Forbidden` kèm JSON chuẩn.
* **Tiêu chí nghiệm thu:**
  - Route chính xác 100% request từ Frontend sang đúng Microservice backend.
  - Forward đầy đủ claims header nội bộ được ký chứng thực.

---

### Task ARC-02: Thiết lập Thư viện Hợp đồng Dùng chung (Shared Contracts Library) — 🟢 **HOÀN THÀNH 100%**
* **Mô tả:** Xây dựng project thư viện `JamesThew.Shared.Contracts` chứa các Models dùng chung giữa các services.
* **Thành phần:**
  - **DTOs chuẩn:** `PagedResult<T>`, `ApiResponse<T>`, `UserClaimsDto`.
  - **Event Models (Message Bus):**
    - `SubscriptionActivatedEvent` (`UserId`, `PlanType`, `StartDate`, `EndDate`, `Amount`).
    - `ContestWinnerAnnouncedEvent` (`ContestId`, `WinnerEntryId`, `WinnerName`, `WinnerEmail`, `Prize`).
    - `RecipePublishedEvent` (`RecipeId`, `Title`, `IsFree`, `AuthorId`).
* **Tiêu chí nghiệm thu:**
  - Các Microservices reference thư viện này không bị xung đột phiên bản.

---

### Task DVO-03: Cấu hình Khởi tạo & Health Checks (Dependency Ordering) — 🟢 **HOÀN THÀNH 100%**
* **Mô tả:** Cấu hình thứ tự khởi động và kiểm tra sức khỏe hệ thống.
* **Yêu cầu:**
  - SQL Server có health check `sqlcmd -Q "SELECT 1"`.
  - RabbitMQ có health check `rabbitmq-diagnostics check_running`.
  - Các service backend chỉ khởi động khi SQL Server & RabbitMQ đạt trạng thái `service_healthy`.
  - Tự động chạy Migration và Seed dữ liệu (`DbInitializer`) trong lần đầu container khởi chạy.

---

## ⏱️ THỜI HẠN & BÀN GIAO (HAND-OFF MILESTONES)
* **Mốc hoàn thành:** Ngày thứ 1 – 3 của Sprint Microservices.
* **Sản phẩm bàn giao cho Developer:**
  1. File `docker-compose.yml` và các `Dockerfile` đã build thành công.
  2. Dự án `JamesThew.Gateway` và `JamesThew.Shared.Contracts`.
  3. Hướng dẫn khởi chạy cục bộ tại tài liệu `README.md`.

