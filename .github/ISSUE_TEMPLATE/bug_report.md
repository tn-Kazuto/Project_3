name: "🐛 Báo cáo Lỗi Giao diện / Accessibility (Bug Report)"
description: "Báo cáo lỗi hiển thị, vỡ layout, responsive hoặc rào cản truy cập (A11y)"
title: "[BUG]: "
labels: ["bug", "frontend", "a11y"]
assignees: []

body:
  - type: textarea
    id: bug-description
    attributes:
      label: Mô tả chi tiết lỗi
      description: Lỗi xảy ra ở màn hình nào và biểu hiện cụ thể là gì?
      placeholder: Mô tả hành vi thực tế vs hành vi kỳ vọng...
    validations:
      required: true
  - type: input
    id: viewport-browser
    attributes:
      label: Trình duyệt & Độ phân giải thiết bị
      placeholder: Chrome 124, iPhone 14 Pro (393x852) / Desktop (1440x900)
    validations:
      required: true
  - type: textarea
    id: reproduction-steps
    attributes:
      label: Các bước tái hiện lỗi
      value: |
        1. Truy cập vào '...'
        2. Nhấn vào '....'
        3. Quan sát thấy lỗi '....'
    validations:
      required: true
