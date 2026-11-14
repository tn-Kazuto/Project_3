name: "✨ Nâng cấp Giao diện & Trải nghiệm (UI/UX Enhancement)"
description: "Đề xuất cải tiến thẩm mỹ, micro-interaction hoặc tối ưu hóa trải nghiệm ẩm thực 5 sao"
title: "[UI/UX]: "
labels: ["frontend", "design-system", "enhancement"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Cảm ơn bạn đã đóng góp đề xuất nâng cấp giao diện cho nền tảng Chef James Thew Culinary Atelier!
  - type: textarea
    id: problem-context
    attributes:
      label: Bối cảnh & Điểm cần nâng cấp
      description: Giao diện hoặc thành phần nào hiện tại cần cải tiến về mặt thẩm mỹ hoặc tính khả dụng?
      placeholder: Ví dụ: Trạng thái loading của danh mục công thức đang dùng spinner cơ bản...
    validations:
      required: true
  - type: textarea
    id: proposed-solution
    attributes:
      label: Đề xuất Giải pháp Kiến trúc & Thẩm mỹ
      description: Mô tả cách tiếp cận theo phong cách 5-Star Luxury Architectural, typography và layout.
      placeholder: Thay thế bằng shimmer skeleton đồng bộ token Alabaster/Taupe...
    validations:
      required: true
  - type: checkboxes
    id: quality-commitments
    attributes:
      label: Cam kết Chất lượng Frontend
      options:
        - label: Không làm vỡ hệ thống Design Token hiện tại (EB Garamond, Instrument Sans)
          required: true
        - label: Đảm bảo kiểm thử tự động (Vitest) tiếp tục pass 100%
          required: true
