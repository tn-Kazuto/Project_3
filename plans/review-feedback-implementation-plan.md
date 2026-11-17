# Kế hoạch xử lý review của giảng viên

**Dự án:** James Thew Culinary Platform  
**Ngày lập:** 16/11/2026  
**Trạng thái:** Đang triển khai theo thứ tự frontend-first  
**Vai trò:** Senior Frontend / Full-stack Engineer

**Tiến độ frontend:** Đã dựng giao diện preview theo API contract, trường upload video dùng chung, lối vào Chef Studio và tab danh sách tài khoản admin. Phần preview thực tế và danh sách tài khoản còn chờ API backend.

## 1. Mục tiêu

Chuyển các ý kiến review thành phạm vi triển khai có thể nghiệm thu:

1. Rà soát và chỉnh trải nghiệm frontend người dùng.
2. Rà soát ranh giới các microservice theo chức năng nghiệp vụ.
3. Cho khách xem bản xem trước khoảng một nửa công thức member-only, kèm lời mời đăng ký để xem đầy đủ.
4. Hoàn thiện luồng video hướng dẫn trong công thức.
5. Cải thiện dashboard admin và thêm màn hình xem/quản lý tài khoản thành viên.
6. Bổ sung role `CHEF` với quyền hạn rõ ràng.

Mục tiêu là hoàn thiện trên nền tảng hiện tại, không viết lại toàn bộ frontend hoặc tạo thêm service chỉ để tăng số lượng service.

## 2. Hiện trạng đã rà soát

| Khu vực | Hiện trạng trong repository | Hệ quả cho kế hoạch |
|---|---|---|
| Frontend | React 19, Vite 8; có route riêng cho trang công thức, chi tiết công thức và `/admin/*`. | Giữ stack và routing hiện có; cải thiện theo từng màn hình, ưu tiên responsive, accessibility và trạng thái loading/empty/error/success. |
| Quyền truy cập công thức | Catalog hiện lọc danh sách khách về công thức `IsFree`; mở công thức member-only khi chưa có quyền trả lỗi thay vì trả preview. | Cần thay đổi cả response của Catalog và UI; không thể chỉ che phần nội dung bằng CSS. |
| Video | Recipe DTO/database có `VideoUrl`; trang chi tiết đã render YouTube, Vimeo và video trực tiếp. Admin hiện nhập URL. Đã có `uploadMediaFile` và Media Service hỗ trợ upload video có kiểm tra loại file. | Hoàn thiện luồng admin chọn upload hoặc nhập URL, lưu URL đã xác thực vào công thức, và kiểm tra phát video end-to-end; tránh xây lại trình phát. |
| Admin | Route `/admin/*` đang giới hạn cho `ADMIN`; `AdminDashboardPage` là dashboard đang được App sử dụng. | Bổ sung tab quản lý tài khoản và tinh chỉnh dashboard đang hoạt động; kiểm tra phần `features/admin` trước khi tái sử dụng để tránh dựa vào code cũ không được route gọi. |
| Tài khoản | `UsersController` hiện có profile, đổi mật khẩu và gia hạn; chưa có API danh sách người đăng ký dành cho admin. | Cần API có phân trang/lọc và màn hình chỉ dành cho admin. |
| Role | Quyền hiện dùng `ADMIN` và `MEMBER`; frontend và nhiều API kiểm tra role này trực tiếp. | Bổ sung `CHEF` xuyên suốt token, policy backend, gateway/service và frontend; không chỉ thêm một nhãn ở giao diện. |
| Microservices | Có YARP Gateway, Core Backend và các domain service Catalog, Billing, Contest, Community, Media, Notification. Một số chức năng/cấu trúc legacy còn nằm trong Core Backend. | Trước tiên lập bản đồ API và xác định nguồn dữ liệu chuẩn; hoàn tất ranh giới và lộ trình chuyển phần legacy, không nhân bản domain hay database. |

## 3. Đề xuất nghiệp vụ và phân quyền

### 3.1. Preview công thức cho khách

