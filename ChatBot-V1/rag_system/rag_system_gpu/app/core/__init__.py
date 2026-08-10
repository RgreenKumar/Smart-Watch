"""
app/__init__.py
===============
Flask application factory.
Pipeline is pre-loaded at startup so LLM is
fully ready before first request arrives.
"""

import logging
from flask import Flask
from flask_cors import CORS
from config.settings import settings


def create_app() -> Flask:
    app = Flask(
        __name__,
        static_folder="../static",
        static_url_path="/static",
    )
    app.config["SECRET_KEY"] = settings.SECRET_KEY

    # Allow all origins (restrict in production)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Configure logging
    logging.basicConfig(
        level=logging.DEBUG if settings.FLASK_DEBUG else logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

    # Register routes
    from app.api.routes import api_bp, init_pipeline
    app.register_blueprint(api_bp)

    # ── PRE-LOAD PIPELINE AT STARTUP ──────────────────────────
    # This ensures the LLM is fully loaded before any
    # request arrives — fixes wrong first answer bug.
    with app.app_context():
        init_pipeline()

    return app
