from flask import Blueprint, request, jsonify

evaluations_bp = Blueprint('evaluations', __name__)


# ----------------------------------------------------------------
# GET /api/evaluations
# Input  (query): studentId?, tutorId?, sessionId?
# Output (200): {
#     'evaluations': [{
#         id, studentId, tutorId, sessionId,
#         skills: { problemSolving, logicalThinking, subjectKnowledge },
#         attitude: str,
#         testResults: { conductedTest: bool, score?: float, percentage?: float },
#         overallProgress: str,
#         recommendations: str,
#         createdAt: datetime
#     }]
# }
# ----------------------------------------------------------------
@evaluations_bp.route('/', methods=['GET'])
def get_evaluations():
    student_id = request.args.get('studentId')
    tutor_id   = request.args.get('tutorId')
    session_id = request.args.get('sessionId')
    # TODO: query evaluations table filtered by provided params
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/evaluations
# Input  (JSON body): {
#     studentId: str,
#     tutorId: str,
#     sessionId: str,
#     skills: {
#         problemSolving: str,        # e.g. 'excellent'|'good'|'average'|'poor'
#         logicalThinking: str,
#         subjectKnowledge: str
#     },
#     attitude: str,
#     testResults: { conductedTest: bool, score?: float, percentage?: float },
#     overallProgress: str,
#     recommendations: str
# }
# Output (201): { 'id': str, 'message': 'Evaluation created' }
# ----------------------------------------------------------------
@evaluations_bp.route('/', methods=['POST'])
def create_evaluation():
    data = request.get_json()
    # TODO: validate all required fields
    # TODO: insert into evaluations table
    return jsonify({'message': 'Not implemented'}), 501
