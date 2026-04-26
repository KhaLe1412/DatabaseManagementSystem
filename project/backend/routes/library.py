from flask import Blueprint, request, jsonify
import mysql.connector

from db.connection import Database

library_bp = Blueprint('library', __name__)


def _sql_err(err):
    msg = err.msg if hasattr(err, 'msg') else str(err)
    return jsonify({'error': msg}), 400


# ----------------------------------------------------------------
# GET /api/library
# Input  (query): search?, type?, subject?
# Output (200): { 'resources': [{resource_id, title, author, type, url, subject, created_at}] }
# Stored procedure (no filter): sp_get_all_documents()
# Stored procedure (with filter): sp_get_documents_by_filter(p_title, p_type)
# ----------------------------------------------------------------
@library_bp.route('/', methods=['GET'], strict_slashes=False)
def get_documents():
    search   = request.args.get('search')
    doc_type = request.args.get('type')
    subject  = request.args.get('subject')

    try:
        db = Database.get_instance()
        if search or doc_type:
            rows = db.call_procedure('sp_get_documents_by_filter', (search, doc_type))
        else:
            rows = db.call_procedure('sp_get_all_documents')

        # Optional subject filter in Python (resource.subject is a free-text column)
        if subject:
            subject_lower = subject.lower()
            rows = [r for r in rows if r.get('subject') and subject_lower in r['subject'].lower()]

        for r in rows:
            for ts_field in ('created_at', 'updated_at'):
                if r.get(ts_field):
                    r[ts_field] = str(r[ts_field])

        return jsonify({'resources': rows}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)


# ----------------------------------------------------------------
# POST /api/library
# Input  (JSON body): { title, author, type, url, subject? }
# Output (201): { 'id': str, 'message': 'Resource added successfully' }
# Output (409): URL already exists
# Stored procedure: sp_add_document(p_title, p_author, p_type, p_url)
# ----------------------------------------------------------------
@library_bp.route('/', methods=['POST'], strict_slashes=False)
def add_document():
    data = request.get_json() or {}
    for field in ('title', 'author', 'type', 'url'):
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    try:
        db   = Database.get_instance()
        rows = db.call_procedure('sp_add_document', (
            data['title'], data['author'], data['type'], data['url'],
        ))
        resource_id = rows[0]['resource_id'] if rows else None
        return jsonify({'id': resource_id, 'message': 'Resource added successfully'}), 201
    except mysql.connector.Error as err:
        if err.errno == 1062:
            return jsonify({'error': 'URL already exists'}), 409
        return _sql_err(err)


# ----------------------------------------------------------------
# DELETE /api/library/:id
# Input  (path): id (UUID string, resource_id)
# Output (200): { 'message': 'Resource deleted successfully' }
# Output (404): { 'error': 'Document not found' }
# Note: sp_delete_document has a BIGINT type bug; using direct query instead.
# ----------------------------------------------------------------
@library_bp.route('/<string:resource_id>', methods=['DELETE'])
def delete_document(resource_id):
    try:
        db       = Database.get_instance()
        affected = db.execute_dml(
            'DELETE FROM resource WHERE resource_id = %s', (resource_id,)
        )
        if affected == 0:
            return jsonify({'error': 'Document not found'}), 404
        return jsonify({'message': 'Resource deleted successfully'}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)



