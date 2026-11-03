# 🚀 HƯỚNG DẪN KIỂM THỬ HIỆU NĂNG K6 (PERFORMANCE LOAD TESTING SUITE)

Bộ kịch bản kiểm thử hiệu năng k6 được xây dựng theo chuẩn yêu cầu tại `srsdetails/files/04-srs-performance.md` và `plans/tasks/03-tester-qa-tasks.md`.

---

## 📊 1. CÁC KỊCH BẢN KIỂM THỬ (TEST SCENARIOS)

| Tên File | Loại Kiểm Thử | Mục Đích | Chỉ Tiêu Đạt Chuẩn |
| :--- | :--- | :--- | :--- |
| `k6-load-test.js` | **Standard Load Test** | 200 người dùng ảo đồng thời (VUs) duyệt recipes, tips, FAQ trong 15 phút. | $P_{95} \le 500\text{ ms}$, Tỷ lệ lỗi $< 1\%$. |
| `k6-stress-test.js` | **Stress & Saturation** | Tăng tải từ 200 lên 600 VUs để tìm điểm bão hòa hệ thống. | $P_{95} \le 1500\text{ ms}$, Tỷ lệ lỗi $< 5\%$. |
| `k6-spike-test.js` | **Spike (Flash Crowd)** | Đột biến 0 lên 300 VUs trong 10 giây khi James Thew công bố Quán quân. | $P_{95} \le 1000\text{ ms}$, Tỷ lệ lỗi $< 2\%$. |

---

## 🛠️ 2. CÁCH THỰC THI (EXECUTION COMMANDS)

### Cách 1: Chạy bằng Docker (Khuyên Dùng - Không Cần Cài k6 Lên Máy)
```bash
# Đứng từ thư mục gốc của dự án:
docker run --rm -i --network="host" grafana/k6 run - < tests/load-tests/k6-load-test.js

# Hoặc trỏ URL Gateway tùy chỉnh:
docker run --rm -i -e GATEWAY_URL=http://localhost:8000/api grafana/k6 run - < tests/load-tests/k6-load-test.js
```

### Cách 2: Chạy trực tiếp bằng k6 CLI (Nếu Đã Cài Đặt)
```bash
# Cài đặt qua winget (Windows):
winget install k6 --source winget

# Chạy kịch bản Load Test:
k6 run tests/load-tests/k6-load-test.js

# Chạy kịch bản Stress Test:
k6 run tests/load-tests/k6-stress-test.js

# Chạy kịch bản Spike Test:
k6 run tests/load-tests/k6-spike-test.js
```

