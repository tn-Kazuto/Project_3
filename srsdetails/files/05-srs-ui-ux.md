# SRS 05 – UI/UX Requirements

## 1. Nguyên tắc thiết kế
- Cảm giác ẩm thực: hình ảnh món ăn lớn, màu ấm (cam/đỏ gạch/kem), typography dễ đọc.
- Mobile-first, responsive: 360 px · 768 px · 1280 px.
- Một hành động chính nổi bật trên mỗi màn hình (CTA: *Join now*, *View recipe*, *Submit entry*).
- Nhất quán component (nút, form, card, modal) theo GUI Standards Document.

## 2. Sơ đồ trang (Sitemap)

| Khu vực | Trang | Route đề xuất |
|---|---|---|
| Public | Home | `/` |
| Public | Login / Register (+ chọn gói, thanh toán) | `/login`, `/register`, `/checkout` |
| Public | Free Recipes, chi tiết | `/recipes`, `/recipes/:id` |
| Public | Tips | `/tips`, `/tips/:id` |
| Public | Contests, chi tiết | `/contests`, `/contests/:id` |
| Public | Announcements | `/announcements` |
| Public | Feedback · FAQ | `/feedback`, `/faq` |
| Member | Profile (xem + sửa) | `/member/profile` |
| Member | Tất cả recipe/tip, Gửi recipe/tip | `/member/recipes/new`, `/member/tips/new` |
| Member | Bài của tôi | `/member/my-posts` |
| Member | Gửi bài dự thi | `/contests/:id/submit` |
| Admin | Dashboard | `/admin` |
| Admin | Quản lý Recipe/Tip (Free/Members-only) | `/admin/recipes`, `/admin/tips` |
| Admin | Quản lý Contest, xem bài dự thi, chọn người thắng | `/admin/contests`, `/admin/contests/:id/submissions` |
| Admin | Announcements · Feedback · FAQ | `/admin/announcements`, `/admin/feedbacks`, `/admin/faqs` |
| System | 403 · 404 · 500 | `/403`, `*` |

## 3. Yêu cầu UI chung

| ID | Yêu cầu |
|---|---|
| UI-01 | Header cố định: logo, menu theo vai trò, nút Login/Join hoặc avatar + Logout. Menu thu gọn thành hamburger < 768 px. |
| UI-02 | Mỗi recipe card: ảnh, tiêu đề, category, rating, nhãn **Free** / **Members** (kèm icon khóa). |
| UI-03 | Recipe Members-only với Guest: hiển thị tiêu đề + ảnh mờ + CTA đăng ký, **không** hiển thị nội dung. |
| UI-04 | Form: nhãn rõ ràng, validate inline khi blur, thông báo lỗi cụ thể bên dưới trường, nút Submit khóa trong lúc gửi. |
| UI-05 | Mọi danh sách: phân trang, trạng thái rỗng (empty state) có hướng dẫn, skeleton khi tải. |
| UI-06 | Hành động hủy (xóa recipe/contest/feedback) bắt buộc hộp thoại xác nhận. |
| UI-07 | Thông báo kết quả bằng toast (thành công/lỗi) tự ẩn sau 4 giây, có thể đóng thủ công. |
| UI-08 | Trạng thái contest có badge màu: Open (xanh lá), Closed (xám), Announced (vàng); hiển thị đếm ngược đến EndDate. |
| UI-09 | Trang Announcements trình bày người thắng bằng thẻ huy chương (1st/2nd/3rd) kèm tên bài và nhận xét. |
| UI-10 | Trang thanh toán: so sánh 2 gói side-by-side, nhấn mạnh tiết kiệm của Yearly (tiết kiệm $20 so với 12 × $10), tóm tắt đơn hàng trước khi xác nhận. |
| UI-11 | Trang Profile: chế độ xem và chỉnh sửa ngay tại trang (inline edit), hiển thị gói hiện tại và ngày hết hạn, nút Gia hạn. |
| UI-12 | Form Recipe: nguyên liệu nhập dạng danh sách động (thêm/xóa dòng), các bước nhập từng bước có thể sắp xếp. |
| UI-13 | Dashboard Admin: số liệu nhanh (recipe, member, contest đang mở, feedback mới) + lối tắt tác vụ. |
| UI-14 | Footer: thông tin liên hệ James Thew, liên kết FAQ/Feedback. |

## 4. Accessibility (WCAG 2.1 AA)

| ID | Yêu cầu |
|---|---|
| ACC-01 | Tương phản chữ/nền ≥ 4.5:1 (chữ thường), ≥ 3:1 (chữ lớn, icon). |
| ACC-02 | Điều hướng bằng bàn phím đầy đủ, focus ring rõ, thứ tự Tab hợp lý, có "Skip to content". |
| ACC-03 | Ảnh có `alt` mô tả; ảnh trang trí `alt=""`. |
| ACC-04 | Form có `label` gắn `for`; lỗi gắn `aria-describedby`; toast dùng `aria-live`. |
| ACC-05 | Không truyền đạt thông tin chỉ bằng màu (badge có chữ/icon). |
| ACC-06 | Cỡ chữ cơ bản 16 px, phóng 200% không vỡ bố cục. |
| ACC-07 | Hộp thoại (modal) giữ focus bên trong và đóng bằng `Esc`. |

## 5. Thông điệp & trạng thái (mẫu)

| Tình huống | Thông điệp |
|---|---|
| Login sai | "Email hoặc mật khẩu không đúng." |
| Email trùng | "Email này đã được đăng ký. Bạn muốn đăng nhập?" |
| Thanh toán thất bại | "Thanh toán chưa thành công. Tài khoản chưa bị trừ tiền. Vui lòng thử lại." |
| Guest mở nội dung Members | "Nội dung dành cho thành viên. Tham gia từ $10/tháng để xem đầy đủ." |
| Contest đã đóng | "Cuộc thi đã kết thúc, bạn không thể gửi thêm bài." |
| Gửi bài thành công | "Bài dự thi đã được gửi. Kết quả sẽ được công bố tại trang Announcements." |
| Danh sách rỗng | "Chưa có công thức nào phù hợp. Thử đổi từ khóa hoặc danh mục." |

## 6. Cấu trúc frontend tương ứng

`pages/public`, `pages/member`, `pages/admin` · `components` (RecipeCard, ContestCard, FormField, Toast, ConfirmDialog, Pagination) · `context` (AuthContext) · `services` (API client + interceptor JWT) · `hooks` (useAuth, usePagination, useDebounce) · route guard `RequireRole` / `RequireActiveMember`.
