# 🏛️ LUXURY DESIGN SYSTEM IMPLEMENTATION PLAN
## Dự án: James Thew 5-Star Culinary Website & Contests Platform
**Phong cách thiết kế:** Luxury Architectural Design System  
**Ngày lập:** 2026-10-30  
**Trạng thái:** ⏳ Chờ duyệt (Pending User Approval)  
**Quy tắc:** Tuyệt đối giữ nguyên tech stack (ASP.NET Core 10, React 19, Vite, SQL Server), toàn bộ routes, nội dung domain ẩm thực và tỷ lệ vượt qua kiểm thử tự động 100%.

---

## 🎨 1. QUY CHUẨN THIẾT KẾ LUXURY (DESIGN SYSTEM SPECIFICATION)

### 1.1. Triết lý Định danh (Identity)
- **Cấu trúc kiến trúc (Architectural Grid):** Trang web được bố cục theo lưới 12 cột chuẩn xác, 2 cột đầu tiên bên trái đóng vai trò là lề điều hướng trang trọng với một đường chỉ vàng chạy dọc (**Fine Gold Spine** `#b69355`) và các ký tự số La Mã (**Roman Numerals**: `I`, `II`, `III`, `IV`, `V`) đánh dấu các phân đoạn chính.
- **Kiểu góc vuông dứt khoát (Strict Square Corners):** Triệt để loại bỏ border-radius bo tròn kiểu phổ thông (`--dp-radius-control: 0`). Tất cả thẻ (cards), nút bấm (buttons), ô nhập liệu (inputs), khung ảnh (image frames) và huy hiệu (badges) đều sử dụng góc vuông sắc sảo, đẳng cấp.
- **Loại bỏ hiệu ứng rẻ tiền:** Không dùng gradients đa sắc, không dùng bóng đổ mờ (drop-shadow), không dùng hiệu ứng phát sáng neon. Sự phân tách giữa các khối được tạo ra bằng đường kẻ mảnh (**Hairline Rules** 1px `#d5cab8`) và nhịp điệu chuyển tông màu nền tự nhiên.

### 1.2. Nhịp điệu Màu sắc & Bề mặt (Tonal Sequence)
- **Ground (`#f3eee4` - Warm Alabaster):** Nền thạch cao ấm áp cho toàn bộ trang và khu vực đọc nội dung chính.
- **Ground-2 / Panel (`#e4dbcc` - Pale Taupe):** Tông màu be xám nhạt cho các khối bổ trợ, bảng tổng kết và form nhập liệu.
- **Field / Deep Charcoal (`#262321` & `#302c29`):** Nền than đen tuyền quý phái cho các khối nhấn mạnh đặc biệt (Hero mở màn, Banner lớp học, Footer, Cột so sánh gói thành viên nổi bật).
- **Accent Gold (`#b69355`):** Vàng kim cổ điển chỉ dùng cho các đường kẻ chỉ mảnh, đường xương sống (Spine), icon chi tiết nhỏ và các đường gạch chân tinh tế.
- **Accent Text (`#76591f` trên nền sáng / `#d2b071` trên nền tối):** Màu chữ vàng kim tương phản cao đảm bảo tiêu chuẩn trợ năng (Accessibility & Contrast).

### 1.3. Hệ thống Typography Chuẩn
- **EB Garamond ("Luxury Garamond"):** Dành riêng cho tiêu đề chính (Display & Headings), số La Mã, giá cước dịch vụ, số liệu thống kê lớn, và các trích dẫn in nghiêng (Italic Quotes). Tiêu đề lớn có line-height chặt (~0.96) thể hiện phong thái tạp chí ẩm thực cao cấp.
- **Instrument Sans ("Luxury Sans"):** Dành cho văn bản đọc thường (Body text), menu điều hướng, nhãn metadata, các nút bấm thao tác và nhãn viết hoa có khoảng cách giãn chữ đặc trưng (`letter-spacing: 0.16em`).

---

## 📐 2. BẢNG AUTHORITATIVE TOKENS

