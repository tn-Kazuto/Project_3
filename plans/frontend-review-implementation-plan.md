# Kế hoạch triển khai Frontend theo review của giảng viên

**Dự án:** James Thew Culinary Platform  
**Ngày cập nhật:** 18/11/2026  
**Phạm vi:** Frontend trước; backend và kiến trúc microservice được ghi nhận là dependency riêng  
**Trạng thái chung:** Đã có một số phần UI/contract trong working tree; chưa thể nghiệm thu end-to-end khi API backend tương ứng chưa có.

> Tài liệu này là kế hoạch chi tiết cho phần frontend và thay thế các mô tả frontend chung chung trong [review-feedback-implementation-plan.md](review-feedback-implementation-plan.md). Kế hoạch kiến trúc service và backend vẫn nằm trong tài liệu tổng.

## 1. Tóm tắt chính xác theo từng ý review

| Ý review | Phạm vi frontend | Trạng thái hiện tại |
|---|---|---|
| Chỉnh frontend người dùng | Rà soát luồng thư viện, chi tiết công thức, form tạo nội dung; kiểm tra responsive, bàn phím và trạng thái tải/lỗi/rỗng. | Workspace recipe/tip có lỗi tải kèm thử lại; dialog tạo/sửa giữ focus, khóa Tab và hỗ trợ Esc. Visual QA trên trình duyệt vẫn còn. |
| Xem lại việc chia microservice | Frontend tiếp tục gọi qua Gateway và gom API theo domain ở lớp service; không gọi thẳng địa chỉ nội bộ của từng service. | Không phải thay đổi UI. Cần backend chốt API owner/route trước khi tích hợp các contract mới. |
| Khách xem một phần công thức và được yêu cầu đăng ký | Thẻ teaser → trang chi tiết preview → CTA đăng ký/đăng nhập; sau xác thực quay lại công thức. | UI đã xử lý theo `accessLevel: PREVIEW`. Chưa có preview thật nếu Catalog chưa trả DTO đã cắt ở server. |
| Thêm video cho công thức | Cho nhập link hoặc upload video; xem trước, báo lỗi/trạng thái; lưu video cùng công thức; phát an toàn ở trang chi tiết. | Admin và Chef/member dùng một trường URL/upload dùng chung; đã bỏ input upload video trùng trong form admin. Cần xác nhận upload/lưu/phát end-to-end với backend và media service. |
| Chỉnh frontend admin | Làm việc trên dashboard đang được route `/admin/*` sử dụng; nối phân trang thật cho danh sách công thức và mẹo; xử lý bàn phím cho dialog. | Đã nối `AdminPagination` với API phân trang; các dialog admin giữ focus, khóa Tab, hỗ trợ Esc và ngăn đóng form recipe khi đang lưu/upload. Không refactor toàn bộ dashboard trong đợt này. |
| Quản lý tài khoản, xem ai đăng ký | Tab danh sách tài khoản chỉ dành cho admin, có tìm kiếm/lọc/phân trang và trình bày responsive. | UI và client API đã có; đang chờ endpoint admin. Bản hiện tại chỉ đọc danh sách, chưa khóa/xóa tài khoản hoặc đổi role. |
| Thêm role đầu bếp | Hiển thị role, lối vào Chef Studio và bảo vệ route frontend theo role `CHEF`. | Frontend đã nhận diện `CHEF`, có route `/chef` và navigation riêng. Backend phải phát claim và cấp quyền tương ứng; giao diện chưa có thao tác gán role cho tài khoản. |

## 2. Phạm vi và nguyên tắc thực hiện

### Có trong phạm vi frontend

- Cải thiện theo màn hình và luồng liên quan trực tiếp đến review; giữ React/Vite, design system và API client hiện tại.
- Gọi API qua `frontend/src/services/api.js`; không để component tự gọi trực tiếp từng microservice.
- Xử lý `loading`, `empty`, `error` và `success` cho danh sách/tác vụ có dữ liệu từ server.
- Không giả dữ liệu khi API chưa có. Nếu API chưa sẵn sàng, hiển thị lỗi có hướng dẫn thử lại.
- Không coi việc ẩn nút hoặc route guard là ranh giới bảo mật; backend vẫn phải xác thực quyền.

