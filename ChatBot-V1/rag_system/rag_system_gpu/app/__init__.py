import logging
from flask import Flask
from flask_cors import CORS
from config.settings import settings

def create_app() -> Flask:
    app = Flask(__name__, static_folder="../static", static_url_path="/static")
    app.config["SECRET_KEY"] = settings.SECRET_KEY
    CORS(app, resources={r"/*": {"origins": "*"}})
    logging.basicConfig(
        level=logging.DEBUG if settings.FLASK_DEBUG else logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
    from app.api.routes import api_bp
    app.register_blueprint(api_bp)
    return app
