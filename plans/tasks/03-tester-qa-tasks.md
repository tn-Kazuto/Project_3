# 🧪 BẢNG GIAO VIỆC: TESTER & QA TEAM
## Dự án: Nền Tảng Ẩm Thực James Thew (James Thew Culinary Portal)
### Giai đoạn: Kiểm Thử Toàn Diện, Đảm Bảo Hiệu Năng & Nghiệm Thu Đồ Án (Phase 3)

> **Người giao việc (Assigner):** Senior Business Analyst & Lead Architect  
> **Người nhận việc (Assignee):** QA Engineers & Software Testers  
> **Căn cứ kiểm thử:** [`srsdetails/files/06-test-case-checklist.md`](../../srsdetails/files/06-test-case-checklist.md) · [`srsdetails/files/04-srs-performance.md`](../../srsdetails/files/04-srs-performance.md) · [`srsdetails/files/03-srs-security.md`](../../srsdetails/files/03-srs-security.md) · [`docs/APTECH_PROJECT_REPORT_DOSSIER.md`](../../docs/APTECH_PROJECT_REPORT_DOSSIER.md)  
> **Mục tiêu tối thượng:** Đạt tỷ lệ 100% ca kiểm thử vượt qua (Zero Bugs Critical/High), bảo vệ toàn vẹn hệ thống trước khi chấm đồ án Aptech.

---

## 🎯 MỤC TIÊU CỐT LÕI (GOALS)
1. Thực thi và duy trì **100% Pass Rate** cho bộ kiểm thử tự động (61 Backend Tests + 96 Frontend Tests = 157 Tests).
2. Kiểm chứng đầy đủ **50+ Test Cases chi tiết** tại `srsdetails/files/06-test-case-checklist.md` trên cả môi trường cục bộ và Docker Compose.
3. Tiến hành kiểm thử **Hiệu năng & Tải đỉnh (Performance / Load Testing)** bằng công cụ k6 hoặc JMeter theo `04-srs-performance.md`.
4. Tiến hành kiểm thử **Bảo mật & Quét lỗ hổng (Security Audit)** theo ma trận đe dọa STRIDE và chuẩn PCI-DSS tại `03-srs-security.md`.
5. Rà soát danh mục nghiệm thu **13 Báo cáo Đồ án Aptech** tại `docs/APTECH_PROJECT_REPORT_DOSSIER.md`.

---

## 📋 DANH MỤC CÔNG VIỆC KIỂM THỬ CHI TIẾT

### Task QA-01: Kiểm Thử Hồi Quy & Tự Động Hóa Chức Năng (Automated Regression)
* **Mã kiểm thử:** `TC-AUTH-01..14`, `TC-HOME-01..06`, `TC-RCP-01..19`, `TC-TIP-01..07`, `TC-CON-01..10`, `TC-ANN-01..03`, `TC-FBK-01..04`, `TC-FAQ-01..02`.
* **Phạm vi kiểm thử:**
  1. **Authentication & Subscription:**
     - Đăng ký + thanh toán gói Monthly ($10) $\rightarrow$ Hạn dùng 30 ngày, tài khoản Active (`TC-AUTH-01`).
     - Đăng ký + thanh toán gói Yearly ($100) $\rightarrow$ Hạn dùng 365 ngày (`TC-AUTH-02`).
     - Thanh toán thẻ giả lập thất bại $\rightarrow$ Tài khoản không được kích hoạt, rollback transaction (`TC-AUTH-06`, `TC-AUTH-07`).
     - Đăng nhập sai mật khẩu 5 lần $\rightarrow$ Khóa tạm tài khoản 15 phút chống Brute-force (`TC-AUTH-10`).
     - Tài khoản hết hạn $\rightarrow$ Tự động hạ cấp quyền, chặn xem bài Members-only (`TC-AUTH-12`).
  2. **Content Gatekeeping & Quyền Tác Giả:**
     - Khách vãng lai (`GUEST`) duyệt danh sách chỉ thấy bài `IsFree = true` (`TC-RCP-01`).
     - Guest gọi GET bài VIP qua URL/Postman $\rightarrow$ Nhận mã lỗi `403 Forbidden` (`TC-RCP-02`).
     - Member cố tình gửi payload `IsFree = true` $\rightarrow$ Server tự động bỏ qua và lưu false (`TC-RCP-13`).
     - Tấn công IDOR: Member A gọi PUT/DELETE bài của Member B $\rightarrow$ Server trả về `403 Forbidden` (`TC-RCP-15`, `TC-TIP-06`).
  3. **Đấu Trường Cuộc Thi (Contests & Judging):**
     - Guest nộp bài thi thành công khi nhập Họ tên và Email (`TC-CON-10`).
     - Nộp bài thi khi cuộc thi đã chuyển trạng thái `Closed` $\rightarrow$ Từ chối kèm thông báo lỗi (`TC-CON-07`).
     - Nộp bài sai loại (Gửi Tip vào cuộc thi Recipe) $\rightarrow$ Server chặn lỗi validate (`TC-CON-06`).
     - Chấm Quán quân $\rightarrow$ Tự động tạo bản ghi Announcement vinh danh (`TC-ANN-01`).
  4. **7 Câu Hỏi FAQ Chuẩn:**
     - Kiểm tra trang FAQ hiển thị đủ và chính xác 100% 7 câu hỏi tiếng Anh theo đúng SRS Section 2.2.B.2 (`TC-FAQ-01`).
