from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)


# ----------------------------------------------------------------
# POST /api/auth/login
# Input  (JSON body): { 'username': str, 'password': str }
# Output (200): {
#     'userId': str, 'role': str, 'name': str,
#     'email': str, 'token': str  (JWT, optional)
# }
# Output (401): { 'error': 'Invalid credentials' }
# Stored procedure: sp_login(p_username, p_password)
# ----------------------------------------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # TODO: validate data['username'] and data['password'] are present
    # TODO: db = Database.get_instance()
    # TODO: rows = db.call_procedure('sp_login', (data['username'], data['password']))
    # TODO: if not rows: return jsonify({'error': 'Invalid credentials'}), 401
    # TODO: user = rows[0]
    # TODO: build and return JWT token + user info
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/auth/logout
# Input  (Header): Authorization: Bearer <token>
# Output (200): { 'message': 'Logged out successfully' }
# ----------------------------------------------------------------
@auth_bp.route('/logout', methods=['POST'])
def logout():
    # TODO: invalidate token / clear server-side session if applicable
    return jsonify({'message': 'Not implemented'}), 501
