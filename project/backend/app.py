from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes.auth import auth_bp
from routes.users import users_bp
from routes.sessions import sessions_bp
from routes.messages import messages_bp
from routes.library import library_bp
from routes.reschedule_requests import reschedule_bp
from routes.match_requests import match_bp
from routes.evaluations import evaluations_bp
from routes.notifications import notifications_bp
from routes.subjects import subjects_bp


def create_app():
    app = Flask(__name__)
    app.json.ensure_ascii = False
    CORS(app)

    app.register_blueprint(auth_bp,          url_prefix='/api/auth')
    app.register_blueprint(users_bp,         url_prefix='/api/users')
    app.register_blueprint(sessions_bp,      url_prefix='/api/sessions')
    app.register_blueprint(messages_bp,      url_prefix='/api/messages')
    app.register_blueprint(library_bp,       url_prefix='/api/library')
    app.register_blueprint(reschedule_bp,    url_prefix='/api/reschedule-requests')
    app.register_blueprint(match_bp,         url_prefix='/api/match-requests')
    app.register_blueprint(evaluations_bp,   url_prefix='/api/evaluations')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(subjects_bp,      url_prefix='/api/subjects')

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found', 'code': 'NOT_FOUND'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error', 'code': 'SERVER_ERROR'}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=Config.FLASK_PORT, debug=Config.FLASK_DEBUG)
