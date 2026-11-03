# SRS 03 – Security Requirements

## 1. Tài sản cần bảo vệ
Thông tin tài khoản và mật khẩu · dữ liệu thanh toán · nội dung Members-only (giá trị kinh doanh) · bài dự thi trước khi công bố · quyền Admin.

## 2. Yêu cầu bảo mật

| ID | Nhóm | Yêu cầu | Tham chiếu |
|---|---|---|---|
| SEC-AUTH-01 | Authentication | Mật khẩu băm bằng BCrypt/Argon2 (hoặc ASP.NET Identity hasher) có salt; không lưu plaintext. | OWASP A02 |
| SEC-AUTH-02 | Authentication | JWT ký HS256/RS256, access token sống 30–60 phút; secret lấy từ biến môi trường/secret store. | A02 |
| SEC-AUTH-03 | Authentication | Khóa tạm tài khoản 15 phút sau 5 lần đăng nhập sai liên tiếp; thông báo lỗi chung ("Email hoặc mật khẩu không đúng"). | A07 |
| SEC-AUTH-04 | Authentication | Chính sách mật khẩu: ≥ 8 ký tự, chữ hoa + thường + số. | A07 |
| SEC-AUTHZ-01 | Authorization | Kiểm tra quyền **phía server** bằng `[Authorize(Roles=...)]` và policy `ActiveMember`; ẩn menu ở frontend chỉ là UX. | A01 |
| SEC-AUTHZ-02 | Authorization | Chống IDOR: Member chỉ sửa/xóa tài nguyên có `AuthorId == currentUser.Id`. | A01 |
| SEC-AUTHZ-03 | Authorization | Recipe/Tip Members-only không lộ nội dung qua API cho Guest (không chỉ ẩn ở UI); danh sách trả về chỉ gồm metadata. | A01 |
| SEC-AUTHZ-04 | Authorization | Gói hết hạn bị chặn ở server (không phụ thuộc token cũ): kiểm tra EndDate khi truy cập nội dung Members-only. | A01 |
| SEC-INP-01 | Input validation | Validate mọi input ở server (độ dài, kiểu, định dạng email, whitelist file ảnh theo magic bytes). | A03 |
| SEC-INP-02 | Injection | Dùng EF Core tham số hóa; cấm nối chuỗi SQL. | A03 |
| SEC-INP-03 | XSS | Escape đầu ra; React mặc định escape; nếu cho phép định dạng rich text phải sanitize bằng allow-list. Header CSP. | A03 |
| SEC-INP-04 | Upload | Ảnh ≤ 2 MB, chỉ JPG/PNG/WebP, đổi tên file bằng GUID, lưu ngoài thư mục thực thi. | A04 |
| SEC-CSRF-01 | CSRF | Token gửi bằng header `Authorization` (không cookie) nên miễn CSRF; nếu dùng cookie httpOnly phải có SameSite + anti-forgery. | A01 |
| SEC-TRN-01 | Transport | Bắt buộc HTTPS, HSTS; CORS chỉ cho origin frontend đã khai báo. | A05 |
| SEC-HDR-01 | Headers | `X-Content-Type-Options`, `X-Frame-Options`/frame-ancestors, `Referrer-Policy`, CSP. | A05 |
| SEC-PAY-01 | Payment | Không lưu số thẻ/CVV; chỉ lưu `PaymentRef` và trạng thái từ cổng thanh toán; xác thực callback/webhook bằng chữ ký. | PCI-DSS |
| SEC-PAY-02 | Payment | Số tiền do **server** quyết định theo Plan; bỏ qua mọi giá trị amount gửi từ client. | A04 |
| SEC-ABU-01 | Anti-abuse | Rate limit: login 10 req/phút/IP; gửi feedback & submission 5 req/phút/IP; CAPTCHA cho Guest. | A04 |
| SEC-PRV-01 | Privacy | Chỉ thu thập dữ liệu tối thiểu; Email/Phone không hiển thị công khai; cho phép người dùng yêu cầu xóa tài khoản. | GDPR (tham khảo) |
| SEC-LOG-01 | Audit | Ghi audit: đăng nhập, đổi mật khẩu, tạo/xóa contest, công bố người thắng, xóa nội dung. | A09 |
| SEC-CFG-01 | Config | Không commit secret/connection string vào repo; mật khẩu Admin seed đổi bắt buộc ở lần đăng nhập đầu. | A05 |
| SEC-DEP-01 | Supply chain | Quét dependency định kỳ (`dotnet list package --vulnerable`, `npm audit`). | A06 |
| SEC-ERR-01 | Error handling | Không trả stack trace/chi tiết SQL cho client ở môi trường Production. | A05 |

## 3. Mô hình đe dọa tóm tắt (STRIDE)

| Mối đe dọa | Kịch bản | Biện pháp |
|---|---|---|
| Spoofing | Chiếm tài khoản Admin | SEC-AUTH-01/03/04, đổi mật khẩu seed |
| Tampering | Sửa amount thanh toán, sửa `IsFree` | SEC-PAY-02, SEC-AUTHZ-01 |
| Repudiation | Admin chối bỏ việc xóa nội dung | SEC-LOG-01 |
| Information disclosure | Lộ recipe Members-only qua API | SEC-AUTHZ-03/04 |
| Denial of service | Spam submission/feedback | SEC-ABU-01 |
| Elevation of privilege | Member gọi API Admin | SEC-AUTHZ-01/02 |