```css
:root {
  --dp-color-ground: #f3eee4;
  --dp-color-ground-2: #e4dbcc;
  --dp-color-ink: #262321;
  --dp-color-ink-2: #5f5750;
  --dp-color-field: #262321;
  --dp-color-field-deep: #302c29;
  --dp-color-field-line: #46403a;
  --dp-color-on-field: #f3eee4;
  --dp-color-on-field-2: #c6bdb0;
  --dp-color-panel: #e4dbcc;
  --dp-color-panel-line: #c6b89f;
  --dp-color-accent: #b69355;
  --dp-color-accent-text: #76591f;
  --dp-color-accent-light: #d2b071;
  --dp-color-rule: #d5cab8;

  --dp-typography-serif: "EB Garamond", "Luxury Garamond", Georgia, serif;
  --dp-typography-sans: "Instrument Sans", "Luxury Sans", -apple-system, BlinkMacSystemFont, Arial, sans-serif;
  --dp-typography-body: 1rem;
  --dp-typography-leading: 1.55;
  --dp-typography-label: 0.75rem;
  --dp-typography-label-tracking: 0.16em;
  --dp-typography-reading-small: 0.9375rem;
  --dp-typography-item-title: 1.375rem;
  --dp-typography-item-leading: 1.15;
  --dp-typography-item-tracking: -0.01em;

  --dp-spacing-pad: 3rem;
  --dp-spacing-gap: 1.5rem;
  --dp-spacing-pad-mid: 2rem;
  --dp-spacing-pad-narrow: 1.25rem;
  --dp-spacing-gap-compact: 1rem;
  --dp-spacing-section-block: 6rem;
  --dp-spacing-section-roomy: 7rem;

  --dp-radius-control: 0px;
  --dp-border-focus-width: 2px;
  --dp-border-hairline: 1px;
  --dp-motion-interaction: 150ms ease-out;
}
```

---

## 🗺️ 3. LỘ TRÌNH THỰC HIỆN TỪNG BƯỚC (PHASED EXECUTION PLAN)

### 🔹 Phase L1: Token Infrastructure, Font Integration & Global Resets [x] (Done ✓)
> **Mục tiêu:** Nạp đúng font chữ, xây dựng hệ thống CSS Variables chuẩn và thiết lập reset styles cho toàn bộ ứng dụng.
> **Kết quả kiểm thử:** 4/4 Test Cases PASS 100% | Toàn bộ 39/39 tests frontend PASS 100%

