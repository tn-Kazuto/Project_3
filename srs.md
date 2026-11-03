# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & PHÂN TÍCH KỸ THUẬT
**Dự án:** Website Chia Sẻ Công Thức Nấu Ăn & Cuộc Thi Ẩm Thực - **James Thew**  
**Chương trình:** Aptech eProject Semester 3 (HDSE / ADSE)  

> [!NOTE]
> **Bộ Hồ Sơ Đặc Tả Chi Tiết Phân Hệ (SRS Details Suite):**  
> Bản SRS tổng thể này được phân rã kỹ thuật chi tiết theo chuẩn IEEE 830 tại thư mục **[`srsdetails/files/`](./srsdetails/files/README.md)** gồm 7 chuyên đề chuyên sâu:
> 1. [`00-srs-core.md`](./srsdetails/files/00-srs-core.md): Thực thể CSDL, 11 Quy tắc nghiệp vụ cốt lõi (`BR-01` – `BR-11`), và giải quyết dứt điểm 8 điểm mở (`OQ-01` – `OQ-08`).
> 2. [`01-srs-functional.md`](./srsdetails/files/01-srs-functional.md): Yêu cầu chức năng chi tiết cho 9 modules (`FR-AUTH`, `FR-HOME`, `FR-RCP`, `FR-TIP`, `FR-CON`, `FR-ANN`, `FR-FBK`, `FR-PRF`, `FR-FAQ`) kèm Acceptance Criteria.
> 3. [`02-srs-non-functional.md`](./srsdetails/files/02-srs-non-functional.md): Bộ chỉ số NFRs (`NFR-AVL-01` đến `NFR-DEL-01`) về độ tin cậy, bảo trì, quốc tế hóa và bàn giao.
> 4. [`03-srs-security.md`](./srsdetails/files/03-srs-security.md): Ma trận đe dọa STRIDE, chuẩn OWASP Top 10, phân quyền Server-side và bảo mật giao dịch PCI-DSS.
> 5. [`04-srs-performance.md`](./srsdetails/files/04-srs-performance.md): Chỉ số hiệu năng $P_{95} \le 500\text{ ms}$, chiến lược Redis Caching và kịch bản Load test bằng k6.
> 6. [`05-srs-ui-ux.md`](./srsdetails/files/05-srs-ui-ux.md): Sitemap các route, tiêu chuẩn thiết kế Luxury 5 sao và khả năng tiếp cận WCAG 2.1 AA.
> 7. [`06-test-case-checklist.md`](./srsdetails/files/06-test-case-checklist.md): Danh mục 50+ Test Cases chi tiết và ma trận truy vết yêu cầu (Traceability Matrix).

---

## PHẦN 1: TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

**Bối cảnh nghiệp vụ:**  
Ông **James Thew** là một đầu bếp nổi tiếng làm việc tại khách sạn 5 sao, thường xuyên viết sách dạy nấu ăn, tham gia các chương trình truyền hình ẩm thực (với các danh mục như: Nước ép - *Juices*, Món chay - *Vegetarian*, Món mặn - *Non-vegetarian*, Món Ý - *Italian*, v.v.) và mở các lớp học nấu ăn vào cuối tuần. Ông muốn xây dựng một website cá nhân để chia sẻ công thức nấu ăn (Recipes), mẹo bếp núc (Tips), tổ chức các cuộc thi nấu ăn (Contests) và thu hút cộng đồng người dùng toàn cầu thông qua mô hình kết hợp giữa **Miễn phí (Free)** và **Thu phí thành viên (Membership Subscription)**.

**Các nhóm tác nhân (Actors) trong hệ thống:**
1. **Admin / Owner (Ông James Thew):** Quản trị viên toàn quyền của hệ thống.
2. **Registered Member (Thành viên trả phí):** Người dùng đã đăng ký và thanh toán gói cước ($10/tháng hoặc $100/năm).
3. **General User / Guest (Khách vãng lai):** Người dùng truy cập tự do, chưa đăng ký tài khoản.

---

## PHẦN 2: PHÂN TÍCH YÊU CẦU FRONT-END (UI/UX & CLIENT-SIDE)

Hệ thống Front-end cần được thiết kế với giao diện thân thiện mang phong cách ẩm thực, hỗ trợ **Thanh điều hướng động (Dynamic Navigation Menu)** thay đổi theo trạng thái đăng nhập và phân quyền của người dùng.

### 2.1. Cấu trúc Menu & Điều hướng theo Phân quyền
| Mục Menu / Tính năng | Khách (Guest) | Thành viên (Member) | Quản trị viên (Admin - James) |
| :--- | :---: | :---: | :---: |
| **Home Page** (Giới thiệu về James Thew & lớp học) | Có | Có | Có |
| **Login / Register** (Đăng nhập / Đăng ký + Thanh toán) | Có | *Ẩn (Hiện nút Logout)* | *Ẩn (Hiện nút Logout)* |
| **User Profile** (Xem & chỉnh sửa hồ sơ cá nhân) | Không | Có | Có |
| **Recipes & Tips** (Xem & Tìm kiếm) | Chỉ mục **Free** | **Tất cả** (Free + Member & bài của các thành viên khác) | **Tất cả** trên toàn hệ thống |
| **Upload / Send Recipes & Tips** (Đăng bài & Quản lý) | Không (Trừ khi thi Contest) | Có (Tạo, Sửa, Xóa bài của chính mình) | Có (Tạo, Sửa, Xóa bài của mình + Gắn nhãn Free/Member-only) |
| **Contests** (Cuộc thi ẩm thực) | Xem & Tham gia gửi bài | Xem & Tham gia gửi bài | Tạo mới, Xóa cuộc thi, Xem bài dự thi |
| **Announcements** (Thông báo người thắng cuộc) | Chỉ xem | Chỉ xem | Đăng thông báo, Quản lý thông báo |
| **Feedback** (Gửi đánh giá công thức / website) | Có (Gửi phản hồi) | Có (Gửi phản hồi) | Xem toàn bộ Feedback nhận được |
| **FAQ's** (7 câu hỏi thường gặp cố định) | Có | Có | Có |

