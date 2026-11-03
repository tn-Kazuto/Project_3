# SRS 01 – Functional Requirements

Ưu tiên: **M** = Must, **S** = Should, **C** = Could. Vai trò: G = Guest, M = Member, A = Admin.

## 1. Module Authentication & Membership (AUTH)

| ID | Yêu cầu | Actor | Ưu tiên |
|---|---|---|---|
| FR-AUTH-01 | Đăng ký: nhập FullName, Email, Password, Confirm Password, chọn gói Monthly ($10) / Yearly ($100). | G | M |
| FR-AUTH-02 | Sau khi thanh toán thành công, tài khoản được kích hoạt và tự đăng nhập; thanh toán thất bại → tài khoản không Active, hiển thị lý do và cho thử lại. | G | M |
| FR-AUTH-03 | Đăng nhập bằng Email + Password, trả về JWT; hiển thị menu theo Role. | G | M |
| FR-AUTH-04 | Đăng xuất (xóa token phía client). | M, A | M |
| FR-AUTH-05 | Khi gói hết hạn, hiển thị banner "Gia hạn" và giới hạn quyền như Guest (A-02). | M | M |
| FR-AUTH-06 | Gia hạn/đổi gói trong trang Profile. | M | S |
| FR-AUTH-07 | Quên mật khẩu qua email token (hết hạn 30 phút). | M | C |
| FR-AUTH-08 | Đổi mật khẩu khi đã đăng nhập. | M, A | S |

**Acceptance criteria – FR-AUTH-01/02**
- Email đã tồn tại → báo lỗi "Email đã được sử dụng", không tạo gói thanh toán.
- Password ≥ 8 ký tự, có chữ hoa, chữ thường, số.
- Thanh toán thành công tạo `Subscription` Active với EndDate đúng BR-02.

## 2. Module Home & Giới thiệu (HOME)

| ID | Yêu cầu | Actor | Ưu tiên |
|---|---|---|---|
| FR-HOME-01 | Trang chủ giới thiệu James Thew (tiểu sử, ảnh, thông tin liên hệ/chi tiết khách hàng). | All | M |
| FR-HOME-02 | Hiển thị công thức Free nổi bật, contest đang mở, thông báo mới nhất. | All | S |
| FR-HOME-03 | Menu chính theo vai trò: Guest (Home, Login/Register, Free Recipes, Contests, Announcements, Feedback, FAQ); Member và Admin xem mục 3–8. | All | M |

## 3. Module Recipes (RCP)

| ID | Yêu cầu | Actor | Ưu tiên |
|---|---|---|---|
| FR-RCP-01 | Danh sách recipe có phân trang, lọc theo Category, sắp xếp mới nhất/đánh giá. | G (Free), M, A (All) | M |
| FR-RCP-02 | Tìm kiếm theo từ khóa (title, ingredients), kết quả tuân theo quyền truy cập. | G, M, A | M |
| FR-RCP-03 | Xem chi tiết recipe: ảnh, mô tả, nguyên liệu, các bước, rating trung bình, danh sách feedback. | G, M, A | M |
| FR-RCP-04 | Tạo recipe kèm Ingredients + Procedure + Category + ảnh. | M, A | M |
| FR-RCP-05 | Admin đánh dấu recipe `Free` hoặc `Members-only`. | A | M |
| FR-RCP-06 | Xem/Sửa/Xóa recipe do mình tạo; Admin sửa/xóa mọi recipe. | M (own), A | M |
| FR-RCP-07 | Xem recipe do các Member khác gửi. | M, A | M |
| FR-RCP-08 | Truy cập recipe Members-only khi không đủ quyền → 403 và gợi ý đăng ký. | G | M |

**Acceptance criteria – FR-RCP-04**
- Title ≤ 150 ký tự, Ingredients và Procedure bắt buộc, ảnh JPG/PNG ≤ 2 MB.
- Sau khi lưu, recipe xuất hiện trong danh sách và tìm kiếm.

## 4. Module Tips (TIP)

| ID | Yêu cầu | Actor | Ưu tiên |
|---|---|---|---|
| FR-TIP-01 | Danh sách, tìm kiếm, xem chi tiết tip theo quyền Free/Members-only. | G, M, A | M |
| FR-TIP-02 | Tạo tip (Title, Content). | M, A | M |
| FR-TIP-03 | Admin đặt Free/Members-only cho tip của mình. | A | M |
| FR-TIP-04 | Sửa/Xóa tip do mình tạo; Admin sửa/xóa mọi tip. | M (own), A | M |

## 5. Module Contests & Submissions (CON)

