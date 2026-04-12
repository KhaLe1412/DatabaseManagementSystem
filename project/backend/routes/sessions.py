from flask import Blueprint, request, jsonify

sessions_bp = Blueprint('sessions', __name__)


# ----------------------------------------------------------------
# GET /api/sessions
# Input  (query): tutorId?, studentId?, status?, subject?, startDate?, endDate?
# Output (200): {
#     'sessions': [{
#         id, tutorId, subject, date, startTime, endTime,
#         type, status, location?, meetingLink?,
#         maxStudents, enrolledStudents[]
#     }]
# }
# Stored procedure: sp_filter_sessions(tutor_id, student_id, subject, date, status, type)
# ----------------------------------------------------------------
@sessions_bp.route('/', methods=['GET'])
def get_sessions():
    tutor_id   = request.args.get('tutorId')
    student_id = request.args.get('studentId')
    status     = request.args.get('status')
    subject    = request.args.get('subject')
    start_date = request.args.get('startDate')
    end_date   = request.args.get('endDate')
    # TODO: call sp_filter_sessions(tutor_id, student_id, subject, start_date, status, None)
    # TODO: filter by end_date in Python if needed
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# GET /api/sessions/:id
# Input  (path): id (BIGINT or UUID depending on sessions table)
# Output (200): {
#     id, tutorId, subject, date, startTime, endTime, type, status,
#     location?, meetingLink?, notes?, maxStudents,
#     enrolledStudents[], summary?, recordingUrl?,
#     reviews[{studentId, student_name, rating, comment, submittedAt}]
# }
# Output (404): { 'error': 'Session not found' }
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>', methods=['GET'])
def get_session(session_id):
    # TODO: query sessions table by session_id
    # TODO: if not found: return 404
    # TODO: rows_reviews = db.call_procedure('sp_comment_by_session', (session_id,))
    # TODO: attach reviews list to response
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/sessions
# Input  (JSON body): {
#     tutorId, subject, date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm),
#     type ('online'|'offline'),
#     location?  (required if type == 'offline'),
#     meetingLink? (required if type == 'online'),
#     notes?, maxStudents (int)
# }
# Output (201): { 'id': str, 'message': 'Session created successfully' }
# Output (409): { 'error': 'Session overlaps with existing session' }
# Roles allowed: tutor
# Stored procedure: sp_create_session(...) — checks overlap in DB
# ----------------------------------------------------------------
@sessions_bp.route('/', methods=['POST'])
def create_session():
    data = request.get_json()
    # TODO: validate type-conditional fields (location / meetingLink)
    # TODO: call sp_create_session(tutor_id, subject_id, date, start_time, end_time,
    #                              type, location, meeting_link, notes, max_students)
    # TODO: procedure raises SQLSTATE '45000' on overlap -> catch and return 409
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# PATCH /api/sessions/:id
# Input  (JSON body): {
#     'updateData': {
#         status?, enrolledStudents?, notes?, summary?,
#         recordingUrl?, date?, startTime?, endTime?
#     }
# }
# Output (200): { 'message': 'Session updated successfully' }
# Output (404): { 'error': 'Session not found' }
# Routing logic:
#   date | startTime | endTime present -> sp_update_session_time (auto-notifies enrolled students)
#   status == 'completed'              -> sp_complete_session(session_id)
#   notes / summary / recordingUrl    -> direct UPDATE query
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>', methods=['PATCH'])
def update_session(session_id):
    data = request.get_json()
    update = data.get('updateData', {})
    # TODO: route to appropriate stored procedure based on fields present
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# DELETE /api/sessions/:id
# Input  (path): id
# Output (200): { 'message': 'Session deleted successfully' }
# Output (404): { 'error': 'Session not found' }
# Stored procedure: sp_cancel_session(session_id)
# Side effect: auto-inserts Notification rows for all enrolled students
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    # TODO: call sp_cancel_session(session_id)
    # TODO: procedure handles notification creation internally
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/sessions/:id/join
# Input  (JSON body): { 'studentId': str }
# Output (200): { 'message': 'Joined session successfully' }
# Output (400): session is full or not open
# Output (403): subject not in student's subject list
# Stored procedure: sp_add_student_to_session(session_id, student_id)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>/join', methods=['POST'])
def join_session(session_id):
    data       = request.get_json()
    student_id = data.get('studentId')
    # TODO: db.call_procedure('sp_add_student_to_session', (session_id, student_id))
    # TODO: procedure signals SQLSTATE on full / not open / subject mismatch -> map to 400/403
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/sessions/:id/leave
# Input  (JSON body): { 'studentId': str }
# Output (200): { 'message': 'Left session successfully' }
# Stored procedure: sp_remove_student_from_session(session_id, student_id)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>/leave', methods=['POST'])
def leave_session(session_id):
    data       = request.get_json()
    student_id = data.get('studentId')
    # TODO: db.call_procedure('sp_remove_student_from_session', (session_id, student_id))
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/sessions/:id/review
# Input  (JSON body): { 'studentId': str, 'rating': int (1-5), 'comment': str }
# Output (201): { 'message': 'Review submitted successfully' }
# Output (400): rating out of range [1-5] or session not completed
# Stored procedure: sp_add_comment(p_student_id, p_session_id, p_comment, p_rating)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>/review', methods=['POST'])
def review_session(session_id):
    data       = request.get_json()
    student_id = data.get('studentId')
    rating     = data.get('rating')
    comment    = data.get('comment')
    # TODO: validate 1 <= rating <= 5
    # TODO: validate session status == 'completed'
    # TODO: db.call_procedure('sp_add_comment', (student_id, session_id, comment, rating))
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# GET /api/sessions/:id/reviews
# Input  (path): id
# Output (200): {
#     'reviews': [{student_id, student_name, comment, rating, updated_at}]
# }
# Stored procedure: sp_comment_by_session(p_session_id)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>/reviews', methods=['GET'])
def get_session_reviews(session_id):
    # TODO: rows = db.call_procedure('sp_comment_by_session', (session_id,))
    # TODO: return jsonify({'reviews': rows})
    return jsonify({'message': 'Not implemented'}), 501
