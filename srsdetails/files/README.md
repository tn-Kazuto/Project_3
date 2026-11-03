# 📚 BỘ ĐẶC TẢ CHI TIẾT PHÂN HỆ SRS (SRSDETAILS MASTER SUITE)
## Dự án: Nền Tảng Ẩm Thực & Đấu Trường Nấu Ăn James Thew (James Thew Culinary Portal)
### Tiêu chuẩn: Aptech Computer Education eProject Sem 3 · IEEE 830 SRS Standard
> **Tổng hợp & Đồng bộ bởi:** Senior Business Analyst & Systems Architect  
> **Tài liệu nền tảng:** `srs.md` (Master SRS) · `rules.md` (10 Luật vàng Kiến trúc) · `topic.md` (Topic Charter) · `docs/dềbài.md` (Đề bài gốc)  
> **Nền tảng kỹ thuật:** **Backend .NET 10 Microservices + Docker Compose** + **Frontend React 19 SPA (Luxury Theme)**.

---

## 🗂️ 1. Danh Mục Các Phân Hệ SRS Chi Tiết

Bộ tài liệu này phân tách chi tiết từng góc độ kỹ thuật và nghiệp vụ của dự án theo chuẩn phân tích hệ thống quốc tế:

| Tên File | Tiêu Đề Phân Hệ | Nội Dung Trọng Tâm & Quy Chuẩn |
| :--- | :--- | :--- |
| [`00-srs-core.md`](./00-srs-core.md) | **Core System Specification** | Giới thiệu, phạm vi (In/Out of scope), 3 Actors, thiết kế 10+ thực thể CSDL, 11 Quy tắc nghiệp vụ (`BR-01` đến `BR-11`), và bảng chốt dứt điểm 8 câu hỏi mở (`OQ-01` đến `OQ-08`). |
| [`01-srs-functional.md`](./01-srs-functional.md) | **Functional Requirements** | Đặc tả chức năng theo 9 modules (`AUTH`, `HOME`, `RCP`, `TIP`, `CON`, `ANN`, `FBK`, `PRF`, `FAQ`), Acceptance Criteria (AC), phân hạng ưu tiên MoSCoW, ma trận RBAC và danh mục API Endpoints. |
| [`02-srs-non-functional.md`](./02-srs-non-functional.md) | **Non-Functional Requirements** | Bộ chỉ số NFRs toàn diện (`NFR-AVL-01` đến `NFR-DEL-01`): Khả năng sẵn sàng ≥ 99%, chuẩn hóa Exception Handling, chính sách Backup CSDL hàng ngày, chuẩn WCAG 2.1 AA. |
| [`03-srs-security.md`](./03-srs-security.md) | **Security & STRIDE Threat Model** | Bảo mật cấp độ doanh nghiệp: Băm mật khẩu BCrypt, JWT Bearer Token, chống IDOR (`AuthorId == currentUser.Id`), Content Gatekeeping phía Server, tuân thủ PCI-DSS và ma trận nguy cơ STRIDE. |
| [`04-srs-performance.md`](./04-srs-performance.md) | **Performance & Load Testing** | Giả định tải (5.000 user, 200 concurrent peak, 50 req/s), chỉ tiêu $P_{95} \le 500\text{ ms}$, chiến lược Redis Caching, kế hoạch Load/Stress/Spike/Soak testing bằng k6/JMeter. |
| [`05-srs-ui-ux.md`](./05-srs-ui-ux.md) | **UI/UX & Design Guidelines** | Sitemap chi tiết các route, tiêu chuẩn giao diện 5 sao Luxury Architectural, xử lý trạng thái rỗng (Empty state), Toast notification, khả năng tiếp cận Accessibility (WCAG 2.1 AA). |
| [`06-test-case-checklist.md`](./06-test-case-checklist.md) | **Test Cases & Traceability Matrix** | Chiến lược kiểm thử đa tầng (Unit, Integration, Component, E2E, UAT), danh mục 50+ Test Cases chi tiết (`TC-AUTH`, `TC-HOME`, `TC-RCP`, `TC-TIP`, `TC-CON`, `TC-ANN`, `TC-FBK`, `TC-PRF`, `TC-FAQ`). |

---