| ID | Yêu cầu | Actor | Ưu tiên |
|---|---|---|---|
| FR-CON-01 | Admin tạo contest: Title, Description, Type (Recipe/Tip), Prize, StartDate, EndDate. | A | M |
| FR-CON-02 | Admin xóa/đóng contest (BR-10). | A | M |
| FR-CON-03 | Xem danh sách contest (Open/Closed/Announced) và chi tiết. | All | M |
| FR-CON-04 | Gửi bài dự thi đúng Type khi contest Open (BR-06, BR-08); giới hạn số bài theo OQ-03. | M (G theo OQ-01) | M |
| FR-CON-05 | Admin xem toàn bộ bài dự thi của một contest, lọc theo tác giả/ngày. | A | M |
| FR-CON-06 | Thành viên xem/sửa/xóa bài dự thi của mình khi contest chưa đóng. | M | S |
| FR-CON-07 | Admin chọn người thắng (1–3), nhập nhận xét, công bố → tạo Announcement. | A | M |
| FR-CON-08 | Contest quá EndDate tự động chuyển `Closed`. | System | M |

## 6. Module Announcements (ANN)

| ID | Yêu cầu | Actor | Ưu tiên |
|---|---|---|---|
| FR-ANN-01 | Xem danh sách thông báo (người thắng contest) mới nhất trước, có phân trang. | All | M |
| FR-ANN-02 | Admin công bố/sửa/gỡ thông báo. | A | M |
| FR-ANN-03 | Thông báo hiển thị tên người thắng, tên bài, giải thưởng, nhận xét. | All | M |

## 7. Module Feedback (FBK)

| ID | Yêu cầu | Actor | Ưu tiên |
|---|---|---|---|
| FR-FBK-01 | Gửi feedback cho một recipe (Rating 1–5 + Message). Guest cần Name + Email. | G, M | M |
| FR-FBK-02 | Gửi feedback chung về website (không gắn recipe). | G, M | M |
| FR-FBK-03 | Admin xem toàn bộ feedback, lọc theo recipe/rating/ngày. | A | M |
| FR-FBK-04 | Admin xóa feedback không phù hợp. | A | S |

## 8. Module Profile (PRF)

| ID | Yêu cầu | Actor | Ưu tiên |
|---|---|---|---|
| FR-PRF-01 | Xem profile: FullName, Email, Phone, Bio, Avatar, thông tin gói và ngày hết hạn. | M, A | M |
| FR-PRF-02 | Sửa profile ngay trên trang profile; Email không đổi được. | M, A | M |
| FR-PRF-03 | Xem lịch sử thanh toán. | M | S |

## 9. Module FAQ

| ID | Yêu cầu | Actor | Ưu tiên |
|---|---|---|---|
| FR-FAQ-01 | Hiển thị 7 câu hỏi chuẩn: cách thành viên, phí đăng ký, xem recipe/tip, Guest dự thi, đăng recipe/tip, gửi feedback, biết người thắng. | All | M |
| FR-FAQ-02 | Admin thêm/sửa/xóa/sắp xếp FAQ. | A | S |

## 10. Ma trận phân quyền

| Chức năng | Guest | Member | Admin |
|---|:-:|:-:|:-:|
| Xem recipe/tip Free | ✔ | ✔ | ✔ |
| Xem recipe/tip Members-only | ✘ | ✔ | ✔ |
| Tìm kiếm | Free | All | All |
| Gửi recipe/tip | ✘ | ✔ | ✔ |
| Sửa/xóa nội dung của mình | – | ✔ | ✔ |
| Sửa/xóa nội dung của người khác | ✘ | ✘ | ✔ |
| Xem contest | ✔ | ✔ | ✔ |
| Gửi bài dự thi | OQ-01 | ✔ | ✘ |
| Tạo/xóa contest, chọn người thắng | ✘ | ✘ | ✔ |
| Xem Announcements | ✔ | ✔ | ✔ |
| Gửi feedback | ✔ | ✔ | ✔ |
| Xem toàn bộ feedback | ✘ | ✘ | ✔ |
| Sửa profile | ✘ | ✔ | ✔ |
| Quản lý FAQ | ✘ | ✘ | ✔ |

## 11. Luồng nghiệp vụ chính

**Đăng ký thành viên:** Guest → Register → chọn gói → thanh toán → (thành công) Subscription Active → đăng nhập; (thất bại) quay lại chọn gói.

**Contest:** Admin tạo contest → Open → Member gửi bài → hết hạn/Admin đóng → Admin xem bài, chấm → chọn người thắng → công bố → Announcement hiển thị cho mọi người.

## 12. API tham khảo (REST, prefix `/api`)

| Nhóm | Endpoint chính |
|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/change-password` |
| Subscription | `POST /subscriptions/checkout`, `GET /subscriptions/me` |
| Recipe | `GET/POST /recipes`, `GET/PUT/DELETE /recipes/{id}` |
| Tip | `GET/POST /tips`, `GET/PUT/DELETE /tips/{id}` |
| Contest | `GET/POST /contests`, `DELETE /contests/{id}`, `POST /contests/{id}/submissions`, `GET /contests/{id}/submissions` (Admin), `POST /contests/{id}/announce` |
| Announcement | `GET /announcements` |
| Feedback | `POST /feedbacks`, `GET /feedbacks` (Admin) |
| Profile | `GET/PUT /users/me` |
| FAQ | `GET /faqs`, `POST/PUT/DELETE /faqs/{id}` (Admin) |
