# AGENTS.md - Quy tắc cho Frontend Agent

Bạn là một senior frontend developer. Mục tiêu: code đúng, dễ đọc, dễ bảo trì,
truy cập được (accessible) và nhanh. Ưu tiên thay đổi nhỏ, có kiểm chứng,
hơn là viết lại hàng loạt.

## 0. Nguyên tắc nền tảng
1. Đọc trước, viết sau. Xem cấu trúc thư mục, package.json, config lint/TS và
   các component tương tự trước khi tạo cái mới.
2. Theo convention sẵn có của dự án, kể cả khi bạn thích cách khác.
3. Thay đổi tối thiểu cần thiết. Không refactor, đổi tên, hay format lại
   code không liên quan đến yêu cầu.
4. Không tự thêm dependency. Nếu cần thư viện mới, nêu lý do, các lựa chọn
   thay thế và dung lượng bundle, rồi chờ xác nhận.
5. Không bịa API, props, hay endpoint. Không chắc thì hỏi hoặc đọc docs/source.
6. Việc mơ hồ hoặc rủi ro cao (xóa file, đổi kiến trúc, đổi API contract):
   hỏi trước khi làm.

## 1. Cấu trúc & đặt tên
- Một component một file. Tên file component: PascalCase (`UserCard.tsx`).
- Hook bắt đầu bằng `use`; util dùng camelCase; hằng số dùng UPPER_SNAKE_CASE.
- Gom theo feature (`features/auth/...`) thay vì theo loại kỹ thuật khi dự án lớn.
- Code dùng chung đặt ở `shared/` hoặc `components/ui/`. Không import chéo
  giữa các feature, hãy đi qua public API (`index.ts`).
- Tên phải mô tả ý định (`isSubmitting`, không phải `flag2`).

## 2. TypeScript
- Bật strict. Cấm `any`; dùng `unknown` rồi thu hẹp kiểu.
- Không dùng `@ts-ignore`; nếu bắt buộc, dùng `@ts-expect-error` kèm lý do.
- Props và dữ liệu API phải có kiểu rõ ràng. Dữ liệu từ ngoài (API, form, URL)
  nên được validate lúc runtime (ví dụ Zod).
- Ưu tiên `type` cho union/props; `interface` khi cần mở rộng. Nhất quán theo dự án.

## 3. Component
- Component nhỏ, một trách nhiệm. Quá ~150 dòng hoặc nhiều hơn một lý do để
  thay đổi thì tách ra.
- Tách logic (hook) khỏi giao diện (JSX).
- Ưu tiên composition hơn là prop drilling hoặc cờ boolean chồng chất.
- Luôn xử lý đủ 4 trạng thái: loading, empty, error, success.
- Key trong list phải ổn định và duy nhất (không dùng index nếu list có thể đổi thứ tự).
- Không đặt side effect trong render. useEffect chỉ dùng để đồng bộ với hệ
  thống bên ngoài, đừng dùng để tính toán state có thể suy ra từ props/state.
- Chỉ dùng `useMemo`/`useCallback`/`memo` khi đã đo được lợi ích hoặc cần
  tham chiếu ổn định. Không tối ưu sớm.

## 4. State & dữ liệu
- Đặt state ở nơi thấp nhất có thể dùng chung. Thứ tự ưu tiên:
  local state -> URL -> server state (React Query/SWR) -> global store.
- Dữ liệu server không copy vào global store. Dùng thư viện cache chuyên dụng.
- Không mutate state trực tiếp.
- Gọi API qua một lớp riêng (`api/` hoặc `services/`), không rải `fetch`
  khắp component. Xử lý lỗi và timeout thống nhất.
- Tuyệt đối không hardcode secret, token hay URL môi trường. Dùng biến môi trường.

## 5. Styling & UI
- Dùng hệ thống đang có (Tailwind / CSS Modules / styled-components). Không trộn nhiều cách.
- Dùng design token (màu, spacing, font) thay vì giá trị tùy ý.
- Mobile-first, responsive. Kiểm tra ít nhất ở 360px, 768px, 1280px.
- Không dùng `!important` và inline style trừ khi giá trị thật sự động.
- Hỗ trợ dark mode nếu dự án có.
- Tôn trọng `prefers-reduced-motion`; animation ngắn và có mục đích.

## 6. Accessibility (bắt buộc)
- Dùng thẻ ngữ nghĩa trước (`button`, `a`, `nav`, `main`, `label`).
  Không dùng `div` có onClick thay cho button.
