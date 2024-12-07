from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import dotenv
from flask import Flask
from flask_login import LoginManager
import pathlib


db= SQLAlchemy()
mm= Marshmallow()
login_manager= LoginManager()
login_manager.login_view= "auth.login"

def create_app():
    from app.auth import auth
    from app.routes import main

    this_app = Flask(__name__)
    this_dir = pathlib.Path(__file__).parent
    dotenv.load_dotenv(this_dir / pathlib.Path(".flaskenv"))
    this_app.config.from_prefixed_env()
    db_file = this_dir.parent / pathlib.Path(
        f"{this_app.config["DATABASE_FILE"]}.sqlite3"
    )
    this_app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:////{db_file}"
    login_manager.init_app(this_app)
    db.init_app(this_app)
    if not pathlib.Path(this_app.config["SQLALCHEMY_DATABASE_URI"]).exists():
        with this_app.app_context():
            db.create_all()
    with this_app.app_context():
        mm.init_app(this_app)
    this_app.register_blueprint(main)
    this_app.register_blueprint(auth)
    return this_app