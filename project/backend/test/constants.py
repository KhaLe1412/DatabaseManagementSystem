"""
Shared constants (seed-data UUIDs, base URL) used by all test modules.
These values mirror the fixed UUIDs defined in database/seed/*.sql.
"""

BASE_URL = "http://localhost:5001"

# ----- Known users from seed data -----
TUTOR_ID   = "USER-TUTO-0000-0000-000000000001"   # tutor.binh / hash123
TUTOR2_ID  = "USER-TUTO-0000-0000-000000000002"   # tutor.cuong / hash123
STUDENT_ID = "USER-STUD-0000-0000-000000000001"   # nhat.huynh / hash123
STUDENT2_ID= "USER-STUD-0000-0000-000000000002"   # an.nguyen / hash123
STUDENT3_ID= "USER-STUD-0000-0000-000000000003"   # hoa.pham / hash123

# ----- Known sessions from seed data -----
SESSION_FULL      = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"  # status=full, max=2, 2 students
SESSION_OPEN      = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"  # status=open, 1 student enrolled
SESSION_SCHEDULED = "cccccccc-cccc-cccc-cccc-cccccccccccc"  # status=scheduled
SESSION_COMPLETED = "dddddddd-dddd-dddd-dddd-dddddddddddd"  # status=completed

# ----- Known subjects -----
SUBJ_OOP      = "SUBJ-0000-0000-0000-000000000005"  # Lập trình căn bản
SUBJ_DSA      = "SUBJ-0000-0000-0000-000000000002"  # Cấu trúc dữ liệu và giải thuật
SUBJ_CALCULUS = "SUBJ-0000-0000-0000-000000000006"  # Giải tích 1
SUBJ_DBMS     = "SUBJ-0000-0000-0000-000000000001"  # Hệ QTCSDL

# ----- Known messages -----
MSG_ID = "msg-0001-0000-0000-000000000001"