### Ngoài phạm vi frontend

- Tách service, chuyển controller/database, thiết kế Gateway route, migration role hoặc tính entitlement thuê bao.
- Trả preview an toàn, cắt dữ liệu recipe ở server và lọc danh sách tài khoản ở backend.
- Quyết định nghiệp vụ chưa được chốt như quyền Chef đổi nội dung Free/Member-only hoặc admin được khóa tài khoản.

## 3. Kế hoạch theo luồng và trạng thái

### FE-01 — Thư viện công thức và luồng preview

**Mục tiêu:** Khách nhận biết được công thức dành cho thành viên, xem phần preview được phép và hiểu cách mở khóa.

**Đã có trong frontend:**

- `frontend/src/pages/public/RecipesPage.jsx`: thẻ member-only chỉ mở chi tiết preview khi API đánh dấu `accessLevel === "PREVIEW"`; nếu không có teaser thì dẫn tới đăng ký.
- `frontend/src/pages/public/RecipeDetailPage.jsx`: hiển thị trạng thái preview, không render video khi preview, đặt CTA đăng ký/đăng nhập sau phần nội dung được API trả.
- `frontend/src/pages/auth/LoginPage.jsx` và `RegisterPage.jsx`: giữ đường quay lại nội dung sau xác thực/đăng ký.
- Trạng thái tải/lỗi có nút thử lại ở thư viện; recipe thiếu trường ingredients không làm vỡ card.

**Còn phải làm để nghiệm thu:**

1. Catalog trả teaser công khai cho recipe member-only và `accessLevel` rõ ràng.
2. Catalog trả tối đa `ceil(số bước × 50%)` cho khách; không trả các bước còn lại hoặc URL video độc quyền.
3. Xác nhận quy tắc tách bước với dữ liệu cũ: newline/đánh số/đoạn văn; không cắt nửa chuỗi theo ký tự.
4. Kiểm tra trực tiếp API khi khách bỏ qua UI để bảo đảm nội dung khóa không xuất hiện trong response/cache.
5. Kiểm tra luồng CTA: đăng ký hoặc đăng nhập xong quay lại trang recipe; nội dung full chỉ xuất hiện sau khi backend xác nhận entitlement.

**Contract cần backend:**

- List teaser: `recipeId`, `title`, `categoryName`, `authorName`, `imageUrl`, `isFree`, `accessLevel`; không có `ingredients`, `cookingProcedure` hoặc video premium.
- Detail: `accessLevel: "FULL" | "PREVIEW"`; preview chỉ chứa các bước được phép xem và không có `videoUrl` premium.

**Tiêu chí hoàn tất:** test guest với recipe Free, guest với member-only preview, guest không có preview, member hợp lệ, subscription hết hạn và admin; xác nhận payload API không lộ phần bị khóa.

**Trạng thái:** UI theo contract đã có; chờ Catalog và Billing/entitlement để tích hợp thật.

### FE-02 — Video trong công thức

**Mục tiêu:** Người có quyền tạo công thức có thể thêm video; người đọc có thể xem video hợp lệ.

**Đã có trong frontend:**

- `frontend/src/components/common/RecipeVideoField.jsx`: trường nhập URL hoặc upload video dùng `uploadMediaFile(file, "video")`, báo lỗi/trạng thái và hiển thị preview.
- Form admin chỉ còn một luồng upload video qua trường dùng chung; không còn input file rời có thể khiến URL upload và URL lưu bị lệch nhau.
- `frontend/src/utils/recipeVideo.js`: chỉ tạo embed cho HTTPS YouTube/Vimeo đã nhận diện hoặc URL trực tiếp có đuôi video hỗ trợ; không nhúng URL tùy ý.
- Trường video được dùng trong form recipe admin và form recipe ở `frontend/src/pages/member/MyRecipesPage.jsx` (được tái sử dụng cho Chef Studio).
- `frontend/src/pages/public/RecipeDetailPage.jsx`: phát video trực tiếp hoặc embed theo parser; preview không render video.
- Upload dùng flow media hiện có; giới hạn hiện tại là 100 MB và các loại file upload được service cho phép.

