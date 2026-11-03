# SRS 06 – Test Case & Checklist

Ký hiệu: **Pri** H = High, M = Medium, L = Low · Cột ☐ dùng để đánh dấu khi đã chạy (Pass/Fail/Blocked).

## Phần A – Chiến lược kiểm thử

| Cấp độ | Phạm vi | Công cụ | Trách nhiệm |
|---|---|---|---|
| Unit (backend) | Service, validator, quy tắc BR-01…11 | xUnit/NUnit + Moq | Dev |
| Integration (backend) | Controller + DB (in-memory/SQLite/Testcontainers), phân quyền | WebApplicationFactory | Dev |
| Unit/Component (frontend) | Hooks, services, form validate | Jest/Vitest + Testing Library | Dev |
| System / E2E | Các luồng chính ở Mục 5 | Playwright/Cypress | QA |
| Performance | Mục 11 | k6/JMeter, Lighthouse | QA |
| Security | Mục 10 | OWASP ZAP, gitleaks, npm audit | QA/Dev |
| UAT | Theo tiêu chí ở Phần D | Thủ công | BA + khách hàng |

**Tiêu chí vào/ra:** vào khi build ổn định, seed xong; ra khi 100% case H Pass, ≥ 95% case M Pass, không còn lỗi Critical/High mở.

## Phần B – Test case chi tiết

### 1. Authentication & Membership (TC-AUTH)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-AUTH-01 | FR-AUTH-01/02 | Đăng ký + thanh toán Monthly thành công | Nhập thông tin hợp lệ, chọn Monthly, thanh toán sandbox OK | Subscription Active, EndDate = +30 ngày, tự đăng nhập, menu Member | H | ☐ |
| TC-AUTH-02 | FR-AUTH-01/02 | Đăng ký + thanh toán Yearly thành công | Chọn Yearly ($100) | EndDate = +365 ngày, Amount = 100 | H | ☐ |
| TC-AUTH-03 | BR-09 | Email đã tồn tại | Đăng ký lại email cũ (đổi hoa/thường) | Báo email đã dùng, không tạo thanh toán | H | ☐ |
| TC-AUTH-04 | SEC-AUTH-04 | Mật khẩu yếu | Password `abc123` | Báo lỗi chính sách, không gửi request | H | ☐ |
| TC-AUTH-05 | FR-AUTH-01 | Confirm password không khớp | Hai mật khẩu khác nhau | Lỗi inline tại trường Confirm | M | ☐ |
| TC-AUTH-06 | FR-AUTH-02 | Thanh toán thất bại | Dùng thẻ giả lập bị từ chối | Tài khoản không Active, có thể thử lại, không tạo Subscription Active | H | ☐ |
| TC-AUTH-07 | NFR-REL-02 | Lỗi giữa chừng khi kích hoạt | Mô phỏng exception sau thanh toán | Transaction rollback, trạng thái nhất quán | M | ☐ |
| TC-AUTH-08 | FR-AUTH-03 | Đăng nhập đúng | Email + password hợp lệ | Nhận JWT, điều hướng theo Role | H | ☐ |
| TC-AUTH-09 | FR-AUTH-03 | Đăng nhập sai mật khẩu | Sai password | Thông báo chung, HTTP 401 | H | ☐ |
| TC-AUTH-10 | SEC-AUTH-03 | Khóa tài khoản sau 5 lần sai | Sai 5 lần liên tiếp | Tạm khóa 15 phút, lần đúng kế tiếp vẫn bị từ chối | M | ☐ |
| TC-AUTH-11 | FR-AUTH-04 | Đăng xuất | Nhấn Logout rồi Back | Token bị xóa, trang bảo vệ yêu cầu đăng nhập | M | ☐ |
| TC-AUTH-12 | FR-AUTH-05 | Gói hết hạn | Đặt EndDate = hôm qua, đăng nhập | Banner gia hạn, chỉ xem Free, truy cập Members-only bị 403 | H | ☐ |
| TC-AUTH-13 | BR-02 | Gia hạn cộng dồn | Gia hạn khi còn 10 ngày | EndDate = EndDate cũ + thời hạn gói | M | ☐ |
| TC-AUTH-14 | SEC-AUTH-02 | Token hết hạn/bị sửa | Dùng JWT hết hạn hoặc sửa payload | 401, buộc đăng nhập lại | H | ☐ |