### 2.2. Chi tiết các Màn hình (Views / Pages) cần xây dựng

#### A. Nhóm màn hình Chung & Khách vãng lai (Public / Guest Views)
1. **Trang chủ (Home Page):**
   * Banner giới thiệu đầu bếp James Thew, tiểu sử, các chương trình truyền hình và thông tin lớp học nấu ăn cuối tuần.
   * Khu vực nổi bật: Công thức miễn phí mới nhất, Cuộc thi đang diễn ra, Thông báo người chiến thắng mới nhất.
2. **Trang Đăng nhập / Đăng ký & Thanh toán (Login / Register Page):**
   * Form Đăng nhập (Username/Email & Password).
   * Form Đăng ký tích hợp bước chọn gói thành viên (Radio button / Card lựa chọn):
     * **Gói Tháng (Monthly Subscription):** `$10`
     * **Gói Năm (Yearly Subscription):** `$100`
   * Giao diện nhập thông tin thanh toán (Mock Payment Gateway / Thẻ tín dụng) để kích hoạt tài khoản.
3. **Trang Danh sách & Tìm kiếm Công thức / Mẹo (Recipes & Tips Catalog):**
   * Thanh tìm kiếm (Search bar) theo từ khóa, bộ lọc theo danh mục (*Juices, Vegetarian, Non-vegetarian, Italian...*) và loại nội dung (*Recipes* hoặc *Tips*).
   * Hiển thị nhãn (Badge) phân biệt bài viết `Free` và `Member Only`. Với khách vãng lai, các bài `Member Only` sẽ bị ẩn hoặc khóa (yêu cầu đăng ký để xem).
4. **Trang Chi tiết Công thức (Recipe Detail Page):**
   * Hiển thị tên món, tác giả, danh sách nguyên liệu (Ingredients), quy trình chế biến từng bước (Cooking Procedure).
   * Tích hợp **Form gửi Feedback** ngay bên dưới công thức (cho phép cả Guest và Member gửi nhận xét).
5. **Trang Cuộc thi (Contests Page):**
   * Danh sách các cuộc thi đang mở do ông James tổ chức (thi viết Recipe hoặc viết Tip).
   * **Form Tham gia cuộc thi (Contest Participation Form):** Cho phép cả Guest và Member gửi bài dự thi (Nếu là Guest cần nhập thêm Họ tên, Email liên hệ; nếu là Recipe cần có đủ trường *Ingredients* và *Cooking Procedure*).
6. **Trang Thông báo (Announcements Page):**
   * Hiển thị danh sách công bố kết quả và vinh danh người chiến thắng của các cuộc thi gần nhất.
7. **Trang Phản hồi chung (Site Feedback Page):**
   * Form thu thập ý kiến đóng góp của người dùng về trải nghiệm website.
8. **Trang Hỏi đáp (FAQ Page):**
   * Giao diện dạng Accordion hoặc danh sách hiển thị chính xác **7 câu hỏi bắt buộc** trong SRS cùng câu trả lời chi tiết (xem ở Phần 5).

#### B. Nhóm màn hình Thành viên (Member Views)
1. **Trang Hồ sơ cá nhân (User Profile):**
   * Hiển thị thông tin cá nhân, trạng thái gói cước hiện tại (Monthly/Yearly, ngày hết hạn) và Form chỉnh sửa thông tin (Inline Edit hoặc Modal).
2. **Trang Quản lý bài viết cá nhân (My Recipes & Tips):**
   * Form đăng tải công thức mới (Tiêu đề, Danh mục, Nguyên liệu, Các bước thực hiện) và Mẹo mới (Tiêu đề, Nội dung).
   * Bảng danh sách các Recipes và Tips do chính thành viên đó đã gửi kèm nút **Xem (View) / Sửa (Update) / Xóa (Delete)**.

#### C. Nhóm màn hình Quản trị viên (Admin Dashboard - Mr. James)
1. **Quản lý Công thức & Mẹo của Admin:**
   * Form tải lên Recipes (kèm Ingredients + Cooking procedures) và Tips.
   * **Tùy chọn quyền truy cập (Visibility Toggle):** Checkbox/Select đánh dấu bài viết là `Free` (Miễn phí cho mọi người) hoặc `Members Only` (Chỉ dành cho thành viên trả phí).
   * Bảng quản lý cho phép Xem, Cập nhật, Xóa các Recipes/Tips do ông James đã đăng.
2. **Quản lý Cuộc thi & Chấm giải (Contest & Submission Management):**
   * Tạo cuộc thi mới (Tiêu đề, Thể lệ, Loại bài thi: Recipe hay Tip, Thời hạn) hoặc xóa cuộc thi.
   * Màn hình duyệt danh sách toàn bộ bài dự thi (Posts) gửi về theo từng cuộc thi.
   * Nút chọn người chiến thắng và chuyển sang form **Đăng thông báo (Announcements)**.
