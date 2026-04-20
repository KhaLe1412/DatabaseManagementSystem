from flask import Blueprint, request, jsonify

reschedule_bp = Blueprint('reschedule', __name__)


# ----------------------------------------------------------------
# GET /api/reschedule-requests
# Input  (query): sessionId?, userId?, status?
# Output (200): {
#     'rescheduleRequests': [{
#         id, sessionId, requesterId, requesterRole,
#         newDate, newStartTime, newEndTime, reason, status, createdAt
#     }]
# }
# Stored procedure: sp_get_tutor_requests(p_tutor_id)
# ----------------------------------------------------------------
@reschedule_bp.route('/', methods=['GET'])
def get_reschedule_requests():
    session_id = request.args.get('sessionId')
    user_id    = request.args.get('userId')
    status     = request.args.get('status')
    # TODO: rows = db.call_procedure('sp_get_tutor_requests', (user_id,))
    # TODO: filter by session_id and/or status in Python
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/reschedule-requests
# Input  (JSON body): {
#     sessionId, requesterId, requesterRole ('student'|'tutor'),
#     newDate (YYYY-MM-DD), newStartTime (HH:mm), newEndTime (HH:mm), reason
# }
# Output (201): { 'id': str, 'message': 'Reschedule request created' }
# Stored procedure: sp_create_reschedule_request(
#     p_session_id, p_requester_id, p_new_date, p_new_start, p_new_end, p_reason
# )
# ----------------------------------------------------------------
@reschedule_bp.route('/', methods=['POST'])
def create_reschedule_request():
    data = request.get_json()
    # TODO: validate all required fields
    # TODO: db.call_procedure('sp_create_reschedule_request', (
    #           data['sessionId'], data['requesterId'],
    #           data['newDate'], data['newStartTime'], data['newEndTime'], data['reason']
    #       ))
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# PATCH /api/reschedule-requests/:id
# Input  (path): id
# Input  (JSON body): { 'status': 'approved' | 'rejected' }
# Output (200): { 'message': 'Reschedule request updated' }
# Roles allowed: tutor (owner of the session)
# If approved -> sp_accept_reschedule_request(p_request_id)
#   Side effect: updates session date/time + auto-creates Notification
#                for all enrolled students (type: schedule-change)
# If rejected -> sp_reject_reschedule_request(p_request_id)  (no-op on session)
# ----------------------------------------------------------------
@reschedule_bp.route('/<request_id>', methods=['PATCH'])
def handle_reschedule_request(request_id):
    data   = request.get_json()
    status = data.get('status')
    # TODO: if status == 'approved':
    #           db.call_procedure('sp_accept_reschedule_request', (request_id,))
    # TODO: elif status == 'rejected':
    #           db.call_procedure('sp_reject_reschedule_request', (request_id,))
    # TODO: else: return 400 invalid status
    return jsonify({'message': 'Not implemented'}), 501
