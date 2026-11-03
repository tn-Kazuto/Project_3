# SRS 02 – Non-Functional Requirements

| ID | Nhóm | Yêu cầu | Cách kiểm chứng |
|---|---|---|---|
| NFR-AVL-01 | Availability | Uptime mục tiêu ≥ 99% (giờ làm việc), có trang lỗi thân thiện khi bảo trì. | Giám sát health-check `/health` |
| NFR-REL-01 | Reliability | Mọi lỗi không bắt được trả về JSON chuẩn (`traceId`, `message`) qua Exception Middleware; không lộ stack trace. | Test API lỗi |
| NFR-REL-02 | Reliability | Giao dịch thanh toán + kích hoạt Subscription chạy trong một transaction (all-or-nothing). | Integration test |
| NFR-REL-03 | Reliability | Sao lưu CSDL hằng ngày, lưu giữ tối thiểu 7 bản (khớp "Data Backup" trong brief). | Kiểm tra job backup |
| NFR-MNT-01 | Maintainability | Kiến trúc phân lớp Controller → Service → Repository; DTO tách khỏi Entity. | Code review |
| NFR-MNT-02 | Maintainability | Mọi code block có comment, logic được giải thích (Standards plan). | Review checklist |
| NFR-MNT-03 | Maintainability | Độ phủ unit test backend ≥ 70% ở tầng Service; frontend ≥ 60% ở hooks/services. | Coverage report |
| NFR-MNT-04 | Maintainability | Naming convention thống nhất (C#: PascalCase; JS/TS: camelCase; bảng số ít). | Linter/analyzer |
| NFR-POR-01 | Portability | Chạy trên Windows/Linux; cấu hình qua `appsettings.*.json` và biến môi trường. | Deploy thử |
| NFR-CMP-01 | Compatibility | Hỗ trợ 2 phiên bản mới nhất của Chrome, Edge, Firefox, Safari; Android/iOS browser. | Cross-browser test |
| NFR-USE-01 | Usability | Người dùng mới hoàn tất đăng ký + thanh toán trong ≤ 3 phút, không cần hướng dẫn. | UAT |
| NFR-LOC-01 | Localization | Giao diện tiếng Anh; ngày giờ lưu UTC, hiển thị theo múi giờ trình duyệt; tiền tệ USD. | Test hiển thị |
| NFR-DAT-01 | Data integrity | Ràng buộc FK, unique Email, check Rating 1–5 ở mức CSDL; migration có version. | Test migration |
| NFR-DAT-02 | Data retention | Xóa mềm Contest/Recipe có liên kết; dữ liệu thanh toán giữ tối thiểu 5 năm. | Review |
| NFR-LOG-01 | Logging | Log có cấu trúc (Serilog hoặc tương đương) cho auth, thanh toán, hành động Admin; không log mật khẩu/token. | Review log |
| NFR-SCA-01 | Scalability | API stateless (JWT) để có thể scale ngang; ảnh lưu ở thư mục/Blob tách khỏi app server. | Kiến trúc |
| NFR-ACC-01 | Accessibility | Đạt WCAG 2.1 mức AA cho các luồng chính (chi tiết ở 05-ui-ux). | Axe/Lighthouse |
| NFR-DOC-01 | Documentation | Bàn giao đủ bộ báo cáo: Certificate, TOC, Problem Definition, CRS, Project Plan, ERD, Algorithms, GUI Standards, Interface Design, Task Sheet, Review Report, Unit Test Checklist, Final Checklist. | Checklist bàn giao |
| NFR-DEL-01 | Delivery | Gửi 2 email trạng thái (cách nhau 10 ngày) với tiêu đề bắt đầu bằng `STATUS:`/`DOUBT:`/`PROJECT SUBMISSION:` kèm form feedback. | Hồ sơ gửi |

## Ràng buộc môi trường
- Backend: .NET LTS mới nhất khả dụng, SQL Server (hoặc tương đương EF Core hỗ trợ).
- Frontend: React + bundler hiện đại (Vite) – các yêu cầu phần cứng cũ trong brief gốc (Pentium 166, Windows 98, J2SDK 1.4) được coi là **lỗi thời** và thay bằng ràng buộc trên; cần Aptech xác nhận cho phép đổi công nghệ.