3. **Quản lý Phản hồi (Feedback Management):**
   * Bảng tổng hợp toàn bộ Feedback của người dùng đối với từng công thức nấu ăn và đối với website.

### 2.3. Yêu cầu Kỹ thuật phía Client (Front-end Technical Specs)
* **Kiểm tra dữ liệu đầu vào (Client-side Validation bằng JavaScript):**
  * Kiểm tra các trường bắt buộc (Required fields), định dạng Email, độ dài mật khẩu, xác nhận mật khẩu.
  * Kiểm tra ràng buộc thanh toán khi đăng ký (bắt buộc chọn gói $10 hoặc $100).
  * Validate form đăng công thức phải có đầy đủ phần Nguyên liệu (*Ingredients*) và Cách làm (*Cooking procedure*).
* **Tiêu chuẩn GUI (GUI Standards):** Đồng nhất về font chữ, bảng màu, bố cục (Header, Main Menu, Content Area, Footer) trên tất cả các trang theo tài liệu *GUI Standards Document*.

---

## PHẦN 3: PHÂN TÍCH YÊU CẦU BACK-END & CƠ SỞ DỮ LIỆU

### 3.1. Kiến trúc & Logic Nghiệp vụ (Business Logic)

1. **Xác thực & Phân quyền (Authentication & Role-Based Access Control - RBAC):**
   * Quản lý phiên đăng nhập (Session Management).
   * Phân tách rõ 3 luồng quyền hạn: `ADMIN`, `MEMBER`, `GUEST`.
   * **Kiểm tra quyền truy cập nội dung (Content Gatekeeping):** Khi có request xem chi tiết hoặc tìm kiếm Recipes/Tips, nếu người dùng là `GUEST`, câu truy vấn chỉ trả về các bản ghi có `is_free = true`. Nếu là `MEMBER` (còn hạn gói cước) hoặc `ADMIN`, trả về toàn bộ bản ghi.
   * **Kiểm tra quyền sở hữu (Ownership Authorization):**
     * Thành viên (`MEMBER`) có thể **Xem** tất cả bài đăng của mọi khách hàng khác, nhưng chỉ được phép **Update / Delete** các Recipes và Tips có `author_id` trùng với `user_id` của chính mình.
     * Admin (`ADMIN`) được phép **Update / Delete** các Recipes và Tips do chính Admin đăng tải, và chỉ Admin mới có quyền thiết lập cờ `is_free` (Free vs. Member-only).

2. **Xử lý Đăng ký & Gói cước (Subscription & Payment Logic):**
   * Người dùng chỉ hoàn tất đăng ký tài khoản `MEMBER` sau khi thực hiện bước thanh toán.
   * Hệ thống tự động tính ngày hết hạn (`subscription_end_date`) dựa trên gói được chọn:
     * Gói Monthly ($10): `Ngày đăng ký + 30 ngày`.
     * Gói Yearly ($100): `Ngày đăng ký + 365 ngày`.

3. **Nghiệp vụ Cuộc thi (Contest Workflow):**
   * Lưu ý nghiệp vụ quan trọng từ SRS: **Khách vãng lai (chưa đăng ký thành viên) VẪN ĐƯỢC PHÉP tham gia cuộc thi** (*"For the general user, who is not the member of the site... Should be able to view and Participate in the contests"*).
   * Do đó, API nhận bài dự thi phải hỗ trợ cả 2 trường hợp:
     * Đã đăng nhập: Liên kết trực tiếp với `user_id`.
     * Chưa đăng nhập (Guest): Cho phép `user_id = NULL` và lưu thông tin liên hệ của khách (`guest_name`, `guest_email`, `guest_phone`) để Admin có thể liên hệ trao giải và công bố tên người thắng cuộc.

### 3.2. Thiết kế Cơ sở Dữ liệu Đề xuất (Database Schema / ERD)

Hệ thống cơ sở dữ liệu quan hệ (RDBMS) cần tối thiểu các bảng thực thể sau:

1. **`Users` (Người dùng):**
   * `user_id` (PK, INT, Auto Increment)
   * `username` (VARCHAR, Unique)
   * `password_hash` (VARCHAR)
   * `full_name` (VARCHAR)
   * `email` (VARCHAR, Unique)
   * `phone` (VARCHAR)
   * `role` (ENUM/VARCHAR: `'ADMIN'`, `'MEMBER'`)
   * `subscription_plan` (VARCHAR: `'MONTHLY'`, `'YEARLY'`, Nullable cho Admin)
   * `subscription_amount` (DECIMAL: `10.00` hoặc `100.00`)
   * `subscription_start` (DATETIME)
   * `subscription_end` (DATETIME)
   * `created_at` (DATETIME)

2. **`Categories` (Danh mục món ăn):**
   * `category_id` (PK, INT)
   * `category_name` (VARCHAR - VD: *Juices, Vegetarian, Non-Vegetarian, Italian*)
   * `description` (TEXT)

3. **`Recipes` (Công thức nấu ăn):**
   * `recipe_id` (PK, INT)
   * `author_id` (FK -> `Users.user_id`)
   * `category_id` (FK -> `Categories.category_id`)
   * `title` (VARCHAR)
   * `ingredients` (TEXT - Danh sách nguyên liệu)
   * `cooking_procedure` (TEXT - Các bước chế biến)
   * `is_free` (BIT/BOOLEAN - `1`: Free, `0`: Member-only. Mặc định bài của Admin có thể chọn, bài của Member dành cho cộng đồng Member)
   * `created_at`, `updated_at` (DATETIME)