## 🔗 2. Ma Trận Đồng Bộ Hóa Với Hệ Sinh Thái Dự Án (Synthesis Matrix)

Bộ tài liệu chi tiết `srsdetails/` được tích hợp chặt chẽ với toàn bộ kho tài liệu cấp cao của dự án:

```
                               ┌────────────────────────────────────────────────┐
                               │   docs/dềbài.md (Original Aptech Topic Brief)  │
                               └───────────────────────┬────────────────────────┘
                                                       │ 
                                                       ▼
                               ┌────────────────────────────────────────────────┐
                               │   topic.md (Master Project Topic Charter)      │
                               └───────────────────────┬────────────────────────┘
                                                       │
                           ┌───────────────────────────┴───────────────────────────┐
                           ▼                                                       ▼
    ┌──────────────────────────────────────────────┐        ┌──────────────────────────────────────────────┐
    │          srs.md (Master Unified SRS)         │        │    rules.md (10 Golden Rules & Standards)    │
    │  - Bounded Contexts & Microservices (Phần 6) │        │  - Coding Standards & Dependency Flow        │
    │  - Docker & Containerization Specs (Mục 6.7) │        │  - Docker & Microservices Rules (Mục 1.1)    │
    └──────────────────────┬───────────────────────┘        └──────────────────────┬───────────────────────┘
                           │                                                       │
                           └───────────────────────────┬───────────────────────────┘
                                                       ▼
                         ┌───────────────────────────────────────────────────────────┐
                         │   srsdetails/ (Bộ Đặc Tả Kỹ Thuật Chi Tiết 00 -> 06)      │
                         │   - 00: Core & Rules (BR-01..11, OQ-01..08)               │
                         │   - 01: Functional Modules (FR-AUTH, RCP, CON, FBK...)    │
                         │   - 02: NFRs (NFR-AVL, REL, MNT, POR, CMP, USE, DAT...)   │
                         │   - 03: Security & STRIDE (SEC-AUTH, AUTHZ, PAY...)       │
                         │   - 04: Performance & Load Testing (PERF-01..12)          │
                         │   - 05: UI/UX & Accessibility (UI-01..14, ACC-01..07)     │
                         │   - 06: Test Case Suite & Traceability (TC-01..50+)       │
                         └─────────────────────────────┬─────────────────────────────┘
                                                       │
                           ┌───────────────────────────┴───────────────────────────┐
                           ▼                                                       ▼
    ┌──────────────────────────────────────────────┐        ┌──────────────────────────────────────────────┐
    │ plans/microservices-architecture-plan.md     │        │ docs/APTECH_PROJECT_REPORT_DOSSIER.md        │
    │  - Lộ trình 6 Phase (M0 -> M6) Strangler Fig │        │  - Đầy đủ 13 Hạng mục báo cáo Aptech eProject│
    │  - Saga Orchestration cho $10/$100 Payment   │        │  - 2 Mẫu Email tiến độ (STATUS:) & Bàn giao  │
    └──────────────────────────────────────────────┘        └──────────────────────────────────────────────┘
```

---

## 🚀 3. Điểm Nâng Cấp Hệ Thống v2.0 (So với Bản Đặc Tả Gốc v1.0)

Để đáp ứng nội dung review của Giảng viên và yêu cầu mở rộng kiến trúc hiện đại, một số phân hệ trong `srsdetails` đã được nâng cấp tương thích:

1. **Thực thể Dữ liệu:** Mở rộng từ 10 lên **11 Thực thể** (bổ sung bảng `ContestVote` chống gian lận bình chọn và `Notification` cho chuông Header).
2. **Kênh Nội dung:** Mở rộng Recipe/Tip từ dạng bài viết tĩnh sang **Đa phương tiện** (hỗ trợ `ContentType`: Article, Video, Talkshow, Liveshow).
3. **Cộng đồng & Phản hồi:** Mở rộng Feedback hỗ trợ `MediaUrl` (ảnh/video thực hành của người dùng) và đánh giá `Rating` 1-5 sao.
4. **Hạ tầng Triển khai:** Đóng gói toàn bộ hệ thống bằng **Docker & Docker Compose** trên nền tảng **.NET 10 LTS Microservices + React 19 SPA**.

