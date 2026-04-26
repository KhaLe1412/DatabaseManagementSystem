from flask import Blueprint, request, jsonify
import mysql.connector

from db.connection import Database

notifications_bp = Blueprint('notifications', __name__)


def _sql_err(err):
    msg = err.msg if hasattr(err, 'msg') else str(err)
    return jsonify({'error': msg}), 400


# ----------------------------------------------------------------
# GET /api/notifications
# Input  (query): userId (required), sessionId?
# Output (200): {
#     'notifications': [{
#         notification_id, session_id, sent_time, content, type
#     }]
# }
# Stored procedure: sp_list_notifications_for_user(p_user_id)
# ----------------------------------------------------------------
@notifications_bp.route('/', methods=['GET'], strict_slashes=False)
def get_notifications():
    user_id    = request.args.get('userId')
    session_id = request.args.get('sessionId')
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_list_notifications_for_user', (user_id,))

        if session_id:
            rows = [r for r in rows if str(r.get('session_id')) == session_id]

        for r in rows:
            if r.get('sent_time'):
                r['sent_time'] = str(r['sent_time'])

        return jsonify({'notifications': rows}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)