- Công thức `Free` tiếp tục hiển thị đầy đủ cho khách theo mô hình hiện tại.
- Với công thức `Members-only`, khách xem được thông tin giới thiệu và phần đầu của cách làm; hệ thống hiển thị CTA **“Đăng ký thành viên để xem toàn bộ công thức”**.
- Đề xuất định nghĩa “một nửa” là `ceil(tổng số bước × 50%)` của phần hướng dẫn nấu. Nguyên liệu, tiêu đề, ảnh và thông tin cơ bản có thể hiển thị đầy đủ; video độc quyền không trả URL phát cho khách.
- Catalog phải chỉ gửi dữ liệu preview cho khách. Không gửi toàn bộ nội dung rồi cắt ở trình duyệt. Cùng một nguyên tắc áp dụng cho API chi tiết, danh sách/teaser và cache.
- Danh sách khách cần có thể hiển thị thẻ teaser của công thức member-only (chỉ gồm metadata công khai) để người dùng có thể bấm vào xem preview. Không đưa nguyên liệu/cách làm/video độc quyền vào response của danh sách.
- Sau khi bấm CTA, chuyển tới luồng `/register` hiện có và giữ `returnTo` để quay lại công thức sau khi đăng ký/đăng nhập thành công. Luồng đăng ký hiện gắn với chọn gói và thanh toán, vì vậy copy phải phản ánh đúng bước tiếp theo.
- Định dạng `CookingProcedure` hiện là chuỗi. Cần chốt cách nhận biết bước (xuống dòng, đánh số, hoặc đoạn văn); nếu dữ liệu cũ không có ranh giới bước, dùng quy tắc fallback ổn định thay vì cắt tùy tiện theo byte/ký tự.

### 3.2. Ma trận role đề xuất

| Role | Quyền chính |
|---|---|
| `GUEST` | Xem nội dung miễn phí và preview member-only; không cần tài khoản. Đây là trạng thái chưa đăng nhập, không nhất thiết lưu thành role trong DB/JWT. |
| `MEMBER` | Quyền thành viên theo gói còn hiệu lực; tạo/quản lý nội dung của chính mình theo chính sách hiện tại. |
| `CHEF` | Tạo và quản lý công thức, mẹo và video thuộc phạm vi biên tập; chỉ sửa nội dung mình sở hữu trừ khi admin cấp quyền cụ thể. Không xem/quản lý danh sách tài khoản, thanh toán hay cấu hình nền tảng. |
| `ADMIN` | Quản trị nền tảng, quản lý tài khoản/role, contest, feedback và toàn bộ nội dung theo quyền hiện có. |

**Quyết định cần thống nhất trước khi code:** Có tách `CHEF` khỏi `ADMIN` hay tài khoản Chef James vẫn là `ADMIN` có nhãn nghề nghiệp? Kế hoạch đề xuất tách quyền `CHEF` để least-privilege có ý nghĩa; tài khoản admin hiện tại cần được giữ nguyên quyền sau migration. Chốt thêm việc `CHEF` có được đổi cờ Free/Member-only hay chỉ `ADMIN` được đổi.

### 3.3. Quản lý tài khoản thành viên

- Bản đầu cung cấp danh sách tài khoản đã đăng ký, tìm kiếm, phân trang và lọc theo role/trạng thái gói.
- Cột đề xuất: họ tên, email, role, ngày đăng ký, gói, ngày hết hạn và trạng thái thuê bao.
- Không trả password hash, thông tin thẻ hoặc dữ liệu thanh toán nhạy cảm. Không thêm khóa/xóa tài khoản nếu chưa có quy tắc nghiệp vụ và audit riêng.
- Identity/Core Backend sở hữu danh tính; Billing sở hữu trạng thái thuê bao/thanh toán. Chọn một projection/API tổng hợp có phân trang, tránh gọi Billing một lần cho mỗi user.

### 3.4. Hợp đồng dữ liệu frontend/backend

- Recipe detail trả `accessLevel: "FULL" | "PREVIEW"`; khi là `PREVIEW`, `cookingProcedure` chỉ chứa các bước được phép xem và response không có `videoUrl` độc quyền.
- Recipe teaser trong danh sách chỉ cần `recipeId`, `title`, `categoryName`, `authorName`, `imageUrl`, `isFree` và `accessLevel`; không gửi `ingredients` hay `cookingProcedure` cho bài premium chưa mở quyền.
- Danh sách admin dùng `GET /api/users/admin?page=&pageSize=&search=&role=&subscriptionStatus=` và envelope `data.items`, `data.totalCount`, `data.pageIndex`, `data.pageSize`.
- Các response trên là contract mà frontend đợt đầu sẽ tích hợp; backend cần triển khai tương ứng trước khi các tính năng preview/danh sách tài khoản hoạt động end-to-end.

## 4. Ranh giới service mục tiêu

