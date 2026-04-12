from flask import Blueprint, request, jsonify

notifications_bp = Blueprint('notifications', __name__)


# ----------------------------------------------------------------
# GET /api/notifications
# Input  (query): userId (required), sessionId?
# Output (200): {
#     'notifications': [{
#         id, userId, type, message, sessionId?, isRead, createdAt
#     }]
# }
# Stored procedure: sp_get_user_notifications(p_user_id)
# Auto-created by: sp_cancel_session (type: 'cancellation'),
#                  sp_update_session_time (type: 'schedule-change')
# ----------------------------------------------------------------
@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    user_id    = request.args.get('userId')
    session_id = request.args.get('sessionId')
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    # TODO: rows = db.call_procedure('sp_get_user_notifications', (user_id,))
    # TODO: if session_id: filter rows by sessionId
    # TODO: return jsonify({'notifications': rows})
    return jsonify({'message': 'Not implemented'}), 501