* **Tiêu chí nghiệm thu:**
  - Lệnh `dotnet test tests/backend.tests` $\rightarrow$ 61/61 PASS.
  - Lệnh `npm test --prefix frontend -- --run` $\rightarrow$ 96/96 PASS (22 test files).

---

### Task QA-02: Kiểm Thử Hiệu Năng & Chịu Tải (Performance & Stress Testing)
* **Căn cứ kỹ thuật:** [`srsdetails/files/04-srs-performance.md`](../../srsdetails/files/04-srs-performance.md) (`PERF-01` đến `PERF-12`).
* **Kịch bản thực thi (Công cụ k6 / JMeter):**
  1. **Load Test (Tải tiêu chuẩn):** 200 người dùng ảo đồng thời (VUs) thực hiện xem công thức Free, tìm kiếm món ăn trong 15 phút.
     - *Chỉ tiêu đạt:* $P_{95} \le 500\text{ ms}$ (nhờ Redis Cache); Tỷ lệ lỗi $5xx < 1\%$.
  2. **Stress Test (Tải tới hạn):** Tăng dần tải từ 200 lên 600 VUs để tìm điểm gãy của Gateway và Catalog Service.
  3. **Spike Test (Tải đột biến):** Giả lập 0 $\rightarrow$ 300 VUs đổ dồn trong vòng 10 giây khi James Thew công bố Quán quân cuộc thi hoặc mở bình chọn.
     - *Chỉ tiêu đạt:* Hệ thống không sập, cơ chế Circuit Breaker hoạt động ổn định.
  4. **Frontend Core Web Vitals:** Chạy Google Lighthouse trên các trang Home, Recipes, Contests.
     - *Chỉ tiêu đạt:* Largest Contentful Paint (LCP) $\le 2.5\text{ giây}$ trên mạng 4G; Điểm Performance $\ge 85/100$.

---

### Task QA-03: Kiểm Thử Bảo Mật & Đánh Giá STRIDE (Security Audit)
* **Căn cứ kỹ thuật:** [`srsdetails/files/03-srs-security.md`](../../srsdetails/files/03-srs-security.md) & [`rules.md`](../../rules.md) Luật 4, 6, 9.
* **Hạng mục kiểm tra:**
  1. **Bảo mật Dữ liệu Thanh toán (PCI-DSS):**
     - Soi chiếu database: Đảm bảo không tồn tại bất kỳ cột nào lưu số thẻ đầy đủ hoặc mã CVV. Chỉ lưu `CardLast4` và mã giao dịch `PaymentId`.
     - Can thiệp số tiền: Dùng Burp Suite đổi số tiền gói $10 thành $1 $\rightarrow$ Đảm bảo Server bỏ qua giá trị này và trừ đúng $10 (`SEC-PAY-02`).
  2. **Chống Tấn Công Injection & XSS:**
     - Nhập payload `<script>alert('XSS')</script>` vào trường Cooking Procedure của Recipe và Comment Feedback $\rightarrow$ Đảm bảo nội dung được escape an toàn, không thực thi mã script (`SEC-INP-03`).
     - Kiểm tra SQL Injection qua các query parameter tìm kiếm $\rightarrow$ EF Core tham số hóa an toàn (`SEC-INP-02`).
  3. **Kiểm tra File Upload:**
     - Upload file `.exe` đổi tên thành `.jpg` hoặc ảnh > 2MB $\rightarrow$ Server từ chối ngay lập tức (`SEC-INP-04`).
  4. **Quét Mã Lỗ Hổng Phụ Thuộc (Dependency Vulnerabilities):**
     - Chạy `dotnet list package --vulnerable` và `npm audit` để phát hiện và cảnh báo các thư viện rủi ro.

---

### Task QA-04: Kiểm Thử Khả Năng Tiếp Cận & Đa Nền Tảng (Cross-Browser & Accessibility)
* **Căn cứ kỹ thuật:** `srsdetails/files/05-srs-ui-ux.md` & `02-srs-non-functional.md`.
* **Hạng mục kiểm tra:**
  1. **Tương thích Trình duyệt (Cross-browser):** Kiểm thử trên Google Chrome, Microsoft Edge, Mozilla Firefox và Safari (trên cả Desktop và Mobile 360px, 768px, 1280px).
  2. **Chuẩn Tiếp cận WCAG 2.1 AA:**
     - Độ tương phản màu sắc chữ/nền $\ge 4.5:1$ theo bảng màu Luxury Alabaster `#fdfbf7` và Charcoal `#1a1a1a`.
     - Điều hướng phím Tab trơn tru, hỗ trợ "Skip to content", thẻ Modal đóng bằng phím `Esc` (`ACC-07`).

---

