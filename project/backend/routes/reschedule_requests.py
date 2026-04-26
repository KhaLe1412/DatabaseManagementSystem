from flask import Blueprint, request, jsonify
import mysql.connector

from db.connection import Database

reschedule_bp = Blueprint('reschedule', __name__)


def _sql_err(err):
    msg = err.msg if hasattr(err, 'msg') else str(err)
    if 'not found' in msg.lower():
        return jsonify({'error': msg}), 404
    if 'overlap' in msg.lower():
        return jsonify({'error': msg}), 409
    return jsonify({'error': msg}), 400


# ----------------------------------------------------------------
# GET /api/reschedule-requests
# Input  (query): userId (tutor_id), sessionId?, status?
# Output (200): { 'rescheduleRequests': [...] }
# Stored procedure: sp_list_requests_for_tutor(p_tutor_id)
# ----------------------------------------------------------------
@reschedule_bp.route('/', methods=['GET'], strict_slashes=False)
def get_reschedule_requests():
    user_id    = request.args.get('userId')
    session_id = request.args.get('sessionId')
    status     = request.args.get('status')
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_list_requests_for_tutor', (user_id,))

        if session_id:
            rows = [r for r in rows if str(r.get('session_id')) == session_id]
        if status:
            rows = [r for r in rows if r.get('status') == status]

        for r in rows:
            for ts_field in ('created_at', 'handled_at', 'current_session_date', 'proposed_date'):
                if r.get(ts_field):
                    r[ts_field] = str(r[ts_field])
            for t_field in ('proposed_start_time', 'proposed_end_time', 'current_start', 'current_end'):
                val = r.get(t_field)
                if val and hasattr(val, 'seconds'):
                    total = val.seconds
                    r[t_field] = f"{total // 3600:02d}:{(total % 3600) // 60:02d}"

        return jsonify({'rescheduleRequests': rows}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# POST /api/reschedule-requests
# Input  (JSON body): {
#     studentId, sessionId, proposedDate, proposedStartTime, proposedEndTime, reason
# }
# Output (201): { 'id': str, 'message': 'Reschedule request created' }
# Stored procedure: sp_create_reschedule_request(
#     p_student_id, p_session_id, p_proposed_date,
#     p_proposed_start, p_proposed_end, p_reason
# )
# ----------------------------------------------------------------
@reschedule_bp.route('/', methods=['POST'], strict_slashes=False)
def create_reschedule_request():
    data = request.get_json() or {}
    for field in ('studentId', 'sessionId', 'proposedDate', 'proposedStartTime', 'proposedEndTime', 'reason'):
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_create_reschedule_request', (
            data['studentId'], data['sessionId'],
            data['proposedDate'], data['proposedStartTime'], data['proposedEndTime'],
            data['reason'],
        ))
        request_id = rows[0]['request_id'] if rows else None
        return jsonify({'id': request_id, 'message': 'Reschedule request created'}), 201
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# PATCH /api/reschedule-requests/:id
# Input  (JSON body): { 'status': 'accepted' | 'rejected' }
# Output (200): { 'message': ... }
# Roles allowed: tutor (owner of the session)
# accepted -> sp_accept_reschedule_request(request_id)
# rejected -> sp_reject_reschedule_request(request_id)
# ----------------------------------------------------------------
@reschedule_bp.route('/<request_id>', methods=['PATCH'])
def handle_reschedule_request(request_id):
    data   = request.get_json() or {}
    status = data.get('status')
    if status not in ('accepted', 'rejected'):
        return jsonify({'error': "status must be 'accepted' or 'rejected'"}), 400
    try:
        db   = Database.get_instance()
        if status == 'accepted':
            rows = db.call_procedure('sp_accept_reschedule_request', (request_id,))
        else:
            rows = db.call_procedure('sp_reject_reschedule_request', (request_id,))
        msg = rows[0]['message'] if rows else 'Done'
        return jsonify({'message': msg}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)



