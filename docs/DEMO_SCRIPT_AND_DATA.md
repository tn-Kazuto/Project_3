# TÀI LIỆU KỊCH BẢN TRÌNH DIỄN & BỘ DỮ LIỆU DEMO MẪU
## CHEF JAMES THEW 5-STAR CULINARY HUB & GLOBAL CONTESTS PLATFORM
**Đồ án:** Aptech eProject Semester 3 (HDSE / ADSE)  
**Tác giả & Đội ngũ:** Nhóm Dự án James Thew  
**Phiên bản:** v2.0 Production Ready  
**Ngày cập nhật:** Tháng 11/2026  

---

## MỤC LỤC
1. [Checklist Chuẩn Bị Kỹ Thuật Trước Giờ G (Pre-Demo Checklist)](#1-checklist-chuẩn-bị-kỹ-thuật-trước-giờ-g)
2. [Kho Dữ Liệu Demo Mẫu Chuẩn (Ready-to-use Sample Data)](#2-kho-dữ-liệu-demo-mẫu-chuẩn)
   - [2.1. Danh sách tài khoản thử nghiệm & Thẻ thanh toán](#21-danh-sách-tài-khoản-thử-nghiệm--thẻ-thanh-toán-mô-phỏng)
   - [2.2. Mẫu đăng ký tài khoản mới & thanh toán](#22-mẫu-đăng-ký-tài-khoản-mới--thanh-toán)
   - [2.3. Mẫu công thức nấu ăn 5 sao (New Recipe Sample)](#23-mẫu-công-thức-nấu-ăn-5-sao-new-recipe-sample)
   - [2.4. Mẫu mẹo ẩm thực độc quyền (New Tip Sample)](#24-mẫu-mẹo-ẩm-thực-độc-quyền-new-tip-sample)
   - [2.5. Mẫu nộp bài thi cuộc thi (Contest Submissions - Guest & Member)](#25-mẫu-nộp-bài-thi-cuộc-thi-contest-submissions)
   - [2.6. Mẫu tạo cuộc thi mới (Admin Create Contest)](#26-mẫu-tạo-cuộc-thi-mới-admin-create-contest)
   - [2.7. Mẫu phản hồi & ảnh đĩa ăn thực tế (Feedback Sample)](#27-mẫu-phản-hồi--ảnh-đĩa-ăn-thực-tế-feedback-sample)
   - [2.8. Dữ liệu chuẩn 7 câu hỏi FAQ tiếng Anh](#28-dữ-liệu-chuẩn-7-câu-hỏi-faq-tiếng-anh-bắt-buộc)
3. [Kịch Bản Trình Diễn Chi Tiết Từng Phút (Chronological Demo Script)](#3-kịch-bản-trình-diễn-chi-tiết-từng-phút)
   - [Act 1: Khởi động & Mở màn (00:00 - 02:00)](#act-1-khởi-động--mở-màn-0000---0200)
   - [Act 2: Trải nghiệm Khách Vãng Lai - Persona Guest (02:00 - 06:00)](#act-2-trải-nghiệm-khách-vãng-lai---persona-guest-0200---0600)
   - [Act 3: Luồng Chuyển Đổi & Hội Viên VIP - Persona Member (06:00 - 11:00)](#act-3-luồng-chuyển-đổi--hội-viên-vip---persona-member-0600---1100)
   - [Act 4: Quyền Lực Quản Trị Viên - Persona Chef James Thew (11:00 - 16:00)](#act-4-quyền-lực-quản-trị-viên---persona-chef-james-thew-1100---1600)
   - [Act 5: Tổng Kết Kỹ Thuật, NFR & Kết Thúc (16:00 - 18:00)](#act-5-tổng-kết-kỹ-thuật-nfr--kết-thúc-1600---1800)
4. [Bộ Câu Hỏi & Đáp Án Phản Biện Hội Đồng (Defense Q&A Cheat Sheet)](#4-bộ-câu-hỏi--đáp-án-phản-biện-hội-đồng)

---

## 1. CHECKLIST CHUẨN BỊ KỸ THUẬT TRƯỚC GIỜ G

Để buổi demo diễn ra trơn tru không gặp bất kỳ sự cố kỹ thuật nào, người thuyết trình (Presenter) thực hiện kiểm tra các bước sau 15 phút trước khi lên sóng:

- [ ] **1. Dịch vụ Backend & Microservices:**
  - `.env` đã được cấu hình với `ADMIN_SEED_PASSWORD`; đặt thêm `DEMO_MEMBER_PASSWORD` nếu buổi demo cần đăng nhập bằng member mẫu. Cả hai phải được đặt trước lần backend seed database đầu tiên.
  - Khởi động Backend một lần trước để tạo Admin/member từ các secret đã cấu hình; sau đó nạp `database/seed-data.sql` để thêm dữ liệu demo. Nếu SQL script tạo member trước Backend, mật khẩu member là ngẫu nhiên và không thể dùng đăng nhập.
  - Gateway / API Core: Đang lắng nghe tại cổng `http://localhost:5000` (hoặc cấu hình Gateway `8000`).
  - Redis Service: Đang hoạt động trên cổng `6379` để phục vụ caching bài viết Free.
- [ ] **2. Ứng dụng Frontend (Client):**
  - Đã chạy lệnh `npm run dev` tại thư mục `frontend/`, sẵn sàng tại `http://localhost:3000`.
- [ ] **3. Chuẩn bị 2 Trình duyệt Song Song:**
  - **Trình duyệt A (Google Chrome):** Đăng nhập sẵn tài khoản **Admin** (`james@jamesthew.com`).
  - **Trình duyệt B (Firefox hoặc Chrome Chế độ Ẩn danh Incognito):** Để trống ở trạng thái **Guest (Chưa đăng nhập)** sẵn sàng cho Act 2 và luồng Đăng ký Member ở Act 3.
- [ ] **4. File Dữ liệu Demo (Cheat Sheet):** Mở sẵn file tài liệu này ở màn hình phụ hoặc in ra giấy để copy-paste nhanh các nội dung mẫu (nguyên liệu, cách làm, mô tả) mà không tốn thời gian gõ phím.

---

## 2. KHO DỮ LIỆU DEMO MẪU CHUẨN

### 2.1. Danh sách tài khoản thử nghiệm & Thẻ thanh toán mô phỏng

| Vai trò (Role) | Email đăng nhập | Mật khẩu | Thông tin gói cước |
| :--- | :--- | :--- | :--- |
| **Admin (Owner)** | `james@jamesthew.com` | Giá trị `ADMIN_SEED_PASSWORD` đã cấp cho môi trường | Toàn quyền Quản trị viên (Bếp trưởng James Thew) |
| **Member VIP 1** | `sophia@culinaryart.com` | Giá trị `DEMO_MEMBER_PASSWORD` đã cấp cho môi trường | Gói Tháng (`MONTHLY` - $10), còn hạn 15 ngày |
| **Member VIP 2** | `marcus@greenkitchen.org` | Giá trị `DEMO_MEMBER_PASSWORD` đã cấp cho môi trường | Gói Năm (`ANNUAL` - $100), còn hạn 335 ngày |
| **Member VIP 3** | `elena@gourmetjourney.net` | Giá trị `DEMO_MEMBER_PASSWORD` đã cấp cho môi trường | Gói Năm (`ANNUAL` - $100), còn hạn 305 ngày |
| **Guest** | *(Không đăng nhập)* | *(Không có)* | Khách vãng lai |

`ADMIN_SEED_PASSWORD` và `DEMO_MEMBER_PASSWORD` chỉ áp dụng khi database được seed lần đầu. Thay đổi biến môi trường không đổi mật khẩu các tài khoản đã tồn tại; dùng quy trình reset mật khẩu của môi trường đó.

#### Bộ thẻ tín dụng Sandbox để test luồng Thanh toán (Payment Gateway):
- **Số thẻ thành công (Success):** `4242 4242 4242 4242`  
  - Ngày hết hạn: `12/28`  
  - CVC: `123`  
  - Tên chủ thẻ: `ALEX JOHNSON`  
  - Mã bưu điện (Zip): `90210`
- **Số thẻ bị từ chối (Declined/Fail):** `4000 0000 0000 0002`  
  - Ngày hết hạn: `12/28`  
  - CVC: `999`  
  - Tình huống kiểm thử: Chứng minh hệ thống báo lỗi thanh toán và không kích hoạt tài khoản trái phép.

---

### 2.2. Mẫu đăng ký tài khoản mới & thanh toán
*Dùng để copy-paste trong bước tạo tài khoản mới tại Act 3.*

```text
Họ và tên: Alex Johnson
Email: alex.johnson@gastronomy.org
Số điện thoại: +1-555-0899
Mật khẩu: Tự đặt một mật khẩu riêng cho tài khoản demo; không dùng lại secret Admin
Xác nhận mật khẩu: Nhập lại mật khẩu vừa tạo
Gói đăng ký: Monthly Subscription ($10)
```

---

### 2.3. Mẫu công thức nấu ăn 5 sao (New Recipe Sample)
*Dùng để copy-paste khi Member hoặc Admin đăng công thức mới.*

- **Tiêu đề (Title):**  
  `Pan-Roasted Chilean Sea Bass with Lemongrass-Ginger Beurre Blanc & Caviar`
- **Danh mục (Category):**  
  `Non-Vegetarian`
- **Ảnh đại diện (Image URL):**  
  `https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80`
- **Video hướng dẫn (Video URL):**  
  `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- **Thời gian chuẩn bị & nấu:** `Prep: 20 mins | Cook: 15 mins | Servings: 2`
- **Danh sách Nguyên liệu (Ingredients):**
```text
- 2 fillets (200g each) fresh Chilean Sea Bass (skin-on, scaled)
- 2 stalks fresh organic lemongrass (bruised and thinly minced)
- 25g young ginger root (finely grated)
- 1 medium French shallot (minced)
- 60ml dry white wine (Sauvignon Blanc)
- 30ml white wine vinegar
- 150g unsalted cultured butter (cold, cubed into 1-inch dice)
- 30g Royal Ossetra Caviar (for finishing)
- 2 tbsp extra virgin cold-pressed olive oil
- Flaky Maldon sea salt & white Kampot pepper to taste
- Fresh micro-chervil for garnish
```
- **Quy trình chế biến (Cooking Procedure):**
```text
1. Prepare the Fish: Pat sea bass fillets thoroughly dry with culinary paper towels. Score skin lightly in a diamond pattern to prevent curling. Season flesh generously with sea salt and Kampot white pepper.
2. The Sear: Heat a heavy cast-iron skillet over medium-high heat with olive oil until shimmering. Place fillets skin-side down, gently pressing with a fish spatula for 30 seconds. Cook undisturbed for 5 minutes until skin achieves an ultra-crisp golden crust. Flip and cook for 3 more minutes until internal temperature registers 52°C. Rest on a warm rack.
3. The Beurre Blanc: In a heavy saucier, combine minced shallots, lemongrass, grated ginger, white wine, and white vinegar. Reduce over medium heat until only 2 tablespoons of concentrated liquid remain.
4. Emulsification: Turn heat to the lowest setting. Whisk in cold cubed butter one piece at a time, allowing each to emulsify before introducing the next. Strain through a fine chinois for a velvet-smooth texture. Season with a drop of lemon juice.
5. Plating: Pool fragrant Lemongrass Beurre Blanc onto warmed porcelain plates. Rest crisp sea bass atop sauce. Crown with a quenelle of Royal Ossetra Caviar and micro-chervil. Serve immediately.
```

---

### 2.4. Mẫu mẹo ẩm thực độc quyền (New Tip Sample)
*Dùng để Member hoặc Admin đăng tải Mẹo nấu ăn.*

- **Tiêu đề (Title):**  
  `The Science of the Maillard Reaction: Unlocking Maximum Umami in Searing`
- **Nội dung mẹo (Tip Content):**
```text
Moisture is the mortal enemy of a pristine sear. When cold meat hits a hot skillet with surface moisture, the energy is wasted boiling water (100°C) rather than triggering the complex Maillard reaction which requires temperatures between 140°C and 165°C. 

Pro-Chef Golden Rule:
1. Dry-brine your steaks or fish uncovered on a wire rack in the refrigerator for at least 6 hours before cooking. The circulating cold air dehydrates the exterior sheath while concentrating internal juices.
2. Always pre-heat heavy cast-iron or stainless steel cookware until oil shimmers.
3. Never crowd the pan—crowding drops the pan surface temperature by up to 50°C instantly, turning a crisp sear into a soggy steam.
```

---

### 2.5. Mẫu nộp bài thi cuộc thi (Contest Submissions)

#### A. Bài thi của Khách vãng lai (Guest Submission - Không cần Login)
- **Cuộc thi nhắm đến:** Cuộc thi đang mở (*Summer Fusion Culinary Challenge*)
- **Họ tên khách (Guest Name):** `David Miller`
- **Email liên hệ (Guest Email):** `david.miller.gourmet@gmail.com`
- **Số điện thoại:** `+1-555-0722`
- **Tiêu đề bài thi (Title):**  
  `Summer Cold Soba with Truffle-Dashi Broth & Tempura Shiso`
- **Nguyên liệu (Ingredients):**
```text
- 200g artisanal Japanese buckwheat soba noodles
- 400ml cold dashi stock (kombu + bonito flake extraction)
- 30ml artisanal white soy sauce (Shiro Shoyu)
- 15ml pure white truffle oil
- 4 fresh Japanese Shiso leaves
- 50g ice-cold tempura batter mix & sparkling mineral water
- Finely sliced scallions and toasted nori strips
```
- **Cách làm (Procedure):**
```text
1. Boil soba in vigorously boiling water for exactly 4 minutes. Shock immediately in ice water bath to remove starch and achieve a springy al-dente bite.
2. Whisk cold dashi with white soy sauce and fragrant truffle oil; refrigerate until chilled to 4°C.
3. Dip shiso leaves in light tempura batter, flash-fry at 180°C for 25 seconds until translucent and crisp.
4. Swirl chilled noodles into bamboo bowls, pour truffle-dashi broth tableside, and garnish with crisp tempura shiso.
```

#### B. Bài thi của Thành viên VIP (Member Submission - Đã Login)
- **Tác giả:** Sophia Laurent (`sophia@culinaryart.com`)
- **Tiêu đề bài thi:**  
  `Saffron-Infused Poached Pear in Spiced Riesling Wine with Mascarpone Quenelle`
- **Nội dung / Nguyên liệu:**
```text
4 Bosc Pears (peeled, stem intact), 500ml Spiced Riesling wine, 0.5g Iranian Saffron threads, 1 Ceylon Cinnamon stick, 3 Star Anise, 150g Madagascar vanilla bean mascarpone. Simmered for 25 minutes until translucent ruby gold.
```

---

### 2.6. Mẫu tạo cuộc thi mới (Admin Create Contest)
*Dùng cho Chef James Thew tạo cuộc thi ẩm thực mùa mới.*

```text
Tiêu đề: Autumn Golden Harvest: Master of Soups & Veloutés
Loại bài thi (Type): RECIPE
Mô tả thể lệ: 
Chào đón mùa thu vàng cùng Bếp trưởng James Thew! Hãy chia sẻ công thức súp hoặc velouté độc đáo của bạn sử dụng các nguyên liệu mùa thu (bí đỏ, nấm rừng, hạt dẻ hoặc táo). Bài thi xuất sắc nhất sẽ được vinh danh trên trang chủ và nhận giải thưởng hiện kim cùng bộ dao 5 sao từ Bếp trưởng.
Giải thưởng (Prize): $500 Cash & Handcrafted Damascus Chef Knife Set
Ngày bắt đầu (Start Date): Ngày hiện tại
Ngày kết thúc (End Date): Ngày hiện tại + 30 ngày
Trạng thái: ACTIVE (Mở nhận bài thi)
```

---

### 2.7. Mẫu phản hồi & ảnh đĩa ăn thực tế (Feedback Sample)

- **Người gửi:** `Clara Vance` (Guest)
- **Email:** `clara.vance@foodie.com`
- **Đánh giá sao:** `5 Stars` (★★★★★)
- **Ảnh món ăn thực tế đã nấu:**  
  `https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80`
- **Nội dung nhận xét:**
```text
Em đã thử nấu món Súp Bí Đỏ Hạt Dẻ theo công thức của thầy James cho bữa tiệc gia đình tối qua. Kỹ thuật nướng chậm bí đỏ trước khi xay nhuyễn thật sự tạo nên vị ngọt sâu tự nhiên và mùi thơm caramel tuyệt vời. Cả nhà em đều khen nức nở! Cảm ơn thầy James rất nhiều!
```

---

### 2.8. Dữ liệu chuẩn 7 câu hỏi FAQ tiếng Anh bắt buộc
*Được nạp sẵn từ `DbInitializer` đúng 100% nguyên văn đề bài Aptech.*

1. **How to become the member of this site?**  
   *Answer:* You can become a member by navigating to the Register page, filling in your full name, email, secure password, and choosing either a Monthly Subscription ($10) or a Yearly Subscription ($100), followed by an automated credit card checkout.
2. **Will there be any subscription charges?**  
   *Answer:* Yes, we offer two transparent subscription tiers: Monthly Membership at $10/month and Annual Membership at $100/year (giving you 2 months free of masterclasses).
3. **How to view the recipes and tips? Will there be any charges for that?**  
   *Answer:* All recipes and tips marked as "Free" can be viewed freely by any guest without registration. To unlock exclusive 5-star Masterclasses, video walkthroughs, and fellow members' secret contributions, you must be a registered paid member.
4. **I am not the registered member of the site. Can I participate in the contest held?**  
   *Answer:* Absolutely yes! Chef James Thew welcomes culinary passion worldwide. Unauthenticated guests can participate in all open contests by providing their contact details (Name and Email) along with their ingredients and cooking procedure.
5. **How to upload or post the recipes and tips?**  
   *Answer:* Once registered as a member, access your personalized "My Recipes" portal from the top navigation. Click "Post New Recipe" or "Send Tip", fill in the structured ingredients and cooking procedures, and submit.
6. **How to post a feedback?**  
   *Answer:* You can post feedback directly at the bottom of any recipe detail page with a 1-to-5 star rating and dish photo, or visit our dedicated Site Feedback page to share your thoughts on the platform.
7. **I have posted a recipe or a tip with respect to the contest. How can I know who is the winner?**  
   *Answer:* Once the contest concludes, Chef James Thew reviews all submissions and declares the champions on the official "Announcements" page. Winning participants will also receive an automated email notification and in-app alert.

---

## 3. KỊCH BẢN TRÌNH DIỄN CHI TIẾT TỪNG PHÚT

- **Tổng thời lượng:** 18 Phút.
- **Phân vai chính:**
  - `MC / Presenter`: Dẫn dắt, giải thích nghiệp vụ và lý do thiết kế kỹ thuật.
  - `Operator / Navigator`: Điều khiển chuột, bàn phím, copy data mẫu.

---

### ACT 1: KHỞI ĐỘNG & MỞ MÀN (00:00 - 02:00)

#### 00:00 - 01:00: Lời chào & Tuyên bố giá trị
- **Màn hình:** Mở sẵn Trang chủ (`/`) trên màn hình máy chiếu.
- **Thao tác:** Đứng thẳng, chào Hội đồng, chỉ tay lên màn hình trang chủ.
- **Lời thoại Presenter:**
  > *"Kính thưa quý thầy cô trong Hội đồng Giám khảo Aptech!*  
  > *Hôm nay, em rất vinh dự được đại diện nhóm trình diễn đồ án eProject Semester 3 với đề tài: **Nền Tảng Ẩm Thực 5 Sao & Cuộc Thi Toàn Cầu – Chef James Thew Culinary Hub**.*  
  > *Dự án được xây dựng nhằm giải quyết bài toán thực tế của Bếp trưởng James Thew: Đưa các công thức nấu ăn bí truyền, các mẹo bếp trên sóng truyền hình và các lớp học ẩm thực cuối tuần ra toàn cầu thông qua mô hình kinh doanh **Freemium Subscription**. Toàn bộ hệ sinh thái tuân thủ nghiêm ngặt tiêu chuẩn thiết kế kiến trúc 5 sao và chuẩn kỹ thuật IEEE 830."*

#### 01:00 - 02:00: Giới thiệu Kiến trúc & Thanh điều hướng động
- **Màn hình:** Rê chuột lên thanh Navigation.
- **Thao tác:** Trỏ chuột qua các nút: `Home`, `Recipes`, `Tips`, `Contests`, `Announcements`, `Feedback`, `FAQs`, `Login / Register`.
- **Lời thoại Presenter:**
  > *"Quý thầy cô có thể quan sát: Hệ thống tích hợp **Thanh điều hướng động (Dynamic Navigation)** tự động biến đổi giao diện theo 3 tác nhân: **Guest**, **Member** và **Admin**. Hiện tại, ở trạng thái Khách vãng lai chưa đăng nhập, người dùng được tiếp cận các khu vực công cộng. Em xin bắt đầu với luồng trải nghiệm của một người yêu ẩm thực vãng lai."*

---

### ACT 2: TRẢI NGHIỆM KHÁCH VÃNG LAI - PERSONA GUEST (02:00 - 06:00)

#### 02:00 - 03:00: Tiểu sử Bếp trưởng & Bộ lọc Công thức Free
- **Thao tác:**
  1. Cuộn xem phần **About Chef James** và thông tin lớp học nấu ăn cuối tuần (`REQ-HOME-01`).
  2. Bấm vào menu **Recipes** (`/recipes`).
  3. Lọc danh mục *Italian* hoặc tìm kiếm từ khóa *"Tiramisu"*.
- **Lời thoại Presenter:**
  > *"Đầu tiên, khách vãng lai có thể tìm hiểu toàn bộ thông tin tiểu sử, giải thưởng và thông tin các lớp học cuối tuần của thầy James. Khi chuyển sang kho công thức, hệ thống thực thi thuật toán **Content Gatekeeping**: Khách chỉ thấy những bài viết có huy hiệu xanh **`FREE`** được thầy James phát hành miễn phí thuộc 4 danh mục sách: Juices, Vegetarian, Non-Vegetarian và Italian."*

#### 03:00 - 03:45: Thử nghiệm Gatekeeping chống truy cập trái phép
- **Thao tác:** Click trực tiếp vào một công thức VIP (bài Steak hoặc Risotto có nhãn *Members Only*) hoặc gõ URL `/recipes/9`.
- **Hiển thị:** Màn hình bật Modal thông báo bảo vệ nội dung: *"This Masterclass is reserved for VIP Members. Subscribe for $10/mo to unlock full ingredients & video procedures."* kèm nút Chuyển đến Đăng ký.
- **Lời thoại Presenter:**
  > *"Điều gì xảy ra nếu khách vãng lai cố tình đoán ID bài viết hoặc gửi request trực tiếp qua Postman? Như quý thầy cô thấy, hệ thống chặn đứng ở tầng Server-side với mã HTTP 403 Forbidden. Hoàn toàn không có chuyện rò rỉ nguyên liệu hay các bước chế biến bí truyền ra bên ngoài."*

#### 03:45 - 04:45: Khách nộp bài thi Cuộc thi (Thẩm định OQ-01)
- **Thao tác:**
  1. Bấm menu **Contests** (`/contests`). Chọn cuộc thi *"Summer Fusion Culinary Challenge"*.
  2. Bấm nút **Participate in Contest**.
  3. Form nhận diện chưa đăng nhập -> Hiển thị thêm ô: Họ tên & Email.
  4. Paste dữ liệu [Mẫu 2.5.A](#a-bài-thi-của-khách-vãng-lai-guest-submission---không-cần-login) (David Miller, món Cold Soba).
  5. Bấm **Submit Entry**.
- **Lời thoại Presenter:**
  > *"Đề bài Aptech đặt ra một câu hỏi then chốt: 'Khách chưa đăng ký tài khoản có được thi nấu ăn không?' Nhóm em đã giải quyết dứt điểm theo chuẩn **OQ-01**: Khách vãng lai VẪN ĐƯỢC THI bình đẳng. Hệ thống cho phép nộp bài với `UserId = NULL`, nhưng bắt buộc lưu Tên và Email để thầy James công bố giải thưởng và liên hệ trao quà. Em bấm nộp bài, hệ thống đã lưu bài thi của anh David Miller thành công!"*

#### 04:45 - 05:30: Gửi Đánh giá Món ăn kèm Ảnh thực tế & 7 câu FAQ
- **Thao tác:**
  1. Vào bài viết Tiramisu Free, cuộn xuống phần Feedback.
  2. Paste dữ liệu [Mẫu 2.7](#27-mẫu-phản-hồi--ảnh-đĩa-ăn-thực-tế-feedback-sample) (Chấm 5 sao, gửi ảnh đĩa bánh thực tế đã làm).
  3. Bấm vào menu **FAQs** (`/faqs`). Mở từng câu accordion.
- **Lời thoại Presenter:**
  > *"Bên dưới mỗi món ăn, khách hàng có thể chấm điểm sao và đính kèm ảnh chụp món ăn do chính mình nấu để thầy James thẩm định. Và khi mở trang FAQs, hệ thống hiển thị chính xác **7 câu hỏi thường gặp bắt buộc** bằng tiếng Anh theo đúng quy định tại Mục 7 của đề bài Aptech."*

---

### ACT 3: LUỒNG CHUYỂN ĐỔI & HỘI VIÊN VIP - PERSONA MEMBER (06:00 - 11:00)

#### 06:00 - 07:15: Đăng ký Hội viên & Thanh toán Nguyên tử ($10)
- **Thao tác:**
  1. Bấm **Register** ở góc trên bên phải.
  2. Copy-paste dữ liệu [Mẫu 2.2](#22-mẫu-đăng-ký-tài-khoản-mới--thanh-toán) (`Alex Johnson`, `alex.johnson@gastronomy.org`).
  3. Chọn Radio button: **Monthly Subscription ($10)**.
  4. Nhập thẻ Visa Sandbox: `4242 4242 4242 4242` - `12/28` - `123`.
  5. Bấm **Complete Membership & Activate**.
- **Lời thoại Presenter:**
  > *"Bây giờ, em xin chuyển sang vai diễn thứ hai: Người dùng quyết định đăng ký trở thành Hội viên VIP. Em chọn gói Monthly $10 và quẹt thẻ Visa thử nghiệm. Khi bấm kích hoạt, Backend thực thi giao dịch nguyên tử (Atomic Transaction): Ghi nhận thanh toán $10, thiết lập hạn dùng đúng 30 ngày, sinh mã JWT an toàn và tự động đăng nhập đưa người dùng vào hệ thống."*

#### 07:15 - 08:00: Quan sát Navigation Đổi Trạng Thái Động
- **Thao tác:** Chỉ vào Header mới xuất hiện: Nút Logout, Avatar hội viên, Menu `My Recipes`, `Profile`, Chuông thông báo `Notification Bell`.
- **Lời thoại Presenter:**
  > *"Ngay khi đăng nhập thành công, Dynamic Navigation lập tức tái cấu trúc: Nút Login/Register biến mất, nhường chỗ cho Avatar thành viên VIP, chuông thông báo real-time và toàn bộ quyền lực của hội viên trả phí."*

#### 08:00 - 09:15: Mở khóa Kho tàng Masterclass & Video 5 sao
- **Thao tác:** Vào lại `/recipes`. Bấm vào bài viết VIP *"Pan-Seared Sea Bass"* hoặc *"Tagliolini White Truffle"*.
- **Lời thoại Presenter:**
  > *"Toàn bộ các bài viết bí truyền `Members Only` trước đây bị khóa giờ đã mở ra trọn vẹn: Từ định lượng nguyên liệu chi tiết đến video hướng dẫn kỹ thuật nấu của thầy James."*

#### 09:15 - 10:15: Đăng tải Công thức Mới (Kiểm tra Validation)
- **Thao tác:**
  1. Bấm vào menu **My Recipes** (`/my-recipes`).
  2. Bấm **Post New Recipe**.
  3. Paste dữ liệu [Mẫu 2.3](#23-mẫu-công-thức-nấu-ăn-5-sao-new-recipe-sample).
  4. Cố tình xóa rỗng ô *Cooking Procedure* -> Form chặn lại và báo lỗi đỏ yêu cầu nhập cách làm.
  5. Điền lại đầy đủ -> Bấm **Submit Recipe**.
- **Lời thoại Presenter:**
  > *"Thành viên VIP có quyền đăng tải công thức để chia sẻ cùng cộng đồng. Hệ thống kiểm tra dữ liệu nghiêm ngặt ở cả Client và Server: Bắt buộc phải có đầy đủ phần Nguyên liệu và Quy trình chế biến. Khi bấm lưu, bài viết xuất hiện ngay trong danh mục cá nhân và hiển thị cho các thành viên khác theo cơ chế Post-moderation (OQ-02)."*

#### 10:15 - 11:00: Quản lý Bài cá nhân & Kiểm tra Chống IDOR
- **Thao tác:**
  1. Thử bấm nút Sửa (Edit) bài vừa đăng -> Cập nhật thành công.
  2. Mở trang **Profile** (`/profile`): Xem thông tin tài khoản, hạn gói cước `Active`, lịch sử thanh toán hóa đơn $10 và nút Gia hạn gói.
- **Lời thoại Presenter:**
  > *"Thành viên có toàn quyền Sửa hoặc Xóa bài của chính mình. Hệ thống bảo vệ chặt chẽ chống tấn công IDOR: Thành viên A tuyệt đối không thể sửa hoặc xóa bài của Thành viên B. Tại trang Profile cá nhân, người dùng dễ dàng theo dõi ngày hết hạn gói cước và gia hạn cộng dồn thời gian theo đúng Business Rule BR-02."*

---

### ACT 4: QUYỀN LỰC QUẢN TRỊ VIÊN - PERSONA CHEF JAMES THEW (11:00 - 16:00)

#### 11:00 - 12:00: Đăng nhập Bếp trưởng & Admin Dashboard
- **Thao tác:**
  1. Chuyển sang Trình duyệt A (đã đăng nhập tài khoản `james@jamesthew.com`).
  2. Bấm vào menu độc quyền: **Admin Dashboard** (`/admin`).
- **Lời thoại Presenter:**
  > *"Em xin chuyển sang vai diễn quyền lực nhất của hệ thống: **Bếp trưởng James Thew – Quản trị viên toàn quyền**.*  
  > *Giao diện của thầy James được trang bị bảng điều khiển Executive Dashboard với đầy đủ các công cụ kiểm soát công thức, điều hành cuộc thi và quản lý toàn bộ phản hồi."*

#### 12:00 - 13:00: Đăng Công thức Độc quyền & Quyết định cờ `IsFree`
- **Thao tác:**
  1. Vào Quản lý Recipes của Admin. Bấm Tạo bài mới.
  2. Trỏ chuột vào công tắc: **`Free for All` vs `Members Only`**.
  3. Chọn `Free for All` và lưu bài.
- **Lời thoại Presenter:**
  > *"Điểm khác biệt căn bản giữa Admin và Member được nêu tại Mục 4 của đề bài: Duy nhất thầy James mới có quyền thiết lập cờ `is_free`. Thầy có thể tặng một công thức đỉnh cao cho cộng đồng thế giới bằng cách gắn nhãn `Free`, hoặc đưa vào kho thu phí thành viên."*

#### 13:00 - 14:30: Chấm Giải Cuộc Thi & Chọn Quán Quân
- **Thao tác:**
  1. Vào **Admin Contests**. Bấm vào cuộc thi *"Summer Fusion Challenge"*.
  2. Bấm **View Submissions (Xem các bài dự thi)**.
  3. Quan sát bài thi của Member Sophia và bài thi của Guest David Miller nộp ban nãy.
  4. Bấm nút **Crown Winner (Chọn Quán quân)** cho bài thi của David Miller.
  5. Nhập nhận xét: *"Kỹ thuật xử lý gia vị xuất sắc, xứng đáng đạt giải Nhất!"*.
  6. Bấm **Publish Official Announcement**.
- **Lời thoại Presenter:**
  > *"Đây là khu vực chấm giải cuộc thi. Thầy James có thể duyệt qua toàn bộ bài dự thi gửi về từ khắp nơi trên thế giới. Thầy xem xét số lượt bình chọn (Community Votes) từ cộng đồng để làm căn cứ đánh giá độ yêu thích.*  
  > *Và tại đây, thầy quyết định trao cúp Quán quân cho bài thi mì Soba của anh David Miller, đính kèm lời nhận xét của Bếp trưởng và bấm **Công bố kết quả**."*

#### 14:30 - 15:15: Sự kiện Vinh danh & Thông báo Tự động (SignalR + Email)
- **Thao tác:**
  1. Mở trang **Announcements** (`/announcements`). Bài viết vinh danh Quán quân David Miller xuất hiện trên cùng.
  2. Chỉ vào Chuông Thông báo (In-App Notification) đã nhảy số đỏ `+1`.
- **Lời thoại Presenter:**
  > *"Ngay khi thầy James bấm công bố, hệ thống kích hoạt đồng thời 3 luồng dữ liệu: Bài vinh danh lập tức xuất hiện trang trọng trên trang Announcements; chuông thông báo in-app bắn tin tức thời; và Notification Service tự động gửi email chúc mừng kèm hướng dẫn nhận giải thưởng tới hộp thư của thí sinh."*

#### 15:15 - 16:00: Giám sát Phản hồi Khách hàng & Kiểm duyệt
- **Thao tác:** Vào mục **Feedback Management** trong Dashboard. Thấy phản hồi 5 sao kèm ảnh đĩa ăn của bạn Clara Vance gửi ở Act 2. Thử chức năng lọc sao hoặc xóa bình luận spam.
- **Lời thoại Presenter:**
  > *"Tại trung tâm quản lý phản hồi, thầy James có thể xem xét toàn bộ đánh giá của học viên và thực khách trên toàn thế giới, theo dõi mức độ hài lòng theo biểu đồ sao và loại bỏ các nội dung phản cảm để giữ trọn vẹn hình ảnh thương hiệu 5 sao."*

---

### ACT 5: TỔNG KẾT KỸ THUẬT, NFR & KẾT THÚC (16:00 - 18:00)

#### 16:00 - 17:00: Minh chứng Kiểm thử Tự động & Hiệu năng
- **Thao tác:** Chiếu màn hình kết quả chạy Unit Test và Sơ đồ Redis Caching.
- **Lời thoại Presenter:**
  > *"Để đảm bảo dự án vận hành mượt mà và an toàn theo chuẩn IEEE 830:*  
  > *1. Hệ thống đã vượt qua **168 / 168 bài kiểm thử tự động (100% Pass Rate)** từ Backend xUnit đến Frontend Vitest.*  
  > *2. Áp dụng chiến lược **Redis Cache** cho các truy vấn công thức Free, đưa thời gian phản hồi trang dưới 50ms và chịu tải hàng ngàn người dùng đồng thời.*  
  > *3. Mã nguồn tuân thủ nghiêm ngặt quy định chú thích (commenting standards) và nguyên tắc Clean Architecture."*

#### 17:00 - 18:00: Chính sách Sao lưu Dữ liệu & Lời cảm ơn
- **Thao tác:** Chiếu tài liệu **Chính sách Sao lưu Dữ liệu (Backup Policy)**.
- **Lời thoại Presenter:**
  > *"Đặc biệt, tuân thủ đúng ghi chú quan trọng trong Đề bài của Aptech về Data Backup, nhóm em đã thiết lập quy trình tự động sao lưu cơ sở dữ liệu SQL Server định kỳ hàng ngày nhằm bảo vệ hệ thống tuyệt đối trước 3 rủi ro: **Nhiễm Virus**, **Lỗi hệ thống** và **Hỏng tệp tin**.*  
  > *Đến đây, nhóm em đã hoàn thành việc đối chiếu và trình diễn trọn vẹn 100% các yêu cầu của dự án Chef James Thew. Em xin chân thành cảm ơn quý thầy cô trong Hội đồng Giám khảo đã lắng nghe, và nhóm em rất sẵn sàng đón nhận các câu hỏi phản biện ạ!"*

---

## 4. BỘ CÂU HỎI & ĐÁP ÁN PHẢN BIỆN HỘI ĐỒNG

### Câu hỏi 1: Vì sao khách vãng lai (Guest) không có tài khoản mà vẫn tham gia thi được? CSDL lưu trữ thế nào?
- **Trả lời:**  
  *Dạ thưa thầy cô, đây là yêu cầu rõ ràng tại **Mục 6 của đề bài Aptech** và **Câu hỏi FAQ số 4**: 'Khách chưa đăng ký tài khoản vẫn được quyền xem và tham gia cuộc thi'. Trong bảng `ContestEntries` (hoặc `ContestSubmissions`), cột `UserId` được thiết kế dạng **Nullable**. Khi khách vãng lai dự thi, `UserId` mang giá trị `NULL`, đồng thời hệ thống kích hoạt validation bắt buộc phải có `GuestName` và `GuestEmail` để liên hệ trao giải. Khi thành viên đăng nhập gửi bài, `UserId` tự động được liên kết với khóa chính của bảng `Users`.*

### Câu hỏi 2: Làm sao để ngăn chặn gian lận khi bình chọn bài dự thi cuộc thi?
- **Trả lời:**  
  *Dạ, hệ thống áp dụng cơ chế **Anti-Fraud Multi-layer** tại bảng `ContestVotes`:*  
  *1. Với Member: Mỗi tài khoản (`UserId`) chỉ được vote duy nhất 1 lần cho mỗi bài thi (ràng buộc Unique Index).*  
  *2. Với Guest: Hệ thống kiểm tra cặp khóa `(ContestEntryId, VoterIpOrEmail)`. Khách phải nhập email hợp lệ và hệ thống ghi lại IP request. Nếu phát hiện IP hoặc email đã vote cho bài thi này trong vòng 24h, hệ thống sẽ từ chối.*  
  *3. Bình chọn cộng đồng chỉ đóng vai trò tham khảo minh bạch; quyền quyết định người chiến thắng cuối cùng thuộc về Bếp trưởng James Thew.*

### Câu hỏi 3: Nếu thành viên gia hạn gói cước khi gói cũ vẫn còn hạn thì tính như thế nào?
- **Trả lời:**  
  *Dạ, theo **Business Rule BR-02**, hệ thống áp dụng chính sách **cộng dồn thời gian (Cumulative Extension)**. Nếu gói Monthly của khách còn 10 ngày nữa mới hết hạn mà họ chọn gia hạn gói Năm ($100), hệ thống sẽ tính `SubscriptionEnd mới = SubscriptionEnd hiện tại + 365 ngày`, đảm bảo khách hàng không bị mất dù chỉ 1 ngày quyền lợi.*

### Câu hỏi 4: Nhóm đã bảo mật hệ thống trước lỗ hổng IDOR (Insecure Direct Object References) ra sao?
- **Trả lời:**  
  *Dạ, nhóm em áp dụng nguyên tắc **Zero Trust**:*  
  *Không bao giờ tin tưởng client! Tại tầng Backend API (Controller & Service), khi nhận request Update/Delete Recipe hoặc Tip, hệ thống lấy `UserId` từ JWT Token đã được ký mật mã và đối chiếu trực tiếp trong CSDL: `if (recipe.AuthorId != currentUserId && !currentUser.IsInRole("ADMIN")) return Forbid();`. Vì vậy dù người dùng có cố tình sửa ID bài viết trên URL thì API vẫn chặn đứng với mã HTTP 403 Forbidden.*

---
*Tài liệu này được biên soạn để in ấn hoặc trình chiếu song song trong suốt quá trình bảo vệ đồ án Aptech eProject.*