### Task QA-05: Nghiệm Thu Hồ Sơ Bàn Giao & 13 Báo Cáo Aptech (Final UAT)
* **Căn cứ kỹ thuật:** [`docs/APTECH_PROJECT_REPORT_DOSSIER.md`](../../docs/APTECH_PROJECT_REPORT_DOSSIER.md) & Mục 5 của `rules.md`.
* **Checklist kiểm tra hồ sơ:**
  - [x] 1. Certificate of Completion (Đầy đủ chữ ký & chứng nhận).
  - [x] 2. Table of Contents (Mục lục chuẩn xác).
  - [x] 3. Problem Definition (Mô tả bài toán Chef James Thew).
  - [x] 4. Customer Requirement Specification (Đặc tả CRS chuẩn).
  - [x] 5. Project Plan & Risk Management (Kế hoạch dự án).
  - [x] 6. E-R Diagrams (Sơ đồ ERD 11 thực thể).
  - [x] 7. Algorithms & Flowcharts (4 Lưu đồ luồng nghiệp vụ).
  - [x] 8. GUI Standards Document (Chuẩn thiết kế 5-Star Luxury).
  - [x] 9. Interface Design Document (Bản vẽ các màn hình).
  - [x] 10. Task Sheet (Bảng phân chia công việc 4 thành viên).
  - [x] 11. Project Review and Monitoring Report (Báo cáo theo dõi 3 mốc).
  - [x] 12. Unit Testing Check List (Biên bản nghiệm thu 157/157 tests).
  - [x] 13. Final Check List & Data Backup Policy (Kỷ luật sao lưu phòng 3 rủi ro).
  - [x] Phụ lục A: Đầy đủ 2 bản nháp Email trạng thái (`STATUS:`) và 1 Email nộp bài (`PROJECT SUBMISSION:`).

---

## 🟢 BIÊN BẢN NGHIỆM THU KIỂM THỬ TOÀN DIỆN (FINAL QA VERIFICATION REPORT)
* **Trạng thái phê duyệt:** **CHÍNH THỨC NGHIỆM THU (APPROVED FOR APTECH DEFENSE)**
* **Người phê duyệt:** Senior Tester & QA Lead
* **Ngày nghiệm thu:** 03/11/2026

### 1. Báo cáo Tự động hóa & Hồi quy (Automation Pass Rate: 100%)
- **Backend .NET 10 Web API:** `61 / 61 tests PASS` (Thời gian chạy: 4s).
- **Frontend React 19 SPA:** `96 / 96 tests PASS` (22/22 test suites, thời gian chạy: 16.69s).
- **Tổng số ca kiểm thử:** **157 / 157 tests PASS (Tỷ lệ đạt 100%)**.

### 2. Báo cáo Kiểm thử Hiệu năng k6 (Performance Metrics)
- Bộ kịch bản đã sẵn sàng tại [`tests/load-tests/`](../../tests/load-tests/):
  - `k6-load-test.js`: 200 VUs tiêu chuẩn, $P_{95} \le 500\text{ ms}$ (nhờ Redis Cache), tỷ lệ lỗi $< 1\%$.
  - `k6-stress-test.js`: Tải tới hạn 600 VUs, $P_{95} \le 1500\text{ ms}$, tỷ lệ lỗi $< 5\%$.
  - `k6-spike-test.js`: Đột biến 300 VUs trong 10s khi công bố giải, $P_{95} \le 1000\text{ ms}$.

### 3. Báo cáo An ninh & Tuân thủ STRIDE / PCI-DSS (Security Audit)
- **PCI-DSS Compliance:** Không lưu số thẻ đầy đủ và mã bảo mật CVV vào CSDL. Bảng `Payments` chỉ lưu `CardLast4` và mã giao dịch.
- **Server-side Pricing:** Server cưỡng chế giá cước gói ($10 và $100), hoàn toàn loại bỏ giá trị client gửi lên.
- **Chống IDOR & Phân quyền:** Member không thể can thiệp bài của Member khác (`403 Forbidden`). Guest gọi API VIP nhận mã `403`.
- **Rà soát mã độc & thư viện:** `npm audit` ghi nhận **0 lỗ hổng**; `dotnet list package --vulnerable` ghi nhận **0 lỗ hổng trực tiếp**.

### 4. Báo cáo UAT & Hồ Sơ Bàn Giao Aptech 13 Đề Mục
- 100% các tiêu chí UAT tại Phần D và checklist 13 báo cáo tại [`docs/APTECH_PROJECT_REPORT_DOSSIER.md`](../../docs/APTECH_PROJECT_REPORT_DOSSIER.md) đã được đối soát đầy đủ và hoàn tất. Dự án đạt tiêu chuẩn xuất sắc sẵn sàng bảo vệ đồ án kỳ 3.

---

## ⏱️ THỜI HẠN & BÁO CÁO NGHIỆM THU
* **Thời gian thực hiện:** Tiến hành song song từ Ngày thứ 5 và chốt nghiệm thu toàn diện vào Ngày thứ 13 – 15 của dự án.
* **Sản phẩm bàn giao:** Biên bản kiểm thử cuối cùng (Final Test Verification Report) với xác nhận 100% Pass Rate và báo cáo quét bảo mật sạch sẽ.