### 2. Home, Menu & Navigation (TC-HOME)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-HOME-01 | FR-HOME-01 | Trang chủ hiển thị thông tin James Thew | Mở `/` ở chế độ Guest | Có tiểu sử, ảnh, thông tin liên hệ | H | ☐ |
| TC-HOME-02 | FR-HOME-03 | Menu theo vai trò – Guest | Mở site chưa đăng nhập | Chỉ có Home, Login/Register, Free Recipes, Contests, Announcements, Feedback, FAQ | H | ☐ |
| TC-HOME-03 | FR-HOME-03 | Menu – Member | Đăng nhập Member | Có Profile, All Recipes/Tips, Send Recipe/Tip, My Posts; không có mục Admin | H | ☐ |
| TC-HOME-04 | FR-HOME-03 | Menu – Admin | Đăng nhập Admin | Có mục quản lý Contest, Feedback, Announcements, FAQ, Upload Recipe/Tip | H | ☐ |
| TC-HOME-05 | SEC-AUTHZ-01 | Truy cập URL Admin bằng Member | Gõ `/admin/contests` | Chuyển tới 403, API cũng trả 403 | H | ☐ |
| TC-HOME-06 | UI | Trang 404 | Gõ URL không tồn tại | Hiện trang 404 kèm liên kết về Home | L | ☐ |

### 3. Recipes (TC-RCP)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-RCP-01 | FR-RCP-01/BR-03 | Guest xem danh sách | Mở `/recipes` ở chế độ Guest | Chỉ thấy recipe Free | H | ☐ |
| TC-RCP-02 | FR-RCP-08/SEC-AUTHZ-03 | Guest mở recipe Members-only bằng URL/API | GET `/api/recipes/{id}` của recipe Members | 403, không lộ Ingredients/Procedure | H | ☐ |
| TC-RCP-03 | FR-RCP-01 | Member xem tất cả | Đăng nhập Member | Thấy cả Free và Members-only | H | ☐ |
| TC-RCP-04 | FR-RCP-02 | Tìm kiếm có kết quả | Từ khóa `pasta` | Trả recipe khớp title/ingredients theo quyền | H | ☐ |
| TC-RCP-05 | FR-RCP-02 | Tìm kiếm không kết quả | Từ khóa `zzzz` | Empty state, không lỗi | M | ☐ |
| TC-RCP-06 | FR-RCP-02 | Guest tìm kiếm không lộ Members-only | Từ khóa trùng recipe Members | Không xuất hiện trong kết quả | H | ☐ |
| TC-RCP-07 | FR-RCP-01 | Lọc theo Category | Chọn Italian | Chỉ recipe Italian | M | ☐ |
| TC-RCP-08 | PERF-09 | Phân trang | Danh sách > 12 recipe, yêu cầu pageSize=500 | Giới hạn tối đa 50/trang | M | ☐ |
| TC-RCP-09 | FR-RCP-04 | Member tạo recipe hợp lệ | Đủ Title, Category, Ingredients, Procedure, ảnh 1 MB | Lưu thành công, mặc định Members-only (BR-04) | H | ☐ |
| TC-RCP-10 | FR-RCP-04 | Thiếu Ingredients | Bỏ trống Ingredients | Lỗi validate, không lưu | H | ☐ |
| TC-RCP-11 | SEC-INP-04 | Upload sai định dạng/quá cỡ | File `.exe` đổi đuôi `.jpg`; ảnh 5 MB | Từ chối cả hai trường hợp | H | ☐ |
| TC-RCP-12 | FR-RCP-05 | Admin đặt Free/Members-only | Admin đổi `IsFree` | Guest thấy/không thấy tương ứng ngay | H | ☐ |
| TC-RCP-13 | BR-04 | Member tự đặt Free | Gửi `IsFree=true` qua API khi là Member | Bị bỏ qua/403, giá trị vẫn false | H | ☐ |
| TC-RCP-14 | FR-RCP-06/BR-05 | Sửa recipe của mình | Member sửa recipe do mình tạo | Cập nhật thành công, UpdatedAt đổi | H | ☐ |
| TC-RCP-15 | SEC-AUTHZ-02 | Sửa recipe của người khác (IDOR) | Member A gọi PUT recipe của B | 403 | H | ☐ |
| TC-RCP-16 | FR-RCP-06 | Admin xóa recipe bất kỳ | Admin xóa recipe Member | Xóa thành công, có xác nhận | M | ☐ |
| TC-RCP-17 | FR-RCP-06 | Xóa recipe có feedback | Xóa recipe đã có feedback | Xử lý theo BR-10 (soft delete), không lỗi FK | M | ☐ |
| TC-RCP-18 | FR-RCP-07 | Member xem bài Member khác | Mở recipe do Member khác gửi | Xem được | M | ☐ |
| TC-RCP-19 | SEC-INP-03 | XSS trong recipe | Procedure chứa `<script>alert(1)</script>` | Hiển thị dạng văn bản, không chạy script | H | ☐ |