| Service / thành phần | Trách nhiệm chuẩn | Ghi chú rà soát |
|---|---|---|
| YARP Gateway | Điểm vào API, định tuyến và truyền identity/claims. | Kiểm tra route cho endpoint admin, Catalog và Media; quyền vẫn phải được xác thực tại service đích. |
| Core Backend / Identity | Đăng nhập, đăng ký, hồ sơ, danh tính, role và API quản trị tài khoản. | Xác nhận đây là nguồn chuẩn của user/role; lên kế hoạch chuyển dần controller legacy còn chồng lấn. |
| Catalog | Recipes, Tips, Categories, FAQs, quyền đọc nội dung và preview. | Chỉ Catalog quyết định dữ liệu nào được trả theo guest/member/chef/admin. |
| Media | Cấp upload ticket, xác minh upload và trả secure URL cho ảnh/video. | Reuse Cloudinary flow đang có; không để Catalog giữ logic upload. |
| Billing | Subscription, payment và trạng thái entitlement. | Identity/Catalog lấy entitlement qua API/event/projection đã thống nhất, không đọc trực tiếp database của Billing. |
| Contest | Contests, entries, votes và kết quả cuộc thi. | Giữ độc lập khỏi Catalog; chỉ chia sẻ sự kiện/ID cần thiết. |
| Community | Feedback, reviews, comments và share counts. | Giữ dữ liệu và API cộng đồng riêng. |
| Notification | Email, SignalR và xử lý notification event. | Nhận sự kiện nghiệp vụ; không nhận trách nhiệm quản lý user/subscription. |

**Nguyên tắc thực hiện:** lập inventory route → chọn một owner cho từng API/entity → cấu hình Gateway và contracts → chuyển traffic → kiểm tra tương thích → chỉ dọn đường legacy khi đã xác nhận không còn consumer. Không nhân đôi database hoặc thêm service mới nếu chưa có lý do về ownership, tải, triển khai hay bảo mật.

## 5. Các giai đoạn triển khai

### Giai đoạn 0 — Chốt hợp đồng và baseline

- Lập bảng endpoint hiện tại: frontend call → Gateway route → controller/service → database owner.
- Chốt định nghĩa preview 50%, vai trò `CHEF`, quyền chỉnh visibility và nguồn trạng thái thuê bao.
- Chốt response contract cho preview và danh sách tài khoản trước khi làm giao diện.
- Ghi nhận màn hình/component admin đang được dùng thực tế; không xóa hoặc refactor code legacy trong phạm vi này.

**Đầu ra:** sơ đồ service/API ownership, role matrix được duyệt và API contract.

### Giai đoạn 1 — Frontend-first theo contract

- Hoàn thiện thẻ teaser và `RecipeDetailPage` theo `accessLevel`; giữ đầy đủ bài Free/member đã mở quyền, chỉ render các bước preview do API trả về và không đọc video độc quyền ở preview.
- Thêm CTA đăng ký/đăng nhập/renew, giữ đường quay lại công thức sau xác thực.
- Dùng `uploadMediaFile(file, 'video')` trong form admin và Chef/member; hỗ trợ URL an toàn, preview video, lỗi và trạng thái upload.
- Thêm role-aware navigation và Chef Studio; giữ trang quản lý tài khoản chỉ trong dashboard ADMIN.
- Thêm tab danh sách tài khoản với search, filter, pagination, mobile cards và loading/empty/error; không dùng mock data khi API chưa có.

**Đầu ra:** UI hoàn chỉnh theo response contract; các màn hình có thể hiển thị trạng thái API chưa sẵn sàng mà không giả dữ liệu.

### Giai đoạn 2 — Backend: role, tài khoản và Catalog

- Thêm `CHEF` vào constants/validation và phát role claim trong token.
- Cập nhật authorization policy cho Recipes, Tips, Media và route admin theo ma trận đã chốt; giữ `ADMIN` hiện tại hoạt động sau migration.
- Thêm API admin đọc danh sách thành viên có phân trang, search/filter; response chỉ có trường cho phép và trạng thái thuê bao từ projection/API Billing.
- Điều chỉnh guest list để trả metadata teaser member-only; API chi tiết trả full recipe hoặc preview DTO đã cắt ở server.
- Kiểm tra entitlement, ownership, cache key/TTL và lỗi Billing; không trả nội dung đầy đủ khi không xác minh được quyền.
- Chốt hiệu lực role change đối với token đang còn hạn (refresh/revoke theo cơ chế hiện có).

**Đầu ra:** API role/account/content khớp contract frontend, có kiểm soát quyền server-side và migration tương thích dữ liệu cũ.

### Giai đoạn 3 — Tích hợp, phát hành và thu dọn

