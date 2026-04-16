from flask import Blueprint, request, jsonify

library_bp = Blueprint('library', __name__)


# ----------------------------------------------------------------
# GET /api/library
# Input  (query): search?, type?, subject?
# Output (200): {
#     'resources': [{id, title, type, subject, author, url, thumbnail?}]
# }
# Stored procedure (no filter): sp_get_all_documents()
# Stored procedure (with filter): sp_get_documents_by_filter(p_title, p_type)
# ----------------------------------------------------------------
@library_bp.route('/', methods=['GET'])
def get_documents():
    search   = request.args.get('search')
    doc_type = request.args.get('type')
    subject  = request.args.get('subject')
    # TODO: if search or doc_type: db.call_procedure('sp_get_documents_by_filter', (search, doc_type))
    # TODO: else: db.call_procedure('sp_get_all_documents', ())
    # TODO: apply subject filter in Python if subject param present
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# POST /api/library
# Input  (JSON body): { title, type, subject?, author, url, thumbnail? }
# Output (201): { 'id': int, 'message': 'Resource added successfully' }
# Output (409): { 'error': 'URL already exists' }
# Stored procedure: sp_add_document(p_title, p_author, p_type, p_url)
# ----------------------------------------------------------------
@library_bp.route('/', methods=['POST'])
def add_document():
    data = request.get_json()
    # TODO: validate title, author, type, url present
    # TODO: rows = db.call_procedure('sp_add_document',
    #           (data['title'], data['author'], data['type'], data['url']))
    # TODO: catch duplicate URL mysql error -> return 409
    return jsonify({'message': 'Not implemented'}), 501


# ----------------------------------------------------------------
# DELETE /api/library/:id
# Input  (path): id (int, resource_id)
# Output (200): { 'message': 'Resource deleted successfully' }
# Output (404): { 'error': 'Document not found' }
# Stored procedure: sp_delete_document(p_resource_id)
# ----------------------------------------------------------------
@library_bp.route('/<int:resource_id>', methods=['DELETE'])
def delete_document(resource_id):
    # TODO: db.call_procedure('sp_delete_document', (resource_id,))
    # TODO: procedure signals 'Document not found' -> catch and return 404
    return jsonify({'message': 'Not implemented'}), 501
