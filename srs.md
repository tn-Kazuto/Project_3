# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & PHÂN TÍCH KỸ THUẬT
**Dự án:** Website Chia Sẻ Công Thức Nấu Ăn & Cuộc Thi Ẩm Thực - **James Thew**  
**Chương trình:** Aptech eProject  

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
  * Trình soạn thảo: Notepad / HTML editor / Java editor / Dreamweaver / JavaScript.
  * Nền tảng phát triển: `j2sdk1.4.1_02` (hoặc mới hơn) / `.Net` / `J2EE`.
  * Công nghệ Web/Middleware: `JSP / Servlets`, `EJB / Struts`, `JDBC`.
  * Hệ quản trị CSDL: `SQL Server 2000` (hoặc mới hơn) / `Oracle 9i` / `MS Access` + `JDBC Driver`.
  Triển khai dự án website ẩm thực James Thew bằng ASP.NET Core MVC kết hợp Entity Framework Core và SQL Server là hướng đi tối ưu nhất cho đồ án eProject. Cấu trúc MVC giúp tách biệt rõ ràng phần giao diện (Razor Views), luồng điều hướng (Controllers) và xử lý dữ liệu/phân quyền (Models & Services).   1. Kiến trúc & Cấu trúc Thư mục (ASP.NET Core MVC)Dự án nên được chia thành 2 phân khu (Areas/Modules) chính: giao diện người dùng (Public & Member) và trang quản trị (Admin dành cho Mr. James Thew).   PlaintextJamesThewWebApp/