**Phạm vi công việc:**
1. [x] Cập nhật [index.html](file:///e:/project/Project_3/frontend/index.html): Nạp Google Fonts `EB Garamond` (weights 400, 500, 600, 700; styles normal & italic) và `Instrument Sans` (weights 400, 500, 600, 700).
2. [x] Tạo file token chuẩn [frontend/src/styles/luxury-tokens.css](file:///e:/project/Project_3/frontend/src/styles/luxury-tokens.css) chứa đầy đủ authoritative tokens của hệ thống Luxury.
3. [x] Cập nhật [frontend/src/styles/custom.css](file:///e:/project/Project_3/frontend/src/styles/custom.css):
   - Thiết lập body background `var(--dp-color-ground)` và color `var(--dp-color-ink)`.
   - Chuẩn hóa toàn bộ Button: chiều cao tối thiểu $\ge 3\text{rem}$ (48px), `border-radius: 0`, font chữ Luxury Sans in hoa giãn cách chữ `0.16em`, hiệu ứng bấm lún nhẹ 1px (`transform: translateY(1px)`).
   - Chuẩn hóa Form Controls (inputs, selects, textareas): Góc vuông, viền hairline `1px solid var(--dp-color-rule)`, focus outline nổi bật có offset.
   - Chuẩn hóa Thẻ (Cards): Loại bỏ hoàn toàn bóng đổ và góc bo tròn, viền hairline tinh xảo.

**Test Cases Phase L1:**
- [x] `TCL1.1`: Font family của tiêu đề h1-h6 sử dụng "EB Garamond" / "Luxury Garamond".
- [x] `TCL1.2`: Font family của body và button sử dụng "Instrument Sans" / "Luxury Sans".
- [x] `TCL1.3`: Các nút bấm chính có `border-radius: 0` và chiều cao $\ge 48\text{px}$.
- [x] `TCL1.4`: Biến màu CSS nạp đầy đủ các mã màu Alabaster, Pale Taupe, Charcoal và Gold.

---

### 🔹 Phase L2: Architectural Shell – Layout, Navigation & Footer
> **Mục tiêu:** Thay thế giao diện header/footer thông thường bằng kiến trúc sang trọng với cột lề điều hướng, Spine vàng và số La Mã.

**Phạm vi công việc:**
1. Cập nhật [Navbar.jsx](file:///e:/project/Project_3/frontend/src/components/common/Navbar.jsx):
   - Logo Chef James Thew tinh tế với biểu tượng nón bếp vàng kim mảnh và font EB Garamond.
   - Các mục menu giữ nguyên 100% logic ma trận phân quyền (Section 2.1 SRS), chuyển sang font Luxury Sans in hoa nhẹ nhàng (`font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase`).
   - Nút Đăng nhập / Đăng ký gói cước thiết kế hình chữ nhật góc vuông dứt khoát trên nền Charcoal/Gold.
2. Cập nhật [Footer.jsx](file:///e:/project/Project_3/frontend/src/components/common/Footer.jsx):
   - Chuyển sang nền Charcoal (`#262321`) sang trọng với đường chỉ vàng mảnh ngăn cách bên trên.
   - Bố cục thông tin đầu bếp 5 sao, lớp học cuối tuần và danh mục sách ẩm thực xuất bản.
3. Cập nhật [Layout.jsx](file:///e:/project/Project_3/frontend/src/components/common/Layout.jsx):
   - Bổ sung cấu trúc cột lề và đường viền vàng thẳng đứng (`spine`) ở màn hình rộng.

**Test Cases Phase L2:**
- [ ] `TCL2.1`: Navbar hiển thị logo phong cách EB Garamond và các liên kết dạng uppercase sans.
- [ ] `TCL2.2`: Footer hiển thị trên nền Charcoal (`#262321`) với đường kẻ vàng phân cách.
- [ ] `TCL2.3`: Tất cả các quyền truy cập menu động (Guest vs Member vs Admin) hoạt động chuẩn xác 100%.

---

### 🔹 Phase L3: Public Home Page Transformation
> **Mục tiêu:** Tái tạo trang chủ thành một tác phẩm tạp chí ẩm thực đỉnh cấp mang đậm phong thái Chef Executive James Thew.

**Phạm vi công việc:**
1. Cập nhật [HomePage.jsx](file:///e:/project/Project_3/frontend/src/pages/public/HomePage.jsx):
   - **Phân đoạn I (Hero Statement):** Tiêu đề serif EB Garamond hoành tráng ($3\text{rem} \to 7.75\text{rem}$), số La Mã `I` nằm bên lề, từ khóa được nhấn mạnh in nghiêng trang nhã, ảnh chân dung dọc chất lượng cao tràn góc sang khối màu Pale Taupe.
   - **Phân đoạn II (Curated Free Recipes):** Số La Mã `II`, danh sách công thức miễn phí với thẻ bài vuông vức, viền hairline, tiêu đề món ăn bằng Garamond và thông tin thời gian chế biến bằng Sans nhãn nhỏ.
   - **Phân đoạn III (Culinary Masterclasses & Cookbooks):** Khối nền Pale Taupe (`#e4dbcc`), trình bày các đầu sách nổi tiếng (*Juices, Vegetarian, Non-Vegetarian, Italian*) và lịch mở lớp học cuối tuần dưới dạng các hàng kẻ chỉ (ruled rows).
   - **Phân đoạn IV (Active Contests & Honors):** Khối nền Charcoal đen tuyền (`#262321`), cúp vàng thanh nhã và danh sách cuộc thi đang mở.
   - **Phân đoạn V (Chef's Philosophy & Closing Reveal):** Câu triết lý ẩm thực in nghiêng của James Thew, hiệu ứng mở cánh cửa (door reveal) nhẹ nhàng trên desktop.

**Test Cases Phase L3:**
- [ ] `TCL3.1`: Hero section hiển thị số La Mã `I` và tiêu đề lớn EB Garamond với leading chặt.
- [ ] `TCL3.2`: Khối giới thiệu sách & lớp học mang tông màu Pale Taupe với các hàng kẻ chỉ.
- [ ] `TCL3.3`: Khối cuộc thi ẩm thực hiển thị nổi bật trên nền Charcoal với cúp vàng.
- [ ] `TCL3.4`: Toàn bộ dữ liệu API từ backend (công thức, cuộc thi, thông báo) nạp mượt mà.

---

### 🔹 Phase L4: Catalog Refinement – Recipes & Recipe Detail Pages
> **Mục tiêu:** Định hình lại trang danh mục công thức và chi tiết món ăn theo phong cách bài báo ẩm thực chuẩn sao Michelin.

**Phạm vi công việc:**
1. Cập nhật [RecipesPage.jsx](file:///e:/project/Project_3/frontend/src/pages/public/RecipesPage.jsx):
   - Thanh tìm kiếm tối giản hình chữ nhật viền hairline, loại bỏ bo tròn.
   - Bộ lọc danh mục (Juices, Vegetarian, Non-Vegetarian, Italian) dạng Tab gạch chân vàng thanh lịch.
   - Thẻ công thức & mẹo bếp với khung hình ảnh tỷ lệ tự nhiên, huy hiệu "FREE ACCESS" / "MEMBERS ONLY" góc vuông dứt khoát.
   - Hộp thoại chặn khách vãng lai (Gatekeeping Modal) sang trọng, lịch sự.
2. Cập nhật [RecipeDetailPage.jsx](file:///e:/project/Project_3/frontend/src/pages/public/RecipeDetailPage.jsx):
   - Tiêu đề món ăn lớn bằng EB Garamond, thông tin tác giả và ngày đăng bằng Instrument Sans.
   - Danh sách nguyên liệu (`Ingredients`) hiển thị dưới dạng danh mục có gạch chỉ mảnh phân tách.
   - Quy trình chế biến (`Cooking Procedure`) đánh số La Mã từng bước rõ ràng, dễ theo dõi khi nấu nướng.
   - Form gửi Feedback tích hợp ở cuối trang với bảng màu Pale Taupe trang nhã.

**Test Cases Phase L4:**
- [ ] `TCL4.1`: Danh mục công thức hiển thị dạng thẻ góc vuông viền hairline.
- [ ] `TCL4.2`: Nhãn Free vs Members-Only hiển thị đúng quy cách màu và font.
- [ ] `TCL4.3`: Trang chi tiết món ăn trình bày nguyên liệu và các bước chế biến phân đoạn rõ ràng.
- [ ] `TCL4.4`: Logic kiểm duyệt quyền xem (Gatekeeping) hoạt động chuẩn xác với Guest.

---

### 🔹 Phase L5: Community Hub – Contests, Announcements, Feedback & FAQ
> **Mục tiêu:** Áp dụng phong cách Luxury cho các trang cộng đồng, thông báo vinh danh người thắng giải và trang giải đáp thắc mắc.

**Phạm vi công việc:**
1. Cập nhật [ContestsPage.jsx](file:///e:/project/Project_3/frontend/src/pages/public/ContestsPage.jsx):
   - Thẻ cuộc thi với hạn chót nộp bài, huy hiệu thể loại Recipe vs Tip, nút tham gia góc vuông đen than/vàng kim.
   - Modal nộp bài dự thi (hỗ trợ cả Guest và Member) với form nhập liệu góc vuông chuẩn chỉ.
2. Cập nhật [AnnouncementsPage.jsx](file:///e:/project/Project_3/frontend/src/pages/public/AnnouncementsPage.jsx):
   - Khung vinh danh người đoạt giải (`Winner Highlight Box`) với viền vàng kim mảnh, tên người chiến thắng hiển thị bằng EB Garamond trang trọng.
3. Cập nhật [FeedbackPage.jsx](file:///e:/project/Project_3/frontend/src/pages/public/FeedbackPage.jsx):
   - Form góp ý website trên nền Alabaster, ô bình luận rộng rãi, nút gửi phản hồi chữ nhật màu Charcoal.
4. Cập nhật [FaqPage.jsx](file:///e:/project/Project_3/frontend/src/pages/public/FaqPage.jsx):
   - Thiết kế Accordion theo phong cách **Native Disclosures**: câu hỏi dùng font EB Garamond, đường viền kẻ mảnh, biểu tượng đóng mở dấu cộng/trừ vàng kim (`+`/`-`), câu trả lời dùng Instrument Sans với khoảng cách dòng thoáng (1.55).

**Test Cases Phase L5:**
- [ ] `TCL5.1`: Thẻ cuộc thi hiển thị đầy đủ thông tin thời hạn và nút nộp bài góc vuông.
- [ ] `TCL5.2`: Trang công bố người chiến thắng có khung vinh danh viền vàng kim tinh tế.
- [ ] `TCL5.3`: Accordion FAQ hiển thị chính xác 7 câu hỏi SRS với biểu tượng cộng/trừ vàng kim và font serif.
- [ ] `TCL5.4`: Form góp ý gửi thành công và hiển thị thông báo phản hồi thanh lịch.

---

### 🔹 Phase L6: Auth & Member Portal – Login, Register, Profile & My Recipes
> **Mục tiêu:** Nâng tầm trải nghiệm đăng ký gói thành viên có phí và cổng quản lý cá nhân của hội viên.

**Phạm vi công việc:**
1. Cập nhật [LoginPage.jsx](file:///e:/project/Project_3/frontend/src/pages/auth/LoginPage.jsx):
   - Khung đăng nhập tối giản, đẳng cấp, cân đối giữa nền Alabaster và khối nút Charcoal.
2. Cập nhật [RegisterPage.jsx](file:///e:/project/Project_3/frontend/src/pages/auth/RegisterPage.jsx):
   - Bảng so sánh 2 gói cước (**Gói Tháng $10** và **Gói Năm $100**): Gói năm được làm nổi bật bằng cột Charcoal (`#262321`) với chỉ vàng trên đỉnh, giữ nguyên trạng thái khi lựa chọn thay đổi.
   - Khu vực mô phỏng thẻ thanh toán trực tuyến thiết kế tối giản, bảo mật, rõ ràng.
3. Cập nhật [ProfilePage.jsx](file:///e:/project/Project_3/frontend/src/pages/member/ProfilePage.jsx):
   - Thẻ hội viên VIP/Master Chef với ngày bắt đầu, ngày hết hạn và trạng thái gói cước.
   - Form đổi thông tin cá nhân và mật khẩu với ô nhập liệu viền hairline sắc gọn.
4. Cập nhật [MyRecipesPage.jsx](file:///e:/project/Project_3/frontend/src/pages/member/MyRecipesPage.jsx):
   - Bảng quản lý bài viết cá nhân với tiêu đề cột dạng Sans in hoa nhỏ, nút thao tác chữ nhật góc vuông.

**Test Cases Phase L6:**
- [ ] `TCL6.1`: Form đăng ký hiển thị bảng chọn 2 gói cước với cột nổi bật Charcoal và số tiền bằng EB Garamond.
- [ ] `TCL6.2`: Khối thanh toán mô phỏng hiển thị sắc sảo, xác thực hợp lệ trước khi tạo tài khoản.
- [ ] `TCL6.3`: Trang hồ sơ hiển thị chuẩn gói dịch vụ ($10/tháng hoặc $100/năm) và ngày hết hạn.
- [ ] `TCL6.4`: Bảng quản lý công thức cá nhân hỗ trợ CRUD hoàn chỉnh với giao diện góc vuông.

---

### 🔹 Phase L7: Executive Admin Suite & 404 Not Found Page
> **Mục tiêu:** Hoàn thiện trang quản trị đặc quyền dành riêng cho Mr. James Thew và trang 404 tối giản sang trọng.

**Phạm vi công việc:**
1. Cập nhật [AdminDashboardPage.jsx](file:///e:/project/Project_3/frontend/src/pages/admin/AdminDashboardPage.jsx):
   - Bảng điều khiển quản trị Chef Executive: 4 khối thống kê chính sử dụng số lớn EB Garamond, nền Pale Taupe và Charcoal.
   - Các bảng quản lý Recipes, Tips, Contests, Announcements, Feedbacks có viền hairline, nút thao tác toggle Free/Member và chọn Winner được chau chuốt tinh tế.
2. Cập nhật [NotFoundPage.jsx](file:///e:/project/Project_3/frontend/src/pages/public/NotFoundPage.jsx):
   - Số `404` kích thước lớn bằng EB Garamond, thông điệp ẩm thực nhã nhặn, nút trở về trang chủ có gạch chân vàng hoặc nút Charcoal tối giản.

**Test Cases Phase L7:**
- [ ] `TCL7.1`: Admin Dashboard hiển thị 4 thẻ số liệu thống kê lớn bằng font serif trên nền sang trọng.
- [ ] `TCL7.2`: Nút chọn người chiến thắng (`Select Winner`) và toggle quyền truy cập hiển thị đúng phong cách.
- [ ] `TCL7.3`: Trang 404 hiển thị thông điệp sang trọng và link điều hướng quay về trang chủ.

---

### 🔹 Phase L8: Regression Testing & Responsive Fine-Tuning
> **Mục tiêu:** Kiểm thử toàn diện đảm bảo không có bất kỳ regression nào về tính năng, bảo toàn 100% test pass.

**Phạm vi công việc:**
1. Chạy toàn bộ **40 Backend integration tests** qua `dotnet test` $\to$ Đảm bảo 100% PASS.
2. Chạy toàn bộ **35 Frontend component tests** qua `npx vitest run` $\to$ Đảm bảo 100% PASS.
3. Kiểm tra hiển thị đa thiết bị:
   - Desktop (> 1100px): Lưới 12 cột đầy đủ, cột lề và Spine vàng bên trái.
   - Tablet (721px - 1100px): Giảm lề, thu gọn khoảng cách gap, tiêu đề căn chỉnh tự nhiên.
   - Mobile (< 720px): Cột vàng bám sát mép trái, bố cục xếp chồng theo thứ tự đọc tự nhiên.

**Test Cases Phase L8:**
- [ ] `TCL8.1`: 40/40 Backend tests đạt 100% PASS.
- [ ] `TCL8.2`: 35/35 Frontend tests đạt 100% PASS.
- [ ] `TCL8.3`: Build production `npm run build` hoàn thành không lỗi.
- [ ] `TCL8.4`: Kiểm tra giao diện responsive không có hiện tượng vỡ layout trên mobile.

---

## 📊 4. BẢNG THEO DÕI TIẾN ĐỘ THỰC HIỆN

| Phase | Nội dung công việc | Trạng thái | Kiểm thử tự động |
|---|---|:---:|:---:|
| **Phase L1** | Tokens, Google Fonts (EB Garamond & Instrument Sans) & Global Resets | `[x]` Hoàn thành ✓ | 4/4 Tests PASS |
| **Phase L2** | Architectural Shell (Navbar, Footer, 12-col Layout & Spine) | `[ ]` Chờ duyệt | 3 Test Cases |
| **Phase L3** | Public Home Page Transformation (Hero Statement, Ruled Rows) | `[ ]` Chờ duyệt | 4 Test Cases |
| **Phase L4** | Recipes & Tips Catalog + Detail Page (Serif Steps, Hairlines) | `[ ]` Chờ duyệt | 4 Test Cases |
| **Phase L5** | Contests, Announcements, Feedback & Native FAQ Disclosures | `[ ]` Chờ duyệt | 4 Test Cases |
| **Phase L6** | Auth (Login/Register with Charcoal Plan), Profile & My Recipes | `[ ]` Chờ duyệt | 4 Test Cases |
| **Phase L7** | Executive Admin Dashboard & Luxury 404 Not Found Page | `[ ]` Chờ duyệt | 3 Test Cases |
| **Phase L8** | Full Regression Testing (75/75 Tests PASS) & Mobile Polish | `[ ]` Chờ duyệt | 4 Test Cases |

---

> **🔴 TRẠNG THÁI HIỆN TẠI: ĐÃ LẬP KẾ HOẠCH & CHỜ DUYỆT (WAITING FOR APPROVAL)**  
> Theo quy tắc làm việc của dự án, tôi **chưa thay đổi bất kỳ code chức năng nào** trước khi anh duyệt kế hoạch này.  
> Vui lòng phản hồi **"Approve"** hoặc **"Duyệt"** để tôi bắt đầu triển khai ngay **Phase L1**!

