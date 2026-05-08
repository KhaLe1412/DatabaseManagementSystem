from flask import Blueprint, request, jsonify

match_bp = Blueprint('match', __name__)


# ----------------------------------------------------------------
# GET /api/match-requests
# Input  (query): studentId?, status?
# Output (200): {
#     'matchRequests': [{
#         id, studentId, subjects[], preferredType,
#         preferredTimes[], status, matchedTutorId?
#     }]
# }
# ----------------------------------------------------------------
@match_bp.route('/', methods=['GET'], strict_slashes=False)
def get_match_requests():
    student_id = request.args.get('studentId')
    status     = request.args.get('status')
    # TODO: query match_requests table filtered by studentId and/or status
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/match-requests
# Input  (JSON body): {
#     studentId: str,
#     subjects: [str],
#     preferredType: 'online' | 'in-person' | 'both',
#     preferredTimes: [str],
#     description?: str
# }
# Output (201): { 'id': str, 'message': 'Match request created' }
# ----------------------------------------------------------------
@match_bp.route('/', methods=['POST'], strict_slashes=False)
def create_match_request():
    data = request.get_json()
    # TODO: validate required fields
    # TODO: insert into match_requests with status='pending'
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# PATCH /api/match-requests/:id
# Input  (JSON body): {
#     'status': 'matched' | 'rejected',
#     'matchedTutorId': str  (required when status == 'matched')
# }
# Output (200): { 'message': 'Match request updated' }
# Roles allowed: academic-affairs, student-affairs, admin
# ----------------------------------------------------------------
@match_bp.route('/<request_id>', methods=['PATCH'])
def update_match_request(request_id):
    data = request.get_json()
    # TODO: validate status value in ('matched', 'rejected')
    # TODO: update match request record + link tutorId if matched
    return jsonify({'message': 'Not implemented'}), 501