### 4. Tips (TC-TIP)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-TIP-01 | FR-TIP-01 | Guest xem tip Free | Mở `/tips` | Chỉ tip Free | H | ☐ |
| TC-TIP-02 | FR-TIP-01 | Guest xem tip Members-only | Gọi API chi tiết | 403 | H | ☐ |
| TC-TIP-03 | FR-TIP-02 | Member tạo tip | Title + Content hợp lệ | Lưu thành công | H | ☐ |
| TC-TIP-04 | FR-TIP-02 | Tip thiếu Content | Bỏ trống Content | Báo lỗi | M | ☐ |
| TC-TIP-05 | FR-TIP-03 | Admin đặt Free cho tip | Đổi IsFree | Guest xem được | M | ☐ |
| TC-TIP-06 | FR-TIP-04 | Sửa/xóa tip của người khác | Member A sửa tip của B | 403 | H | ☐ |
| TC-TIP-07 | FR-TIP-04 | Sửa/xóa tip của mình | Member sửa rồi xóa | Thành công | M | ☐ |

### 5. Contests & Submissions (TC-CON)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-CON-01 | FR-CON-01 | Admin tạo contest hợp lệ | Điền đủ trường, EndDate > StartDate | Contest tạo, trạng thái Open khi đến ngày bắt đầu | H | ☐ |
| TC-CON-02 | FR-CON-01 | EndDate trước StartDate | Nhập ngược ngày | Báo lỗi validate | H | ☐ |
| TC-CON-03 | SEC-AUTHZ-01 | Member tạo contest | POST `/api/contests` bằng Member | 403 | H | ☐ |
| TC-CON-04 | FR-CON-03 | Xem danh sách contest | Guest mở `/contests` | Thấy badge trạng thái đúng | M | ☐ |
| TC-CON-05 | FR-CON-04/BR-08 | Gửi bài dự thi Recipe hợp lệ | Contest Type=Recipe, đủ Ingredients+Procedure | Lưu thành công, hiển thị trong 'My posts' | H | ☐ |
| TC-CON-06 | BR-08 | Gửi Tip vào contest Type=Recipe | Chỉ có Content | Từ chối do sai loại | H | ☐ |
| TC-CON-07 | BR-06 | Gửi bài khi contest Closed | Contest quá EndDate | Từ chối + thông báo 'Cuộc thi đã kết thúc' | H | ☐ |
| TC-CON-08 | FR-CON-08 | Tự động đóng contest | Đợi quá EndDate (hoặc chạy job) | Status = Closed | M | ☐ |
| TC-CON-09 | OQ-03 | Vượt giới hạn số bài | Gửi bài thứ 4 (giới hạn 3) | Từ chối, thông báo giới hạn | M | ☐ |
| TC-CON-10 | OQ-01 | Guest dự thi hợp lệ | Nhập Name, Email, CAPTCHA, nội dung | Bài lưu với nhãn Guest | M | ☐ |
| TC-CON-11 | OQ-01/SEC-ABU-01 | Guest spam bài dự thi | Gửi > 5 lần/phút | 429 Too Many Requests | M | ☐ |
| TC-CON-12 | FR-CON-05 | Admin xem toàn bộ bài dự thi | Mở submissions của contest | Thấy đủ bài, lọc theo tác giả/ngày được | H | ☐ |
| TC-CON-13 | SEC-AUTHZ-01 | Member xem bài dự thi của người khác trước công bố | GET submissions bằng Member | 403 (chỉ xem bài của mình) | H | ☐ |
| TC-CON-14 | FR-CON-06 | Sửa bài dự thi khi contest còn mở | Member sửa bài | Thành công | M | ☐ |
| TC-CON-15 | FR-CON-06 | Sửa bài dự thi sau khi đóng | Contest Closed | Từ chối | M | ☐ |
| TC-CON-16 | FR-CON-07 | Chọn 1 người thắng và công bố | Chọn bài, nhập nhận xét, Announce | Contest Announced, tạo Announcement | H | ☐ |
| TC-CON-17 | FR-CON-07 | Công bố khi chưa chọn người thắng | Bấm Announce không chọn | Từ chối (BR-07) | H | ☐ |
| TC-CON-18 | BR-07 | Gửi bài sau khi Announced | Gửi bài vào contest đã công bố | Từ chối | M | ☐ |
| TC-CON-19 | FR-CON-02/BR-10 | Xóa contest có bài dự thi | Admin xóa | Soft delete, Announcement cũ vẫn hiển thị | M | ☐ |