**Còn phải làm để nghiệm thu:**

1. Xác minh media ticket, upload, complete ticket và lưu `secureUrl` trên recipe ở môi trường tích hợp.
2. Xác minh tạo và sửa recipe đều giữ đúng `videoUrl`/`thumbnailUrl`; lỗi upload không làm mất form đang nhập.
3. Xác minh người không có entitlement không lấy được URL video premium từ list, detail, cache hoặc response lỗi.
4. Kiểm tra phát video trên các viewport mục tiêu và bàn phím; không tự phát video.

**Contract cần backend/media:** ticket upload trả đúng `uploadUrl`, fields và ticket id; completion trả `secureUrl`; recipe detail chỉ trả video khi quyền cho phép.

**Trạng thái:** UI và tích hợp client với media service hiện có đã được nối; chưa đánh dấu end-to-end cho tới khi kiểm tra API/lưu/phát thực tế.

### FE-03 — Admin dashboard và danh sách tài khoản

**Mục tiêu:** Admin xem được danh sách đăng ký và vận hành các màn quản lý hiện có trên desktop/mobile.

**Đã có trong frontend:**

- `frontend/src/pages/admin/AdminDashboardPage.jsx`: tab Members; phân trang server-side cho Recipes/Cooking Tips; tổng số lấy từ `totalCount`; response entries hỗ trợ dạng array hoặc `items`.
- Dialog tạo recipe/tip/contest/announcement có tên truy cập được, focus trap và đóng bằng Esc; form recipe không đóng giữa lúc lưu hoặc upload video.
- `frontend/src/pages/admin/components/AdminMembersPanel.jsx`: tìm tên/email, lọc role/trạng thái subscription, phân trang, loading/empty/error/retry; 404 được báo rõ là endpoint chưa có.
- `frontend/src/pages/admin/components/AdminMembersList.jsx`: bảng desktop và card mobile; chỉ render trường cần thiết, không hiển thị payment details.
- `frontend/src/services/api.js`: `adminUsersApi.getPaged()` gọi endpoint dự kiến `/users/admin`.

**Còn phải làm để nghiệm thu:**

1. Backend cung cấp endpoint phân trang và xác nhận các giá trị role/status, tên trường và envelope.
2. Test admin xem đúng tài khoản, search/filter hoạt động cùng phân trang; test Member/Guest không truy cập endpoint.
3. Xác minh không trả password hash, số thẻ hoặc payment details.
4. Chạy kiểm tra responsive, keyboard navigation, label và focus; quyết định có cần thêm thao tác đổi role/khóa tài khoản hay không trước khi phát triển.

**Contract UI đang kỳ vọng:**

```text
GET /api/users/admin?page=&pageSize=&search=&role=&subscriptionStatus=
data.items[]: userId, fullName, username, email, role,
              subscriptionPlan, isSubscriptionActive, createdAt, subscriptionEnd
data.totalCount, data.pageIndex, data.pageSize
```

Filter hiện dùng `MEMBER | CHEF | ADMIN` và `ACTIVE | EXPIRED`. Backend cần xác nhận hoặc điều chỉnh contract thống nhất trước integration. Endpoint không tồn tại thì UI hiển thị error state, không dùng mock.

**Trạng thái:** UI/client đã có; chờ Identity/Core API và projection trạng thái thuê bao. Chức năng hiện là xem/tìm/lọc, chưa phải CRUD tài khoản.

### FE-04 — Role Chef và Chef Studio

