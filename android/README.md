# 🍳 James Thew Culinary - Native Android Application

Ứng dụng di động Native dành riêng cho nền tảng ẩm thực **Chef James Thew**, được xây dựng bằng **Kotlin + Jetpack Compose** theo kiến trúc **Modern Android Clean Architecture (MVVM + Hilt)**.

---

## 🛠️ Công Nghệ & Thư Viện Cốt Lõi
- **Ngôn ngữ:** Kotlin 2.0+ (Target SDK 35, Min SDK 26)
- **UI Toolkit:** Jetpack Compose (Material 3 với 5-Star Luxury Architectural Theme)
- **Dependency Injection:** Hilt (Dagger)
- **Networking:** Retrofit 2 + OkHttp 4 + Gson + AuthInterceptor (JWT Bearer)
- **Storage:** Jetpack DataStore Preferences (Quản lý Token & Session)
- **Image Loading:** Coil Compose
- **Concurrency:** Kotlin Coroutines & Flow

---

## 🚀 Hướng Dẫn Mở & Chạy Dự Án Trong Android Studio

### Bước 1: Mở Project trong Android Studio
1. Khởi động **Android Studio**.
2. Chọn **File** $\rightarrow$ **Open...**
3. Tìm đến thư mục dự án và chọn thư mục:
   ```
   e:\project\Project_3\android
   ```
4. Đợi Android Studio tự động chạy **Gradle Sync** và tải các dependencies (thông qua `libs.versions.toml`).

---

### Bước 2: Khởi động Backend
Đảm bảo Backend .NET 10 / Gateway đang chạy:
```powershell
docker compose up -d
# hoặc chạy backend cục bộ trên port 8000 / 5108
```

> [!NOTE]
> **Quy tắc kết nối mạng trên Android Emulator:**
> - Máy ảo Android truy cập máy chủ host thông qua IP: `http://10.0.2.2:8000/api/` (đã được cấu hình sẵn trong `NetworkModule.kt`).
> - Nếu chạy bằng **Điện thoại thật (USB Debugging)**: Hãy đổi `BASE_URL` trong [NetworkModule.kt](file:///e:/project/Project_3/android/app/src/main/java/com/jamesthew/culinary/di/NetworkModule.kt) thành IP mạng LAN máy tính của bạn (vd: `http://192.168.1.x:8000/api/`).

---

### Bước 3: Chạy Ứng Dụng
1. Chọn máy ảo Android (Pixel 8 / Pixel 9 API 34 hoặc 35) hoặc thiết bị thật.
2. Bấm nút **Run 'app'** (phím tắt `Shift + F10`).

---

## 🔑 Tài Khoản Thử Nghiệm Nhanh
Màn hình Login đã tích hợp 2 nút bấm tự động điền tài khoản mẫu:
- **Thành viên VIP (Member):** `member_monthly` / `Member@123` (Xem toàn bộ công thức)
- **Quản trị viên (Admin Chef):** `james` / `Admin@123456`
- **Khách vãng lai (Guest):** Bấm nút *"Tiếp tục với tư cách Khách"* để xem các công thức miễn phí.

---

## 🌟 Tính Năng Nổi Bật Sẵn Sàng Trải Nghiệm
1. **Catalog ẩm thực & Lọc danh mục:** Xem công thức các nhóm *Juices*, *Vegetarian*, *Non-Vegetarian*, *Italian*.
2. **5-Star Luxury Design:** Giao diện tông màu vàng kim hoàng gia `#B69355` và nền than tối `#141414`.
3. **Chế Độ Nấu Bếp Rảnh Tay (Hands-Free Cooking Mode):**
   - Tự động giữ màn hình luôn sáng (`FLAG_KEEP_SCREEN_ON`).
   - Hiển thị từng bước làm bếp với chữ to dễ đọc từ xa.
   - Tích hợp **Kitchen Timer** (Đồng hồ bếp hẹn giờ đếm ngược kèm rung phản hồi khi hết giờ).