4. **`Tips` (Mẹo nấu ăn):**
   * `tip_id` (PK, INT)
   * `author_id` (FK -> `Users.user_id`)
   * `title` (VARCHAR)
   * `content` (TEXT)
   * `is_free` (BIT/BOOLEAN)
   * `created_at`, `updated_at` (DATETIME)

5. **`Contests` (Cuộc thi):**
   * `contest_id` (PK, INT)
   * `title` (VARCHAR)
   * `description` (TEXT)
   * `contest_type` (VARCHAR: `'RECIPE'` hoặc `'TIP'`)
   * `start_date` (DATETIME)
   * `end_date` (DATETIME)
   * `status` (VARCHAR: `'ACTIVE'`, `'CLOSED'`)
   * `created_by` (FK -> `Users.user_id`)

6. **`Contest_Submissions` (Bài dự thi):**
   * `submission_id` (PK, INT)
   * `contest_id` (FK -> `Contests.contest_id`)
   * `user_id` (FK -> `Users.user_id`, **Nullable** để hỗ trợ Guest dự thi)
   * `guest_name` (VARCHAR, Nullable)
   * `guest_email` (VARCHAR, Nullable)
   * `title` (VARCHAR)
   * `ingredients` (TEXT, Nullable nếu cuộc thi chỉ yêu cầu gửi Tip)
   * `content_or_procedure` (TEXT - Nội dung Tip hoặc quy trình nấu)
   * `submitted_at` (DATETIME)
   * `is_winner` (BIT/BOOLEAN, Default `0`)

7. **`Announcements` (Thông báo kết quả):**
   * `announcement_id` (PK, INT)
   * `contest_id` (FK -> `Contests.contest_id`, Nullable)
   * `winner_submission_id` (FK -> `Contest_Submissions.submission_id`, Nullable)
   * `title` (VARCHAR)
   * `content` (TEXT)
   * `published_at` (DATETIME)

8. **`Feedbacks` (Phản hồi):**
   * `feedback_id` (PK, INT)
   * `recipe_id` (FK -> `Recipes.recipe_id`, **Nullable** - nếu NULL là feedback chung cho toàn bộ website)
   * `user_id` (FK -> `Users.user_id`, **Nullable** cho Guest)
   * `sender_name` (VARCHAR)
   * `sender_email` (VARCHAR)
   * `comment` (TEXT)
   * `created_at` (DATETIME)

---

## PHẦN 4: YÊU CẦU KỸ THUẬT HỆ THỐNG & QUY TRÌNH (TECHNICAL & PROCESS SPECS)

### 4.1. Công nghệ sử dụng (Tech Stack)
Theo tài liệu SRS gốc của Aptech và hướng tiếp cận thực tế:
* **Nền tảng gốc trong SRS:**
  * **Front-end:** HTML, CSS (Dreamweaver), JavaScript, JSP / ASP.NET WebForms.
  * **Back-end:** Java (J2SDK 1.4.1+, J2EE, JSP/Servlets, EJB/Struts, JDBC) **HOẶC** .NET Framework.
  * **Cơ sở dữ liệu:** SQL Server 2000 (hoặc mới hơn), Oracle 9i, hoặc MS Access.
* **Nền tảng nâng cấp hiện đại (Nếu triển khai theo công nghệ mới hiện nay):**
  * **Java Stack:** Spring Boot, Spring Security (JWT/Session), Hibernate/JPA, Thymeleaf hoặc React/Vue/Angular.
  * **.NET Stack:** ASP.NET Core MVC / Web API, Entity Framework Core, SQL Server.

### 4.2. Tiêu chuẩn Lập trình & An toàn Dữ liệu (Coding Standards & Backup)
* **Code Comments:** Mọi khối lệnh (code block) bắt buộc phải có chú thích (comment) rõ ràng.
* **Giải thích thuật toán:** Logic của chương trình cần được mô tả chi tiết trong tài liệu thiết kế.
* **Sao lưu dữ liệu (Data Backup):** Bắt buộc sao lưu dữ liệu hàng ngày để phòng tránh 3 rủi ro:
  1. Nhiễm Virus (*Virus problem*).
  2. Lỗi hệ thống (*System failure*).
  3. Hỏng file (*File corrupt*).

---

## PHẦN 5: NỘI DUNG TÀI LIỆU SRS GỐC (CHUYỂN ĐỔI NGUYÊN BẢN SANG MARKDOWN)

Dưới đây là toàn bộ nội dung cấu trúc từ file `srs.docx` được chuẩn hóa sang định dạng Markdown:

### 5.1. Mục lục (Index)
1. Introduction (Giới thiệu)
2. Objectives of the project (Mục tiêu dự án)
3. Problem Statement (Phát biểu bài toán)
4. Deliverables (Sản phẩm bàn giao)
5. Hardware/Software Requirements (Yêu cầu Phần cứng / Phần mềm)

### 5.2. Giới thiệu & Mục tiêu (Introduction & Objectives)
* **eProject** là môi trường học tập và triển khai dự án từng bước (*laddered approach*), mô phỏng sát thực tế phòng Lab và doanh nghiệp.
* **Mục tiêu:**
  * Cung cấp kịch bản thực tế để học viên xây dựng một ứng dụng hoàn chỉnh, có quy mô lớn và tính ổn định cao.
  * Áp dụng các công cụ và kiến thức đã học vào bài toán thực tiễn tại các buổi Lab (có sự hướng dẫn của giảng viên nếu cần).
  * Hoàn thiện bộ tài liệu kỹ thuật đi kèm mã nguồn trong thời gian quy định.