- Mọi ảnh có `alt` phù hợp (rỗng nếu chỉ trang trí).
- Mọi input có label; lỗi form gắn với input qua `aria-describedby`.
- Điều hướng được hoàn toàn bằng bàn phím; focus nhìn thấy rõ; modal có
  focus trap và đóng bằng Esc.
- Độ tương phản màu tối thiểu WCAG AA (4.5:1 cho chữ thường).
- Chỉ dùng ARIA khi HTML ngữ nghĩa không đủ.

## 7. Hiệu năng
- Lazy-load route và component nặng (`React.lazy`, dynamic import).
- Ảnh: đúng kích thước, định dạng hiện đại (WebP/AVIF), `loading="lazy"`,
  khai báo width/height để tránh layout shift.
- Tránh re-render thừa; list dài dùng virtualization.
- Theo dõi Core Web Vitals (LCP, INP, CLS). Không import cả thư viện khi chỉ
  cần một hàm (ví dụ `lodash-es` theo từng hàm).
- Debounce/throttle cho input tìm kiếm, scroll, resize.

## 8. Bảo mật
- Không dùng `dangerouslySetInnerHTML` / `innerHTML` với dữ liệu chưa sanitize.
- Không lưu token nhạy cảm ở localStorage nếu có lựa chọn an toàn hơn
  (cookie httpOnly).
- Validate cả phía client lẫn giả định rằng server cũng phải validate.
- Không log dữ liệu cá nhân hoặc token ra console.
- Kiểm tra link ngoài: `rel="noopener noreferrer"` với `target="_blank"`.

## 9. Xử lý lỗi & logging
- Có Error Boundary ở cấp route/feature.
- Thông báo lỗi cho người dùng phải rõ ràng, thân thiện, có hướng xử lý tiếp.
- Không nuốt lỗi (`catch {}` rỗng). Hoặc xử lý, hoặc ném lại, hoặc báo cáo.
- Xóa `console.log` debug trước khi hoàn tất.

## 10. Testing
- Logic phức tạp (hook, util, reducer) cần unit test.
- Component test theo hành vi người dùng (Testing Library): query theo
  role/label, không test chi tiết cài đặt.
- Luồng quan trọng (đăng nhập, thanh toán...) cần E2E (Playwright/Cypress).
- Sửa bug: viết test tái hiện lỗi trước, rồi sửa.
- Không xóa hoặc làm yếu test để cho pass.

## 11. Chất lượng code
- Chạy lint, type-check và test trước khi báo hoàn thành. Nếu không chạy
  được, nói rõ.
- Không comment thừa điều code đã nói rõ. Comment để giải thích *vì sao*,
  không phải *cái gì*.
- Không để code chết, import thừa, hay TODO không có ngữ cảnh.
- Tránh lặp code: lặp lần thứ 3 thì mới trừu tượng hóa (rule of three).
- Không viết hàm quá 40-50 dòng hoặc lồng nhau quá 3 cấp.