### 6. Announcements (TC-ANN)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-ANN-01 | FR-ANN-01/03 | Guest xem thông báo | Mở `/announcements` | Hiển thị người thắng, tên bài, giải thưởng, nhận xét; mới nhất trước | H | ☐ |
| TC-ANN-02 | FR-ANN-02 | Admin sửa thông báo | Đổi nội dung | Cập nhật hiển thị | M | ☐ |
| TC-ANN-03 | FR-ANN-02 | Admin gỡ thông báo | Gỡ | Không còn hiện ở trang công khai | M | ☐ |
| TC-ANN-04 | FR-ANN-01 | Phân trang | > 10 thông báo | Phân trang đúng | L | ☐ |

### 7. Feedback (TC-FBK)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-FBK-01 | FR-FBK-01 | Guest gửi feedback recipe Free | Name, Email, Rating 4, Message | Lưu thành công | H | ☐ |
| TC-FBK-02 | FR-FBK-01 | Guest gửi feedback cho recipe Members-only | POST với RecipeId Members | 403 | M | ☐ |
| TC-FBK-03 | BR-11 | Rating ngoài khoảng | Rating = 0 và 6 | Từ chối (cả UI và API) | H | ☐ |
| TC-FBK-04 | BR-11 | Message quá dài | 1001 ký tự | Từ chối | M | ☐ |
| TC-FBK-05 | FR-FBK-02 | Feedback chung website | Không chọn recipe | Lưu thành công | M | ☐ |
| TC-FBK-06 | FR-FBK-03 | Admin xem + lọc feedback | Lọc theo recipe/rating | Kết quả đúng | H | ☐ |
| TC-FBK-07 | SEC-AUTHZ-01 | Member xem danh sách toàn bộ feedback | GET `/api/feedbacks` bằng Member | 403 | H | ☐ |
| TC-FBK-08 | FR-FBK-04 | Admin xóa feedback | Xóa + xác nhận | Biến mất khỏi danh sách và rating trung bình cập nhật | L | ☐ |
| TC-FBK-09 | SEC-INP-03 | XSS trong feedback | Message chứa thẻ script | Escape khi hiển thị | H | ☐ |

### 8. Profile (TC-PRF)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-PRF-01 | FR-PRF-01 | Xem profile | Member mở Profile | Hiển thị thông tin + gói + ngày hết hạn | H | ☐ |
| TC-PRF-02 | FR-PRF-02 | Sửa profile hợp lệ | Đổi FullName, Phone, Bio | Lưu thành công ngay tại trang | H | ☐ |
| TC-PRF-03 | FR-PRF-02 | Sửa Email | Cố đổi Email | Trường bị khóa; API từ chối | M | ☐ |
| TC-PRF-04 | SEC-AUTHZ-02 | Sửa profile người khác | PUT `/users/{otherId}` | 403/404 | H | ☐ |
| TC-PRF-05 | FR-AUTH-08 | Đổi mật khẩu | Mật khẩu cũ đúng, mới hợp lệ | Thành công, đăng nhập bằng mật khẩu mới | M | ☐ |

### 9. FAQ (TC-FAQ)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-FAQ-01 | FR-FAQ-01 | Hiển thị 7 FAQ chuẩn | Mở `/faq` | Đủ 7 câu hỏi kèm câu trả lời, đúng thứ tự | H | ☐ |
| TC-FAQ-02 | FR-FAQ-02 | Admin thêm/sửa/xóa FAQ | CRUD một câu | Phản ánh ngay ở trang công khai | M | ☐ |
| TC-FAQ-03 | DbInitializer | Seed dữ liệu | Chạy app trên DB trống, chạy lại lần 2 | Có Admin, Category, 7 FAQ; lần 2 không tạo trùng | H | ☐ |