### 5.3. Đặc tả Yêu cầu Khách hàng (Customer Requirement Specification)

#### A. Menu chính của Website (Main Menu)
1. **Home Page:** Mô tả thông tin về chủ sở hữu (Ông James Thew).
2. **Login Page / Register Page:** Khách hàng đăng ký thành viên kèm thanh toán theo 1 trong 2 hình thức:
   * Gói tháng (*Monthly Subscription*) – **$10**
   * Gói năm (*Yearly Subscription*) – **$100**
3. **Free Recipes:** Xem các công thức miễn phí và gửi phản hồi (Feedback) mà không cần đăng ký tài khoản.
4. **Contests:** Xem và tham gia các cuộc thi.
5. **Announcements:** Xem danh sách người chiến thắng của cuộc thi mới nhất do ông James công bố.
6. **Feedback:** Gửi phản hồi, đánh giá về website.
7. **FAQ’s:** Các câu hỏi thường gặp.

#### B. Menu & Chức năng của Admin / Chủ sở hữu (Mr. James) sau khi đăng nhập
1. **Home Page**
2. **User Profile:** Hiển thị và cho phép chỉnh sửa hồ sơ ngay trên trang.
3. Truy cập toàn bộ công thức nấu ăn trên website.
4. Xem và tìm kiếm công thức (Recipes) và mẹo (Tips) trực tuyến.
5. Xem toàn bộ phản hồi (Feedbacks) nhận được cho các công thức.
6. Đăng cuộc thi mới hoặc xóa cuộc thi.
7. **View the posts:** Xem các bài dự thi (Recipes hoặc Tips) do người dùng gửi về cho cuộc thi.
8. **Announcements:** Công bố người chiến thắng cuộc thi.
9. Tải lên các mẹo nấu ăn (*Upload tips*).
10. Tải lên công thức nấu ăn kèm danh sách nguyên liệu (*ingredients*) và quy trình nấu (*cooking procedures*).
11. Đánh dấu các mẹo và công thức do ông đăng tải là **Miễn phí (Free)** hoặc **Chỉ dành cho thành viên (Members only)**.
12. Xem, cập nhật hoặc xóa các mẹo và công thức mà ông đã tải lên.
13. **FAQ’s**

#### C. Menu & Chức năng của Thành viên (Logged-in User) sau khi đăng nhập
1. **Home Page**
2. **User Profile:** Hiển thị và chỉnh sửa hồ sơ cá nhân.
3. Truy cập toàn bộ công thức nấu ăn trên website.
4. Xem và tìm kiếm công thức và mẹo trực tuyến.
5. Xem các thông báo (Announcements) từ chủ sở hữu.
6. Gửi phản hồi (Feedback) cho một công thức.
7. Xem và tham gia vào các cuộc thi.
8. Gửi mẹo nấu ăn (*Send tips*).
9. Gửi công thức nấu ăn kèm danh sách nguyên liệu và quy trình chế biến.
10. Xem các công thức và mẹo được gửi bởi tất cả các khách hàng khác trên trang web.
11. Xem, cập nhật hoặc xóa các mẹo và công thức do chính mình đã gửi.
12. **FAQ’s**

#### D. Chức năng dành cho Khách vãng lai (General User / Non-member)
1. **Home Page**
2. Đăng ký thành viên tại trang Login/Register.
3. Xem và tìm kiếm trực tuyến **chỉ riêng đối với các công thức và mẹo miễn phí (Free)**.
4. Xem và tham gia vào các cuộc thi bằng cách gửi mẹo hoặc công thức (kèm nguyên liệu và quy trình nấu).
5. Xem thông báo từ chủ sở hữu website.
6. Gửi phản hồi (Feedback) cho một công thức.
7. **FAQ’s**

#### E. Danh sách 7 Câu hỏi bắt buộc tại trang FAQ's
Trang FAQ cần hiển thị đầy đủ các câu hỏi sau cùng câu trả lời tương ứng:
1. *How to become the member of this site?* (Làm thế nào để trở thành thành viên của trang web này?)
2. *Will there be any subscription charges?* (Có bất kỳ khoản phí đăng ký nào không?)
3. *How to view the recipes and tips? Will there be any charges for that?* (Làm thế nào để xem công thức và mẹo? Có mất phí không?)
4. *I am not the registered member of the site. Can I participate in the contest held?* (Tôi không phải là thành viên đã đăng ký. Tôi có thể tham gia cuộc thi được tổ chức không?)
5. *How to upload or post the recipes and tips?* (Làm thế nào để tải lên hoặc đăng công thức và mẹo?)
6. *How to post a feedback?* (Làm thế nào để gửi phản hồi?)
7. *I have posted a recipe or a tip with respect to the contest. How can I know who is the winner?* (Tôi đã đăng một công thức hoặc mẹo cho cuộc thi. Làm sao tôi biết ai là người chiến thắng?)

### 5.4. Danh mục Tài liệu Dự án & Bàn giao (Documentation & Deliverables)

#### A. Hồ sơ Tài liệu Báo cáo (Project Report) gồm 13 mục:
1. Certificate of Completion (Chứng nhận hoàn thành)
2. Table of Contents (Mục lục)
3. Problem Definition (Định nghĩa bài toán)
4. Customer Requirement Specification (Đặc tả yêu cầu khách hàng)
5. Project Plan (Kế hoạch dự án)
6. E-R Diagrams (Sơ đồ thực thể liên kết)
7. Algorithms (Thuật toán)
8. GUI Standards Document (Tài liệu tiêu chuẩn giao diện)
9. Interface Design Document (Tài liệu thiết kế giao diện)
10. Task Sheet (Bảng phân công công việc)
11. Project Review and Monitoring Report (Báo cáo theo dõi và đánh giá dự án)
12. Unit Testing Check List (Danh sách kiểm thử đơn vị)
13. Final Check List (Danh sách kiểm tra cuối cùng)

