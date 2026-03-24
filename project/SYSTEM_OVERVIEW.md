# Hệ Thống Student-Tutor HCMUT

## 1. Tổng Quan

Hệ thống Student-Tutor dành cho sinh viên và gia sư trường HCMUT, hỗ trợ đặt lịch học, nhắn tin, thư viện tài liệu và thông báo.

---

## 2. Tài Khoản & Người Dùng

Người dùng đăng nhập qua **tài khoản** gồm: tên đăng nhập, mật khẩu, vai trò (`Student`, `Tutor`, `Staff`, `Admin`) và `userID`. Sinh viên và gia sư đều gắn với một tài khoản.

- **Sinh viên** cần lưu trữ: MSSV, tên, email, department.
- **Gia sư** cần lưu trữ: Mã gia sư, tên, email, department.

---

## 3. Môn Học

- Các **sinh viên** có danh sách các môn học (`Subject`) muốn học.
- Các **gia sư** có danh sách các môn học muốn dạy.

---

## 4. Buổi Học (Session)

Gia sư có thể tạo các **buổi học** để sinh viên tham gia. Mỗi buổi học:

- Chỉ có **1 gia sư** dạy.
- Chỉ dạy **1 môn học**.
- Lưu trữ: ngày bắt đầu, giờ bắt đầu/kết thúc, kiểu buổi học (`online`, `offline`), trạng thái (`Đang mở`, `Hoàn thành`, `Đã hủy`), số học sinh tối đa.
- Nếu **online**: lưu link meet để tham gia.
- Nếu **offline**: lưu số phòng tham gia.

**Các hành động của gia sư:**

| Thời điểm          | Hành động                                         |
| ------------------ | ------------------------------------------------- |
| Trước buổi học     | Ghi note mô tả những gì cần chuẩn bị              |
| Sau khi hoàn thành | Ghi tóm tắt buổi học và link record               |
| Bất kỳ lúc nào     | Hoàn thành hoặc hủy buổi học                      |
| Bất kỳ lúc nào     | Đổi lịch học (đổi ngày hoặc giờ bắt đầu/kết thúc) |

---

## 5. Tham Gia Buổi Học & Đánh Giá

Sinh viên có thể **tham gia** buổi học nếu:

- Môn học của buổi học nằm trong danh sách môn muốn học của sinh viên.
- Buổi học đang mở và chưa đầy.

**Sau khi buổi học hoàn thành**, sinh viên có thể:

- Đánh giá buổi học (1–5 sao).
- Bình luận (comment) về buổi học.

---

## 6. Yêu Cầu Dời Lịch (Request)

Sinh viên có thể gửi **yêu cầu đổi lịch** đến gia sư. Yêu cầu phải:

- Gắn với một buổi học cụ thể.
- Có ngày, giờ bắt đầu/kết thúc mới và lý do muốn đổi.

**Kết quả:**

- Gia sư **đồng ý** → buổi học đổi sang ngày/giờ mới.
- Gia sư **từ chối** → không có gì thay đổi.

---

## 7. Thư Viện Tài Liệu

Hệ thống kết nối với thư viện, người dùng có thể xem tài liệu. Mỗi tài liệu có:

- `title`, `type` (`textbook`, `document`, `video`, `article`), `author`, `url`.
- Liên quan đến **1 hoặc nhiều môn học**.

---

## 8. Nhắn Tin (Message)

Hệ thống kết nối với một hệ thống nhắn tin để chat. Một tin nhắn gồm:

- Người gửi, người nhận, nội dung, thời gian, trạng thái (`đã đọc` / `chưa đọc`).

---

## 9. Thông Báo (Notification)

Hệ thống kết nối với hệ thống thông báo để báo thông tin cần thiết cho sinh viên. Một thông báo:

- Gắn với **1 buổi học**.
- Có: thời gian, nội dung, loại thông báo.

Hiện có **2 loại thông báo**, được tạo tự động khi gia sư thực hiện hành động tương ứng và gửi đến **tất cả sinh viên** đang tham gia buổi học:

