from flask import Blueprint, request, jsonify

messages_bp = Blueprint('messages', __name__)


# ----------------------------------------------------------------
# GET /api/messages
# Input  (query): userId (required), partnerId?
# Output (200): {
#     'messages': [{
#         id, senderId, receiverId, content,
#         timestamp, read (bool), type?, relatedSessionId?
#     }]
# }
# Stored procedure: sp_get_messages_between(p_user_1, p_user_2)
# ----------------------------------------------------------------
@messages_bp.route('/', methods=['GET'])
def get_messages():
    user_id    = request.args.get('userId')
    partner_id = request.args.get('partnerId')
    # TODO: validate user_id present
    # TODO: rows = db.call_procedure('sp_get_messages_between', (user_id, partner_id))
    # TODO: map 'status' field -> read: bool (READ -> True, SENT -> False)
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/messages
# Input  (JSON body): {
#     senderId: str, receiverId: str, content: str,
#     type?: 'regular' | 'reschedule-notification' | 'material-request',
#     relatedSessionId?: str
# }
# Output (201): { 'id': int, 'message': 'Message sent successfully' }
# Stored procedure: sp_send_message(p_sender_id, p_receiver_id, p_content)
# ----------------------------------------------------------------
@messages_bp.route('/', methods=['POST'])
def send_message():
    data        = request.get_json()
    sender_id   = data.get('senderId')
    receiver_id = data.get('receiverId')
    content     = data.get('content')
    # TODO: validate senderId != receiverId and content not empty
    # TODO: rows = db.call_procedure('sp_send_message', (sender_id, receiver_id, content))
    # TODO: return {'id': rows[0]['message_id']}, 201
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# PATCH /api/messages/:id/read
# Input  (path): id (int, message_id)
# Output (200): { 'message': 'Message marked as read' }
# Note: marks all SENT messages from sender to receiver as READ
# Stored procedure: sp_mark_as_read(p_sender_id, p_receiver_id)
# ----------------------------------------------------------------
@messages_bp.route('/<int:message_id>/read', methods=['PATCH'])
def mark_as_read(message_id):
    # TODO: lookup message by message_id to get sender_id, receiver_id
    # TODO: db.call_procedure('sp_mark_as_read', (sender_id, receiver_id))
    return jsonify({'message': 'Not implemented'}), 501