**Mục tiêu:** Chef vào đúng không gian tạo/quản lý nội dung, không nhận quyền admin.

**Đã có trong frontend:**

- `frontend/src/context/AuthContext.jsx`: nhận diện role `CHEF`.
- `frontend/src/App.jsx`: route `/chef` yêu cầu `CHEF` và render workspace nội dung hiện có.
- `frontend/src/components/common/Navbar.jsx`: link Chef Studio và badge CHEF; giữ navigation admin tách riêng.
- `frontend/src/pages/member/MyRecipesPage.jsx`: dùng chung form tạo công thức/mẹo và trường video; cờ `isFree` hiện chỉ cho admin thay đổi.

**Còn phải làm để nghiệm thu:**

1. Backend phát `CHEF` trong JWT/current-user contract và áp dụng policy cho từng API.
2. Xác minh Chef chỉ xem/sửa nội dung theo ownership; không truy cập admin/account/billing.
3. Chốt role assignment: ai gán role Chef và bằng giao diện/API nào. Hiện Members tab chưa có thao tác gán role.
4. Chốt Chef có được xuất bản nội dung Free hay chỉ admin; giao diện hiện không cho Chef đổi cờ này.
5. Xác minh token cũ/refresh sau khi role thay đổi và đường điều hướng khi role không hợp lệ.

**Trạng thái:** Navigation/route/UI reuse đã có; authorization thật và quy trình cấp role còn chờ backend/quyết định nghiệp vụ.

### FE-05 — Rà soát UX và responsive các màn liên quan

**Mục tiêu:** Hoàn thiện trải nghiệm nhất quán, accessible và không làm xáo trộn phần không liên quan.

**Màn cần kiểm tra:** thư viện công thức, chi tiết công thức/preview, login/register sau CTA, form tạo recipe/video, dashboard admin, danh sách tài khoản, Chef Studio.

**Checklist:**

- Viewport 360px, 768px và 1280px; kiểm tra table/card, nút, form và nội dung dài.
- Keyboard-only: thứ tự Tab, focus nhìn thấy, nút/link có tên, form field có label và error state được đọc.
- Loading, empty, error/retry, success; chặn submit khi upload chưa xong.
- Contrast, alt ảnh, iframe/video title, touch target và `prefers-reduced-motion` theo design system hiện có.
- Kiểm tra bằng trình duyệt thật và ghi lại ảnh/bug trước khi kết luận pass.

**Trạng thái:** Automated tests/build đã đạt ở lần kiểm tra 17/11/2026; vòng visual QA chưa hoàn tất vì môi trường không khởi chạy được headless Chrome.

**Cập nhật 18/11/2026:** Đã thêm `frontend/src/hooks/useDialogAccessibility.js` cho focus ban đầu, vòng Tab, phím Esc và trả focus; dùng ở dialog admin và workspace member/Chef. Workspace báo lỗi khi tải dữ liệu và cho thử lại. Unit test hook đã được thêm. Full browser visual QA vẫn chưa chạy được trong môi trường hiện tại.

### FE-06 — Tương thích khi backend chia service theo chức năng

**Nguyên tắc frontend:** UI chỉ gọi API qua Gateway/client tại `frontend/src/services/api.js`. Không thêm URL nội bộ của Catalog, Identity, Billing hoặc Media vào component.

**Việc frontend cần làm sau khi backend chốt ranh giới:**

1. Xác nhận endpoint public recipe thuộc Catalog; tài khoản/role thuộc Identity/Core; upload thuộc Media; entitlement thuộc Billing/projection.
2. Cập nhật base routes/client adapters một lần ở service layer khi Gateway contract thay đổi.
3. Giữ DTO UI ổn định bằng mapping ở service layer nếu các domain service trả response khác nhau.
4. Xác nhận timeout/lỗi unavailable và thông báo UX; không để component gọi lần lượt từng microservice để ghép dữ liệu tài khoản.

