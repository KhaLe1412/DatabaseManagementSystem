from flask import Blueprint, request, jsonify
import mysql.connector

from db.connection import Database

messages_bp = Blueprint('messages', __name__)


def _sql_err(err):
    msg = err.msg if hasattr(err, 'msg') else str(err)
    return jsonify({'error': msg}), 400


# ----------------------------------------------------------------
# GET /api/messages/conversations
# Input  (query): userId (required)
# Output (200): { 'conversations': [partnerId, ...] }
# ----------------------------------------------------------------
@messages_bp.route('/conversations', methods=['GET'])
def get_conversations():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    try:
        db = Database.get_instance()
        rows = db.execute_query(
            '''SELECT DISTINCT
                   CASE WHEN sender_id = %s THEN receiver_id ELSE sender_id END AS partnerId
               FROM message
               WHERE sender_id = %s OR receiver_id = %s''',
            (user_id, user_id, user_id),
        )
        return jsonify({'conversations': [r['partnerId'] for r in rows]}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# GET /api/messages
# Input  (query): userId (required), partnerId (required)
# Output (200): { 'messages': [{message_id, sender_id, receiver_id, content, status, read, timestamp}] }
# Stored procedure: sp_get_messages_between(p_user_1, p_user_2)
# ----------------------------------------------------------------
@messages_bp.route('/', methods=['GET'], strict_slashes=False)
def get_messages():
    user_id    = request.args.get('userId')
    partner_id = request.args.get('partnerId')
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    if not partner_id:
        return jsonify({'error': 'partnerId is required'}), 400
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_get_messages_between', (user_id, partner_id))
        for r in rows:
            r['read'] = r.get('status') == 'READ'
            if r.get('timestamp'):
                r['timestamp'] = str(r['timestamp'])
        return jsonify({'messages': rows}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# POST /api/messages
# Input  (JSON body): { senderId, receiverId, content }
# Output (201): { 'id': str, 'message': 'Message sent successfully' }
# Stored procedure: sp_send_message(p_sender_id, p_receiver_id, p_content)
# ----------------------------------------------------------------
@messages_bp.route('/', methods=['POST'], strict_slashes=False)
def send_message():
    data        = request.get_json() or {}
    sender_id   = data.get('senderId')
    receiver_id = data.get('receiverId')
    content     = data.get('content')
    if not sender_id or not receiver_id or not content:
        return jsonify({'error': 'senderId, receiverId, and content are required'}), 400
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_send_message', (sender_id, receiver_id, content))
        msg_id = rows[0]['message_id'] if rows else None
        return jsonify({'id': msg_id, 'message': 'Message sent successfully'}), 201
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# PATCH /api/messages/:id/read
# Input  (path): id (UUID string, message_id)
# Output (200): { 'message': 'Message marked as read', 'updated': int }
# Stored procedure: sp_mark_as_read(p_sender_id, p_receiver_id)
# ----------------------------------------------------------------
@messages_bp.route('/<string:message_id>/read', methods=['PATCH'])
def mark_as_read(message_id):
    try:
        db = Database.get_instance()
        rows = db.execute_query(
            'SELECT sender_id, receiver_id FROM message WHERE message_id = %s',
            (message_id,),
        )
        if not rows:
            return jsonify({'error': 'Message not found'}), 404
        sender_id   = rows[0]['sender_id']
        receiver_id = rows[0]['receiver_id']
        result = db.call_procedure('sp_mark_as_read', (sender_id, receiver_id))
        updated = result[0]['updated_messages'] if result else 0
        return jsonify({'message': 'Message marked as read', 'updated': updated}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# GET /api/messages/unread-counts
# Input  (query): userId (required)
# Output (200): { 'unreadCounts': { partnerId: count, ... } }
# Returns number of unread messages per conversation partner
# ----------------------------------------------------------------
@messages_bp.route('/unread-counts', methods=['GET'])
def get_unread_counts():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    try:
        db = Database.get_instance()
        rows = db.execute_query(
            '''SELECT sender_id AS partnerId, COUNT(*) AS unread_count
               FROM message
               WHERE receiver_id = %s AND status != 'READ'
               GROUP BY sender_id''',
            (user_id,),
        )
        unread_counts = {r['partnerId']: r['unread_count'] for r in rows}
        return jsonify({'unreadCounts': unread_counts}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# PATCH /api/messages/read-conversation
# Input  (JSON body): { userId, partnerId }
# Output (200): { 'message': 'Conversation marked as read', 'updated': int }
# Marks all messages from partnerId to userId as READ
# Stored procedure: sp_mark_as_read(p_sender_id, p_receiver_id)
# ----------------------------------------------------------------
@messages_bp.route('/read-conversation', methods=['PATCH'])
def mark_conversation_as_read():
    data        = request.get_json() or {}
    user_id     = data.get('userId')
    partner_id  = data.get('partnerId')
    if not user_id or not partner_id:
        return jsonify({'error': 'userId and partnerId are required'}), 400
    try:
        db     = Database.get_instance()
        result = db.call_procedure('sp_mark_as_read', (partner_id, user_id))
        updated = result[0]['updated_messages'] if result else 0
        return jsonify({'message': 'Conversation marked as read', 'updated': updated}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)