- Chạy kiểm tra unit/integration/E2E theo checklist bên dưới và kiểm tra ở viewport 360px, 768px, 1280px.
- Kiểm tra log, lỗi Gateway, migration và dữ liệu role/subscription sau deploy.
- Chuyển route sang owner chuẩn; chỉ xóa/đánh dấu deprecated controller legacy sau khi có xác nhận consumer và tương thích.
- Cập nhật README/SRS hoặc tài liệu kiến trúc tại các phần bị thay đổi.

## 6. Tiêu chí nghiệm thu

### Quyền xem nội dung

- Guest xem công thức Free đầy đủ.
- Guest nhìn thấy teaser của công thức member-only; detail chỉ có phần preview đã định nghĩa và CTA rõ ràng.
- Kiểm tra response API trực tiếp xác nhận không thể lấy phần bị khóa hoặc URL video độc quyền bằng cách bỏ qua UI.
- Member có subscription còn hạn xem đầy đủ; subscription hết hạn không nhận full content.
- Admin có đầy đủ quyền quản trị; Chef chỉ dùng được chức năng được cấp; Member/Guest không gọi được API admin.

### Video

- Upload file loại được hỗ trợ có giới hạn dung lượng, timeout và lỗi thân thiện; lưu secure URL và mở phát được trên recipe detail.
- URL ngoài không thuộc provider/format cho phép bị từ chối hoặc không được nhúng.
- Bài free, member-only, guest, member hết hạn và member còn hạn tuân theo cùng chính sách quyền nội dung.

### Admin và tài khoản

- Admin tìm kiếm/phân trang/lọc được danh sách tài khoản; dữ liệu gói và trạng thái khớp nguồn Billing.
- Guest, Member và Chef nhận `403` khi gọi API danh sách tài khoản.
- API/UI không hiển thị password hash, số thẻ hoặc thông tin payment nhạy cảm.
- Bảng và form dùng được bằng bàn phím, có label/focus rõ ràng và hiển thị đúng ở mobile/tablet/desktop.

### Service boundaries

- Mỗi API/entity có service sở hữu rõ ràng; Gateway route tới đúng service.
- Không service nào đọc trực tiếp database của service khác.
- Các luồng Billing → Identity/entitlement và Catalog → Media dùng API/event contract; có xử lý lỗi/retry phù hợp.
- Chức năng hiện có vẫn chạy qua Gateway trong khi chuyển dần phần legacy.

## 7. Rủi ro và cách kiểm soát

| Rủi ro | Kiểm soát |
|---|---|
| “50% công thức” không nhất quán do procedure là text tự do. | Chốt quy tắc chia bước ở Giai đoạn 0; bổ sung hướng dẫn nhập bước nếu dữ liệu cũ thiếu phân đoạn. |
| Role `CHEF` chồng lấn với `ADMIN` hoặc `MEMBER`. | Duyệt ma trận quyền trước khi sửa token/policy; dùng deny-by-default và kiểm thử từng role. |
| Role claim trong JWT cũ còn hiệu lực sau khi đổi role. | Chốt thời hạn và cơ chế refresh/revoke; không dựa vào việc người dùng tự đăng xuất. |
| Catalog gọi Billing làm tăng độ trễ hoặc Billing lỗi. | Ưu tiên entitlement projection/cache có TTL và trạng thái lỗi đóng an toàn; không trả full nội dung khi không xác minh được quyền. |
| Video URL gây lộ nội dung hoặc nhúng nguồn không an toàn. | Không trả URL premium trong preview; allowlist host/format và xác minh URL tại backend. |
| Legacy API và service mới cùng sửa dữ liệu. | Chọn single writer cho từng domain; chuyển route có kiểm soát trước khi vô hiệu hóa đường cũ. |

## 8. Ngoài phạm vi đợt đầu

- Viết lại toàn bộ website hoặc đổi design system/tech stack.
- Thêm package bên thứ ba.
- Tạo thêm microservice khi chưa xác định ownership và nhu cầu triển khai độc lập.
- Thực hiện thanh toán thật, chỉnh sửa/xóa tài khoản hàng loạt hoặc thay đổi hợp đồng subscription chưa được duyệt.

## 9. Trình tự ưu tiên

1. Dựng frontend theo contract, hoàn tất preview/CTA, video, Chef Studio và tab thành viên.
2. Triển khai API role/account/catalog và service ownership tương ứng.
3. Tích hợp, xác minh response không lộ nội dung premium và cập nhật tài liệu.
4. Kiểm tra viewport 360px, 768px, 1280px và chuyển route Gateway sau khi backend sẵn sàng.

