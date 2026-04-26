from flask import Blueprint, request, jsonify
import mysql.connector

from db.connection import Database

auth_bp = Blueprint('auth', __name__)


def _sql_err(err):
    msg = err.msg if hasattr(err, 'msg') else str(err)
    return jsonify({'error': msg}), 400


# ----------------------------------------------------------------
# POST /api/auth/login
# Input  (JSON body): { 'username': str, 'password': str }
# Output (200): { 'userId': str, 'role': str, 'name': str }
# Output (401): { 'error': 'Invalid credentials' }
# Stored procedure: sp_login(p_username, p_password)
# ----------------------------------------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'username and password are required'}), 400
    try:
        db = Database.get_instance()
        rows = db.call_procedure('sp_login', (username, password))
        if not rows:
            return jsonify({'error': 'Invalid credentials'}), 401
        user = rows[0]
        return jsonify({
            'userId': user['userID'],
            'role':   user['role'],
        }), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# POST /api/auth/logout
# Output (200): { 'message': 'Logged out successfully' }
# ----------------------------------------------------------------
@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200
