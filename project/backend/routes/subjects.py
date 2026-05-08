from flask import Blueprint, jsonify
import mysql.connector

from db.connection import Database

subjects_bp = Blueprint('subjects', __name__)


def _sql_err(err):
    msg = err.msg if hasattr(err, 'msg') else str(err)
    return jsonify({'error': msg}), 400


# ----------------------------------------------------------------
# GET /api/subjects
# Output (200): { 'subjects': [{'subject_id', 'subject_name'}] }
# ----------------------------------------------------------------
@subjects_bp.route('/', methods=['GET'], strict_slashes=False)
def get_all_subjects():
    try:
        db   = Database.get_instance()
        rows = db.execute_query('SELECT id AS subject_id, name AS subject_name FROM subjects ORDER BY name')
        return jsonify({'subjects': rows}), 200
    except mysql.connector.Error as err:
        return _sql_err(err)