### 10. Bảo mật (TC-SEC)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-SEC-01 | SEC-INP-02 | SQL injection | Search `' OR 1=1 --` | Không lỗi, không lộ dữ liệu | H | ☐ |
| TC-SEC-02 | SEC-PAY-02 | Sửa amount phía client | Chặn request, đổi amount=1 | Server dùng giá chuẩn hoặc từ chối | H | ☐ |
| TC-SEC-03 | SEC-PAY-01 | Dữ liệu thẻ | Kiểm tra DB và log sau thanh toán | Không có số thẻ/CVV | H | ☐ |
| TC-SEC-04 | SEC-AUTHZ-04 | Dùng token cũ sau hết hạn gói | Token còn hạn, gói hết hạn | Truy cập Members-only bị 403 | H | ☐ |
| TC-SEC-05 | SEC-TRN-01 | CORS | Gọi API từ origin lạ | Bị chặn | M | ☐ |
| TC-SEC-06 | SEC-HDR-01 | Security headers | Kiểm tra response | Có CSP, X-Content-Type-Options, HSTS (prod) | M | ☐ |
| TC-SEC-07 | SEC-ERR-01 | Lỗi server ở Production | Gây exception | JSON chuẩn có traceId, không có stack trace | M | ☐ |
| TC-SEC-08 | SEC-ABU-01 | Rate limit login | 11 request/phút | 429 | M | ☐ |
| TC-SEC-09 | SEC-CFG-01 | Secret trong repo | Quét repo (gitleaks) | Không có secret | M | ☐ |
| TC-SEC-10 | SEC-AUTH-01 | Lưu mật khẩu | Xem bảng User | Chỉ có hash | H | ☐ |

### 11. Hiệu năng (TC-PERF)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-PERF-01 | PERF-01 | Load test đọc | 200 user, 15 phút | p95 ≤ 500 ms, lỗi < 1% | H | ☐ |
| TC-PERF-02 | PERF-02 | Load test ghi | 20% request ghi | p95 ≤ 800 ms | M | ☐ |
| TC-PERF-03 | PERF-05 | Tìm kiếm với 5.000 recipe | Seed dữ liệu lớn | ≤ 1 s | M | ☐ |
| TC-PERF-04 | PERF-06/07 | Lighthouse | Home, Recipe list, Recipe detail | LCP ≤ 2,5 s, bundle ≤ 250 KB gzip | M | ☐ |
| TC-PERF-05 | PERF-12 | N+1 query | Bật EF log khi load danh sách | Số truy vấn không tăng theo số bản ghi | M | ☐ |
| TC-PERF-06 | Spike | Spike 300 user khi công bố người thắng | k6 spike | Không sập, lỗi < 2% | L | ☐ |

### 12. UI/UX, Accessibility & Tương thích (TC-UI)

| ID | Req | Kịch bản | Bước / Dữ liệu | Kết quả mong đợi | Pri | ☐ |
|---|---|---|---|---|:-:|:-:|
| TC-UI-01 | UI-01 | Responsive 360/768/1280 | Mở các trang chính | Không vỡ bố cục, hamburger hoạt động | H | ☐ |
| TC-UI-02 | UI-03 | Guest xem card Members-only | Mở danh sách | Ảnh mờ + CTA đăng ký, không lộ nội dung | M | ☐ |
| TC-UI-03 | UI-04 | Validate inline | Bỏ trống trường bắt buộc | Lỗi cụ thể dưới từng trường | H | ☐ |
| TC-UI-04 | UI-06 | Xác nhận khi xóa | Bấm Xóa | Hiện dialog xác nhận | H | ☐ |
| TC-UI-05 | ACC-02 | Bàn phím | Duyệt chỉ bằng Tab/Enter/Esc | Hoàn thành luồng đăng ký, gửi bài | M | ☐ |
| TC-UI-06 | ACC-01 | Tương phản | Axe/Lighthouse | Không lỗi mức AA | M | ☐ |
| TC-UI-07 | NFR-CMP-01 | Cross-browser | Chrome, Edge, Firefox, Safari | Chức năng chính hoạt động | M | ☐ |
| TC-UI-08 | UI-05 | Empty & loading state | Danh sách rỗng / mạng chậm | Hiện empty state / skeleton | L | ☐ |

