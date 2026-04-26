from flask import Blueprint, request, jsonify
import mysql.connector

from db.connection import Database

sessions_bp = Blueprint('sessions', __name__)


def _sql_err(err):
    msg = err.msg if hasattr(err, 'msg') else str(err)
    if 'not found' in msg.lower():
        return jsonify({'error': msg}), 404
    if 'overlap' in msg.lower():
        return jsonify({'error': msg}), 409
    return jsonify({'error': msg}), 400


# ----------------------------------------------------------------
# GET /api/sessions
# Input  (query): tutorId?, studentId?, status?, subjectId?, date?, type?
# Output (200): { 'sessions': [...] }
# Stored procedure: sp_filter_sessions(tutor_id, student_id, subject_id, date, status, type)
# ----------------------------------------------------------------
@sessions_bp.route('/', methods=['GET'], strict_slashes=False)
def get_sessions():
    tutor_id   = request.args.get('tutorId')
    student_id = request.args.get('studentId')
    status     = request.args.get('status')
    subject_id = request.args.get('subjectId')
    date       = request.args.get('date')
    sess_type  = request.args.get('type')

    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_filter_sessions', (
            tutor_id, student_id, subject_id, date, status, sess_type,
        ))
        # Convert timedelta fields to string for JSON serialisation
        for r in rows:
            if hasattr(r.get('start_time'), 'seconds'):
                total = r['start_time'].seconds
                r['start_time'] = f"{total // 3600:02d}:{(total % 3600) // 60:02d}"
            if hasattr(r.get('end_time'), 'seconds'):
                total = r['end_time'].seconds
                r['end_time'] = f"{total // 3600:02d}:{(total % 3600) // 60:02d}"
            if r.get('date'):
                r['date'] = str(r['date'])

        # Batch-fetch enrolled students and tutor names
        if rows:
            session_ids = [r['session_id'] for r in rows]
            tutor_ids   = list({r['tutor_id'] for r in rows if r.get('tutor_id')})

            # enrolled students
            placeholders = ','.join(['%s'] * len(session_ids))
            participants = db.execute_query(
                f'SELECT session_id, student_id FROM session_participants WHERE session_id IN ({placeholders})',
                tuple(session_ids),
            )
            enrolled_map: dict = {}
            for p in participants:
                sid = p['session_id']
                enrolled_map.setdefault(sid, []).append(p['student_id'])

            # tutor names
            tutor_name_map: dict = {}
            if tutor_ids:
                t_ph = ','.join(['%s'] * len(tutor_ids))
                tutor_rows = db.execute_query(
                    f'SELECT id, name FROM users WHERE id IN ({t_ph})',
                    tuple(tutor_ids),
                )
                tutor_name_map = {t['id']: t['name'] for t in tutor_rows}

            for r in rows:
                r['enrolledStudents'] = enrolled_map.get(r['session_id'], [])
                r['tutorName']        = tutor_name_map.get(r['tutor_id'])

        return jsonify({'sessions': rows}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# GET /api/sessions/:id
# Output (200): full session detail + enrolled students + reviews
# Output (404): { 'error': 'Session not found' }
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>', methods=['GET'])
def get_session(session_id):
    try:
        db = Database.get_instance()

        rows = db.execute_query(
            '''SELECT s.session_id, s.tutor_id, s.subject_id,
                      subj.name AS subject,
                      s.date, s.start_time, s.end_time, s.type, s.status,
                      s.location, s.meeting_link, s.max_students,
                      s.notes, s.summary, s.recording_url
               FROM sessions s
               LEFT JOIN subjects subj ON subj.id = s.subject_id
               WHERE s.session_id = %s''',
            (session_id,),
        )
        if not rows:
            return jsonify({'error': 'Session not found'}), 404

        session = rows[0]

        # Stringify date / time fields
        if session.get('date'):
            session['date'] = str(session['date'])
        for field in ('start_time', 'end_time'):
            val = session.get(field)
            if val and hasattr(val, 'seconds'):
                total = val.seconds
                session[field] = f"{total // 3600:02d}:{(total % 3600) // 60:02d}"

        # Enrolled students
        participants = db.execute_query(
            'SELECT student_id FROM session_participants WHERE session_id = %s',
            (session_id,),
        )
        session['enrolledStudents'] = [p['student_id'] for p in participants]

        # Reviews
        reviews = db.call_procedure('sp_comment_by_session', (session_id,))
        for rv in reviews:
            if rv.get('updated_at'):
                rv['updated_at'] = str(rv['updated_at'])
        session['reviews'] = reviews

        return jsonify(session), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# POST /api/sessions
# Input  (JSON body): {
#     tutorId, subjectId, date, startTime, endTime,
#     type, location?, meetingLink?, notes?, maxStudents
# }
# Output (201): { 'sessionId': str, 'message': 'Session created successfully' }
# Output (409): overlapping session
# Stored procedure: sp_create_session(...)
# ----------------------------------------------------------------
@sessions_bp.route('/', methods=['POST'], strict_slashes=False)
def create_session():
    data = request.get_json() or {}
    for field in ('tutorId', 'subjectId', 'date', 'startTime', 'endTime', 'type', 'maxStudents'):
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_create_session', (
            data['tutorId'], data['subjectId'],
            data['date'], data['startTime'], data['endTime'],
            data['type'], data.get('location'), data.get('meetingLink'),
            data['maxStudents'], data.get('notes'),
        ))
        session_id = rows[0]['session_id'] if rows else None
        return jsonify({'sessionId': session_id, 'message': 'Session created successfully'}), 201
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# PATCH /api/sessions/:id
# Input  (JSON body): { 'updateData': { ... } }
# Routing logic:
#   date | startTime | endTime  -> sp_update_session_time_notify
#   status == 'completed'       -> sp_complete_session
#   summary | recordingUrl      -> sp_update_session_summary
#   notes only                  -> direct UPDATE
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>', methods=['PATCH'])
def update_session(session_id):
    data   = request.get_json() or {}
    update = data.get('updateData', {})

    try:
        db = Database.get_instance()

        if any(k in update for k in ('date', 'startTime', 'endTime')):
            db.call_procedure('sp_update_session_time_notify', (
                session_id,
                update.get('date'),
                update.get('startTime'),
                update.get('endTime'),
            ))

        elif update.get('status') == 'completed':
            db.call_procedure('sp_complete_session', (session_id,))

        elif any(k in update for k in ('summary', 'recordingUrl')):
            db.call_procedure('sp_update_session_summary', (
                session_id,
                update.get('summary'),
                update.get('recordingUrl'),
            ))

        elif 'notes' in update:
            db.execute_dml(
                'UPDATE sessions SET notes = %s, updated_at = CURRENT_TIMESTAMP WHERE session_id = %s',
                (update['notes'], session_id),
            )

        else:
            return jsonify({'error': 'No updatable fields provided'}), 400

        return jsonify({'message': 'Session updated successfully'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# DELETE /api/sessions/:id
# Side effect: auto-notifies enrolled students (via procedure)
# Stored procedure: sp_cancel_session_notify(session_id)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    try:
        db = Database.get_instance()
        db.call_procedure('sp_cancel_session_notify', (session_id,))
        return jsonify({'message': 'Session cancelled successfully'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# POST /api/sessions/:id/join
# Input  (JSON body): { 'studentId': str }
# Output (200): { 'message': 'Joined session successfully' }
# Stored procedure: sp_add_student_session(session_id, student_id)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>/join', methods=['POST'])
def join_session(session_id):
    data       = request.get_json() or {}
    student_id = data.get('studentId')
    if not student_id:
        return jsonify({'error': 'studentId is required'}), 400
    try:
        db = Database.get_instance()
        db.call_procedure('sp_add_student_session', (session_id, student_id))
        return jsonify({'message': 'Joined session successfully'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)

# ----------------------------------------------------------------
# POST /api/sessions/:id/complete
# Input  (path): id (UUID string, session_id)
# Output (200): { 'message': 'Session marked as completed' }
# Stored procedure: sp_complete_session(session_id)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>/complete', methods=['POST'])
def complete_session(session_id):
    try:
        db = Database.get_instance()
        db.call_procedure('sp_complete_session', (session_id,))
        return jsonify({'message': 'Session marked as completed'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)
    
    
# ----------------------------------------------------------------
# POST /api/sessions/:id/leave
# Input  (JSON body): { 'studentId': str }
# Output (200): { 'message': 'Left session successfully' }
# Stored procedure: sp_remove_student_session(session_id, student_id)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>/leave', methods=['POST'])
def leave_session(session_id):
    data       = request.get_json() or {}
    student_id = data.get('studentId')
    if not student_id:
        return jsonify({'error': 'studentId is required'}), 400
    try:
        db = Database.get_instance()
        db.call_procedure('sp_remove_student_session', (session_id, student_id))
        return jsonify({'message': 'Left session successfully'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# POST /api/sessions/:id/review
# Input  (JSON body): { 'studentId': str, 'rating': int (1-5), 'comment': str }
# Output (201): { 'message': 'Review submitted successfully' }
# Stored procedure: sp_add_comment(p_student_id, p_session_id, p_comment, p_rating)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>/review', methods=['POST'])
def review_session(session_id):
    data       = request.get_json() or {}
    student_id = data.get('studentId')
    rating     = data.get('rating')
    comment    = data.get('comment')
    if not student_id:
        return jsonify({'error': 'studentId is required'}), 400
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_add_comment', (student_id, session_id, comment, rating))
        if rows:
            row = rows[0]
            if row.get('updated_at'):
                row['updated_at'] = str(row['updated_at'])
        return jsonify({'message': 'Review submitted successfully', 'review': rows[0] if rows else {}}), 201
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# GET /api/sessions/:id/reviews
# Output (200): { 'reviews': [{student_id, student_name, comment, rating, updated_at}] }
# Stored procedure: sp_comment_by_session(p_session_id)
# ----------------------------------------------------------------
@sessions_bp.route('/<session_id>/reviews', methods=['GET'])
def get_session_reviews(session_id):
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_comment_by_session', (session_id,))
        for r in rows:
            if r.get('updated_at'):
                r['updated_at'] = str(r['updated_at'])
        return jsonify({'reviews': rows}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