| Loại     | Trigger                  | Format nội dung                                                                                                    |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Đổi lịch | Gia sư đổi lịch buổi học | `Lịch học môn <tên môn học> (<mã buổi học>) đã chuyển sang <ngày mới> từ <giờ bắt đầu mới> đến <giờ kết thúc mới>` |
| Hủy lịch | Gia sư hủy buổi học      | `Lịch học môn <tên môn học> (<mã buổi học>) đã bị hủy`                                                             |

---

## 10. Danh Sách Nhiệm Vụ

### Nhiệm vụ 1 — Thiết kế cơ sở dữ liệu

- Viết báo cáo về app.
- Vẽ schema, ERD và ánh xạ thành các bảng.
- Mô tả các bảng.

---

### Nhiệm vụ 2 — SQL: Tài khoản, Sinh viên, Gia sư, Môn học

**Bảng cần tạo:** `Account`, `Student`, `Tutor` (và các role khác nếu cần), `Subject`. Thêm các hàng mẫu.

**Stored Procedure / Function:**

| #   | Chức năng                                                                  |
| --- | -------------------------------------------------------------------------- |
| 1   | Đăng ký người dùng                                                         |
| 2   | Login (tên đăng nhập, mật khẩu) → `userID` + `role`                        |
| 3   | Lấy thông tin sinh viên / gia sư (`userID`) → Tên, MSSV, email, department |
| 4   | Cập nhật thông tin cá nhân sinh viên / gia sư                              |
| 5   | Lấy danh sách môn học (`subject`) mà sinh viên / gia sư tham gia           |
| 6   | Cập nhật danh sách môn học (`subject`)                                     |
| 7   | Lấy thông tin tất cả sinh viên                                             |
| 8   | Lấy thông tin tất cả gia sư                                                |

---

### Nhiệm vụ 3 — SQL: Session phần 1

**Bảng cần tạo:** `Session` và các bảng liên quan (nếu cần). Thêm các giá trị mẫu vào bảng.

**Stored Procedure:**

| #   | Chức năng                                                                 |
| --- | ------------------------------------------------------------------------- |
| 1   | Tạo session (session mới không được overlap với các session đang có)      |
| 2   | Hoàn thành session                                                        |
| 3   | Lọc session theo: gia sư / sinh viên / môn học / ngày / trạng thái / kiểu |
| 4   | Thêm sinh viên vào session                                                |
| 5   | Bỏ sinh viên khỏi session                                                 |

---

### Nhiệm vụ 4 — SQL: Session phần 2

**Bảng cần tạo:** `Request`, `Notification` (dùng schema bảng `Session`). Thêm các giá trị mẫu.

**Stored Procedure:**

| #   | Chức năng                                                                          |
| --- | ---------------------------------------------------------------------------------- |
| 1   | Cập nhật thời gian session (đồng thời tạo Notification đến các sinh viên tham gia) |
| 2   | Hủy session (đồng thời tạo Notification)                                           |
| 3   | Tạo yêu cầu (Request) dời session                                                  |
| 4   | Chấp nhận Request dời session                                                      |
| 5   | Từ chối Request (không làm gì)                                                     |
| 6   | Lấy danh sách Request của gia sư                                                   |
| 7   | Lấy danh sách Notification của người dùng                                          |

---

### Nhiệm vụ 5 — SQL: Library, Message, Comment

**Bảng cần tạo:** `Library`, `Message`, `Comment` (dùng schema `Account` và `Session`). Thêm các giá trị mẫu.

**Stored Procedure:**

| #   | Chức năng                               |
| --- | --------------------------------------- |
| 1   | Lấy tất cả tài liệu                     |
| 2   | Lọc tài liệu theo `title` / `type`      |
| 3   | Thêm / xóa tài liệu                     |
| 4   | Lấy danh sách tin nhắn giữa 2 tài khoản |
| 5   | Gửi tin nhắn                            |
| 6   | Đánh dấu đọc tin nhắn                   |
| 7   | Sinh viên gửi đánh giá về buổi học      |
| 8   | Lấy danh sách các đánh giá về 1 buổi học    |

---

## 11. Cấu Trúc Thư Mục SQL

```
project/database/
├── table/       -- SQL tạo bảng
├── procedure/   -- Stored procedures / functions
├── seed/        -- Dữ liệu mẫu
└── test/        -- Test cases
```