#### B. Quy định gửi Email Báo cáo Tiến độ (Deliverables)
* Gửi **02 email báo cáo trạng thái (status mail)**, mỗi email cách nhau 10 ngày kể từ ngày bắt đầu dự án (Nếu dự án dưới 30 ngày: email đầu tiên từ ngày thứ 7–10, email thứ hai trước ngày kết thúc 3 ngày).
* Nộp kèm **Feedback Form** và bản mềm tài liệu + mã nguồn khi bàn giao.
* Tiêu đề email bắt buộc bắt đầu bằng một trong các từ khóa: `STATUS:` hoặc `DOUBT:` hoặc `PROJECT SUBMISSION:`.

### 5.5. Yêu cầu Phần cứng & Phần mềm (Hardware / Software Requirements)
* **Phần cứng tối thiểu (Theo tài liệu gốc):**
  * CPU: Pentium 166 hoặc cao hơn.
  * RAM: 64 MB hoặc cao hơn.
  * Hệ điều hành: Windows 98 (hoặc cao hơn).
  * Môi trường: Java Virtual Machine (JVM).
* **Phần mềm (Sử dụng một hoặc kết hợp các công cụ sau):**
  * Trình soạn thảo: Visual Studio / VS Code / Cursor / JetBrains Rider.
  * Nền tảng phát triển: .NET 10 LTS (`net10.0`, C# 14).
  * Công nghệ Web/Middleware: ASP.NET Core Web API / Minimal APIs.
  * Hệ quản trị CSDL: Microsoft SQL Server, Redis Cache, PostgreSQL / MongoDB (nếu áp dụng Polyglot Persistence cho Microservices).

---

## PHẦN 6: ĐẶC TẢ KIẾN TRÚC VI DỊCH VỤ (MICROSERVICES ARCHITECTURE SPECIFICATION)
*Căn cứ quy chuẩn phát triển Spec-Driven Development tại `rules.md` và Yêu cầu Mở rộng Hệ sinh thái Ẩm thực Toàn cầu James Thew.*

### 6.1. Bối cảnh & Lý do Chuyển đổi sang Microservices (Business Justification)
1. **Đặc thù Tải lệch pha (Disproportionate Traffic Profile):**
   - Lưu lượng đọc công thức miễn phí và xem livestream có thể tăng đột biến gấp 20–50 lần vào các khung giờ vàng (giờ chuẩn bị bữa tối, khi Chef James Thew lên sóng Live show ẩm thực).
   - Lưu lượng bình chọn bài thi (*Contest Voting*) có tính chất tập trung cao điểm vào các ngày áp chót của cuộc thi.
   - Luồng mua gói hội viên (*Subscription Payment: $10/tháng hoặc $100/năm*) đòi hỏi tính toán toàn vẹn dữ liệu tài chính (ACID) độc lập với áp lực tải của mạng xã hội/cộng đồng.
2. **Cách ly Sự cố (Fault Isolation & Resiliency):**
   - Sự cố ở phân hệ tương tác cộng đồng (Upload video món ăn, gửi bình luận, bình chọn cuộc thi) **tuyệt đối không được gây sập** luồng xem công thức ẩm thực độc quyền hoặc luồng thanh toán hội viên.
3. **Mở rộng độc lập (Autonomous Scalability):**
   - Phân hệ Media Streaming và Notification Worker có thể scale linh hoạt theo nhu cầu mà không tốn tài nguyên nhân bản toàn bộ monolith backend.

---

### 6.2. Phân rã Bounded Contexts theo Domain-Driven Design (DDD)

Hệ thống được phân tách thành **7 Microservices chuyên biệt**, áp dụng triệt để nguyên tắc **Database-per-Service** (cấm mọi truy vấn chéo database / cross-DB join theo `rules.md`):

| STT | Microservice | Bounded Context & Trách nhiệm Nghiệp vụ | Database / Storage Độc quyền | Cơ chế Giao tiếp Chính |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Identity & Profile Service** | Quản lý tài khoản người dùng, hồ sơ Chef James Thew & Member, cấp phát JWT Claims, phân quyền Role (`ADMIN`, `MEMBER`, `GUEST`). | SQL Database (`UserAccounts`, `Profiles`, `Roles`) | Sync REST (Auth) + Async Events |
| **2** | **Subscription & Billing Service** | Quản lý gói cước ($10/tháng, $100/năm), xử lý thanh toán, lịch sử giao dịch, tính hạn hội viên. | SQL Database (`Subscriptions`, `PaymentTransactions`) | Sync REST (Checkout) + Saga Events |
| **3** | **Culinary Catalog Service** | Danh mục ẩm thực (Juices, Vegetarian, Non-Vegetarian, Italian), công thức nấu ăn (`Recipe`), mẹo làm bếp (`Tip`), 7 câu hỏi cố định `FAQ`. | SQL Database + Redis Read Cache (`Recipes`, `Tips`, `Categories`, `Faqs`) | Sync REST (Cached Reads) |
| **4** | **Contest & Gamification Service** | Tạo/quản lý cuộc thi ẩm thực, tiếp nhận bài thi (từ Member và Guest không login), cơ chế bình chọn chống gian lận (`ContestVote`), chấm giải & công bố (`Announcements`). | SQL Database + Redis Vote Counter (`Contests`, `ContestEntries`, `Votes`, `Announcements`) | Sync REST + Async Message Queue |
| **5** | **Community & Feedback Service** | Đánh giá món ăn, bình luận kèm ảnh/video thực hành món (`MediaUrl`), xếp hạng 1-5 sao, gửi góp ý về website, đếm lượt share Facebook. | Document DB / SQL Database (`Feedbacks`, `RecipeComments`, `MediaShares`) | Sync REST + Async Push |
| **6** | **Media & Streaming Service** | Quản lý tài nguyên đa phương tiện: cấp pre-signed upload URL cho video/hình ảnh công thức, phát livestream Talkshow và Live cooking sessions qua CDN. | Cloud Object Storage (S3 / Cloudinary) + Metadata DB | Sync REST (Upload Tickets) + CDN Streams |
| **7** | **Notification & Messaging Service** | Nhận các sự kiện từ Event Bus để gửi Email tự động (hóa đơn, chúc mừng thắng giải, bản tin) và bắn Web In-App Notification (Chuông thông báo thời gian thực qua SignalR). | Queue Store + Push Logs (`NotificationLogs`, `InAppBells`) | Async Event Consumer + SignalR Hub |

---

### 6.3. Kiến trúc Cổng Biên (API Gateway & Backend-For-Frontend - BFF)
Theo `rules.md`, mọi client (Guest, Member, Admin) đều đi qua tầng cổng biên tập trung:
* **Công nghệ Gateway:** YARP (Yet Another Reverse Proxy - chuẩn .NET LTS) hoặc Kong Gateway.
* **Nhiệm vụ của Gateway:**
  1. **Routing & Reverse Proxy:** Chuyển tiếp request đến đúng cụm service backend tương ứng.
  2. **Token Introspection & Identity Propagation:** Giải mã JWT Token từ Client, trích xuất `UserId` và `Role`, đính kèm vào HTTP Header chuyển tiếp nội bộ:
     - `X-User-Id: {guid/int}`
     - `X-User-Role: ADMIN | MEMBER | GUEST`
     - `X-Subscription-Active: true | false`
  3. **Content Gatekeeping Enforcement (Tuân thủ Rule 3 - `rules.md`):**
     - Khi Client là `GUEST` (không có token hoặc hết hạn gói): Gateway hoặc Catalog Service tự động thực thi điều kiện lọc `.Where(x => x.IsFree == true)`.
     - Chặn các request xem bài `IsFree == false` của Guest ngay từ tầng Gateway, trả về `401 Unauthorized` hoặc `403 Forbidden` kèm gợi ý đăng ký gói cước.
  4. **Rate Limiting & DDoS Protection:** Bảo vệ API Vote và Search khỏi hành vi spam.

---

### 6.4. Giao tiếp Bất đồng bộ & Xử lý Giao dịch Phân tán (Saga Pattern)

Hệ thống không sử dụng 2PC (Two-Phase Commit) vì gây nghẽn hiệu năng. Thay vào đó, áp dụng **Choreography-based Saga** phối hợp với **Transactional Outbox Pattern** trên Message Broker (RabbitMQ / Apache Kafka):

#### A. Luồng Đăng ký Hội viên & Thanh toán ($10/$100)
1. **Client** gọi `POST /api/v1/subscriptions/checkout` vào **Subscription & Billing Service** (chọn gói Monthly $10 hoặc Yearly $100).
2. **Subscription Service** thực hiện thanh toán qua cổng thanh toán / thẻ giả lập.
3. Khi thanh toán thành công, Subscription Service ghi dữ liệu và bắn sự kiện `SubscriptionActivatedEvent` `{ UserId, PlanType, StartDate, EndDate }` vào Message Broker.
4. **Identity & Profile Service** tiêu thụ (consume) sự kiện: Nâng cấp Role từ `GUEST` thành `MEMBER`, gia hạn `SubscriptionExpiryDate`.
5. **Notification Service** tiêu thụ sự kiện: Tạo hóa đơn điện tử, gửi Email biên lai xác nhận và kích hoạt chuông thông báo In-App.

#### B. Luồng Chấm giải & Công bố Quán quân Cuộc thi
1. **Admin (Chef James Thew)** chọn bài dự thi thắng giải tại **Contest & Gamification Service**.
2. Service cập nhật `IsWinner = true` cho bài thi, tạo bản ghi `Announcement`, đồng thời publish sự kiện `ContestWinnerAnnouncedEvent` `{ ContestId, ContestTitle, WinnerEntryId, WinnerName, WinnerEmail }`.
3. **Notification Service** tiêu thụ sự kiện:
   - Gửi Email chúc mừng riêng tới `WinnerEmail` (hỗ trợ cả Email của Guest và Member theo Rule 5 của `rules.md`).
   - Gửi Broadcast In-App Notification qua SignalR Hub tới toàn bộ người dùng đang online trên website: *"Chef James Thew đã công bố Quán quân cuộc thi [Tên Cuộc Thi]!"*.

---

### 6.5. Tuân thủ 10 Luật Vàng Kiến trúc (`rules.md` Compliance Matrix)

| Luật Vàng (`rules.md`) | Cách áp dụng trong Thiết kế Microservices |
| :--- | :--- |
| **1. Phụ thuộc một chiều** | Controller → Service → Repository → DbContext trong từng Service độc lập. Tuyệt đối không gọi ngược. |
| **2. Controller mỏng** | Controller của từng Microservice chỉ validate schema DTO, đọc Claims từ Gateway và chuyển tiếp xuống Domain Service. |
| **3. Nghiệp vụ nằm ở Service** | Mọi logic kiểm tra quyền sở hữu bài viết (`AuthorId == currentUserId`), kiểm tra hạn gói cước, tính lượt vote nằm trọn vẹn trong Service Layer của Microservice đó. |
| **4. Quyền kiểm tra ở API** | Gateway và từng Microservice đều độc lập kiểm tra claims (`X-User-Role`). Ẩn nút trên React chỉ là trải nghiệm UI, không thay thế cho bảo mật API. |
| **5. Không trả Entity ra ngoài API** | 100% Microservice endpoints trả về DTO/Response Model chuyên biệt (PagedResult, RecipeSummaryDto, ContestEntryDetailDto). |
| **6. Danh tính lấy từ Token** | Microservice lấy `UserId` và `Role` từ Claims Token / Header Gateway được tin cậy, cấm nhận `userId` từ Body, Query string hay Form URL. |
| **7. Server quyết định giá cước & cờ IsFree** | Gói cước ($10/$100) và cờ `IsFree` chỉ do Admin hoặc Logic Subscription Server quyết định; bỏ qua mọi giá trị Client gửi lên. |
| **8. Multi-write trong Transaction / Saga** | Thao tác nội bộ 1 service dùng Local DB Transaction (`BeginTransactionAsync`). Thao tác liên service dùng Outbox Pattern + Saga Event. |
| **9. Không lưu dữ liệu nhạy cảm** | Mật khẩu hash bằng BCrypt; thẻ thanh toán chỉ lưu `CardLast4`; tuyệt đối không lưu CVV/số thẻ đầy đủ. |
| **10. XML Comments đầy đủ** | Toàn bộ Interface, DTO, Event Model, Controller Action trong từng Microservice bắt buộc có thẻ `/// <summary>`. |

---

### 6.6. Tiêu chí Phi chức năng (Non-Functional Requirements - NFRs)
1. **Khả năng chịu tải (Scalability):** Catalog Service chịu được **10,000 Concurrent Readers** với thời gian phản hồi $P_{99} < 100\text{ ms}$ nhờ Redis Cache.
2. **Tính sẵn sàng (Availability):** Cam kết **99.9% Uptime**. Cơ chế Circuit Breaker (Polly trong .NET) ngắt kết nối an toàn khi một service phụ (như Notification hay Feedback) gặp gián đoạn.
3. **Tính nhất quán dữ liệu (Data Consistency):** Đạt tính nhất quán cuối cùng (*Eventual Consistency*) với độ trễ truyền tin $T_{\text{sync}} < 2\text{ giây}$ trên toàn bộ các service.

---

### 6.7. Quy Chuẩn Đóng Gói Container & Triển Khai Docker (Docker & Containerization Standards)

Nhằm đáp ứng yêu cầu vận hành chuẩn Microservices và phòng chống triệt để rủi ro sập hệ thống (*System failure* theo đề bài Aptech), toàn bộ hệ sinh thái backend và frontend được container hóa bằng Docker và điều phối qua Docker Compose:

1. **Kiến trúc Multi-Stage Dockerfile (.NET 10 LTS):**
   - *Stage 1 (Build):* Sử dụng SDK `mcr.microsoft.com/dotnet/sdk:10.0-alpine` để restore và compile source code với cờ tối ưu `-c Release -o /app/publish`.
   - *Stage 2 (Runtime):* Sử dụng ASP.NET Runtime `mcr.microsoft.com/dotnet/aspnet:10.0-alpine` (hoặc Chiseled container). Loại bỏ toàn bộ trình biên dịch và công cụ thừa để giảm dung lượng image (< 110MB) và triệt tiêu lỗ hổng bảo mật.
   - Chạy container dưới tài khoản **non-root user** (`USER app`).
2. **Kiến trúc Multi-Stage Dockerfile (React 19 SPA):**
   - *Stage 1 (Build):* Node.js 20-alpine build production bundle qua Vite (`npm run build`).
   - *Stage 2 (Serve):* Nginx alpine phân phối file tĩnh (SPA routing hỗ trợ fallback `/index.html`) kèm cấu hình nén Gzip và bảo mật Header.
3. **Mạng & Điều phối Docker Compose (`docker-compose.yml`):**
   - **Internal Bridge Network:** Các Microservices chỉ giao tiếp nội bộ trong mạng ảo `jamesthew-internal-net`.
   - **Cổng Đối Ngoại Duy Nhất:** Chỉ có `gateway` (YARP - Port `8000`) và `frontend` (Nginx - Port `3000`) được mở port ra ngoài Host OS. Toàn bộ các service nghiệp vụ (Ports 5001 - 5007), SQL Server (1433), Redis (6379) và RabbitMQ (5672) được bảo vệ an toàn bên trong container network.
   - **Persistence Data Volumes:** Khởi tạo Named Volumes độc lập:
     - `sqlserver_data:/var/opt/mssql/data` (Lưu trữ dữ liệu quan hệ).
     - `redis_data:/data` (Lưu cache và counter).
     - `rabbitmq_data:/var/lib/rabbitmq` (Lưu message queue).
   - **Health Checks & Dependency Ordering:** Các service phụ thuộc được cấu hình `depends_on` với điều kiện `service_healthy` trước khi khởi động. 