**Trạng thái:** Không cần thêm UI riêng cho việc tách service. Đây là dependency kiến trúc/backend; frontend chỉ tích hợp sau khi ownership và Gateway routes được thống nhất.

## 4. Thứ tự triển khai đề xuất

| Bước | Công việc | Điều kiện vào | Đầu ra |
|---|---|---|---|
| 1 | Chốt preview 50%, role Chef, quyền đổi visibility và user DTO | Product/giảng viên xác nhận quy tắc | Contract versioned, không còn field/enum mơ hồ |
| 2 | Backend triển khai Catalog preview, admin users, CHEF claim/policies | Gateway/service owner đã xác định | API đúng contract và có authorization server-side |
| 3 | Tích hợp UI preview/account/Chef với API thật | Staging API khả dụng | Luồng end-to-end, không mock |
| 4 | Xác minh upload video và quyền phát | Media/Catalog API khả dụng | Tạo/sửa recipe và phát video theo entitlement |
| 5 | Visual/accessibility QA frontend | Màn tích hợp ổn định | Checklist viewport/keyboard/error hoàn tất, ảnh QA |
| 6 | Regression và nghiệm thu | Bước 1–5 pass | Test report, danh sách issue còn lại nếu có |

## 5. Tiêu chí hoàn tất frontend

- Guest xem recipe Free đầy đủ; recipe premium chỉ mở được teaser/preview do server cấp; CTA dẫn đúng đăng ký/đăng nhập và quay lại recipe.
- Không có full procedure hoặc premium `videoUrl` trong response của guest, kể cả khi gọi API ngoài UI.
- Recipe form admin/Chef hỗ trợ link/upload; upload lỗi, quá dung lượng hoặc đang chạy có trạng thái rõ ràng; không lưu URL không hợp lệ.
- Admin xem, tìm, lọc và phân trang danh sách tài khoản; loading/empty/error/retry hoạt động; role server-side được kiểm tra.
- CHEF vào được workspace theo claim; không thể dùng quyền admin qua thao tác UI hoặc gọi API.
- Các màn trong FE-05 đạt responsive, keyboard/accessibility và có kiểm tra trình duyệt thực tế.
- Không phát sinh dependency mới; build và test frontend pass.

## 6. Rủi ro và phụ thuộc cần theo dõi

| Rủi ro/phụ thuộc | Tác động | Cách xử lý |
|---|---|---|
| Catalog chưa có preview/teaser DTO | UI preview chỉ thể hiện khi API trả `PREVIEW`; không thể tự tạo preview an toàn ở client | Ưu tiên API contract và test payload trước khi bật end-to-end |
| `/users/admin` chưa tồn tại | Tab Members hiện hiển thị hướng dẫn lỗi 404 | Triển khai Identity/Core endpoint và thống nhất projection subscription |
| Backend chưa phát role `CHEF` | Chef Studio bị route guard từ chối | Thêm role claim/policy phía server trước nghiệm thu |
| Chưa chốt quyền Chef và role assignment | Có thể cấp quyền quá rộng hoặc UI không đúng quy trình | Chốt matrix quyền và luồng admin gán Chef trước khi thêm hành động quản lý role |
| Headless Chrome không khởi chạy được trong môi trường kiểm tra | Không có bằng chứng visual QA hiện tại | Chạy QA trên máy/CI có Chrome và lưu kết quả theo FE-05 |

## 7. Kiểm tra đã chạy và còn thiếu

- `frontend`: `npm test` — 101/101 test pass (18/11/2026).
- `frontend`: `npm run build` — pass; Vite còn cảnh báo chunk JS minified 577.84 kB vượt ngưỡng 500 kB.
- `git diff --check` — pass; Git báo chuẩn hóa LF sang CRLF cho một file kế hoạch trên Windows.
- Chưa có visual browser QA; không coi kiểm tra automated là thay thế cho bước này.
- Chưa có xác nhận integration cho Catalog preview, `/users/admin`, CHEF authorization và quyền truy cập video.