**Tổng số test case: 110.**

## Phần C – Checklist

### C1. Unit Testing Checklist (theo brief Aptech)
- [ ] Mỗi Service có test cho nhánh thành công và nhánh lỗi.
- [ ] Mỗi quy tắc BR-01…BR-11 có ít nhất một test tự động.
- [ ] Validator kiểm tra biên: độ dài, Rating 1–5, ngày bắt đầu/kết thúc.
- [ ] Repository test với DB in-memory/SQLite, kiểm tra FK/unique.
- [ ] Test phân quyền: mỗi endpoint kiểm tra 401 (chưa đăng nhập), 403 (sai vai trò), 200/201 (đúng vai trò).
- [ ] Frontend: test form validate, route guard `RequireRole`/`RequireActiveMember`, interceptor JWT.
- [ ] Mọi code block có comment giải thích logic.
- [ ] Coverage đạt NFR-MNT-03.

### C2. Checklist trước khi nghiệm thu (Final Checklist)
**Chức năng**
- [ ] Menu đúng cho Guest / Member / Admin.
- [ ] Đăng ký + thanh toán Monthly ($10) và Yearly ($100) hoạt động; hết hạn xử lý đúng.
- [ ] Recipe/Tip: CRUD, Free vs Members-only, tìm kiếm.
- [ ] Contest: tạo, xóa, gửi bài, xem bài, công bố người thắng.
- [ ] Announcements, Feedback, FAQ (7 câu), Profile hoạt động.
- [ ] Trang chủ có thông tin James Thew và chi tiết khách hàng.

**Chất lượng**
- [ ] Toàn bộ test case H Pass; báo cáo lỗi đã đóng.
- [ ] Không có secret trong repo; HTTPS/CORS cấu hình.
- [ ] Lighthouse: Performance, Accessibility ≥ 90 trên trang chính.
- [ ] Đã chạy load test và lưu báo cáo.

**Hồ sơ bàn giao (Documentation)**
- [ ] Certificate of Completion · Table of Contents · Problem Definition · Customer Requirement Specification
- [ ] Project Plan · E-R Diagram · Algorithms · GUI Standards Document · Interface Design Document
- [ ] Task Sheet · Project Review and Monitoring Report · Unit Testing Checklist · Final Checklist
- [ ] Source code có comment + báo cáo dự án (synopsis, code, documentation)
- [ ] 2 email trạng thái (`STATUS:`) và email nộp bài (`PROJECT SUBMISSION:`) kèm form feedback
- [ ] Đã sao lưu dữ liệu hằng ngày

## Phần D – Tiêu chí chấp nhận UAT
| # | Tiêu chí |
|---|---|
| 1 | James (Admin) tự đăng bài một recipe Free và một recipe Members-only trong ≤ 5 phút. |
| 2 | Người dùng mới đăng ký gói Monthly và xem recipe Members-only trong ≤ 3 phút. |
| 3 | James tạo một contest, nhận ≥ 3 bài dự thi, chọn người thắng và công bố; kết quả hiển thị đúng ở Announcements. |
| 4 | Guest không thể truy cập nội dung Members-only bằng bất kỳ đường nào (UI, URL, API). |
| 5 | Câu trả lời cho 7 FAQ khớp hành vi thực tế của hệ thống. |

## Phần E – Ma trận truy vết (Requirement → Test)
| Module | Requirement | Test case |
|---|---|---|
| Auth | FR-AUTH-01…08 | TC-AUTH-01…14 |
| Home/Menu | FR-HOME-01…03 | TC-HOME-01…06 |
| Recipe | FR-RCP-01…08 | TC-RCP-01…19 |
| Tip | FR-TIP-01…04 | TC-TIP-01…07 |
| Contest | FR-CON-01…08 | TC-CON-01…19 |
| Announcement | FR-ANN-01…03 | TC-ANN-01…04 |
| Feedback | FR-FBK-01…04 | TC-FBK-01…09 |
| Profile | FR-PRF-01…03 | TC-PRF-01…05 |
| FAQ | FR-FAQ-01…02 | TC-FAQ-01…03 |
| Security | SEC-* | TC-SEC-01…10 |
| Performance | PERF-* | TC-PERF-01…06 |
| UI/UX | UI-*, ACC-* | TC-UI-01…08 |
