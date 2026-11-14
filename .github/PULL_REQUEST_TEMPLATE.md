## 🍳 Culinary Atelier - Frontend Pull Request

### 1. Mô tả & Mục tiêu Thay đổi (Overview & Intent)
<!-- Mô tả tóm tắt tính năng, cải tiến giao diện hoặc sửa lỗi được thực hiện trong PR này -->

### 2. Tiêu chuẩn Thẩm mỹ & Taste Craft Checklist (Impeccable Design Standards)
- [ ] **Design Tokens Adherence:** Tuân thủ hệ thống token `luxury-tokens.css` (EB Garamond, Instrument Sans, Warm Alabaster `#f3eee4`, Deep Charcoal `#262321`, Fine Gold `#b69355`).
- [ ] **Zero Templated Tropes:** Không lạm dụng bóng mờ SaaS generic (`box-shadow`), bo tròn tùy tiện; duy trì góc sắc kiến trúc `border-radius: 0px` và đường hairline rules mảnh mai.
- [ ] **Bespoke Typographic Harmony:** Tỷ lệ kích thước chữ theo thang chuẩn, line-length < 80 ký tự cho văn bản đọc, hạn chế viết hoa tùy tiện, bảo toàn Roman numerals trình tự.
- [ ] **Micro-Interactions & Restraint:** Chuyển động nhẹ nhàng, có mục đích (150ms interaction); tôn trọng `prefers-reduced-motion`.

### 3. Đủ 4 Trạng Thái Giao Diện Bắt Buộc (The 4 Mandatory UI States)
- [ ] **Loading:** Shimmer skeleton đồng bộ tông màu ấm của Atelier (thay vì generic spinners).
- [ ] **Empty:** Trạng thái trống có chỉ dẫn rõ ràng, trích dẫn ẩm thực và CTA hành động.
- [ ] **Error:** Thông báo lỗi thân thiện, giải thích nguyên nhân và nút Thử lại (Retry).
- [ ] **Success:** Phản hồi tinh tế, thông điệp rõ ràng không cản trở thao tác người dùng.

### 4. Khả Năng Tiếp Cận & Chuẩn WCAG 2.1 AA (Accessibility Verification)
- [ ] Điều hướng bàn phím hoàn chỉnh (Keyboard navigation with visible `:focus-visible` gold outline).
- [ ] Skip to Content link hoạt động đúng chuẩn cho người dùng bàn phím và screen-readers.
- [ ] HTML ngữ nghĩa (`<main>`, `<nav>`, `<header>`, `<article>`, `<button>`, `<a>`).
- [ ] Mọi hình ảnh có thuộc tính `alt` mô tả chuẩn xác.
- [ ] Độ tương phản màu chữ đạt chuẩn tối thiểu WCAG AA (>= 4.5:1).

### 5. Kiểm Thử Tự Động & Hồi Quy (Automated Testing)
- [ ] Chạy `npm test` thành công (100% test suites pass, không có lỗi `act(...)` hay cảnh báo rò rỉ bộ nhớ).
- [ ] Không có `any` hoặc bypass TypeScript/Linting.
