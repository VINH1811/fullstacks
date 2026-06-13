# HRM Pro - Vue 3 + Vite

Phiên bản đã chỉnh sửa:

- Bỏ trang landing/marketing ban đầu.
- Khi mở `http://localhost:5173` sẽ tự vào Dashboard.
- Giao diện được làm lại theo hướng gọn, sáng, chuyên nghiệp hơn, giảm màu mè/glass quá mạnh.
- Giữ nguyên các trang quản lý chính: Dashboard, Nhân viên, Phòng ban, Chấm công, Nghỉ phép, Bảng lương, Báo cáo, Cài đặt.
- Giữ logic bảng lương hiện tại, chỉ tối ưu giao diện và điều hướng.

## Cách chạy

Mở terminal trong thư mục project:

```bash
npm install --no-package-lock
npm run dev
```

Mở trình duyệt:

```text
http://localhost:5173
```

Nếu cần chạy kèm mock API `db.json`:

```bash
npm start
```

Lệnh này sẽ chạy đồng thời:

- Frontend Vite: `http://localhost:5173`
- JSON Server: `http://localhost:5000`

## Build kiểm tra

```bash
npm run build
```

Phiên bản này đã được kiểm tra build thành công.
