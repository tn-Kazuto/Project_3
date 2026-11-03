# SRS 04 – Performance Requirements

## 1. Giả định tải (v1.0)

| Chỉ số | Giá trị thiết kế |
|---|---|
| Người dùng đăng ký | 5.000 |
| Đồng thời (peak) | 200 người dùng |
| Recipe | 5.000 · Tip 2.000 · Feedback 50.000 |
| Request đỉnh | ~50 req/giây |
| Dung lượng ảnh | ≤ 2 MB/ảnh, tổng ≤ 20 GB |

## 2. Yêu cầu hiệu năng

| ID | Yêu cầu | Mục tiêu | Điều kiện đo |
|---|---|---|---|
| PERF-01 | Thời gian phản hồi API đọc (list/search/detail) | p95 ≤ 500 ms | 200 user đồng thời |
| PERF-02 | API ghi (tạo recipe, feedback, submission) | p95 ≤ 800 ms | như trên |
| PERF-03 | Đăng nhập | p95 ≤ 700 ms | |
| PERF-04 | Thanh toán (không tính thời gian cổng ngoài) | ≤ 2 s | |
| PERF-05 | Tìm kiếm full-text recipe | ≤ 1 s với 5.000 recipe | |
| PERF-06 | Tải trang đầu (LCP) | ≤ 2,5 s trên 4G | Lighthouse |
| PERF-07 | Kích thước JS bundle ban đầu | ≤ 250 KB gzip, route-based code splitting | Build report |
| PERF-08 | Ảnh | Lazy-load, thumbnail ≤ 200 KB, định dạng WebP khi có thể | |
| PERF-09 | Phân trang bắt buộc cho mọi danh sách (mặc định 12 mục, tối đa 50) | Không trả > 50 bản ghi/lần | Test API |
| PERF-10 | Tỷ lệ lỗi dưới tải | < 1% request lỗi 5xx | Load test 15 phút |
| PERF-11 | Tài nguyên server | CPU < 70%, RAM < 75% ở tải đỉnh | Monitoring |
| PERF-12 | Truy vấn CSDL | Không N+1; mọi truy vấn list dùng `AsNoTracking`, projection sang DTO | Code review/EF log |

## 3. Chiến lược đạt hiệu năng

- Index: `User.Email` (unique), `Recipe(CategoryId, IsFree, CreatedAt)`, `Contest(Status, EndDate)`, `ContestSubmission(ContestId)`, `Feedback(RecipeId)`, full-text index trên `Recipe.Title/Ingredients`.
- Cache: in-memory/Redis cho FAQ, Category, danh sách Free recipe trang đầu (TTL 5 phút, invalidate khi Admin cập nhật).
- Nén response (gzip/brotli), `ETag`/`Cache-Control` cho ảnh tĩnh.
- Tác vụ chuyển contest sang `Closed` chạy bằng background service, không chặn request.

## 4. Kế hoạch kiểm thử hiệu năng

| Loại | Kịch bản | Công cụ | Tiêu chí đạt |
|---|---|---|---|
| Load | 200 user: duyệt, tìm kiếm, xem chi tiết (80%), ghi (20%) trong 15 phút | k6 / JMeter | PERF-01, 02, 10 |
| Stress | Tăng dần đến 600 user đến khi lỗi > 5% | k6 | Ghi lại điểm gãy, hệ thống phục hồi |
| Spike | 0 → 300 user trong 10 giây khi công bố người thắng | k6 | Không sập, lỗi < 2% |
| Soak | 50 user trong 4 giờ | k6 | Không rò rỉ bộ nhớ |
| Frontend | Lighthouse trên Home, Recipe list, Recipe detail | Lighthouse CI | PERF-06, 07 |