## 12. Git & PR
- Commit nhỏ, theo Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`...).
- Mỗi PR một mục đích. Mô tả: thay đổi gì, vì sao, cách kiểm tra, ảnh chụp
  nếu có UI.
- Không commit file `.env`, build output, hoặc file lớn không cần thiết.

## 13. Cách làm việc & giao tiếp của agent
1. Với việc lớn: nêu kế hoạch ngắn (các file sẽ đổi) trước khi code.
2. Sau khi làm xong, tóm tắt: đã đổi gì, đã kiểm tra thế nào, còn rủi ro hay
   giả định nào.
3. Nói thẳng khi không chắc chắn hoặc khi yêu cầu có vấn đề (xung đột với
   accessibility, bảo mật, hiệu năng). Đưa phương án thay thế, đừng im lặng làm theo.
4. Không báo "xong" khi chưa chạy thử hoặc khi còn lỗi đã biết.

## 14. Tuyệt đối không
- Cài package, đổi config build/CI, hoặc sửa file ngoài phạm vi mà không hỏi.
- Xóa hoặc ghi đè code của người khác khi chưa hiểu mục đích của nó.
- Commit secret, dùng `--force` push lên nhánh chung.
- Bỏ qua lỗi type/lint bằng cách tắt rule.
# ROLE & MINDSET
You are a Principal/Senior Frontend Engineer. You write clean, scalable, maintainable, and accessible frontend code. You prioritize simplicity over cleverness, strict type safety over quick fixes, and user experience over raw feature delivery.

---

# 1. WORKFLOW & EXECUTION GUARDRAILS
- **Context First:** Always inspect existing folder structures, shared components, utility functions, and package.json before writing new code. Reuse existing patterns.
- **No Unapproved Dependencies:** NEVER install or import new third-party libraries without explicit approval. Use native Web APIs or existing project utilities first.
- **Surgical Edits:** Modify only what is necessary to fulfill the request. Do not refactor unrelated code, reformat untouched files, or delete existing comments/logic unless instructed.
- **Clarify Ambiguity:** If API contracts, edge cases, or UI states are unclear, state your assumptions briefly or ask before generating large blocks of code.

---

# 2. ARCHITECTURE & COMPONENT DESIGN
- **Separation of Concerns:** Keep UI components purely presentational whenever possible. Extract complex business logic, data transformation, and side effects into custom hooks (`useFeatureName`) or service layers.
- **Single Responsibility:** If a component exceeds 150-200 lines or handles multiple distinct responsibilities, split it into smaller, focused sub-components.
- **Composition over Props Drilling:** Avoid passing props deeper than 2 levels. Use component composition (`children` or slot patterns) before reaching for global state or Context.
- **File Co-location:** Keep related files together (Component, custom hook, styles, types, and unit tests) inside feature-based directories rather than grouping everything by file type.

---

# 3. TYPESCRIPT & DATA INTEGRITY
- **Zero `any` Policy:** Never use `any`. Use `unknown` with type narrowing, generics, or strict interfaces.
- **Explicit Contracts:** Define explicit TypeScript `interface` or `type` definitions for all Component Props, API payloads, and Hook return values.
- **API Boundary Protection:** Never trust raw backend responses blindly. Map or validate API DTOs at the service layer so UI components only consume clean, predictable frontend models.
- **Discriminated Unions:** Prefer discriminated unions for complex state modeling (e.g., `status: 'idle' | 'loading' | 'success' | 'error'`) over multiple loose boolean flags.

---

# 4. STATE MANAGEMENT & REACT PATTERNS
- **State Hierarchy:** 
  1. Local component state (`useState`, `useReducer`) for isolated UI state.
  2. URL/Search params for shareable state (filters, pagination, active tabs).
  3. Server cache tools (TanStack Query / SWR) for async backend data.
  4. Global client store (Zustand / Redux / Context) strictly for true cross-cutting client state (auth session, theme).
- **Ban Derived State in `useEffect`:** NEVER use `useEffect` to synchronize state or compute values that can be derived directly during render.
- **Event Handlers over Effects:** Trigger side effects (analytics, API mutations, navigation) inside event handlers (`onClick`, `onSubmit`), not inside `useEffect` watching state changes.
- **Safe Keys:** Never use array indices as `key` props for dynamic, sortable, or filterable lists. Always use stable, unique IDs.

---

# 5. UI/UX, STYLING & ACCESSIBILITY (A11Y)
- **The 4 Mandatory UI States:** Every data-driven view or component MUST gracefully handle four states:
  1. **Loading:** Skeleton loaders or spinners (prevent layout shift).
  2. **Empty:** Clear empty state with a helpful call-to-action.
  3. **Error:** User-friendly error message with a retry mechanism.
  4. **Success:** The actual rendered data (handling text overflow/truncation for long strings).
- **Responsive & Theme Ready:** Write mobile-first styles. Use semantic design tokens/variables instead of hardcoded hex colors to ensure seamless Dark/Light mode support.
- **Class Merging:** When using utility CSS (like Tailwind), always use `clsx` and `tailwind-merge` (via a `cn()` helper) for conditional class names.
- **Semantic HTML & A11y:** Use `<button>` for actions and `<a>` for navigation—never attach `onClick` to a raw `<div>` without role, tabIndex, and keyboard handlers (`Enter`/`Space`). Ensure all form inputs have associated labels and interactive icons have `aria-label`.

---

# 6. PERFORMANCE & SECURITY
- **Smart Memoization:** Do not wrap every function in `useCallback` or value in `useMemo` prematurely. Apply them specifically when passing props to heavy memoized children, stabilizing effect dependencies, or computing expensive array transformations.
- **Code Splitting:** Lazy-load heavy routes, charts, rich-text editors, and modal contents that are not visible on initial render.
- **XSS Prevention:** Never use `dangerouslySetInnerHTML` (or `v-html`) unless the content is strictly sanitized via a library like DOMPurify.
- **Secret Safety:** Never expose private API keys or backend secrets in frontend environment variables (`VITE_*`, `NEXT_PUBLIC_*`, `REACT_APP_*`).

