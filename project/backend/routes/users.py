from flask import Blueprint, request, jsonify
import uuid
import mysql.connector

from db.connection import Database

users_bp = Blueprint('users', __name__)


def _sql_err(err):
    msg = err.msg if hasattr(err, 'msg') else str(err)
    status = 404 if 'not found' in msg.lower() else 400
    return jsonify({'error': msg}), status


# ----------------------------------------------------------------
# GET /api/users
# Input  (query): role?, search?, page? (default 1), limit? (default 20)
# Output (200): {
#     'users': [{'id', 'name', 'email', 'role'}],
#     'total': int, 'page': int, 'limit': int
# }
# Stored procedures: sp_get_all_students(), sp_get_all_tutors()
# ----------------------------------------------------------------
@users_bp.route('/', methods=['GET'])
def get_all_users():
    role   = request.args.get('role')
    search = (request.args.get('search') or '').lower()
    page   = max(int(request.args.get('page', 1)), 1)
    limit  = max(int(request.args.get('limit', 20)), 1)

    db = Database.get_instance()
    results = []

    if role in (None, 'student'):
        rows = db.call_procedure('sp_get_all_students')
        for r in rows:
            results.append({'id': r['id'], 'name': r['name'], 'email': r['email'], 'role': 'student'})

    if role in (None, 'tutor'):
        rows = db.call_procedure('sp_get_all_tutors')
        for r in rows:
            results.append({'id': r['id'], 'name': r['name'], 'email': r['email'], 'role': 'tutor'})

    if search:
        results = [r for r in results if search in r['name'].lower() or search in r['email'].lower()]

    total = len(results)
    start = (page - 1) * limit
    return jsonify({
        'users': results[start:start + limit],
        'total': total,
        'page':  page,
        'limit': limit,
    }), 200


# ----------------------------------------------------------------
# GET /api/users/:id
# Output (200 — Student/Tutor): profile info
# Output (404): { 'error': 'User not found' }
# Stored procedure: sp_get_user_info(p_user_id)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_get_user_info', (user_id,))
        if not rows:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(rows[0]), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# POST /api/users
# Input  (JSON body — Student): {
#     name, email, username, password, role='student',
#     studentId, department, year, supportNeeds?, gpa
# }
# Input  (JSON body — Tutor): {
#     name, email, username, password, role='tutor',
#     tutorId, department, expertise
# }
# Output (201): { 'id': str, 'message': 'User created successfully' }
# Output (409): username or email already exists
# Stored procedure: sp_register_user(...)
# ----------------------------------------------------------------
@users_bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    for field in ('name', 'email', 'username', 'password', 'role'):
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    role   = data['role']
    new_id = str(uuid.uuid4())

    try:
        db = Database.get_instance()
        db.call_procedure('sp_register_user', (
            new_id, data['username'], data['password'],
            data['email'], data['name'], role,
        ))
        if role == 'student':
            db.execute_query(
                'INSERT INTO students (student_id, mssv, department, year, gpa, support_needs) '
                'VALUES (%s, %s, %s, %s, %s, %s)',
                (new_id, data.get('studentId'), data.get('department'),
                 data.get('year'), data.get('gpa'), data.get('supportNeeds')),
            )
        elif role == 'tutor':
            db.execute_query(
                'INSERT INTO tutors (tutor_id, tutor_code, department, expertise) '
                'VALUES (%s, %s, %s, %s)',
                (new_id, data.get('tutorId'), data.get('department'), data.get('expertise')),
            )
        return jsonify({'id': new_id, 'message': 'User created successfully'}), 201
    except mysql.connector.Error as err:
        if err.errno == 1062:
            return jsonify({'error': 'Username or email already exists'}), 409
        return _sql_err(err)


# ----------------------------------------------------------------
# PUT /api/users/:id
# Input  (JSON body): { name?, department? }
# Output (200): { 'message': 'User updated successfully' }
# Output (404): { 'error': 'User not found' }
# Stored procedure: sp_update_user_profile(p_user_id, p_name, p_department)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json() or {}
    try:
        db = Database.get_instance()
        db.call_procedure('sp_update_user_profile', (
            user_id, data.get('name'), data.get('department'),
        ))
        return jsonify({'message': 'User updated successfully'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# DELETE /api/users/:id
# Output (200): { 'message': 'User deleted successfully' }
# Output (404): { 'error': 'User not found' }
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        db = Database.get_instance()
        affected = db.execute_dml('DELETE FROM users WHERE id = %s', (user_id,))
        if affected == 0:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'message': 'User deleted successfully'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# GET /api/users/:id/subjects
# Output (200): { 'subjects': [{'subject_id', 'subject_name'}] }
# Stored procedure: sp_get_user_subjects(p_user_id)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>/subjects', methods=['GET'])
def get_user_subjects(user_id):
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_get_user_subjects', (user_id,))
        return jsonify({'subjects': rows}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# POST /api/users/:id/subjects
# Input  (JSON body): { 'subject_id': str }
# Output (200): { 'message': 'Subject added successfully' }
# Stored procedure: sp_add_user_subject(p_user_id, p_subject_id)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>/subjects', methods=['POST'])
def add_user_subject(user_id):
    data       = request.get_json() or {}
    subject_id = data.get('subject_id')
    if not subject_id:
        return jsonify({'error': 'subject_id is required'}), 400
    try:
        db = Database.get_instance()
        db.call_procedure('sp_add_user_subject', (user_id, subject_id))
        return jsonify({'message': 'Subject added successfully'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# DELETE /api/users/:id/subjects/:subject_id
# Output (200): { 'message': 'Subject removed successfully' }
# Stored procedure: sp_remove_user_subject(p_user_id, p_subject_id)
# ----------------------------------------------------------------
@users_bp.route('/<string:user_id>/subjects/<string:subject_id>', methods=['DELETE'])
def remove_user_subject(user_id, subject_id):
    try:
        db = Database.get_instance()
        db.call_procedure('sp_remove_user_subject', (user_id, subject_id))
        return jsonify({'message': 'Subject removed successfully'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)



