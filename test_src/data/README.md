# Phần 1: Data Storage & Management Benchmark

Module này chứa script tự động hóa đo lường hiệu năng lưu trữ giữa MySQL và Redis.

## 🚀 Yêu cầu hệ thống (Prerequisites)
- Python 3.13+
- Thư viện: `pip install mysql-connector-python redis`
- Đã import CSDL `Sales Transaction` và chuẩn bị sẵn file dataset.

## 🛠️ Cách chạy code
1. Mở file `src/config.py` và sửa lại `user`, `password` MySQL, cũng như cập nhật lại đường dẫn tới 2 file dataset.
2. Mở terminal, điều hướng vào thư mục chứa code.
3. Chạy lệnh:
   ```bash
   python src/benchmark_storage.py

## 🧪 Hướng dẫn chạy Test Case 4: Đánh giá RTO (Recovery Time Objective)

**Lưu ý:** Test Case 4 đo lường thời gian phục hồi của hệ thống sau sự cố (Cold Boot). Do thao tác này yêu cầu quyền can thiệp vào các dịch vụ (Services) của hệ điều hành, nó **không được tích hợp trong script tự động** mà cần thực hiện thủ công theo các bước sau:

### 1. Thực thi trên MySQL (Disk-based Recovery)
1. Mở công cụ quản lý dịch vụ (Ví dụ: `services.msc` trên Windows).
2. Tìm dịch vụ `MySQL` (hoặc `MySQL80` tùy phiên bản) $\rightarrow$ Chuột phải chọn **Restart**.
3. Ngay khi dịch vụ vừa khởi động xong, mở MySQL Command Line Client hoặc Terminal, đăng nhập và chạy nhanh câu lệnh truy vấn lớn:
   ```sql
   SELECT COUNT(*) FROM sales_benchmark.transactions;
4. **Kết quả kỳ vọng:** Hệ thống có thể báo `Lost connection to MySQL server`, nhưng sẽ tự động kết nối lại và trả về kết quả ngay lập tức (khoảng `< 1s`). Điều này chứng minh MySQL sẵn sàng phục vụ tức thì nhờ việc dữ liệu đã nằm sẵn trên đĩa cứng mà không cần nạp toàn bộ lên RAM (Lazy Loading).

### 2. Thực thi trên Redis (In-memory Recovery)
1. Đảm bảo dữ liệu đã được lưu xuống đĩa bằng cách mở `redis-cli` và chạy lệnh:
   ```bash
   SAVE
2. Khởi động lại dịch vụ Redis (Tương tự như cách làm với MySQL, hoặc tắt/mở lại terminal đang chạy `redis-server`).
3. Mở lại `redis-cli` nhanh nhất có thể và chạy lệnh kiểm tra trạng thái:
4. **Kết quả kỳ vọng:** Quan sát thông số `loading: 0`. Kết quả này xác nhận Redis đã hoàn tất việc nạp dữ liệu từ tệp tin nhị phân `dump.rdb` lên RAM trong thời gian cực ngắn (chưa tới 1 giây). Ngay sau khoảnh khắc này, Redis đạt trạng thái hiệu năng đỉnh mà không cần thời gian "làm nóng" (Warm-up).