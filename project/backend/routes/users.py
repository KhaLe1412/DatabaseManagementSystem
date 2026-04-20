from flask import Blueprint, request, jsonify

users_bp = Blueprint('users', __name__)


# ----------------------------------------------------------------
# GET /api/users
# Input  (query): role?, search?, page? (default 1), limit? (default 20)
# Output (200): {
#     'users': [{'id', 'name', 'email', 'role'}],
#     'total': int, 'page': int, 'limit': int
# }
# Roles allowed: admin
# Stored procedures: sp_get_all_students(), sp_get_all_tutors()
# ----------------------------------------------------------------
@users_bp.route('/', methods=['GET'])
def get_all_users():
    role   = request.args.get('role')
    search = request.args.get('search')
    page   = int(request.args.get('page', 1))
    limit  = int(request.args.get('limit', 20))
    # TODO: call sp_get_all_students() and/or sp_get_all_tutors() based on role
    # TODO: apply search filter in Python (name/email contains)
    # TODO: paginate results: results[(page-1)*limit : page*limit]
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# GET /api/users/:id
# Input  (path): id — CHAR(36) UUID
# Output (200 — Student): {
#     id, name, email, role, avatar?,
#     studentId, department, year, supportNeeds, gpa
# }
# Output (200 — Tutor): {
#     id, name, email, role, avatar?,
#     tutorId, department, expertise, rating, totalSessions
# }
# Output (404): { 'error': 'User not found' }
# Stored procedure: sp_get_user_info(p_user_id)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>', methods=['GET'])
def get_user(user_id):
    # TODO: rows = db.call_procedure('sp_get_user_info', (user_id,))
    # TODO: if not rows: return 404
    # TODO: format response dict based on rows[0]['role']
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/users
# Input  (JSON body — Student): {
#     name, email, username, password, role='student',
#     studentId, department, year, supportNeeds?, gpa
# }
# Input  (JSON body — Tutor): {
#     name, email, username, password, role='tutor',
#     tutorId, department, expertise[]
# }
# Output (201): { 'id': str, 'message': 'User created successfully' }
# Output (409): username or email already exists
# Stored procedures:
#   sp_register_user(p_id, p_username, p_password, p_email, p_name, p_role)
#   then INSERT into students or tutors
# ----------------------------------------------------------------
@users_bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json()
    # TODO: validate required fields
    # TODO: new_id = str(uuid.uuid4())
    # TODO: db.call_procedure('sp_register_user', (new_id, username, password, email, name, role))
    # TODO: if role == 'student': insert into students (student_id, mssv, department, year, gpa, support_needs)
    # TODO: if role == 'tutor': insert into tutors (tutor_id, tutor_code, department, expertise)
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# PUT /api/users/:id
# Input  (path): id — CHAR(36) UUID
# Input  (JSON body): {
#     name?, email?, department?,
#     supportNeeds? (student only),
#     expertise?    (tutor only)
# }
# Output (200): { 'message': 'User updated successfully' }
# Output (404): { 'error': 'User not found' }
# Stored procedure: sp_update_user_profile(p_user_id, p_name, p_department)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    # TODO: call sp_update_user_profile(user_id, data.get('name'), data.get('department'))
    # TODO: if role == 'student' and supportNeeds: UPDATE students SET support_needs = ...
    # TODO: if role == 'tutor' and expertise: UPDATE tutors SET expertise = ...
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# DELETE /api/users/:id
# Input  (path): id — CHAR(36) UUID
# Output (200): { 'message': 'User deleted successfully' }
# Output (404): { 'error': 'User not found' }
# Roles allowed: admin
# Note: CASCADE ON DELETE in schema removes student/tutor/user_subjects automatically
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    # TODO: db.execute_query('DELETE FROM users WHERE id = %s', (user_id,))
    # TODO: if ROW_COUNT == 0: return 404
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# GET /api/users/:id/subjects
# Input  (path): id — CHAR(36) UUID
# Output (200): {
#     'subjects': [{'subject_id': str, 'subject_name': str}]
# }
# Stored procedure: sp_get_user_subjects(p_user_id)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>/subjects', methods=['GET'])
def get_user_subjects(user_id):
    # TODO: rows = db.call_procedure('sp_get_user_subjects', (user_id,))
    # TODO: return jsonify({'subjects': rows})
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/users/:id/subjects
# Input  (path): id — CHAR(36) UUID
# Input  (JSON body): { 'subject_id': str }
# Output (200): { 'message': 'Subject added successfully' }
# Stored procedure: sp_add_user_subject(p_user_id, p_subject_id)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>/subjects', methods=['POST'])
def add_user_subject(user_id):
    data = request.get_json()
    # TODO: db.call_procedure('sp_add_user_subject', (user_id, data['subject_id']))
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# DELETE /api/users/:id/subjects/:subject_id
# Input  (path): id — CHAR(36) UUID, subject_id — CHAR(36) UUID
# Output (200): { 'message': 'Subject removed successfully' }
# Stored procedure: sp_remove_user_subject(p_user_id, p_subject_id)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>/subjects/<string:subject_id>', methods=['DELETE'])
def remove_user_subject(user_id, subject_id):
    # TODO: db.call_procedure('sp_remove_user_subject', (user_id, subject_id))
    return jsonify({'message': 'Not implemented'}), 501