├── Areas/
│   └── Admin/                      # Khu vực quản trị của Mr. James Thew
│       ├── Controllers/            # Dashboard, RecipeManage, TipManage, ContestManage, AnnouncementManage, FeedbackManage
│       └── Views/
├── Controllers/                    # Khu vực của Guest & Registered Member
│   ├── HomeController.cs           # Trang chủ (Giới thiệu James Thew), Announcements, FAQs
│   ├── AccountController.cs        # Login, Register + Thanh toán ($10/tháng, $100/năm), User Profile
│   ├── RecipeController.cs         # Xem/Tìm kiếm công thức, Đăng/Sửa/Xóa công thức của Member
│   ├── TipController.cs            # Xem/Tìm kiếm mẹo nấu ăn, Đăng/Sửa/Xóa mẹo của Member
│   ├── ContestController.cs        # Xem danh sách cuộc thi, Gửi bài dự thi (Hỗ trợ cả Guest & Member)
│   └── FeedbackController.cs       # Gửi đánh giá cho công thức hoặc website
├── Data/
│   ├── ApplicationDbContext.cs     # EF Core DbContext
│   └── DbInitializer.cs            # Seed tài khoản Admin (James Thew), Danh mục & 7 câu hỏi FAQ
├── Models/
│   ├── Entities/                   # Các class ánh xạ bảng SQL Server
│   └── ViewModels/                 # DTOs cho Form Register, Payment, Search, Contest Submission
└── Views/                          # Razor Views (.cshtml) dùng chung Layout
2. Thiết kế Cơ sở Dữ liệu (SQL Server & EF Core Entities)Hệ thống cần 9 bảng cốt lõi để đáp ứng trọn vẹn các yêu cầu nghiệp vụ trong tài liệu SRS:   Tên Bảng (Entity)Các trường chính (Columns)Mô tả & Ràng buộc nghiệp vụUsersUserId (PK), FullName, Email, PasswordHash, Role, SubscriptionPlan, SubscriptionExpiryDate, CreatedAtLưu thông tin tài khoản. Role gồm Admin (James Thew) và Member. Kiểm tra SubscriptionExpiryDate để cấp quyền xem bài trả phí.   PaymentsPaymentId (PK), UserId (FK), PlanType, Amount, PaymentDate, StatusLưu lịch sử đóng phí thành viên khi đăng ký: Monthly ($10) hoặc Yearly ($100).   CategoriesCategoryId (PK), CategoryName, DescriptionPhân loại công thức: Juices, Vegetarian, Non-Vegetarian, Italian....   RecipesRecipeId (PK), CategoryId (FK), AuthorId (FK), Title, Ingredients, CookingProcedure, ImageUrl, IsFree, CreatedAtLưu công thức kèm nguyên liệu và cách chế biến. Chỉ Admin mới được chỉnh IsFree (true: miễn phí, false: chỉ dành cho Member).   TipsTipId (PK), AuthorId (FK), Title, Content, IsFree, CreatedAtLưu mẹo nấu ăn. Hỗ trợ đánh dấu miễn phí (IsFree = true) hoặc chỉ cho Member (IsFree = false).   ContestsContestId (PK), Title, Description, ContestType, StartDate, EndDate, IsActiveCuộc thi do James Thew tạo. ContestType xác định cuộc thi yêu cầu nộp Recipe hay Tip.   ContestEntriesEntryId (PK), ContestId (FK), UserId (FK - Nullable), GuestName, GuestEmail, Title, Ingredients, CookingProcedure, TipContent, SubmittedAtBài dự thi. UserId cho phép NULL vì khách vãng lai (General User) không cần đăng ký vẫn được tham gia thi.   AnnouncementsAnnouncementId (PK), ContestId (FK), WinnerEntryId (FK), Title, Message, PublishedAtThông báo người chiến thắng cuộc thi sau khi James Thew chấm bài. Hiển thị công khai trên menu chính.   FeedbacksFeedbackId (PK), RecipeId (FK - Nullable), UserId (FK - Nullable), GuestName, GuestEmail, Comment, CreatedAtLưu phản hồi cho từng công thức cụ thể hoặc góp ý chung cho website từ cả Member lẫn khách vãng lai.   FaqsFaqId (PK), Question, Answer, DisplayOrderLưu cố định 7 câu hỏi thường gặp và câu trả lời theo chuẩn SRS.   3. Phân quyền & Ma trận Chức năng trên ASP.NET CoreSử dụng Cookie Authentication (hoặc ASP.NET Core Identity) kết hợp [Authorize(Roles = "...")] trên các Controllers/Actions:A. Luồng của Khách vãng lai (General User - [AllowAnonymous])Home & Info: Xem trang chủ giới thiệu về đầu bếp James Thew, các lớp học cuối tuần của ông, danh sách thông báo thắng giải (Announcements) và 7 câu hỏi FAQs.   Free Recipes & Tips: Xem và tìm kiếm công thức/mẹo có cờ IsFree == true. Nếu bấm vào bài IsFree == false, hệ thống điều hướng sang trang yêu cầu Đăng nhập/Đăng ký gói thành viên.   Contests: Xem danh sách cuộc thi đang mở (IsActive == true) và điền form gửi bài dự thi (nhập Tên, Email, Tên món/Mẹo, Nguyên liệu, Cách làm) mà không cần đăng nhập.   Feedback: Gửi phản hồi trực tiếp dưới mỗi công thức miễn phí hoặc phản hồi về website.   B. Luồng của Thành viên trả phí (Registered Member - [Authorize(Roles = "Member,Admin")])Đăng ký & Thanh toán (Register Flow): Tại trang Đăng ký, người dùng điền thông tin cá nhân, chọn gói Monthly ($10) hoặc Yearly ($100) và xác nhận thanh toán giả lập (Mock Payment Gateway) trước khi tài khoản được kích hoạt.   Truy cập toàn diện: Xem và tìm kiếm toàn bộ Recipes và Tips trên hệ thống (cả bài của James Thew lẫn bài do các thành viên khác đóng góp).   Đóng góp nội dung (CRUD cá nhân): Đăng tải Recipe (kèm nguyên liệu, quy trình nấu) và Tip mới; chỉ được quyền sửa hoặc xóa những bài do chính mình đăng (AuthorId == CurrentUserId).   User Profile: Xem và cập nhật thông tin hồ sơ cá nhân ngay trên cùng một trang.   C. Luồng của Quản trị viên (Mr. James Thew - [Area("Admin")][Authorize(Roles = "Admin")])Quản lý Recipes & Tips: Đăng công thức/mẹo mới kèm tùy chọn đánh dấu Free hoặc Members Only; chỉnh sửa hoặc xóa các bài ông đã đăng. Xem toàn bộ bài viết của mọi thành viên.   Quản lý Contests & Chấm giải: Tạo cuộc thi mới, xóa cuộc thi cũ, xem danh sách tất cả bài dự thi (ContestEntries) theo từng cuộc thi, chọn người thắng cuộc và xuất bản lên trang Announcements.   Quản lý Feedback: Xem danh sách toàn bộ phản hồi của người dùng gửi về cho các công thức nấu ăn.   4. Các Điểm Kỹ Thuật Cần Chú Ý Khi Chấm Đồ Án AptechXử lý điều kiện đăng ký kèm thanh toán: Tài liệu yêu cầu rõ "customer can register with the site provided he makes the payment". Do đó, trong AccountController.Register, bạn nên thiết kế form 2 bước (hoặc tích hợp chọn gói $10/$100 + nhập thông tin thẻ giả lập ngay trên form đăng ký). Khi Submit thành công, tạo bản ghi User và Payment trong cùng một Database Transaction (BeginTransactionAsync).   Logic lọc dữ liệu Tìm kiếm (Search Action): Trong RecipeController.Index(string searchString, int? categoryId):Nếu User.Identity.IsAuthenticated (Member/Admin): Truy vấn toàn bộ bảng Recipes.   Nếu chưa đăng nhập (Guest): Bắt buộc nối thêm .Where(r => r.IsFree == true) vào câu lệnh LINQ.   Seed sẵn 7 câu hỏi FAQ: Trong file DbInitializer (hoặc OnModelCreating trong ApplicationDbContext), seed sẵn chính xác 7 câu hỏi tiếng Anh trong SRS (từ "How to become the member of this site?" đến "How can I know who is the winner?") để giảng viên kiểm tra giao diện khớp 100% với đề bài.   Comment code & Backup: Đề bài yêu cầu mọi khối code (Class/Method) đều phải có comment giải thích logic rõ ràng. Hãy dùng XML Documentation Comments (/// <summary>...) của C# trên các Controller và Service. 