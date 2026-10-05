# 🚀 Kế hoạch Triển khai eProject

Dự án này bao gồm việc xây dựng một hệ thống hoàn chỉnh với Backend .NET, Web Client, Web Admin và Ứng dụng Mobile, kết hợp triển khai CI/CD lên nền tảng Azure.

---

## 🛠️ 1. Công nghệ & Kiến trúc (Technology Stack)

*   **Kiến trúc:** [Quyết định chọn Monolithic hoặc Microservices - *Khuyến nghị chọn Monolithic nếu team ít người hoặc chưa rành về phân tán để đảm bảo tiến độ*]
*   **Backend:** ASP.NET Core (.NET 10)
*   **Database:** SQL Server (Khuyến nghị cho Học kỳ 3)
*   **Frontend (Web):** [Điền framework/công nghệ bạn dùng, VD: ReactJS / VueJS / MVC / Razor Pages]
*   **Mobile:** [Điền công nghệ sử dụng, VD: .NET MAUI / Flutter / React Native]
*   **DevOps & Cloud:** Azure, CI/CD (GitHub Actions / Azure DevOps)

---

## 📅 2. Lộ trình thực hiện (Phases & Milestones)

### Giai đoạn 1: Khởi tạo dự án & Cơ sở dữ liệu (Tuần 1)
- [ ] **Chốt kiến trúc:** Thống nhất mô hình (Mono/Microservices) và luồng dữ liệu.
- [ ] **Thiết kế Database:** Lên sơ đồ ERD, tạo các bảng cần thiết trên SQL Server.
- [ ] **Khởi tạo Codebase:**
  - [ ] Tạo solution Backend .NET 10.
  - [ ] Cấu hình kết nối Entity Framework Core tới SQL Server.
  - [ ] Khởi tạo project Frontend (Web) và Mobile.
  - [ ] Thiết lập Git repository và phân quyền cho các thành viên.

### Giai đoạn 2: Phát triển Backend & Core API (Tuần 2 - 3)
- [ ] **Xác thực & Phân quyền (Auth):**
  - [ ] Xây dựng API Đăng ký / Đăng nhập.
  - [ ] Cấu hình bảo mật JWT (JSON Web Token).
  - [ ] Thiết lập phân quyền (Role-based access: Admin, User,...).
- [ ] **Tích hợp Email:**
  - [ ] Cài đặt dịch vụ gửi email (SMTP, SendGrid,...).
  - [ ] Viết luồng gửi email (VD: Xác nhận tài khoản, quên mật khẩu).
- [ ] **APIs nghiệp vụ:** Xây dựng các API CRUD cơ bản cho ứng dụng.

### Giai đoạn 3: Xây dựng Giao diện Web (Tuần 3 - 4)
- [ ] **Trang Quản trị (Web Admin):**
  - [ ] Tìm và tích hợp Admin Template (Khuyến khích sử dụng template có sẵn để tiết kiệm thời gian).
  - [ ] Ghép API quản lý dữ liệu, phân quyền admin.
- [ ] **Trang Khách hàng (Web Client):**
  - [ ] Xây dựng khung giao diện: Header, Footer, Sidebar, Layout chính (Nên dùng template).
  - [ ] Ghép các API hiển thị dữ liệu người dùng, luồng đăng nhập/đăng ký trên web.

### Giai đoạn 4: Phát triển Ứng dụng Mobile (Tuần 4 - 5)
- [ ] **Xây dựng UI Mobile:** Lên khung giao diện sẵn cho các màn hình chính (Trang chủ, Đăng nhập, Profile...).
- [ ] **Tích hợp API:**
  - [ ] Viết service gọi API từ Backend (.NET).
  - [ ] Xử lý lưu trữ JWT trên thiết bị di động (Secure Storage).
  - [ ] Hoàn thiện luồng thao tác trên Mobile app.

### Giai đoạn 5: Triển khai & Kiểm thử (Tuần 5 - 6)
- [ ] **Thiết lập Môi trường Azure:**
  - [ ] Tạo Azure App Service cho Backend và Web.
  - [ ] Tạo Azure SQL Database.
- [ ] **Cấu hình CI/CD:**
  - [ ] Viết pipeline tự động Build & Test.
  - [ ] Viết pipeline tự động Deploy (CD) mã nguồn lên Azure khi có code mới gộp vào nhánh `main`.
- [ ] **Kiểm thử toàn diện:** Test luồng dữ liệu giữa Web, Mobile và Backend.

---

## 📦 3. Danh sách Sản phẩm Bàn giao (Deliverables)

Dự án phải đảm bảo có đủ 3 sản phẩm sau khi nghiệm thu:
1.  [ ] **Trang Web Client** (Hoạt động trơn tru, hiển thị tốt).
2.  [ ] **Trang Web Admin** (Bảo mật bằng tài khoản quản trị, đủ tính năng quản lý).
3.  [ ] **Ứng dụng Mobile** (Có khung giao diện, gọi được API thành công).
4.  [ ] **Hệ thống CI/CD & Cloud** (Chứng minh được luồng deploy tự động lên Azure).

---
*Ghi chú: Lịch trình các tuần ở trên mang tính chất tham khảo, nhóm có thể tự điều chỉnh dựa theo deadline thực tế của eProject.*